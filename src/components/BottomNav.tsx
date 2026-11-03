/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, BarChart2, Server, Settings } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

export type NavTab = 'home' | 'stats' | 'servers' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Accueil', icon: Home },
    { id: 'stats' as NavTab, label: 'Statistiques', icon: BarChart2 },
    { id: 'servers' as NavTab, label: 'Serveurs', icon: Server },
    { id: 'settings' as NavTab, label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="relative z-30 w-full px-2 py-1.5 select-none">
      {/* Chamfered Hexagonal Container matching Screenshot 1 */}
      <div className="relative p-[1px] bg-gradient-to-r from-[#8B00FF] via-[#FF00E5] to-[#8B00FF] cyber-chamfer-md shadow-[0_-5px_25px_rgba(139,0,255,0.4)]">
        <div className="relative bg-[#070214]/95 backdrop-blur-xl px-2 py-2 cyber-chamfer-md grid grid-cols-4 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playClick();
                  onTabChange(tab.id);
                }}
                className="relative flex flex-col items-center justify-center py-1 transition-all cursor-pointer min-h-[44px]"
                style={{
                  color: isSelected ? 'var(--neon-primary)' : '#94A3B8',
                }}
              >
                {/* Icon */}
                <Icon
                  className="w-5 h-5 transition-transform duration-200"
                  style={{
                    color: isSelected ? 'var(--neon-primary)' : '#94A3B8',
                    filter: isSelected ? 'drop-shadow(0 0 6px var(--neon-glow))' : undefined,
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  }}
                  strokeWidth={isSelected ? 2.5 : 2}
                />

                {/* Label */}
                <span
                  className="text-[11px] font-rajdhani font-bold tracking-wide mt-0.5"
                  style={{
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    textShadow: isSelected ? '0 0 8px var(--neon-glow)' : undefined,
                  }}
                >
                  {tab.label}
                </span>

                {/* Underline indicator */}
                {isSelected && (
                  <div 
                    className="absolute -bottom-1 w-6 h-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--neon-primary)',
                      boxShadow: '0 0 8px var(--neon-glow)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
