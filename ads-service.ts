/**
 * AdMob Reklam Servisi
 * Banner ve Interstitial reklamları yönetir
 * İSTEK: Banner sadece MENÜDE görünsün; MAÇ sırasında görünmesin.
 */

import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  BannerAdPluginEvents,
  InterstitialAdPluginEvents,
  type AdMobBannerSize,
  type AdLoadInfo,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Banner yüksekliği (fallback)
export const BANNER_HEIGHT_DP = 50;
export const BANNER_HEIGHT_PX = 50;

class AdsService {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private listenersBound = false;

  private isBannerVisible = false;
  private lastBannerHeightPx: number | null = null;
  private bannerOpPromise: Promise<void> = Promise.resolve();
  private interstitialOpPromise: Promise<void> = Promise.resolve();

  // Prod IDs (istersen kullanırsın)
  private bannerAdId = 'ca-app-pub-2483423166572305/2226782398';
  private interstitialAdId = 'ca-app-pub-2483423166572305/6625192407';

  // Google test ad unit ids
  private testBannerId = 'ca-app-pub-3940256099942544/6300978111';
  private testInterstitialId = 'ca-app-pub-3940256099942544/1033173712';

  // Şimdilik testte kalsın
  private readonly TEST_MODE = true;

  private interstitialReady = false;

  // interstitial kapanınca bekleyenleri resolve etmek için
  private interstitialDismissedResolver: (() => void) | null = null;

  private get bannerIdToUse() {
    return this.TEST_MODE ? this.testBannerId : this.bannerAdId;
  }

  private get interstitialIdToUse() {
    return this.TEST_MODE ? this.testInterstitialId : this.interstitialAdId;
  }

  private setBannerCssHeight(px?: number) {
    const h = px && px > 0 ? `${px}px` : `${BANNER_HEIGHT_PX}px`;
    document.documentElement.style.setProperty('--bannerH', h);
  }

