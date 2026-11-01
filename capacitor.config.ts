import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antares.vpn',
  appName: 'Antares VPN',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    backgroundColor: '#03010B',
    allowMixedContent: true,
    captureInput: true,
  },
};

export default config;
