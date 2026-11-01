/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface PremiumBannerProps {
  onOpenPremium: () => void;
  isVip?: boolean;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  onOpenPremium,
  isVip = false,
}) => {
  return (
    <div
      onClick={() => {
        cyberAudio.playClick();
        onOpenPremium();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenPremium();
      }}
      className="relative mx-1 p-[1px] bg-gradient-to-r from-[#FFAA00] via-[#FF00E5] to-[#00E5FF] rounded-2xl shadow-[0_0_20px_rgba(255,170,0,0.3)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer group select-none overflow-hidden"
    >
      <div className="relative bg-[#09031C]/92 backdrop-blur-md px-3.5 py-3 rounded-2xl flex items-center justify-between gap-2.5">
        {/* Left: Glowing Golden Crown */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center filter drop-shadow-[0_0_10px_#FFAA00] group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#FFAA00]" fill="currentColor">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
              <circle cx="12" cy="4" r="1.5" fill="#FFE600" />
              <circle cx="3" cy="5" r="1.2" fill="#FFE600" />
              <circle cx="21" cy="5" r="1.2" fill="#FFE600" />
            </svg>
          </div>

          {/* Texts */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs sm:text-sm tracking-wide truncate">
              <span className="text-white">Antares VPN</span>
              <span className="text-[#FFE600] text-glow-yellow">Premium</span>
            </div>
            <span className="text-[11px] text-slate-300 font-rajdhani truncate mt-0.5">
              Plus de vitesse. Plus de puissance.
            </span>
          </div>
        </div>

        {/* Right: Passer à Premium > Button matching screenshot */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            cyberAudio.playClick();
            onOpenPremium();
          }}
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00E5FF]/20 via-[#FF00E5]/25 to-[#00E5FF]/20 border border-[#00E5FF] hover:border-[#FF00E5] text-white font-orbitron font-bold text-[10px] tracking-wide flex items-center gap-1 shadow-[0_0_12px_rgba(0,229,255,0.4)] flex-shrink-0 active:scale-95 transition-all"
        >
          <span>{isVip ? 'Gérer VIP' : 'Passer à Premium'}</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
