import React from 'react';

export default function RailEmblem({ className = "h-11 w-11" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="emblemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF671F" />
            <stop offset="50%" stopColor="#0B2545" />
            <stop offset="100%" stopColor="#046A38" />
          </linearGradient>
          <linearGradient id="metalTrack" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="#0B2545" stroke="url(#emblemGradient)" strokeWidth="3" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />

        <circle cx="50" cy="22" r="7" fill="none" stroke="#FF671F" strokeWidth="1.2" />
        <circle cx="50" cy="22" r="1.5" fill="#FF671F" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="22"
            x2={50 + 6 * Math.cos((deg * Math.PI) / 180)}
            y2={22 + 6 * Math.sin((deg * Math.PI) / 180)}
            stroke="#FF671F"
            strokeWidth="0.8"
          />
        ))}

        <path d="M 28 82 L 44 42 L 56 42 L 72 82 Z" fill="#07182c" />
        <line x1="33" y1="76" x2="67" y2="76" stroke="#94A3B8" strokeWidth="1.8" />
        <line x1="37" y1="67" x2="63" y2="67" stroke="#94A3B8" strokeWidth="1.6" />
        <line x1="41" y1="58" x2="59" y2="58" stroke="#94A3B8" strokeWidth="1.4" />
        <line x1="44" y1="50" x2="56" y2="50" stroke="#94A3B8" strokeWidth="1.2" />

        <path
          d="M 38 48 C 38 34, 62 34, 62 48 L 60 70 C 60 73, 40 73, 40 70 Z"
          fill="url(#metalTrack)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        <path d="M 42 45 C 42 40, 58 40, 58 45 L 57 51 L 43 51 Z" fill="#0B2545" />
        <circle cx="44" cy="65" r="2" fill="#FACC15" />
        <circle cx="56" cy="65" r="2" fill="#FACC15" />
        <rect x="42" y="71" width="16" height="2.5" rx="1" fill="#FF671F" />
      </svg>
    </div>
  );
}