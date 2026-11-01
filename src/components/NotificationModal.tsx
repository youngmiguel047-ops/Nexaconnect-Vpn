/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Bell, ShieldCheck, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { VpnNotification } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: VpnNotification[];
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: VpnNotification['type']) => {
    switch (type) {
      case 'success':
        return <ShieldCheck className="w-4 h-4 text-[#00FF88]" />;
      case 'warning':
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-[#FF3155]" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-[#00E5FF]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#090518] border border-[#00E5FF]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0E0824]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
              Journal & Notifications
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberAudio.playClick();
                onMarkAllRead();
              }}
              title="Tout marquer comme lu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <CheckCheck className="w-4 h-4 text-[#00E5FF]" />
            </button>
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-rajdhani text-sm">
              Aucune notification active.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  item.read
                    ? 'border-slate-800/80 bg-black/40'
                    : 'border-[#00E5FF]/30 bg-[#00E5FF]/5 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-orbitron font-bold text-xs text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-mono-tech text-slate-500 flex-shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-rajdhani leading-snug">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060312] border-t border-slate-800 text-center">
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
