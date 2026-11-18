import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.beantelligence.mobile',
  appName: 'BeanTelligence',
  webDir: 'www',
  backgroundColor: '#130E0B',
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https'
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning nearby coffee hardware...',
        cancel: 'Cancel',
        availableDevices: 'Detected Coffee Hardware',
        noDeviceFound: 'Power on your smart scale, pressure sensor, R2, Omni, or brewer nearby'
      }
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 600,
      backgroundColor: '#130E0B'
    },
    StatusBar: {
      overlaysWebView: true
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
