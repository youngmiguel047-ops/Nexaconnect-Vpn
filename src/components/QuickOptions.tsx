/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Rocket, Shield, Zap, GitFork } from 'lucide-react';
import { QuickSettings } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface QuickOptionsProps {
  settings: QuickSettings;
  onUpdateSetting: (key: keyof QuickSettings, val: boolean) => void;
  onOpenSplitTunneling: () => void;
}

export const QuickOptions: React.FC<QuickOptionsProps> = ({
  settings,
  onUpdateSetting,
  onOpenSplitTunneling,
}) => {
  const options = [
    {
      key: 'fastMode' as keyof QuickSettings,
      title: 'Mode Rapide',
      activeText: 'Activé',
      inactiveText: 'Désactivé',
      icon: Rocket,
      iconColor: '#FF00E5', // Magenta in Screenshot
      glowBorder: 'from-[#FF00E5]/60 to-[#8B00FF]/40',
    },
    {
      key: 'dnsProtection' as keyof QuickSettings,
      title: 'Protection DNS',
      activeText: 'Activée',
      inactiveText: 'Désactivée',
      icon: Shield,
      iconColor: '#9D00FF', // Purple in Screenshot
      glowBorder: 'from-[#9D00FF]/60 to-[#00E5FF]/40',
    },
    {
      key: 'autoConnect' as keyof QuickSettings,
      title: 'Connexion Auto',
      activeText: 'Activée',
      inactiveText: 'Désactivée',
      icon: Zap,
      iconColor: '#FFAA00', // Gold/amber lightning in Screenshot
      glowBorder: 'from-[#FFAA00]/60 to-[#FF00E5]/40',
    },
    {
      key: 'splitTunneling' as keyof QuickSettings,
      title: 'Split Tunneling',
      activeText: 'Activé',
      inactiveText: 'Désactivé',
      icon: GitFork,
      iconColor: '#00E5FF', // Cyan fork in Screenshot
      glowBorder: 'from-[#00E5FF]/60 to-[#0066FF]/40',
      hasModalAction: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 mx-1 select-none">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = settings[opt.key];

        return (
          <div
            key={opt.key}
            onClick={() => {
              if (opt.hasModalAction && !isActive) {
                onOpenSplitTunneling();
              }
              cyberAudio.playToggle();
              onUpdateSetting(opt.key, !isActive);
            }}
            role="button"
            tabIndex={0}
            className={`relative p-[1px] bg-gradient-to-r ${
              isActive ? opt.glowBorder : 'from-slate-800 to-slate-900'
            } cyber-chamfer-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer`}
          >
            <div className="relative bg-[#070314]/90 backdrop-blur-md p-2.5 cyber-chamfer-sm flex items-center justify-between gap-2 h-full">
              {/* Left: Icon & Texts */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${opt.iconColor}20` }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: opt.iconColor, filter: `drop-shadow(0 0 6px ${opt.iconColor})` }}
                    strokeWidth={2.4}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-orbitron font-bold text-[11px] sm:text-xs text-white truncate">
                    {opt.title}
                  </span>
                  <span
                    className={`text-[10px] font-rajdhani font-bold ${
                      isActive ? 'text-[#00FF88] text-glow-green' : 'text-[#FF3155]'
                    }`}
                  >
                    {isActive ? opt.activeText : opt.inactiveText}
                  </span>
                </div>
              </div>

              {/* Right: Modern Glowing Switch matching Screenshot */}
              <div
                className={`relative w-8 h-4 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0 ${
                  isActive ? 'bg-[#00FF88] shadow-[0_0_8px_#00FF88]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
