
import { Playground, isBallMoving } from './playground';
import { adsService } from './ads-service.js';
import { Walkthrough } from './walkthrough';

// Event Translations for Logic Layer
const EVENTS: Record<string, Record<string, string>> = {
  tr: {
    matchEndDraw: "MAÇ BİTTİ! BERABERLİK... SERİ PENALTILARA GİDİLİYOR!",
    matchEndWin: "MAÇ BİTTİ! KAZANAN:",
    penWin: "PENALTILAR SONUCU: {team} KAZANDI!",
    goldenGoal: "ALTIN GOL İLE KAZANAN: {team}!",
    penGoal: "PENALTI GOL!",
    penMiss: "PENALTI KAÇTI!",
    penGoalKeeper: "PENALTI GOL! KALECİ ÇARESİZ!",
    goal: "GOOOOOL! {team} fileleri havalandırdı!",
    counterGoal: "İNANILMAZ KONTRATAK! GOL!",
    redAdvantage: "AVANTAJLIYKEN KIRMIZI KART! AVANTAJ RAKİBE GEÇTİ!",
    redSecond: "İKİNCİ SARI KART! {team} İHRAÇ EDİLDİ!",
    yellow: "SARI KART ({team})",
    redLostAdvantage: "KIRMIZI KART! AVANTAJI KAYBETTİNİZ, SIRA RAKİPTE!",
    red: "KIRMIZI KART ({team})!",
    penaltyWon: "PENALTI KAZANILDI! TOPUN BAŞINA GEÇİLİYOR...",
    offside: "Ofsayt! Hakem oyunu durdurdu.",
    fastPlay: "Hızlı oyun! Dakika {min}!",
    save: "Müthiş kurtarış!",
    out: "AUT! Top dışarıda.",
    defense: "Savunma araya girdi.",
    fail: "Atak başarısız."
  },
  en: {
    matchEndDraw: "FULL TIME! DRAW... GOING TO PENALTY SHOOTOUT!",
    matchEndWin: "FULL TIME! WINNER:",
    penWin: "PENALTIES RESULT: {team} WON!",
    goldenGoal: "GOLDEN GOAL WINNER: {team}!",
    penGoal: "PENALTY GOAL!",
    penMiss: "PENALTY MISSED!",
    penGoalKeeper: "PENALTY GOAL! KEEPER NO CHANCE!",
    goal: "GOAAAAL! {team} hits the net!",
    counterGoal: "INCREDIBLE COUNTER ATTACK! GOAL!",
    redAdvantage: "RED CARD DURING ADVANTAGE! ADVANTAGE LOST!",
    redSecond: "SECOND YELLOW! {team} SENT OFF!",
    yellow: "YELLOW CARD ({team})",
    redLostAdvantage: "RED CARD! ADVANTAGE LOST, OPPONENT'S TURN!",
    red: "RED CARD ({team})!",
    penaltyWon: "PENALTY! STEPPING UP TO THE SPOT...",
    offside: "Offside! Referee stops the play.",
    fastPlay: "Fast play! Minute {min}!",
    save: "Great save!",
    out: "GOAL KICK! Ball is out.",
    defense: "Defense intercepts.",
    fail: "Attack failed."
  },
  de: {
    matchEndDraw: "SPIELENDE! UNENTSCHIEDEN... ES GEHT ZUM ELFMETERSCHIEßEN!",
    matchEndWin: "SPIELENDE! GEWINNER:",
    penWin: "ELFMETER-ERGEBNIS: {team} HAT GEWONNEN!",
    goldenGoal: "GOLDEN GOAL GEWINNER: {team}!",
    penGoal: "ELFMETER TOR!",
    penMiss: "ELFMETER VERSCHOSSEN!",
    penGoalKeeper: "ELFMETER TOR! TORWART CHANCENLOS!",
    goal: "TOOOOOR! {team} trifft ins Netz!",
    counterGoal: "UNGLAUBLICHER KONTER! TOR!",
    redAdvantage: "ROTE KARTE BEI ÜBERZAHL! VORTEIL VERLOREN!",
    redSecond: "GELB-ROT! {team} VOM PLATZ GESTELLT!",
    yellow: "GELBE KARTE ({team})",
    redLostAdvantage: "ROTE KARTE! VORTEIL VERLOREN, GEGNER AM ZUG!",
    red: "ROTE KARTE ({team})!",
    penaltyWon: "ELFMETER! BEREIT ZUM SCHUSS...",
    offside: "Abseits! Schiedsrichter unterbricht.",
    fastPlay: "Schnelles Spiel! Minute {min}!",
    save: "Tolle Parade!",
    out: "ABSTOß! Ball im Aus.",
    defense: "Abwehr fängt ab.",
    fail: "Angriff gescheitert."
  },
  es: {
    matchEndDraw: "¡FIN DEL PARTIDO! EMPATE... ¡VAMOS A PENALTIS!",
    matchEndWin: "¡FIN DEL PARTIDO! GANADOR:",
    penWin: "¡RESULTADO DE PENALTIS: {team} GANÓ!",
    goldenGoal: "¡GOL DE ORO! GANADOR: {team}!",
    penGoal: "¡GOL DE PENAL!",
    penMiss: "¡PENAL FALLADO!",
    penGoalKeeper: "¡GOL DE PENAL! ¡PORTERO SIN OPCIÓN!",
    goal: "¡GOOOOOL! ¡{team} sacude la red!",
    counterGoal: "¡INCREÍBLE CONTRAATAQUE! ¡GOL!",
    redAdvantage: "¡ROJA EN VENTAJA! ¡VENTAJA PERDIDA!",
    redSecond: "¡SEGUNDA AMARILLA! ¡{team} EXPULSADO!",
    yellow: "TARJETA AMARILLA ({team})",
    redLostAdvantage: "¡ROJA! VENTAJA PERDIDA, ¡TURNO DEL RIVAL!",
    red: "¡TARJETA ROJA ({team})!",
    penaltyWon: "¡PENAL! PREPARÁNDOSE PARA TIRAR...",
    offside: "¡Fuera de juego! Árbitro detiene el juego.",
    fastPlay: "¡Juego rápido! ¡Minuto {min}!",
    save: "¡Gran atajada!",
    out: "¡SAQUE DE META! Balón fuera.",
    defense: "La defensa intercepta.",
    fail: "Ataque fallido."
  },
  ar: {
    matchEndDraw: "انتهت المباراة! تعادل... ذاهبون لركلات الترجيح!",
    matchEndWin: "انتهت المباراة! الفائز:",
    penWin: "نتيجة ركلات الترجيح: {team} فاز!",
    goldenGoal: "الهدف الذهبي! الفائز: {team}!",
    penGoal: "هدف من ركلة جزاء!",
    penMiss: "ركلة جزاء ضائعة!",
    penGoalKeeper: "هدف من ركلة جزاء! الحارس بلا حول!",
    goal: "هدددددف! {team} يسكنها الشباك!",
    counterGoal: "هجمة مرتدة خيالية! هدف!",
    redAdvantage: "بطاقة حمراء أثناء الأفضلية! الأفضلية ضاعت!",
    redSecond: "إنذار ثانٍ! {team} طُرد!",
    yellow: "بطاقة صفراء ({team})",
    redLostAdvantage: "بطاقة حمراء! الأفضلية ضاعت، دور الخصم!",
    red: "بطاقة حمراء ({team})!",
    penaltyWon: "ركلة جزاء! الاستعداد للتسديد...",
    offside: "تسلل! الحكم يوقف اللعب.",
    fastPlay: "لعب سريع! الدقيقة {min}!",
    save: "تصدٍّ رائع!",
    out: "ركلة مرمى! الكرة خارج الملعب.",
    defense: "الدفاع يتدخل.",
    fail: "هجمة فاشلة."
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.querySelector('#root')!;
  // Cast playground to any to access the custom 'language' property without strict TS errors in this context
  const playground = new Playground() as any; 
  rootElement.appendChild(playground as unknown as Node);

  // Walkthrough: ilk açılışta 3 adımlı rehber göster (butonlarda click sesi)
  const walkthrough = new Walkthrough({
    gameRootSelector: '#root',
    onButtonClick: () => SoundEngine.playButtonClick(),
  });
  if (walkthrough.shouldShow()) walkthrough.show();

  let isMuted = false;
  
  // ✅ ADIM 3: Timer Engine (requestAnimationFrame tabanlı)
  // Timer Engine Değişkenleri
  let rafId: number | null = null;
  let virtualMs = 0; // Sanal geçen süre (ms)
  let lastNow: number | null = null;
  let timerPaused = true;
  let timeScale = 1; // Gerçek zaman → sanal zaman oranı
  
  // ✅ ADIM 2: Maç süresi ayarından gerçek zaman hesabı
  const VIRTUAL_MATCH_MS = 90 * 60 * 1000; // 90 dakika = 5400000 ms (sanal)
  
  const calculateTimeScale = (): number => {
    // matchDuration: 0.5 = 30 saniye, 1 = 1 dakika, 2 = 2 dakika
    const selectedMatchDurationSec = Number(playground.matchDuration) * 60; // dakika → saniye
    const REAL_MATCH_MS = selectedMatchDurationSec * 1000; // Gerçek zamanda maç süresi (ms)
    return VIRTUAL_MATCH_MS / REAL_MATCH_MS; // Oran: gerçek zamanda 1ms = sanal zamanda timeScale ms
  };
  
  // --- SOUND ENGINE (Ses Motoru) ---
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // ── Audio unlock (mobil WebView suspend problemi) ──
  let audioUnlocked = false;
  const unlockAudio = async () => {
    if (audioUnlocked) return;
    try {
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      // Sessiz kısa oscillator → iOS/Android unlock
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      g.gain.value = 0;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.01);
      o.onended = () => { try { o.disconnect(); g.disconnect(); } catch {} };
      audioUnlocked = true;
    } catch (err) {
      console.warn('[Audio] unlock failed:', err);
    }
  };
  const unlockOnce = { once: true, passive: true } as const;
  document.addEventListener('pointerdown', unlockAudio, unlockOnce);
  document.addEventListener('touchstart', unlockAudio, unlockOnce);

  // ✅ Gol sesi için cache'lenmiş buffer (performans optimizasyonu)
  let cachedGoalNoiseBuffer: AudioBuffer | null = null;
  let cachedSampleRate: number | null = null;

  // ✅ Aktif node takibi için Set'ler
  const activeSources = new Set<AudioBufferSourceNode>();
  const activeOscs = new Set<OscillatorNode>();
  const activeGains = new Set<GainNode>();

  // ✅ Node'u track et (onended handler'ları manuel olarak ekleniyor)
  const trackNode = <T extends AudioNode>(node: T, set: Set<T>) => {
    set.add(node);
  };

  const SoundEngine = {
    init: async () => {
      if (!audioUnlocked) await unlockAudio();
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch (err) {
          console.warn('[SoundEngine] AudioContext resume failed:', err);
        }
      }
    },

    stopAll: () => {
      // ✅ Tüm aktif OscillatorNode'ları durdur
      activeOscs.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Zaten durmuş olabilir
        }
        try {
          osc.disconnect();
        } catch (e) {
          // Zaten disconnect edilmiş olabilir
        }
      });
      activeOscs.clear();

      // ✅ Tüm aktif AudioBufferSourceNode'ları durdur
      activeSources.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Zaten durmuş olabilir
          console.warn('[SOUND] stopAll() - source.stop() hatası:', e);
        }
        try {
          source.disconnect();
        } catch (e) {
          // Zaten disconnect edilmiş olabilir
        }
      });
      activeSources.clear();

      // ✅ Gain node'ları temizle (opsiyonel, genelde otomatik temizlenir)
      activeGains.forEach(gain => {
        try {
          gain.disconnect();
        } catch (e) {
          // Zaten disconnect edilmiş olabilir
        }
      });
      activeGains.clear();
    },

    playKick: () => {
      if (isMuted) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      gain.gain.setValueAtTime(1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      // ✅ Track node'ları
      trackNode(osc, activeOscs);
      trackNode(gain, activeGains);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
        activeOscs.delete(osc);
        activeGains.delete(gain);
      };

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    },

    playImpact: () => {
      if (isMuted) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      // ✅ Track node'ları
      trackNode(osc, activeOscs);
      trackNode(gain, activeGains);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
        activeOscs.delete(osc);
        activeGains.delete(gain);
      };

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.2);
    },

    playWhistle: (type: 'short' | 'long') => {
      if (isMuted) return;
      const duration = type === 'short' ? 0.15 : 0.8;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const modulator = audioCtx.createOscillator();
      const modGain = audioCtx.createGain();

      modulator.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2500, audioCtx.currentTime);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(50, audioCtx.currentTime);
      modGain.gain.setValueAtTime(300, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      
      if (type === 'long') {
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.4);
      }

      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

      // ✅ Track node'ları
      trackNode(osc, activeOscs);
      trackNode(modulator, activeOscs);
      trackNode(gain, activeGains);
      trackNode(modGain, activeGains);

      const cleanup = () => {
        try {
          osc.disconnect();
          modulator.disconnect();
          gain.disconnect();
          modGain.disconnect();
        } catch (e) {}
        activeOscs.delete(osc);
        activeOscs.delete(modulator);
        activeGains.delete(gain);
        activeGains.delete(modGain);
      };

      osc.onended = cleanup;
      modulator.onended = cleanup;

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
      modulator.start(audioCtx.currentTime);
      modulator.stop(audioCtx.currentTime + duration);
    },

    playGoal: () => {
      if (isMuted) return;
      
      // ✅ Buffer cache kontrolü (performans optimizasyonu)
      // SampleRate değişirse cache'i yenile
      if (!cachedGoalNoiseBuffer || cachedSampleRate !== audioCtx.sampleRate) {
      const bufferSize = audioCtx.sampleRate * 2.5; 
        cachedGoalNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = cachedGoalNoiseBuffer.getChannelData(0);

        // Buffer'ı bir kez doldur ve cache'le
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
        }
        cachedSampleRate = audioCtx.sampleRate;
      }

      // Her seferinde yeni source node oluştur, ama buffer aynı (cache'den)
      const noise = audioCtx.createBufferSource();
      noise.buffer = cachedGoalNoiseBuffer;
      noise.loop = false; // ✅ Loop kapalı

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gain = audioCtx.createGain();
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.5);

      // ✅ Track node'ları
      trackNode(noise, activeSources);
      trackNode(gain, activeGains);

      const t = audioCtx.currentTime;
      const cleanup = () => {
        try {
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch (e) {
          console.warn('[SOUND] playGoal() - cleanup hatası:', e);
        }
        activeSources.delete(noise);
        activeGains.delete(gain);
      };

      noise.onended = cleanup;

      noise.start(t);
      noise.stop(t + 2.6); // ✅ Garanti stop (buffer 2.5 saniye, güvenli pay)
    },

    playAlert: (type: 'yellow' | 'red') => {
      if (isMuted) return;
      const t = audioCtx.currentTime;

      if (type === 'yellow') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(550, t);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(555, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        // ✅ Track node'ları
        trackNode(osc1, activeOscs);
        trackNode(osc2, activeOscs);
        trackNode(gain, activeGains);

        const cleanup = () => {
          try {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch (e) {}
          activeOscs.delete(osc1);
          activeOscs.delete(osc2);
          activeGains.delete(gain);
        };

        osc1.onended = cleanup;
        osc2.onended = cleanup;

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.5);
        osc2.stop(t + 0.5);

      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.9);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(100, t + 0.9);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);

        // ✅ Track node'ları
        trackNode(osc, activeOscs);
        trackNode(gain, activeGains);

        osc.onended = () => {
          try {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch (e) {}
          activeOscs.delete(osc);
          activeGains.delete(gain);
        };

        osc.start(t);
        osc.stop(t + 0.9);
      }
    },

    playButtonClick: () => {
      if (isMuted) return;
      
      // ✅ Mobil APK'da AudioContext suspended olabilir, resume et
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
          console.warn('[SoundEngine] AudioContext resume failed:', err);
        });
      }
      
      const t = audioCtx.currentTime;
      
      // İki osilatör ile daha zengin click sesi
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Yüksek frekanslı keskin click (ana ses)
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, t);
      osc1.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      
      // Düşük frekanslı body (derinlik için)
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(200, t);
      osc2.frequency.exponentialRampToValueAtTime(100, t + 0.05);
      
      // Hızlı attack, hızlı decay - gerçekçi click sesi
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.001); // Çok hızlı attack
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01); // Hızlı initial decay
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); // Tamamen bitiş
      
      // ✅ Track node'ları
      trackNode(osc1, activeOscs);
      trackNode(osc2, activeOscs);
      trackNode(gain, activeGains);

      const cleanup = () => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        } catch (e) {}
        activeOscs.delete(osc1);
        activeOscs.delete(osc2);
        activeGains.delete(gain);
      };

      osc1.onended = cleanup;
      osc2.onended = cleanup;
      
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.05);
      osc2.stop(t + 0.05);
    }
  };

  const getEventText = (key: string, params: {[key: string]: string | number} = {}) => {
    const lang = playground.language || 'tr';
    const texts = EVENTS[lang] ?? EVENTS['en'];
    let text = texts[key] ?? EVENTS['en'][key] ?? key;
    for (const p in params) {
      text = text.replace(`{${p}}`, params[p].toString());
    }
    return text;
  }

  const triggerGoalEffects = (team: 'Home' | 'Away') => {
    // ✅ Şampiyonluk animasyonu aktifken ses çalma (sadece düdük ve gol sesi yeterli)
    if (playground.isChampionActive) return;
    
    SoundEngine.playGoal();
    playground.triggerGoal(team);
  };

  playground.onMuteToggle = (muted: boolean) => {
    isMuted = muted;
    SoundEngine.init();
  };

  playground.onButtonClick = () => {
    // ✅ AudioContext'i aktif hale getir (mobil APK için önemli)
    SoundEngine.init();
    // ✅ Buton click sesini çal
    SoundEngine.playButtonClick();
  };

  // ✅ LAN Client ses senkronizasyonu: Host'tan gelen animasyon event'lerine göre ses çal
  playground.onLanSoundEvent = (event) => {
    SoundEngine.init();
    switch (event) {
      case 'goal':
        SoundEngine.playGoal();
        break;
      case 'yellowCard':
        SoundEngine.playWhistle('short');
        setTimeout(() => SoundEngine.playAlert('yellow'), 100);
        break;
      case 'redCard':
        SoundEngine.playWhistle('long');
        setTimeout(() => SoundEngine.playAlert('red'), 200);
        break;
      case 'champion':
        SoundEngine.playWhistle('long');
        setTimeout(() => SoundEngine.playGoal(), 500);
        break;
    }
  };

  playground.onGameStart = () => {
    // ✅ Yeni maç başladığında flag'leri sıfırla
    matchFinalized = false;
    clearPenaltyTransitionTimeouts();
    
    // ✅ AudioContext'i her zaman aktif hale getir
    SoundEngine.init();
    
    // ✅ Mobil APK'da AudioContext suspended olabilir, resume et
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(err => {
        console.warn('[SoundEngine] AudioContext resume failed:', err);
      });
    }
    
    // ✅ Her zaman düdük ve gol sesini çal
    SoundEngine.playWhistle('long');
    setTimeout(() => SoundEngine.playGoal(), 100);
    
    // ✅ Timer'ı maç başladığında başlatma - top dönerken başlatılacak
  };

  playground.onReset = () => {
    // ✅ Reset'te önce timeout'ları temizle
    clearPenaltyTransitionTimeouts();
    // ✅ Reset'te flag'i sıfırla
    matchFinalized = false;
    // ✅ Reset'te önce tüm sesleri durdur
    SoundEngine.stopAll();
    // ✅ Reset'te timer engine'i durdur ve sıfırla
    pauseMatchTimer();
    virtualMs = 0;
    lastNow = null;
    timerPaused = true;
    playground.matchMinute = 0;
    // ✅ virtualMs ve matchMinute sync edildi
    // ✅ Gameplay class'ını kaldır (reset'te)
    document.body.classList.remove('is-playing');
    SoundEngine.playWhistle('short');
  };

  const finalizeMatch = async () => {
    // ✅ Guard 1: finalizeMatch() tek sefer çalışsın
    if (matchFinalized) return;
    
    // ✅ Guard 2: Penaltı moduna girdiysek bir daha finalize tetiklenmesin
    if (playground.isPenaltyMode) return;
    
    // ✅ Maç zaten bittiyse (summary açıksa) tekrar işlem yapma - ses çalmasın
    if (playground.isSummaryVisible || playground.isChampionActive) return;
    
    // ✅ finalizeMatch() ilk çalıştığında flag'i set et
    matchFinalized = true;
    
    // ✅ Önce mevcut timeout'ları temizle (birikmiş timeout'ları iptal et)
    clearPenaltyTransitionTimeouts();
    
    // ✅ Önce tüm sesleri durdur (penaltı moduna geçişte takılı kalan sesleri temizle)
    SoundEngine.stopAll();
    // ✅ AudioContext'i garanti aktif et
    await SoundEngine.init();
    
    // ✅ Timer'ı tamamen temizle (maç bitti)
    pauseMatchTimer();
    playground.isPlaying = false;
    // ✅ Gameplay class'ını kaldır (maç bitince)
    document.body.classList.remove('is-playing');

    if (playground.homeScore === playground.awayScore) {
      playground.setLastEvent(getEventText('matchEndDraw'), null);
      playground.isPenaltyMode = true;
      // ✅ Penaltılara kalındığında sadece düdük ve gol sesi (1-2 saniye)
      // ✅ Penaltı moduna geçiş flag'ini set et (ilk gol sesinin bitmesini bekle)
      penaltyModeJustStarted = true;
      penaltyModeStartTime = Date.now();
      SoundEngine.playWhistle('long');
      
      // ✅ Timeout id'lerini array'e push et
      const t1 = window.setTimeout(() => {
        // ✅ Penaltı moduna geçişte sadece bir kez gol sesi çal
        if (playground.isPenaltyMode && !playground.isSummaryVisible) {
          SoundEngine.playGoal();
        }
      }, 500); // 0.5 saniye sonra gol sesi
      penaltyTransitionTimeouts.push(t1);
      
      // ✅ 2.5 saniye sonra tüm sesleri durdur (gol sesi bitmiş olmalı)
      const t2 = window.setTimeout(() => {
        SoundEngine.stopAll();
      }, 2500); // 2.5 saniye sonra tüm sesleri durdur
      penaltyTransitionTimeouts.push(t2);
    } else {
      const winnerName = playground.homeScore > playground.awayScore ? playground.homeTeamName : playground.awayTeamName;
      playground.setLastEvent(`${getEventText('matchEndWin')} ${winnerName.toUpperCase()}`, null);
      // ✅ Önce tüm sesleri durdur
      SoundEngine.stopAll();
      // ✅ Önce şampiyonluk animasyonunu aktif et (diğer seslerin çalmasını engellemek için)
      playground.triggerChampionship(winnerName);
      // ✅ Şampiyonluk animasyonu için sadece düdük ve gol sesi (1-2 saniye)
      SoundEngine.playWhistle('long');
      setTimeout(() => {
        if (playground.isChampionActive) {
      SoundEngine.playGoal();
        }
      }, 500); // 0.5 saniye sonra gol sesi
      setTimeout(() => {
        // ✅ Summary açılmadan önce timeout'ları temizle
        clearPenaltyTransitionTimeouts();
        SoundEngine.stopAll(); // ✅ Summary açılmadan önce sesleri durdur
        playground.showSummary();
      }, 4000);
    }
  };

  const checkPenaltyWinner = () => {
    // ✅ Maç zaten bittiyse (summary açıksa) tekrar kontrol etme - ses çalmasın
    if (playground.isSummaryVisible || playground.isChampionActive) return true;
    
    const hCount = playground.homePenResults.length;
    const aCount = playground.awayPenResults.length;
    const hScore = playground.homeScore;
    const aScore = playground.awayScore;

    if (hCount <= 5 && aCount <= 5) {
      const hRemaining = 5 - hCount;
      const aRemaining = 5 - aCount;
      
      if (hScore > aScore + aRemaining) {
         // ✅ Penaltı kazanan bulundu, timeout'ları temizle
         clearPenaltyTransitionTimeouts();
         playground.setLastEvent(getEventText('penWin', {team: playground.homeTeamName.toUpperCase()}), null);
         // ✅ Önce tüm sesleri durdur
         SoundEngine.stopAll();
         // ✅ Önce şampiyonluk animasyonunu aktif et (diğer seslerin çalmasını engellemek için)
         playground.triggerChampionship(playground.homeTeamName);
         // ✅ Şampiyonluk animasyonu için sadece düdük ve gol sesi (1-2 saniye)
         SoundEngine.playWhistle('long');
         setTimeout(() => {
           if (playground.isChampionActive) {
         SoundEngine.playGoal();
           }
         }, 500); // 0.5 saniye sonra gol sesi
         setTimeout(() => {
           SoundEngine.stopAll(); // ✅ Summary açılmadan önce sesleri durdur
           playground.showSummary();
         }, 4000);
         return true;
      }
      if (aScore > hScore + hRemaining) {
         // ✅ Penaltı kazanan bulundu, timeout'ları temizle
         clearPenaltyTransitionTimeouts();
         playground.setLastEvent(getEventText('penWin', {team: playground.awayTeamName.toUpperCase()}), null);
         // ✅ Önce tüm sesleri durdur
         SoundEngine.stopAll();
         // ✅ Önce şampiyonluk animasyonunu aktif et (diğer seslerin çalmasını engellemek için)
         playground.triggerChampionship(playground.awayTeamName);
         // ✅ Şampiyonluk animasyonu için sadece düdük ve gol sesi (1-2 saniye)
         SoundEngine.playWhistle('long');
         setTimeout(() => {
           if (playground.isChampionActive) {
         SoundEngine.playGoal();
           }
         }, 500); // 0.5 saniye sonra gol sesi
         setTimeout(() => {
           SoundEngine.stopAll(); // ✅ Summary açılmadan önce sesleri durdur
           playground.showSummary();
         }, 4000);
         return true;
      }
    }

    if (hCount >= 5 && aCount >= 5 && hCount === aCount) {
       if (hScore !== aScore) {
         // ✅ Penaltı kazanan bulundu (golden goal), timeout'ları temizle
         clearPenaltyTransitionTimeouts();
         const winnerName = hScore > aScore ? playground.homeTeamName : playground.awayTeamName;
         playground.setLastEvent(getEventText('goldenGoal', {team: winnerName.toUpperCase()}), null);
         // ✅ Önce tüm sesleri durdur
         SoundEngine.stopAll();
         // ✅ Önce şampiyonluk animasyonunu aktif et (diğer seslerin çalmasını engellemek için)
         playground.triggerChampionship(winnerName);
         // ✅ Şampiyonluk animasyonu için sadece düdük ve gol sesi (1-2 saniye)
         SoundEngine.playWhistle('long');
         setTimeout(() => {
           if (playground.isChampionActive) {
         SoundEngine.playGoal();
           }
         }, 500); // 0.5 saniye sonra gol sesi
         setTimeout(() => {
           SoundEngine.stopAll(); // ✅ Summary açılmadan önce sesleri durdur
           playground.showSummary();
         }, 4000);
         return true;
       }
    }
    return false;
  };

  // ✅ Penaltı moduna geçişten sonra ilk gol sesinin bitmesini beklemek için flag
  let penaltyModeJustStarted = false;
  let penaltyModeStartTime = 0;

  // ✅ finalizeMatch() tek sefer çalışsın diye flag
  let matchFinalized = false;

  // ✅ Penaltı geçiş timeout'larını yönet
  let penaltyTransitionTimeouts: number[] = [];

  // ✅ Penaltı geçiş timeout'larını temizle helper
  const clearPenaltyTransitionTimeouts = () => {
    penaltyTransitionTimeouts.forEach(id => {
      clearTimeout(id);
    });
    penaltyTransitionTimeouts = [];
  };

  const processPenaltyResult = (digit: number) => {
    // ✅ Maç bittiyse (summary açıksa) veya şampiyonluk animasyonu aktifse işlem yapma - ses çalmasın
    if (playground.isSummaryVisible || playground.isChampionActive) return;
    
    // ✅ Penaltı moduna yeni geçildiyse ve ilk gol sesi hala çalıyorsa (3 saniye içinde), ses çalma
    if (penaltyModeJustStarted) {
      const elapsed = Date.now() - penaltyModeStartTime;
      if (elapsed < 3000) { // 3 saniye içinde ise ilk gol sesi hala çalıyor olabilir
        // İlk gol sesi bitene kadar yeni ses çalma - sadece skor güncelle, ses çalma
    const activeTeam = playground.currentTurn;
    const isGoal = digit % 2 === 0; 
    let eventDesc = "";
    playground.incrementPenaltyStat(activeTeam);
    if (isGoal) {
          if (activeTeam === 'Home') {
            playground.homeScore++;
            playground.homePenResults = [...playground.homePenResults, true];
          } else {
            playground.awayScore++;
            playground.awayPenResults = [...playground.awayPenResults, true];
          }
          eventDesc = getEventText('penGoal');
        } else {
          if (activeTeam === 'Home') {
            playground.homePenResults = [...playground.homePenResults, false];
          } else {
            playground.awayPenResults = [...playground.awayPenResults, false];
          }
          eventDesc = getEventText('penMiss');
        }
        playground.setLastEvent(eventDesc, digit);
        const finished = checkPenaltyWinner();
        if (!finished) playground.toggleTurn();
        return; // Ses çalma, sadece skor güncelle
      } else {
        penaltyModeJustStarted = false; // Süre doldu, artık normal sesler çalabilir
      }
    }
    
    const activeTeam = playground.currentTurn;
    const isGoal = digit % 2 === 0; 
    let eventDesc = "";
    playground.incrementPenaltyStat(activeTeam);
    if (isGoal) {
      triggerGoalEffects(activeTeam);
      if (activeTeam === 'Home') {
        playground.homeScore++;
        playground.homePenResults = [...playground.homePenResults, true];
      } else {
        playground.awayScore++;
        playground.awayPenResults = [...playground.awayPenResults, true];
      }
      eventDesc = getEventText('penGoal');
    } else {
      SoundEngine.playImpact();
      if (activeTeam === 'Home') {
        playground.homePenResults = [...playground.homePenResults, false];
      } else {
        playground.awayPenResults = [...playground.awayPenResults, false];
      }
      eventDesc = getEventText('penMiss');
    }
    playground.setLastEvent(eventDesc, digit);
    
    const finished = checkPenaltyWinner();
    if (!finished) playground.toggleTurn();
  };

  const processMatchPenaltyShot = (digit: number) => {
    // ✅ Maç bittiyse (summary açıksa) veya şampiyonluk animasyonu aktifse işlem yapma - ses çalmasın
    if (playground.isSummaryVisible || playground.isChampionActive) return;
    
    const activeTeam = playground.currentTurn;
    const isGoal = digit % 2 === 0; 
    let eventDesc = "";
    playground.incrementPenaltyStat(activeTeam);
    if (isGoal) {
      triggerGoalEffects(activeTeam);
      if (activeTeam === 'Home') {
        playground.homeScore++;
      } else {
        playground.awayScore++;
      }
      eventDesc = getEventText('penGoalKeeper');
    } else {
      SoundEngine.playImpact();
      eventDesc = getEventText('penMiss');
    }
    playground.setLastEvent(eventDesc, digit);
    playground.isMatchPenalty = false;
    if (playground.extraTurns > 0) {
      playground.extraTurns--; 
    } else {
      playground.toggleTurn();
      playground.homeReds = 0;
      playground.awayReds = 0;
    }
  };

  const processNormalResult = (digit: number) => {
    // ✅ Maç bittiyse (summary açıksa) veya şampiyonluk animasyonu aktifse işlem yapma - ses çalmasın
    if (playground.isSummaryVisible || playground.isChampionActive) return;
    
    let eventDesc = "";
    const activeTeam = playground.currentTurn;
    const activeTeamName = activeTeam === 'Home' ? playground.homeTeamName : playground.awayTeamName;

    switch(digit) {
      case 0:
        // Aktif takım gol atar (her iki takım için de 0 = gol)
        triggerGoalEffects(activeTeam);
        if (activeTeam === 'Home') {
          playground.homeScore++;
        } else {
          playground.awayScore++;
        }
        eventDesc = getEventText('goal', {team: activeTeamName});
        break;
      case 1:
        // Başarısız atak - sıra rakibe geçer
        eventDesc = getEventText('fail');
        SoundEngine.playImpact();
        break;
      case 4: 
        const currentYellows = activeTeam === 'Home' ? playground.homeYellows : playground.awayYellows;
        const isFirstYellow = currentYellows === 0; // triggerYellowCard çağrılmadan önce kontrol et
        
        if (currentYellows >= 1) {
          // İkinci sarı kart - otomatik kırmızı kart
          SoundEngine.playWhistle('long');
          setTimeout(() => SoundEngine.playAlert('red'), 200);
          const hadAdvantage = playground.homeReds > 0 || playground.awayReds > 0;
          const wasExtraTurns = playground.extraTurns;

          playground.triggerRedCard(activeTeam);

          if (hadAdvantage) {
            // Avantajlı takım kırmızı görürse: faza göre avantaj el değiştirir / kaybolur
            if (wasExtraTurns === 1) {
              // 1. oyun: avantaj kaybolur, sıra rakipte ve kırmızı ikon temizlenir
              playground.extraTurns = 0;
              playground.homeReds = 0;
              playground.awayReds = 0;
              eventDesc = getEventText('redLostAdvantage');
              playground.toggleTurn();
            } else {
              // 2. oyun: rakip 1 hak kazanır (avantaj rakibe geçer)
              if (activeTeam === 'Home') playground.awayReds = 0; else playground.homeReds = 0;
              playground.extraTurns = 1;
              eventDesc = getEventText('redAdvantage');
              playground.toggleTurn();
            }
          } else {
            // Normal durum: kırmızı kart => rakip avantaj kazanır
            playground.extraTurns = 1;
            eventDesc = getEventText('redSecond', {team: activeTeamName});
            playground.toggleTurn();
          }
        } else {
          // İlk sarı kart - turn değişir (rakip oynar)
          SoundEngine.playWhistle('short');
          setTimeout(() => SoundEngine.playAlert('yellow'), 100);
          eventDesc = getEventText('yellow', {team: activeTeamName});
          playground.triggerYellowCard(activeTeam);
          // Sarı kart için turn değişimi yapılır (normal akışta)
        }
        break;
      case 3:
        SoundEngine.playWhistle('long');
        setTimeout(() => SoundEngine.playAlert('red'), 200);
        const hadAdvantage = playground.homeReds > 0 || playground.awayReds > 0;
        const wasExtraTurns = playground.extraTurns;

        playground.triggerRedCard(activeTeam);

        if (hadAdvantage) {
          // Avantajlı takım kırmızı görürse: faza göre avantaj el değiştirir / kaybolur
          if (wasExtraTurns === 1) {
            playground.extraTurns = 0;
            playground.homeReds = 0;
            playground.awayReds = 0;
            eventDesc = getEventText('redLostAdvantage');
            playground.toggleTurn();
          } else {
            if (activeTeam === 'Home') playground.awayReds = 0; else playground.homeReds = 0;
            playground.extraTurns = 1;
            eventDesc = getEventText('redAdvantage');
            playground.toggleTurn();
          }
        } else {
          // Normal kırmızı kart: rakip avantaj kazanır
          playground.extraTurns = 1;
          eventDesc = getEventText('red', {team: activeTeamName});
          playground.toggleTurn();
        }
        break;
      case 7:
        SoundEngine.playWhistle('long');
        playground.isMatchPenalty = true;
        eventDesc = getEventText('penaltyWon');
        playground.setLastEvent(eventDesc, digit);
        if (!isLanClient()) {
          setTimeout(() => {
            // Use restartBall() to go through _setPlaying(true) properly.
            // This ensures isBallMoving, auto-stop timer, animation optimization,
            // and LAN snapshot are all set up correctly.
            playground.restartBall();
          }, 100);
        }
        return; 
      case 6: 
        eventDesc = getEventText('offside');
        SoundEngine.playWhistle('short');
        break;
      case 8:
        const nextMin = Math.min(90, playground.matchMinute + 5);
        playground.matchMinute = nextMin;
        // ✅ virtualMs'i sync et (timer geri ezmesin)
        virtualMs = nextMin * 60000;
        eventDesc = getEventText('fastPlay', {min: nextMin});
        SoundEngine.playImpact();
        if (nextMin >= 90) {
          playground.setLastEvent(eventDesc, digit);
          finalizeMatch();
          return;
        }
        break;
      case 5: eventDesc = getEventText('save'); SoundEngine.playImpact(); break;
      case 9: eventDesc = getEventText('out'); SoundEngine.playImpact(); break;
      case 2: eventDesc = getEventText('defense'); SoundEngine.playImpact(); break;
      default: eventDesc = getEventText('fail'); SoundEngine.playImpact(); break;
    }

    playground.setLastEvent(eventDesc, digit);
    // Kırmızı kart (3) ve penaltı (7) için turn değişimi yapılmaz
    // Sarı kart (4) için: İkinci sarı kart (kırmızı kart mantığı case içinde, ilk sarı kart için turn değişimi burada yapılıyor
    if (digit !== 3 && digit !== 7) {
      if (digit === 4) {
        // Sarı kart görüldüğünde: İkinci sarı kart ise (kırmızı kart mantığı case içinde yapıldı), ilk sarı kart ise turn değişir
        // Not: triggerYellowCard çağrıldığında homeYellows/awayYellows artırılıyor, bu yüzden kontrolü case içinde yapıyoruz
        const currentYellowsAfter = activeTeam === 'Home' ? playground.homeYellows : playground.awayYellows;
        if (currentYellowsAfter === 1) {
          // İlk sarı kart (triggerYellowCard çağrıldıktan sonra 1 oldu) - turn değişir (rakip oynar)
          if (playground.extraTurns > 0) {
            playground.extraTurns--;
          } else {
            playground.toggleTurn();
            playground.homeReds = 0;
            playground.awayReds = 0;
          }
        }
        // İkinci sarı kart durumunda (kırmızı kart mantığı) turn değişimi case 4 içinde yapılıyor
      } else {
        // Diğer durumlar (gol, savunma, vb.)
        if (playground.extraTurns > 0) {
          playground.extraTurns--;
        } else {
          playground.toggleTurn();
          playground.homeReds = 0;
          playground.awayReds = 0;
        }
      }
    }
  };

  // ✅ Helper: Anlık dakika hesapla ve UI'ı güncelle (top kısa süre dönerse bile süre yansısın)
  let lastMinuteUpdateTime = 0;
  const MINUTE_UPDATE_THROTTLE_MS = 250; // 250ms throttle
  
  const computeAndApplyMinuteNow = () => {
    // Modal açıksa UI güncelleme yapma (performans için)
    if (playground.isSettingsOpen || playground.isGuideOpen || playground.isLanguageSelectOpen || 
        playground.isSummaryVisible || playground.isWelcomeVisible) {
      return;
    }
    
    const now = performance.now();
    // Throttle: En fazla 250ms'de bir güncelle
    if (now - lastMinuteUpdateTime < MINUTE_UPDATE_THROTTLE_MS) {
      return;
    }
    
    const currentMinute = Math.floor(virtualMs / 60000); // 60000ms = 1 dakika
    // ✅ Sadece ileri gitsin, geri çekmesin (event'lerin verdiği ileri dakikayı ezmesin)
    // ✅ Ama eğer timerPaused false ise ve virtualMs > 0 ise, mutlaka güncelle
    if (currentMinute > playground.matchMinute || (!timerPaused && virtualMs > 0 && currentMinute !== playground.matchMinute)) {
      const oldMinute = playground.matchMinute;
      playground.matchMinute = Math.min(90, currentMinute);
      // ✅ Sadece dakika değiştiğinde requestUpdate çağır
      if (oldMinute !== playground.matchMinute && playground.requestUpdate) {
        lastMinuteUpdateTime = now;
        playground.requestUpdate();
      }
    }
  };

  // ✅ ADIM 3: Timer Engine (requestAnimationFrame tabanlı)
  // Tick fonksiyonu - her frame'de çalışır (asla durmaz)
  const tick = (now: number) => {
    // Modal açıksa timer engine idle kalsın (performans için)
    const isModalOpen = playground.isSettingsOpen || playground.isGuideOpen || 
                        playground.isLanguageSelectOpen || playground.isSummaryVisible || 
                        playground.isWelcomeVisible;
    
    if (isModalOpen) {
      // Modal açıkken sadece RAF devam et, timer işlemleri yapma
      rafId = requestAnimationFrame(tick);
      return;
    }

    // Time scale'i güncelle (ayar değişmiş olabilir)
    const newScale = calculateTimeScale();
    timeScale = Number.isFinite(newScale) && newScale > 0 ? newScale : 180; // fallback (30 sn = 180)

    if (lastNow === null) {
      lastNow = now;
      // İlk frame'de delta olmamalı
      rafId = requestAnimationFrame(tick);
      return;
    }

    const deltaReal = now - lastNow;

    // Eğer pause değilse sanal süreyi artır
    if (!timerPaused) {
      virtualMs += deltaReal * timeScale; // Sanal süreye ekle
    }

    lastNow = now;

    // UI güncelle: Sanal süreyi dakikaya çevir (helper fonksiyon kullan)
    computeAndApplyMinuteNow();

    // Maç bitişi kontrolü
    const currentMinute = Math.floor(virtualMs / 60000);
    if (currentMinute >= 90) {
      timerPaused = true;
          finalizeMatch();
      // tick devam edebilir, ama artık birikim yok
    }

    // Bir sonraki frame için devam et (asla durmaz)
    rafId = requestAnimationFrame(tick);
  };
  
  // Engine start/stop
  const startEngine = () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  };
  
  // ✅ RAF asla durmaz, sadece boş fonksiyon (geriye dönük uyumluluk için)
  const stopEngine = () => {
    // RAF iptal edilmiyor, sadece timerPaused flag'i kontrol ediliyor
  };
  
  // ✅ ADIM 4: Pause / Resume API
  const resumeMatchTimer = () => {
    if (playground.isPenaltyMode || playground.isMatchPenalty) return;
    
    // ✅ virtualMs'i matchMinute'e göre sync et (event'lerin verdiği ileri dakikayı koru)
    const target = playground.matchMinute * 60000;
    if (virtualMs < target) virtualMs = target;
    
    timerPaused = false;
    // ✅ lastNow'ı her zaman güncelle (tick fonksiyonu doğru delta hesaplasın)
    lastNow = performance.now();
    startEngine(); // Idempotent - zaten çalışıyorsa tekrar başlatmaz
  };

  const pauseMatchTimer = () => {
    timerPaused = true;
    // ✅ Top durduğunda son bir kez dakika hesapla ve UI'ı güncelle
    // (Top çok kısa süre dönerse bile geçen süre dakika'ya yansısın)
    computeAndApplyMinuteNow();
  };

  // --- PAUSE / RESUME HANDLERS ---
  
  playground.onPauseGame = () => {
    pauseMatchTimer();
    // ✅ Gameplay class'ını kaldır (pause'da)
    document.body.classList.remove('is-playing');
  };

  playground.onResumeGame = () => {
    // ✅ Gameplay class'ını ekle (resume'da)
    document.body.classList.add('is-playing');
    // ✅ Top hareket ediyorsa timer'ı resume et
    if (isBallMoving) {
      resumeMatchTimer();
    }
  };

  const isLanClient = () => playground.selectedGameMode === 'LAN_2P' && playground.lanRole === 'CLIENT';

  playground.onBallClick = (isPlaying: boolean) => {
    // ✅ Maç bittikten sonra (summary ekranı açıkken) ses çalma
    if (playground.isSummaryVisible || playground.isChampionActive) {
      return; // Maç bitti, ses çalma
    }
    
    // ✅ Topa her dokunulduğunda top sesi çal
    // İlk tıklamada unlock tamamlanmadan playKick çağrılırsa ses gecirir;
    // bu yüzden unlock bitmemiş ise init().then(playKick) ile sıralı çağır.
    if (!audioUnlocked) {
      SoundEngine.init().then(() => SoundEngine.playKick()).catch(() => {});
    } else {
      SoundEngine.playKick();
    }

    // ✅ LAN client: oyun mantığını çalıştırma (yalnızca ses)
    if (isLanClient()) return;
    
    if (isPlaying) {
      // ✅ ADIM 5: Top dönerken timer'ı resume et
      // ✅ ADIM 5: Top dönerken timer'ı resume et
      // ✅ 1) Oyun ilk kez başlarken is-playing class'ı ekle (ağır CSS animasyonlarını kapat)
      document.body.classList.add('is-playing');
      // ✅ 3) Maç başında interstitial preload tetikle (maç sonunda hazır olma ihtimalini artır)
      adsService.prepareInterstitial().catch(() => {}); // Idempotent, hata olsa bile devam et
      // ✅ Top dönerken timer'ı resume et
      resumeMatchTimer();
    } else {
      // ✅ ADIM 5: Top durduğunda timer'ı pause et
      pauseMatchTimer();
      const digit = Date.now() % 10;
      
      if (playground.isPenaltyMode) processPenaltyResult(digit);
      else if (playground.isMatchPenalty) processMatchPenaltyShot(digit);
      else if (playground.matchMinute < 90) processNormalResult(digit);
      else finalizeMatch();
    }
  };
  
  // ✅ ADIM 6: Sekme / Arka plan kontrolü
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Sekme gizlendi → timer'ı pause et
      pauseMatchTimer();
    } else {
      // Sekme geri geldi → eğer top hareket ediyorsa timer'ı resume et
      if (isBallMoving) {
        resumeMatchTimer();
      }
    }
  });
  
  // ✅ Uygulama açılınca timer engine'i başlat (RAF asla durmaz)
  startEngine();
});