  private bindListenersOnce() {
    if (this.listenersBound) return;
    this.listenersBound = true;

    // Fallback banner yüksekliği
    this.setBannerCssHeight(this.lastBannerHeightPx ?? BANNER_HEIGHT_PX);

    // --- Banner events ---
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('[AdsService] Banner Loaded ✅');
      this.isBannerVisible = true;
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err: any) => {
      console.error('[AdsService] Banner FailedToLoad ❌', err);
      this.isBannerVisible = false;
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      console.log('[AdsService] Banner SizeChanged:', size);
      if (size?.height) {
        this.lastBannerHeightPx = size.height;
        this.setBannerCssHeight(size.height);
      } else {
        this.setBannerCssHeight(this.lastBannerHeightPx ?? BANNER_HEIGHT_PX);
      }
    });

    // --- Interstitial events ---
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      console.log('[AdsService] Interstitial Loaded ✅', info);
      this.interstitialReady = true;
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err: any) => {
      console.error('[AdsService] Interstitial FailedToLoad ❌', err);
      this.interstitialReady = false;
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('[AdsService] Interstitial Dismissed');
      this.interstitialReady = false;

      if (this.interstitialDismissedResolver) {
        this.interstitialDismissedResolver();
        this.interstitialDismissedResolver = null;
      }
      // Yeni interstitial hazırlığı showInterstitialMatchEnd() sonunda tek yerden yapılıyor
    });
  }

  async init(): Promise<void> {
    // Web’de padding için değişkeni set edelim
    this.setBannerCssHeight(this.lastBannerHeightPx ?? BANNER_HEIGHT_PX);

    if (!Capacitor.isNativePlatform()) {
      console.log('[AdsService] Not native. Skipping init.');
      return;
    }

    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('[AdsService] Initializing AdMob... TEST_MODE=', this.TEST_MODE);

        this.bindListenersOnce();

        await AdMob.initialize({
          initializeForTesting: this.TEST_MODE,
        });
        console.log('[AdsService] AdMob initialized ✅');

        await this.ensureConsent();

        this.isInitialized = true;

        // İlk interstitial hazırlığı
        await this.prepareInterstitial();
      } catch (e) {
        console.error('[AdsService] Init Error ❌', e);
        this.isInitialized = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  private async ensureConsent(): Promise<void> {
    try {
      const info = await AdMob.requestConsentInfo();
      if (!info.canRequestAds) {
        const after = await AdMob.showConsentForm();
        console.log('[AdsService] Consent updated:', after);
      } else {
        console.log('[AdsService] Consent OK: canRequestAds=true');
      }
    } catch (e) {
      console.warn('[AdsService] Consent flow warning:', e);
    }
  }

  // ✅ interstitial ready olana kadar bekle (timeout’lu)
  private async waitForInterstitialReady(timeoutMs = 6000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.interstitialReady) return true;
      await new Promise((r) => setTimeout(r, 200));
    }
    return this.interstitialReady;
  }

  async showBanner(force = false): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await this.init();
    if (!this.isInitialized) return;

    if (this.isBannerVisible && !force) {
      console.log('[AdsService] Banner already visible.');
      return;
    }

    this.bannerOpPromise = this.bannerOpPromise.then(async () => {
      try {
        console.log('[AdsService] Showing banner...', force ? '(forced)' : '');
        await AdMob.showBanner({
          adId: this.bannerIdToUse,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          isTesting: this.TEST_MODE,
        });
        // ✅ 2) Başarılı çağrıdan sonra flag'i true yap - event gecikse bile state tutarlı
        this.isBannerVisible = true;
      } catch (e) {
        console.error('[AdsService] showBanner error ❌', e);
        this.isBannerVisible = false;
      }
    });

    return this.bannerOpPromise;
  }

  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    // ✅ 1) Flag kontrolünü kaldır - event kaçarsa banner ekranda olsa bile flag false kalabilir
    // Her zaman hideBanner() dene, flag'e bağlı kalma
    this.bannerOpPromise = this.bannerOpPromise.then(async () => {
      try {
        console.log('[AdsService] Hiding banner...');
        await AdMob.hideBanner();
        // ✅ Her zaman flag'i false yap (banner gizlendi)
        this.isBannerVisible = false;
      } catch (e) {
        console.error('[AdsService] hideBanner error ❌', e);
        // Hata olsa bile flag'i false yap (state tutarlılığı)
        this.isBannerVisible = false;
      }
    });

    return this.bannerOpPromise;
  }

  async prepareInterstitial(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.isInitialized) return;

    // ✅ 3) Idempotent: Zaten hazırsa tekrar hazırlamaya gerek yok (policy-safe)
    if (this.interstitialReady) {
      console.log('[AdsService] Interstitial already ready, skipping prepare.');
      return;
    }

    try {
      this.interstitialReady = false;
      console.log('[AdsService] Preparing interstitial...', this.interstitialIdToUse);
      await AdMob.prepareInterstitial({
        adId: this.interstitialIdToUse,
        isTesting: this.TEST_MODE,
      });
      console.log('[AdsService] Interstitial prepare called ✅ (Loaded event bekleniyor)');
    } catch (e) {
      console.error('[AdsService] Interstitial prepare error ❌', e);
      this.interstitialReady = false;
    }
  }

  // ✅ Maç sonu: banner kapat → interstitial hazırla → hazır olana kadar bekle → göster → kapanmasını bekle
  // ✅ 5) Policy-safe: Aynı maçta birden fazla interstitial gösterme (interstitialReady flag kontrolü)
  // ✅ 6) Mutex: Eş zamanlı çağrılar seri çalışır (interstitialOpPromise kuyruğu)
  async showInterstitialMatchEnd(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await this.init();
    if (!this.isInitialized) return;

    this.interstitialOpPromise = this.interstitialOpPromise.then(async () => {
      try {
        console.log('[AdsService] MATCH END: show interstitial');

        // önce banner kapat
        await this.hideBanner();

        // ✅ 4) İlk deneme: hazır değilse hazırla
        if (!this.interstitialReady) {
          await this.prepareInterstitial();
        }

        // ✅ 4) İlk bekleme (max 6 sn)
        let ready = await this.waitForInterstitialReady(6000);

        // ✅ 4) Retry mekanizması: İlk deneme başarısızsa 1 kez daha dene
        if (!ready) {
          console.log('[AdsService] First wait failed, retrying prepare...');
          await this.prepareInterstitial();
          // ✅ 4) İkinci bekleme (3-4 sn, ağ gecikmesi için)
          ready = await this.waitForInterstitialReady(4000);
        }

        // ✅ 5) Hâlâ hazır değilse skip et (no fill durumunda kullanıcıyı bekletme)
        if (!ready) {
          console.warn('[AdsService] Interstitial still not ready after retry. Skipping show (no fill).');
          console.warn('[Ads] Interstitial not ready, skipped (match end)');
          // Bir sonraki maç için hazırla (loop'a sokma)
          await this.prepareInterstitial().catch(() => {});
          return;
        }

        // ✅ 5) Policy-safe: Interstitial gösterilmeden önce flag'i false yap (aynı maçta tekrar gösterilmesin)
        this.interstitialReady = false;

        // Dismiss bekleme promise'i
        const dismissed = new Promise<void>((resolve) => {
          this.interstitialDismissedResolver = resolve;
        });

        try {
          console.log('[AdsService] Showing interstitial now...');
          await AdMob.showInterstitial();
        } catch (showErr) {
          // showInterstitial throw ederse resolver'ı temizle
          this.interstitialDismissedResolver = null;
          throw showErr;
        }

        // Bazı cihazlarda dismissed event gecikebilir → 8 sn timeout
        await Promise.race([
          dismissed,
          new Promise<void>((resolve) => setTimeout(resolve, 8000)),
        ]);

        // Race sonrası resolver hâlâ duruyorsa temizle (timeout durumu)
        this.interstitialDismissedResolver = null;

        console.log('[AdsService] Interstitial flow finished ✅');

        // bir sonraki maç için tekrar hazırla (tek yerden)
        await this.prepareInterstitial().catch(() => {});
      } catch (e) {
        console.error('[AdsService] showInterstitialMatchEnd error ❌', e);
        // Resolver temizliği (hata durumunda da)
        this.interstitialDismissedResolver = null;
        // Hata durumunda da bir sonraki maç için hazırla (loop'a sokma)
        await this.prepareInterstitial().catch(() => {});
      }
    });

    return this.interstitialOpPromise;
  }

  // Helpers
  getBannerVisible(): boolean {
    return this.isBannerVisible;
  }

  getBannerHeight(): number {
    return this.lastBannerHeightPx ?? BANNER_HEIGHT_PX;
  }
}

export const adsService = new AdsService();
