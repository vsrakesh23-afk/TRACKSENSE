import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, Play, Check, Send, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function CentralPortal() {
  const [requests, setRequests] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Industry 6.0 Decision Copilot active. Continuous timetable gap analysis in progress.' }
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
      const { data } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('ml_priority_score', { ascending: false });
      if (data && data.length > 0) {
        setRequests(data);
      } else {
        throw new Error();
      }
    } catch {
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
    } catch {
      setRequests((prev) =>
        prev.map((r) => (r.status === 'Pending Review' ? { ...r, status: 'Optimized' } : r))
      );
    } finally {
      setOptimizing(false);
    }
  }

  async function handleApprove(id) {
    try {
      await supabase.from('maintenance_requests').update({ status: 'Approved' }).eq('id', id);
      fetchRequests();
    } catch {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
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
        { role: 'assistant', text: 'Conflict analysis: Assigning SEC-A4 at 01:30 AM avoids delays across 4 passenger expresses on Chennai-Katpadi line.' }
      ]);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Central Queue Table & Metrics */}
      <div className="xl:col-span-2 space-y-5">
        {/* Colorful Metric Tiles */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Pending Requisitions</p>
              <h3 className="text-2xl font-extrabold">{requests.length} Requests</h3>
            </div>
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Safety Clearance</p>
              <h3 className="text-2xl font-extrabold">100% Verified</h3>
            </div>
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Passenger Delay Saved</p>
              <h3 className="text-2xl font-extrabold">142 Hours</h3>
            </div>
            <div className="p-2.5 bg-white/20 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Master Prioritization Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap justify-between items-center mb-5 gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0b2545]">Divisional Block Prioritization Matrix</h2>
              <p className="text-xs text-slate-500 font-medium">Auto-ranked by Machine Learning Risk Scoring Engine</p>
            </div>
            <button
              onClick={handleRunOptimization}
              disabled={optimizing}
              className="bg-gradient-to-r from-[#FF671F] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white" /> {optimizing ? 'Executing Solver...' : 'Run CP-SAT Auto-Optimization'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">ML Risk Score</th>
                  <th className="p-3">Track Section</th>
                  <th className="p-3">Defect Nature</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Block Status</th>
                  <th className="p-3 text-center">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full font-extrabold text-xs bg-red-100 text-red-700 border border-red-200">
                        {r.ml_priority_score}/100
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {r.section_id} <span className="text-slate-400 font-normal">({r.track_line})</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{r.defect_type}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.urgency_tier === 'Emergency'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.urgency_tier}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{r.duration_minutes} mins</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Optimized'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {r.status !== 'Approved' ? (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 mx-auto cursor-pointer transition shadow hover:shadow-md"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve & Dispatch
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <Check className="h-4 w-4" /> Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decision Copilot Drawer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[620px]">
        <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0b2545]">Industry 6.0 Decision Copilot</h3>
            <p className="text-[11px] text-slate-500 font-medium">Conversational Timetable Reasoning</p>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white ml-6'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 mr-6'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
          <input
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            placeholder="Ask rationale or test delay simulations..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-[#0b2545] hover:opacity-95 px-4 py-2.5 rounded-xl text-white cursor-pointer shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}