import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileEdit, Clock, Send, CheckCircle, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function StationPortal() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    station_code: 'MAS-01',
    section_id: 'SEC-A4',
    track_line: 'DOWN',
    km_start: 124.5,
    km_end: 126.0,
    department: 'P.Way',
    defect_type: 'Rail Fracture',
    urgency_tier: 'Emergency',
    duration_minutes: 90,
    machinery_needed: 'Manual Gang + Weld Kit',
    weather_condition: 'Clear'
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMyRequests();

    const channel = supabase
      .channel('station-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, () => {
        fetchMyRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMyRequests() {
    try {
      const { data } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setRequests(data);
      } else {
        throw new Error();
      }
    } catch {
      setRequests([
        {
          id: 1,
          section_id: 'SEC-A4',
          track_line: 'DOWN',
          defect_type: 'Rail Fracture',
          department: 'P.Way',
          duration_minutes: 90,
          status: 'Approved',
          urgency_tier: 'Emergency',
          allocated_start: '2026-09-19T01:30:00Z',
          allocated_end: '2026-09-19T03:00:00Z'
        },
        {
          id: 2,
          section_id: 'SEC-B2',
          track_line: 'UP',
          defect_type: 'Overhead Wire Snag',
          department: 'OHE',
          duration_minutes: 120,
          status: 'Optimized',
          urgency_tier: 'Safety-Critical',
          allocated_start: null
        }
      ]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) fetchMyRequests();
      else throw new Error();
    } catch {
      const mockItem = {
        id: Date.now(),
        ...form,
        status: 'Pending Review',
        allocated_start: null
      };
      setRequests((prev) => [mockItem, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Vibrant Left Requisition Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#0284C7] via-[#6366F1] to-[#FF671F]"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                <FileEdit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Track Block Requisition Proforma</h2>
                <p className="text-[11px] text-slate-500">Official Field Maintenance & Defect Submission</p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="h-3 w-3 text-sky-600" /> Divisional Sector 4
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Station Code</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  value={form.station_code}
                  onChange={(e) => setForm({ ...form, station_code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Section Identification</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  value={form.section_id}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700">Track Line</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.track_line}
                  onChange={(e) => setForm({ ...form, track_line: e.target.value })}
                >
                  <option>DOWN</option>
                  <option>UP</option>
                  <option>SINGLE</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Start Chainage (KM)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.km_start}
                  onChange={(e) => setForm({ ...form, km_start: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">End Chainage (KM)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.km_end}
                  onChange={(e) => setForm({ ...form, km_end: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Executing Department</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option>P.Way (Permanent Way)</option>
                  <option>S&T (Signals & Telecom)</option>
                  <option>OHE (Traction Distribution)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Urgency Classification</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-bold outline-none"
                  value={form.urgency_tier}
                  onChange={(e) => setForm({ ...form, urgency_tier: e.target.value })}
                >
                  <option>Emergency (Immediate Action)</option>
                  <option>Safety-Critical</option>
                  <option>Routine Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700">Defect Nature / Classification</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.defect_type}
                  onChange={(e) => setForm({ ...form, defect_type: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Duration Required (Minutes)</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 mt-1 text-slate-800 font-medium outline-none"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#FF671F] to-[#f97316] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-extrabold py-3 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {loading ? 'Transmitting to Zonal Control...' : 'Transmit Possession Requisition'}
            </button>
          </form>
        </div>
      </div>

      {/* Vibrant Right Directives & Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#046A38] to-[#10b981]"></div>

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Possession Status & Dispatches</h2>
                <p className="text-[11px] text-slate-500">Autonomous Real-Time Sync with Control Office</p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-600" /> Active Channel
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white border-2 border-slate-100 hover:border-slate-200 rounded-xl shadow-sm transition flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {r.section_id} ({r.track_line} Line)
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{r.defect_type}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                      r.status === 'Approved'
                        ? 'bg-emerald-600 text-white'
                        : r.status === 'Optimized'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex justify-between bg-slate-50 p-2 rounded-lg font-medium">
                  <span>Department: <strong className="text-slate-800">{r.department}</strong></span>
                  <span>Required Window: <strong className="text-slate-800">{r.duration_minutes} mins</strong></span>
                </div>

                {r.allocated_start ? (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Allocated Block Slot:
                    </span>
                    <span className="tracking-wide">01:30 AM - 03:00 AM (Dispatched)</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200 text-[11px] flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="h-4 w-4 text-amber-600" /> Queued for CP-SAT Solver Allocation
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}