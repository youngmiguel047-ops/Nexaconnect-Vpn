/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SAMPLE_ATRS_CYBER_PROFILE = JSON.stringify({
  magic: "ATRS_CYBER_SPEC",
  version: "1.2.0",
  configName: "Antares Ultra Cyber Stealth — EU/Asia",
  author: "Antares Cryptographic Ops",
  createdAt: "2026-10-28T14:20:00Z",
  signature: "ECDSA-P256-ANTARES-998822A",
  servers: [
    {
      name: "Tokyo Cyber Steer-01",
      city: "Tokyo",
      country: "Japon",
      countryCode: "JP",
      flag: "🇯🇵",
      server: "133.242.18.99",
      port: 8443,
      protocol: "Hysteria2",
      uuid: "e289bf44-9912-4fbe-901b-c124e930ba11",
      network: "udp",
      tls: true,
      ping: 172,
      load: 34,
      isVip: true,
      isRecommended: true
    },
    {
      name: "Zurich Swiss Alpine Guard",
      city: "Zurich",
      country: "Suisse",
      countryCode: "CH",
      flag: "🇨🇭",
      server: "179.43.142.12",
      port: 443,
      protocol: "VLESS-Reality",
      uuid: "4fa812bc-883a-4421-bc19-1124ff39aa23",
      network: "tcp",
      tls: true,
      ping: 29,
      load: 18,
      isVip: false,
      isRecommended: true
    },
    {
      name: "Singapore CyberCore H2",
      city: "Singapour",
      country: "Singapour",
      countryCode: "SG",
      flag: "🇸🇬",
      server: "128.199.200.12",
      port: 8443,
      protocol: "Hysteria2",
      uuid: "bb8910aa-1934-44aa-9812-7763fca91024",
      network: "udp",
      tls: true,
      ping: 164,
      load: 40,
      isVip: true,
      isRecommended: false
    }
  ],
  dns: {
    primary: "1.1.1.1",
    fallback: "9.9.9.9",
    strategy: "DoH_Strict"
  },
  routing: {
    bypassLan: true,
    blockAds: true,
    rules: [
      { domain: "geosite:category-ads-all", outbound: "block" },
      { ip: "geoip:private", outbound: "direct" }
    ]
  }
}, null, 2);

export const SAMPLE_ATRS_STREAMING_PROFILE = JSON.stringify({
  magic: "ATRS_CYBER_SPEC",
  version: "1.2.0",
  configName: "Antares VIP 4K Streamer Pack",
  author: "Antares Network Team",
  createdAt: "2026-10-30T10:00:00Z",
  signature: "ECDSA-P256-ANTARES-VIP-STREAM",
  servers: [
    {
      name: "US West 10G Hollywood Node",
      city: "Los Angeles",
      country: "États-Unis",
      countryCode: "US",
      flag: "🇺🇸",
      server: "104.244.42.1",
      port: 443,
      protocol: "VLESS-Reality",
      uuid: "77aa9911-33ff-44bb-8822-110022334455",
      network: "tcp",
      tls: true,
      ping: 119,
      load: 31,
      isVip: true,
      isRecommended: true
    },
    {
      name: "Frankfurt Turbo UDP BBR",
      city: "Francfort",
      country: "Allemagne",
      countryCode: "DE",
      flag: "🇩🇪",
      server: "185.220.101.5",
      port: 443,
      protocol: "Hysteria2",
      uuid: "119933bb-44cc-22aa-55dd-667788990011",
      network: "udp",
      tls: true,
      ping: 23,
      load: 14,
      isVip: true,
      isRecommended: true
    }
  ],
  dns: {
    primary: "https://dns.quad9.net/dns-query",
    fallback: "https://cloudflare-dns.com/dns-query"
  },
  routing: {
    bypassLan: true,
    blockAds: true
  }
}, null, 2);
