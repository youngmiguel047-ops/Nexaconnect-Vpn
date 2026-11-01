/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface AntaresBackgroundProps {
  reducedEffects?: boolean;
  rainOpacity?: number;
}

interface RainStream {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  color: string;
  fontSize: number;
  chars: string[];
  leadGlow: boolean;
}

// Exactly matching the bright colored palette seen in the reference screenshot
const RAIN_COLORS = [
  '#00E5FF', // Cyan électrique
  '#FF00E5', // Magenta vibrant
  '#FFE600', // Jaune néon (très visible dans le screenshot !)
  '#00FF88', // Vert néon
  '#9D00FF', // Violet électrique
  '#0099FF', // Bleu ciel néon
];

export const AntaresBackground: React.FC<AntaresBackgroundProps> = ({
  reducedEffects = false,
  rainOpacity = 0.85,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedEffects) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Build vertical strings of "Antares VPN"
    const textPhrase = 'Antares VPN ';
    const density = Math.min(36, Math.max(18, Math.floor(width / 20)));
    const streams: RainStream[] = [];

    for (let i = 0; i < density; i++) {
      const charCount = Math.floor(14 + Math.random() * 16);
      const streamChars: string[] = [];
      for (let c = 0; c < charCount; c++) {
        streamChars.push(textPhrase[c % textPhrase.length]);
      }

      streams.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.5 - height * 0.5,
        speed: 0.8 + Math.random() * 2.2,
        opacity: 0.25 + Math.random() * 0.65,
        color: RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)],
        fontSize: Math.floor(9 + Math.random() * 3.5),
        chars: streamChars,
        leadGlow: Math.random() > 0.4,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render vertical streams of "Antares VPN"
      ctx.save();
      for (let i = 0; i < streams.length; i++) {
        const s = streams[i];
        ctx.font = `700 ${s.fontSize}px 'JetBrains Mono', 'Orbitron', monospace`;
        ctx.textAlign = 'center';

        const step = s.fontSize + 2.5;

        for (let j = 0; j < s.chars.length; j++) {
          const charY = s.y - (s.chars.length - 1 - j) * step;
          if (charY >= -20 && charY <= height + 30) {
            const isHead = j === s.chars.length - 1;
            const progress = (j + 1) / s.chars.length;

            if (isHead && s.leadGlow) {
              ctx.fillStyle = '#FFFFFF';
              ctx.shadowColor = s.color;
              ctx.shadowBlur = 8;
              ctx.globalAlpha = Math.min(1, s.opacity * 1.4 * rainOpacity);
            } else {
              ctx.fillStyle = s.color;
              ctx.shadowColor = s.color;
              ctx.shadowBlur = 4;
              ctx.globalAlpha = s.opacity * progress * rainOpacity;
            }

            ctx.fillText(s.chars[j], s.x, charY);
          }
        }

        // Advance stream
        s.y += s.speed * (delta / 16);

        // Reset when stream leaves bottom
        if (s.y - s.chars.length * step > height) {
          s.y = -20;
          s.x = Math.random() * width;
          s.speed = 0.8 + Math.random() * 2.2;
          s.color = RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)];
          s.opacity = 0.25 + Math.random() * 0.65;
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedEffects, rainOpacity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Deep Black Cyber Gradient Base */}
      <div className="absolute inset-0 bg-[#03010B]" />

      {/* Cyber ambient glows matching screenshot */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[120px] opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.45) 0%, rgba(139,0,255,0.3) 60%, transparent 100%)',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255,0,229,0.4) 0%, rgba(157,0,255,0.2) 70%, transparent 100%)',
        }}
      />

      {/* 2. World Globe Grid behind central power button (Visible in Screenshot 1) */}
      <div 
        className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none opacity-40 overflow-hidden"
        style={{
          background: 'radial-gradient(circle, rgba(0, 102, 255, 0.25) 0%, rgba(139, 0, 255, 0.15) 60%, transparent 80%)',
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-[#00E5FF]/40 animate-rotate-slow">
          <circle cx="100" cy="100" r="95" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
          <ellipse cx="100" cy="100" rx="95" ry="40" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="95" ry="70" fill="none" stroke="#8B00FF" strokeWidth="0.6" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="40" ry="95" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="70" ry="95" fill="none" stroke="#FF00E5" strokeWidth="0.6" opacity="0.3" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="#00E5FF" strokeWidth="0.8" opacity="0.5" />
          <line x1="100" y1="5" x2="100" y2="195" stroke="#00E5FF" strokeWidth="0.8" opacity="0.5" />

          {/* Abstract continent shapes */}
          <path d="M60 70 Q75 55 95 65 T130 60 T145 90 T120 115 T85 105 Z" fill="#0066FF" opacity="0.25" />
          <path d="M40 120 Q55 110 70 130 T60 160 T35 145 Z" fill="#8B00FF" opacity="0.2" />
          <path d="M125 130 Q145 125 160 145 T140 170 T120 150 Z" fill="#00E5FF" opacity="0.2" />
        </svg>
      </div>

      {/* 3. ANTARES VPN RAIN Canvas Layer */}
      {!reducedEffects && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* 4. Cyberpunk City Skyline, Full Moon & Hoodie Rooftop Silhouette (Exact replica from Screenshot 1) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        {/* Glowing Magenta Moon in the background */}
        <div 
          className="absolute -right-6 top-6 w-32 h-32 rounded-full border border-[#FF00E5]/60 shadow-[0_0_50px_rgba(255,0,229,0.7)]"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FFAAFF 0%, #FF00E5 45%, #9D00FF 80%, #03010B 100%)',
          }}
        >
          {/* Moon craters */}
          <div className="absolute top-5 left-8 w-4 h-4 rounded-full bg-black/20" />
          <div className="absolute top-12 left-14 w-6 h-6 rounded-full bg-black/25" />
          <div className="absolute top-18 left-8 w-3 h-3 rounded-full bg-black/15" />
        </div>

        {/* Cyberpunk City Skyline SVG */}
        <svg 
          viewBox="0 0 420 180" 
          className="absolute bottom-0 w-full h-full" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background glowing buildings */}
          <path 
            d="M0 180 L0 100 L25 100 L25 80 L30 80 L30 50 L35 80 L50 80 L50 110 L75 110 L75 60 L80 40 L85 60 L110 60 L110 180 Z" 
            fill="#120428" 
            opacity="0.8"
          />
          <path 
            d="M120 180 L120 70 L145 70 L145 90 L170 90 L170 45 L175 25 L180 45 L205 45 L205 180 Z" 
            fill="#190638" 
            opacity="0.9"
          />
          <path 
            d="M210 180 L210 85 L240 85 L240 50 L245 35 L250 50 L275 50 L275 100 L305 100 L305 65 L335 65 L335 180 Z" 
            fill="#14052C" 
            opacity="0.85"
          />
          <path 
            d="M340 180 L340 75 L365 75 L365 55 L370 40 L375 55 L395 55 L395 180 L420 180 L420 180 Z" 
            fill="#1F0744" 
            opacity="0.95"
          />

          {/* Neon antennas and spires */}
          <line x1="32" y1="50" x2="32" y2="28" stroke="#00E5FF" strokeWidth="1.5" />
          <circle cx="32" cy="28" r="2" fill="#00E5FF" />

          <line x1="82" y1="40" x2="82" y2="15" stroke="#FF00E5" strokeWidth="1.5" />
          <circle cx="82" cy="15" r="2" fill="#FF00E5" />

          <line x1="177" y1="25" x2="177" y2="5" stroke="#00FF88" strokeWidth="1.8" />
          <circle cx="177" cy="5" r="2" fill="#00FF88" />

          <line x1="247" y1="35" x2="247" y2="12" stroke="#FFE600" strokeWidth="1.5" />
          <circle cx="247" cy="12" r="2" fill="#FFE600" />

          <line x1="372" y1="40" x2="372" y2="18" stroke="#00E5FF" strokeWidth="1.5" />
          <circle cx="372" cy="18" r="2" fill="#00E5FF" />

          {/* Glowing Windows grid on skyscrapers */}
          <rect x="130" y="80" width="3" height="5" fill="#00E5FF" opacity="0.9" />
          <rect x="138" y="80" width="3" height="5" fill="#FF00E5" opacity="0.8" />
          <rect x="130" y="95" width="3" height="5" fill="#FFE600" opacity="0.9" />
          <rect x="138" y="95" width="3" height="5" fill="#00FF88" opacity="0.8" />
          <rect x="180" y="60" width="4" height="6" fill="#00E5FF" opacity="0.8" />
          <rect x="190" y="60" width="4" height="6" fill="#FF00E5" opacity="0.9" />
          <rect x="180" y="75" width="4" height="6" fill="#00E5FF" opacity="0.7" />
          <rect x="220" y="95" width="3" height="5" fill="#FF00E5" opacity="0.8" />
          <rect x="230" y="95" width="3" height="5" fill="#00FF88" opacity="0.9" />
          <rect x="285" y="110" width="4" height="6" fill="#00E5FF" opacity="0.8" />
          <rect x="295" y="110" width="4" height="6" fill="#FFE600" opacity="0.8" />

          {/* Foreground Rooftop Ledge on the left */}
          <path d="M0 180 L0 125 L120 125 L140 145 L140 180 Z" fill="#070212" />
          <line x1="0" y1="125" x2="120" y2="125" stroke="#FF00E5" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="120" y1="125" x2="140" y2="145" stroke="#FF00E5" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Cyberpunk Figure sitting on rooftop with hoodie */}
          <g transform="translate(60, 100)">
            {/* Body / Hoodie silhouette */}
            <path d="M15 25 C12 18, 14 10, 24 8 C34 10, 36 18, 33 25 L38 38 L30 45 L8 45 L10 38 Z" fill="#0E051E" />
            <circle cx="24" cy="8" r="6" fill="#0E051E" />
            {/* Glowing Crown on back of hoodie (from reference screenshot) */}
            <path 
              d="M18 20 L20 16 L24 18 L28 16 L30 20 L29 23 L19 23 Z" 
              fill="#FF00E5" 
              filter="drop-shadow(0 0 4px #FF00E5)"
            />
          </g>
        </svg>
      </div>

      {/* 5. Edge HUD Decorative Cyber Lines & Corner Brackets */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/50 pointer-events-none" />
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#8B00FF]/50 pointer-events-none" />
      <div className="absolute bottom-20 left-2 w-6 h-6 border-b-2 border-l-2 border-[#00E5FF]/40 pointer-events-none" />
      <div className="absolute bottom-20 right-2 w-6 h-6 border-b-2 border-r-2 border-[#FF00E5]/40 pointer-events-none" />
    </div>
  );
};
