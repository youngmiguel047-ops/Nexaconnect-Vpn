/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Power } from 'lucide-react';
import { VpnConnectionState } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface VpnPowerButtonProps {
  state: VpnConnectionState;
  onToggleConnect: () => void;
  disabled?: boolean;
}

export const VpnPowerButton: React.FC<VpnPowerButtonProps> = ({
  state,
  onToggleConnect,
  disabled = false,
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleClick = () => {
    if (disabled || state === 'connecting' || state === 'disconnecting') return;

    setIsGlitching(true);
    cyberAudio.playGlitch();

    setTimeout(() => {
      setIsGlitching(false);
      onToggleConnect();
    }, 180);
  };

  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';
  const isError = state === 'error';

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Outer Pulse Halo */}
      {(isConnected || isConnecting) && (
        <div
          className="absolute w-[220px] h-[220px] rounded-full pointer-events-none animate-ping opacity-25"
          style={{ backgroundColor: isConnected ? '#00FF88' : '#00E5FF' }}
        />
      )}

      {/* Ambient Neon Back-glow */}
      <div
        className="absolute w-[230px] h-[230px] rounded-full blur-[45px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: isConnected
            ? 'rgba(0, 255, 136, 0.45)'
            : isConnecting
            ? 'rgba(0, 229, 255, 0.5)'
            : isError
            ? 'rgba(255, 49, 85, 0.45)'
            : 'rgba(0, 229, 255, 0.25)',
        }}
      />

      {/* Main Master Button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-label={isConnected ? 'Déconnecter' : 'Connecter'}
        className={`group relative w-[190px] h-[190px] sm:w-[210px] sm:h-[210px] rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer ${
          isGlitching ? 'animate-glitch' : ''
        } active:scale-95`}
      >
        {/* Layer 1: Outer SVG Tech Ring with segments and ticks */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            viewBox="0 0 200 200"
            className={`w-full h-full ${
              isConnecting ? 'animate-rotate-fast' : 'animate-rotate-slow'
            }`}
          >
            {/* Outer Cyan Ring */}
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.5"
              strokeDasharray="45 12 15 12"
              opacity="0.85"
            />
            {/* Purple concentric ring */}
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="#8B00FF"
              strokeWidth="2"
              strokeDasharray="2 10"
              opacity="0.7"
            />
            {/* Crosshair indicators */}
            <line x1="100" y1="2" x2="100" y2="8" stroke="#00E5FF" strokeWidth="2.5" />
            <line x1="100" y1="192" x2="100" y2="198" stroke="#00E5FF" strokeWidth="2.5" />
            <line x1="2" y1="100" x2="8" y2="100" stroke="#00E5FF" strokeWidth="2.5" />
            <line x1="192" y1="100" x2="198" y2="100" stroke="#00E5FF" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Layer 2: Glowing Middle Circle Border */}
        <div className="absolute inset-2.5 rounded-full border-2 border-[#0066FF] shadow-[0_0_20px_rgba(0,102,255,0.6)]" />

        {/* Layer 3: Inner High-Tech Dark Core matching Image 1 */}
        <div
          className="relative w-[140px] h-[140px] sm:w-[155px] sm:h-[155px] rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 shadow-2xl"
          style={{
            borderColor: isConnected ? '#00FF88' : isConnecting ? '#00E5FF' : isError ? '#FF3155' : '#00E5FF',
            background: 'radial-gradient(circle at 50% 40%, rgba(10, 4, 25, 0.95) 0%, rgba(4, 2, 12, 0.98) 100%)',
            boxShadow: isConnected
              ? 'inset 0 0 25px rgba(0, 255, 136, 0.35), 0 0 30px rgba(0, 255, 136, 0.4)'
              : 'inset 0 0 25px rgba(0, 229, 255, 0.35), 0 0 30px rgba(0, 229, 255, 0.3)',
          }}
        >
          {/* Central Power Glyph in electric cyan */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Power
              className="w-10 h-10 sm:w-11 sm:h-11 text-[#00E5FF] filter drop-shadow-[0_0_10px_#00E5FF] transition-transform duration-300 group-hover:scale-105"
              strokeWidth={2.6}
            />

            {/* Status Label matching Image 1 */}
            <span
              className={`font-orbitron font-black text-xs sm:text-sm tracking-wider uppercase mt-2 ${
                isConnected
                  ? 'text-[#00FF88] text-glow-green'
                  : isConnecting
                  ? 'text-[#00E5FF] text-glow-cyan'
                  : isError
                  ? 'text-[#FF3155] text-glow-red'
                  : 'text-[#00E5FF] text-glow-cyan'
              }`}
            >
              {isConnected
                ? 'CONNECTÉ'
                : isConnecting
                ? 'CONNEXION...'
                : isError
                ? 'ÉCHEC'
                : 'CONNECTER'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
