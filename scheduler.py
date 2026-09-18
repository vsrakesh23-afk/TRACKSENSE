from ortools.sat.python import cp_model

def solve_maintenance_block(train_intervals, block_duration_mins, planning_window_mins=720):
    """
    Fits a maintenance block of length `block_duration_mins` inside 
    a planning window (e.g. 12 hours = 720 mins) avoiding all train intervals.
    
    train_intervals: list of tuples [(start_min, end_min), ...]
    """
    model = cp_model.CpModel()
    
    # Block start and end decision variables
    block_start = model.NewIntVar(0, planning_window_mins - block_duration_mins, "block_start")
    block_end = model.NewIntVar(block_duration_mins, planning_window_mins, "block_end")
    block_interval = model.NewIntervalVar(block_start, block_duration_mins, block_end, "block_interval")

    intervals = [block_interval]

    # Model train movements as fixed non-overlapping intervals
    for idx, (t_start, t_end) in enumerate(train_intervals):
        duration = t_end - t_start
        t_var = model.NewIntervalVar(t_start, duration, t_end, f"train_{idx}")
        intervals.append(t_var)

    # Constraint: No two intervals can overlap on this single track section
    model.AddNoOverlap(intervals)

    # Objective: Minimize start time (schedule as early as possible without collision)
    model.Minimize(block_start)

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        return {
            "success": True,
            "allocated_start_min": solver.Value(block_start),
            "allocated_end_min": solver.Value(block_end),
            "duration_mins": block_duration_mins
        }
    return {"success": False, "error": "No conflict-free window available"}

if __name__ == "__main__":
    # Simulate trains passing: 01:00-02:00 (60-120m), 03:00-04:00 (180-240m)
    trains = [(60, 120), (180, 240)]
    # Request a 90-minute block
    res = solve_maintenance_block(trains, block_duration_mins=90)
    print("Feasible Block Allocation Result:", res)
    