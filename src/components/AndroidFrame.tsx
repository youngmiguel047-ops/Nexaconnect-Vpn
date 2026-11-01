/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { Wifi } from 'lucide-react';

interface AndroidFrameProps {
  children: ReactNode;
  isPhoneFrame: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isPhoneFrame,
}) => {
  if (!isPhoneFrame) {
    return <div className="w-full min-h-screen relative bg-[#03010B]">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-1 sm:p-4 bg-[#010006]">
      {/* Smartphone chassis matching Screenshot 1 */}
      <div className="relative w-full max-w-[420px] h-[920px] rounded-[52px] bg-[#070314] p-2.5 shadow-[0_0_90px_rgba(0,229,255,0.22)] border-[3px] border-[#1A1035] flex flex-col overflow-hidden">
        {/* Physical side buttons */}
        <div className="absolute -left-[5px] top-32 w-[3px] h-12 bg-slate-700 rounded-l-md pointer-events-none" />
        <div className="absolute -left-[5px] top-48 w-[3px] h-12 bg-slate-700 rounded-l-md pointer-events-none" />
        <div className="absolute -right-[5px] top-40 w-[3px] h-16 bg-slate-700 rounded-r-md pointer-events-none" />

        {/* Screen bezel */}
        <div className="relative w-full h-full rounded-[44px] bg-[#03010B] flex flex-col overflow-hidden border border-[#00E5FF]/20 shadow-inner">
          {/* Status Bar matching Screenshot 1: 9:41 on left, cell bars + wifi + battery 100 on right */}
          <div className="relative z-30 h-9 px-6 pt-2 flex items-center justify-between text-xs font-mono-tech select-none bg-transparent">
            {/* Clock: 9:41 (as in screenshot) */}
            <span className="font-bold tracking-tight text-white text-sm">9:41</span>

            {/* Notch / Speaker line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-20 h-4 rounded-full bg-black/60 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Status Icons matching Screenshot 1: 4 signal bars, Wi-Fi, battery pill with 100 */}
            <div className="flex items-center gap-2 text-white">
              {/* Cellular 4 bars */}
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 h-1.5 bg-white rounded-xs" />
                <div className="w-0.5 h-2 bg-white rounded-xs" />
                <div className="w-0.5 h-2.5 bg-white rounded-xs" />
                <div className="w-0.5 h-3 bg-white rounded-xs" />
              </div>

              {/* Wi-Fi */}
              <Wifi className="w-4 h-4 text-white" strokeWidth={2.4} />

              {/* Battery Pill with '100' inside (matching screenshot 1) */}
              <div className="relative flex items-center">
                <div className="w-6 h-3 rounded-sm border border-white flex items-center justify-center p-0.5">
                  <span className="text-[8px] font-bold text-white font-mono leading-none">100</span>
                </div>
                <div className="w-0.5 h-1.5 bg-white rounded-r-xs -ml-[1px]" />
              </div>
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {children}
          </div>

          {/* Android / iOS Home Indicator bar matching screenshot 1 */}
          <div className="relative z-30 h-4 flex items-center justify-center pointer-events-none pb-1">
            <div className="w-32 h-1 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
};
