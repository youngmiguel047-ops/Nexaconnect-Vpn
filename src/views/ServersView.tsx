/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Star, 
  Zap, 
  Crown, 
  Check, 
  RotateCw, 
  ArrowUpDown,
  Lock,
  FileCode
} from 'lucide-react';
import { VpnServer } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface ServersViewProps {
  servers: VpnServer[];
  activeServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  onToggleFavorite: (serverId: string) => void;
  hasVipAccess: boolean;
  onOpenPremium: () => void;
  onOpenAtrs: () => void;
  onOpenManualVless: () => void;
  onRefreshPings: () => void;
  isPinging: boolean;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  activeServer,
  onSelectServer,
  onToggleFavorite,
  hasVipAccess,
  onOpenPremium,
  onOpenAtrs,
  onOpenManualVless,
  onRefreshPings,
  isPinging,
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'favorites' | 'vip'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ping' | 'load' | 'name'>('ping');

  const filteredServers = useMemo(() => {
    return servers
      .filter((s) => {
        if (activeTab === 'recommended' && !s.isRecommended) return false;
        if (activeTab === 'favorites' && !s.isFavorite) return false;
        if (activeTab === 'vip' && !s.isVip) return false;

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

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-20 no-scrollbar">
      {/* Title & Import / Add VLESS shortcuts */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
        <div>
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide text-glow-cyan">
            Serveurs Antares
          </h2>
          <p className="text-xs text-slate-400 font-rajdhani">
            {servers.length} nœuds mondiaux VLESS & Hysteria 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cyberAudio.playClick();
              onOpenManualVless();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-[#00FF88]/40 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] font-orbitron font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,255,136,0.2)]"
          >
            <span>+ VLESS (.atrs)</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onOpenAtrs();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-[#00E5FF]/40 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-orbitron font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Fichier .atrs</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
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
            onRefreshPings();
          }}
          disabled={isPinging}
          className="p-2 rounded-lg border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 active:scale-95"
          title="Tester la latence en temps réel"
        >
          <RotateCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
        </button>

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

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#070514] px-1 rounded-lg overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'recommended', label: 'Recommandés' },
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
              className={`flex items-center gap-1 px-3 py-2 text-xs font-orbitron font-semibold whitespace-nowrap transition-all border-b-2 ${
                isSelected
                  ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.isVip && <Crown className="w-3 h-3 text-[#FF00E5]" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredServers.map((s) => {
          const isSelected = activeServer.id === s.id;
          const isLocked = s.isVip && !hasVipAccess;

          return (
            <div
              key={s.id}
              onClick={() => {
                if (isLocked) {
                  cyberAudio.playGlitch();
                  onOpenPremium();
                } else {
                  cyberAudio.playClick();
                  onSelectServer(s);
                }
              }}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#00FF88] bg-[#00FF88]/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                  : 'border-slate-800/80 bg-[#080518]/80 hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5'
              }`}
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{s.flag}</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-xs sm:text-sm text-white truncate">
                      {s.name}
                    </span>
                    {s.isVip && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono-tech font-bold bg-[#FF00E5]/20 text-[#FF00E5] border border-[#FF00E5]/40 flex items-center gap-0.5">
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

              {/* Right */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="flex flex-col items-end">
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cyberAudio.playClick();
                    onToggleFavorite(s.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400"
                >
                  <Star
                    className={`w-4 h-4 ${s.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                  />
                </button>

                {isLocked ? (
                  <div className="p-1 rounded bg-[#FF00E5]/20 text-[#FF00E5]" title="Nécessite abonnement VIP">
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
        })}
      </div>
    </div>
  );
};
