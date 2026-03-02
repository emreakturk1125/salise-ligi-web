import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emreakturk.saliseligi',
  appName: 'salise-ligi',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-2483423166572305~9738015872',
      bannerAdId: 'ca-app-pub-2483423166572305/2226782398',
      interstitialAdId: 'ca-app-pub-2483423166572305/6625192407',
      isTesting: true
    },
 
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#050B14", // koyu lacivert (istersen "#000000")
      showSpinner: false
    }
  }
};

export default config;
