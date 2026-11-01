/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Star, 
  Zap, 
  Crown, 
  Check, 
  RotateCw, 
  ArrowUpDown,
  Lock,
  Globe
} from 'lucide-react';
import { VpnServer } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface ServerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: VpnServer[];
  activeServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  onToggleFavorite: (serverId: string) => void;
  hasVipAccess?: boolean;
  onOpenPremium?: () => void;
  onOpenManualVless?: () => void;
  onRefreshPings?: () => void;
  isPinging?: boolean;
}

export const ServerListModal: React.FC<ServerListModalProps> = ({
  isOpen,
  onClose,
  servers,
  activeServer,
  onSelectServer,
  onToggleFavorite,
  hasVipAccess = false,
  onOpenPremium,
  onOpenManualVless,
  onRefreshPings,
  isPinging = false,
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'favorites' | 'vip'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ping' | 'load' | 'name'>('ping');

  const filteredServers = useMemo(() => {
    return servers
      .filter((s) => {
        // Tab filter
        if (activeTab === 'recommended' && !s.isRecommended) return false;
        if (activeTab === 'favorites' && !s.isFavorite) return false;
        if (activeTab === 'vip' && !s.isVip) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.country.toLowerCase().includes(q) ||
            s.protocol.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ping') return a.ping - b.ping;
        if (sortBy === 'load') return a.load - b.load;
        return a.name.localeCompare(b.name);
      });
  }, [servers, activeTab, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#070512] border border-[#00E5FF]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0A071A]">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
              Sélection des Serveurs
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Add VLESS .atrs */}
            {onOpenManualVless && (
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onClose();
                  onOpenManualVless();
                }}
                className="px-2 py-1.5 rounded-lg border border-[#00FF88]/40 bg-[#00FF88]/15 text-[#00FF88] text-xs font-orbitron font-bold hover:bg-[#00FF88]/25 transition-all"
              >
                + VLESS (.atrs)
              </button>
            )}

            {/* Ping Refresh Button */}
            <button
              onClick={() => {
                cyberAudio.playClick();
                if (onRefreshPings) onRefreshPings();
              }}
              disabled={isPinging}
              className="p-1.5 rounded-lg border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 active:scale-95 transition-all text-xs font-mono-tech flex items-center gap-1"
              title="Tester la latence de tous les nœuds"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Tester Ping</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Sort */}
        <div className="p-3 bg-[#080516] border-b border-slate-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par pays, ville, protocole..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-xs text-white placeholder-slate-500 font-rajdhani"
            />
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              setSortBy((prev) => (prev === 'ping' ? 'load' : prev === 'load' ? 'name' : 'ping'));
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black/60 border border-slate-700 text-xs font-mono-tech text-slate-300 hover:text-white"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="capitalize">{sortBy}</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 bg-[#05030F] px-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'recommended', label: 'Recommandés' },
            { id: 'all', label: 'Tous les serveurs' },
            { id: 'favorites', label: 'Favoris' },
            { id: 'vip', label: 'VIP Turbo', isVip: true },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-orbitron font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isSelected
                    ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.isVip && <Crown className="w-3 h-3 text-[#FF00E5]" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Server List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px]">
          {filteredServers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-rajdhani text-sm">
              Aucun serveur trouvé pour ce filtre ou cette recherche.
            </div>
          ) : (
            filteredServers.map((s) => {
              const isSelected = activeServer.id === s.id;
              const isLocked = s.isVip && !hasVipAccess;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (isLocked) {
                      cyberAudio.playGlitch();
                      if (onOpenPremium) onOpenPremium();
                    } else {
                      cyberAudio.playClick();
                      onSelectServer(s);
                      onClose();
                    }
                  }}
                  className={`relative p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#00FF88] bg-[#00FF88]/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                      : 'border-slate-800/80 bg-[#0A071A]/70 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{s.flag}</span>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-xs sm:text-sm text-white truncate">
                          {s.name}
                        </span>
                        {s.isVip && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-tech font-bold bg-[#FF00E5]/20 text-[#FF00E5] border border-[#FF00E5]/40 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" />
                            VIP
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-rajdhani truncate">
                        {s.city}, {s.country} • {s.protocol}
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Ping & Load */}
                    <div className="flex flex-col items-end text-right">
                      <div className="flex items-center gap-1">
                        <Zap
                          className={`w-3 h-3 ${
                            s.ping < 50
                              ? 'text-[#00FF88]'
                              : s.ping < 120
                              ? 'text-[#00E5FF]'
                              : 'text-[#FF3155]'
                          }`}
                        />
                        <span
                          className={`text-xs font-mono-tech font-bold ${
                            s.ping < 50
                              ? 'text-[#00FF88]'
                              : s.ping < 120
                              ? 'text-[#00E5FF]'
                              : 'text-[#FF3155]'
                          }`}
                        >
                          {s.ping} ms
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-tech text-slate-500">
                        Charge: {s.load}%
                      </span>
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.playClick();
                        onToggleFavorite(s.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>

                    {/* Selected or Locked Icon */}
                    {isLocked ? (
                      <div className="p-1 rounded-md bg-[#FF00E5]/15 text-[#FF00E5]" title="Nœud réservé aux membres VIP">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : isSelected ? (
                      <div className="p-1 rounded-full bg-[#00FF88] text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#04020C] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredServers.length} serveurs disponibles</span>
          <span className="text-[10px] font-mono-tech text-[#00E5FF]">
            Chiffrement de bout en bout activé
          </span>
        </div>
      </div>
    </div>
  );
};
