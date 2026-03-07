import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.balhinbalay.app',
  appName: 'BalhinBalay',
  webDir: 'build',
  android: {
    allowMixedContent: true
  }
};

export default config;
