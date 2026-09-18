import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, Play, Check, Send } from 'lucide-react';

export default function CentralPortal() {
  const [requests, setRequests] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'TrackSense 6.0 Copilot ready. Ask me why a slot was assigned, or simulate adjustments to train timetables.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('central-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('ml_priority_score', { ascending: false });
      
      if (error) throw error;
      if (data) setRequests(data);
    } catch {
      // Local mock data if Supabase isn't connected yet
      setRequests([
        { id: 1, ml_priority_score: 98, section_id: 'SEC-A4', track_line: 'DOWN', defect_type: 'Rail Fracture', urgency_tier: 'Emergency', duration_minutes: 90, status: 'Pending Review' },
        { id: 2, ml_priority_score: 75, section_id: 'SEC-B2', track_line: 'UP', defect_type: 'OHE Wire Snap', urgency_tier: 'Safety-Critical', duration_minutes: 120, status: 'Optimized' },
        { id: 3, ml_priority_score: 42, section_id: 'SEC-C1', track_line: 'SINGLE', defect_type: 'Ballast Tamping', urgency_tier: 'Routine', duration_minutes: 60, status: 'Deferred' }
      ]);
    }
  }

  async function handleRunOptimization() {
    setOptimizing(true);
    try {
      await fetch(`${backendUrl}/api/schedule/run`, { method: 'POST' });
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  }

async function handleApprove(id) {
    try {
      await supabase
        .from('maintenance_requests')
        .update({ status: 'Approved' })
        .eq('id', id);
      fetchRequests();
    } catch {
      // Local state fallback to visually change the status instantly
      setRequests((prev) => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    }
  }

  async function handleSendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const query = chatInput;
    setChatInput('');

    try {
      const res = await fetch(`${backendUrl}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setChatMessages((prev) => [
        ...prev, 
        { role: 'assistant', text: 'Simulated response: Section SEC-A4 scheduled at 02:00 AM avoids a 45-min delay on express trains.' }
      ]);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Divisional Maintenance Command</h2>
              <p className="text-xs text-slate-400">Prioritized using ML Risk Scores & CP-SAT Constraint Engine</p>
            </div>
            <button
              onClick={handleRunOptimization}
              disabled={optimizing}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50 text-white cursor-pointer"
            >
              <Play className="h-4 w-4" /> {optimizing ? 'Solving...' : 'Run Auto-Optimization'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ML Score</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Defect</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-slate-500">No requests in queue.</td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 font-bold text-blue-400">{r.ml_priority_score}/100</td>
                      <td className="p-3">{r.section_id} ({r.track_line})</td>
                      <td className="p-3 font-medium text-slate-200">{r.defect_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.urgency_tier === 'Emergency' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'}`}>
                          {r.urgency_tier}
                        </span>
                      </td>
                      <td className="p-3">{r.duration_minutes}m</td>
                      <td className="p-3 font-medium text-slate-300">{r.status}</td>
                      <td className="p-3">
                        {r.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="h-3 w-3" /> Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col h-[600px]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Bot className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-sm text-slate-100">Industry 6.0 Decision Copilot</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-200 ml-6 border border-blue-800' : 'bg-slate-900 text-slate-300 mr-6 border border-slate-800'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
          <input
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Ask rationale or simulate changes..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-white cursor-pointer">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}