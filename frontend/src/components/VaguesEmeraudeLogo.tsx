// Créez un nouveau fichier : frontend/src/components/VaguesEmeraudeLogo.tsx

import React from 'react';

const VaguesEmeraudeLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`} style={{ width: '80px', height: '80px' }}>
      <style>{`
        @keyframes pulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity:0.8; }
          50% { transform: translate(-50%,-50%) scale(1.08); opacity:1; }
        }
        @keyframes waveFlow {
          0%,100% { d: path("M 20,180 C 60,160 100,200 140,180 C 180,160 220,200 260,180 C 300,160 340,200 380,180"); }
          50% { d: path("M 20,180 C 60,200 100,160 140,180 C 180,200 220,160 260,180 C 300,200 340,160 380,180"); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes weaveH {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -40; }
        }
        @keyframes weaveV {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 40; }
        }
        .wave-path { animation: waveFlow 4s ease-in-out infinite; transform-origin: center; }
        .shimmer { animation: shimmer 3s ease-in-out infinite; }
        .weave-h { animation: weaveH 6s linear infinite; }
        .weave-v { animation: weaveV 8s linear infinite; }
      `}</style>
      
      <div className="absolute inset-0">
        {/* Halo */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-emerald-900/30 to-teal-900/20 animate-pulse" 
             style={{ transform: 'scale(1.2)' }} />
        
        {/* SVG */}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <radialGradient id="bgCircleSmall" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a3d2b"/>
              <stop offset="100%" stopColor="#041810"/>
            </radialGradient>
            <linearGradient id="emeraldSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a9e6e"/>
              <stop offset="40%" stopColor="#3de0a0"/>
              <stop offset="100%" stopColor="#0d7a52"/>
            </linearGradient>
            <linearGradient id="seafoamSmall" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0d6b4a"/>
              <stop offset="50%" stopColor="#2bc98a"/>
              <stop offset="100%" stopColor="#7dedc4"/>
            </linearGradient>
            <filter id="glowSmall" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="circleClipSmall">
              <circle cx="200" cy="200" r="155"/>
            </clipPath>
          </defs>

          <circle cx="200" cy="200" r="155" fill="url(#bgCircleSmall)"/>
          
          <circle cx="200" cy="200" r="155" fill="none" stroke="#0f6647" strokeWidth="2"/>
          <circle cx="200" cy="200" r="148" fill="none" stroke="#1a9e6e" strokeWidth="1" opacity="0.5"/>

          {/* Vagues simplifiées */}
          <path d="M 50,240 C 90,215 130,265 170,240 C 210,215 250,265 290,240 C 330,215 360,240 360,240 L 360,310 Q 300,300 200,310 Q 100,320 50,310 Z"
                fill="#0d6b4a" opacity="0.7" clipPath="url(#circleClipSmall)"/>
          
          <path d="M 45,272 C 80,252 120,285 160,265 C 200,245 240,280 280,262 C 315,246 355,268 355,268 L 360,355 Q 200,360 45,355 Z"
                fill="url(#seafoamSmall)" opacity="0.9" clipPath="url(#circleClipSmall)"/>

          {/* Symbole central */}
          <g transform="translate(200,200)" filter="url(#glowSmall)">
            <circle r="30" fill="rgba(10,60,40,0.7)" stroke="#1a9e6e" strokeWidth="1"/>
            <g stroke="#3de0a0" strokeWidth="1" opacity="0.6" fill="none">
              <line x1="0" y1="-25" x2="0" y2="25"/>
              <line x1="-25" y1="0" x2="25" y2="0"/>
            </g>
            <circle r="5" fill="#3de0a0"/>
            <circle r="2" fill="#c8f7e5"/>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default VaguesEmeraudeLogo;