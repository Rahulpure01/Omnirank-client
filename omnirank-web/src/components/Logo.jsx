import React from 'react';

export default function Logo({ size = 'md', showWordmark = true, className = '' }) {
  // Size mapping
  const sizeMap = {
    sm: { icon: 24, text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 32, text: 'text-lg sm:text-xl', badge: 'text-[10px] sm:text-xs px-2 py-0.5' },
    lg: { icon: 42, text: 'text-2xl sm:text-3xl', badge: 'text-xs px-2.5 py-1' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Tri-Engine Futuristic SVG Emblem */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl p-1 bg-gradient-to-br from-neutral-900 via-neutral-950 to-purple-950 border border-neutral-800 shadow-md group"
        style={{ width: current.icon + 10, height: current.icon + 10 }}
      >
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="omni-seo-grad" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="omni-aeo-grad" x1="24" y1="4" x2="44" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="omni-geo-grad" x1="12" y1="24" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#ef4444" />
            </linearGradient>
            <radialGradient id="omni-core" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#c084fc" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <filter id="omni-glow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Engine 1: SEO Curved Turbine Wing (Top-Left) */}
          <path
            d="M24 6 C16 6 8 14 8 22 C13 20 18 18 24 21 Z"
            fill="url(#omni-seo-grad)"
            opacity="0.95"
          />

          {/* Engine 2: AEO Curved Turbine Wing (Top-Right) */}
          <path
            d="M40 22 C40 14 32 6 24 6 C24 12 26 18 31 22 Z"
            fill="url(#omni-aeo-grad)"
            opacity="0.95"
          />

          {/* Engine 3: GEO Curved Turbine Wing (Bottom Center) */}
          <path
            d="M10 24 C14 34 24 42 24 42 C24 42 34 34 38 24 C31 27 17 27 10 24 Z"
            fill="url(#omni-geo-grad)"
            opacity="0.95"
          />

          {/* Overlapping Interlocking Dynamic Orbit */}
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke="url(#omni-aeo-grad)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Radiant AI Center Core */}
          <circle cx="24" cy="24" r="5" fill="url(#omni-core)" filter="url(#omni-glow)" />

          {/* Precision AI Sparkle Star */}
          <path
            d="M24 19 L25.2 22.8 L29 24 L25.2 25.2 L24 29 L22.8 25.2 L19 24 L22.8 22.8 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-neutral-900 ${current.text}`}>
            OmniRank
          </span>
          <span className={`rounded-md sm:rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-wider shadow-xs ${current.badge}`}>
            AI
          </span>
        </div>
      )}
    </div>
  );
}
