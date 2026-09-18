import React, { useState } from 'react';
import StationPortal from './components/StationPortal';
import CentralPortal from './components/CentralPortal';
import { Train, Radio } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('station');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Train className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight">TrackSense 6.0</span>
          <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-700 flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-indigo-400 animate-pulse" /> Industry 6.0 Symbiotic Workspace
          </span>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setRole('station')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${role === 'station' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Station Officer Portal
          </button>
          <button
            onClick={() => setRole('central')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${role === 'central' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Central Scheduling Portal
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {role === 'station' ? <StationPortal /> : <CentralPortal />}
      </main>
    </div>
  );
}