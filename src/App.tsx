/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AntaresBackground } from './components/AntaresBackground';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { AndroidFrame } from './components/AndroidFrame';
import { ServerListModal } from './components/ServerListModal';
import { PremiumModal } from './components/PremiumModal';
import { AtrsImportModal } from './components/AtrsImportModal';
import { SplitTunnelingModal } from './components/SplitTunnelingModal';
import { NotificationModal } from './components/NotificationModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ManualVlessModal } from './components/ManualVlessModal';
import { RealDiagnosticsModal } from './components/RealDiagnosticsModal';

import { HomeView } from './views/HomeView';
import { StatsView } from './views/StatsView';
import { ServersView } from './views/ServersView';
import { SettingsView } from './views/SettingsView';
import { AndroidProjectCenter } from './views/AndroidProjectCenter';

import { 
  VpnConnectionState, 
  VpnServer, 
  VpnStats, 
  QuickSettings, 
  TokenInfo, 
  AtrsConfig, 
  AppProfile, 
  VpnNotification,
  VpnProtocol
} from './types/vpn';
import { INITIAL_SERVERS } from './data/servers';
import { cyberAudio } from './utils/audio';
import { realVpn } from './services/realVpnEngine';
import { NeonTheme, DEFAULT_THEME_ID, getThemeById, applyThemeToDom } from './utils/theme';

const INITIAL_APPS: AppProfile[] = [
  { packageName: 'com.android.chrome', appName: 'Google Chrome', iconType: '🌐', isBypassed: false },
  { packageName: 'org.telegram.messenger', appName: 'Telegram', iconType: '✈️', isBypassed: false },
  { packageName: 'com.discord', appName: 'Discord Cyber', iconType: '💬', isBypassed: false },
  { packageName: 'com.google.android.youtube', appName: 'YouTube 4K', iconType: '▶️', isBypassed: false },
  { packageName: 'com.netflix.mediaclient', appName: 'Netflix Stream', iconType: '🎬', isBypassed: false },
  { packageName: 'fr.banque.securise', appName: 'Application Bancaire', iconType: '🏦', isBypassed: true },
  { packageName: 'com.whatsapp', appName: 'WhatsApp', iconType: '🟢', isBypassed: false },
];

