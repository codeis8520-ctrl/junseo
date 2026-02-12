
import React from 'react';
import { LifeStage } from '../types';

interface TriopsSpriteProps {
  stage: LifeStage;
  size: number;
  isAlive: boolean;
  rotation: number;
}

const TriopsSprite: React.FC<TriopsSpriteProps> = ({ stage, size, isAlive, rotation }) => {
  const scale = 0.3 + (size / 100) * 1.2;
  const opacity = isAlive ? 1 : 0.4;
  
  const renderShape = () => {
    switch (stage) {
      case LifeStage.EGG:
        return (
          <g>
            <defs>
              <radialGradient id="eggGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d4a373" />
                <stop offset="70%" stopColor="#a98467" />
                <stop offset="100%" stopColor="#6c584c" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="10" fill="url(#eggGrad)" className="animate-pulse" />
          </g>
        );

      case LifeStage.NAUPLIUS:
        return (
          <g transform="translate(0, -10)">
            <ellipse cx="50" cy="50" rx="6" ry="10" fill="#cc8b3c" opacity="0.8" />
            <path d="M44 45 Q30 25 20 45" stroke="#cc8b3c" strokeWidth="1" fill="none" className="animate-pulse" />
            <path d="M56 45 Q70 25 80 45" stroke="#cc8b3c" strokeWidth="1" fill="none" className="animate-pulse" />
            <circle cx="50" cy="42" r="1.5" fill="black" />
          </g>
        );

      case LifeStage.JUVENILE:
      case LifeStage.ADULT:
      case LifeStage.ELDER:
        return (
          <g transform="translate(0, -20)">
            <defs>
              <filter id="organicTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
              </filter>
              <linearGradient id="realShell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5d6342" />
                <stop offset="40%" stopColor="#7c8352" />
                <stop offset="100%" stopColor="#3d422a" />
              </linearGradient>
              <filter id="bioShimmer">
                <feSpecularLighting specularConstant="1.2" specularExponent="40" lightingColor="#e2e8f0">
                  <fePointLight x="50" y="50" z="100" />
                </feSpecularLighting>
                <feComposite in="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
              </filter>
              <style>{`
                @keyframes legRowWave {
                  0%, 100% { transform: rotate(0deg) skewX(0deg); }
                  50% { transform: rotate(15deg) skewX(-5deg); }
                }
                @keyframes jointFlexWave {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-25deg); }
                }
                @keyframes bodyUndulation {
                  0%, 100% { transform: rotate(-1.2deg) translateX(-0.2px); }
                  50% { transform: rotate(1.2deg) translateX(0.2px); }
                }
                @keyframes tailWaveMotion {
                  0%, 100% { transform: rotate(-10deg) translateX(-1.2px); }
                  50% { transform: rotate(10deg) translateX(1.2px); }
                }
                @keyframes furcaTrail {
                  0%, 100% { transform: rotate(-6deg) skewX(-4deg); }
                  50% { transform: rotate(6deg) skewX(4deg); }
                }
                @keyframes gillsPulse {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 0.6; transform: scale(1.1); }
                }
                .leg-base { transform-box: fill-box; transform-origin: 50% 0%; }
                .leg-joint { transform-box: fill-box; transform-origin: top center; }
                .body-undulator { transform-box: fill-box; transform-origin: 50% 10%; }
                .tail-segment { transform-box: fill-box; transform-origin: 50% -25%; }
                .furca-part { transform-box: fill-box; transform-origin: top center; }
              `}</style>
            </defs>

            {/* LAYER 1 (Lowest/Back): The Long Tail - Rendered first to stay BEHIND everything else */}
            <g transform="translate(50, 72)">
              {[...Array(12)].map((_, i) => {
                const delay = i * 0.08;
                const segmentWidth = Math.max(2.5, 7.5 - i * 0.4);
                return (
                  <g key={i} transform={`translate(0, ${i === 0 ? 0 : 5.6})`} 
                     className="tail-segment" 
                     style={{ 
                       animation: isAlive ? `tailWaveMotion 1.4s ease-in-out infinite` : 'none',
                       animationDelay: `${delay}s` 
                     }}>
                    {/* Shadow where it connects to the body */}
                    {i === 0 && <ellipse cx="0" cy="0" rx="10" ry="6" fill="rgba(0,0,0,0.5)" filter="blur(4px)" />}
                    
                    {/* Tail Segment Plate */}
                    <ellipse cx="0" cy="0" rx={segmentWidth} ry="4.5" fill="#2d2f16" stroke="#121308" strokeWidth="0.8" />
                    
                    {/* Furca (Whip-like appendages at the end) */}
                    {i === 11 && (
                      <g transform="translate(0, 5.5)">
                        <path d="M-3 -2 L3 -2 L1 8 L-1 8 Z" fill="#14150a" />
                        <g transform="translate(0, 8)">
                          <path 
                            d="M0 0 Q-15 60 -45 140" 
                            stroke="#1a1b0d" 
                            strokeWidth="1.6" 
                            fill="none" 
                            strokeLinecap="round" 
                            className="furca-part"
                            style={{ 
                              animation: isAlive ? `furcaTrail 1.8s ease-in-out infinite` : 'none',
                              animationDelay: `${delay + 0.2}s`
                            }}
                          />
                          <path 
                            d="M0 0 Q 15 60  45 140" 
                            stroke="#1a1b0d" 
                            strokeWidth="1.6" 
                            fill="none" 
                            strokeLinecap="round" 
                            className="furca-part"
                            style={{ 
                              animation: isAlive ? `furcaTrail 1.8s ease-in-out infinite` : 'none',
                              animationDelay: `${delay + 0.4}s`
                            }}
                          />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* LAYER 2: Metachronal Appendages (Legs) */}
            {[...Array(15)].map((_, i) => (
              <g key={i} transform={`translate(0, ${i * 4.5})`}>
                <g className="leg-base" style={{ animation: isAlive ? `legRowWave 1.2s ease-in-out infinite` : 'none', animationDelay: `${i * 0.1}s` }}>
                  <path d="M40 50 L28 54" stroke="#4a4f30" strokeWidth="2.5" strokeLinecap="round" />
                  <g transform="translate(28, 54)">
                    <path d="M0 0 L-10 8" stroke="#3a3d28" strokeWidth="1.8" strokeLinecap="round" className="leg-joint" style={{ animation: isAlive ? `jointFlexWave 1s ease-in-out infinite` : 'none', animationDelay: `${i * 0.1 + 0.1}s` }} />
                  </g>
                </g>
                <g className="leg-base" style={{ animation: isAlive ? `legRowWave 1.2s ease-in-out infinite` : 'none', animationDelay: `${i * 0.1}s` }}>
                  <path d="M60 50 L72 54" stroke="#4a4f30" strokeWidth="2.5" strokeLinecap="round" />
                  <g transform="translate(72, 54)">
                    <path d="M0 0 L 10 8" stroke="#3a3d28" strokeWidth="1.8" strokeLinecap="round" className="leg-joint" style={{ animation: isAlive ? `jointFlexWave 1s ease-in-out infinite` : 'none', animationDelay: `${i * 0.1 + 0.1}s` }} />
                  </g>
                </g>
                <ellipse cx="45" cy="52" rx="3" ry="1.5" fill="#991b1b" style={{ animation: `gillsPulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                <ellipse cx="55" cy="52" rx="3" ry="1.5" fill="#991b1b" style={{ animation: `gillsPulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
              </g>
            ))}

            {/* LAYER 3: Carapace (The Shield) - Rendered over the tail and legs */}
            <g className="body-undulator" style={{ animation: isAlive ? `bodyUndulation 2s ease-in-out infinite` : 'none' }}>
              <path d="M30 45 C30 15, 70 15, 70 45 C78 75, 50 92, 50 92 C50 92, 22 75, 30 45 Z" 
                    fill="url(#realShell)" 
                    filter="url(#organicTexture) url(#bioShimmer)" 
                    stroke="#1a1c0d" 
                    strokeWidth="1.5" />
              
              {/* Central ridge/Carina */}
              <path d="M50 20 L50 90" stroke="#1a1c0d" strokeWidth="1" opacity="0.4" strokeDasharray="4 2" />
            </g>
            
            {/* LAYER 4 (Top): Sensory Organs (Eyes) */}
            <g>
              <ellipse cx="42" cy="38" rx="2.5" ry="3.5" fill="#000" />
              <ellipse cx="58" cy="38" rx="2.5" ry="3.5" fill="#000" />
              <circle cx="50" cy="34" r="1.2" fill="#111" />
              <circle cx="43.5" cy="36.5" r="0.8" fill="white" opacity="0.4" />
              <circle cx="56.5" cy="36.5" r="0.8" fill="white" opacity="0.4" />
            </g>
          </g>
        );

      case LifeStage.DECEASED:
        return (
          <g transform="translate(0, -20)">
            <g className="grayscale opacity-25" transform="rotate(180, 50, 75)">
              <path d="M30 45 C30 15, 70 15, 70 45 C78 80, 50 95, 50 95 C50 95, 22 80, 30 45 Z" fill="#94a3b8" stroke="#475569" />
              <path d="M50 145 L35 220 M50 145 L65 220" stroke="#64748b" strokeWidth="1.2" />
            </g>
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="transition-all duration-[800ms] ease-out flex items-center justify-center"
      style={{ 
        transform: `scale(${scale}) rotate(${rotation}deg)`, 
        opacity,
        filter: isAlive ? 'drop-shadow(0 20px 50px rgba(0,0,0,0.4))' : 'grayscale(1) brightness(0.6)'
      }}
    >
      <svg width="320" height="440" viewBox="0 0 100 280">
        {renderShape()}
      </svg>
    </div>
  );
};

export default TriopsSprite;
