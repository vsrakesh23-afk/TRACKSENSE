import React, { useState } from 'react';
import StationPortal from './components/StationPortal';
import CentralPortal from './components/CentralPortal';
import { Train, ShieldCheck, Sparkles, Activity, Layers } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('station');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Tri-color Top Strip */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="h-full w-1/3 bg-[#FF671F]"></div>
        <div className="h-full w-1/3 bg-[#FFFFFF]"></div>
        <div className="h-full w-1/3 bg-[#046A38]"></div>
      </div>

      {/* Top National Announcement Bar */}
      <div className="bg-[#0b1e36] text-slate-200 px-6 py-1.5 text-xs flex justify-between items-center border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#FF9933]">मेरी सरकार | MyGov Railway Mission</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Ministry of Railways & CRIS Digital Cell</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700">
            <Activity className="h-3 w-3 animate-pulse" /> Live Dispatch Node
          </span>
          <span className="text-slate-300 flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> ISO 27001 Certified
          </span>
        </div>
      </div>

      {/* Main Header & Branding */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3.5">
            {/* Direct High-Contrast Train Emblem */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#0B2545] to-[#0284C7] flex items-center justify-center shadow-md text-white border-2 border-amber-500/40">
              <Train className="h-6 w-6 text-white" />
            </div>

            <div className="border-l-2 border-slate-200 pl-3.5">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold tracking-wider text-[#046A38] uppercase">
                    भारतीय रेल • INDIAN RAILWAYS
                  </span>
                  <h1 className="text-xl font-black tracking-tight text-[#0B2545] leading-none mt-0.5">
                    TrackSense<span className="text-[#FF671F]"> 6.0</span>
                  </h1>
                </div>
                <span className="text-[10px] font-bold bg-gradient-to-r from-orange-50 to-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs flex items-center gap-1 ml-1">
                  <Sparkles className="h-2.5 w-2.5 text-amber-600" /> National Safety AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Centre for Railway Information Systems (CRIS) • Track Possession Gateway
              </p>
            </div>
          </div>

          {/* Portal Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setRole('station')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                role === 'station'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0369a1] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Station Field Portal
            </button>
            <button
              onClick={() => setRole('central')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                role === 'central'
                  ? 'bg-gradient-to-r from-[#0b2545] to-[#1e3a8a] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-[#FF9933]" /> Central Dispatch Command
            </button>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {role === 'station' ? <StationPortal /> : <CentralPortal />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b1e36] text-slate-300 text-xs py-5 border-t-4 border-[#FF671F] mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#046A38]"></div>
            <p>© 2026 Centre for Railway Information Systems (CRIS), Government of India.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="hover:text-white cursor-pointer">Security Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Helpdesk 139</span>
          </div>
        </div>
      </footer>
    </div>
  );
}