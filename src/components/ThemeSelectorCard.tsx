/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Palette, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { NEON_THEMES, NeonTheme, getThemeById } from '../utils/theme';
import { cyberAudio } from '../utils/audio';

interface ThemeSelectorCardProps {
  currentThemeId: string;
  onSelectTheme: (theme: NeonTheme) => void;
}

export const ThemeSelectorCard: React.FC<ThemeSelectorCardProps> = ({
  currentThemeId,
  onSelectTheme,
}) => {
  // Closed by default as explicitly requested by the user
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = getThemeById(currentThemeId);

  const toggleOpen = () => {
    cyberAudio.playClick();
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-xl bg-[#080518] border border-slate-800 transition-all cyber-cut overflow-hidden">
      {/* 
        Accordion Header Button
        Clicking toggles open/closed state.
        The active theme is clearly and prominently shown even when closed.
      */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: activeTheme.isMulticolor ? 'rgba(0, 229, 255, 0.15)' : `${activeTheme.primary}20`,
              boxShadow: activeTheme.isMulticolor 
                ? '0 0 12px rgba(0, 229, 255, 0.4), 0 0 16px rgba(255, 0, 229, 0.3)' 
                : `0 0 12px ${activeTheme.primary}40`,
              border: `1px solid ${activeTheme.isMulticolor ? '#00E5FF80' : `${activeTheme.primary}60`}`,
            }}
          >
            <Palette 
              className="w-5 h-5" 
              style={{ 
                color: activeTheme.primary,
                filter: `drop-shadow(0 0 6px ${activeTheme.glow})`,
              }} 
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-bold text-xs text-white tracking-wider">
                Thème
              </span>
              <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-purple-950/60 text-[#C084FC] border border-purple-500/30">
                11 AMBIANCES
              </span>
            </div>

            {/* Active Theme Name and Swatches preview */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-rajdhani text-slate-400">
                Actif :
              </span>
              <span
                className="font-orbitron font-bold text-xs tracking-wide truncate"
                style={{
                  color: activeTheme.isMulticolor ? '#00E5FF' : activeTheme.primary,
                  textShadow: `0 0 8px ${activeTheme.glow}`,
                }}
              >
                {activeTheme.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Color dots + Chevron indicator */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Swatch dots */}
          <div className="flex items-center -space-x-1">
            {(activeTheme.previewColors || [activeTheme.primary, activeTheme.secondary, activeTheme.glow])
              .slice(0, 4)
              .map((color, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-black/80 shadow-sm"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 4px ${color}`,
                  }}
                />
              ))}
          </div>

          {/* Chevron */}
          <div className="p-1 rounded-lg text-slate-400 group-hover:text-white transition-colors">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-[#00E5FF]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* 
        Collapsible Theme Grid
        Rendered only when isOpen is true (closed by default)
      */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-800/80 animate-in fade-in duration-200">
          <p className="text-[11px] text-slate-400 font-rajdhani pt-1">
            Choisissez votre ambiance néon. Le thème sélectionné est automatiquement sauvegardé et conservé au prochain lancement.
          </p>

          {/* Featured Hero: MULTICOLOR CYBER GLITCH (Theme Principal par Défaut) */}
          {(() => {
            const multicolorTheme = NEON_THEMES[0];
            const isMultiActive = currentThemeId === multicolorTheme.id;

            return (
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playConnect();
                  onSelectTheme(multicolorTheme);
                }}
                className={`relative w-full p-3 rounded-xl border text-left transition-all cursor-pointer overflow-hidden group ${
                  isMultiActive
                    ? 'border-white bg-[#0e0722] shadow-[0_0_22px_rgba(0,229,255,0.45)] ring-1 ring-white/70'
                    : 'border-[#00E5FF]/40 bg-black/50 hover:border-[#00E5FF] hover:bg-black/70'
                }`}
              >
                {/* Rainbow background top accent */}
                <div 
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#9D00FF] via-[#00E5FF] via-[#FF00E5] via-[#FFE600] to-[#00FF88]"
                />

                <div className="flex items-center justify-between gap-2 pt-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-black text-xs sm:text-sm tracking-wider text-white">
                          MULTICOLOR CYBER GLITCH
                        </span>
                        <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00E5FF]/20 to-[#FF00E5]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
                          PAR DÉFAUT
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-rajdhani mt-0.5">
                        Identité visuelle multicolore complète (Violet, Cyan, Magenta, Bleu, Vert, Jaune, Orange, Rouge)
                      </p>
                    </div>
                  </div>

                  {isMultiActive && (
                    <span className="flex items-center gap-1 text-[10px] font-mono-tech font-bold px-2 py-1 rounded-full bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/60 shadow-[0_0_8px_#00FF88]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      ACTIF
                    </span>
                  )}
                </div>

                {/* Spectrum Palette Dots */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono-tech text-slate-400">Spectre :</span>
                  <div className="flex items-center gap-1.5">
                    {multicolorTheme.previewColors?.map((c, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-black/80"
                        style={{
                          backgroundColor: c,
                          boxShadow: `0 0 6px ${c}`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })()}

          {/* Grid of other 10 Neon Glitch Themes */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono-tech uppercase text-slate-500 tracking-wider">
              Autres Ambiances Néon :
            </span>

            <div className="grid grid-cols-2 gap-2">
              {NEON_THEMES.slice(1).map((theme) => {
                const isActive = theme.id === currentThemeId;

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      cyberAudio.playClick();
                      onSelectTheme(theme);
                    }}
                    type="button"
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[82px] overflow-hidden group ${
                      isActive
                        ? 'border-white bg-[#100726] shadow-[0_0_16px_rgba(var(--neon-glow-rgb),0.5)] ring-1 ring-white/60'
                        : 'border-slate-800/80 bg-black/40 hover:border-slate-600 hover:bg-black/60'
                    }`}
                    style={{
                      borderColor: isActive ? theme.primary : undefined,
                    }}
                  >
                    {/* Ambient corner glow on card */}
                    <div
                      className="absolute -right-4 -top-4 w-12 h-12 rounded-full blur-lg opacity-40 pointer-events-none transition-opacity group-hover:opacity-75"
                      style={{ backgroundColor: theme.primary }}
                    />

                    {/* Top row: Name & Active Badge */}
                    <div className="flex items-start justify-between gap-1 w-full relative z-10">
                      <span
                        className="font-orbitron font-bold text-[11px] tracking-wide"
                        style={{
                          color: isActive ? theme.primary : '#E2E8F0',
                          textShadow: isActive ? `0 0 8px ${theme.glow}` : undefined,
                        }}
                      >
                        {theme.name}
                      </span>

                      {isActive && (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-mono-tech font-bold px-1.5 py-0.5 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: `${theme.primary}25`,
                            color: theme.primary,
                            borderColor: theme.primary,
                          }}
                        >
                          <Check className="w-2.5 h-2.5" />
                          ACTIF
                        </span>
                      )}
                    </div>

                    {/* Bottom row: Color swatch circles & subtle subtitle */}
                    <div className="relative z-10 flex items-center justify-between w-full pt-1 border-t border-slate-800/50">
                      <div className="flex items-center gap-1.5">
                        {theme.previewColors?.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-full shadow-sm border border-black/50"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 4px ${color}`,
                            }}
                          />
                        ))}
                      </div>

                      <span className="text-[9px] font-mono-tech text-slate-500 truncate max-w-[65px]">
                        {theme.primary}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
