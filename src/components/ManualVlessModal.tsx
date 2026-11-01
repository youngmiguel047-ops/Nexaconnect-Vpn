/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  Server, 
  Globe, 
  FileCode,
  Zap,
  Info
} from 'lucide-react';
import { VpnServer, AtrsConfig } from '../types/vpn';
import { AtrsParser } from '../utils/atrsParser';
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
  // Mode: Form vs URI Paste vs ATRS Preview
  const [inputTab, setInputTab] = useState<'form' | 'uri' | 'preview'>('form');

  // VLESS Form fields
  const [serverName, setServerName] = useState('Antares VLESS Tokyo Reality');
  const [host, setHost] = useState('133.242.18.99');
  const [port, setPort] = useState('443');
  const [uuid, setUuid] = useState('b831381d-6324-4d53-ad4f-8cda48b30811');
  const [security, setSecurity] = useState<'reality' | 'tls' | 'none'>('reality');
  const [sni, setSni] = useState('yahoo.com');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [publicKey, setPublicKey] = useState('wA3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3');
  const [shortId, setShortId] = useState('6ba855d1');
  const [flow, setFlow] = useState('xtls-rprx-vision');
  const [networkType, setNetworkType] = useState<'tcp' | 'ws' | 'grpc'>('tcp');
  const [wsPath, setWsPath] = useState('/vless-stream');
  const [grpcServiceName, setGrpcServiceName] = useState('vless-grpc');
  const [country, setCountry] = useState('Japon');
  const [city, setCity] = useState('Tokyo');
  const [flag, setFlag] = useState('🇯🇵');

  // Quick Paste URI
  const [rawUri, setRawUri] = useState('');
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  // Generate random UUID v4
  const generateRandomUuid = () => {
    cyberAudio.playClick();
    const newUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setUuid(newUuid);
  };

  // Preset Template loader
  const loadPresetTemplate = () => {
    cyberAudio.playConnect();
    setServerName('Antares Cyber Zurich Reality');
    setHost('179.43.142.12');
    setPort('443');
    setUuid('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6');
    setSecurity('reality');
    setSni('gateway.icloud.com');
    setFingerprint('chrome');
    setPublicKey('11aa22bb33cc44dd55ee66ff77889900aabbccddeeff');
    setShortId('fe8901');
    setFlow('xtls-rprx-vision');
    setNetworkType('tcp');
    setCountry('Suisse');
    setCity('Zurich');
    setFlag('🇨🇭');
    setParseStatus('Modèle VLESS Reality Suisse chargé avec succès.');
  };

  // Parse raw VLESS URI
  const handleParseUri = () => {
    cyberAudio.playClick();
    const trimmed = rawUri.trim();
    if (!trimmed.startsWith('vless://')) {
      setParseStatus('Erreur : le lien doit débuter par "vless://".');
      cyberAudio.playGlitch();
      return;
    }

    try {
      // Format: vless://uuid@host:port?param1=val&param2=val#name
      const withoutScheme = trimmed.replace('vless://', '');
      const [mainPart, hashFragment] = withoutScheme.split('#');
      const [authPart, queryPart] = mainPart.split('?');
      const [parsedUuid, hostPort] = authPart.split('@');
      const [parsedHost, parsedPort] = hostPort.split(':');

      if (parsedUuid) setUuid(parsedUuid);
      if (parsedHost) setHost(parsedHost);
      if (parsedPort) setPort(parsedPort);
      if (hashFragment) setServerName(decodeURIComponent(hashFragment));

      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        if (params.get('security')) setSecurity(params.get('security') as any);
        if (params.get('sni')) setSni(params.get('sni')!);
        if (params.get('fp')) setFingerprint(params.get('fp')!);
        if (params.get('pbk')) setPublicKey(params.get('pbk')!);
        if (params.get('sid')) setShortId(params.get('sid')!);
        if (params.get('flow')) setFlow(params.get('flow')!);
        if (params.get('type')) setNetworkType(params.get('type') as any);
        if (params.get('path')) setWsPath(params.get('path')!);
        if (params.get('serviceName')) setGrpcServiceName(params.get('serviceName')!);
      }

      setParseStatus('Lien VLESS importé avec succès ! Les champs ont été mis à jour.');
      setInputTab('form');
      cyberAudio.playConnect();
    } catch (e: any) {
      setParseStatus(`Erreur de décodage de l'URI : ${e.message}`);
      cyberAudio.playGlitch();
    }
  };

  // Build the .ATRS structure
  const buildAtrsObject = (): AtrsConfig => {
    return {
      version: '1.2.0',
      configName: serverName || 'Configuration VLESS Antares',
      author: 'Antares Cyber Security',
      createdAt: new Date().toISOString(),
      signature: 'ECDSA-P256-ANTARES-VLESS-MANUAL',
      servers: [
        {
          name: serverName,
          server: host,
          port: parseInt(port, 10) || 443,
          protocol: 'VLESS-Reality',
          uuidMasked: uuid.length > 8 ? `${uuid.substring(0, 4)}••••••••${uuid.substring(uuid.length - 4)}` : '••••••••',
          network: networkType,
          tls: security !== 'none',
        },
      ],
      dns: {
        primary: '1.1.1.1',
        fallback: '9.9.9.9',
      },
      routing: {
        bypassLan: true,
        blockAds: true,
      },
    };
  };

  // Build VpnServer model
  const buildVpnServer = (): VpnServer => {
    return {
      id: `vless-manual-${Date.now()}`,
      name: serverName,
      city: city || 'Serveur VLESS',
      country: country || 'Personnalisé',
      countryCode: 'CFG',
      flag: flag || '⚡',
      ping: Math.floor(18 + Math.random() * 25),
      load: Math.floor(15 + Math.random() * 30),
      protocol: 'VLESS-Reality',
      ip: host,
      port: parseInt(port, 10) || 443,
      isVip: true,
      isRecommended: true,
      isFavorite: true,
    };
  };

  // Save to App
  const handleSaveToApp = () => {
    cyberAudio.playConnect();
    const srv = buildVpnServer();
    const atrs = buildAtrsObject();
    onSaveVlessServer(srv, atrs);
    onClose();
  };

  // Download .atrs file
  const handleDownloadAtrs = () => {
    cyberAudio.playClick();
    const atrs = buildAtrsObject();
    const fullAtrs = {
      magic: 'ATRS_CYBER_SPEC',
      ...atrs,
      vlessPayload: {
        server: host,
        port: parseInt(port, 10) || 443,
        uuid: uuid,
        security: security,
        sni: sni,
        fingerprint: fingerprint,
        publicKey: publicKey,
        shortId: shortId,
        flow: flow,
        network: networkType,
        wsPath: wsPath,
        grpcServiceName: grpcServiceName,
      },
    };

    const blob = new Blob([JSON.stringify(fullAtrs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedFileName = (serverName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'antares_vless') + '.atrs';
    a.download = sanitizedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#080314] border border-[#00E5FF]/50 shadow-[0_0_60px_rgba(0,229,255,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0E0622]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_10px_#00E5FF]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>Configuration VLESS (.atrs)</span>
                <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40">
                  MANUEL
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Créer, coller et exporter un nœud VLESS Reality avec extension .atrs
              </p>
            </div>
          </div>

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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#05020D] px-2 text-xs font-orbitron font-semibold">
          <button
            onClick={() => {
              cyberAudio.playClick();
              setInputTab('form');
            }}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              inputTab === 'form'
                ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Formulaire VLESS
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              setInputTab('uri');
            }}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              inputTab === 'uri'
                ? 'border-[#FF00E5] text-[#FF00E5] bg-[#FF00E5]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Coller Lien vless://
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              setInputTab('preview');
            }}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              inputTab === 'preview'
                ? 'border-[#00FF88] text-[#00FF88] bg-[#00FF88]/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Aperçu .ATRS
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Quick Preset helper button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-[11px] font-mono-tech text-slate-400">
              Besoin d'un exemple VLESS Reality pré-configuré ?
            </span>
            <button
              onClick={loadPresetTemplate}
              className="text-[11px] font-orbitron font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              Charger un exemple
            </button>
          </div>

          {parseStatus && (
            <div className="p-2.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-xs font-mono-tech text-[#00E5FF]">
              {parseStatus}
            </div>
          )}

          {/* TAB 1: FORM */}
          {inputTab === 'form' && (
            <div className="space-y-3 text-xs font-rajdhani">
              {/* Server Name & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono-tech uppercase text-slate-300 mb-1">
                    Nom du Serveur
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech"
                    placeholder="ex: Antares VLESS Tokyo"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="w-16">
                    <label className="block text-[11px] font-mono-tech uppercase text-slate-300 mb-1">
                      Drapeau
                    </label>
                    <input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      className="w-full px-3 py-2 text-center rounded-lg bg-black/60 border border-slate-700 text-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-mono-tech uppercase text-slate-300 mb-1">
                      Ville / Pays
                    </label>
                    <input
                      type="text"
                      value={`${city}, ${country}`}
                      onChange={(e) => {
                        const [c, co] = e.target.value.split(',');
                        if (c) setCity(c.trim());
                        if (co) setCountry(co.trim());
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 text-white"
                      placeholder="Tokyo, Japon"
                    />
                  </div>
                </div>
              </div>

              {/* Host and Port */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[11px] font-mono-tech uppercase text-slate-300 mb-1">
                    Adresse IP ou Domaine (Host)
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech"
                    placeholder="133.242.18.99 ou vless.host.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-tech uppercase text-slate-300 mb-1">
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

              {/* UUID with random generator button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono-tech uppercase text-slate-300">
                    UUID Client (Identifiant)
                  </label>
                  <button
                    onClick={generateRandomUuid}
                    className="text-[10px] font-mono-tech text-[#00FF88] hover:underline"
                  >
                    Générer un UUID v4
                  </button>
                </div>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-white font-mono-tech text-xs tracking-wider"
                  placeholder="b831381d-6324-4d53-ad4f-8cda48b30811"
                />
              </div>

              {/* Security, Flow & SNI */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-300 font-orbitron font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                  <span>Sécurité & Camouflage Reality</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-0.5">
                      Sécurité
                    </label>
                    <select
                      value={security}
                      onChange={(e) => setSecurity(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-xs text-[#00E5FF] font-mono-tech"
                    >
                      <option value="reality">reality (Recommandé)</option>
                      <option value="tls">tls</option>
                      <option value="none">none</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-0.5">
                      SNI (Domaine cible)
                    </label>
                    <input
                      type="text"
                      value={sni}
                      onChange={(e) => setSni(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-xs text-white font-mono-tech"
                      placeholder="yahoo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-0.5">
                      Fingerprint (fp)
                    </label>
                    <select
                      value={fingerprint}
                      onChange={(e) => setFingerprint(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-xs text-white font-mono-tech"
                    >
                      <option value="chrome">chrome</option>
                      <option value="firefox">firefox</option>
                      <option value="safari">safari</option>
                      <option value="ios">ios</option>
                      <option value="randomized">randomized</option>
                    </select>
                  </div>
                </div>

                {security === 'reality' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-0.5">
                        Public Key Reality (pbk)
                      </label>
                      <input
                        type="text"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-xs text-[#00FF88] font-mono-tech truncate"
                        placeholder="wA3b4c5d..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-slate-400 mb-0.5">
                        Short ID (sid)
                      </label>
                      <input
                        type="text"
                        value={shortId}
                        onChange={(e) => setShortId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-slate-700 text-xs text-white font-mono-tech"
                        placeholder="6ba855d1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: URI PASTE */}
          {inputTab === 'uri' && (
            <div className="space-y-3">
              <label className="block text-xs font-mono-tech text-slate-300">
                Collez un lien complet de configuration VLESS (vless://...) :
              </label>
              <textarea
                rows={5}
                value={rawUri}
                onChange={(e) => setRawUri(e.target.value)}
                placeholder="vless://b831381d-6324-4d53-ad4f-8cda48b30811@133.242.18.99:443?encryption=none&security=reality&sni=yahoo.com&fp=chrome&pbk=wA3b4c5d...&sid=6ba855d1&type=tcp&flow=xtls-rprx-vision#Antares-Tokyo"
                className="w-full p-3 rounded-xl bg-black/80 border border-slate-700 focus:border-[#FF00E5] focus:outline-none text-xs text-white font-mono-tech leading-relaxed resize-none"
              />

              <button
                onClick={handleParseUri}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF00E5] to-[#8B00FF] text-white font-orbitron font-bold text-xs tracking-wider hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(255,0,229,0.3)]"
              >
                Analyser et Importer le lien VLESS
              </button>
            </div>
          )}

          {/* TAB 3: ATRS PREVIEW */}
          {inputTab === 'preview' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tech">
                <span>Format Antares Tunnel Routing Specification (.atrs) :</span>
                <span className="text-[#00FF88]">v1.2.0 Valide</span>
              </div>
              <pre className="p-3 rounded-xl bg-black/90 border border-slate-800 text-[11px] font-mono-tech text-[#00E5FF] overflow-x-auto max-h-56 select-text">
                {JSON.stringify(buildAtrsObject(), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#060210] border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={handleDownloadAtrs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech font-bold active:scale-95 transition-all"
            title="Télécharger directement le fichier de configuration avec extension .atrs"
          >
            {copiedNotification ? (
              <>
                <Check className="w-4 h-4 text-[#00FF88]" />
                <span className="text-[#00FF88]">Téléchargé !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger .atrs</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-orbitron font-semibold"
            >
              Annuler
            </button>

            <button
              onClick={handleSaveToApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] via-[#0066FF] to-[#8B00FF] text-white text-xs font-orbitron font-bold tracking-wide hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
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
