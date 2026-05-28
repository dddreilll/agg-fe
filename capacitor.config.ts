import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.agg.kitchendisplay',
  appName: 'Kitchen Display',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
}

export default config