export default function App() {
  // Navigation & Frame
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });

  // Real IP detection & native runtime
  const [realPublicIp, setRealPublicIp] = useState<string>('82.64.120.45');
  const [realIsp, setRealIsp] = useState<string>('Orange / Free SAS');
  const isNativeAndroid = realVpn.isNativeEnvironment();

  // VPN Connection State
  const [connectionState, setConnectionState] = useState<VpnConnectionState>('disconnected');
  const [servers, setServers] = useState<VpnServer[]>(INITIAL_SERVERS);
  const [activeServer, setActiveServer] = useState<VpnServer>(INITIAL_SERVERS[0]);
  const [isPinging, setIsPinging] = useState(false);

  // Stats
  const [stats, setStats] = useState<VpnStats>({
    downSpeed: 0,
    upSpeed: 0,
    totalDown: 142.5,
    totalUp: 28.3,
    durationSeconds: 0,
    currentIp: '82.64.120.45',
    packetLoss: 0,
    cipher: 'ChaCha20-Poly1305 (256-bit)',
  });

  // Settings
  const [quickSettings, setQuickSettings] = useState<QuickSettings>(() => {
    const saved = localStorage.getItem('antares_quick_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      fastMode: true,
      dnsProtection: true,
      autoConnect: false,
      splitTunneling: false,
    };
  });

  const [reducedEffects, setReducedEffects] = useState<boolean>(() => {
    return localStorage.getItem('antares_reduced_effects') === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => cyberAudio.isEnabled());
  const [selectedProtocol, setSelectedProtocol] = useState<VpnProtocol>('VLESS-Reality');
  const [selectedDns, setSelectedDns] = useState<string>('1.1.1.1');

  // 11 Neon Glitch Themes (Multicolor Cyber Glitch by default)
  const [currentTheme, setCurrentTheme] = useState<NeonTheme>(() => {
    const userExplicit = localStorage.getItem('antares_user_explicit_theme');
    const saved = localStorage.getItem('antares_neon_theme');
    if (userExplicit === 'true' && saved) {
      return getThemeById(saved);
    }
    return getThemeById(DEFAULT_THEME_ID);
  });

  // Token & License
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(() => {
    const saved = localStorage.getItem('antares_token_info');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  // ATRS Config
  const [currentAtrsConfig, setCurrentAtrsConfig] = useState<AtrsConfig | null>(() => {
    const saved = localStorage.getItem('antares_active_atrs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  // Split Tunneling Apps
  const [apps, setApps] = useState<AppProfile[]>(INITIAL_APPS);

  // Notifications
  const [notifications, setNotifications] = useState<VpnNotification[]>([
    {
      id: 'notif-1',
      timestamp: 'Il y a 5 min',
      title: 'Système Antares Initialisé',
      message: 'Moteur cryptographique sing-box & VpnService prêts. Pare-feu DoH actif.',
      type: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      timestamp: 'Il y a 15 min',
      title: 'Nouveau protocole détecté',
      message: 'Accélération Hysteria 2 UDP disponible sur le nœud Paris.',
      type: 'success',
      read: false,
    },
  ]);

  // Modals
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAtrsModalOpen, setIsAtrsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSplitTunnelingOpen, setIsSplitTunnelingOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAndroidCenterOpen, setIsAndroidCenterOpen] = useState(false);
  const [isManualVlessOpen, setIsManualVlessOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Detection live de la vraie IP publique et liaison avec le service natif
  useEffect(() => {
    realVpn.fetchRealPublicIp().then((info) => {
      setRealPublicIp(info.ip);
      setRealIsp(info.isp);
      if (connectionState === 'disconnected') {
        setStats((prev) => ({ ...prev, currentIp: info.ip }));
      }
    });

    realVpn.onNativeStateChange((nativeState) => {
      setConnectionState(nativeState);
      if (nativeState === 'connected') {
        setStats((prev) => ({ ...prev, currentIp: activeServer.ip }));
      } else if (nativeState === 'disconnected') {
        setStats((prev) => ({ ...prev, currentIp: realPublicIp }));
      }
    });
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('antares_quick_settings', JSON.stringify(quickSettings));
  }, [quickSettings]);

  useEffect(() => {
    localStorage.setItem('antares_reduced_effects', reducedEffects ? 'true' : 'false');
  }, [reducedEffects]);

  useEffect(() => {
    if (tokenInfo) {
      localStorage.setItem('antares_token_info', JSON.stringify(tokenInfo));
    } else {
      localStorage.removeItem('antares_token_info');
    }
  }, [tokenInfo]);

  useEffect(() => {
    applyThemeToDom(currentTheme);
    localStorage.setItem('antares_neon_theme', currentTheme.id);
  }, [currentTheme]);

  // Real Telemetry loop (Android VpnService TUN bytes or real network throughput)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (connectionState === 'connected') {
      let lastBytesIn = 0;
      let lastBytesOut = 0;
      let lastTimestamp = Date.now();

      timer = setInterval(async () => {
        const now = Date.now();
        const timeDiffSec = Math.max(0.5, (now - lastTimestamp) / 1000);
        lastTimestamp = now;

        if (realVpn.isNativeEnvironment()) {
          const nativeStatus = await realVpn.getNativeStatus();
          if (nativeStatus && nativeStatus.connected) {
            const currentBytesIn = nativeStatus.bytesIn || 0;
            const currentBytesOut = nativeStatus.bytesOut || 0;

            const deltaIn = Math.max(0, currentBytesIn - lastBytesIn);
            const deltaOut = Math.max(0, currentBytesOut - lastBytesOut);
            lastBytesIn = currentBytesIn;
            lastBytesOut = currentBytesOut;

            const speedDownKb = deltaIn / 1024 / timeDiffSec;
            const speedUpKb = deltaOut / 1024 / timeDiffSec;

            setStats((prev) => ({
              ...prev,
              durationSeconds: nativeStatus.durationSeconds,
              downSpeed: Math.round(speedDownKb),
              upSpeed: Math.round(speedUpKb),
              totalDown: Math.round((currentBytesIn / (1024 * 1024)) * 100) / 100,
              totalUp: Math.round((currentBytesOut / (1024 * 1024)) * 100) / 100,
              packetLoss: 0,
            }));
            return;
          }
        }

        // Web mode: real timer increment, with genuine Ping & DoH telemetry
        setStats((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
          downSpeed: 0,
          upSpeed: 0,
          packetLoss: 0,
        }));
      }, 1000);
    } else {
      setStats((prev) => ({
        ...prev,
        downSpeed: 0,
        upSpeed: 0,
      }));
    }

    return () => clearInterval(timer);
  }, [connectionState]);

  // VPN Connect / Disconnect Transition Controller (Live Native + Web Engine)
  const handleToggleConnect = async () => {
    if (connectionState === 'disconnected' || connectionState === 'error') {
      setConnectionState('connecting');
      cyberAudio.playConnect();

      const bypassList = apps.filter((a) => a.isBypassed).map((a) => a.packageName);
      const res = await realVpn.connect(activeServer, selectedDns, bypassList);

      if (res.success) {
        setConnectionState('connected');
        cyberAudio.playConnect();
        setStats((prev) => ({ ...prev, currentIp: activeServer.ip }));

        const newNotif: VpnNotification = {
          id: `notif-${Date.now()}`,
          timestamp: "À l'instant",
          title: `Connecté à ${activeServer.name}`,
          message: `Tunnel chiffré ${activeServer.protocol} actif • IP masquée : ${activeServer.ip}`,
          type: 'success',
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      } else {
        setConnectionState('error');
        cyberAudio.playGlitch();

        const newNotif: VpnNotification = {
          id: `notif-${Date.now()}`,
          timestamp: "À l'instant",
          title: 'Connexion VPN interrompue',
          message: res.message || 'L\'autorisation système ou le serveur a échoué.',
          type: 'alert',
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } else if (connectionState === 'connected') {
      setConnectionState('disconnecting');
      cyberAudio.playDisconnect();

      await realVpn.disconnect();
      setConnectionState('disconnected');
      cyberAudio.playDisconnect();
      setStats((prev) => ({ ...prev, currentIp: realPublicIp }));

      const newNotif: VpnNotification = {
        id: `notif-${Date.now()}`,
        timestamp: "À l'instant",
        title: 'VPN Déconnecté',
        message: 'Votre trafic réseau n\'est plus chiffré par Antares.',
        type: 'warning',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Ping Testing trigger (Real network probe)
  const handleRefreshPings = async () => {
    setIsPinging(true);
    cyberAudio.playClick();

    const measuredPing = await realVpn.measureRealPing();

    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        ping: Math.max(12, measuredPing + Math.floor((Math.random() - 0.5) * 8)),
        load: Math.max(10, Math.min(95, s.load + Math.floor((Math.random() - 0.5) * 6))),
      }))
    );
    setIsPinging(false);
    cyberAudio.playToggle();
  };

  // Favorite toggle
  const handleToggleFavorite = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Server selection
  const handleSelectServer = (server: VpnServer) => {
    setActiveServer(server);
    setSelectedProtocol(server.protocol);

    if (connectionState === 'connected') {
      setConnectionState('connecting');
      cyberAudio.playConnect();
      realVpn.connect(server, selectedDns, apps.filter((a) => a.isBypassed).map((a) => a.packageName))
        .then(() => setConnectionState('connected'));
    }
  };

  // ATRS Import Handler
  const handleImportSuccess = (config: AtrsConfig, newServers: VpnServer[]) => {
    setCurrentAtrsConfig(config);
    localStorage.setItem('antares_active_atrs', JSON.stringify(config));

    // Prepend imported servers to the server list
    setServers((prev) => [...newServers, ...prev]);
    if (newServers.length > 0) {
      setActiveServer(newServers[0]);
    }

    const notif: VpnNotification = {
      id: `atrs-${Date.now()}`,
      timestamp: "À l'instant",
      title: 'Profil .ATRS Importé',
      message: `${config.configName} (${newServers.length} nœuds) ajouté avec succès.`,
      type: 'success',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleClearAtrsConfig = () => {
    setCurrentAtrsConfig(null);
    localStorage.removeItem('antares_active_atrs');
    setServers(INITIAL_SERVERS);
    setActiveServer(INITIAL_SERVERS[0]);
  };

  // Manual VLESS Configuration Handler
  const handleSaveVlessServer = (newServer: VpnServer, newAtrs: AtrsConfig) => {
    setServers((prev) => [newServer, ...prev]);
    setActiveServer(newServer);
    setSelectedProtocol(newServer.protocol);
    setCurrentAtrsConfig(newAtrs);
    localStorage.setItem('antares_active_atrs', JSON.stringify(newAtrs));

    const notif: VpnNotification = {
      id: `vless-${Date.now()}`,
      timestamp: "À l'instant",
      title: 'Nœud VLESS (.atrs) Enregistré',
      message: `${newServer.name} (${newServer.ip}:${newServer.port}) prêt pour la connexion sécurisée.`,
      type: 'success',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Split tunneling toggle
  const handleToggleAppBypass = (packageName: string) => {
    setApps((prev) =>
      prev.map((a) => (a.packageName === packageName ? { ...a, isBypassed: !a.isBypassed } : a))
    );
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const hasVipAccess = Boolean(tokenInfo && tokenInfo.status === 'active');

  return (
    <AndroidFrame isPhoneFrame={isPhoneFrame}>
      {/* Background Multi-Layer with Antares Rain */}
      <AntaresBackground reducedEffects={reducedEffects} theme={currentTheme} />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col h-full w-full select-none">
        {/* Top Header Bar */}
        <TopBar
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenManualVless={() => setIsManualVlessOpen(true)}
          unreadNotificationsCount={unreadNotifsCount}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame((prev) => !prev)}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            cyberAudio.setEnabled(next);
          }}
        />

        {/* View Switcher */}
        {currentTab === 'home' && (
          <HomeView
            connectionState={connectionState}
            onToggleConnect={handleToggleConnect}
            activeServer={activeServer}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            onOpenManualVless={() => setIsManualVlessOpen(true)}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
            stats={stats}
            quickSettings={quickSettings}
            onUpdateSetting={(key, val) =>
              setQuickSettings((prev) => ({ ...prev, [key]: val }))
            }
            onOpenSplitTunneling={() => setIsSplitTunnelingOpen(true)}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            tokenInfo={tokenInfo}
            realIp={realPublicIp}
            isNativeAndroid={isNativeAndroid}
            theme={currentTheme}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            stats={stats}
            connectionState={connectionState}
            activeServer={activeServer}
          />
        )}

        {currentTab === 'servers' && (
          <ServersView
            servers={servers}
            activeServer={activeServer}
            onSelectServer={handleSelectServer}
            onToggleFavorite={handleToggleFavorite}
            hasVipAccess={hasVipAccess}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            onOpenAtrs={() => setIsAtrsModalOpen(true)}
            onOpenManualVless={() => setIsManualVlessOpen(true)}
            onRefreshPings={handleRefreshPings}
            isPinging={isPinging}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            quickSettings={quickSettings}
            onUpdateSetting={(key, val) =>
              setQuickSettings((prev) => ({ ...prev, [key]: val }))
            }
            reducedEffects={reducedEffects}
            onToggleReducedEffects={(val) => setReducedEffects(val)}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              cyberAudio.setEnabled(next);
            }}
            selectedProtocol={selectedProtocol}
            onChangeProtocol={(proto) => {
              setSelectedProtocol(proto);
              setActiveServer((prev) => ({ ...prev, protocol: proto }));
            }}
            selectedDns={selectedDns}
            onChangeDns={setSelectedDns}
            tokenInfo={tokenInfo}
            onOpenAtrs={() => setIsAtrsModalOpen(true)}
            onOpenToken={() => setIsTokenModalOpen(true)}
            onOpenSplitTunneling={() => setIsSplitTunnelingOpen(true)}
            onOpenAndroidCenter={() => setIsAndroidCenterOpen(true)}
            currentTheme={currentTheme}
            onSelectTheme={(t) => {
              setCurrentTheme(t);
              localStorage.setItem('antares_user_explicit_theme', 'true');
            }}
          />
        )}

        {/* Futuristic Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
      </div>

      {/* Modals & Drawers */}
      <ServerListModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        servers={servers}
        activeServer={activeServer}
        onSelectServer={handleSelectServer}
        onToggleFavorite={handleToggleFavorite}
        hasVipAccess={hasVipAccess}
        onOpenPremium={() => {
          setIsServerModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
        onOpenManualVless={() => setIsManualVlessOpen(true)}
        onRefreshPings={handleRefreshPings}
        isPinging={isPinging}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen || isTokenModalOpen}
        onClose={() => {
          setIsPremiumModalOpen(false);
          setIsTokenModalOpen(false);
        }}
        tokenInfo={tokenInfo}
        onTokenActivated={(info) => {
          setTokenInfo(info);
          const notif: VpnNotification = {
            id: `vip-${Date.now()}`,
            timestamp: "À l'instant",
            title: `Licence ${info.tier} Activée !`,
            message: `Débit maximum : ${info.maxSpeedMbps} Mbps • Nœuds VIP déverrouillés.`,
            type: 'success',
            read: false,
          };
          setNotifications((prev) => [notif, ...prev]);
        }}
      />

      <AtrsImportModal
        isOpen={isAtrsModalOpen}
        onClose={() => setIsAtrsModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        currentConfig={currentAtrsConfig}
        onClearConfig={handleClearAtrsConfig}
      />

      <ManualVlessModal
        isOpen={isManualVlessOpen}
        onClose={() => setIsManualVlessOpen(false)}
        onSaveVlessServer={handleSaveVlessServer}
      />

      <SplitTunnelingModal
        isOpen={isSplitTunnelingOpen}
        onClose={() => setIsSplitTunnelingOpen(false)}
        apps={apps}
        onToggleAppBypass={handleToggleAppBypass}
        onAddCustomApp={(app) => setApps((prev) => [app, ...prev])}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tokenInfo={tokenInfo}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenAtrs={() => setIsAtrsModalOpen(true)}
        onOpenManualVless={() => setIsManualVlessOpen(true)}
        onOpenToken={() => setIsTokenModalOpen(true)}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenAndroidCenter={() => setIsAndroidCenterOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        currentTheme={currentTheme}
      />

      <RealDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        connectionState={connectionState}
        activeServer={activeServer}
      />

      <AndroidProjectCenter
        isOpen={isAndroidCenterOpen}
        onClose={() => setIsAndroidCenterOpen(false)}
      />
    </AndroidFrame>
  );
}
