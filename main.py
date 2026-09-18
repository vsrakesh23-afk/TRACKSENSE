import os
import time
from datetime import datetime
from scheduler import solve_maintenance_block
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(title="TrackSense 6.0 Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestCreate(BaseModel):
    station_code: str
    section_id: str
    track_line: str
    km_start: float
    km_end: float
    department: str
    defect_type: str
    urgency_tier: str
    duration_minutes: int
    machinery_needed: Optional[str] = "Manual Gang"
    weather_condition: Optional[str] = "Clear"

class BlockApproval(BaseModel):
    request_id: str
    allocated_start: str
    allocated_end: str
    directive_notes: Optional[str] = "Approved as scheduled."

class ScheduleRunRequest(BaseModel):
    section_id: str

class ChatQuery(BaseModel):
    prompt: str

@app.get("/")
def health_check():
    return {"status": "online", "system": "TrackSense 6.0 Backend"}

@app.post("/api/requests")
def submit_maintenance_request(payload: RequestCreate):
    priority_map = {"Emergency": 98, "Safety-Critical": 75, "Routine": 30}
    score = priority_map.get(payload.urgency_tier, 30)

    data = {
        "station_code": payload.station_code,
        "section_id": payload.section_id,
        "track_line": payload.track_line,
        "km_start": payload.km_start,
        "km_end": payload.km_end,
        "department": payload.department,
        "defect_type": payload.defect_type,
        "urgency_tier": payload.urgency_tier,
        "duration_minutes": payload.duration_minutes,
        "machinery_needed": payload.machinery_needed,
        "weather_condition": payload.weather_condition,
        "ml_priority_score": score,
        "status": "Pending Review",
    }
    response = supabase.table("maintenance_requests").insert(data).execute()
    return {"success": True, "record": response.data}

@app.get("/api/requests")
def list_maintenance_requests():
    response = (
        supabase.table("maintenance_requests")
        .select("*")
        .order("ml_priority_score", desc=True)
        .execute()
    )
    return {"requests": response.data}

@app.get("/api/timetables")
def list_timetables(section_id: Optional[str] = None):
    query = supabase.table("train_timetables").select("*")
    if section_id:
        query = query.eq("section_id", section_id)
    return {"timetables": query.execute().data}

@app.post("/api/schedule/run")
def run_optimization(payload: ScheduleRunRequest):
    """Executes Member 1's CP-SAT solver against Supabase maintenance and timetable records."""
    requests = (
        supabase.table("maintenance_requests")
        .select("*")
        .eq("section_id", payload.section_id)
        .order("ml_priority_score", desc=True)
        .execute()
        .data
    )
    timetables = (
        supabase.table("train_timetables")
        .select("*")
        .eq("section_id", payload.section_id)
        .execute()
        .data
    )

    if not requests:
        return {"status": "error", "message": f"No pending maintenance requests found for section {payload.section_id}."}

    # Pick the highest priority maintenance request
    target_job = requests[0]
    duration_mins = target_job.get("duration_minutes", 60)

    # Convert timetable departures/arrivals into relative minute intervals
    train_intervals = []
    for train in timetables:
        try:
            dep = datetime.fromisoformat(train["scheduled_departure"].replace("Z", "+00:00"))
            arr = datetime.fromisoformat(train["scheduled_arrival"].replace("Z", "+00:00"))
            # Map minutes into a day window (0 - 1440 mins)
            start_m = dep.hour * 60 + dep.minute
            end_m = arr.hour * 60 + arr.minute
            if end_m > start_m:
                train_intervals.append((start_m, end_m))
        except Exception:
            continue

    # Fallback to simulated intervals if timetable records lack valid timestamps
    if not train_intervals:
        train_intervals = [(60, 120), (180, 240)]

    # Call Member 1's solver
    solver_output = solve_maintenance_block(train_intervals, block_duration_mins=duration_mins)

    return {
        "status": "computed",
        "section_id": payload.section_id,
        "target_maintenance_request": target_job,
        "trains_evaluated": len(train_intervals),
        "solver_result": solver_output
    }

@app.post("/api/schedule/approve")
def approve_block(payload: BlockApproval):
    update_data = {
        "status": "Approved",
        "allocated_start": payload.allocated_start,
        "allocated_end": payload.allocated_end,
        "directive_notes": payload.directive_notes,
    }
    response = (
        supabase.table("maintenance_requests")
        .update(update_data)
        .eq("id", payload.request_id)
        .execute()
    )
    return {"success": True, "updated": response.data}

@app.post("/api/copilot/chat")
def copilot_chat(payload: ChatQuery):
    if not ai_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    requests_data = supabase.table("maintenance_requests").select("*").execute().data
    timetables_data = supabase.table("train_timetables").select("*").execute().data

    system_instruction = (
        "You are TrackSense Copilot, an AI assistant for Indian Railways Central Scheduling Officers under Industry 6.0. "
        "Analyze maintenance requests and train schedules together. Explain schedule conflicts, estimate passenger impact, "
        "and recommend delay tradeoffs clearly and concisely.\n"
        f"Active Maintenance Requests Context:\n{requests_data}\n\n"
        f"Train Timetable Context:\n{timetables_data}"
    )

    for attempt in range(3):
        try:
            response = ai_client.models.generate_content(
                model="gemini-3.6-flash",
                contents=payload.prompt,
                config={"system_instruction": system_instruction},
            )
            return {"response": response.text}
        except Exception as e:
            if "503" in str(e) and attempt < 2:
                time.sleep(2)
                continue
            raise HTTPException(status_code=500, detail=str(e))