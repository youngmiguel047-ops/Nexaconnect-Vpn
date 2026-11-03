/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Globe, 
  FileCode,
  Zap,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Network,
  Sliders,
  Radio,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import { VpnServer, AtrsConfig, TransportType, SecurityType, VpnProtocol } from '../types/vpn';
import { 
  parseVlessInput, 
  parsedVlessToVpnServer, 
  parsedVlessToAtrsConfig, 
  ParsedVlessData,
  DARK_TUNNEL_REFERENCE_PROFILE,
  safeDecodeURIComponent
} from '../utils/vlessParser';
import { cyberAudio } from '../utils/audio';

interface ManualVlessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVlessServer: (server: VpnServer, atrsConfig: AtrsConfig) => void;
}

export const ManualVlessModal: React.FC<ManualVlessModalProps> = ({
  isOpen,
  onClose,
  onSaveVlessServer,
}) => {
  // 3 Onglets principaux
  const [activeTab, setActiveTab] = useState<'form' | 'uri' | 'preview'>('form');

  // Accordéons de la section Formulaire
  const [openSections, setOpenSections] = useState<{
    serverInfo: boolean;
    transport: boolean;
    security: boolean;
    vless: boolean;
    routing: boolean;
    advanced: boolean;
  }>({
    serverInfo: true,
    transport: true,
    security: true,
    vless: true,
    routing: false,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    cyberAudio.playClick();
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Section A : Informations du serveur
  const [serverName, setServerName] = useState('Antares VLESS Tokyo Reality');
  const [flag, setFlag] = useState('🇯🇵');
  const [city, setCity] = useState('Tokyo');
  const [country, setCountry] = useState('Japon');
  const [host, setHost] = useState('133.242.18.99');
  const [port, setPort] = useState('443');
  const [protocol, setProtocol] = useState<VpnProtocol>('VLESS');
  const [uuid, setUuid] = useState('b831381d-6324-4d53-ad4f-8cda48b30811');
  const [emailRemark, setEmailRemark] = useState('');

  // Section B : Protocole et transport
  const [transport, setTransport] = useState<TransportType>('ws');
  const [wsPath, setWsPath] = useState('/@abess237');
  const [wsHost, setWsHost] = useState('abess-ops1-3540044404.us-east4.run.app');
  const [customHeadersText, setCustomHeadersText] = useState('User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  const [grpcServiceName, setGrpcServiceName] = useState('');

  // Section C : Sécurité et camouflage TLS
  const [security, setSecurity] = useState<SecurityType>('tls');
  const [sni, setSni] = useState('crashlyticsreports-pa.googleapis.com');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [alpn, setAlpn] = useState('h2,http/1.1');
  const [allowInsecure, setAllowInsecure] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [shortId, setShortId] = useState('');
  const [spiderX, setSpiderX] = useState('');

  // Section D : Paramètres VLESS
  const [flow, setFlow] = useState('');
  const [encryption, setEncryption] = useState('none');
  const [mux, setMux] = useState(true);
  const [muxConcurrency, setMuxConcurrency] = useState('8');
  const [muxMode, setMuxMode] = useState('h2mux');

  // Section E : Réseau et routage
  const [dnsPrimary, setDnsPrimary] = useState('1.1.1.1');
  const [dnsSecondary, setDnsSecondary] = useState('8.8.8.8');
  const [dnsCustom, setDnsCustom] = useState('');
  const [enableIpv4, setEnableIpv4] = useState(true);
  const [enableIpv6, setEnableIpv6] = useState(true);
  const [tunMtu, setTunMtu] = useState('1420');
  const [routingMode, setRoutingMode] = useState<'global' | 'bypass_lan' | 'custom'>('global');
  const [bypassLan, setBypassLan] = useState(true);
  const [splitTunneling, setSplitTunneling] = useState(false);

  // Section F : Options avancées
  const [connectTimeout, setConnectTimeout] = useState('5000');
  const [readTimeout, setReadTimeout] = useState('15000');
  const [keepAlive, setKeepAlive] = useState('15');
  const [fragmentation, setFragmentation] = useState(false);
  const [customJson, setCustomJson] = useState('');
  const [extraParams, setExtraParams] = useState<Record<string, string>>({});

  // Onglet 2 : Coller un lien VLESS
  const [rawUri, setRawUri] = useState('');
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [detectedData, setDetectedData] = useState<ParsedVlessData | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Synchronisation dynamique lors de la frappe dans le champ Coller
  useEffect(() => {
    const trimmed = rawUri.trim();
    if (!trimmed) {
      setDetectedData(null);
      setParseStatus(null);
      return;
    }

    try {
      const parsed = parseVlessInput(trimmed);
      if (parsed.isValid) {
        setDetectedData(parsed);
        setParseStatus(`Lien validé : ${parsed.serverName} (${parsed.host}:${parsed.port})`);
        setStatusType('success');
      } else {
        setDetectedData(null);
        if (parsed.errorMessage) {
          setParseStatus(parsed.errorMessage);
          setStatusType('error');
        }
      }
    } catch (err: any) {
      setDetectedData(null);
      setParseStatus(`Erreur de syntaxe : ${err?.message || 'Lien invalide'}`);
      setStatusType('error');
    }
  }, [rawUri]);

  if (!isOpen) return null;

  // Charge le profil de référence Dark Tunnel (@abess237)
  const handleLoadDarkTunnel = () => {
    cyberAudio.playConnect();
    applyDataToForm(DARK_TUNNEL_REFERENCE_PROFILE);
    setParseStatus('Profil de référence Dark Tunnel (@abess237) injecté avec succès.');
    setStatusType('success');
    setActiveTab('form');
  };

  // Charge un modèle VLESS-Reality standard
  const handleLoadRealityExample = () => {
    cyberAudio.playConnect();
    setServerName('Antares Cyber Zurich Reality');
    setHost('179.43.142.12');
    setPort('443');
    setUuid('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6');
    setProtocol('VLESS-Reality');
    setTransport('tcp');
    setSecurity('reality');
    setSni('gateway.icloud.com');
    setFingerprint('chrome');
    setPublicKey('11aa22bb33cc44dd55ee66ff77889900aabbccddeeff');
    setShortId('fe8901');
    setFlow('xtls-rprx-vision');
    setCountry('Suisse');
    setCity('Zurich');
    setFlag('🇨🇭');
    setMux(false);
    setParseStatus('Modèle VLESS Reality Suisse chargé avec succès.');
    setStatusType('success');
    setActiveTab('form');
  };

  // Remplir le formulaire avec un ParsedVlessData
  const applyDataToForm = (d: ParsedVlessData) => {
    if (d.serverName) setServerName(d.serverName);
    if (d.flag) setFlag(d.flag);
    if (d.city) setCity(d.city);
    if (d.country) setCountry(d.country);
    if (d.host) setHost(d.host);
    if (d.port) setPort(d.port.toString());
    if (d.protocol) setProtocol(d.protocol);
    if (d.uuid) setUuid(d.uuid);
    if (d.email) setEmailRemark(d.email);

    if (d.transport) setTransport(d.transport);
    if (d.wsPath) setWsPath(d.wsPath);
    if (d.wsHost !== undefined) setWsHost(d.wsHost);
    if (d.grpcServiceName) setGrpcServiceName(d.grpcServiceName);

    if (d.security) setSecurity(d.security);
    if (d.sni) setSni(d.sni);
    if (d.fingerprint) setFingerprint(d.fingerprint);
    if (d.alpn) setAlpn(d.alpn);
    setAllowInsecure(Boolean(d.allowInsecure));
    if (d.publicKey) setPublicKey(d.publicKey);
    if (d.shortId) setShortId(d.shortId);
    if (d.spiderX) setSpiderX(d.spiderX);

    if (d.flow) setFlow(d.flow);
    setMux(Boolean(d.mux));
    if (d.muxConcurrency) setMuxConcurrency(d.muxConcurrency.toString());

    if (d.dnsPrimary) setDnsPrimary(d.dnsPrimary);
    if (d.dnsSecondary) setDnsSecondary(d.dnsSecondary);
    if (d.mtu) setTunMtu(d.mtu.toString());
    if (d.extraParams) setExtraParams(d.extraParams);
  };

  // Coller depuis le presse-papier
  const handlePasteFromClipboard = async () => {
    cyberAudio.playClick();
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawUri(text);
          const parsed = parseVlessInput(text);
          if (parsed.isValid) {
            setDetectedData(parsed);
            setParseStatus(`Lien détecté : ${parsed.serverName}`);
            setStatusType('success');
          }
        }
      }
    } catch {
      setParseStatus('Presse-papier inaccessible. Veuillez coller le texte directement.');
      setStatusType('info');
    }
  };

  // Analyser et remplir le formulaire
  const handleAnalyzeAndFill = () => {
    cyberAudio.playClick();
    const trimmed = rawUri.trim();
    if (!trimmed) {
      setParseStatus('Veuillez d\'abord saisir ou coller un lien VLESS.');
      setStatusType('error');
      cyberAudio.playGlitch();
      return;
    }

    const parsed = parseVlessInput(trimmed);
    if (!parsed.isValid) {
      setParseStatus(parsed.errorMessage || 'Lien VLESS invalide.');
      setStatusType('error');
      cyberAudio.playGlitch();
      return;
    }

    applyDataToForm(parsed);
    setDetectedData(parsed);
    setActiveTab('form');
    setParseStatus(`Configuration VLESS injectée avec succès : ${parsed.serverName}`);
    setStatusType('success');
    cyberAudio.playConnect();
  };

  // Parser les headers personnalisés
  const parseCustomHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (!customHeadersText.trim()) return headers;
    const lines = customHeadersText.split('\n');
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (k) headers[k] = v;
      }
    }
    return headers;
  };

  // Construire l'objet VpnServer pour l'application
  const buildVpnServerObject = (): VpnServer => {
    return {
      id: `vless-manual-${Date.now()}`,
      name: serverName || 'Serveur VLESS Antares',
      city: city || 'Serveur Personnalisé',
      country: country || 'Cyber Node',
      countryCode: 'CFG',
      flag: flag || '⚡',
      ping: Math.floor(18 + Math.random() * 25),
      load: Math.floor(15 + Math.random() * 25),
      protocol: protocol,
      ip: host || '185.190.142.66',
      port: parseInt(port, 10) || 443,
      isVip: true,
      isRecommended: true,
      isFavorite: true,

      uuid: uuid || '@abess237',
      email: emailRemark,
      transport: transport,
      wsPath: wsPath,
      wsHost: wsHost,
      customHeaders: parseCustomHeaders(),
      security: security,
      sni: sni,
      fingerprint: fingerprint,
      alpn: alpn,
      allowInsecure: allowInsecure,
      publicKey: publicKey,
      shortId: shortId,
      spiderX: spiderX,
      flow: flow,
      encryption: encryption,
      mux: mux,
      muxConcurrency: parseInt(muxConcurrency, 10) || 8,
      muxMode: muxMode,
      dnsPrimary: dnsPrimary,
      dnsSecondary: dnsSecondary,
      dnsCustom: dnsCustom,
      enableIpv4: enableIpv4,
      enableIpv6: enableIpv6,
      mtu: parseInt(tunMtu, 10) || 1420,
      routingMode: routingMode,
      bypassLan: bypassLan,
      splitTunneling: splitTunneling,
      connectTimeout: parseInt(connectTimeout, 10) || 5000,
      readTimeout: parseInt(readTimeout, 10) || 15000,
      keepAlive: parseInt(keepAlive, 10) || 15,
      fragmentation: fragmentation,
      customJson: customJson,
      extraParams: extraParams,
    };
  };

  // Construire la spécification ATRS
  const buildAtrsObject = (): AtrsConfig => {
    const maskedUuid = uuid && uuid.length > 6 
      ? `${uuid.substring(0, 3)}••••••••${uuid.substring(uuid.length - 3)}` 
      : '••••••••';

    return {
      version: '1.3.0',
      configName: serverName || 'Configuration VLESS Antares',
      author: 'Antares Cyber Security',
      createdAt: new Date().toISOString(),
      signature: 'ECDSA-P256-ANTARES-VLESS-MANUAL',
      servers: [
        {
          name: serverName || 'Serveur VLESS',
          server: host || '185.190.142.66',
          port: parseInt(port, 10) || 443,
          protocol: protocol,
          uuidMasked: maskedUuid,
          transport: transport,
          network: transport,
          security: security,
          tls: security !== 'none',
          wsPath: wsPath,
          wsHost: wsHost,
          sni: sni,
          fingerprint: fingerprint,
          publicKey: publicKey,
          shortId: shortId,
          flow: flow,
          mux: mux,
        },
      ],
      dns: {
        primary: dnsPrimary || '1.1.1.1',
        fallback: dnsSecondary || '8.8.8.8',
        custom: dnsCustom,
      },
      routing: {
        bypassLan: bypassLan,
        blockAds: true,
        routingMode: routingMode,
        enableIpv4: enableIpv4,
        enableIpv6: enableIpv6,
        mtu: parseInt(tunMtu, 10) || 1420,
      },
      advanced: {
        connectTimeout: parseInt(connectTimeout, 10) || 5000,
        keepAlive: parseInt(keepAlive, 10) || 15,
        extraParams: extraParams,
      },
    };
  };

  // Enregistrer et activer le serveur pour la connexion réelle
  const handleSaveAndActivate = () => {
    try {
      cyberAudio.playConnect();

      // Si l'utilisateur est sur l'onglet Coller et qu'un lien est présent, tenter de l'analyser
      if (activeTab === 'uri' && rawUri.trim()) {
        const parsed = parseVlessInput(rawUri.trim());
        if (parsed.isValid) {
          const srv = parsedVlessToVpnServer(parsed);
          const atrs = parsedVlessToAtrsConfig(parsed);
          onSaveVlessServer(srv, atrs);
          onClose();
          return;
        }
      }

      const srv = buildVpnServerObject();
      const atrs = buildAtrsObject();
      onSaveVlessServer(srv, atrs);
      onClose();
    } catch (err: any) {
      setParseStatus(`Erreur de validation : ${err?.message || 'Paramètres incorrects'}`);
      setStatusType('error');
      cyberAudio.playGlitch();
    }
  };

  // Exporter / Télécharger le profil .atrs
  const handleExportAtrs = () => {
    cyberAudio.playClick();
    try {
      const atrs = buildAtrsObject();
      const fullAtrs = {
        magic: 'ATRS_CYBER_SPEC',
        ...atrs,
        vlessPayload: {
          server: host,
          port: parseInt(port, 10) || 443,
          uuid: uuid,
          transport: transport,
          wsPath: wsPath,
          wsHost: wsHost,
          security: security,
          sni: sni,
          fingerprint: fingerprint,
          alpn: alpn,
          allowInsecure: allowInsecure,
          publicKey: publicKey,
          shortId: shortId,
          spiderX: spiderX,
          flow: flow,
          mux: mux,
          dnsPrimary: dnsPrimary,
          dnsSecondary: dnsSecondary,
          mtu: parseInt(tunMtu, 10) || 1420,
        },
      };

      const jsonStr = JSON.stringify(fullAtrs, null, 2);

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fileName = (serverName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'antares_vless') + '.atrs';
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        } catch {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonStr);
          }
        }
      }

      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch {
      cyberAudio.playGlitch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#070314] border border-[#00E5FF]/50 shadow-[0_0_60px_rgba(0,229,255,0.3)] overflow-hidden">
        
        {/* Header Cyberpunk */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0E0622]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_12px_#00E5FF]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide">
                  Configuration Serveur VPN
                </h3>
                <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40">
                  VLESS & REALITY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Connexion réelle Android VpnService • Interface TUN • WebSocket & REALITY
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Onglets Principaux */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-[#05020D] text-xs font-orbitron font-semibold">
          <button
            onClick={() => {
              cyberAudio.playClick();
              setActiveTab('form');
            }}
            className={`py-3 px-2 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 shadow-[inset_0_-2px_8px_rgba(0,229,255,0.2)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="truncate">1. Formulaire VLESS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              setActiveTab('uri');
            }}
            className={`py-3 px-2 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'uri'
                ? 'border-[#FF00E5] text-[#FF00E5] bg-[#FF00E5]/10 shadow-[inset_0_-2px_8px_rgba(255,0,229,0.2)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="truncate">2. Coller un lien VLESS</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              setActiveTab('preview');
            }}
            className={`py-3 px-2 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10 shadow-[inset_0_-2px_8px_rgba(0,255,136,0.2)]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="truncate">3. Aperçu .ATRS</span>
          </button>
        </div>

        {/* Barre de modèles rapides */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-black/40 text-[11px] font-mono-tech">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Modèles vérifiés :</span>
            <button
              onClick={handleLoadDarkTunnel}
              className="px-2 py-0.5 rounded bg-[#FF00E5]/15 text-[#FF00E5] hover:bg-[#FF00E5]/25 border border-[#FF00E5]/40 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              title="Charge les paramètres exacts du profil Dark Tunnel (@abess237)"
            >
              <Zap className="w-3 h-3 text-[#FF00E5]" />
              Dark Tunnel (@abess237)
            </button>
            <button
              onClick={handleLoadRealityExample}
              className="px-2 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#00E5FF]" />
              Reality Suisse
            </button>
          </div>

          <span className="hidden sm:inline text-slate-500">TUN MTU 1420</span>
        </div>

        {/* Message de statut */}
        {parseStatus && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-lg text-xs font-mono-tech flex items-center gap-2 ${
              statusType === 'success'
                ? 'bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88]'
                : statusType === 'error'
                ? 'bg-[#FF3155]/15 border border-[#FF3155]/40 text-[#FF3155]'
                : 'bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF]'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate">{parseStatus}</span>
          </div>
        )}

        {/* Corps des onglets défilable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-rajdhani">

          {/* ========================================================= */}
          {/* ONGLET 1 : FORMULAIRE VLESS AVEC SECTIONS REPLIABLES     */}
          {/* ========================================================= */}
          {activeTab === 'form' && (
            <div className="space-y-3">

              {/* SECTION A : INFORMATIONS DU SERVEUR */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('serverInfo')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Server className="w-4 h-4 text-[#00E5FF]" />
                    <span>A. Informations du serveur</span>
                  </div>
                  {openSections.serverInfo ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.serverInfo && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Nom du serveur
                        </label>
                        <input
                          type="text"
                          value={serverName}
                          onChange={(e) => setServerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech"
                          placeholder="ex: Dark Tunnel VLESS"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                            Drapeau
                          </label>
                          <input
                            type="text"
                            value={flag}
                            onChange={(e) => setFlag(e.target.value)}
                            className="w-full px-2 py-2 text-center rounded-lg bg-black/60 border border-slate-700 text-lg"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                            Ville / Pays
                          </label>
                          <input
                            type="text"
                            value={`${city}, ${country}`}
                            onChange={(e) => {
                              const parts = e.target.value.split(',');
                              if (parts[0]) setCity(parts[0].trim());
                              if (parts[1]) setCountry(parts[1].trim());
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 text-white"
                            placeholder="Council Bluffs, USA"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Adresse IP ou Domaine
                        </label>
                        <input
                          type="text"
                          value={host}
                          onChange={(e) => setHost(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech"
                          placeholder="192.179.18.100 ou domain.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Port
                        </label>
                        <input
                          type="number"
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech"
                          placeholder="443"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Protocole
                        </label>
                        <select
                          value={protocol}
                          onChange={(e) => setProtocol(e.target.value as VpnProtocol)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-[#00E5FF] font-mono-tech"
                        >
                          <option value="VLESS">VLESS (Dark Tunnel standard)</option>
                          <option value="VLESS-Reality">VLESS-Reality</option>
                          <option value="VMess">VMess</option>
                          <option value="Trojan">Trojan</option>
                          <option value="Shadowsocks">Shadowsocks</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Email / Remarque facultative
                        </label>
                        <input
                          type="text"
                          value={emailRemark}
                          onChange={(e) => setEmailRemark(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 text-white font-mono-tech"
                          placeholder="ex: abess237@darktunnel.net"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                        UUID / Identifiant Client (ex: @abess237 ou UUID v4)
                      </label>
                      <input
                        type="text"
                        value={uuid}
                        onChange={(e) => setUuid(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-[#00FF88] font-mono-tech tracking-wider"
                        placeholder="@abess237"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B : PROTOCOLE ET TRANSPORT */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('transport')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Network className="w-4 h-4 text-[#FF00E5]" />
                    <span>B. Protocole et transport</span>
                  </div>
                  {openSections.transport ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.transport && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div>
                      <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                        Type de transport réseau
                      </label>
                      <select
                        value={transport}
                        onChange={(e) => setTransport(e.target.value as TransportType)}
                        className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-[#FF00E5] font-mono-tech"
                      >
                        <option value="ws">WebSocket (Dark Tunnel)</option>
                        <option value="tcp">TCP Standard</option>
                        <option value="h2">HTTP/2</option>
                        <option value="grpc">gRPC</option>
                        <option value="httpupgrade">HTTP Upgrade</option>
                        <option value="xhttp">XHTTP</option>
                      </select>
                    </div>

                    {transport === 'ws' && (
                      <div className="p-3 rounded-lg bg-black/50 border border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                              WebSocket Path
                            </label>
                            <input
                              type="text"
                              value={wsPath}
                              onChange={(e) => setWsPath(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                              placeholder="/@abess237"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                              Header Host (Indépendant du SNI)
                            </label>
                            <input
                              type="text"
                              value={wsHost}
                              onChange={(e) => setWsHost(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-[#00E5FF] font-mono-tech"
                              placeholder="abess-ops1-3540044404.us-east4.run.app"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                            Headers HTTP personnalisés (Clé: Valeur par ligne)
                          </label>
                          <textarea
                            rows={2}
                            value={customHeadersText}
                            onChange={(e) => setCustomHeadersText(e.target.value)}
                            className="w-full p-2.5 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech text-xs resize-none"
                            placeholder="User-Agent: Mozilla/5.0..."
                          />
                        </div>
                      </div>
                    )}

                    {transport === 'grpc' && (
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Service Name gRPC
                        </label>
                        <input
                          type="text"
                          value={grpcServiceName}
                          onChange={(e) => setGrpcServiceName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="vless-grpc"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION C : SÉCURITÉ ET CAMOUFLAGE TLS */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('security')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Lock className="w-4 h-4 text-[#00FF88]" />
                    <span>C. Sécurité et camouflage TLS</span>
                  </div>
                  {openSections.security ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.security && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Type de sécurité
                        </label>
                        <select
                          value={security}
                          onChange={(e) => setSecurity(e.target.value as SecurityType)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-[#00FF88] font-mono-tech"
                        >
                          <option value="tls">TLS Standard (Dark Tunnel)</option>
                          <option value="reality">REALITY (Anti-Censure Avancé)</option>
                          <option value="none">Aucune (None)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          SNI / Server Name
                        </label>
                        <input
                          type="text"
                          value={sni}
                          onChange={(e) => setSni(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="crashlyticsreports-pa.googleapis.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Fingerprint TLS (fp)
                        </label>
                        <select
                          value={fingerprint}
                          onChange={(e) => setFingerprint(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                        >
                          <option value="chrome">chrome</option>
                          <option value="firefox">firefox</option>
                          <option value="safari">safari</option>
                          <option value="ios">ios</option>
                          <option value="randomized">randomized</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          ALPN (Application-Layer Protocol Negotiation)
                        </label>
                        <input
                          type="text"
                          value={alpn}
                          onChange={(e) => setAlpn(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="h2,http/1.1"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="allowInsecureCheck"
                          checked={allowInsecure}
                          onChange={(e) => setAllowInsecure(e.target.checked)}
                          className="rounded bg-black/80 border-slate-700 text-[#FF3155] focus:ring-0"
                        />
                        <label htmlFor="allowInsecureCheck" className="text-xs text-slate-300 cursor-pointer">
                          Allow Insecure (Désactivé par défaut)
                        </label>
                      </div>
                    </div>

                    {/* Champs REALITY conditionnels */}
                    {security === 'reality' && (
                      <div className="p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 space-y-3">
                        <div className="text-xs font-mono-tech font-bold text-[#00FF88] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Paramètres Camouflage REALITY</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                            Reality Public Key (pbk)
                          </label>
                          <input
                            type="text"
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-[#00FF88] font-mono-tech"
                            placeholder="Clé publique X25519..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                              Reality Short ID (sid)
                            </label>
                            <input
                              type="text"
                              value={shortId}
                              onChange={(e) => setShortId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                              placeholder="6ba855d1"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                              Reality SpiderX (spx)
                            </label>
                            <input
                              type="text"
                              value={spiderX}
                              onChange={(e) => setSpiderX(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                              placeholder="/"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION D : PARAMÈTRES VLESS */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('vless')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>D. Paramètres VLESS & Mux</span>
                  </div>
                  {openSections.vless ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.vless && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Flow
                        </label>
                        <select
                          value={flow}
                          onChange={(e) => setFlow(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                        >
                          <option value="">Aucun (None - requis pour WebSocket/Dark Tunnel)</option>
                          <option value="xtls-rprx-vision">xtls-rprx-vision (Reality TCP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Encryption
                        </label>
                        <input
                          type="text"
                          value={encryption}
                          onChange={(e) => setEncryption(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="none"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/50 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mux}
                            onChange={(e) => setMux(e.target.checked)}
                            className="rounded bg-black/80 border-slate-700 text-[#00E5FF] focus:ring-0"
                          />
                          <span>Activer le Multiplexage (Mux - Recommandé pour Dark Tunnel)</span>
                        </label>
                      </div>

                      {mux && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[10px] font-mono-tech text-slate-400 mb-1">
                              Nombre de connexions concurrentes
                            </label>
                            <input
                              type="number"
                              value={muxConcurrency}
                              onChange={(e) => setMuxConcurrency(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                              placeholder="8"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono-tech text-slate-400 mb-1">
                              Mode Mux
                            </label>
                            <select
                              value={muxMode}
                              onChange={(e) => setMuxMode(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                            >
                              <option value="h2mux">h2mux (Dark Tunnel)</option>
                              <option value="smux">smux</option>
                              <option value="yamux">yamux</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION E : RÉSEAU ET ROUTAGE */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('routing')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>E. Réseau, DNS et Interface TUN</span>
                  </div>
                  {openSections.routing ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.routing && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          DNS Principal
                        </label>
                        <input
                          type="text"
                          value={dnsPrimary}
                          onChange={(e) => setDnsPrimary(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="1.1.1.1"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          DNS Secondaire
                        </label>
                        <input
                          type="text"
                          value={dnsSecondary}
                          onChange={(e) => setDnsSecondary(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="8.8.8.8"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          TUN MTU
                        </label>
                        <input
                          type="number"
                          value={tunMtu}
                          onChange={(e) => setTunMtu(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="1420"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={enableIpv4}
                          onChange={(e) => setEnableIpv4(e.target.checked)}
                          className="rounded bg-black/80 border-slate-700 text-[#00E5FF] focus:ring-0"
                        />
                        <span>Routage IPv4</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={enableIpv6}
                          onChange={(e) => setEnableIpv6(e.target.checked)}
                          className="rounded bg-black/80 border-slate-700 text-[#00E5FF] focus:ring-0"
                        />
                        <span>Routage IPv6</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={bypassLan}
                          onChange={(e) => setBypassLan(e.target.checked)}
                          className="rounded bg-black/80 border-slate-700 text-[#00E5FF] focus:ring-0"
                        />
                        <span>Contourner le LAN</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION F : OPTIONS AVANCÉES */}
              <div className="rounded-xl border border-slate-800 bg-[#0A051D] overflow-hidden">
                <button
                  onClick={() => toggleSection('advanced')}
                  className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-orbitron font-bold text-xs text-white">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>F. Options avancées du moteur</span>
                  </div>
                  {openSections.advanced ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {openSections.advanced && (
                  <div className="p-3 space-y-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Timeout Connexion (ms)
                        </label>
                        <input
                          type="number"
                          value={connectTimeout}
                          onChange={(e) => setConnectTimeout(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="5000"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Timeout Lecture (ms)
                        </label>
                        <input
                          type="number"
                          value={readTimeout}
                          onChange={(e) => setReadTimeout(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="15000"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                          Keep Alive (s)
                        </label>
                        <input
                          type="number"
                          value={keepAlive}
                          onChange={(e) => setKeepAlive(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech"
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-tech text-slate-300 mb-1">
                        Configuration JSON Personnalisée (Override)
                      </label>
                      <textarea
                        rows={3}
                        value={customJson}
                        onChange={(e) => setCustomJson(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-black/80 border border-slate-700 text-white font-mono-tech text-xs resize-none"
                        placeholder="{} (Paramètres JSON avancés pour xray-core / sing-box)"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 2 : COLLER UN LIEN VLESS                           */}
          {/* ========================================================= */}
          {activeTab === 'uri' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono-tech text-slate-300">
                  Collez un lien brut <span className="text-[#FF00E5]">vless://</span> ou un profil Dark Tunnel :
                </label>
                <button
                  onClick={handlePasteFromClipboard}
                  className="text-xs font-mono-tech text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Coller depuis le presse-papiers</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={rawUri}
                onChange={(e) => setRawUri(e.target.value)}
                placeholder="vless://@abess237@192.179.18.100:443?type=ws&security=tls&sni=crashlyticsreports-pa.googleapis.com&host=abess-ops1-3540044404.us-east4.run.app&path=%2F%40abess237&fp=chrome&mux=1#Dark%20Tunnel%20Reference"
                className="w-full p-3 rounded-xl bg-black/80 border border-slate-700 focus:border-[#FF00E5] focus:outline-none text-xs text-white font-mono-tech leading-relaxed resize-none"
              />

              {/* Aperçu des paramètres détectés */}
              {detectedData && (
                <div className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 space-y-2 text-xs font-mono-tech animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <span>{detectedData.flag}</span>
                      <span>{detectedData.serverName}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] font-bold">
                      {detectedData.protocol} • {detectedData.security.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#00FF88]/20">
                    <div>
                      <span className="text-slate-400">Hôte : </span>
                      <span className="text-[#00E5FF] font-bold">{detectedData.host}:{detectedData.port}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Transport : </span>
                      <span className="text-slate-200">{detectedData.transport.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Identifiant : </span>
                      <span className="text-[#00FF88] font-bold truncate block">{detectedData.uuid}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">SNI : </span>
                      <span className="text-slate-300 truncate block">{detectedData.sni || '(aucun)'}</span>
                    </div>
                    {detectedData.wsPath && (
                      <div className="col-span-2">
                        <span className="text-slate-400">WS Path : </span>
                        <span className="text-amber-300">{detectedData.wsPath}</span>
                        {detectedData.wsHost && (
                          <span className="text-slate-400"> • Host Header : <span className="text-[#00E5FF]">{detectedData.wsHost}</span></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons d'action pour le lien VLESS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleAnalyzeAndFill}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF00E5] to-[#8B00FF] text-white font-orbitron font-bold text-xs tracking-wider hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(255,0,229,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Analyser & Remplir le formulaire</span>
                </button>

                <button
                  onClick={handleSaveAndActivate}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#0066FF] text-white font-orbitron font-bold text-xs tracking-wider hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer & Activer directement</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 3 : APERÇU .ATRS                                    */}
          {/* ========================================================= */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tech">
                <span>Spécification Antares Tunnel Routing Specification (.atrs) :</span>
                <span className="text-[#00FF88]">v1.3.0 Standardisée</span>
              </div>

              <pre className="p-3 rounded-xl bg-black/90 border border-slate-800 text-[11px] font-mono-tech text-[#00E5FF] overflow-x-auto max-h-72 select-text leading-relaxed">
                {JSON.stringify(buildAtrsObject(), null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#060210] border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={handleExportAtrs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech font-bold active:scale-95 transition-all cursor-pointer"
            title="Exporter ou télécharger le profil .atrs"
          >
            {copiedNotification ? (
              <>
                <Check className="w-4 h-4 text-[#00FF88]" />
                <span className="text-[#00FF88]">Exporté avec succès !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exporter profil .atrs</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-orbitron font-semibold cursor-pointer"
            >
              Annuler
            </button>

            <button
              onClick={handleSaveAndActivate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] via-[#0066FF] to-[#8B00FF] text-white text-xs font-orbitron font-bold tracking-wide hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Enregistrer & Activer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
