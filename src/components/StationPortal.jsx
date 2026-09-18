import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AlertTriangle, Clock, Send, CheckCircle2 } from 'lucide-react';

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
      if (data) setRequests(data);
    } catch {
      // Fallback while awaiting live Supabase connection
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
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      case 'Optimized':
        return 'bg-indigo-950 text-indigo-400 border border-indigo-800';
      default:
        return 'bg-amber-950 text-amber-400 border border-amber-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Field Track Maintenance Report
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Station Code</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.station_code}
                onChange={(e) => setForm({ ...form, station_code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Section ID</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Line</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.track_line}
                onChange={(e) => setForm({ ...form, track_line: e.target.value })}
              >
                <option>DOWN</option>
                <option>UP</option>
                <option>SINGLE</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Start KM</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.km_start}
                onChange={(e) => setForm({ ...form, km_start: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">End KM</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.km_end}
                onChange={(e) => setForm({ ...form, km_end: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Department</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option>P.Way</option>
                <option>S&T</option>
                <option>OHE</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Urgency Tier</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.urgency_tier}
                onChange={(e) => setForm({ ...form, urgency_tier: e.target.value })}
              >
                <option>Emergency</option>
                <option>Safety-Critical</option>
                <option>Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Defect Classification</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.defect_type}
                onChange={(e) => setForm({ ...form, defect_type: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Duration (Mins)</label>
              <input
                type="number"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-slate-200"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 text-white cursor-pointer"
          >
            <Send className="h-4 w-4" /> {loading ? 'Transmitting...' : 'Submit Maintenance Report'}
          </button>
        </form>
      </div>

      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col h-full">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Field Execution Directives & Live Status
        </h2>
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {requests.length === 0 ? (
            <p className="text-sm text-slate-500">No active maintenance blocks requested for this section.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-semibold">{r.section_id} ({r.track_line})</span>
                    <h3 className="font-medium text-slate-200 text-sm">{r.defect_type}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getBadgeStyle(r.status)}`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Dept: {r.department}</span>
                  <span>Duration: {r.duration_minutes}m</span>
                </div>
                {r.allocated_start && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Allocated Window:
                    </span>
                    <span>
                      {new Date(r.allocated_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.allocated_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}