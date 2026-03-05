import { LitElement, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { adsService, BANNER_HEIGHT_DP } from './ads-service.js';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import QRCode from 'qrcode';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { HostTransport } from './lan/hostTransport.js';
import { ClientWebSocketTransport } from './lan/transport.js';
import { _isValidLanIp as isValidLanIp, getLocalIpWithLogs, stopHost } from './lan/wsHostServer.js';
import { isLanMessage, type LanInputAckMessage, type LanInputMessage, type LanMessage, type LanStatePayload } from './lan/protocol.js';

// Çeviri Sözlüğü
const TRANSLATIONS = {
  tr: {
    title: "SALİSE LİGİ",
    subtitle: "TEK DOKUNUŞ REFLEKS FUTBOL",
    startGame: "MAÇA BAŞLA",
    attack: "HÜCUM",
    ready: "Maça Hazır Mısınız?",
    reset: "Oyun Sıfırlandı",
    settings: "AYARLAR",
    guide: "NASIL OYNANIR?",
    mute: "SES KAPAT",
    unmute: "SES AÇ",
    resetBtn: "SIFIRLA",
    exit: "ÇIKIŞ",
    matchResult: "MAÇ SONUCU",
    statistics: "İSTATİSTİK",
    goals: "Goller",
    yellowCard: "Sarı Kart",
    redCard: "Kırmızı Kart",
    penalties: "Penaltılar",
    mainMenu: "ANA MENÜ",
    playAgain: "TEKRAR OYNA",
    goalExclam: "GOOOOOL!",
    champion: "ŞAMPİYON!",
    settingsTitle: "OYUN AYARLARI",
    homeTeam: "Ev Sahibi Takım",
    awayTeam: "Deplasman Takım",
    duration: "Maç Süresi",
    frameColor: "Çerçeve Rengi",
    colorWhite: "Beyaz",
    colorYellowRed: "Sarı - Kırmızı",
    colorYellowNavy: "Sarı - Lacivert",
    colorBlackWhite: "Siyah - Beyaz",
    colorMaroonBlue: "Bordo - Mavi",
    colorRedWhite: "Kırmızı - Beyaz",
    colorBlueWhite: "Mavi - Beyaz",
    save: "KAYDET",
    language: "Dil / Language",
    howToPlay: "NASIL OYNANIR?",
    guideDesc: "Topa dokun ve turu başlat! Top dönerken balondaki rakam 0–9 arasında akar. Tekrar dokunup durdurduğunda, yakaladığın rakam tur sonucundur.\nSüre çubuğu kalan zamanı gösterir. Süre bitmeden durdur; yoksa top otomatik durur.",
    guide0: "Aktif takım gol atar ve taraftar coşkusu yükselir!",
    guide1: "Atak başarısız olur, sıra rakibe geçer.",
    guide4: "Sarı kart görürsünüz. İkinci sarı kırmızıya dönüşür.",
    guide3: "Kırmızı kart! Rakip avantaj kazanır (+1 tur).",
    guide6: "Ofsayt! Hakem oyunu durdurur.",
    guide7: "Penaltı kazanılır. Atış için topa tekrar basın.",
    guide8: "Oyun hızlanır, süreye +5 dakika eklenir.",
    guideOther: "Atak başarısız olur, sıra rakibe geçer.",
    matchStarted: "MAÇ BAŞLADI..",
    ballInPlay: "MAÇ DEVAM EDİYOR..",
    penaltyInPlay: "PENALTI VURUŞU YAPILIYOR...",
    ruleRedTitle: "KIRMIZI KART KURALI:",
    ruleRedDesc: "Kırmızı kart simgesi sadece avantaj turları boyunca görünür. Avantaj bittiğinde simge temizlenir ve rakip kazandığı \"+1\" bilgisini kaybeder.",
    ruleYellowTitle: "SARI KART KURALI:",
    ruleYellowDesc: "Sarı kartlar maç boyunca birikir. İkinci sarı kart otomatik olarak kırmızı karta dönüşür. Kırmızı kart verildiğinde o takımın sarı kartları sıfırlanır.",
    ruleAdvantageTitle: "AVANTAJ SİSTEMİ (+1):",
    ruleAdvantageDesc: "Rakip kırmızı kart görürse, aktif takım 1 hak kazanır (toplamda 2 defa oynama hakkı). Avantajlı takım 1. oyununda kırmızı görürse avantaj kaybolur. 2. oyununda kırmızı görürse rakip 1 hak kazanır.",
    rulePenTitle: "PENALTI KURALI:",
    rulePenDesc: "Maç içinde 7 rakamı geldiğinde aktif takım penaltı kazanır. Atış için topa tekrar basmanız gerekir. Penaltı atışında çift rakamlar (0, 2, 4, 6, 8) gol, tek rakamlar (1, 3, 5, 7, 9) kaçırılır. Maç berabere biterse penaltı atışlarına geçilir. İlk olarak her takım 5'er atış yapar. En çok atan kazanır. Eğer 5 atış sonunda eşitlik bozulmazsa \"Altın Gol\" (Seri Penaltı) kuralı devreye girer.",
    seconds: "Saniye",
    minutes: "Dakika",
    advantage: "+1",
    goalText: "GOOOL!",
    opponentGoal: "RAKİP GOLÜ!",
    fastGame: "Hızlı Oyun",
    defense: "Savunma/AUT",
    noInternet: "İNTERNET BAĞLANTISI YOK",
    checkConnection: "Bu oyun, kütüphaneleri internetten çektiği için internet bağlantısı olmadan çalışmaz.",
    retry: "TEKRAR DENE",

    gameMode: "OYUN MODU",
    gameModeTitle: "OYUN MODU SEÇ",
    singleBot: "Tek Kişilik (Bot)",
    twoPlayers: "2 Kişilik",
    opponentBot: "Rakip: Bot",
    botPlayerName: "BOT OYUNCU",

    botTurnTitle: "RAKİP OYNUYOR",
    botTurnSubtitle: "Bot hamlesi yapılıyor…",
    lanOpponentTurnSubtitle: "Rakip hamle yapıyor…",

    lanTwoPhones: "Hotspot/Wi‑Fi (İki Telefon)",
    lanModalTitle: "İki Telefon Modu",
    lanHost: "HOST OL (Sunucu)",
    lanJoin: "KATIL (İstemci)",
    lanHostStart: "HOST'U BAŞLAT",
    lanStartMatch: "MAÇI BAŞLAT",
    lanConnect: "BAĞLAN",
    lanConnecting: "Bağlanıyor…",
    lanConnectedWaiting: "Bağlandı, maç bekleniyor",
    lanConnectedOverlayTitle: "✔ Rakip bağlandı",
    lanConnectedOverlaySubtitle: "Maça geçiliyor…",
    lanReadyTimeout: "Rakip hazır olmadı. Tekrar deneyin.",
    lanStartTimeout: "Maç başlatılamadı. Lütfen tekrar deneyin.",
    lanConnectionError: "Bağlantı hatası",
    lanConnectionLost: "Bağlantı koptu",
    lanReconnect: "Yeniden Bağlan",
    lanBackToMenu: "Menüye dön",
    lanShowQr: "QR KODU GÖSTER",
    lanJoinWithQr: "QR İLE KATIL",
    lanContinue: "DEVAM ET",
    lanCancel: "İPTAL",
    lanQrScanning: "QR Okunuyor…",
    lanQrInvalid: "Geçersiz QR",
    lanQrPermissionInfo: "QR kod ile hızlı bağlanmak için kamera gerekir. Görüntü kaydedilmez.",
    lanQrPermissionDenied: "Kamera izni verilmedi. Manuel IP/Port girişi yapabilirsiniz.",
    lanQrRetry: "TEKRAR DENE",
    lanQrManual: "MANUEL GİR",
    lanQrSettingsTitle: "QR kod okumak için kamera izni gerekli.",
    lanQrSettingsBody: "Android’de ‘Bir daha sorma’ seçili olduğu için izin penceresi açılmıyor. Ayarlar > Uygulamalar > İzinler’den Kamerayı açabilirsiniz.",
    lanOpenSettings: "AYARLARI AÇ",
    lanGiveUp: "VAZGEÇ",
    lanHostDisconnected: "Rakip bağlantısı koptu",
    lanClientDisconnected: "Host’a bağlantı koptu",
    lanReconnecting: "Yeniden bağlanılıyor…",
    lanOpponentRejoined: "Rakip bağlandı ✅",
    lanResuming: "Devam ediliyor…",
    lanOpponentDidNotReturn: "Rakip geri dönmedi",
    lanOpponentLeft: "Rakip oyundan çıktı",
    lanCopy: "KOPYALA",
    lanHostIpPort: "Host IP:Port",
    lanPeers: "Bağlı oyuncu",
    lanWaitingForPlayer: "Oyuncu bekleniyor…",
    lanPlayerConnected: "Oyuncu bağlandı ✅",
    lanConnectedWaitingStart: "Bağlandı ✅ Host maç başlatınca başlayacak",
    lanGoToMatch: "MAÇA GEÇ",
    lanConnectionOptionsTitle: "Bağlantı Seçenekleri",
    lanOption1Title: "1️⃣ Hotspot ile Bağlan",
    lanOption1Line1: "Bu telefonda Hotspot’u aç.",
    lanOption1Line2: "Diğer telefon senin Hotspot ağına bağlansın.",
    lanOption2Title: "2️⃣ Aynı Wi‑Fi Ağı",
    lanOption2Line1: "Hotspot yerine iki telefon da aynı Wi‑Fi ağına bağlansın.",
    lanOption3Title: "3️⃣ Oyuna Katıl",
    lanOption3Line1: "Hotspot veya Wi‑Fi ile aynı ağa bağlandıktan sonra QR Kod ile otomatik bağlanın.",
    lanOptionNote: "Hotspot açık olmalı ve en az 1 cihaz bağlı olmalı.",
    lanQrHostPreparing: "Host hazırlanıyor…",
    lanQrHostReady: "Host hazır ✅",
    lanQrHostStartNeeded: "Host telefonu ‘HOST’U BAŞLAT’a basmalı.",
    lanQrWaitingForHost: "Host bekleniyor…",
    lanQrConnecting: "Bağlanıyor…",
    lanClientConnectInfo: "QR Kod ile hızlı katılabilirsin. Aynı hotspot veya Wi‑Fi ağına bağlı olduğundan emin ol.",

    // ── new keys for inline‑ternary elimination ──
    defaultHomeTeam: "EV SAHİBİ",
    defaultAwayTeam: "DEPLASMAN",
    remainingLabel: "Kalan",
    stopBall: "Topu durdur",
    backToMenu: "MENÜYE DÖN",
    guideShort: "KILAVUZ",
    selectedLabel: "Seçili:",
    chooseModeHint: "Devam etmek için oyun modu seç.",
    langBtn: "DİL",
    gameModeSelect: "Oyun Modu Seç",
    gameModeSelectShort: "MOD SEÇ",
    closeLabel: "Kapat",
    modeSubtitle: "Mod seç ve oyunu başlat",
    startBtn: "BAŞLA",
    scoreLabel: "Skor",
    durationNote: "maç başlamadan önce değiştirilebilir",
    langSelectTitle: "DİL SEÇENEĞİ",
    disconnectBtn: "BAĞLANTIYI KES",
    disconnectShort: "KES",
    lanPickRole: "Devam etmek için bir rol seçin.",
    qrCodeTitle: "QR KOD",
    qrScanAlign: "QR kodunu çerçeveye getir",
    penaltyLabel: "Penaltı",
    offsideLabel: "Ofsayt",
    timeUpAutoStopped: "⏱ Süre doldu! Top otomatik durduruldu.",
    hotspotIpNotFound: "Hotspot/Wi‑Fi IP bulunamadı. Hotspot açık mı ve en az 1 cihaz bağlı mı?",
    hotspotOffOrNoIp: "Hotspot açık değil veya LAN IP bulunamadı.",
    hostStartFailedIpPort: "Host başlatılamadı (IP/port). Hotspot/Wi-Fi aynı ağda mı?",
    qrRenderFailed: "QR oluşturulamadı",
    qrScanMobileOnly: "QR tarama sadece mobil uygulamada kullanılabilir.",
    cameraNotSupported: "Kamera açılamadı / cihaz desteklenmiyor.",
    cameraNoPermission: "Kamera açılamadı / izin yok.",
    lanSameNetworkRequiredTitle: "Aynı Ağa Bağlan",
    lanSameNetworkRequired: "Telefonunuz aynı hotspot veya Wi-Fi ağına bağlı olmalı.",
    lanSameNetworkRequiredHint: "Hotspot açın ya da iki telefonu aynı Wi-Fi ağına bağlayın, sonra tekrar QR okutun.",
    hostOnlyAndroid: "HOST özelliği sadece Android/Capacitor uygulamasında çalışır.",
    hostPluginMissing: "WsHostServer eklentisi Android yapısında yok. Uygulamayı yeniden derleyip yükleyin.",
    ipPortRequired: "IP ve Port zorunlu.",
    connectionFailed: "Bağlantı kurulamadı",
    hostNotReadyOrRefused: "Host hazır değil veya bağlantı reddedildi.",
    hostStartFailed: "HOST başlatılamadı",
    hostStartFailedDot: "Host başlatılamadı.",
    tooLate: "Geç kaldın.",
    notYourTurn: "Sıran değil.",
    tooFastRetry: "Çok hızlı. Tekrar dene.",
    connectionDelayed: "Bağlantı gecikti. Tekrar deneyin.",
    opponentLeftMsg: "Rakip oyundan çıktı",
    connectFailedHint: "host IP/port yanlış olabilir.",
    portInUse: "Bu port kullanımda. Lütfen farklı port deneyin veya uygulamayı kapatıp açın.",
    hostStartFailedDetail: "Host başlatılamadı.",
    detailPrefix: "Detay:",
    navHome: "Ana Sayfa",
    navHowToPlay: "Nasıl Oynanır",
    navPrivacy: "Gizlilik",
    navContact: "İletişim"
  },
  en: {
    title: "SALİSE LİGİ",
    subtitle: "ONE-TAP REFLEX FOOTBALL",
    startGame: "KICK OFF",
    attack: "ATTACK",
    ready: "Are You Ready?",
    reset: "Game Reset",
    settings: "SETTINGS",
    guide: "GUIDE",
    mute: "MUTE",
    unmute: "UNMUTE",
    resetBtn: "RESET",
    exit: "EXIT",
    matchResult: "MATCH RESULT",
    statistics: "STATISTICS",
    goals: "Goals",
    yellowCard: "Yellow Card",
    redCard: "Red Card",
    penalties: "Penalties",
    mainMenu: "MAIN MENU",
    playAgain: "PLAY AGAIN",
    goalExclam: "GOAAAAL!",
    champion: "CHAMPION!",
    settingsTitle: "GAME SETTINGS",
    homeTeam: "Home Team",
    awayTeam: "Away Team",
    duration: "Match Duration",
    frameColor: "Frame Color",
    colorWhite: "White",
    colorYellowRed: "Yellow - Red",
    colorYellowNavy: "Yellow - Navy",
    colorBlackWhite: "Black - White",
    colorMaroonBlue: "Maroon - Blue",
    colorRedWhite: "Red - White",
    colorBlueWhite: "Blue - White",
    save: "SAVE",
    language: "Language / Dil",
    howToPlay: "HOW TO PLAY?",
    guideDesc: "Stop the spinning ball at the exact right millisecond to determine your fate! The progress bar shown after you tap the ball indicates the remaining time. You must stop the ball within this time; otherwise it stops automatically.",
    guide0: "Active team scores a goal!",
    guide1: "Attack fails, turn passes to opponent.",
    guide4: "Yellow card. Two yellows make a red.",
    guide3: "Red card! Opponent gains advantage (+1 turn).",
    guide6: "Offside! Referee stops the play.",
    guide7: "Penalty won. Press the ball again to shoot.",
    guide8: "Fast play, +5 minutes added to clock.",
    guideOther: "Attack failed, turn passes to opponent.",
    matchStarted: "MATCH STARTED..",
    ballInPlay: "Game in progress…",
    penaltyInPlay: "PENALTY KICK...",
    ruleRedTitle: "RED CARD RULE:",
    ruleRedDesc: "Red card icon appears during advantage turns. When advantage ends, the icon clears and the opponent loses the \"+1\" bonus.",
    ruleYellowTitle: "YELLOW CARD RULE:",
    ruleYellowDesc: "Yellow cards accumulate throughout the match. Second yellow card automatically becomes a red card. When a red card is issued, that team's yellow cards are reset.",
    ruleAdvantageTitle: "ADVANTAGE SYSTEM (+1):",
    ruleAdvantageDesc: "If opponent gets a red card, active team gains 1 turn (total of 2 playing rights). If advantaged team gets red card in 1st turn, advantage is lost. If in 2nd turn, opponent gains 1 turn.",
    rulePenTitle: "PENALTY RULE:",
    rulePenDesc: "During the match, if digit 7 appears, the active team wins a penalty. Press the ball again to take the shot. In penalty shots, even digits (0, 2, 4, 6, 8) are goals, odd digits (1, 3, 5, 7, 9) are misses. If the match ends in a draw, penalty shootout begins. First 5 shots each. If still tied, \"Golden Goal\" (Sudden Death) rule applies.",
    seconds: "Seconds",
    minutes: "Minutes",
    advantage: "+1",
    goalText: "GOAL!",
    opponentGoal: "OPPONENT GOAL!",
    fastGame: "Fast Play",
    defense: "Defense/OUT",
    noInternet: "NO INTERNET CONNECTION",
    checkConnection: "This game requires an internet connection to load essential libraries.",
    retry: "RETRY",

    gameMode: "GAME MODE",
    gameModeTitle: "SELECT GAME MODE",
    singleBot: "Single Player (Bot)",
    twoPlayers: "2 Players",
    opponentBot: "Opponent: Bot",
    botPlayerName: "BOT PLAYER",

    botTurnTitle: "OPPONENT'S TURN",
    botTurnSubtitle: "Bot is making a move…",
    lanOpponentTurnSubtitle: "Opponent is making a move…",

    lanTwoPhones: "Hotspot/Wi‑Fi (Two Phones)",
    lanModalTitle: "Two Phone Mode",
    lanHost: "HOST (Server)",
    lanJoin: "JOIN (Client)",
    lanHostStart: "START HOST",
    lanStartMatch: "START MATCH",
    lanConnect: "CONNECT",
    lanConnecting: "Connecting…",
    lanConnectedWaiting: "Connected, waiting for match",
    lanConnectedOverlayTitle: "✔ Opponent connected",
    lanConnectedOverlaySubtitle: "Starting the match…",
    lanReadyTimeout: "Opponent is not ready. Please try again.",
    lanStartTimeout: "Match could not start. Please try again.",
    lanConnectionError: "Connection error",
    lanConnectionLost: "Connection lost",
    lanReconnect: "Reconnect",
    lanBackToMenu: "Main Menu",
    lanShowQr: "SHOW QR",
    lanJoinWithQr: "JOIN WITH QR",
    lanContinue: "CONTINUE",
    lanCancel: "CANCEL",
    lanQrScanning: "Scanning…",
    lanQrInvalid: "Invalid QR",
    lanQrPermissionInfo: "Camera access is required to scan the QR code. No images are stored.",
    lanQrPermissionDenied: "Camera permission denied. You can enter IP/Port manually.",
    lanQrRetry: "RETRY",
    lanQrManual: "MANUAL ENTRY",
    lanQrSettingsTitle: "Camera permission is required to scan QR codes.",
    lanQrSettingsBody: "Android is set to ‘Don’t ask again’, so the permission dialog won’t appear. You can enable Camera in Settings > Apps > Permissions.",
    lanOpenSettings: "OPEN SETTINGS",
    lanGiveUp: "CANCEL",
    lanHostDisconnected: "Opponent connection lost",
    lanClientDisconnected: "Host connection lost",
    lanReconnecting: "Reconnecting…",
    lanOpponentRejoined: "Opponent reconnected ✅",
    lanResuming: "Resuming…",
    lanOpponentDidNotReturn: "Opponent did not return",
    lanOpponentLeft: "Opponent left",
    lanCopy: "COPY",
    lanHostIpPort: "Host IP:Port",
    lanPeers: "Connected player",
    lanWaitingForPlayer: "Waiting for player…",
    lanPlayerConnected: "Player connected ✅",
    lanConnectedWaitingStart: "Connected ✅ Waiting for host to start",
    lanGoToMatch: "GO TO MATCH",
    lanConnectionOptionsTitle: "Connection Options",
    lanOption1Title: "1️⃣ Connect via Hotspot",
    lanOption1Line1: "Turn on hotspot on this phone.",
    lanOption1Line2: "The other phone should join your hotspot network.",
    lanOption2Title: "2️⃣ Same Wi‑Fi Network",
    lanOption2Line1: "Instead of hotspot, connect both phones to the same Wi‑Fi network.",
    lanOption3Title: "3️⃣ Join the Game",
    lanOption3Line1: "After both phones are on the same hotspot or Wi‑Fi network, join automatically via QR Code.",
    lanOptionNote: "Hotspot must be on and at least 1 device connected.",
    lanQrHostPreparing: "Preparing host…",
    lanQrHostReady: "Host ready ✅",
    lanQrHostStartNeeded: "The host phone must tap ‘START HOST’.",
    lanQrWaitingForHost: "Waiting for host…",
    lanQrConnecting: "Connecting…",
    lanClientConnectInfo: "Join quickly via QR Code.",

    // ── new keys for inline‑ternary elimination ──
    defaultHomeTeam: "HOME TEAM",
    defaultAwayTeam: "AWAY TEAM",
    remainingLabel: "Remaining",
    stopBall: "Stop the ball",
    backToMenu: "BACK TO MENU",
    guideShort: "GUIDE",
    selectedLabel: "Selected:",
    chooseModeHint: "Choose a game mode to continue.",
    langBtn: "LANG",
    gameModeSelect: "Select Game Mode",
    gameModeSelectShort: "MODE",
    closeLabel: "Close",
    modeSubtitle: "Pick a mode and start",
    startBtn: "START",
    scoreLabel: "Score",
    durationNote: "can be changed before match starts",
    langSelectTitle: "LANGUAGE",
    disconnectBtn: "DISCONNECT",
    disconnectShort: "DISCONNECT",
    lanPickRole: "Pick a role to continue.",
    qrCodeTitle: "QR CODE",
    qrScanAlign: "Align the QR code within the frame",
    penaltyLabel: "Penalty",
    offsideLabel: "Offside",
    timeUpAutoStopped: "⏱ Time up! Auto-stopped.",
    hotspotIpNotFound: "Hotspot/Wi‑Fi IP not found. Is hotspot on and at least one device connected?",
    hotspotOffOrNoIp: "Hotspot is off or LAN IP could not be found.",
    hostStartFailedIpPort: "Host start failed (IP/port). Are both devices on the same Wi‑Fi/Hotspot?",
    qrRenderFailed: "Failed to render QR",
    qrScanMobileOnly: "QR scanning is available only in the mobile app.",
    cameraNotSupported: "Camera not supported on this device..",
    cameraNoPermission: "Camera could not be opened / no permission.",
    lanSameNetworkRequiredTitle: "Same Network Required",
    lanSameNetworkRequired: "Both phones must be on the same hotspot or Wi-Fi network.",
    lanSameNetworkRequiredHint: "Turn on hotspot or connect both phones to the same Wi-Fi, then scan the QR again.",
    hostOnlyAndroid: "HOST only works on the Android/Capacitor app.",
    hostPluginMissing: "WsHostServer plugin is missing in the Android build. Rebuild and reinstall the app.",
    ipPortRequired: "IP and Port are required.",
    connectionFailed: "Failed to connect",
    hostNotReadyOrRefused: "Host is not ready or the connection was refused.",
    hostStartFailed: "Failed to start host",
    hostStartFailedDot: "Failed to start host.",
    tooLate: "Too late.",
    notYourTurn: "Not your turn.",
    tooFastRetry: "Too fast. Try again.",
    connectionDelayed: "Connection delayed. Please try again.",
    opponentLeftMsg: "Opponent left",
    connectFailedHint: "host IP/port may be incorrect.",
    portInUse: "This port is in use. Try a different port or restart the app.",
    hostStartFailedDetail: "Failed to start host.",
    detailPrefix: "Details:",
    navHome: "Home",
    navHowToPlay: "How to Play",
    navPrivacy: "Privacy",
    navContact: "Contact"
  },
  de: {
    title: "SALİSE LİGİ",
    subtitle: "EIN-TIPP REFLEX-FUSSBALL",
    startGame: "ANPFIFF",
    attack: "ANGRIFF",
    ready: "Bereit fürs Spiel?",
    reset: "Spiel zurückgesetzt",
    settings: "EINSTELLUNGEN",
    guide: "ANLEITUNG",
    mute: "TON AUS",
    unmute: "TON AN",
    resetBtn: "ZURÜCKSETZEN",
    exit: "BEENDEN",
    matchResult: "SPIELERGEBNIS",
    statistics: "STATISTIK",
    goals: "Tore",
    yellowCard: "Gelbe Karte",
    redCard: "Rote Karte",
    penalties: "Elfmeter",
    mainMenu: "HAUPTMENÜ",
    playAgain: "NOCHMAL SPIELEN",
    goalExclam: "TOOOOR!",
    champion: "MEISTER!",
    settingsTitle: "SPIELEINSTELLUNGEN",
    homeTeam: "Heimmannschaft",
    awayTeam: "Gastmannschaft",
    duration: "Spieldauer",
    frameColor: "Rahmenfarbe",
    colorWhite: "Weiß",
    colorYellowRed: "Gelb - Rot",
    colorYellowNavy: "Gelb - Marineblau",
    colorBlackWhite: "Schwarz - Weiß",
    colorMaroonBlue: "Bordeaux - Blau",
    colorRedWhite: "Rot - Weiß",
    colorBlueWhite: "Blau - Weiß",
    save: "SPEICHERN",
    language: "Sprache",
    howToPlay: "SPIELANLEITUNG",
    guideDesc: "Tippe auf den Ball und starte die Runde! Während der Ball dreht, laufen die Ziffern 0–9 in der Blase. Tippe erneut, um ihn zu stoppen – die angezeigte Ziffer ist dein Ergebnis.\nDer Zeitbalken zeigt die verbleibende Zeit. Stoppe rechtzeitig, sonst stoppt der Ball automatisch.",
    guide0: "Das aktive Team erzielt ein Tor und die Fans jubeln!",
    guide1: "Angriff fehlgeschlagen, der Gegner ist dran.",
    guide4: "Gelbe Karte. Zwei Gelbe ergeben eine Rote.",
    guide3: "Rote Karte! Gegner erhält Vorteil (+1 Runde).",
    guide6: "Abseits! Der Schiedsrichter pfeift ab.",
    guide7: "Elfmeter gewonnen. Drücke den Ball erneut zum Schießen.",
    guide8: "Schnelles Spiel, +5 Minuten werden hinzugefügt.",
    guideOther: "Angriff fehlgeschlagen, der Gegner ist dran.",
    matchStarted: "SPIEL STARTET..",
    ballInPlay: "SPIEL LÄUFT…",
    penaltyInPlay: "ELFMETERSCHIEßEN...",
    ruleRedTitle: "ROTE-KARTE-REGEL:",
    ruleRedDesc: "Das Rote-Karte-Symbol erscheint während der Vorteilsrunden. Nach Ende des Vorteils verschwindet das Symbol und der Gegner verliert den \"+1\"-Bonus.",
    ruleYellowTitle: "GELBE-KARTE-REGEL:",
    ruleYellowDesc: "Gelbe Karten sammeln sich im Laufe des Spiels. Die zweite Gelbe wird automatisch zur Roten. Bei einer Roten Karte werden die Gelben Karten des Teams zurückgesetzt.",
    ruleAdvantageTitle: "VORTEILSSYSTEM (+1):",
    ruleAdvantageDesc: "Erhält der Gegner eine Rote Karte, gewinnt das aktive Team 1 Runde (insgesamt 2 Spielzüge). Rote Karte im 1. Zug: Vorteil geht verloren. Im 2. Zug: Gegner erhält 1 Runde.",
    rulePenTitle: "ELFMETERREGEL:",
    rulePenDesc: "Erscheint während des Spiels die Ziffer 7, gewinnt das aktive Team einen Elfmeter. Drücke den Ball erneut zum Schießen. Gerade Ziffern (0, 2, 4, 6, 8) = Tor, ungerade (1, 3, 5, 7, 9) = Fehlschuss. Bei Unentschieden folgt ein Elfmeterschießen: erst 5 Schüsse pro Team, bei Gleichstand gilt \"Golden Goal\" (Sudden Death).",
    seconds: "Sekunden",
    minutes: "Minuten",
    advantage: "+1",
    goalText: "TOOOOR!",
    opponentGoal: "GEGNERTOR!",
    fastGame: "Schnelles Spiel",
    defense: "Verteidigung/AUS",
    noInternet: "KEINE INTERNETVERBINDUNG",
    checkConnection: "Dieses Spiel benötigt eine Internetverbindung zum Laden der Bibliotheken.",
    retry: "ERNEUT VERSUCHEN",

    gameMode: "SPIELMODUS",
    gameModeTitle: "SPIELMODUS WÄHLEN",
    singleBot: "Einzelspieler (Bot)",
    twoPlayers: "2 Spieler",
    opponentBot: "Gegner: Bot",
    botPlayerName: "BOT-SPIELER",

    botTurnTitle: "GEGNER SPIELT",
    botTurnSubtitle: "Bot führt Zug aus…",
    lanOpponentTurnSubtitle: "Gegner führt Zug aus…",

    lanTwoPhones: "Hotspot/WLAN (Zwei Handys)",
    lanModalTitle: "Zwei-Handy-Modus",
    lanHost: "HOST (Server)",
    lanJoin: "BEITRETEN (Client)",
    lanHostStart: "HOST STARTEN",
    lanStartMatch: "SPIEL STARTEN",
    lanConnect: "VERBINDEN",
    lanConnecting: "Verbinde…",
    lanConnectedWaiting: "Verbunden, warte auf Spiel",
    lanConnectedOverlayTitle: "✔ Gegner verbunden",
    lanConnectedOverlaySubtitle: "Spiel wird gestartet…",
    lanReadyTimeout: "Gegner nicht bereit. Bitte erneut versuchen.",
    lanStartTimeout: "Spiel konnte nicht gestartet werden. Bitte erneut versuchen.",
    lanConnectionError: "Verbindungsfehler",
    lanConnectionLost: "Verbindung verloren",
    lanReconnect: "Neu verbinden",
    lanBackToMenu: "Zum Menü",
    lanShowQr: "QR-CODE ZEIGEN",
    lanJoinWithQr: "MIT QR BEITRETEN",
    lanContinue: "WEITER",
    lanCancel: "ABBRECHEN",
    lanQrScanning: "QR wird gescannt…",
    lanQrInvalid: "Ungültiger QR",
    lanQrPermissionInfo: "Kamerazugriff ist erforderlich, um den QR-Code zu scannen. Es werden keine Bilder gespeichert.",
    lanQrPermissionDenied: "Kamerazugriff verweigert. Sie können IP/Port manuell eingeben.",
    lanQrRetry: "ERNEUT VERSUCHEN",
    lanQrManual: "MANUELL EINGEBEN",
    lanQrSettingsTitle: "Zum Scannen von QR-Codes ist eine Kameragenehmigung erforderlich.",
    lanQrSettingsBody: "Android hat 'Nicht erneut fragen' aktiviert, daher erscheint kein Berechtigungsdialog. Aktivieren Sie die Kamera unter Einstellungen > Apps > Berechtigungen.",
    lanOpenSettings: "EINSTELLUNGEN ÖFFNEN",
    lanGiveUp: "ABBRECHEN",
    lanHostDisconnected: "Gegnerverbindung verloren",
    lanClientDisconnected: "Host-Verbindung verloren",
    lanReconnecting: "Verbinde erneut…",
    lanOpponentRejoined: "Gegner verbunden ✅",
    lanResuming: "Wird fortgesetzt…",
    lanOpponentDidNotReturn: "Gegner nicht zurückgekehrt",
    lanOpponentLeft: "Gegner hat verlassen",
    lanCopy: "KOPIEREN",
    lanHostIpPort: "Host IP:Port",
    lanPeers: "Verbundener Spieler",
    lanWaitingForPlayer: "Warte auf Spieler…",
    lanPlayerConnected: "Spieler verbunden ✅",
    lanConnectedWaitingStart: "Verbunden ✅ Warte auf Host-Start",
    lanGoToMatch: "ZUM SPIEL",
    lanConnectionOptionsTitle: "Verbindungsoptionen",
    lanOption1Title: "1️⃣ Per Hotspot verbinden",
    lanOption1Line1: "Schalte den Hotspot auf diesem Handy ein.",
    lanOption1Line2: "Das andere Handy muss sich mit deinem Hotspot verbinden.",
    lanOption2Title: "2️⃣ Selbes WLAN-Netzwerk",
    lanOption2Line1: "Alternativ beide Handys mit demselben WLAN verbinden.",
    lanOption3Title: "3️⃣ Spiel beitreten",
    lanOption3Line1: "Nach der Verbindung über Hotspot oder WLAN automatisch per QR-Code beitreten.",
    lanOptionNote: "Hotspot muss an sein und mindestens 1 Gerät verbunden.",
    lanQrHostPreparing: "Host wird vorbereitet…",
    lanQrHostReady: "Host bereit ✅",
    lanQrHostStartNeeded: "Das Host-Handy muss auf 'HOST STARTEN' tippen.",
    lanQrWaitingForHost: "Warte auf Host…",
    lanQrConnecting: "Verbinde…",
    lanClientConnectInfo: "Schnell per QR-Code beitreten.",

    defaultHomeTeam: "HEIMTEAM",
    defaultAwayTeam: "GASTTEAM",
    remainingLabel: "Verbleibend",
    stopBall: "Ball stoppen",
    backToMenu: "ZURÜCK ZUM MENÜ",
    guideShort: "HILFE",
    selectedLabel: "Gewählt:",
    chooseModeHint: "Wähle einen Spielmodus, um fortzufahren.",
    langBtn: "SPRACHE",
    gameModeSelect: "Spielmodus wählen",
    gameModeSelectShort: "MODUS",
    closeLabel: "Schließen",
    modeSubtitle: "Wähle einen Modus und starte",
    startBtn: "STARTEN",
    scoreLabel: "Ergebnis",
    durationNote: "vor Spielbeginn änderbar",
    langSelectTitle: "SPRACHE",
    disconnectBtn: "TRENNEN",
    disconnectShort: "TRENNEN",
    lanPickRole: "Wähle eine Rolle, um fortzufahren.",
    qrCodeTitle: "QR-CODE",
    qrScanAlign: "QR-Code in den Rahmen bringen",
    penaltyLabel: "Elfmeter",
    offsideLabel: "Abseits",
    timeUpAutoStopped: "⏱ Zeit abgelaufen! Automatisch gestoppt.",
    hotspotIpNotFound: "Hotspot-/WLAN-IP nicht gefunden. Ist der Hotspot an und mindestens ein Gerät verbunden?",
    hotspotOffOrNoIp: "Hotspot ist aus oder LAN-IP konnte nicht gefunden werden.",
    hostStartFailedIpPort: "Host-Start fehlgeschlagen (IP/Port). Sind beide Geräte im selben WLAN/Hotspot?",
    qrRenderFailed: "QR konnte nicht erstellt werden",
    qrScanMobileOnly: "QR-Scan ist nur in der mobilen App verfügbar.",
    cameraNotSupported: "Kamera wird nicht unterstützt.",
    cameraNoPermission: "Kamera konnte nicht geöffnet werden / keine Berechtigung.",
    lanSameNetworkRequiredTitle: "Gleiches Netzwerk erforderlich",
    lanSameNetworkRequired: "Beide Telefone müssen im selben Hotspot- oder WLAN-Netz sein.",
    lanSameNetworkRequiredHint: "Hotspot aktivieren oder beide Geräte ins gleiche WLAN verbinden, dann QR erneut scannen.",
    hostOnlyAndroid: "HOST funktioniert nur in der Android/Capacitor-App.",
    hostPluginMissing: "WsHostServer-Plugin fehlt im Android-Build. App neu erstellen und installieren.",
    ipPortRequired: "IP und Port sind erforderlich.",
    connectionFailed: "Verbindung fehlgeschlagen",
    hostNotReadyOrRefused: "Host ist nicht bereit oder die Verbindung wurde abgelehnt.",
    hostStartFailed: "HOST konnte nicht gestartet werden",
    hostStartFailedDot: "Host-Start fehlgeschlagen.",
    tooLate: "Zu spät.",
    notYourTurn: "Nicht dein Zug.",
    tooFastRetry: "Zu schnell. Nochmal versuchen.",
    connectionDelayed: "Verbindung verzögert. Bitte erneut versuchen.",
    opponentLeftMsg: "Gegner hat das Spiel verlassen",
    connectFailedHint: "Host-IP/Port könnte falsch sein.",
    portInUse: "Dieser Port wird bereits verwendet. Versuche einen anderen Port oder starte die App neu.",
    hostStartFailedDetail: "Host-Start fehlgeschlagen.",
    detailPrefix: "Details:",
    navHome: "Startseite",
    navHowToPlay: "Spielanleitung",
    navPrivacy: "Datenschutz",
    navContact: "Kontakt"
  },
  es: {
    title: "SALİSE LİGİ",
    subtitle: "FÚTBOL REFLEJO DE UN TOQUE",
    startGame: "INICIO",
    attack: "ATAQUE",
    ready: "¿Listo para el partido?",
    reset: "Juego reiniciado",
    settings: "AJUSTES",
    guide: "GUÍA",
    mute: "SILENCIAR",
    unmute: "ACTIVAR SONIDO",
    resetBtn: "REINICIAR",
    exit: "SALIR",
    matchResult: "RESULTADO DEL PARTIDO",
    statistics: "ESTADÍSTICAS",
    goals: "Goles",
    yellowCard: "Tarjeta amarilla",
    redCard: "Tarjeta roja",
    penalties: "Penaltis",
    mainMenu: "MENÚ PRINCIPAL",
    playAgain: "JUGAR DE NUEVO",
    goalExclam: "¡GOOOOL!",
    champion: "¡CAMPEÓN!",
    settingsTitle: "AJUSTES DEL JUEGO",
    homeTeam: "Equipo local",
    awayTeam: "Equipo visitante",
    duration: "Duración del partido",
    frameColor: "Color del marco",
    colorWhite: "Blanco",
    colorYellowRed: "Amarillo - Rojo",
    colorYellowNavy: "Amarillo - Azul marino",
    colorBlackWhite: "Negro - Blanco",
    colorMaroonBlue: "Burdeos - Azul",
    colorRedWhite: "Rojo - Blanco",
    colorBlueWhite: "Azul - Blanco",
    save: "GUARDAR",
    language: "Idioma",
    howToPlay: "¿CÓMO SE JUEGA?",
    guideDesc: "¡Toca el balón y empieza el turno! Mientras gira, el número en la burbuja va del 0 al 9. Cuando toques de nuevo para detenerlo, el número que atrapes será el resultado del turno.\nLa barra de tiempo muestra el tiempo restante. ¡Deténlo antes de que se acabe o el balón se detendrá automáticamente!",
    guide0: "¡El equipo activo marca gol y la afición estalla!",
    guide1: "Ataque fallido, turno para el rival.",
    guide4: "Tarjeta amarilla. Dos amarillas hacen una roja.",
    guide3: "¡Tarjeta roja! El rival obtiene ventaja (+1 turno).",
    guide6: "¡Fuera de juego! El árbitro detiene el juego.",
    guide7: "Penalti a favor. Toca el balón para tirar.",
    guide8: "Juego rápido. Se añaden +5 minutos al reloj.",
    guideOther: "Ataque fallido, turno para el rival.",
    matchStarted: "EL PARTIDO EMPEZÓ..",
    ballInPlay: "PARTIDO EN CURSO…",
    penaltyInPlay: "TIRO PENAL...",
    ruleRedTitle: "REGLA DE TARJETA ROJA:",
    ruleRedDesc: "El icono de tarjeta roja aparece durante los turnos de ventaja. Al terminar la ventaja, el icono desaparece y el rival pierde el bono \"+1\".",
    ruleYellowTitle: "REGLA DE TARJETA AMARILLA:",
    ruleYellowDesc: "Las tarjetas amarillas se acumulan durante el partido. La segunda amarilla se convierte automáticamente en roja. Al dar una roja, las amarillas del equipo se reinician.",
    ruleAdvantageTitle: "SISTEMA DE VENTAJA (+1):",
    ruleAdvantageDesc: "Si el rival recibe tarjeta roja, el equipo activo gana 1 turno (2 jugadas en total). Roja en el 1.er turno: se pierde la ventaja. En el 2.º turno: el rival gana 1 turno.",
    rulePenTitle: "REGLA DE PENALTI:",
    rulePenDesc: "Si durante el partido aparece el dígito 7, el equipo activo gana un penalti. Toca el balón para tirar. Dígitos pares (0, 2, 4, 6, 8) = gol; impares (1, 3, 5, 7, 9) = fallo. Si hay empate, se va a tanda de penaltis: 5 tiros por equipo; si persiste el empate, se aplica \"Gol de Oro\" (muerte súbita).",
    seconds: "Segundos",
    minutes: "Minutos",
    advantage: "+1",
    goalText: "¡GOL!",
    opponentGoal: "¡GOL DEL RIVAL!",
    fastGame: "Juego rápido",
    defense: "Defensa/FUERA",
    noInternet: "SIN CONEXIÓN A INTERNET",
    checkConnection: "Este juego necesita conexión a internet para cargar las bibliotecas.",
    retry: "REINTENTAR",

    gameMode: "MODO DE JUEGO",
    gameModeTitle: "ELIGE MODO DE JUEGO",
    singleBot: "Un jugador (Bot)",
    twoPlayers: "2 jugadores",
    opponentBot: "Rival: Bot",
    botPlayerName: "BOT JUGADOR",

    botTurnTitle: "TURNO DEL RIVAL",
    botTurnSubtitle: "El bot está jugando…",
    lanOpponentTurnSubtitle: "El rival está jugando…",

    lanTwoPhones: "Hotspot/Wi‑Fi (Dos móviles)",
    lanModalTitle: "Modo dos móviles",
    lanHost: "HOST (Servidor)",
    lanJoin: "UNIRSE (Cliente)",
    lanHostStart: "INICIAR HOST",
    lanStartMatch: "INICIAR PARTIDO",
    lanConnect: "CONECTAR",
    lanConnecting: "Conectando…",
    lanConnectedWaiting: "Conectado, esperando partido",
    lanConnectedOverlayTitle: "✔ Rival conectado",
    lanConnectedOverlaySubtitle: "Iniciando el partido…",
    lanReadyTimeout: "El rival no está listo. Inténtalo de nuevo.",
    lanStartTimeout: "No se pudo iniciar el partido. Inténtalo de nuevo.",
    lanConnectionError: "Error de conexión",
    lanConnectionLost: "Conexión perdida",
    lanReconnect: "Reconectar",
    lanBackToMenu: "Menú principal",
    lanShowQr: "MOSTRAR QR",
    lanJoinWithQr: "UNIRSE CON QR",
    lanContinue: "CONTINUAR",
    lanCancel: "CANCELAR",
    lanQrScanning: "Escaneando QR…",
    lanQrInvalid: "QR inválido",
    lanQrPermissionInfo: "Se necesita acceso a la cámara para escanear el código QR. No se guardan imágenes.",
    lanQrPermissionDenied: "Permiso de cámara denegado. Puedes introducir IP/Puerto manualmente.",
    lanQrRetry: "REINTENTAR",
    lanQrManual: "INTRODUCCIÓN MANUAL",
    lanQrSettingsTitle: "Se necesita permiso de cámara para escanear códigos QR.",
    lanQrSettingsBody: "Android tiene activado 'No volver a preguntar', así que no aparecerá el diálogo de permisos. Puedes activar la cámara en Ajustes > Aplicaciones > Permisos.",
    lanOpenSettings: "ABRIR AJUSTES",
    lanGiveUp: "CANCELAR",
    lanHostDisconnected: "Conexión del rival perdida",
    lanClientDisconnected: "Conexión con el host perdida",
    lanReconnecting: "Reconectando…",
    lanOpponentRejoined: "Rival reconectado ✅",
    lanResuming: "Reanudando…",
    lanOpponentDidNotReturn: "El rival no volvió",
    lanOpponentLeft: "El rival se fue",
    lanCopy: "COPIAR",
    lanHostIpPort: "Host IP:Puerto",
    lanPeers: "Jugador conectado",
    lanWaitingForPlayer: "Esperando jugador…",
    lanPlayerConnected: "Jugador conectado ✅",
    lanConnectedWaitingStart: "Conectado ✅ Esperando inicio del host",
    lanGoToMatch: "IR AL PARTIDO",
    lanConnectionOptionsTitle: "Opciones de conexión",
    lanOption1Title: "1️⃣ Conectar vía Hotspot",
    lanOption1Line1: "Activa el hotspot en este móvil.",
    lanOption1Line2: "El otro móvil debe unirse a tu red hotspot.",
    lanOption2Title: "2️⃣ Misma red Wi‑Fi",
    lanOption2Line1: "Alternativamente, conecta ambos móviles a la misma red Wi‑Fi.",
    lanOption3Title: "3️⃣ Unirse al juego",
    lanOption3Line1: "Tras conectarse a la misma red hotspot o Wi‑Fi, únete automáticamente con el código QR.",
    lanOptionNote: "El hotspot debe estar encendido y al menos 1 dispositivo conectado.",
    lanQrHostPreparing: "Preparando host…",
    lanQrHostReady: "Host listo ✅",
    lanQrHostStartNeeded: "El móvil host debe pulsar 'INICIAR HOST'.",
    lanQrWaitingForHost: "Esperando al host…",
    lanQrConnecting: "Conectando…",
    lanClientConnectInfo: "Únete rápidamente con el código QR.",

    defaultHomeTeam: "LOCAL",
    defaultAwayTeam: "VISITANTE",
    remainingLabel: "Restante",
    stopBall: "Detener el balón",
    backToMenu: "VOLVER AL MENÚ",
    guideShort: "GUÍA",
    selectedLabel: "Seleccionado:",
    chooseModeHint: "Elige un modo de juego para continuar.",
    langBtn: "IDIOMA",
    gameModeSelect: "Elegir modo de juego",
    gameModeSelectShort: "MODO",
    closeLabel: "Cerrar",
    modeSubtitle: "Elige un modo y empieza",
    startBtn: "EMPEZAR",
    scoreLabel: "Marcador",
    durationNote: "modificable antes de iniciar el partido",
    langSelectTitle: "IDIOMA",
    disconnectBtn: "DESCONECTAR",
    disconnectShort: "CORTAR",
    lanPickRole: "Elige un rol para continuar.",
    qrCodeTitle: "CÓDIGO QR",
    qrScanAlign: "Alinea el código QR en el marco",
    penaltyLabel: "Penalti",
    offsideLabel: "Fuera de juego",
    timeUpAutoStopped: "⏱ ¡Tiempo agotado! Detenido automáticamente.",
    hotspotIpNotFound: "IP de Hotspot/Wi‑Fi no encontrada. ¿Está el hotspot encendido y al menos un dispositivo conectado?",
    hotspotOffOrNoIp: "El hotspot está apagado o no se encontró la IP de LAN.",
    hostStartFailedIpPort: "Error al iniciar host (IP/puerto). ¿Están ambos dispositivos en la misma red Wi‑Fi/Hotspot?",
    qrRenderFailed: "No se pudo generar el QR",
    qrScanMobileOnly: "El escaneo QR solo está disponible en la app móvil.",
    cameraNotSupported: "Cámara no soportada en este dispositivo.",
    cameraNoPermission: "No se pudo abrir la cámara / sin permiso.",
    lanSameNetworkRequiredTitle: "Se requiere la misma red",
    lanSameNetworkRequired: "Ambos teléfonos deben estar en la misma red de hotspot o Wi-Fi.",
    lanSameNetworkRequiredHint: "Activa el hotspot o conecta ambos teléfonos a la misma Wi-Fi y vuelve a escanear el QR.",
    hostOnlyAndroid: "HOST solo funciona en la app Android/Capacitor.",
    hostPluginMissing: "Falta el plugin WsHostServer en la compilación Android. Recompila e instala la app.",
    ipPortRequired: "IP y Puerto son obligatorios.",
    connectionFailed: "Error de conexión",
    hostNotReadyOrRefused: "El host no está listo o la conexión fue rechazada.",
    hostStartFailed: "No se pudo iniciar el HOST",
    hostStartFailedDot: "No se pudo iniciar el host.",
    tooLate: "Demasiado tarde.",
    notYourTurn: "No es tu turno.",
    tooFastRetry: "Demasiado rápido. Inténtalo de nuevo.",
    connectionDelayed: "Conexión retrasada. Inténtalo de nuevo.",
    opponentLeftMsg: "El rival se fue",
    connectFailedHint: "la IP/puerto del host podría ser incorrecta.",
    portInUse: "Este puerto está en uso. Prueba otro puerto o reinicia la app.",
    hostStartFailedDetail: "No se pudo iniciar el host.",
    detailPrefix: "Detalles:",
    navHome: "Inicio",
    navHowToPlay: "Cómo jugar",
    navPrivacy: "Privacidad",
    navContact: "Contacto"
  },
  ar: {
    title: "SALİSE LİGİ",
    subtitle: "كرة قدم بلمسة واحدة",
    startGame: "ابدأ المباراة",
    attack: "هجوم",
    ready: "هل أنت مستعد؟",
    reset: "تم إعادة تعيين اللعبة",
    settings: "الإعدادات",
    guide: "الدليل",
    mute: "كتم الصوت",
    unmute: "تشغيل الصوت",
    resetBtn: "إعادة تعيين",
    exit: "خروج",
    matchResult: "نتيجة المباراة",
    statistics: "إحصائيات",
    goals: "أهداف",
    yellowCard: "بطاقة صفراء",
    redCard: "بطاقة حمراء",
    penalties: "ركلات جزاء",
    mainMenu: "القائمة الرئيسية",
    playAgain: "العب مجدداً",
    goalExclam: "!هدف",
    champion: "!البطل",
    settingsTitle: "إعدادات اللعبة",
    homeTeam: "الفريق المضيف",
    awayTeam: "الفريق الضيف",
    duration: "مدة المباراة",
    frameColor: "لون الإطار",
    colorWhite: "أبيض",
    colorYellowRed: "أصفر - أحمر",
    colorYellowNavy: "أصفر - كحلي",
    colorBlackWhite: "أسود - أبيض",
    colorMaroonBlue: "نبيذي - أزرق",
    colorRedWhite: "أحمر - أبيض",
    colorBlueWhite: "أزرق - أبيض",
    save: "حفظ",
    language: "اللغة",
    howToPlay: "كيف تلعب؟",
    guideDesc: "اضغط على الكرة لبدء الجولة! أثناء دورانها، يتحرك الرقم في الفقاعة من 0 إلى 9. اضغط مجدداً لإيقافها — الرقم الظاهر هو نتيجتك.\nيُظهر شريط الوقت المتبقي. أوقف الكرة في الوقت المناسب وإلا ستتوقف تلقائياً.",
    guide0: "الفريق النشط يسجّل هدفاً والجمهور يحتفل!",
    guide1: "هجوم فاشل، الدور للخصم.",
    guide4: "بطاقة صفراء. بطاقتان صفراوان تعني حمراء.",
    guide3: "بطاقة حمراء! الخصم يحصل على ميزة (+1 دور).",
    guide6: "تسلل! الحكم يوقف اللعب.",
    guide7: "ركلة جزاء. اضغط الكرة للتسديد.",
    guide8: "لعب سريع، تُضاف +5 دقائق.",
    guideOther: "هجوم فاشل، الدور للخصم.",
    matchStarted: "بدأت المباراة..",
    ballInPlay: "المباراة جارية…",
    penaltyInPlay: "ركلة جزاء...",
    ruleRedTitle: "قاعدة البطاقة الحمراء:",
    ruleRedDesc: "يظهر رمز البطاقة الحمراء خلال أدوار الميزة. عند انتهاء الميزة يختفي الرمز ويفقد الخصم مكافأة \"+1\".",
    ruleYellowTitle: "قاعدة البطاقة الصفراء:",
    ruleYellowDesc: "تتراكم البطاقات الصفراء طوال المباراة. الصفراء الثانية تتحول تلقائياً إلى حمراء. عند إصدار حمراء تُصفّر صفراوات الفريق.",
    ruleAdvantageTitle: "نظام الميزة (+1):",
    ruleAdvantageDesc: "إذا حصل الخصم على بطاقة حمراء، يكسب الفريق النشط دوراً واحداً (مجموع دورين). حمراء في الدور الأول: تضيع الميزة. في الدور الثاني: الخصم يكسب دوراً.",
    rulePenTitle: "قاعدة ركلات الجزاء:",
    rulePenDesc: "إذا ظهر الرقم 7 يحصل الفريق النشط على ركلة جزاء. اضغط الكرة للتسديد. أرقام زوجية (0, 2, 4, 6, 8) = هدف، فردية (1, 3, 5, 7, 9) = ضياع. عند التعادل تبدأ ركلات الترجيح: 5 ركلات لكل فريق، وإذا استمر التعادل يُطبق \"الهدف الذهبي\".",
    seconds: "ثوانٍ",
    minutes: "دقائق",
    advantage: "+1",
    goalText: "!هدف",
    opponentGoal: "هدف للخصم!",
    fastGame: "لعب سريع",
    defense: "دفاع/خارج",
    noInternet: "لا يوجد اتصال بالإنترنت",
    checkConnection: "هذه اللعبة تحتاج اتصال إنترنت لتحميل المكتبات.",
    retry: "إعادة المحاولة",

    gameMode: "وضع اللعب",
    gameModeTitle: "اختر وضع اللعب",
    singleBot: "لاعب واحد (بوت)",
    twoPlayers: "لاعبان",
    opponentBot: "الخصم: بوت",
    botPlayerName: "لاعب بوت",

    botTurnTitle: "دور الخصم",
    botTurnSubtitle: "البوت يلعب…",
    lanOpponentTurnSubtitle: "الخصم يلعب…",

    lanTwoPhones: "هوتسبوت/واي فاي (هاتفان)",
    lanModalTitle: "وضع هاتفين",
    lanHost: "مضيف (سيرفر)",
    lanJoin: "انضمام (عميل)",
    lanHostStart: "بدء الاستضافة",
    lanStartMatch: "بدء المباراة",
    lanConnect: "اتصال",
    lanConnecting: "جارٍ الاتصال…",
    lanConnectedWaiting: "متصل، بانتظار المباراة",
    lanConnectedOverlayTitle: "✔ الخصم متصل",
    lanConnectedOverlaySubtitle: "جارٍ بدء المباراة…",
    lanReadyTimeout: "الخصم غير مستعد. حاول مجدداً.",
    lanStartTimeout: "تعذر بدء المباراة. حاول مجدداً.",
    lanConnectionError: "خطأ في الاتصال",
    lanConnectionLost: "انقطع الاتصال",
    lanReconnect: "إعادة الاتصال",
    lanBackToMenu: "العودة للقائمة",
    lanShowQr: "عرض QR",
    lanJoinWithQr: "انضمام عبر QR",
    lanContinue: "متابعة",
    lanCancel: "إلغاء",
    lanQrScanning: "جارٍ المسح…",
    lanQrInvalid: "QR غير صالح",
    lanQrPermissionInfo: "يلزم إذن الكاميرا لمسح رمز QR. لا يتم تخزين أي صور.",
    lanQrPermissionDenied: "تم رفض إذن الكاميرا. يمكنك إدخال IP/المنفذ يدوياً.",
    lanQrRetry: "إعادة المحاولة",
    lanQrManual: "إدخال يدوي",
    lanQrSettingsTitle: "يلزم إذن الكاميرا لمسح رموز QR.",
    lanQrSettingsBody: "تم تعيين \"عدم السؤال مجدداً\" في أندرويد. يمكنك تمكين الكاميرا من الإعدادات > التطبيقات > الأذونات.",
    lanOpenSettings: "فتح الإعدادات",
    lanGiveUp: "إلغاء",
    lanHostDisconnected: "انقطع اتصال الخصم",
    lanClientDisconnected: "انقطع الاتصال بالمضيف",
    lanReconnecting: "جارٍ إعادة الاتصال…",
    lanOpponentRejoined: "الخصم عاد ✅",
    lanResuming: "جارٍ الاستئناف…",
    lanOpponentDidNotReturn: "الخصم لم يعد",
    lanOpponentLeft: "الخصم غادر",
    lanCopy: "نسخ",
    lanHostIpPort: "عنوان المضيف IP:منفذ",
    lanPeers: "لاعب متصل",
    lanWaitingForPlayer: "بانتظار لاعب…",
    lanPlayerConnected: "لاعب متصل ✅",
    lanConnectedWaitingStart: "متصل ✅ بانتظار المضيف لبدء المباراة",
    lanGoToMatch: "إلى المباراة",
    lanConnectionOptionsTitle: "خيارات الاتصال",
    lanOption1Title: "1️⃣ الاتصال عبر الهوتسبوت",
    lanOption1Line1: "فعّل الهوتسبوت على هذا الهاتف.",
    lanOption1Line2: "الهاتف الآخر يجب أن يتصل بشبكة الهوتسبوت الخاصة بك.",
    lanOption2Title: "2️⃣ نفس شبكة واي فاي",
    lanOption2Line1: "أو وصّل كلا الهاتفين بنفس شبكة واي فاي.",
    lanOption3Title: "3️⃣ الانضمام للعبة",
    lanOption3Line1: "بعد الاتصال بنفس الشبكة، انضم تلقائياً عبر رمز QR.",
    lanOptionNote: "يجب أن يكون الهوتسبوت مفعلاً وجهاز واحد على الأقل متصل.",
    lanQrHostPreparing: "جارٍ تحضير المضيف…",
    lanQrHostReady: "المضيف جاهز ✅",
    lanQrHostStartNeeded: "يجب على هاتف المضيف الضغط على 'بدء الاستضافة'.",
    lanQrWaitingForHost: "بانتظار المضيف…",
    lanQrConnecting: "جارٍ الاتصال…",
    lanClientConnectInfo: "انضم بسرعة عبر رمز QR.",

    defaultHomeTeam: "الفريق المضيف",
    defaultAwayTeam: "الفريق الضيف",
    remainingLabel: "المتبقي",
    stopBall: "أوقف الكرة",
    backToMenu: "العودة للقائمة",
    guideShort: "دليل",
    selectedLabel: "المحدد:",
    chooseModeHint: "اختر وضع لعب للمتابعة.",
    langBtn: "اللغة",
    gameModeSelect: "اختر وضع اللعب",
    gameModeSelectShort: "الوضع",
    closeLabel: "إغلاق",
    modeSubtitle: "اختر وضعاً وابدأ",
    startBtn: "ابدأ",
    scoreLabel: "النتيجة",
    durationNote: "يمكن تغييرها قبل بدء المباراة",
    langSelectTitle: "اللغة",
    disconnectBtn: "قطع الاتصال",
    disconnectShort: "قطع",
    lanPickRole: "اختر دوراً للمتابعة.",
    qrCodeTitle: "رمز QR",
    qrScanAlign: "وجّه رمز QR داخل الإطار",
    penaltyLabel: "ركلة جزاء",
    offsideLabel: "تسلل",
    timeUpAutoStopped: "⏱ انتهى الوقت! توقف تلقائي.",
    hotspotIpNotFound: "لم يتم العثور على IP الهوتسبوت/واي فاي. هل الهوتسبوت مفعل وجهاز واحد على الأقل متصل؟",
    hotspotOffOrNoIp: "الهوتسبوت مغلق أو لم يتم العثور على IP.",
    hostStartFailedIpPort: "فشل بدء المضيف (IP/منفذ). هل الجهازان على نفس الشبكة؟",
    qrRenderFailed: "فشل إنشاء QR",
    qrScanMobileOnly: "مسح QR متاح فقط في تطبيق الهاتف.",
    cameraNotSupported: "الكاميرا غير مدعومة في هذا الجهاز.",
    cameraNoPermission: "تعذر فتح الكاميرا / لا يوجد إذن.",
    lanSameNetworkRequiredTitle: "مطلوب نفس الشبكة",
    lanSameNetworkRequired: "يجب أن يكون الهاتفان على نفس شبكة الهوتسبوت أو الواي فاي.",
    lanSameNetworkRequiredHint: "فعّل الهوتسبوت أو وصّل الهاتفين بنفس شبكة الواي فاي ثم امسح رمز QR مرة أخرى.",
    hostOnlyAndroid: "الاستضافة تعمل فقط على تطبيق Android/Capacitor.",
    hostPluginMissing: "إضافة WsHostServer غير موجودة. أعد بناء التطبيق وتثبيته.",
    ipPortRequired: "IP والمنفذ مطلوبان.",
    connectionFailed: "فشل الاتصال",
    hostNotReadyOrRefused: "المضيف غير جاهز أو تم رفض الاتصال.",
    hostStartFailed: "فشل بدء الاستضافة",
    hostStartFailedDot: "فشل بدء المضيف.",
    tooLate: "فات الأوان.",
    notYourTurn: "ليس دورك.",
    tooFastRetry: "سريع جداً. حاول مجدداً.",
    connectionDelayed: "تأخر الاتصال. حاول مجدداً.",
    opponentLeftMsg: "الخصم غادر",
    connectFailedHint: "قد يكون IP/منفذ المضيف غير صحيح.",
    portInUse: "هذا المنفذ مستخدم. جرّب منفذاً آخر أو أعد تشغيل التطبيق.",
    hostStartFailedDetail: "فشل بدء المضيف.",
    detailPrefix: "التفاصيل:",
    navHome: "الرئيسية",
    navHowToPlay: "طريقة اللعب",
    navPrivacy: "الخصوصية",
    navContact: "اتصل بنا"
  }
};

type AppLanguage = 'tr' | 'en' | 'de' | 'es' | 'ar';
const BASE_LANG: AppLanguage = 'en';

/** Safe translation accessor — falls back to BASE_LANG if key/language missing */
function getT(lang: AppLanguage): typeof TRANSLATIONS['tr'] {
  return TRANSLATIONS[lang] ?? TRANSLATIONS[BASE_LANG];
}

/** Safe toUpperCase — never throws on undefined/null */
const safeUpper = (s?: string) => (s ?? '').toUpperCase();

// Runtime key-coverage check (dev only, logs once)
(() => {
  const baseKeys = Object.keys(TRANSLATIONS[BASE_LANG]);
  for (const lang of Object.keys(TRANSLATIONS) as AppLanguage[]) {
    if (lang === BASE_LANG) continue;
    const missing = baseKeys.filter(k => !(k in TRANSLATIONS[lang]));
    if (missing.length) {
      console.warn(`[i18n] "${lang}" missing ${missing.length} key(s):`, missing);
    }
  }
})();

// Enum-like runtime constants + union types (keeps existing string-based logic simple)
const GAME_MODE = {
  BOT: 'BOT',
  LOCAL_2P: 'LOCAL_2P',
  LAN_2P: 'LAN_2P',
} as const;
type GameMode = (typeof GAME_MODE)[keyof typeof GAME_MODE];

const LAN_ROLE = {
  HOST: 'HOST',
  CLIENT: 'CLIENT',
} as const;
type LanRole = (typeof LAN_ROLE)[keyof typeof LAN_ROLE] | null;

type LanStatus =
  | 'idle'
  | 'hosting'
  | 'connecting'
  | 'connected'
  | 'waiting_start'
  | 'in_match'
  | 'error';

// ✅ ADIM 1: Top hareket flag'i (timer kontrolü için)
export let isBallMoving = false;

@customElement('gdm-playground')
export class Playground extends LitElement {
  @property({ type: String }) language: AppLanguage = 'en';

  @state() isWelcomeVisible = true;
  @state() isSummaryVisible = false;
  @state() isPlaying = false;
  @state() isAnimating = false; 
  @state() highlightTurn = false;
  @state() highlightTeam: 'Home' | 'Away' | null = null;
  @state() currentTurn: 'Home' | 'Away' = 'Home';
  @state() matchMinute = 0;
  @state() homeScore = 0;
  @state() awayScore = 0;
  
  @state() homeYellows = 0;
  @state() awayYellows = 0;
  @state() homeReds = 0;
  @state() awayReds = 0;

  @state() statsHomeYellows = 0;
  @state() statsAwayYellows = 0;
  @state() statsHomeReds = 0;
  @state() statsAwayReds = 0;

  @state() homePenalties = 0;
  @state() awayPenalties = 0;
  @state() lastEvent = "";
  @state() lastDigit: number | null = null;
  @state() liveDigit: number | null = null; // Sadece başlangıç/bitiş için, interval'da kullanılmaz
  @state() turnTimeLimitMs = 0;
  @state() turnDeadlineTs = 0;
  private liveDigitElement: HTMLElement | null = null; // DOM referansı
  private _lastBallInteractionTs = 0; // ✅ Double-trigger önleme için debounce

  private _ballButtonEl: HTMLElement | null = null;
  private _ballContentEl: HTMLElement | null = null;
  private _guideModalBackdropEl: HTMLElement | null = null;
  private _langModalBackdropEl: HTMLElement | null = null;
  private _lanModalBackdropEl: HTMLElement | null = null;
  private _lanQrCanvasEl: HTMLCanvasElement | null = null;
  private _lanQrLastPayload: string | null = null;
  private _lanQrCanvasInitialized = false;
  // QR scan guard fields
  private _lanQrHandled = false;
  private _lanQrLastRaw = '';
  private _lanQrLastRawAt = 0;
  private _lanQrSupported: boolean | null = null;
  private _uiAnimatingTimer: number | null = null;
  private _turnWarnTickTimer: number | null = null;
  private _turnAutoStopTimer: number | null = null;
  private readonly _debugEnabled = false;

  // Ball-hud state
  private _spinStartTs = 0;
  private _liveDigitTickTimer: number | null = null;
  @state() private ballHudVisible: boolean = false;
  @state() private ballHudMode: 'running' | 'result' = 'running';
  @state() private ballHudText: string = '';
  private _ballHudHideTimer: number | null = null;

  @state() matchDuration = 0.5; 
  @state() homeTeamName = "EV SAHİBİ";
  @state() awayTeamName = "DEPLASMAN";
  
  @state() isGoalActive = false;
  @state() goalTeam: 'Home' | 'Away' = 'Home';
  @state() isCardActive = false;
  @state() cardType: 'yellow' | 'red' = 'yellow';
  @state() cardTeam: 'Home' | 'Away' = 'Home';
  @state() isChampionActive = false;
  @state() winnerName = "";
  
  @state() isSettingsOpen = false;
  @state() isGuideOpen = false; // Ayarlar popup'ı gibi reactive state
  @state() isLanguageSelectOpen = false; // Ayarlar popup'ı gibi reactive state
  @state() isMuted = false;

  // --- Game Mode ---
  // null => user hasn't selected yet (welcome screen will keep Start disabled)
  @state() selectedGameMode: GameMode | null = null;

  // --- Game Mode Modal (new main-menu UX) ---
  @state() private _gameModeModalState: 'closed' | 'open' | 'closing' = 'closed';
  private _gameModeModalCloseTimer: number | null = null;

  // (Step 2 will extend this) - for now keep a simple placeholder modal
  @state() isLanModalOpen = false;
  @state() lanRole: LanRole = null;

  // ===== LAN Canonical State (Architecture) =====
  @state() lanStatus: LanStatus = 'idle';
  @state() lanErrorMessage: string | null = null;
  @state() hostIp: string | null = null;
  @state() hostPort = 8787;
  @state() connectedPeersCount = 0;
  @state() lanMatchHasBegun = false;
  @state() private hasKickoffHappened = false;
  @state() lanClientReadySent = false;
  @state() lanMatchJustStartedAt = 0;
  @state() lanFirstSnapshotReceived = false;

  // --- LAN Host/Client Flow (Step 3) ---
  @state() lanPort = 8787;
  @state() lanHostIp = '';
  @state() lanHostIface: string | null = null;
  @state() lanHostIpWarning: string | null = null;
  @state() hostIpLoading = false;
  @state() hostIpLastUpdatedAt = 0;
  @state() hostIpError: string | null = null;
  @state() lanHostRunning = false;
  @state() lanPeers = 0;
  @state() lanHostError: string | null = null;

  @state() lanClientIp = '';
  @state() lanClientPort = '8787';
  @state() lanClientStatus: 'idle' | 'connecting' | 'connected' | 'error' = 'idle';
  @state() lanClientError: string | null = null;
  @state() lanConnectionLost = false;
  @state() lanOpponentLeft = false;
  @state() lanOpponentLeftMessage: string | null = null;
  @state() isLanQrModalOpen = false;
  @state() isLanQrScanning = false;
  @state() isLanQrPermissionInfoOpen = false;
  @state() isLanQrSettingsHintOpen = false;
  @state() lanQrValue = '';
  @state() lanQrError: string | null = null;
  @state() lanQrScanFlash: 'success' | 'error' | null = null;
  @state() lanQrHostStatus: 'idle' | 'starting' | 'ready' | 'error' = 'idle';
  @state() lanQrHostMessage: string | null = null;
  @state() lanQrAutoConnectState: 'idle' | 'retrying' | 'failed' = 'idle';
  @state() lanQrAutoConnectMessage: string | null = null;
  @state() isLanSameNetworkPopupOpen = false;
  @state() lanSameNetworkPopupMessage: string | null = null;
  @state() lanReconnectState: 'idle' | 'reconnecting' | 'resumeCountdown' | 'timedOut' | 'opponentLeft' = 'idle';
  @state() lanReconnectSecondsLeft = 0;
  @state() lanResumeCountdown = 0;
  @state() lanReconnectAttempt = 0;
  private _lanWasEverConnected = false;

  private _lanHostTransport: HostTransport | null = null;
  private _lanClientTransport: ClientWebSocketTransport | null = null;
  private _lanHostStateTimer: number | null = null;
  private _lanLastSnapshotJson: string = '';
  private _lanInputSeq = 0;
  private _lanRecentActionIds: Set<string> = new Set();
  private _lanRecentActionIdQueue: string[] = [];
  // Client input retry/ack state
  private _lanPendingInput: { actionId: string; seq: number; sentAt: number; tries: number; timer: number | null } | null = null;
  @state() private _lanClientTapPending = false;
  private _lanLastClientTapAt = 0;
  @state() private _lanVisualPlayingOverride: boolean | null = null;
  private _lanSuppressNextBallSound = false;
  private _lanClientDesiredPlaying: boolean | null = null;
  private _lanClientQueuedToggle = false;
  private _lanStateSeq = 0;
  private _lanLastAppliedStateSeq = 0;
  private _lanLastInputSeqFromClient = 0;
  private _lanLastClientActionId: string | null = null;
  private _lanMatchSessionId: string | null = null;
  private _lanSnapshotScheduled = false;
  private _lanImmediateSnapshotScheduled = false;
  private _lanSnapshotDirty = true;
  private _lanLastSnapshotSentAt = 0;
  private _lanLastSnapshotLogAt = 0;
  // Delta/patch snapshot state (HOST)
  private _lanLastFullPayload: Record<string, any> | null = null;
  private _lanLastFullSeq = 0;
  private _lanPatchSinceFullCount = 0;
  private _lanLastFullSentAt = 0;
  private _lanLastApplyLogAt = 0;
  private _lanLastHostToggleLogAt = 0;
  private _lanLastRejectSnapshotAt = 0;
  private _lanLastSyncRequestAt = 0;
  private _lanLastAppliedSnapshotAt = 0;
  private _lanLastSyncRequestSentAt = 0;
  private _lanHostIpRetryTimer: number | null = null;
  private _lanHostIpPollTimer: number | null = null;
  private _lastHostErrorCode: string | null = null;
  private _lastHostIpLog: string | null = null;
  private _lastNoValidIpLogAt = 0;
  private _lanLastClientStateLogAt = 0;
  private _lanLastClientErrorCode: string | null = null;
  private _appStateListener: PluginListenerHandle | null = null;
  private _onResize?: () => void;

  // Client-side: queue incoming messages and consume in a loop
  private _lanIncomingQueue: LanMessage[] = [];
  private _lanConsumeRaf: number | null = null;
  // Delta/patch snapshot state (CLIENT)
  private _lanClientLastFullPayload: Record<string, any> | null = null;
  private _lanClientLastFullSeq = 0;
  private _lanPatchMissCount = 0;
  private _lanLastJoinResyncAt = 0;

  // Health/handshake
  private _lanPingTimer: number | null = null;
  private _lanLastPongAt = 0;
  private _lanMissedPongs = 0;
  private _lanToggleLockUntil = 0;
  private _lanAssignedPlayer: 1 | 2 | null = null;
  private _lanSeed: number | null = null;
  private _lanReconnectTimer: number | null = null;
  private _lanReconnectTickTimer: number | null = null;
  private _lanResumeCountdownTimer: number | null = null;
  private _lanReconnectStartedAt = 0;
  private _lanResumeShouldPlay = false;
  private _lanResumeHostOnActive = false;
  private _lanResumeClientOnActive = false;
  private _lanHostDisconnectDebounceTimer: number | null = null;
  private _lanClientDisconnectDebounceTimer: number | null = null;
  private _lanQrScanListener: PluginListenerHandle | null = null;
  private _lanQrAutoConnectTimer: number | null = null;
  private _lanQrAutoConnectAttempt = 0;
  private _lanClientReady = false;
  private _lanReadyTimer: number | null = null;
  private _lanMatchStartTimer: number | null = null;
  private _lanForceStartTimer: number | null = null;
  private _lanFirstSnapshotRetryTimer: number | null = null;
  private _lanFirstSnapshotWatchdogFiredAt = 0;
  private _lanLastReadyLogAt = 0;
  private _lanLastJoinLogAt = 0;
  private _lastLanStatus: LanStatus | null = null;
  private _lanOverlayGuardLogAt = 0;
  private _lanQrAutoOpened = false;
  private _lanNudgedJoinedOnce = false;

  @state() isPenaltyMode = false;
  @state() isMatchPenalty = false;
  @state() homePenResults: boolean[] = [];
  @state() awayPenResults: boolean[] = [];
  @state() extraTurns = 0;

  @state() currentBallIndex = 0;
  
  @state() isOnline = navigator.onLine;

  @state() private _isLandscape = false;

  @state() tempHomeTeamName = "";
  @state() tempAwayTeamName = "";
  @state() tempMatchDuration = 0.5;
  @state() tempBallIndex = 0;
  @state() tempLanguage: AppLanguage = 'en';
  @state() wasPlayingBeforeModal = false;

  private _nonBotAwayTeamName: string | null = null;
  private _botDisplayName: string | null = null;

  private readonly _botNamePool = [
    'Messio',
    'Ronaldi',
    'Mbappex',
    'Neymario',
    'Benzemi',
    'Modrich',
    'DeBruyno',
    'Haalandor',
    'Salahin',
    'Lewandor',
  ];

  // --- Bot difficulty config (tweak here) ---
  // Botun hemen oynamasını engellemek için reaksiyon süresini artırdık (1–2sn)
  private botReactionMin = 1200;
  private botReactionMax = 1800;
  private botHoldMin = 300;
  private botHoldMax = 650;

  private _botStartTimeout: number | null = null;
  private _botStopTimeout: number | null = null;

  // ✅ Banner kontrolü için final state
  @state() private _bannerVisible = false;

  // ✅ Ads init için final kontrol
  private _adsInitPromise: Promise<void> | null = null;

  ballTypes = [
    { nameKey: 'colorWhite' as const, css: 'border: 6px solid #ffffff;' },
    { nameKey: 'colorYellowRed' as const, css: 'border: 6px solid; border-color: #ffcc00 #a50000 #ffcc00 #a50000;' },
    { nameKey: 'colorYellowNavy' as const, css: 'border: 6px solid; border-color: #ffed00 #002d72 #ffed00 #002d72;' },
    { nameKey: 'colorBlackWhite' as const, css: 'border: 6px solid; border-color: #000000 #ffffff #000000 #ffffff;' },
    { nameKey: 'colorMaroonBlue' as const, css: 'border: 6px solid; border-color: #800000 #00a2e8 #800000 #00a2e8;' },
    { nameKey: 'colorRedWhite' as const, css: 'border: 6px solid; border-color: #e30a17 #ffffff #e30a17 #ffffff;' },
    { nameKey: 'colorBlueWhite' as const, css: 'border: 6px solid; border-color: #0057b7 #ffffff #0057b7 #ffffff;' }
  ];

  @property() onBallClick?: (isPlaying: boolean) => void;
  @property() onReset?: () => void;
  @property() onGameStart?: () => void;
  @property() onMuteToggle?: (muted: boolean) => void;
  @property() onPauseGame?: () => void;
  @property() onResumeGame?: () => void;
  @property() onButtonClick?: () => void;
  @property() onLanSoundEvent?: (event: 'goal' | 'yellowCard' | 'redCard' | 'whistle' | 'impact' | 'champion') => void;

  async connectedCallback() {
    super.connectedCallback();

    // Kaydedilmiş dili yükle
    try {
      const savedLang = localStorage.getItem('saliseligi-lang') as AppLanguage | null;
      if (savedLang && ['tr', 'en', 'de', 'es', 'ar'].includes(savedLang)) {
        this.language = savedLang;
      }
    } catch {}

    this.lastEvent = getT(this.language).ready;
    this._updateDefaultTeamNames();

    // Dili header'a bildir
    this._dispatchLanguageChange();

    // Game mode persistence (v2) + migration from older values
    try {
      const savedV2 = localStorage.getItem('salise_game_mode_v2');
      if (savedV2 === 'BOT' || savedV2 === 'LOCAL_2P') {
        this.selectedGameMode = savedV2 as GameMode;
      } else {
        const savedLegacy = localStorage.getItem('salise_game_mode');
        if (savedLegacy === 'SINGLE_BOT') this.selectedGameMode = 'BOT';
        if (savedLegacy === 'TWO_PLAYERS_SAME_PHONE') this.selectedGameMode = 'LOCAL_2P';
      }
    } catch {
      // ignore storage errors
    }

    this._enforceAwayTeamNameRules();
    
    window.addEventListener('online', this._handleOnline);
    window.addEventListener('offline', this._handleOffline);

    if (typeof window !== 'undefined') {
      this._isLandscape = this._computeIsLandscape();
      window.addEventListener('resize', this._handleViewportChange, { passive: true } as any);
      window.addEventListener('orientationchange', this._handleViewportChange, { passive: true } as any);
      this._onResize = () => requestAnimationFrame(() => this._positionTurnTimeHintLandscape());
      window.addEventListener('resize', this._onResize, { passive: true } as any);
      window.addEventListener('orientationchange', this._onResize, { passive: true } as any);
    }

    if (Capacitor.isNativePlatform()) {
      try {
        this._appStateListener = await App.addListener('appStateChange', (state) => {
          if (this.selectedGameMode !== 'LAN_2P') return;

          if (state.isActive) {
            if (this.isLanQrScanning) void this._stopQrScan();
            if (this.lanRole === 'HOST' && this._lanResumeHostOnActive) {
              this._lanResumeHostOnActive = false;
              void this._startLanHost().then(() => {
                if (this.lanStatus === 'in_match') this._beginLanReconnectFlow();
              });
            }
            if (this.lanRole === 'CLIENT' && this._lanResumeClientOnActive) {
              this._lanResumeClientOnActive = false;
              this._beginLanReconnectFlow();
            }
            return;
          }

          if (this.isLanQrScanning) void this._stopQrScan();
          if (this.isLanQrPermissionInfoOpen) this._closeQrPermissionInfo();
          if (this.isLanQrSettingsHintOpen) this._closeQrSettingsHint();
          if (this.lanRole === 'HOST') {
            if (this.lanHostRunning || this.lanStatus === 'in_match') this._lanResumeHostOnActive = true;
            void this._stopLanHost();
          }
          if (this.lanRole === 'CLIENT') {
            if (this.lanStatus === 'in_match') this._lanResumeClientOnActive = true;
            void this._disconnectLanClient();
          }
        });
      } catch (e) {
        console.warn('[LAN] App state listener setup failed', e);
      }
    }

    this.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // ✅ Banner padding için: CSS variable’ı garanti et (component root)
    // (Banner dp yüksekliğini baz alarak)
    this.style.setProperty('--bannerH', `${BANNER_HEIGHT_DP}px`);

    // ✅ Ads init sadece 1 kez (promise cache)
    await this._ensureAdsInit();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('online', this._handleOnline);
    window.removeEventListener('offline', this._handleOffline);

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._handleViewportChange as any);
      window.removeEventListener('orientationchange', this._handleViewportChange as any);
      if (this._onResize) {
        window.removeEventListener('resize', this._onResize as any);
        window.removeEventListener('orientationchange', this._onResize as any);
      }
    }
    try {
      this._appStateListener?.remove();
    } catch {
      // ignore
    }
    void this._stopQrScan();
    this._appStateListener = null;
    this._onResize = undefined;

    this.liveDigitElement = null;

    this._clearBotTimers();
  
    // ✅ Component kapanırken: pending işlemleri öldür + banner state’i kapat
    this._bannerVisible = false;
    const token = ++this._bannerOpToken;
  
    // ✅ Token’lı kapat (await yok çünkü disconnectedCallback async değil)
    this._hideBannerNow(token);
  }

  private _isAnyModalOpen(): boolean {
    return (
      this.isSettingsOpen ||
      this.isGuideOpen ||
      this.isLanguageSelectOpen ||
      this.isLanModalOpen ||
      this._gameModeModalState !== 'closed'
    );
  }

  private _computeIsLandscape(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(orientation: landscape)')?.matches ?? (window.innerWidth > window.innerHeight);
  }

  private _handleViewportChange = () => {
    if (typeof window === 'undefined') return;
    const v = this._computeIsLandscape();
    if (v !== this._isLandscape) this._isLandscape = v;
  };

  private _positionTurnTimeHintLandscape() {
    if (typeof window === 'undefined') return;
    const hint = this.renderRoot.querySelector('.turn-time-hint') as HTMLElement | null;
    if (!hint) return;

    if (!this._isLandscape) {
      hint.style.top = '';
      hint.style.left = '';
      hint.style.transform = '';
      return;
    }

    const ball = this.renderRoot.querySelector('.ball-button') as HTMLElement | null;
    const controls = this.renderRoot.querySelector('.bottom-controls') as HTMLElement | null;
    if (!ball || !controls) return;

    const ballRect = ball.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();

    const targetY = ballRect.bottom + (controlsRect.top - ballRect.bottom) * 0.7;
    let topPx = targetY - hostRect.top;
    const minTop = (ballRect.bottom - hostRect.top) + 12;
    const maxTop = (controlsRect.top - hostRect.top) - 12;
    topPx = Math.max(minTop, Math.min(maxTop, topPx));

    hint.style.top = `${topPx}px`;
    hint.style.left = '50%';
    hint.style.transform = 'translate3d(-50%, -50%, 0)';
  }

  private _isBotEnabled(): boolean {
    return (
      this.selectedGameMode === 'BOT' &&
      !this.isWelcomeVisible &&
      !this.isSummaryVisible &&
      this.isOnline &&
      !this._isAnyModalOpen()
    );
  }

  private _isBotTurn(): boolean {
    return this._isBotEnabled() && this.currentTurn === 'Away';
  }

  private _isLanOpponentTurn(): boolean {
    if (this.selectedGameMode !== 'LAN_2P') return false;
    return !this._isLanLocalTurn();
  }

  private _shouldShowBannerNow(): boolean {
    if (!this.isOnline && this.selectedGameMode !== 'LAN_2P') return false;
    if (this.isSummaryVisible || this.isChampionActive) return false;

    if (this._isLandscape === false) return true;

    const landscapeAllowBanner =
      this.isWelcomeVisible ||
      this.isSettingsOpen ||
      this.isGuideOpen ||
      this._isAnyModalOpen() ||
      !this.isPlaying;

    if (this.selectedGameMode === 'LAN_2P') {
      if (this.lanReconnectState !== 'idle') return true;
      if (this.isPlaying) return !this._isLanLocalTurn();
    }

    return landscapeAllowBanner;
  }

  private _clearBotTimers() {
    if (this._botStartTimeout !== null) {
      clearTimeout(this._botStartTimeout);
      this._botStartTimeout = null;
    }
    if (this._botStopTimeout !== null) {
      clearTimeout(this._botStopTimeout);
      this._botStopTimeout = null;
    }
  }

  private _randInt(min: number, max: number) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.floor(lo + Math.random() * (hi - lo + 1));
  }

  private _maybeScheduleBotTurn() {
    if (!this._isBotTurn()) return;
    if (this.isAnimating || this.isChampionActive || this.isSummaryVisible) return;
    if (this._isAnyModalOpen()) return;

    this._clearBotTimers();

    const reactionDelay = this._randInt(this.botReactionMin, this.botReactionMax);
    const holdDelay = this._randInt(this.botHoldMin, this.botHoldMax);

    // If the ball is already spinning (e.g. match penalty auto-start), schedule only the stop.
    if (!this.isPlaying) {
      this._botStartTimeout = window.setTimeout(() => {
        if (!this._isBotTurn()) return;
        if (this.isAnimating || this.isChampionActive || this.isSummaryVisible) return;
        if (this._isAnyModalOpen()) return;
        if (this.isPlaying) return;
        this._handleBallClick();
      }, reactionDelay);
    }

    this._botStopTimeout = window.setTimeout(() => {
      if (!this._isBotTurn()) return;
      if (this.isAnimating || this.isChampionActive || this.isSummaryVisible) return;
      if (this._isAnyModalOpen()) return;
      if (!this.isPlaying) return;
      this._handleBallClick();
    }, reactionDelay + holdDelay);
  }
  

  private _ensureAdsInit() {
    if (!this._adsInitPromise) {
      this._adsInitPromise = adsService.init().catch((e: any) => {
        // init hata alırsa bir daha denenebilsin diye null’a çekiyoruz
        this._adsInitPromise = null;
        throw e;
      });
    }
    return this._adsInitPromise;
  }

  private _handleOffline = () => {
    this.isOnline = false;
    if (this.selectedGameMode === 'LAN_2P') return;
    if (this.isPlaying && this.onPauseGame) this.onPauseGame();
    this._clearBotTimers();
    this._bannerVisible = false;
    const token = ++this._bannerOpToken;
    this._hideBannerNow(token);
  }

  private _handleOnline = () => {
    window.location.reload();
  }

  protected createRenderRoot() { return this; }

   // class içine ekle
private _bannerOpToken = 0;

protected updated(_changed: Map<string, any>) {
  // ── RTL / lang attribute sync ──
  if (_changed.has('language')) {
    const isRtl = this.language === 'ar';
    this.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    this.setAttribute('lang', this.language);
  }

  if (_changed.has('isPlaying')) {
    this.classList.toggle('ball-live', this.isPlaying);
  }

  // ✅ Banner kararını sadece banner'ı etkileyen state'ler değiştiğinde çalıştır
  const bannerRelevantChange =
    _changed.has('isWelcomeVisible') ||
    _changed.has('isSummaryVisible') ||
    _changed.has('isPlaying') ||
    _changed.has('selectedGameMode') ||
    _changed.has('isSettingsOpen') ||
    _changed.has('isGuideOpen') ||
    _changed.has('isLanguageSelectOpen') ||
    _changed.has('isLanModalOpen') ||
    _changed.has('_gameModeModalState') ||
    _changed.has('isOnline') ||
    _changed.has('isPenaltyMode') ||
    _changed.has('isMatchPenalty') ||
    _changed.has('_isLandscape') ||
    _changed.has('isChampionActive') ||
    _changed.has('_bannerVisible');

  if (bannerRelevantChange) {
    const shouldShow = this._shouldShowBannerNow();
    const token = ++this._bannerOpToken;

    if (!shouldShow) {
      this._bannerVisible = false;
      const reserveSpace = this._isLandscape;
      const bannerValue = reserveSpace ? `${BANNER_HEIGHT_DP}px` : '0px';
      this.style.setProperty('--bannerH', bannerValue);
      this.style.setProperty('--bannerOffset', bannerValue);
      this._hideBannerNow(token);
    } else {
      const bannerValue = `${BANNER_HEIGHT_DP}px`;
      this._bannerVisible = true;
      this.style.setProperty('--bannerH', bannerValue);
      this.style.setProperty('--bannerOffset', bannerValue);
      this._showBannerNow(token);
    }
  }

  // Bot scheduling/cleanup hooks (kept lightweight; only setTimeout-based)
  const botRelevantChange =
    _changed.has('currentTurn') ||
    _changed.has('isPlaying') ||
    _changed.has('isMatchPenalty') ||
    _changed.has('isPenaltyMode') ||
    _changed.has('isWelcomeVisible') ||
    _changed.has('isSummaryVisible') ||
    _changed.has('isOnline') ||
    _changed.has('selectedGameMode') ||
    _changed.has('isSettingsOpen') ||
    _changed.has('isGuideOpen') ||
    _changed.has('isLanguageSelectOpen') ||
    _changed.has('isLanModalOpen') ||
    _changed.has('_gameModeModalState');

  if (botRelevantChange) {
    if (!this._isBotTurn()) {
      this._clearBotTimers();
      return;
    }
    this._maybeScheduleBotTurn();
  }

  const lanHostSnapshotRelevantChange =
    _changed.has('isPlaying') ||
    _changed.has('currentTurn') ||
    _changed.has('homeScore') ||
    _changed.has('awayScore') ||
    _changed.has('matchMinute') ||
    _changed.has('extraTurns') ||
    _changed.has('isPenaltyMode') ||
    _changed.has('isMatchPenalty');

  if (
    lanHostSnapshotRelevantChange &&
    this.selectedGameMode === 'LAN_2P' &&
    this.lanRole === 'HOST' &&
    this.lanHostRunning
  ) {
    this._lanSnapshotDirty = true;
    this._lanScheduleImmediateSnapshot();
  }

  const lanTimerRelevantChange =
    _changed.has('lanStatus') ||
    _changed.has('isSummaryVisible') ||
    _changed.has('isWelcomeVisible') ||
    _changed.has('isLanModalOpen') ||
    _changed.has('lanRole') ||
    _changed.has('lanHostRunning') ||
    _changed.has('selectedGameMode');

  if (lanTimerRelevantChange) {
    const inLanMatch = this.selectedGameMode === 'LAN_2P' && this.lanStatus === 'in_match';

    if (inLanMatch) {
      if (this.lanRole === 'HOST' && this.lanHostRunning) {
        this._startLanHostStateBroadcast();
      }
      if (this.lanRole) {
        this._startLanPingLoop();
      }
      if (this.lanRole !== 'HOST') {
        this._stopLanIpPolling();
      }
      return;
    }

    if (this.isSummaryVisible || !this.isLanModalOpen) {

  if (this._shouldShowTurnHint()) {
    requestAnimationFrame(() => this._positionTurnTimeHintLandscape());
  }
      this._stopLanHostStateBroadcast();
      this._stopLanPingLoop();
      this._stopLanIpPolling();
    } else if (this.lanRole !== 'HOST') {
      this._stopLanIpPolling();
    }
  }

  if (_changed.has('lanStatus')) {
    const prev = this._lastLanStatus;
    const next = this.lanStatus;
    if (prev !== next) {
      console.info('[LAN] status', { from: prev, to: next });
      this._lastLanStatus = next;
      if (this.selectedGameMode === 'LAN_2P') {
        this._setLanKeepAwake(this.lanStatus === 'in_match');
      }
    }
  }
}

  private _openGameModeModal() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    if (this._gameModeModalCloseTimer !== null) {
      clearTimeout(this._gameModeModalCloseTimer);
      this._gameModeModalCloseTimer = null;
    }
    this._gameModeModalState = 'open';
    document.body.classList.add('modal-open');
    this._pulseUiAnimating();
  }

  private _closeGameModeModal() {
    if (this._gameModeModalState === 'closed') return;
    if (this._gameModeModalCloseTimer !== null) {
      clearTimeout(this._gameModeModalCloseTimer);
      this._gameModeModalCloseTimer = null;
    }
    this._gameModeModalState = 'closing';
    this._gameModeModalCloseTimer = window.setTimeout(() => {
      this._gameModeModalState = 'closed';
      document.body.classList.remove('modal-open');
      this._gameModeModalCloseTimer = null;
    }, 110);
    this._pulseUiAnimating();
  }

  private _startFromGameModeModal() {
    const mode = this.selectedGameMode;
    if (!mode) return;

    // Close first for smooth UX
    this._closeGameModeModal();

    window.setTimeout(() => this._startGame(), 110);
  }

protected firstUpdated(changedProperties: Map<string | number | symbol, unknown>) {
  super.firstUpdated(changedProperties);
  this.updateComplete.then(() => this._cacheUiRefs());
  }

  private _cacheUiRefs() {
    const root = this.renderRoot as HTMLElement | ShadowRoot | null;
    if (!root) return;
    if (!this._ballButtonEl) this._ballButtonEl = root.querySelector('.ball-button') as HTMLElement | null;
    if (!this._ballContentEl) this._ballContentEl = root.querySelector('.ball-content') as HTMLElement | null;
    if (!this._guideModalBackdropEl) this._guideModalBackdropEl = root.querySelector('#guideModalBackdrop') as HTMLElement | null;
    if (!this._langModalBackdropEl) this._langModalBackdropEl = root.querySelector('#langModalBackdrop') as HTMLElement | null;
    if (!this._lanModalBackdropEl) this._lanModalBackdropEl = root.querySelector('.lan-modal-backdrop') as HTMLElement | null;
    if (!this._lanQrCanvasEl) this._lanQrCanvasEl = root.querySelector('#lanQrCanvas') as HTMLCanvasElement | null;
    if (!this.liveDigitElement) this.liveDigitElement = root.querySelector('#liveDigitEl') as HTMLElement | null;
  }

  private _pulseUiAnimating() {
    if (this._uiAnimatingTimer) window.clearTimeout(this._uiAnimatingTimer);
    document.body.classList.add('ui-animating');
    this._uiAnimatingTimer = window.setTimeout(() => {
      document.body.classList.remove('ui-animating');
      this._uiAnimatingTimer = null;
    }, 260);
  }

  private _debugLog(...args: unknown[]) {
    if (!this._debugEnabled) return;
    console.log(...args);
  }

  private _clearLanHostDisconnectDebounce() {
    if (!this._lanHostDisconnectDebounceTimer) return;
    clearTimeout(this._lanHostDisconnectDebounceTimer);
    this._lanHostDisconnectDebounceTimer = null;
  }

  private _scheduleLanHostDisconnectDebounce() {
    this._clearLanHostDisconnectDebounce();
    console.warn('[LAN][HOST] clientCount=0 debounce start');
    this._lanHostDisconnectDebounceTimer = window.setTimeout(() => {
      this._lanHostDisconnectDebounceTimer = null;
      if (
        this.connectedPeersCount === 0 &&
        this.lanStatus === 'in_match' &&
        !this.isWelcomeVisible &&
        !this.isSummaryVisible
      ) {
        console.warn('[LAN][HOST] clientCount still 0 after debounce -> begin reconnect');
        this._beginLanReconnectFlow();
      }
    }, 1500);
  }

  private _clearLanClientDisconnectDebounce() {
    if (!this._lanClientDisconnectDebounceTimer) return;
    clearTimeout(this._lanClientDisconnectDebounceTimer);
    this._lanClientDisconnectDebounceTimer = null;
  }

  private _scheduleLanClientDisconnectDebounce(kind: 'disconnected' | 'error') {
    this._clearLanClientDisconnectDebounce();
    console.warn('[LAN][CLIENT] disconnect debounce start', { kind });
    this._lanClientDisconnectDebounceTimer = window.setTimeout(() => {
      this._lanClientDisconnectDebounceTimer = null;
      if (
        this.lanRole === 'CLIENT' &&
        this.selectedGameMode === 'LAN_2P' &&
        this.lanStatus === 'in_match' &&
        !this.isWelcomeVisible &&
        !this.isSummaryVisible &&
        !this._lanClientTransport?.isConnected()
      ) {
        console.warn('[LAN][CLIENT] still disconnected -> begin reconnect');
        this._beginLanReconnectFlow();
      }
    }, 1500);
  }

  private _setLanKeepAwake(shouldKeep: boolean) {
    try {
      const plugins = (Capacitor as any)?.Plugins;
      const keepAwake = plugins?.KeepAwake;
      if (!keepAwake) return;
      if (shouldKeep && typeof keepAwake.keepAwake === 'function') {
        void keepAwake.keepAwake();
      } else if (!shouldKeep && typeof keepAwake.allowSleep === 'function') {
        void keepAwake.allowSleep();
      }
    } catch {
      // ignore
    }
  }

private async _showBannerNow(token?: number) {
  if (!this._shouldShowBannerNow()) return;

  try {
    await this._ensureAdsInit();

    // Eğer bu show çağrısı “eski” kaldıysa iptal
    if (token && token !== this._bannerOpToken) return;

    // ✅ FORCE KULLANMA (spam’i keser)
    await adsService.showBanner(false);
       } catch (e) {
    console.error('[Playground] showBanner error:', e);
       }
     }

/** Race a promise against a timeout; resolves null on timeout/error. */
private _withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | null> {
  return Promise.race([
    p.catch((e: unknown) => { console.warn(`[ADS] error ${label}:`, e); return null as T | null; }),
    new Promise<null>(r => setTimeout(() => { console.warn(`[ADS] timeout ${label} (${ms}ms)`); r(null); }, ms)),
  ]);
}

private async _hideBannerNow(token?: number) {
  try {
    // Eğer bu hide çağrısı “eski” kaldıysa iptal
    if (token && token !== this._bannerOpToken) return;

    await adsService.hideBanner();
  } catch (e) {
    console.error('[Playground] hideBanner error:', e);
  }
}


  // --- OYUN FONKSİYONLARI (Aşağısı senin mevcut kodunla aynı) ---

  handleSoccerEvent(params: any) {
    if (params.type === 'goal') {
      if (params.homeScore !== undefined) this.homeScore = params.homeScore;
      if (params.awayScore !== undefined) this.awayScore = params.awayScore;
    } else if (params.type === 'card') {
      if (params.team === 'Home') {
        if (params.cardType === 'yellow') {
             this.homeYellows++;
             this.statsHomeYellows++;
        } else {
             this.homeReds++;
             this.statsHomeReds++;
        }
      } else {
        if (params.cardType === 'yellow') {
             this.awayYellows++;
             this.statsAwayYellows++;
        } else {
             this.awayReds++;
             this.statsAwayReds++;
        }
      }
    } else if (params.type === 'time') {
      this.matchMinute = params.minutes;
    }
  }

  setLastEvent(text: string, digit: number | null) {
    this.lastEvent = text;
    this.lastDigit = digit;
    if (digit != null) {
      this._showBallHudResult(digit);
    } else if (this.isPlaying) {
      this._showBallHudRunning();
    }
  }

  // ── Ball-hud helpers ──

  private _clearBallHudTimers() {
    if (this._ballHudHideTimer) {
      clearTimeout(this._ballHudHideTimer);
      this._ballHudHideTimer = null;
    }
  }

  private _showBallHudRunning() {
    this.ballHudVisible = true;
    this.ballHudMode = 'running';
    this.requestUpdate();
  }

  private _showBallHudResult(digit: number | null) {
    if (digit == null) return;
    this.ballHudVisible = true;
    this.ballHudMode = 'result';
    this.ballHudText = String(digit);
    this._clearBallHudTimers();
    this._ballHudHideTimer = window.setTimeout(() => {
      this.ballHudVisible = false;
      this.requestUpdate();
    }, 1200);
    this.requestUpdate();
  }

  private _startLiveDigitTicker() {
    if (this._liveDigitTickTimer != null) return;
    this._liveDigitTickTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      const tickMs = 85;
      const d = Math.floor((Date.now() - this._spinStartTs) / tickMs) % 10;
      if (this.liveDigit !== d) this.liveDigit = d;
      const s = String(d);
      if (this.ballHudMode === 'running' && this.ballHudText !== s) {
        this.ballHudText = s;
      }
      this.requestUpdate();
    }, 85);
  }

  private _stopLiveDigitTicker() {
    if (this._liveDigitTickTimer == null) return;
    clearInterval(this._liveDigitTickTimer);
    this._liveDigitTickTimer = null;
  }

  triggerGoal(team: 'Home' | 'Away') {
    this.goalTeam = team;
      this.isGoalActive = true;
      this.isAnimating = true;
      setTimeout(() => { 
        this.isGoalActive = false; 
        this.isAnimating = false;
      this._highlightTurnIndicator();
      this._maybeScheduleBotTurn();
      if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') this._lanScheduleImmediateSnapshot();
    }, 2000);
  }

  triggerYellowCard(team: 'Home' | 'Away') {
    if (team === 'Home') {
         this.homeYellows++;
      this.statsHomeYellows++;
    } else {
         this.awayYellows++;
      this.statsAwayYellows++;
    }
    this.cardTeam = team;
    this.cardType = 'yellow';
    this.isCardActive = true;
    this.isAnimating = true;
    setTimeout(() => { 
      this.isCardActive = false; 
      this.isAnimating = false;
      this._highlightTurnIndicator();
      this._maybeScheduleBotTurn();
      if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') this._lanScheduleImmediateSnapshot();
    }, 2500);
  }

  triggerRedCard(team: 'Home' | 'Away') {
    if (team === 'Home') {
      this.homeReds++;
      this.statsHomeReds++;
      this.homeYellows = 0;
    } else {
      this.awayReds++;
      this.statsAwayReds++;
      this.awayYellows = 0;
    }
    this.cardTeam = team;
    this.cardType = 'red';
    this.isCardActive = true;
    this.isAnimating = true;
    setTimeout(() => { 
      this.isCardActive = false; 
      this.isAnimating = false;
      this._highlightTurnIndicator();
      this._maybeScheduleBotTurn();
      if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') this._lanScheduleImmediateSnapshot();
    }, 3500);
  }

  triggerChampionship(name: string) {
    this._clearBotTimers();
    this.winnerName = name;
    this.isChampionActive = true;
    this.isAnimating = true;
  }
  
  async showSummary() {
    this._clearTurnTimers();
    this.turnTimeLimitMs = 0;
    this.turnDeadlineTs = 0;
    // 1) Önce istatistik ekranını aç
    this.isSummaryVisible = true;
    this._clearBotTimers();

    // LAN: send a final snapshot, then stop periodic broadcasts/pings
    if (this.selectedGameMode === 'LAN_2P') {
      if (this.lanRole === 'HOST') this._sendLanStateSnapshot(true);
      this._stopLanHostStateBroadcast();
      this._stopLanPingLoop();
      this._stopLanIpPolling();
      this._setLanKeepAwake(false);
    }
  
    // 2) DOM’u çizdir
    await this.updateComplete;

    // Match-end interstitial init should start before the 1s wait (best-effort, bloklamaz)
    adsService.init().catch(() => {});
 
    // 3) 1 sn göster
    await new Promise(r => setTimeout(r, 1000));
  
    // 4) Sonra reklam aç
    try {
      await adsService.showInterstitialMatchEnd();
    } catch (e) {
      console.error('[Playground] Interstitial error:', e);
    }
  
    // 5) Reklam sonrası istatistik ekranda kalır (state zaten true)
  }
  
  

  toggleTurn(reason = 'toggle') {
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole !== 'HOST') {
      this._debugLog('[LAN] client toggleTurn ignored', { reason });
      return;
    }

    const prev = this.currentTurn;
    this.currentTurn = this.currentTurn === 'Home' ? 'Away' : 'Home';
    if (!this.isAnimating) this._highlightTurnIndicator();
    if (this._isBotTurn()) this._maybeScheduleBotTurn();
    else this._clearBotTimers();

    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') {
      // Force FULL snapshot on turn toggle — critical transition
      this._sendLanStateSnapshot(true);
      this._lanScheduleImmediateSnapshot();
      this._debugLog('[LAN] turn advanced (force full)', { reason, from: prev, to: this.currentTurn });
    }
  }

  private _highlightTurnIndicator(team?: 'Home' | 'Away') {
    const teamToHighlight = team || this.currentTurn;
    this.highlightTurn = true;
    this.highlightTeam = teamToHighlight;
    setTimeout(() => {
      this.highlightTurn = false;
      this.highlightTeam = null;
    }, 1500);
  }

  incrementPenaltyStat(team: 'Home' | 'Away') {
    if (team === 'Home') this.homePenalties++; else this.awayPenalties++;
  }

  _openSettings() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    this._clearBotTimers();

    this.tempHomeTeamName = this.homeTeamName;
    this._enforceAwayTeamNameRules();
    this.tempAwayTeamName = this.awayTeamName;
    this.tempMatchDuration = this.matchDuration;
    this.tempBallIndex = this.currentBallIndex;
    this.tempLanguage = this.language;

    this.wasPlayingBeforeModal = this.isPlaying;
    if (this.isPlaying && this.onPauseGame) this.onPauseGame();
    
    this.isSettingsOpen = true;
    this._pulseUiAnimating();
  }

  _closeSettings() {
    this.isSettingsOpen = false;
    if (this.wasPlayingBeforeModal && this.onResumeGame) this.onResumeGame();
    this._maybeScheduleBotTurn();
    this._pulseUiAnimating();
  }

  _saveSettings() {
    const langChanged = this.language !== this.tempLanguage;
    this.language = this.tempLanguage;

    let canEditHomeName = true;
    let canEditAwayName = this.selectedGameMode !== 'BOT';
    if (this.selectedGameMode === 'LAN_2P') {
      if (this.lanRole === 'HOST') {
        canEditHomeName = true;
        canEditAwayName = false;
      } else if (this.lanRole === 'CLIENT') {
        canEditHomeName = false;
        canEditAwayName = true;
      }
    }

    if (canEditHomeName) this.homeTeamName = this.tempHomeTeamName;
    if (canEditAwayName) this.awayTeamName = this.tempAwayTeamName;
    if (!this._isMatchDurationLocked()) {
      this.matchDuration = this.tempMatchDuration;
    }
    this.currentBallIndex = this.tempBallIndex;

    this._updateDefaultTeamNames();
    this._enforceAwayTeamNameRules();

    if (
      this.selectedGameMode === 'LAN_2P' &&
      this.lanRole === 'CLIENT' &&
      this._lanClientTransport?.isConnected()
    ) {
      const join: LanMessage = { t: 'join', name: this.awayTeamName || 'Player 2' };
      this._lanClientTransport.send(JSON.stringify(join));
    }
    
    if (langChanged) {
        if (!this.isPlaying && this.lastDigit === null) {
             this.lastEvent = getT(this.language).ready;
        }
        this._dispatchLanguageChange();
    }

    this.isSettingsOpen = false;

    if (this.wasPlayingBeforeModal && this.onResumeGame) this.onResumeGame();
    this._maybeScheduleBotTurn();
  }
  
  _updateDefaultTeamNames() {
      const allDefaultHome = Object.values(TRANSLATIONS).map(t => t.defaultHomeTeam);
      const allDefaultAway = Object.values(TRANSLATIONS).map(t => t.defaultAwayTeam);
      const t = getT(this.language);
      if (allDefaultHome.includes(this.homeTeamName)) {
          this.homeTeamName = t.defaultHomeTeam;
      }
      if (this.selectedGameMode !== 'BOT') {
          if (allDefaultAway.includes(this.awayTeamName)) {
              this.awayTeamName = t.defaultAwayTeam;
          }
          this._nonBotAwayTeamName = this.awayTeamName;
      }
  }

  private _getBotAwayName(): string {
    if (!this._botDisplayName) {
      const idx = Math.floor(Math.random() * this._botNamePool.length);
      this._botDisplayName = this._botNamePool[idx];
    }
    return this._botDisplayName;
  }

  private _enforceAwayTeamNameRules() {
    const allBotNames = Object.values(TRANSLATIONS).map(t => t.botPlayerName);
    const isBotName =
      allBotNames.includes(this.awayTeamName) ||
      this.awayTeamName === this._botDisplayName ||
      this._botNamePool.includes(this.awayTeamName);

    if (this.selectedGameMode === 'BOT') {
      if (this._nonBotAwayTeamName === null && !isBotName) {
        this._nonBotAwayTeamName = this.awayTeamName;
      }
      this.awayTeamName = this._getBotAwayName();
      return;
    }

    // Non-bot mode: if we previously forced bot name, restore last known non-bot name (or default).
    if (isBotName) {
      this.awayTeamName = this._nonBotAwayTeamName ?? getT(this.language).defaultAwayTeam;
    }
    this._botDisplayName = null;
  }

  _nextTempBall() { this.tempBallIndex = (this.tempBallIndex + 1) % this.ballTypes.length; }
  _prevTempBall() { this.tempBallIndex = (this.tempBallIndex - 1 + this.ballTypes.length) % this.ballTypes.length; }

  private _isMatchDurationLocked() {
    if (this.isSummaryVisible || this.isChampionActive) return false;
    if (this.isPenaltyMode || this.isMatchPenalty) return true;
    if (this.isPlaying || this.wasPlayingBeforeModal) return true;
    if (this.matchMinute > 0) return true;
    if (this.selectedGameMode === 'LAN_2P' && this.lanStatus === 'in_match') return true;
    return false;
  }

  _increaseDuration() {
    if (this._isMatchDurationLocked()) return;
    if (this.tempMatchDuration < 1) this.tempMatchDuration = 1;
    else if (this.tempMatchDuration < 10) this.tempMatchDuration += 1;
  }

  _decreaseDuration() {
    if (this._isMatchDurationLocked()) return;
    if (this.tempMatchDuration > 1) this.tempMatchDuration -= 1;
    else if (this.tempMatchDuration === 1) this.tempMatchDuration = 0.5;
    }

  _openGuide() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    this._clearBotTimers();

    // ✅ Welcome ekranındaysa oyunu pause etme
    if (!this.isWelcomeVisible) {
      this.wasPlayingBeforeModal = this.isPlaying;
      if (this.isPlaying && this.onPauseGame) this.onPauseGame();
    }
    // Ensure body locked before showing backdrop to avoid layout jank
    document.body.classList.add('modal-open');
    this._pulseUiAnimating();

    // Remove 'hidden' from backdrop element before activating to avoid display reflow
    const backdrop = this._guideModalBackdropEl ?? (this.shadowRoot?.getElementById('guideModalBackdrop') as HTMLElement | null);
    if (backdrop) backdrop.classList.remove('hidden');

    // Add active class on next frame to trigger transition
    requestAnimationFrame(() => {
      this.isGuideOpen = true;
    });
  }

  _closeGuide() {
    // Start fade-out by removing active state
    this.isGuideOpen = false;

    const backdrop = this._guideModalBackdropEl ?? (this.shadowRoot?.getElementById('guideModalBackdrop') as HTMLElement | null);

    const finishClose = () => {
      document.body.classList.remove('modal-open');
      if (backdrop) backdrop.classList.add('hidden');
    };

    if (backdrop) {
      const onEnd = (ev: TransitionEvent) => {
        if ((ev as any).propertyName && (ev as any).propertyName !== 'opacity') return;
        finishClose();
        backdrop.removeEventListener('transitionend', onEnd as any);
      };
      backdrop.addEventListener('transitionend', onEnd as any);
    } else {
      finishClose();
    }

    // ✅ Welcome ekranındaysa oyunu resume etme
    if (!this.isWelcomeVisible && this.wasPlayingBeforeModal && this.onResumeGame) {
      this.onResumeGame();
    }

    this._maybeScheduleBotTurn();
    this._pulseUiAnimating();
  }

  _openLanguageSelect() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    this._clearBotTimers();
    
    // ✅ Welcome ekranındaysa oyunu pause etme
    if (!this.isWelcomeVisible) {
      this.wasPlayingBeforeModal = this.isPlaying;
      if (this.isPlaying && this.onPauseGame) this.onPauseGame();
    }
    // Ensure body locked before showing backdrop to avoid layout jank
    document.body.classList.add('modal-open');
    this._pulseUiAnimating();

    // Remove 'hidden' from backdrop element before activating to avoid display reflow
    const langBackdrop = this._langModalBackdropEl ?? (this.shadowRoot?.getElementById('langModalBackdrop') as HTMLElement | null);
    if (langBackdrop) langBackdrop.classList.remove('hidden');

    requestAnimationFrame(() => {
      this.isLanguageSelectOpen = true;
    });
  }

  _dispatchLanguageChange() {
    const t = getT(this.language);
    try { localStorage.setItem('saliseligi-lang', this.language); } catch {}
    window.dispatchEvent(new CustomEvent('saliseligi-lang-change', {
      detail: { lang: this.language, navHome: t.navHome, navHowToPlay: t.navHowToPlay, navPrivacy: t.navPrivacy, navContact: t.navContact }
    }));
  }

  _closeLanguageSelect() {
    // Start fade-out
    this.isLanguageSelectOpen = false;

    const backdrop = this._langModalBackdropEl ?? (this.shadowRoot?.getElementById('langModalBackdrop') as HTMLElement | null);

    const finishClose = () => {
      document.body.classList.remove('modal-open');
      if (backdrop) backdrop.classList.add('hidden');
    };

    if (backdrop) {
      const onEnd = (ev: TransitionEvent) => {
        if ((ev as any).propertyName && (ev as any).propertyName !== 'opacity') return;
        finishClose();
        backdrop.removeEventListener('transitionend', onEnd as any);
      };
      backdrop.addEventListener('transitionend', onEnd as any);
    } else {
      finishClose();
    }

    // ✅ Welcome ekranındaysa oyunu resume etme
    if (!this.isWelcomeVisible && this.wasPlayingBeforeModal && this.onResumeGame) {
      this.onResumeGame();
      this.wasPlayingBeforeModal = false; // Flag'i temizle
    }

    this._maybeScheduleBotTurn();
    this._pulseUiAnimating();
  }

  private _openLanModal() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    this._clearBotTimers();

    // ✅ Welcome ekranındaysa oyunu pause etme
    if (!this.isWelcomeVisible) {
      this.wasPlayingBeforeModal = this.isPlaying;
      if (this.isPlaying && this.onPauseGame) this.onPauseGame();
    }

    document.body.classList.add('modal-open');
    this._pulseUiAnimating();

    requestAnimationFrame(() => {
      this._debugLog('[LAN][UI] LAN modal opened');
      this.isLanModalOpen = true;
      this._cacheUiRefs();
      if (this.lanRole === 'HOST') this._startLanIpPolling();
    });
  }

  // ===== Requested action aliases (for file/placement consistency) =====
  private async _startHosting() {
    await this._startLanHost();
  }

  private async _stopHosting() {
    await this._stopLanHost();
  }

  private async _connectToHost() {
    await this._connectLanClient({ silent: false, source: 'manual' });
  }

  private _startLanMatchAsHost() {
    this._hostStartMatch();
  }

  private _sendLanReady() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    if (this.lanRole !== 'CLIENT') return;
    if (!this._lanClientTransport || !this._lanClientTransport.isConnected()) return;
    if (this.lanClientReadySent) return;

    const ready: LanMessage = { t: 'ready' };
    this._lanClientTransport.send(JSON.stringify(ready));
    this.lanClientReadySent = true;
    console.info('[LAN] client sent ready');
    if (this.lanReconnectState === 'idle' && !this.lanMatchHasBegun) {
      this._startLanMatchStartTimeout();
    }
  }

  /**
   * Resend join/sync_request/ready over an EXISTING connected transport.
   * Used by QR auto-connect to retry handshake without socket churn.
   */
  private _lanResendJoinHandshake(reason: string) {
    if (this.lanRole !== 'CLIENT') return;
    const t = this._lanClientTransport;
    if (!t || !t.isConnected()) return;

    const sync: LanMessage = { t: 'sync_request', reason: reason as any } as LanMessage;
    t.send(JSON.stringify(sync));
    const join: LanMessage = { t: 'join', name: this.awayTeamName || 'Player 2' };
    t.send(JSON.stringify(join));
    // ready is safe to resend if not yet acknowledged
    if (!this.lanClientReadySent) {
      const ready: LanMessage = { t: 'ready' };
      t.send(JSON.stringify(ready));
      this.lanClientReadySent = true;
    }
    console.info('[LAN][CLIENT] resend join handshake', { reason });
  }

  private _setLanRole(role: LanRole) {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    this.lanRole = role;

    this.lanErrorMessage = null;
    this.lanStatus = 'idle';
    this.lanMatchHasBegun = false;
    this.lanClientReadySent = false;
    this._lanClientReady = false;
    this._lanQrAutoOpened = false;
    this._lanNudgedJoinedOnce = false;

    // Role switch cleanup to prevent polling leaks
    this._stopLanIpPolling();
    this._stopLanHostStateBroadcast();
    this._stopLanPingLoop();
    if (role !== 'HOST' && this.lanHostRunning) {
      void this._stopHosting();
    }
    if (role !== 'CLIENT' && this._lanClientTransport) {
      void this._disconnectLanClient();
    }

    if (role === 'HOST') {
      this.lanHostError = null;
      this.lanErrorMessage = null;
      this.hostIpError = null;
      this.hostIpLoading = true;
      this.hostIp = null;
      this._refreshLanHostIp();
      this._startLanIpPolling();
    }
    if (role === 'CLIENT') {
      this.lanClientError = null;
      this.lanErrorMessage = null;
      this.lanHostIpWarning = null;
      this.hostIpError = null;
      this.hostIpLoading = false;
      this.lanHostIp = '';
      this.hostIp = null;
      this.lanHostIface = null;
      this._stopLanIpPolling();
      // Best effort default IP guess when running in dev
      if (!this.lanClientIp) {
        const guess = (location.hostname && location.hostname !== 'localhost') ? location.hostname : '';
        this.lanClientIp = guess;
      }
    }
  }

  private _generateLanSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private _startNewLanSession() {
    this._lanMatchSessionId = this._generateLanSessionId();
    this._lanStateSeq = 0;
    this._lanLastInputSeqFromClient = 0;
    this._lanLastClientActionId = null;
    this._lanToggleLockUntil = 0;
    this._lanRecentActionIds.clear();
    this._lanRecentActionIdQueue = [];
    this._lanLastSnapshotJson = '';
    this._lanLastFullPayload = null;
    this._lanLastFullSeq = 0;
    this._lanPatchSinceFullCount = 0;
    this._lanLastFullSentAt = 0;
    this._lanLastSnapshotSentAt = 0;
    this._lanNudgedJoinedOnce = false;
  }

  private _handleLanSessionMismatch(nextSessionId: string) {
    this._lanMatchSessionId = nextSessionId;
    this._lanLastAppliedStateSeq = 0;
    this._lanLastInputSeqFromClient = 0;
    this._lanLastClientActionId = null;
    this._lanInputSeq = 0;
    this._lanToggleLockUntil = 0;
    this._lanRecentActionIds.clear();
    this._lanRecentActionIdQueue = [];
    this.lanFirstSnapshotReceived = false;
    this._lanIncomingQueue = [];
    this._lanClientLastFullPayload = null;
    this._lanClientLastFullSeq = 0;
    this._lanPatchMissCount = 0;
    this._lanLastJoinResyncAt = 0;
    this._lanLastSnapshotJson = '';
    this._lanLastFullPayload = null;
    this._lanLastFullSeq = 0;
    this._lanPatchSinceFullCount = 0;
    this._lanLastFullSentAt = 0;
    this._lanLastSnapshotSentAt = 0;
  }

  private _scheduleLanSnapshot(force = false) {
    if (this._lanSnapshotScheduled) return;
    this._lanSnapshotScheduled = true;
    requestAnimationFrame(() => {
      this._lanSnapshotScheduled = false;
      this._sendLanStateSnapshot(force);
    });
  }

  private _lanScheduleImmediateSnapshot() {
    if (this._lanImmediateSnapshotScheduled) return;
    this._lanImmediateSnapshotScheduled = true;
    this._lanSnapshotDirty = true;
    requestAnimationFrame(() => {
      this._lanImmediateSnapshotScheduled = false;
      this._sendLanStateSnapshot(true);
    });
  }

  private _isLanLocalTurn(): boolean {
    if (this.selectedGameMode !== 'LAN_2P') return true;
    if (this.lanRole === 'HOST') return this.currentTurn === 'Home';
    if (this.lanRole === 'CLIENT') return this.currentTurn === 'Away';
    return true;
  }

  private async _refreshLanHostIp() {
    // Real IP is only reliably available on native.
    if (!Capacitor.isNativePlatform()) return;
    try {
      const res = await getLocalIpWithLogs();
      const resObj = typeof res === 'string' ? { ip: res } : res || {};
      const ipRaw = typeof (resObj as any)?.ip === 'string' ? (resObj as any).ip : '';
      const ip = ipRaw.trim() || null; // Normalize empty to null.
      const iface = typeof (resObj as any)?.iface === 'string' ? (resObj as any).iface : null;
      const errorCode = typeof (resObj as any)?.errorCode === 'string' ? (resObj as any).errorCode : null;

      const validIp = ip ? this._isValidLanIp(ip) : false;

      if (validIp && ip) {
        const prev = this.hostIp;
        this.lanHostIp = ip;
        this.hostIp = ip;
        this.lanHostIface = iface;
        this.hostIpLoading = false;
        this.hostIpError = null;
        this.lanHostIpWarning = this._isRfc1918Ip(ip)
          ? null
          : getT(this.language).hotspotIpNotFound;
        this.hostIpLastUpdatedAt = Date.now();

        if (
          this.isLanModalOpen &&
          this.lanRole === 'HOST' &&
          !this.isLanQrModalOpen &&
          !this._lanQrAutoOpened
        ) {
          // QR modal should open only on explicit user action ("QR KODU GÖSTER").
          // Keep the flag to preserve existing state behavior, but do not auto-open.
          this._lanQrAutoOpened = true;
        }

        // Log only on IP change.
        if (prev !== ip && this._lastHostIpLog !== ip) {
          console.info(`[LAN] hostIp updated: ${ip} iface=${iface ?? '-'}`);
          this._lastHostIpLog = ip;
        }
      } else {
        // Keep polling; show a gentle searching state.
        this.lanHostIp = '';
        this.hostIp = null;
        this.lanHostIface = iface;
        this.hostIpLoading = true;
        this.hostIpError = getT(this.language).hotspotOffOrNoIp;
        this.lanHostIpWarning = this.hostIpError;

        if (errorCode === 'NO_VALID_IP') {
          const now = Date.now();
          if (now - this._lastNoValidIpLogAt > 10_000) {
            console.info('[LAN] hostIp not available yet (NO_VALID_IP)');
            this._lastNoValidIpLogAt = now;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private _isValidLanIp(ip?: string | null) {
    return isValidLanIp(ip);
  }

  private _isRfc1918Ip(ip?: string | null): boolean {
    if (!ip) return false;
    const parts = ip.split('.').map((p) => Number(p));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  /** Compare first 3 octets of two IPv4 addresses (/24 subnet match) */
  private _isSameSubnet24(a: string, b: string): boolean {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    if (pa.length !== 4 || pb.length !== 4) return false;
    return pa[0] === pb[0] && pa[1] === pb[1] && pa[2] === pb[2];
  }

  private _closeLanSameNetworkPopup() {
    this.isLanSameNetworkPopupOpen = false;
    this.lanSameNetworkPopupMessage = null;
  }

  private _mapHostStartError(errorCode?: string, message?: string) {
    // Map native error codes to consistent user-facing messages.
    const t = getT(this.language);
    switch (errorCode) {
      case 'PORT_IN_USE':
        return t.portInUse;
      case 'NO_VALID_IP':
        return t.hotspotOffOrNoIp;
      case 'START_FAILED':
        return `${t.hostStartFailedDetail}${message ? ` ${t.detailPrefix} ${message}` : ''}`;
      default:
        return message || t.hostStartFailedDot;
    }
  }

  private _handleHostStartError(message?: string, errorCode?: string) {
    const mapped = this._mapHostStartError(errorCode, message);
    this.lanHostError = mapped;
    this.lanErrorMessage = mapped;
    this.lanStatus = 'error';

    // Log errorCode once for telemetry/debug without spamming.
    if (errorCode && this._lastHostErrorCode !== errorCode) {
      console.warn('[LAN] Host start error code:', errorCode, message);
      this._lastHostErrorCode = errorCode;
    }
  }

  private _startLanIpPolling() {
    if (this._lanHostIpPollTimer) return;
    this.hostIpLoading = true;
    // Test: Hotspot açık + client bağlı => 1–10 sn içinde IP dolmalı.
    // Test: Hotspot açık ama client yok => "IP aranıyor…" ve butonlar disabled.
    // Test: Hotspot kapalı => NO_VALID_IP, polling devam eder.
    // Test: Modal kapat/aç ve HOST<->CLIENT geçişinde interval leak olmamalı.
    // Polling should continue while modal is open and role is HOST.
    this._lanHostIpPollTimer = window.setInterval(() => {
      if (!this.isLanModalOpen || this.lanRole !== 'HOST') return;
      this._refreshLanHostIp();
    }, 1200);
    // Immediate refresh when polling starts
    if (this.lanRole === 'HOST') this._refreshLanHostIp();
  }

  private _stopLanIpPolling() {
    if (!this._lanHostIpPollTimer) return;
    clearInterval(this._lanHostIpPollTimer);
    this._lanHostIpPollTimer = null;
    this.hostIpLoading = false;
  }

  private _scheduleLanHostIpRetry(maxRetries = 5, delayMs = 600) {
    if (this._lanHostIpRetryTimer) {
      clearTimeout(this._lanHostIpRetryTimer);
      this._lanHostIpRetryTimer = null;
    }

    const tryFetch = async (remaining: number) => {
      await this._refreshLanHostIp();
      if (this.lanHostIp && this.lanHostIp !== '0.0.0.0') {
        this._lanHostIpRetryTimer = null;
        return;
      }
      if (remaining <= 0) {
        this._lanHostIpRetryTimer = null;
        return;
      }
      this._lanHostIpRetryTimer = window.setTimeout(() => {
        tryFetch(remaining - 1);
      }, delayMs);
    };

    void tryFetch(maxRetries);
  }

  private async _copyLanAddress() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    const ip = this.lanHostIp || this.lanClientIp;
    const port = (this.lanRole === 'HOST' ? this.lanPort.toString() : (this.lanClientPort || this.lanPort.toString()));
    if (this.lanRole === 'HOST' && !this._isValidLanIp(ip)) return;
    const text = ip ? `${ip}:${port}` : `${port}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // fallthrough
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch {
      // ignore
    }
  }

  private async _copyLanQrValue() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    const text = this.lanQrValue || '';
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // fallthrough
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch {
      // ignore
    }
  }

  private async _openLanQrModal() {
    this.lanQrError = null;
    this.lanQrHostMessage = null;

    if (this.lanRole === 'HOST') {
      await this._refreshLanHostIp();
      if (!this.lanHostRunning) {
        this.lanQrHostStatus = 'starting';
        try {
          const started = await this._startLanHost();
          if (!started) {
            this.lanQrHostStatus = 'error';
            this.lanQrError = 'Host başlatılamadı (IP/port). Hotspot/Wi-Fi aynı ağda mı?';
            return;
          }
          await this._refreshLanHostIp();
        } catch {
          this.lanQrHostStatus = 'error';
          this.lanQrError = 'Host başlatılamadı (IP/port). Hotspot/Wi-Fi aynı ağda mı?';
          return;
        }
      }
    }

    const hostIp = this.lanHostIp || '';
    const hostPort = this.hostPort || this.lanPort;
    if (!this._isValidLanIp(hostIp)) {
      this.lanQrError = getT(this.language).hostStartFailedIpPort;
      return;
    }

    const payload = `ws://${hostIp}:${hostPort}`;
    this.lanQrValue = payload;
    this.lanQrHostStatus = this.lanHostRunning ? 'ready' : 'starting';
    this.isLanQrModalOpen = true;
    this._pulseUiAnimating();

    await this.updateComplete;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    this._debugLog('[LAN][QR] QR draw start', payload);
    this._cacheUiRefs();
    // Always re-query canvas from DOM — Lit may have destroyed the old one when modal was closed/reopened.
    const canvas = (this.renderRoot as HTMLElement | ShadowRoot | null)?.querySelector('#lanQrCanvas') as HTMLCanvasElement | null;
    this._lanQrCanvasEl = canvas;
    this._debugLog('[LAN][QR] canvas found?', !!canvas, canvas?.width, canvas?.height);
    if (!canvas) return;
    if (canvas.width !== 320) canvas.width = 320;
    if (canvas.height !== 320) canvas.height = 320;
    if (this._lanQrLastPayload === payload && this._lanQrCanvasInitialized) return;
    this._lanQrCanvasInitialized = true;
    try {
      await QRCode.toCanvas(canvas, payload, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'L',
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      this._lanQrLastPayload = payload;
    } catch (e) {
      console.error('[LAN][QR] QR draw error', e);
      this._lanQrLastPayload = null;
      this.lanQrError = getT(this.language).qrRenderFailed;
    }
  }

  private _closeLanQrModal() {
    this.isLanQrModalOpen = false;
    this.lanQrValue = '';
    this.lanQrHostStatus = 'idle';
    this.lanQrHostMessage = null;
    // Reset cached canvas state so next open finds the new DOM element and redraws.
    this._lanQrCanvasEl = null;
    this._lanQrCanvasInitialized = false;
    this._lanQrLastPayload = null;
    this._pulseUiAnimating();
  }

  private _openQrPermissionInfo() {
    this.lanQrError = null;
    this.isLanQrPermissionInfoOpen = true;
  }

  private _closeQrPermissionInfo() {
    this.isLanQrPermissionInfoOpen = false;
  }

  private _openQrSettingsHint() {
    this.isLanQrSettingsHintOpen = true;
  }

  private _closeQrSettingsHint() {
    this.isLanQrSettingsHintOpen = false;
  }

  private _openAppSettings() {
    try {
      const appAny = App as any;
      if (typeof appAny.openSettings === 'function') {
        appAny.openSettings();
        return;
      }
      if (typeof appAny.openUrl === 'function') {
        appAny.openUrl({ url: 'app-settings:' });
      }
    } catch {
      // ignore
    }
  }

  private async _handleQrPermissionFlow(isRetry = false) {
    this.lanQrError = null;

    if (!Capacitor.isNativePlatform()) {
      this.lanQrError = getT(this.language).qrScanMobileOnly;
      return;
    }

    try {
      const current = await BarcodeScanner.checkPermissions();
      this._debugLog('[LAN][QR] permission check', JSON.stringify(current));
      if (current.camera === 'granted') {
        await this._startQrScan();
        return;
      }

      const request = await BarcodeScanner.requestPermissions();
      this._debugLog('[LAN][QR] permission request', JSON.stringify(request));
      if (request.camera === 'granted') {
        await this._startQrScan();
        return;
      }

      // Denied
      this.lanQrError = getT(this.language).lanQrPermissionDenied;
      this.isLanQrPermissionInfoOpen = true;

      if (isRetry) {
        this._closeQrPermissionInfo();
        this._openQrSettingsHint();
      }
    } catch {
      this.lanQrError = getT(this.language).lanQrPermissionDenied;
      this.isLanQrPermissionInfoOpen = true;
      if (isRetry) {
        this._closeQrPermissionInfo();
        this._openQrSettingsHint();
      }
    }
  }

  private async _startQrScan() {
    this._closeQrPermissionInfo();
    this.lanQrError = null;
    this.lanQrScanFlash = null;

    // Reset scan guard flags
    this._lanQrHandled = false;
    this._lanQrLastRaw = '';
    this._lanQrLastRawAt = 0;

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }

    try {
      // Cache isSupported result to avoid repeated native calls
      if (this._lanQrSupported === null) {
        const supported = await BarcodeScanner.isSupported();
        this._lanQrSupported = !!supported.supported;
        this._debugLog('[LAN][QR] isSupported', String(this._lanQrSupported));
      }
      if (!this._lanQrSupported) {
        this.lanQrError = getT(this.language).cameraNotSupported;
        return;
      }

      this._debugLog('[LAN][QR] SCAN_START');
      this.isLanQrScanning = true;
      document.body.classList.add('lan-qr-scanner-active');
      this._lanQrScanListener?.remove();
      this._lanQrScanListener = await BarcodeScanner.addListener('barcodesScanned', async (result) => {
        // Lightweight log — avoid heavy JSON.stringify of full result
        const count = (result as any)?.barcodes?.length ?? 0;
        this._debugLog('[LAN][QR] scan result count', String(count));

        // Early guard: already handled a valid QR this session
        if (this._lanQrHandled) return;

        const first = (result as any)?.barcodes?.[0];
        const raw = (first?.rawValue || first?.displayValue || '').trim();
        if (!raw) return;

        // Debounce duplicates within 1200ms
        const now = Date.now();
        if (raw === this._lanQrLastRaw && (now - this._lanQrLastRawAt) < 1200) return;
        this._lanQrLastRaw = raw;
        this._lanQrLastRawAt = now;

        const parsed = this._parseLanQrPayload(raw);
        if (!parsed) {
          this.lanQrError = getT(this.language).lanQrInvalid;
          this.lanQrScanFlash = 'error';
          try {
            await Haptics.notification({ type: NotificationType.Error });
          } catch {
            // ignore
          }
          window.setTimeout(() => {
            if (this.lanQrScanFlash === 'error') this.lanQrScanFlash = null;
          }, 500);
          return; // keep scanning — don't stop on invalid
        }

        // Valid QR — stop processing further frames immediately
        this._lanQrHandled = true;

        // ✅ Subnet check: ensure both phones are on the same /24 network
        const hostIp = parsed.ip;
        let clientLocalIp: string | null = null;
        try {
          if (Capacitor.isNativePlatform()) {
            const res = await getLocalIpWithLogs();
            const resObj = typeof res === 'string' ? { ip: res } : res || {};
            const ipRaw = typeof (resObj as any)?.ip === 'string' ? (resObj as any).ip : '';
            clientLocalIp = ipRaw.trim() || null;
          }
        } catch {
          // IP alınamadıysa kontrolü atla, normal akışa devam et
        }

        if (clientLocalIp && this._isValidLanIp(clientLocalIp) && this._isValidLanIp(hostIp)) {
          if (!this._isSameSubnet24(clientLocalIp, hostIp)) {
            this._debugLog('[LAN][QR] Subnet mismatch', `client=${clientLocalIp} host=${hostIp}`);
            await this._stopQrScan();
            this._lanQrHandled = false; // Kullanıcı tekrar tarayabilsin
            this.lanSameNetworkPopupMessage = getT(this.language).lanSameNetworkRequired;
            this.isLanSameNetworkPopupOpen = true;
            return;
          }
        }

        this.lanClientIp = parsed.ip;
        this.lanClientPort = parsed.port;

        // ✅ QR ile join eden cihaz her zaman CLIENT olmalı.
        // ✅ Mode LAN_2P olmalı ki match_start geldiğinde doğru akışa girsin.
        this._setLanRole('CLIENT');
        this.lanRole = 'CLIENT';
        if (this.selectedGameMode !== 'LAN_2P') {
          this.selectedGameMode = 'LAN_2P';
        }

        // Stop scan first to free camera/CPU, then do haptics + auto-connect
        await this._stopQrScan();

        this.lanQrScanFlash = 'success';
        try {
          await Haptics.notification({ type: NotificationType.Success });
        } catch {
          // ignore
        }
        window.setTimeout(() => {
          if (this.lanQrScanFlash === 'success') this.lanQrScanFlash = null;
        }, 500);
        this._startLanQrAutoConnect();
      });

      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    } catch (e) {
      console.error('[LAN][QR] scan error', e);
      this.lanQrError = getT(this.language).cameraNoPermission;
      await this._stopQrScan();
    }
  }

  private async _stopQrScan() {
    if (!this.isLanQrScanning) return;
    this.isLanQrScanning = false;
    this.lanQrScanFlash = null;
    document.body.classList.remove('lan-qr-scanner-active');
    try {
      await BarcodeScanner.stopScan();
    } catch {
      // ignore
    }
    try {
      this._lanQrScanListener?.remove();
    } catch {
      // ignore
    }
    this._lanQrScanListener = null;
  }

  private _clearLanQrAutoConnect() {
    if (this._lanQrAutoConnectTimer) {
      clearTimeout(this._lanQrAutoConnectTimer);
      this._lanQrAutoConnectTimer = null;
    }
    this._lanQrAutoConnectAttempt = 0;
    this.lanQrAutoConnectState = 'idle';
    this.lanQrAutoConnectMessage = null;
  }

  private _startLanQrAutoConnect() {
    const t = getT(this.language);
    this._clearLanQrAutoConnect();
    this.lanQrAutoConnectState = 'retrying';
    this.lanQrAutoConnectMessage = t.lanQrWaitingForHost;

    const maxAttempts = 10;
    const baseDelayMs = 600;

    const attempt = async () => {
      if (this.lanQrAutoConnectState !== 'retrying') return;
      this._lanQrAutoConnectAttempt += 1;
      this.lanQrAutoConnectMessage = t.lanQrConnecting;

      // ✅ QR flow: role/mode safety (bazı UI senaryolarında role null kalabiliyor)
      this._setLanRole('CLIENT');
      this.lanRole = 'CLIENT';
      if (this.selectedGameMode !== 'LAN_2P') this.selectedGameMode = 'LAN_2P';

      // (a) Already connected — resend handshake instead of reconnecting
      if (this._lanClientTransport && this._lanClientTransport.isConnected()) {
        if (this.lanStatus === 'in_match' || this._lanAssignedPlayer) {
          // Success — fully joined
          this._clearLanQrAutoConnect();
          return;
        }
        // Still waiting_start and no player assignment → retry handshake only
        this._lanResendJoinHandshake('qr_retry_join');
        const delay = this._lanQrAutoConnectAttempt >= 4 ? 800 : baseDelayMs;
        this._lanQrAutoConnectTimer = window.setTimeout(attempt, delay);
        this.lanQrAutoConnectMessage = t.lanQrWaitingForHost;
        return;
      }

      // (b) Currently connecting — don't disconnect/recreate, just wait
      if (this.lanClientStatus === 'connecting') {
        const delay = this._lanQrAutoConnectAttempt >= 4 ? 800 : baseDelayMs;
        this._lanQrAutoConnectTimer = window.setTimeout(attempt, delay);
        this.lanQrAutoConnectMessage = t.lanQrWaitingForHost;
        return;
      }

      // (c) No transport or disconnected/idle → establish new connection
      const ok = await this._connectLanClient({ silent: true, source: 'qr' });
      if (ok) {
        // Connection established; on next attempt we'll be in path (a)
        // Schedule one more attempt to verify handshake completed
        const delay = this._lanQrAutoConnectAttempt >= 4 ? 800 : baseDelayMs;
        this._lanQrAutoConnectTimer = window.setTimeout(attempt, delay);
        this.lanQrAutoConnectMessage = t.lanQrWaitingForHost;
        return;
      }

      if (this._lanQrAutoConnectAttempt >= maxAttempts) {
        this.lanQrAutoConnectState = 'failed';
        const code = this._lanLastClientErrorCode ? this._lanLastClientErrorCode.toLowerCase() : '';
        const tt = getT(this.language);
        this.lanQrAutoConnectMessage = `${tt.connectionFailed}${code ? ` (${code})` : ''} — ${tt.connectFailedHint}`;
        return;
      }

      this.lanQrAutoConnectMessage = t.lanQrWaitingForHost;
      const delay = this._lanQrAutoConnectAttempt >= 4 ? 800 : baseDelayMs;
      this._lanQrAutoConnectTimer = window.setTimeout(attempt, delay);
    };

    void attempt();
  }

  private _useManualLanEntryFromQr() {
    this._clearLanQrAutoConnect();
    this.lanQrError = null;
    this.lanClientError = null;
  }

  private _parseLanQrPayload(raw: string): { ip: string; port: string } | null {
    const value = (raw || '').trim();
    if (!value) return null;

    let ip = '';
    let port = '';

    if (value.startsWith('ws://')) {
      try {
        const url = new URL(value);
        ip = url.hostname;
        port = url.port;
      } catch {
        return null;
      }
    } else if (value.startsWith('salise://')) {
      try {
        const url = new URL(value);
        ip = url.searchParams.get('ip') || '';
        port = url.searchParams.get('port') || '';
      } catch {
        return null;
      }
    } else if (value.includes(':')) {
      const parts = value.split(':');
      if (parts.length === 2) {
        ip = parts[0].trim();
        port = parts[1].trim();
      }
    }

    if (!this._isValidLanIp(ip) || !this._isRfc1918Ip(ip)) return null;
    const portNum = Number(port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) return null;

    return { ip, port: String(portNum) };
  }

  private async _startLanHost(): Promise<boolean> {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    if (this.lanReconnectState === 'idle') {
      this.lanMatchHasBegun = false;
      this.lanStatus = 'idle';
    }

    this.lanHostError = null;
    this.lanErrorMessage = null;
    this._lanClientReady = false;
    this._clearLanReadyTimers();
    if (!Capacitor.isNativePlatform()) {
      this.lanHostError = getT(this.language).hostOnlyAndroid;
      this.lanErrorMessage = this.lanHostError;
      this.lanStatus = 'error';
      return false;
    }

    if (!Capacitor.isPluginAvailable('WsHostServer')) {
      this.lanHostError = getT(this.language).hostPluginMissing;
      this.lanErrorMessage = this.lanHostError;
      this.lanStatus = 'error';
      return false;
    }

    await this._refreshLanHostIp(); // Keep polling even if IP is not available yet.

    if (!this._isValidLanIp(this.lanHostIp) || !this._isRfc1918Ip(this.lanHostIp)) {
      this._handleHostStartError(undefined, 'NO_VALID_IP');
      return false;
    }

    try {
      await this._stopLanHost();
    } catch {
      // ignore
    }

    const preferredPort = Number(this.lanPort) || 8787;
    const portCandidates: number[] = [preferredPort];
    if (preferredPort === 8787) {
      for (let p = 8790; p <= 8890; p++) portCandidates.push(p);
    }

    let lastError: { message?: string; errorCode?: string } | null = null;
    let portSearchActive = portCandidates.length > 1;

    for (const port of portCandidates) {
      this.lanPort = port;
      this.hostPort = port;

      const transport = new HostTransport(port);
      this._lanHostTransport = transport;

      transport.onMessage((raw) => this._onLanRawMessage(raw));
      transport.onStatus((s) => {
        if (s.kind === 'connected') this.lanHostRunning = true;
        if (s.kind === 'disconnected') this.lanHostRunning = false;
        if (s.kind === 'clientCount') {
          // Only update if changed to avoid Lit churn
          if (this.lanPeers !== s.count) this.lanPeers = s.count;
          if (this.connectedPeersCount !== s.count) this.connectedPeersCount = s.count;

          if (s.count > 0) {
            this._clearLanHostDisconnectDebounce();
            this._lanWasEverConnected = true;
            this._lanLastPongAt = Date.now();
            this._setLanOpponentLeft(false);
            if (this.isLanQrModalOpen) {
              this.lanQrHostStatus = 'ready';
              this._closeLanQrModal();
            }
            if (this.lanRole === 'HOST') {
              if (this.lanStatus === 'in_match') {
                console.info('[LAN][HOST] clientCount>0 while in_match -> keep in_match');
              } else {
                if (this.isWelcomeVisible || !this.lanMatchHasBegun) {
                  if (this.lanStatus !== 'waiting_start') this.lanStatus = 'waiting_start';
                }
                if (!this.lanMatchHasBegun) {
                  this._startLanReadyTimeout();
                }
              }
              if (
                this.lanStatus !== 'in_match' &&
                this.lanReconnectState !== 'reconnecting'
              ) {
                this._startLanForceStartTimer();
              }
              if (this.lanStatus !== 'in_match' && !this._lanClientReady && !this._lanNudgedJoinedOnce) {
                const seed = Math.floor(Math.random() * 1_000_000);
                this._lanSeed = seed;
                this._lanNudgedJoinedOnce = true;
                if (!this._lanMatchSessionId) this._startNewLanSession();
                const joined: LanMessage = {
                  t: 'joined',
                  player: 2,
                  seed,
                  matchSessionId: this._lanMatchSessionId || undefined,
                } as LanMessage;
                this._lanHostTransport?.send(JSON.stringify(joined));
                console.info('[LAN][HOST] clientCount>0 -> nudge joined');
              }
              if (this._lanClientReady && this.lanStatus !== 'in_match') {
                this._clearLanReadyTimers();
                this._clearLanForceStartTimer();
                this._maybeAutoStartLanMatch('clientCount_with_ready');
              }
            }
            if (this.lanReconnectState === 'reconnecting') {
              this._handleLanReconnectConnected();
            }
            if (this.lanReconnectState === 'timedOut') {
              this.lanReconnectState = 'idle';
            }
          }

          if (
            s.count === 0 &&
            this.lanStatus === 'in_match' &&
            !this.isWelcomeVisible &&
            !this.isSummaryVisible
          ) {
            this._scheduleLanHostDisconnectDebounce();
          }

          if (s.count === 0) {
            this._lanNudgedJoinedOnce = false;
            this._clearLanForceStartTimer();
          }

          // Host-side status in welcome
          if (this.lanRole === 'HOST' && this.lanHostRunning) {
            if (this.isWelcomeVisible) {
              const next = s.count >= 1 ? 'waiting_start' : 'hosting';
              if (this.lanStatus !== next) this.lanStatus = next;
            }
          }
        }
        if (s.kind === 'error') {
          this.lanHostRunning = false;
          if (s.errorCode === 'PORT_IN_USE' && portSearchActive) {
            console.info('[LAN] port in use, trying next port', { port });
            return;
          }
          this._handleHostStartError(s.message, s.errorCode);
        }
      });

      try {
        await transport.connect();
        this._startNewLanSession();
        this._lanLastAppliedStateSeq = 0;
        this.lanHostRunning = true;
        if (this.lanReconnectState === 'idle') {
          this.lanStatus = 'hosting';
        }
        this.lanHostError = null;
        this.lanErrorMessage = null;
        this._lanLastPongAt = Date.now();
        this._setLanOpponentLeft(false);
        this._startLanHostStateBroadcast();
        this._startLanPingLoop();
        this._scheduleLanHostIpRetry();

        if (port !== preferredPort) {
          console.info('[LAN] auto-selected free port', { port, preferredPort });
        }
        console.info('[LAN] host connected', {
          lanReconnectState: this.lanReconnectState,
          lanMatchHasBegun: this.lanMatchHasBegun,
          lanStatus: this.lanStatus,
        });
        portSearchActive = false;
        return true;
      } catch (e) {
        this.lanHostRunning = false;
        const msg = (e as any)?.message || getT(this.language).hostStartFailed;
        const code = (e as any)?.errorCode as string | undefined;
        lastError = { message: msg, errorCode: code };

        if (code === 'PORT_IN_USE') {
          console.warn('[LAN] PORT_IN_USE', { port, preferredPort });
          try {
            await transport.disconnect();
          } catch {
            // ignore
          }
          this._lanHostTransport = null;
          continue;
        }

        this._lanHostTransport = null;
        break;
      }
    }

    if (lastError) {
      this._handleHostStartError(lastError.message, lastError.errorCode);
    }
    return false;
  }

  private _startLanHostStateBroadcast() {
    // Host periodically broadcasts a lightweight authoritative snapshot.
    if (this._lanHostStateTimer) return;
    if (this.isWelcomeVisible || this.isSummaryVisible) return;
    this._lanHostStateTimer = window.setInterval(() => {
      if (!this.lanHostRunning || !this._lanHostTransport) return;
      if (this.isWelcomeVisible || this.isSummaryVisible) {
        this._stopLanHostStateBroadcast();
        return;
      }
      this._sendLanStateSnapshot();
    }, 300);
  }

  private _buildLanStatePayload(): LanStatePayload {
    return {
      isWelcomeVisible: this.isWelcomeVisible,
      isSummaryVisible: this.isSummaryVisible,
      isPlaying: this.isPlaying,
      isAnimating: this.isAnimating,
      isPenaltyMode: this.isPenaltyMode,
      isMatchPenalty: this.isMatchPenalty,
      isGoalActive: this.isGoalActive,
      isCardActive: this.isCardActive,
      goalTeam: this.goalTeam,
      cardTeam: this.cardTeam,
      cardType: this.cardType,
      liveDigit: this.liveDigit,
      turnTimeLimitMs: this.turnTimeLimitMs,
      turnDeadlineTs: this.turnDeadlineTs,

      currentTurn: this.currentTurn,
      matchMinute: this.matchMinute,
      extraTurns: this.extraTurns,

      homeScore: this.homeScore,
      awayScore: this.awayScore,

      homeYellows: this.homeYellows,
      awayYellows: this.awayYellows,
      homeReds: this.homeReds,
      awayReds: this.awayReds,

      statsHomeYellows: this.statsHomeYellows,
      statsAwayYellows: this.statsAwayYellows,
      statsHomeReds: this.statsHomeReds,
      statsAwayReds: this.statsAwayReds,

      homePenalties: this.homePenalties,
      awayPenalties: this.awayPenalties,
      homePenResults: this.homePenResults,
      awayPenResults: this.awayPenResults,

      lastEvent: this.lastEvent,
      lastDigit: this.lastDigit,

      isChampionActive: this.isChampionActive,
      winnerName: this.winnerName,

      homeTeamName: this.homeTeamName,
      awayTeamName: this.awayTeamName,

      lastClientInputSeq: this._lanLastInputSeqFromClient,
      lastClientActionId: this._lanLastClientActionId ?? undefined,
    };
  }

  /**
   * Compare two flat LanStatePayload objects and return a patch of changed keys.
   * Array fields (homePenResults, awayPenResults) are compared element-by-element.
   * Returns null if nothing changed.
   */
  private _lanComputePatch(
    prev: Record<string, any>,
    next: Record<string, any>,
  ): Record<string, any> | null {
    const patch: Record<string, any> = {};
    let count = 0;
    for (const key of Object.keys(next)) {
      const pv = prev[key];
      const nv = next[key];
      if (pv === nv) continue;
      // Deep-compare boolean arrays (penResults)
      if (Array.isArray(pv) && Array.isArray(nv)) {
        if (pv.length === nv.length && pv.every((v: any, i: number) => v === nv[i])) continue;
      }
      patch[key] = nv;
      count++;
    }
    return count > 0 ? patch : null;
  }

  private _sendLanStateSnapshot(force = false) {
    if (!this.lanHostRunning || !this._lanHostTransport) return;
    if (this.isWelcomeVisible && !force) return;
    if (this.isSummaryVisible && !force) return;

    // Early-out: skip expensive payload build + JSON.stringify if nothing changed
    const now = Date.now();
    const retransmitDue = now - this._lanLastSnapshotSentAt > 700;
    if (!force && !this._lanSnapshotDirty && !retransmitDue) return;

    if (!this._lanMatchSessionId) this._startNewLanSession();
    const payload = this._buildLanStatePayload();
    const payloadJson = JSON.stringify(payload);
    const prevJson = this._lanLastSnapshotJson;
    const changed = payloadJson !== prevJson;
    if (changed) {
      this._lanLastSnapshotJson = payloadJson;
      this._lanStateSeq += 1;
    } else if (force) {
      this._lanStateSeq += 1;
    }

    if (!force && !changed && !retransmitDue) return;

    // Delta/patch logic:
    // Send a full state on force, first snapshot, every 5th patch, or when too many keys changed.
    // Otherwise send a compact state_patch with only changed fields.
    const MAX_PATCH_KEYS = 12;
    const FULL_EVERY_N = 5; // send full state every N patches to keep client in sync
    const FULL_TIMEOUT_MS = 1500; // force full if this long since last full

    // Pacing safety: force full if too long since last full snapshot
    const fullTimedOut = this._lanLastFullSentAt > 0 && (now - this._lanLastFullSentAt > FULL_TIMEOUT_MS);
    if (fullTimedOut && !force) {
      force = true;
      if (now - this._lanLastSnapshotLogAt > 1000) {
        console.info('[LAN][HOST] forcing FULL snapshot (1500ms timeout)', { msSinceFull: now - this._lanLastFullSentAt });
      }
    }

    let sentPatch = false;
    if (
      !force &&
      this._lanLastFullPayload &&
      this._lanPatchSinceFullCount < FULL_EVERY_N
    ) {
      const patch = this._lanComputePatch(this._lanLastFullPayload, payload as any);
      if (patch && Object.keys(patch).length <= MAX_PATCH_KEYS) {
        const patchMsg: LanMessage = {
          t: 'state_patch',
          matchSessionId: this._lanMatchSessionId!,
          stateSeq: this._lanStateSeq,
          baseSeq: this._lanLastFullSeq,
          tick: now,
          patch,
        };
        this._lanHostTransport.send(JSON.stringify(patchMsg));
        // Update lastFullPayload with the patched values so next diff is against latest
        Object.assign(this._lanLastFullPayload, patch);
        this._lanPatchSinceFullCount++;
        sentPatch = true;
      }
    }

    if (!sentPatch) {
      // Send full state
      const msg: LanMessage = {
        t: 'state',
        matchSessionId: this._lanMatchSessionId!,
        stateSeq: this._lanStateSeq,
        tick: now,
        payload,
      };
      this._lanHostTransport.send(JSON.stringify(msg));
      // Update full-state tracking
      this._lanLastFullPayload = { ...(payload as any) };
      this._lanLastFullSeq = this._lanStateSeq;
      this._lanPatchSinceFullCount = 0;
      this._lanLastFullSentAt = now;
    }

    this._lanLastSnapshotSentAt = now;
    this._lanSnapshotDirty = false;

    if (now - this._lanLastSnapshotLogAt > 1000) {
      console.info('[LAN] host snapshot', {
        stateSeq: this._lanStateSeq,
        currentTurn: payload.currentTurn,
        isPlaying: payload.isPlaying,
        type: sentPatch ? 'patch' : 'full',
      });
      this._lanLastSnapshotLogAt = now;
    }
  }

  private _stopLanHostStateBroadcast() {
    if (!this._lanHostStateTimer) return;
    clearInterval(this._lanHostStateTimer);
    this._lanHostStateTimer = null;
  }

  private _setLanOpponentLeft(flag: boolean, message?: string) {
    if (this.lanOpponentLeft === flag && (message ?? null) === this.lanOpponentLeftMessage) return;
    this.lanOpponentLeft = flag;
    this.lanOpponentLeftMessage = message ?? null;

    if (flag) {
      if (this.isPlaying) this._setPlaying(false, { force: true });
    }
  }

  private _clearLanReconnectTimers() {
    if (this._lanReconnectTimer) {
      clearTimeout(this._lanReconnectTimer);
      this._lanReconnectTimer = null;
    }
    if (this._lanReconnectTickTimer) {
      clearInterval(this._lanReconnectTickTimer);
      this._lanReconnectTickTimer = null;
    }
    if (this._lanResumeCountdownTimer) {
      clearInterval(this._lanResumeCountdownTimer);
      this._lanResumeCountdownTimer = null;
    }
  }

  private _clearLanReadyTimers() {
    if (this._lanReadyTimer) {
      clearTimeout(this._lanReadyTimer);
      this._lanReadyTimer = null;
    }
    if (this._lanMatchStartTimer) {
      clearTimeout(this._lanMatchStartTimer);
      this._lanMatchStartTimer = null;
    }
  }

  private _clearLanForceStartTimer() {
    if (this._lanForceStartTimer) {
      clearTimeout(this._lanForceStartTimer);
      this._lanForceStartTimer = null;
    }
  }

  private _clearLanFirstSnapshotRetryTimer() {
    if (this._lanFirstSnapshotRetryTimer) {
      clearTimeout(this._lanFirstSnapshotRetryTimer);
      this._lanFirstSnapshotRetryTimer = null;
    }
  }

  private _startLanForceStartTimer(overrideDelayMs?: number) {
    if (this._lanForceStartTimer) return;
    const delayMs = overrideDelayMs ?? this._randInt(800, 1200);
    this._lanForceStartTimer = window.setTimeout(() => {
      this._lanForceStartTimer = null;
      if (this.lanRole !== 'HOST') return;
      if (this.lanReconnectState === 'reconnecting') return;
      const peers = (this.connectedPeersCount ?? this.lanPeers) || 0;
      if (peers < 1) return;
      if (this._lanClientReady) return;
      if (this.lanStatus === 'in_match') return;

      this._lanClientReady = true;
      console.info('[LAN][HOST] fallback auto match_start (no ready)');
      this._maybeAutoStartLanMatch('fallback_no_ready');
    }, delayMs);
  }

  private _startLanReadyTimeout() {
    // If client READY doesn't arrive, fail gracefully on host.
    this._clearLanReadyTimers();
    const t = getT(this.language);
    this._lanReadyTimer = window.setTimeout(() => {
      if (this.lanRole !== 'HOST') return;
      if (this.lanStatus === 'in_match') return;
      if (this._lanClientReady) return;
      this.lanHostError = t.lanReadyTimeout;
      this.lanErrorMessage = t.lanReadyTimeout;
      this.lanStatus = 'error';
    }, 5000);
  }

  private _startLanMatchStartTimeout() {
    // If MATCH_START doesn't arrive, fail gracefully on client.
    this._clearLanReadyTimers();
    const t = getT(this.language);

    // ✅ 2 saniye boyunca match_start gelmezse join+ready tekrar gönder
    window.setTimeout(() => {
      if (this.lanRole !== 'CLIENT') return;
      if (this.lanStatus === 'in_match') return;
      if (!this._lanClientTransport || !this._lanClientTransport.isConnected()) return;
      console.warn('[LAN][CLIENT] match_start timeout, resend join+ready');
      this._lanResendJoinHandshake('match_start_timeout');
    }, 2000);

    this._lanMatchStartTimer = window.setTimeout(() => {
      if (this.lanRole !== 'CLIENT') return;
      if (this.lanStatus === 'in_match') return;
      this.lanClientError = t.lanStartTimeout;
      this.lanErrorMessage = t.lanStartTimeout;
      this.lanClientStatus = 'error';
      this.lanStatus = 'error';
    }, 4000);
  }

  private _maybeAutoStartLanMatch(trigger: string) {
    // Host auto-starts once both sides are READY.
    if (this.lanRole !== 'HOST') return;
    if (!this.lanHostRunning || !this._lanHostTransport) return;
    if ((this.connectedPeersCount ?? this.lanPeers) < 1) return;
    if (!this._lanClientReady) return;
    if (this.lanStatus === 'in_match') return;

    this._startNewLanSession();

    const now = Date.now();
    if (now - this._lanLastReadyLogAt > 1000) {
      console.info('[LAN] ready -> match_start', { trigger });
      this._lanLastReadyLogAt = now;
    }

    const msg: LanMessage = { t: 'match_start', matchSessionId: this._lanMatchSessionId };
    this._lanHostTransport.send(JSON.stringify(msg));
    this.lanMatchHasBegun = true;
    this.lanMatchJustStartedAt = Date.now();
    this.lanFirstSnapshotReceived = false;
    this.lanStatus = 'in_match';
    this._restartMatch();
    if (this.lanHostRunning) {
      this._sendLanStateSnapshot(true);
      this._lanScheduleImmediateSnapshot();
    }
    console.info('[LAN] match_start host(auto)', {
      trigger,
      currentTurn: this.currentTurn,
      lanMatchJustStartedAt: this.lanMatchJustStartedAt,
    });
  }

  private _pauseLanForReconnect() {
    if (this.lanRole === 'HOST') this._lanResumeShouldPlay = this.isPlaying;
    if (this.isPlaying) this._setPlaying(false, { force: true });
    this.isAnimating = false;
    this.isChampionActive = false;
    this.liveDigit = null;
    this.liveDigitElement = null;
    this._stopLanConsumeLoop();
  }

  private _startLanReconnectCountdown(maxMs = 30000) {
    this._lanReconnectStartedAt = Date.now();
    const update = () => {
      const elapsed = Date.now() - this._lanReconnectStartedAt;
      const remainingMs = Math.max(0, maxMs - elapsed);
      this.lanReconnectSecondsLeft = Math.ceil(remainingMs / 1000);
      if (remainingMs <= 0 && this.lanReconnectState === 'reconnecting') {
        this._handleLanReconnectTimeout();
      }
    };
    update();
    if (this._lanReconnectTickTimer) clearInterval(this._lanReconnectTickTimer);
    this._lanReconnectTickTimer = window.setInterval(update, 1000);
  }

  /*
   * LAN Test Checklist:
   * - QR connect → in_match
   * - Host screen off/on 1–2s → server alive, client should not drop
   * - Hotspot/Wi‑Fi 1s toggle → debounce should avoid premature reconnect
   * - joined missing → 1200ms fallback (join+ready) should still start match
   * - 2 devices play 3–5 min → ping/pong + snapshots stable
   */
  private _beginLanReconnectFlow() {
    this._clearLanHostDisconnectDebounce();
    this._clearLanClientDisconnectDebounce();
    if (this.selectedGameMode !== 'LAN_2P') return;
    if (this.isWelcomeVisible || this.isSummaryVisible) return;
    if (
      this.lanReconnectState === 'reconnecting' ||
      this.lanReconnectState === 'resumeCountdown' ||
      this.lanReconnectState === 'timedOut' ||
      this.lanReconnectState === 'opponentLeft'
    ) return;

    this._clearLanReconnectTimers();
    this._pauseLanForReconnect();

    this.lanReconnectState = 'reconnecting';
    this.lanReconnectSecondsLeft = 30;
    this.lanResumeCountdown = 0;
    this.lanReconnectAttempt = 0;
    this.lanConnectionLost = true;
    this._setLanOpponentLeft(false);

    console.log('[LAN][TS] reconnect flow started');

    this._startLanReconnectCountdown(30000);
    if (this.lanRole === 'CLIENT') this._scheduleLanReconnectAttempt(1000);
  }

  private _scheduleLanReconnectAttempt(delayMs: number) {
    if (this.lanRole !== 'CLIENT') return;
    if (this.lanReconnectState !== 'reconnecting') return;
    if (this._lanReconnectTimer) clearTimeout(this._lanReconnectTimer);
    this._lanReconnectTimer = window.setTimeout(() => {
      void this._attemptLanReconnect();
    }, delayMs);
  }

  private async _attemptLanReconnect() {
    if (this.lanRole !== 'CLIENT') return;
    if (this.lanReconnectState !== 'reconnecting') return;

    const elapsed = Date.now() - this._lanReconnectStartedAt;
    if (elapsed >= 30000) {
      this._handleLanReconnectTimeout();
      return;
    }

    const backoff = [1000, 2000, 4000, 8000, 10000];
    const attemptIndex = Math.min(this.lanReconnectAttempt, backoff.length - 1);
    const delay = backoff[attemptIndex];
    this.lanReconnectAttempt += 1;

    console.log('[LAN][TS] reconnect attempt', { attempt: this.lanReconnectAttempt });

    const ok = await this._connectLanClient({ silent: false, source: 'manual' });
    if (ok) return;

    const elapsedAfter = Date.now() - this._lanReconnectStartedAt;
    if (elapsedAfter >= 30000) {
      this._handleLanReconnectTimeout();
      return;
    }
    const nextIndex = Math.min(this.lanReconnectAttempt, backoff.length - 1);
    this._scheduleLanReconnectAttempt(backoff[nextIndex]);
  }

  private _handleLanReconnectConnected() {
    this._clearLanHostDisconnectDebounce();
    this._clearLanClientDisconnectDebounce();
    if (this.lanReconnectState !== 'reconnecting') return;
    this._clearLanReconnectTimers();
    this.lanReconnectState = 'resumeCountdown';
    this.lanReconnectSecondsLeft = 0;
    this.lanResumeCountdown = 3;
    this.lanConnectionLost = false;
    this._setLanOpponentLeft(false);
    if (this.lanMatchHasBegun && this.lanStatus !== 'in_match') {
      this.lanStatus = 'in_match';
    }

    console.log('[LAN][TS] reconnect success, resuming');

    if (this._lanResumeCountdownTimer) clearInterval(this._lanResumeCountdownTimer);
    this._lanResumeCountdownTimer = window.setInterval(() => {
      this.lanResumeCountdown = Math.max(0, this.lanResumeCountdown - 1);
      if (this.lanResumeCountdown <= 0) {
        if (this._lanResumeCountdownTimer) {
          clearInterval(this._lanResumeCountdownTimer);
          this._lanResumeCountdownTimer = null;
        }
        this.lanReconnectState = 'idle';
        if (this.lanRole === 'HOST' && this._lanResumeShouldPlay) {
          if (this._isLanLocalTurn()) {
            this._setPlaying(true);
          } else {
            this._setPlaying(false, { force: true });
          }
        }
        // Force FULL snapshot on resume — critical transition after reconnect
        if (this.lanRole === 'HOST') {
          this._sendLanStateSnapshot(true);
          this._lanScheduleImmediateSnapshot();
        }
        this._lanResumeShouldPlay = false;
      }
    }, 1000);
  }

  private _handleLanReconnectTimeout() {
    this._clearLanReconnectTimers();
    this.lanReconnectState = 'timedOut';
    this.lanReconnectSecondsLeft = 0;
    this.lanResumeCountdown = 0;
    this.lanConnectionLost = true;
    this._lanResumeShouldPlay = false;
    console.log('[LAN][TS] reconnect timed out');
  }

  private _handleLanOpponentLeft() {
    this._clearLanReconnectTimers();
    this.lanReconnectState = 'opponentLeft';
    this.lanReconnectSecondsLeft = 0;
    this.lanResumeCountdown = 0;
    this.lanConnectionLost = true;
    this._setLanOpponentLeft(true, getT(this.language).opponentLeftMsg);
    this._pauseLanForReconnect();
  }

  private _sendLanLeave(reason: string) {
    const msg: LanMessage = { t: 'leave', reason };
    if (this.lanRole === 'CLIENT' && this._lanClientTransport?.isConnected()) {
      this._lanClientTransport.send(JSON.stringify(msg));
      return;
    }
    if (this.lanRole === 'HOST' && this._lanHostTransport?.isConnected()) {
      this._lanHostTransport.send(JSON.stringify(msg));
    }
  }

  private _resetLanClientEphemeralState() {
    // Stop timers/animations so only host snapshots drive state
    this.liveDigit = null;
    this.liveDigitElement = null;
    if (this.isPlaying) this._setPlaying(false, { force: true });
    this.isAnimating = false;
    this.isChampionActive = false;
    this._lanIncomingQueue = [];
    this._clearLanFirstSnapshotRetryTimer();
  }

  private _startLanPingLoop() {
    if (this._lanPingTimer) return;
    this._lanPingTimer = window.setInterval(() => {
      if (this.selectedGameMode !== 'LAN_2P') return;

      // Client -> host ping (host answers pong)
      if (this.lanRole === 'CLIENT' && this._lanClientTransport?.isConnected()) {
        const now = Date.now();
        const msg: LanMessage = { t: 'ping', ts: now };
        this._lanClientTransport.send(JSON.stringify(msg));
      }

      // Host -> client ping (client answers pong)
      if (this.lanRole === 'HOST' && this._lanHostTransport?.isConnected()) {
        const now = Date.now();
        const msg: LanMessage = { t: 'ping', ts: now };
        this._lanHostTransport.send(JSON.stringify(msg));

        // If we haven't seen a pong for >9s while in-match, mark opponent left.
        // With 2s interval, 9s ≈ 4-5 missed pings.
        if (
          this.lanStatus === 'in_match' &&
          this._lanWasEverConnected &&
          this.connectedPeersCount > 0 &&
          now - this._lanLastPongAt > 9000
        ) {
          this._lanMissedPongs += 1;
          if (this._lanMissedPongs >= 2) {
            this._beginLanReconnectFlow();
          }
        } else {
          this._lanMissedPongs = 0;
        }
      }
    }, 2000);
  }

  private _stopLanPingLoop() {
    if (!this._lanPingTimer) return;
    clearInterval(this._lanPingTimer);
    this._lanPingTimer = null;
    this._lanLastPongAt = 0;
    this._lanMissedPongs = 0;
  }

  /**
   * LAN CLIENT consume loop — event-driven, idle'da rAF döndürmez.
   * Queue'ya mesaj geldiğinde çağrılır; queue boşalınca loop durur.
   * Frame başına en fazla 1 snapshot apply eder (jank azaltır).
   */
  private _startLanConsumeLoop() {
    if (this._lanConsumeRaf) return;

    // Stale watchdog: rAF yerine hafif timer ile kontrol et (idle'da CPU yormaz)
    if (!(this as any)._lanStaleWatchdogTimer) {
      (this as any)._lanStaleWatchdogTimer = window.setInterval(() => {
        if (this.selectedGameMode !== 'LAN_2P' || this.lanRole !== 'CLIENT' || this.lanStatus !== 'in_match') return;
        const now = Date.now();
        const stale = this._lanLastAppliedSnapshotAt > 0 && now - this._lanLastAppliedSnapshotAt > 1200;
        if (stale && this._lanClientTransport?.isConnected()) {
          this._lanSendSyncRequest('watchdog');
        }
      }, 250);
    }

    this._lanConsumeStep();
  }

  /** Single consume step — processes queue, schedules next rAF only if queue non-empty. */
  private _lanConsumeStep() {
    // Queue boş → loop'u durdur
    if (this._lanIncomingQueue.length === 0) {
      this._lanConsumeRaf = null;
      return;
    }

    const step = () => {
      // Swap queue — yeni mesajlar bir sonraki frame'de işlensin
      const q = this._lanIncomingQueue;
      this._lanIncomingQueue = [];

      // Separate full states and patches, filter out already-applied
      let latestFull: any = null;
      const patches: any[] = [];
      for (const m of q) {
        const mAny = m as any;
        const seq = Number(mAny.stateSeq) || 0;
        if (seq <= this._lanLastAppliedStateSeq) continue;
        if (m.t === 'state') {
          if (!latestFull || seq > (latestFull.stateSeq || 0)) latestFull = mAny;
        } else if (m.t === 'state_patch') {
          patches.push(mAny);
        }
      }

      patches.sort((a: any, b: any) => (a.stateSeq || 0) - (b.stateSeq || 0));

      // Session guard
      const checkSession = (msgAny: any): boolean => {
        const msgSession = typeof msgAny.matchSessionId === 'string' ? msgAny.matchSessionId : '';
        if (!msgSession) return false;
        if (this._lanMatchSessionId !== msgSession) {
          const inActiveMatch =
            this.lanRole === 'CLIENT' &&
            this.selectedGameMode === 'LAN_2P' &&
            this.lanStatus === 'in_match' &&
            this.lanMatchHasBegun &&
            !!this._lanMatchSessionId;
          if (inActiveMatch) {
            const now = Date.now();
            if (now - (this as any)._lanConsumeStaleLogAt > 2000) {
              (this as any)._lanConsumeStaleLogAt = now;
              console.warn('[LAN][CLIENT] consume loop: drop msg from stale session', {
                msgSession,
                expected: this._lanMatchSessionId,
              });
            }
            return false;
          } else {
            this._handleLanSessionMismatch(msgSession);
          }
        }
        return true;
      };

      // Apply helper — frame başına sadece 1 kez çağrılacak
      let applied = false;
      const applyResolved = (payload: any, seq: number, msgSession: string, logType: string) => {
        this._lanLastAppliedStateSeq = seq;
        const wasFirst = !this.lanFirstSnapshotReceived;
        this.lanFirstSnapshotReceived = true;
        this._lanLastAppliedSnapshotAt = Date.now();

        if (wasFirst) {
          this._clearLanFirstSnapshotRetryTimer();
          console.info('[LAN][CLIENT] ✓ first snapshot applied', {
            stateSeq: seq,
            currentTurn: payload?.currentTurn,
            isPlaying: payload?.isPlaying,
            msSinceMatchStart: this.lanMatchJustStartedAt ? Date.now() - this.lanMatchJustStartedAt : -1,
            matchSessionId: msgSession,
            type: logType,
          });
        }

        const now = Date.now();
        if (!wasFirst && now - this._lanLastApplyLogAt > 1000) {
          console.info('[LAN] client apply snapshot', {
            stateSeq: seq,
            type: logType,
            matchSessionId: msgSession || this._lanMatchSessionId,
          });
          this._lanLastApplyLogAt = now;
        }

        this._applyHostSnapshot(payload);
        applied = true;
      };

      // Full state varsa onu seç — client baseline'ı sıfırlar
      if (latestFull) {
        if (checkSession(latestFull)) {
          const seq = Number(latestFull.stateSeq) || 0;
          if (seq > this._lanLastAppliedStateSeq) {
            this._lanClientLastFullPayload = { ...latestFull.payload };
            this._lanClientLastFullSeq = seq;
            this._lanPatchMissCount = 0;
            applyResolved(
              latestFull.payload,
              seq,
              latestFull.matchSessionId || '',
              'full',
            );
          }
        }
      }

      // Full apply edildiyse patch'ler zaten eski — sadece full yoksa en son patch'i uygula
      if (!applied && patches.length > 0) {
        // En yüksek seq'li patch'i seç → frame başına tek apply
        const bestPatch = patches[patches.length - 1];
        const seq = Number(bestPatch.stateSeq) || 0;
        if (seq > this._lanLastAppliedStateSeq && checkSession(bestPatch)) {
          const baseSeq = Number(bestPatch.baseSeq) || 0;
          if (!this._lanClientLastFullPayload || baseSeq !== this._lanClientLastFullSeq) {
            this._lanPatchMissCount++;
            const now = Date.now();
            if (now - this._lanLastJoinResyncAt > 800) {
              this._lanLastJoinResyncAt = now;
              console.warn('[LAN][CLIENT] patch base mismatch → join resync', {
                expectedBase: this._lanClientLastFullSeq,
                receivedBase: baseSeq,
                hasBaseline: !!this._lanClientLastFullPayload,
                missCount: this._lanPatchMissCount,
              });
              this._lanSendSyncRequest('join');
            }
          } else {
            // En son patch'i merge et (ara patch'ler atlanabilir — host her zaman full state üzerinden patch gönderir)
            Object.assign(this._lanClientLastFullPayload, bestPatch.patch);
            this._lanClientLastFullSeq = seq;
            this._lanPatchMissCount = 0;
            applyResolved(
              this._lanClientLastFullPayload,
              seq,
              bestPatch.matchSessionId || '',
              'patch',
            );
          }
        }
      }

      // Queue'da hâlâ mesaj varsa sonraki frame'de devam et, yoksa dur
      if (this._lanIncomingQueue.length > 0) {
        this._lanConsumeRaf = requestAnimationFrame(() => this._lanConsumeStep());
      } else {
        this._lanConsumeRaf = null;
      }
    };

    this._lanConsumeRaf = requestAnimationFrame(step);
  }

  private _stopLanConsumeLoop() {
    if (this._lanConsumeRaf) {
      cancelAnimationFrame(this._lanConsumeRaf);
      this._lanConsumeRaf = null;
    }
    if ((this as any)._lanStaleWatchdogTimer) {
      clearInterval((this as any)._lanStaleWatchdogTimer);
      (this as any)._lanStaleWatchdogTimer = null;
    }
    this._lanIncomingQueue = [];
  }

  private _lanSendSyncRequest(reason: 'join' | 'reconnect' | 'watchdog') {
    if (this.lanRole !== 'CLIENT') return;
    if (!this._lanClientTransport || !this._lanClientTransport.isConnected()) return;
    const now = Date.now();
    // Use shorter throttle (200ms) when first snapshot hasn't arrived yet,
    // so the 250ms/600ms retry timers can actually fire.
    const throttle = this.lanFirstSnapshotReceived ? 1000 : 200;
    if (now - this._lanLastSyncRequestSentAt < throttle) return;

    const msg: LanMessage = {
      t: 'sync_request',
      reason,
      matchSessionId: this._lanMatchSessionId || undefined,
      clientTs: now,
      payload: {
        matchSessionId: this._lanMatchSessionId,
        reason,
        clientTs: now,
      },
    } as LanMessage;

    this._lanClientTransport.send(JSON.stringify(msg));
    this._lanLastSyncRequestSentAt = now;
  }

  private async _stopLanHost() {
    this._stopLanHostStateBroadcast();
    this._stopLanPingLoop();
    this._stopLanIpPolling();
    this._clearLanReadyTimers();
    this._lanClientReady = false;
    this._lanNudgedJoinedOnce = false;
    if (this._lanHostIpRetryTimer) {
      clearTimeout(this._lanHostIpRetryTimer);
      this._lanHostIpRetryTimer = null;
    }
    if (!this._lanHostTransport) {
      try {
        await stopHost();
      } catch {
        // ignore
      }
      this.lanHostRunning = false;
      this.lanPeers = 0;
      this.connectedPeersCount = 0;
      this._lanMatchSessionId = null;
      this._lanStateSeq = 0;
      this._lanLastInputSeqFromClient = 0;
      this._lanLastClientActionId = null;
      this._lanLastSnapshotJson = '';
      this._lanLastFullPayload = null;
      this._lanLastFullSeq = 0;
      this._lanPatchSinceFullCount = 0;
      this._lanLastFullSentAt = 0;
      this._lanLastSnapshotSentAt = 0;
      this._lanNudgedJoinedOnce = false;
      if (this.lanRole === 'HOST') this.lanStatus = 'idle';
      return;
    }
    try {
      await this._lanHostTransport.disconnect();
    } finally {
      this._lanHostTransport = null;
      this.lanHostRunning = false;
      this.lanPeers = 0;
      this.connectedPeersCount = 0;
      this._lanClientReady = false;
      this._lanMatchSessionId = null;
      this._lanStateSeq = 0;
      this._lanLastInputSeqFromClient = 0;
      this._lanLastClientActionId = null;
      this._lanLastSnapshotJson = '';
      this._lanLastFullPayload = null;
      this._lanLastFullSeq = 0;
      this._lanPatchSinceFullCount = 0;
      this._lanLastFullSentAt = 0;
      this._lanLastSnapshotSentAt = 0;
      if (this.lanRole === 'HOST') this.lanStatus = 'idle';
    }
  }

  private _getClientWsUrl(): string {
    const ip = (this.lanClientIp || '').trim();
    const port = (this.lanClientPort || '').trim() || String(this.lanPort);
    return `ws://${ip}:${port}`;
  }

  private async _connectLanClient(options?: { silent?: boolean; source?: 'qr' | 'manual' }): Promise<boolean> {
    const silent = options?.silent ?? false;

    // Guard: avoid reconnecting to the same URL when already connected/connecting.
    // This prevents socket churn on QR auto-connect retries.
    const wsUrl = this._getClientWsUrl();
    if (this._lanClientTransport) {
      if (this.lanClientStatus === 'connecting') {
        // Already opening a socket — don't recreate
        console.info('[LAN][CLIENT] _connectLanClient skipped: already connecting');
        return false; // caller should retry later
      }
      if (this._lanClientTransport.isConnected()) {
        // Already connected — no need to recreate
        console.info('[LAN][CLIENT] _connectLanClient skipped: already connected');
        return true;
      }
    }

    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    this.lanClientError = null;
    this.lanErrorMessage = null;
    this._lanLastClientErrorCode = null;
    this.lanClientStatus = 'connecting';
    this.lanStatus = 'connecting';

    const ip = (this.lanClientIp || '').trim();
    const port = (this.lanClientPort || '').trim();
    if (!ip || !port) {
      if (!silent) {
        this.lanClientStatus = 'error';
        this.lanClientError = getT(this.language).ipPortRequired;
        this.lanErrorMessage = this.lanClientError;
        this.lanStatus = 'error';
      } else {
        this.lanClientStatus = 'idle';
        this.lanStatus = 'idle';
      }
      return false;
    }

    try {
      await this._disconnectLanClient();
    } catch {
      // ignore
    }

    const transport = new ClientWebSocketTransport(wsUrl);
    this._lanClientTransport = transport;

    transport.onMessage((raw) => this._onLanRawMessage(raw));
    transport.onStatus((s) => {
      if (s.kind === 'connected') {
        this.lanClientStatus = 'connected';
        this._lanLastClientErrorCode = null;
        this._clearLanClientDisconnectDebounce();
      }
      if (s.kind === 'connecting') this.lanClientStatus = 'connecting';
      if (s.kind === 'disconnected') {
        this.lanClientStatus = 'idle';
        if (this.lanRole === 'CLIENT' && this.selectedGameMode === 'LAN_2P') {
          if (this.lanStatus === 'in_match' || this.lanMatchHasBegun) {
            this.lanConnectionLost = true;
            console.warn('[LAN][CLIENT] disconnected during match -> keep in_match');
          } else {
            this.lanStatus = 'idle';
          }
        }
        if (
          this._lanWasEverConnected &&
          !this.isWelcomeVisible &&
          !this.isSummaryVisible &&
          this.selectedGameMode === 'LAN_2P' &&
          this.lanRole === 'CLIENT'
        ) {
          this._scheduleLanClientDisconnectDebounce('disconnected');
        }
      }
      if (s.kind === 'error') {
        this._lanLastClientErrorCode = s.errorCode || null;
        if (silent) {
          this.lanClientStatus = 'idle';
          if (this.lanRole === 'CLIENT' && this.selectedGameMode === 'LAN_2P') {
            if (this.lanStatus === 'in_match' || this.lanMatchHasBegun) {
              this.lanConnectionLost = true;
              console.warn('[LAN][CLIENT] error during match -> keep in_match');
            } else {
              this.lanStatus = 'idle';
            }
          }
        } else {
          const mapped = this._mapClientConnectError(s.message);
          this.lanClientStatus = 'error';
          this.lanClientError = mapped;
          this.lanErrorMessage = mapped;
          if (this.lanRole === 'CLIENT' && this.selectedGameMode === 'LAN_2P') {
            if (this.lanStatus === 'in_match' || this.lanMatchHasBegun) {
              this.lanConnectionLost = true;
              console.warn('[LAN][CLIENT] error during match -> keep in_match');
            } else {
              this.lanStatus = 'error';
            }
          }
        }
        if (
          this._lanWasEverConnected &&
          !this.isWelcomeVisible &&
          !this.isSummaryVisible &&
          this.selectedGameMode === 'LAN_2P' &&
          this.lanRole === 'CLIENT'
        ) {
          this._scheduleLanClientDisconnectDebounce('error');
        }
      }
    });

    try {
      await transport.connect();
      console.info('[LAN][CLIENT] ws connected', {
        url: wsUrl,
        lanRole: this.lanRole,
        lanStatus: this.lanStatus,
      });
      this.lanClientStatus = 'connected';
      this._lanWasEverConnected = true;
      this.lanConnectionLost = false;
      this._lanLastAppliedStateSeq = 0;
      this.lanFirstSnapshotReceived = false;
      this._lanClientLastFullPayload = null;
      this._lanClientLastFullSeq = 0;
      this._lanPatchMissCount = 0;
      this._lanLastJoinResyncAt = 0;
      if (this.lanReconnectState === 'idle') {
        this.lanMatchHasBegun = false;
        this.lanClientReadySent = false;
      }
      if (this.isLanQrModalOpen) this._closeLanQrModal();
      this._resetLanClientEphemeralState();
      this._setLanOpponentLeft(false);
      if (this.lanReconnectState === 'idle') {
        this.lanStatus = 'waiting_start';
      } else {
        this.lanStatus = this.lanMatchHasBegun ? 'in_match' : 'waiting_start';
      }

      // ✅ Client connect success: waiting_start ise match_start timeout'u başlat
      if (this.lanStatus === 'waiting_start' && this.lanReconnectState === 'idle') {
        this._startLanMatchStartTimeout();
      }

      if (this.lanReconnectState === 'reconnecting') {
        this._handleLanReconnectConnected();
      }

      if (this.lanReconnectState === 'reconnecting') {
        // Reconnect: only request a fresh snapshot; avoid join spam.
        const sync: LanMessage = { t: 'sync_request', reason: 'reconnect' };
        transport.send(JSON.stringify(sync));
      } else {
        // First join: request snapshot and send join handshake.
        const sync: LanMessage = { t: 'sync_request', reason: 'join' };
        transport.send(JSON.stringify(sync));
        console.info('[LAN][CLIENT] sync_request(join) sent');
        const join: LanMessage = { t: 'join', name: this.awayTeamName || 'Player 2' };
        transport.send(JSON.stringify(join));
        console.info('[LAN][CLIENT] join sent');

        this._sendLanReady();

        // ✅ Eğer joined gelmezse (ör: paket kaybı), 1 kez daha join + sync gönder.
        window.setTimeout(() => {
          if (this.lanRole !== 'CLIENT') return;
          if (!this._lanClientTransport || !this._lanClientTransport.isConnected()) return;

          // joined gelince _lanAssignedPlayer set ediliyor; yoksa hala handshake eksik demektir
          if (!this._lanAssignedPlayer && this.lanStatus === 'waiting_start') {
            console.warn('[LAN][QR] joined not received yet -> retry join');
            const sync2: LanMessage = { t: 'sync_request', reason: 'join' };
            this._lanClientTransport.send(JSON.stringify(sync2));
            const join2: LanMessage = { t: 'join', name: this.awayTeamName || 'Player 2' };
            this._lanClientTransport.send(JSON.stringify(join2));
          }
        }, 900);

        // ✅ Fallback: joined hâlâ gelmezse join + ready tekrar dene
        window.setTimeout(() => {
          if (this.lanRole !== 'CLIENT') return;
          if (!this._lanClientTransport || !this._lanClientTransport.isConnected()) return;
          if (this.lanStatus !== 'waiting_start') return;
          if (this._lanAssignedPlayer) return;

          console.warn('[LAN][CLIENT] joined missing -> retry join + send ready fallback');
          const sync3: LanMessage = { t: 'sync_request', reason: 'join' };
          this._lanClientTransport.send(JSON.stringify(sync3));
          const join3: LanMessage = { t: 'join', name: this.awayTeamName || 'Player 2' };
          this._lanClientTransport.send(JSON.stringify(join3));
          if (!this.lanClientReadySent) {
            const ready: LanMessage = { t: 'ready' };
            this._lanClientTransport.send(JSON.stringify(ready));
            this.lanClientReadySent = true;
          }
          this._startLanMatchStartTimeout();
        }, 1200);
      }

      console.info('[LAN] client connected', {
        lanReconnectState: this.lanReconnectState,
        lanMatchHasBegun: this.lanMatchHasBegun,
        lanStatus: this.lanStatus,
      });

      this._startLanConsumeLoop();
      this._startLanPingLoop();
      return true;
    } catch (e) {
      if (!this._lanLastClientErrorCode) {
        const code = (e as any)?.errorCode;
        this._lanLastClientErrorCode = typeof code === 'string' ? code : 'UNKNOWN';
      }
      if (silent) {
        this.lanClientStatus = 'idle';
        this.lanStatus = 'idle';
      } else {
        const raw = (e as any)?.message || getT(this.language).connectionFailed;
        const mapped = this._mapClientConnectError(raw);
        this.lanClientStatus = 'error';
        this.lanClientError = mapped;
        this.lanErrorMessage = mapped;
        this.lanStatus = 'error';
      }
      return false;
    }
  }

  private _mapClientConnectError(message?: string) {
    const raw = (message || '').toLowerCase();
    if (raw.includes('refused') || raw.includes('connect') || raw.includes('websocket')) {
      return getT(this.language).hostNotReadyOrRefused;
    }
    return message || getT(this.language).connectionFailed;
  }

  private async _disconnectLanClient() {
    if (!this._lanClientTransport) {
      this.lanClientStatus = 'idle';
      this._clearLanQrAutoConnect();
      this._clearLanReadyTimers();
      this.lanClientReadySent = false;
      if (this.lanReconnectState === 'idle') this.lanMatchHasBegun = false;
      return;
    }
    try {
      await this._lanClientTransport.disconnect();
    } finally {
      this._lanClientTransport = null;
      this.lanClientStatus = 'idle';
      if (this.lanRole === 'CLIENT') this.lanStatus = 'idle';
      this._stopLanConsumeLoop();
      this._stopLanPingLoop();
      this._clearLanQrAutoConnect();
      this._clearLanReadyTimers();
      this.lanClientReadySent = false;
      this._lanLastAppliedStateSeq = 0;
      this.lanFirstSnapshotReceived = false;
      this._lanClientLastFullPayload = null;
      this._lanClientLastFullSeq = 0;
      this._lanPatchMissCount = 0;
      this._lanLastJoinResyncAt = 0;
      this._lanMatchSessionId = null;
      this._lanLastSnapshotJson = '';
      this._lanLastFullPayload = null;
      this._lanLastFullSeq = 0;
      this._lanPatchSinceFullCount = 0;
      this._lanLastFullSentAt = 0;
      this._lanLastSnapshotSentAt = 0;
      if (this.lanReconnectState === 'idle') this.lanMatchHasBegun = false;
    }
  }

  private _hostStartMatch() {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
    if (!this._lanHostTransport || !this.lanHostRunning) return;
    if (this.lanPeers < 1) return;
    if (!this._lanClientReady) return;

    this._startNewLanSession();

    // Host is single authority: send match_start only from host.
    const msg: LanMessage = { t: 'match_start', matchSessionId: this._lanMatchSessionId };
    this._lanHostTransport.send(JSON.stringify(msg));
    this.lanMatchHasBegun = true;
    this.lanMatchJustStartedAt = Date.now();
    this.lanFirstSnapshotReceived = false;
    this.lanStatus = 'in_match';
    this._restartMatch();
    if (this.lanHostRunning) {
      this._sendLanStateSnapshot(true);
      this._lanScheduleImmediateSnapshot();
    }
    console.info('[LAN] match_start host', {
      currentTurn: this.currentTurn,
      lanMatchJustStartedAt: this.lanMatchJustStartedAt,
    });
  }

  private _onLanRawMessage(raw: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    if (!isLanMessage(parsed)) return;
    const msg = parsed as LanMessage;

    const msgSessionId = (msg as any)?.matchSessionId as string | undefined;
    // Throttle: state/state_patch/input_ack mesajları çok sık gelir, her birini loglamak spam olur
    const isFrequentMsg = msg.t === 'state' || msg.t === 'state_patch' || msg.t === 'input_ack' || msg.t === 'input' || msg.t === 'ping' || msg.t === 'pong';
    if (!isFrequentMsg) {
      console.info('[LAN][MSG] recv', {
        role: this.lanRole,
        status: this.lanStatus,
        type: msg.t,
        matchSessionId: msgSessionId,
      });
    }

    if (this.lanRole === 'CLIENT') {
      if (msg.t === 'state' || msg.t === 'state_patch') {
        const now = Date.now();
        if (now - this._lanLastClientStateLogAt > 1000) {
          this._debugLog(`[LAN] client recv ${msg.t}`);
          this._lanLastClientStateLogAt = now;
        }
      } else {
        this._debugLog(`[LAN] client recv ${msg.t}`);
      }
    }

    // HOST: receiving any non-ping/pong message proves a client is connected.
    // The native clientCount event can lag behind actual WS messages.
    if (this.lanRole === 'HOST' && msg.t !== 'ping' && msg.t !== 'pong') {
      if (this.connectedPeersCount < 1) {
        this.connectedPeersCount = 1;
        if (this.lanPeers < 1) this.lanPeers = 1;
        console.info('[LAN][HOST] inferred clientCount>=1 from message', { type: msg.t });
      }
    }

    // Health: ping/pong
    if (msg.t === 'ping') {
      if (this.lanRole === 'CLIENT' && this._lanClientTransport?.isConnected()) {
        const pong: LanMessage = { t: 'pong', ts: msg.ts };
        this._lanClientTransport.send(JSON.stringify(pong));
      }
      if (this.lanRole === 'HOST' && this._lanHostTransport?.isConnected()) {
        const pong: LanMessage = { t: 'pong', ts: msg.ts };
        this._lanHostTransport.send(JSON.stringify(pong));
      }
      return;
    }
    if (msg.t === 'pong') {
      if (this.lanRole === 'HOST') {
        this._lanLastPongAt = Date.now();
        this._lanMissedPongs = 0;
        if (this.lanOpponentLeft) this._setLanOpponentLeft(false);
        if (this.lanReconnectState === 'reconnecting') this._handleLanReconnectConnected();
      }
      return;
    }

    if (msg.t === 'sync_request') {
      if (this.lanRole === 'HOST' && this._lanHostTransport?.isConnected()) {
        const now = Date.now();
        if (now - this._lanLastSyncRequestAt < 200) return;
        this._lanLastSyncRequestAt = now;

        const requestedSession = (msg as any)?.matchSessionId as string | undefined;

        const matchStarted =
          this.lanStatus === 'in_match' ||
          this.lanMatchHasBegun === true ||
          this.isWelcomeVisible === false;

        if (matchStarted) {
          if (!this._lanMatchSessionId) this._startNewLanSession();
          const sessionMismatch =
            typeof requestedSession === 'string' &&
            requestedSession.trim().length > 0 &&
            this._lanMatchSessionId &&
            requestedSession !== this._lanMatchSessionId;
          const shouldSendMatchStart = sessionMismatch || msg.reason === 'join';

          if (shouldSendMatchStart) {
            const startMsg: LanMessage = { t: 'match_start', matchSessionId: this._lanMatchSessionId };
            this._lanHostTransport.send(JSON.stringify(startMsg));
          }
        }

        this._sendLanStateSnapshot(true);
      }
      return;
    }

    // Minimal handshake: join/joined
    if (msg.t === 'join') {
      if (this.lanRole === 'HOST' && this._lanHostTransport?.isConnected()) {
        console.info('[LAN][HOST] host recv join');
        if (!this._lanMatchSessionId) this._startNewLanSession();
        const now = Date.now();
        if (now - this._lanLastJoinLogAt > 1000) {
          this._debugLog('[LAN] host recv join');
          this._lanLastJoinLogAt = now;
        }
        if (typeof msg.name === 'string' && msg.name.trim().length > 0) {
          const nextName = msg.name.trim();
          if (this.awayTeamName !== nextName) this.awayTeamName = nextName;
        }
        const seed = Math.floor(Math.random() * 1_000_000);
        this._lanSeed = seed;
        const joined: LanMessage = {
          t: 'joined',
          player: 2,
          seed,
          matchSessionId: this._lanMatchSessionId || undefined,
        } as LanMessage;
        this._lanHostTransport.send(JSON.stringify(joined));
        console.info('[LAN][HOST] host sent joined');
        this._debugLog('[LAN] host sent joined');

        // ✅ join geldiğinde host status waiting_start'a çek (welcome ekranındaysa)
        if (this.lanStatus !== 'waiting_start' && this.lanStatus !== 'in_match') {
          if (this.isWelcomeVisible || !this.lanMatchHasBegun) {
            this.lanStatus = 'waiting_start';
          }
        }

        // ✅ join geldi ama ready gelmezse fallback: 900ms sonra otomatik başlat
        if (!this._lanClientReady && this.lanStatus !== 'in_match') {
          console.info('[LAN][HOST] join received -> start forceStartTimer');
          this._startLanForceStartTimer(900);
        }

        this._sendLanStateSnapshot(true);
      }
      return;
    }
    if (msg.t === 'joined') {
      if (this.lanRole === 'CLIENT') {
        const joinedSession = (msg as any)?.matchSessionId as string | undefined;
        if (typeof joinedSession === 'string' && joinedSession.trim().length > 0) {
          if (this._lanMatchSessionId !== joinedSession) {
            this._handleLanSessionMismatch(joinedSession);
          } else {
            this._lanMatchSessionId = joinedSession;
          }
        }
        this._lanAssignedPlayer = msg.player;
        this._lanSeed = msg.seed;
        console.info('[LAN][CLIENT] client recv joined -> send ready');
        this._debugLog('[LAN] client joined; auto ready');
        this._sendLanReady();
      }
      return;
    }

    if (msg.t === 'ready') {
      if (this.lanRole === 'HOST') {
        this._lanClientReady = true;
        this._clearLanReadyTimers();
        this._clearLanForceStartTimer();
        this._debugLog('[LAN] host received ready', { clientReady: this._lanClientReady });
        console.info('[LAN][HOST] host recv ready -> send match_start');
        this._maybeAutoStartLanMatch('ready');

        // Retry after short delay if first attempt failed (clientCount race)
        if (this.lanStatus !== 'in_match') {
          window.setTimeout(() => {
            if (this.lanStatus === 'in_match') return;
            if (this.lanRole !== 'HOST') return;
            this._maybeAutoStartLanMatch('ready_retry');
          }, 300);
        }
      }
      return;
    }

    if (msg.t === 'match_start') {
      // Client: start match immediately when host starts.
      if (this.lanRole === 'CLIENT') {
        console.info('[LAN][CLIENT] client recv match_start -> restartMatch');
        const sessionId = (msg as any)?.matchSessionId as string | undefined;
        if (typeof sessionId === 'string' && sessionId.trim().length > 0) {
          if (this._lanMatchSessionId !== sessionId) {
            // Save any queued state messages that belong to the NEW session before clearing
            const preserved = this._lanIncomingQueue.filter(
              (m) => (m as any).matchSessionId === sessionId
            );
            this._handleLanSessionMismatch(sessionId);
            // Re-inject preserved messages so the consume loop can apply them
            if (preserved.length > 0) {
              this._lanIncomingQueue.push(...preserved);
            }
          } else {
            this._lanMatchSessionId = sessionId;
          }
        }

        this._clearLanReadyTimers();
        this._clearLanFirstSnapshotRetryTimer();
        this.lanMatchHasBegun = true;
        this.lanMatchJustStartedAt = Date.now();
        this.lanFirstSnapshotReceived = false;
        this._lanClientLastFullPayload = null;
        this._lanClientLastFullSeq = 0;
        this._lanPatchMissCount = 0;
        this._lanLastJoinResyncAt = 0;
        this.lanStatus = 'in_match';
        if (this._lanLastAppliedSnapshotAt === 0) this._lanLastAppliedSnapshotAt = Date.now();
        this.selectedGameMode = 'LAN_2P';
        this.isWelcomeVisible = false;
        this.isSummaryVisible = false;
        if (this.isLanModalOpen) this._closeLanModal();
        this.isLanModalOpen = false;

        // Start consume loop BEFORE restartMatch so state messages arriving
        // during _restartMatch → _startGame() are not lost.
        this._startLanConsumeLoop();

        // Immediately request fresh state from host (before restartMatch so host
        // can start sending snapshots while we reset local state).
        this._lanSendSyncRequest('join');

        // preserveLanQueue: prevent _restartMatch from clearing _lanIncomingQueue
        // so any state snapshots already queued survive the reset.
        this._restartMatch({ preserveLanQueue: true });

        // Retry timers: if first snapshot hasn't arrived yet, re-request
        window.setTimeout(() => {
          if (!this.lanFirstSnapshotReceived && this.lanStatus === 'in_match') {
            console.warn('[LAN][CLIENT] 250ms: first snapshot not received, re-requesting');
            this._lanSendSyncRequest('join');
          }
        }, 250);
        this._lanFirstSnapshotRetryTimer = window.setTimeout(() => {
          if (!this.lanFirstSnapshotReceived && this.lanStatus === 'in_match') {
            console.warn('[LAN][CLIENT] 600ms: first snapshot STILL not received, re-requesting');
            this._lanSendSyncRequest('join');
          }
        }, 600);

        this.requestUpdate();
        console.info('[LAN][CLIENT] match_start applied', {
          currentTurn: this.currentTurn,
          isWelcomeVisible: this.isWelcomeVisible,
          lanMatchJustStartedAt: this.lanMatchJustStartedAt,
          matchSessionId: this._lanMatchSessionId,
          queueLen: this._lanIncomingQueue.length,
        });
      }
      return;
    }

    if (msg.t === 'leave') {
      this._handleLanOpponentLeft();
      return;
    }

    if (msg.t === 'input') {
      // Host consumes client inputs
      if (this.lanRole === 'HOST') this._applyRemoteInput(msg);
      return;
    }

    if (msg.t === 'input_ack') {
      if (this.lanRole !== 'CLIENT') return;
      const m = msg as LanInputAckMessage;

      if (this._lanPendingInput && m.actionId === this._lanPendingInput.actionId) {
        const accepted = !!m.accepted;
        const reason = String(m.reason || '');

        if (!accepted) {
          this._clearLanPendingInput('reject');
          // reject'te override'ı snapshot'a bırak (sert zıplama olmasın)
          this.requestUpdate();
          if (reason === 'deadline') {
            this.lanClientError = getT(this.language).tooLate;
          } else if (reason === 'not_your_turn') {
            this.lanClientError = getT(this.language).notYourTurn;
          } else if (reason === 'lock') {
            this.lanClientError = getT(this.language).tooFastRetry;
          }
        } else {
          this._clearLanPendingInput('ack');
          // accepted=true: do NOT clear visual override here — snapshot will clear it
          // ACK geldi, queued toggle varsa hemen gönder
          if (this._lanClientQueuedToggle) {
            this._lanClientQueuedToggle = false;
            this._lanClientDesiredPlaying = null;
            if (this._isLanLocalInputAllowed()) {
              this._lanClientSendBallToggleWithRetry();
            }
          }
        }
        console.info('[LAN][CLIENT] input_ack received', { seq: m.seq, accepted, reason });
      }
      return;
    }

    if (msg.t === 'state') {
      // Client applies host snapshots
      if (this.lanRole === 'CLIENT') {
        const msgAny = msg as any;
        const seq = Number(msgAny.stateSeq) || 0;
        if (seq <= this._lanLastAppliedStateSeq) return;

        // During an active match, DROP state messages from a different session.
        // Only match_start is allowed to switch sessions. Stale/stray snapshots
        // from a previous session must never reset lanFirstSnapshotReceived.
        const msgSession = typeof msgAny.matchSessionId === 'string' ? msgAny.matchSessionId : '';
        if (
          this.selectedGameMode === 'LAN_2P' &&
          this.lanStatus === 'in_match' &&
          this.lanMatchHasBegun &&
          msgSession &&
          this._lanMatchSessionId &&
          msgSession !== this._lanMatchSessionId
        ) {
          const now = Date.now();
          if (now - (this as any)._lanLastStaleSessionLogAt > 2000) {
            (this as any)._lanLastStaleSessionLogAt = now;
            console.warn('[LAN][CLIENT] drop state from different session', {
              msgSession,
              expected: this._lanMatchSessionId,
            });
          }
          return;
        }

        this._lanIncomingQueue.push(msg);
        // Ensure consume loop is running so snapshot can be applied even if
        // match_start hasn't arrived yet (or loop was stopped).
        if (!this._lanConsumeRaf) this._startLanConsumeLoop();
        else this._lanConsumeStep(); // loop durmuşsa tekrar tetikle
      }
      return;
    }

    if (msg.t === 'state_patch') {
      // Client applies host delta patches
      if (this.lanRole === 'CLIENT') {
        const msgAny = msg as any;
        const seq = Number(msgAny.stateSeq) || 0;
        if (seq <= this._lanLastAppliedStateSeq) return;

        // Session guard (same as full state)
        const msgSession = typeof msgAny.matchSessionId === 'string' ? msgAny.matchSessionId : '';
        if (
          this.selectedGameMode === 'LAN_2P' &&
          this.lanStatus === 'in_match' &&
          this.lanMatchHasBegun &&
          msgSession &&
          this._lanMatchSessionId &&
          msgSession !== this._lanMatchSessionId
        ) {
          return;
        }

        this._lanIncomingQueue.push(msg);
        if (!this._lanConsumeRaf) this._startLanConsumeLoop();
        else this._lanConsumeStep(); // loop durmuşsa tekrar tetikle
      }
      return;
    }
  }

  private _applyRemoteInput(msg: LanInputMessage) {
    if (this.selectedGameMode !== 'LAN_2P') return;
    if (this.lanRole !== 'HOST') return;
    if (this.lanStatus !== 'in_match') {
      this._sendLanInputAck(msg, false, 'not_in_match');
      this._scheduleRejectSnapshot();
      return;
    }
    if (this.lanReconnectState !== 'idle' || this.lanOpponentLeft) {
      this._sendLanInputAck(msg, false, 'not_in_match');
      this._scheduleRejectSnapshot();
      return;
    }
    // Player 2 is Away (client)
    if (msg.player !== 2) return;
    if (!msg.matchSessionId || msg.matchSessionId !== this._lanMatchSessionId) {
      this._sendLanInputAck(msg, false, 'bad_session');
      return;
    }
    if (msg.seq <= this._lanLastInputSeqFromClient) {
      this._sendLanInputAck(msg, false, 'duplicate');
      this._scheduleRejectSnapshot();
      return;
    }
    if (!this._rememberLanActionId(msg.actionId)) {
      this._sendLanInputAck(msg, false, 'duplicate');
      this._scheduleRejectSnapshot();
      return;
    }
    this._lanLastInputSeqFromClient = msg.seq;
    if (this.currentTurn !== 'Away') {
      this._sendLanInputAck(msg, false, 'not_your_turn');
      this._scheduleRejectSnapshot();
      return;
    }
    // Block input during animations (goal/card/champion/summary) just like _handleBallClick does.
    if (this.isAnimating || this.isChampionActive || this.isSummaryVisible) {
      this._sendLanInputAck(msg, false, 'animating');
      this._scheduleRejectSnapshot();
      return;
    }
    if (msg.data?.kind !== 'ball' || msg.data?.action !== 'toggle') return;
    if (!Number.isFinite(msg.clientTs)) {
      this._sendLanInputAck(msg, false, 'other');
      this._scheduleRejectSnapshot();
      return;
    }
    const now = Date.now();
    if (this.turnDeadlineTs > 0 && now > this.turnDeadlineTs) {
      this._sendLanInputAck(msg, false, 'deadline');
      this._scheduleRejectSnapshot();
      return;
    }
    if (this.turnDeadlineTs > 0 && msg.clientTs > this.turnDeadlineTs + 120) {
      this._sendLanInputAck(msg, false, 'deadline');
      this._scheduleRejectSnapshot();
      return;
    }
    if (now < this._lanToggleLockUntil) {
      this._sendLanInputAck(msg, false, 'lock');
      this._scheduleRejectSnapshot();
      return;
    }
    this._lanToggleLockUntil = now + 60;
    // Apply remote input on host with authoritative toggle.
    this._lanLastClientActionId = msg.actionId;
    this._lanHostApplyToggle();
    this._sendLanInputAck(msg, true);
  }

  /** Send input_ack back to CLIENT so it can clear pending state & retries. */
  private _sendLanInputAck(input: any, accepted: boolean, reason?: 'not_your_turn' | 'deadline' | 'lock' | 'not_in_match' | 'animating' | 'bad_session' | 'duplicate' | 'other') {
    if (!this._lanHostTransport || !this._lanMatchSessionId) return;
    const ack: any = {
      t: 'input_ack',
      matchSessionId: this._lanMatchSessionId,
      actionId: input.actionId,
      seq: input.seq,
      accepted,
      reason,
      hostTick: Date.now(),
      stateSeq: this._lanStateSeq,
    };
    this._lanHostTransport.send(JSON.stringify(ack));
  }

  private _isLanLocalInputAllowed(): boolean {
    if (this.selectedGameMode !== 'LAN_2P') return true;
    if (this.lanReconnectState !== 'idle') return false;
    if (this.lanOpponentLeft) return false;
    if (this.lanRole === 'CLIENT' && this.lanConnectionLost) return false;
    if (this.lanRole === 'CLIENT' && !this._lanMatchSessionId) return false;
    if (this.lanRole === 'CLIENT' && !this.lanFirstSnapshotReceived) {
      // Defensive watchdog: if match started but first snapshot is missing for >800ms,
      // re-request state from host.
      if (
        this.lanMatchHasBegun &&
        this.lanStatus === 'in_match' &&
        this._lanClientTransport?.isConnected()
      ) {
        const now = Date.now();
        if (now - this._lanFirstSnapshotWatchdogFiredAt > 800) {
          this._lanFirstSnapshotWatchdogFiredAt = now;
          console.warn('[LAN][CLIENT] watchdog: lanFirstSnapshotReceived still false, re-requesting');
          this._lanSendSyncRequest('watchdog');
        }
      }
      return false;
    }
    return this._isLanLocalTurn();
  }

  private _createLanActionId(): string {
    const c = (globalThis as any)?.crypto;
    if (c?.randomUUID) return c.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${this._lanInputSeq + 1}`;
  }

  // ── Client visual playing override (optimistic UI) ──────────────────
  private _lanGetVisualPlaying(): boolean {
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT' && this._lanVisualPlayingOverride !== null) {
      return this._lanVisualPlayingOverride;
    }
    return this.isPlaying;
  }

  // ── Client input retry/ack helpers ──────────────────────────────────
  private _lanClientSendBallToggleWithRetry() {
    if (!this._lanClientTransport || !this._lanClientTransport.isConnected?.()) return;
    if (!this._lanMatchSessionId || !this.lanFirstSnapshotReceived) return;
    if (this._lanPendingInput) return;

    const actionId = this._createLanActionId();
    const seq = ++this._lanInputSeq;

    const msg: any = {
      t: 'input',
      matchSessionId: this._lanMatchSessionId,
      player: 2,
      seq,
      actionId,
      clientTs: Date.now(),
      data: { kind: 'ball', action: 'toggle' },
    };

    this._lanPendingInput = { actionId, seq, sentAt: Date.now(), tries: 1, timer: null };
    this._lanClientTapPending = true;
    this._lanLastClientTapAt = Date.now();

    // hızlı "dokundu" hissi (haptic varsa)
    try { (window as any).Haptics?.impact?.({ style: 'LIGHT' }); } catch {}

    this._lanClientTransport.send(JSON.stringify(msg));

    const retry = () => {
      if (!this._lanPendingInput) return;
      if (this._lanPendingInput.actionId !== actionId) return;

      if (this._lanPendingInput.tries >= 4) {
        this._clearLanPendingInput('timeout');
        this.lanClientError = getT(this.language).connectionDelayed;
        return;
      }

      this._lanPendingInput.tries += 1;
      this._lanPendingInput.sentAt = Date.now();
      this._lanClientTransport?.send(JSON.stringify(msg));
      this._lanPendingInput.timer = window.setTimeout(retry, 80);
    };

    this._lanPendingInput.timer = window.setTimeout(retry, 80);
  }

  private _clearLanPendingInput(_why: string) {
    if (this._lanPendingInput?.timer) clearTimeout(this._lanPendingInput.timer);
    this._lanPendingInput = null;
    this._lanClientTapPending = false;
    if (_why === 'timeout' || _why === 'reject') {
      this._lanSuppressNextBallSound = false;
      this._lanClientQueuedToggle = false;
      this._lanClientDesiredPlaying = null;
    }

    if (_why === 'timeout') {
      this._lanVisualPlayingOverride = null;
    }

    // CLIENT: pending class'ları anında DOM'dan temizle
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT') {
      this._lanApplyImmediateBallVisual(this._lanGetVisualPlaying());
    }
  }

  private _rememberLanActionId(actionId: string): boolean {
    if (this._lanRecentActionIds.has(actionId)) return false;
    this._lanRecentActionIds.add(actionId);
    this._lanRecentActionIdQueue.push(actionId);
    if (this._lanRecentActionIdQueue.length > 40) {
      const old = this._lanRecentActionIdQueue.shift();
      if (old) this._lanRecentActionIds.delete(old);
    }
    return true;
  }

  private _scheduleRejectSnapshot() {
    const now = Date.now();
    if (now - this._lanLastRejectSnapshotAt < 180) return;
    this._lanLastRejectSnapshotAt = now;
    this._lanScheduleImmediateSnapshot();
  }

  private _randTurnLimitMs(): number {
    return 3500 + Math.floor(Math.random() * (4500 - 3500 + 1));
  }

  private _clearTurnTimers(): void {
    if (this._turnWarnTickTimer) {
      clearInterval(this._turnWarnTickTimer);
      this._turnWarnTickTimer = null;
    }
    if (this._turnAutoStopTimer) {
      clearTimeout(this._turnAutoStopTimer);
      this._turnAutoStopTimer = null;
    }
  }

  private _isAutoStopAuthority(): boolean {
    if (this.selectedGameMode === 'LAN_2P') return this.lanRole === 'HOST';
    return true;
  }

  private _shouldShowTurnHint(): boolean {
    if (!this.isPlaying) return false;
    if (this.turnTimeLimitMs <= 0 || this.turnDeadlineTs <= 0) return false;
    if (this.isWelcomeVisible || this.isSummaryVisible) return false;
    if (this.isAnimating || this.isChampionActive) return false;
    if (this._isBotTurn()) return false;
    if (this.selectedGameMode === 'LAN_2P') return this._isLanLocalTurn();
    return true;
  }

  private _onTurnTimeExpired() {
    if (!this.isPlaying) return;
    if (this.isWelcomeVisible || this.isSummaryVisible) return;
    if (this.isAnimating || this.isChampionActive) return;
    if (!this._isAutoStopAuthority()) return;

    this.lastEvent = getT(this.language).timeUpAutoStopped;

    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') {
      this._lanHostApplyToggle();
    } else {
      this._setPlaying(false, { force: true });
    }

    this._clearTurnTimers();
  }

  private _setPlaying(next: boolean, options?: { force?: boolean; suppressSound?: boolean }) {
    const force = options?.force ?? false;
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT' && !force) return;
    if (next === this.isPlaying) return;

    const wasPlaying = this.isPlaying;

    this.isPlaying = next;
    this.classList.toggle('ball-live', this.isPlaying);

    // When play starts: clear previous badge and show generic "ball in play" message
    if (!wasPlaying && next) {
      this.lastDigit = null;
      const t = getT(this.language);

      // 1) Penaltı modu her zaman öncelikli
      if (this.isPenaltyMode || this.isMatchPenalty) {
        this.lastEvent = t.penaltyInPlay;
      } else if (!this.hasKickoffHappened) {
        // 2) İlk kickoff: "MAÇ BAŞLADI.."
        this.lastEvent = (t as any).matchStarted ?? t.ballInPlay;
        this.hasKickoffHappened = true;
      } else {
        // 3) Normal akış: "MAÇ DEVAM EDİYOR.."
        this.lastEvent = t.ballInPlay;
      }

      // Ball-hud: start live digit flow
      this._spinStartTs = Date.now();
      this._clearBallHudTimers();
      this.ballHudText = '';
      this._showBallHudRunning();
      this._startLiveDigitTicker();

      if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') {
        // Ensure clients see the immediate change
        try { this._lanScheduleImmediateSnapshot(); } catch (e) { /* swallow */ }
      }
    }

    if (this.isPlaying) {
      isBallMoving = true;
      this._optimizeBallAnimation(true);
      this.liveDigit = this.lastDigit ?? 0;
      this._cacheUiRefs();
    } else {
      isBallMoving = false;
      this._optimizeBallAnimation(false);
      this.liveDigit = null;
    }

    if (wasPlaying && !next) {
      // Ball-hud: stop ticker and show result
      this._stopLiveDigitTicker();
      this.liveDigit = null;
      this._showBallHudResult(this.lastDigit);

      this._clearTurnTimers();
      this.turnTimeLimitMs = 0;
      this.turnDeadlineTs = 0;
    }

    if (!wasPlaying && next) {
      if (this._isAutoStopAuthority()) {
        const limit = this._randTurnLimitMs();
        this.turnTimeLimitMs = limit;
        this.turnDeadlineTs = Date.now() + limit;
      }

      this._clearTurnTimers();
      this._turnWarnTickTimer = window.setInterval(() => {
        if (this._shouldShowTurnHint()) this.requestUpdate();
      }, 120);

      if (this._isAutoStopAuthority()) {
        const ms = Math.max(0, this.turnDeadlineTs - Date.now());
        this._turnAutoStopTimer = window.setTimeout(() => this._onTurnTimeExpired(), ms);
      }
    }

    if (!options?.suppressSound && this.onBallClick) this.onBallClick(this.isPlaying);
  }

  private _applyHostSnapshot(p: LanStatePayload) {
    // Capture visual state BEFORE clearing override (needed for suppress check)
    const visualBefore = this._lanGetVisualPlaying();

    // Lit performance rule:
    // - Do NOT force requestUpdate spam on every LAN snapshot.
    // - Only mutate reactive @state fields if value actually changed.
    //   (Important: JSON snapshots recreate arrays each time; use deep equality for arrays.)

    const boolArrayEq = (a: boolean[] | null | undefined, b: boolean[] | null | undefined): boolean => {
      if (a === b) return true;
      if (!a && !b) return true;
      const aa = a ?? [];
      const bb = b ?? [];
      if (aa.length !== bb.length) return false;
      for (let i = 0; i < aa.length; i++) {
        if (aa[i] !== bb[i]) return false;
      }
      return true;
    };

    if (
      this.selectedGameMode === 'LAN_2P' &&
      this.lanRole === 'CLIENT' &&
      this.lanStatus === 'in_match' &&
      !this.lanFirstSnapshotReceived
    ) {
      this.lanFirstSnapshotReceived = true;
      this._clearLanFirstSnapshotRetryTimer();
      console.info('[LAN] first snapshot applied (fallback path)', { currentTurn: p.currentTurn });
    }

    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT') {
      const payloadMatchStarted =
        p.isWelcomeVisible === false ||
        p.isPlaying === true ||
        p.matchMinute > 0 ||
        p.isPenaltyMode === true ||
        p.isMatchPenalty === true;

      if (payloadMatchStarted) {
        if (!this.lanMatchHasBegun) this.lanMatchHasBegun = true;
        if (this.lanStatus !== 'in_match') {
          this.lanStatus = 'in_match';
          if (this._lanLastAppliedSnapshotAt === 0) this._lanLastAppliedSnapshotAt = Date.now();
        }
        this._clearLanReadyTimers();
        if (this.selectedGameMode !== 'LAN_2P') this.selectedGameMode = 'LAN_2P';
        if (this.isWelcomeVisible) this.isWelcomeVisible = false;
        if (this.isSummaryVisible) this.isSummaryVisible = false;
        if (this.isLanModalOpen) this._closeLanModal();
        this.isLanModalOpen = false;
      }
    }

    if (this.isWelcomeVisible !== p.isWelcomeVisible) this.isWelcomeVisible = p.isWelcomeVisible;
    if (this.isSummaryVisible !== p.isSummaryVisible) this.isSummaryVisible = p.isSummaryVisible;
    if (this.turnTimeLimitMs !== p.turnTimeLimitMs) this.turnTimeLimitMs = p.turnTimeLimitMs;
    if (this.turnDeadlineTs !== p.turnDeadlineTs) this.turnDeadlineTs = p.turnDeadlineTs;
    // Snapshot/ack korelasyonu: pending input varsa ve snapshot bunu onaylıyorsa pending'i temizle
    if (this.lanRole === 'CLIENT' && this._lanPendingInput) {
      const pendingSeq = this._lanPendingInput.seq;
      const pendingActionId = this._lanPendingInput.actionId;
      if (p.lastClientInputSeq != null && p.lastClientInputSeq >= pendingSeq) {
        const matchesAction = (p.lastClientActionId === pendingActionId);
        this._clearLanPendingInput('acked_by_state');
        if (matchesAction) this._lanSuppressNextBallSound = true; // bu snapshot benim dokunuşumdan geldi
      }
    }

    if (this.isPlaying !== p.isPlaying) {
      const suppress = (this.lanRole === 'CLIENT' && this._lanSuppressNextBallSound && p.isPlaying === visualBefore);
      this._setPlaying(p.isPlaying, { force: true, suppressSound: suppress });
      if (suppress) this._lanSuppressNextBallSound = false;
    }
    if (this.isAnimating !== p.isAnimating) this.isAnimating = p.isAnimating;
    if (this.isPenaltyMode !== p.isPenaltyMode) this.isPenaltyMode = p.isPenaltyMode;
    if (this.isMatchPenalty !== p.isMatchPenalty) this.isMatchPenalty = p.isMatchPenalty;

    if (
      this.selectedGameMode === 'LAN_2P' &&
      this.lanRole === 'CLIENT' &&
      this.lanStatus === 'in_match' &&
      this.lanFirstSnapshotReceived &&
      this._isLanOpponentTurn()
    ) {
      const now = Date.now();
      if (now - this._lanOverlayGuardLogAt > 1000) {
        console.info('[LAN] client overlay guard', {
          currentTurn: this.currentTurn,
          lanRole: this.lanRole,
          isPlaying: this.isPlaying,
          turnDeadlineTs: this.turnDeadlineTs,
        });
        this._lanOverlayGuardLogAt = now;
      }
    }

    // LAN Client ses senkronizasyonu: Gol/kart animasyonu başladığında ses çal
    const goalJustStarted = !this.isGoalActive && p.isGoalActive;
    const cardJustStarted = !this.isCardActive && p.isCardActive;
    const championJustStarted = !this.isChampionActive && p.isChampionActive;

    if (this.isGoalActive !== p.isGoalActive) this.isGoalActive = p.isGoalActive;
    if (this.isCardActive !== p.isCardActive) this.isCardActive = p.isCardActive;
    if (this.goalTeam !== p.goalTeam) this.goalTeam = p.goalTeam;
    if (this.cardTeam !== p.cardTeam) this.cardTeam = p.cardTeam;
    if (this.cardType !== p.cardType) this.cardType = p.cardType;
    if (this.liveDigit !== p.liveDigit) this.liveDigit = p.liveDigit;

    // LAN Client: Ses event'lerini tetikle
    if (this.lanRole === 'CLIENT' && this.onLanSoundEvent) {
      if (goalJustStarted) this.onLanSoundEvent('goal');
      if (cardJustStarted) {
        this.onLanSoundEvent(p.cardType === 'yellow' ? 'yellowCard' : 'redCard');
      }
      if (championJustStarted) this.onLanSoundEvent('champion');
    }

    // Force-set currentTurn on every snapshot so the CLIENT never stays stuck
    // on 'Home' when it should be 'Away' after host's first move.
    if (p.currentTurn) this.currentTurn = p.currentTurn;
    if (this.matchMinute !== p.matchMinute) this.matchMinute = p.matchMinute;
    if (this.extraTurns !== p.extraTurns) this.extraTurns = p.extraTurns;

    if (this.homeScore !== p.homeScore) this.homeScore = p.homeScore;
    if (this.awayScore !== p.awayScore) this.awayScore = p.awayScore;

    if (this.homeYellows !== p.homeYellows) this.homeYellows = p.homeYellows;
    if (this.awayYellows !== p.awayYellows) this.awayYellows = p.awayYellows;
    if (this.homeReds !== p.homeReds) this.homeReds = p.homeReds;
    if (this.awayReds !== p.awayReds) this.awayReds = p.awayReds;

    if (this.statsHomeYellows !== p.statsHomeYellows) this.statsHomeYellows = p.statsHomeYellows;
    if (this.statsAwayYellows !== p.statsAwayYellows) this.statsAwayYellows = p.statsAwayYellows;
    if (this.statsHomeReds !== p.statsHomeReds) this.statsHomeReds = p.statsHomeReds;
    if (this.statsAwayReds !== p.statsAwayReds) this.statsAwayReds = p.statsAwayReds;

    if (this.homePenalties !== p.homePenalties) this.homePenalties = p.homePenalties;
    if (this.awayPenalties !== p.awayPenalties) this.awayPenalties = p.awayPenalties;
    if (!boolArrayEq(this.homePenResults, p.homePenResults)) this.homePenResults = p.homePenResults ?? [];
    if (!boolArrayEq(this.awayPenResults, p.awayPenResults)) this.awayPenResults = p.awayPenResults ?? [];

    if (this.lastEvent !== p.lastEvent) this.lastEvent = p.lastEvent;
    if (this.lastDigit !== p.lastDigit) this.lastDigit = p.lastDigit;

    if (this.isChampionActive !== p.isChampionActive) this.isChampionActive = p.isChampionActive;
    if (this.winnerName !== p.winnerName) this.winnerName = p.winnerName;

    if (this.homeTeamName !== p.homeTeamName) this.homeTeamName = p.homeTeamName;
    if (this.awayTeamName !== p.awayTeamName) this.awayTeamName = p.awayTeamName;

    // Clear optimistic visual override — authoritative state wins (after suppress check)
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT') {
      if (this._lanVisualPlayingOverride !== null) this._lanVisualPlayingOverride = null;
    }
  }

  private _onLanMessage(raw: string) {
    this._onLanRawMessage(raw);
  }

  private _closeLanModal() {
    this.isLanModalOpen = false;
    this._stopLanIpPolling();
    this._closeLanQrModal();
    this._lanQrAutoOpened = false;
    this._closeQrPermissionInfo();
    this._closeQrSettingsHint();
    this._closeLanSameNetworkPopup();
    void this._stopQrScan();
    this.lanQrError = null;
    this._clearLanQrAutoConnect();

    const finishClose = () => {
      document.body.classList.remove('modal-open');
    };

    // Let CSS transition finish if present
    requestAnimationFrame(() => finishClose());

    if (!this.isWelcomeVisible && this.wasPlayingBeforeModal && this.onResumeGame) {
      this.onResumeGame();
      this.wasPlayingBeforeModal = false;
    }

    this._maybeScheduleBotTurn();

    // If user closes modal while hosting/connected, stop session unless already in-match.
    if (this.selectedGameMode === 'LAN_2P' && this.lanStatus !== 'in_match') {
      if (this.lanRole === 'HOST') this._stopHosting();
      if (this.lanRole === 'CLIENT') this._disconnectLanClient();
    }
    this._pulseUiAnimating();
  }

  private _selectGameMode(mode: GameMode) {
    if (!this.isMuted && this.onButtonClick) this.onButtonClick();

    this.selectedGameMode = mode;

    // Normalize team names depending on mode
    if (mode !== 'BOT') {
      // Restore last non-bot away name if we were forcing BOT
      this._enforceAwayTeamNameRules();
    }

    this._updateDefaultTeamNames();
    this._enforceAwayTeamNameRules();

    try {
      localStorage.setItem('salise_game_mode_v2', mode);
    } catch {
      // ignore
    }
  }

  private async _startGame() {
    // ✅ Buton click sesi (ses açıksa ve AudioContext aktifse)
    if (!this.isMuted && this.onButtonClick) {
      this.onButtonClick();
    }
    
    if (!navigator.onLine && this.selectedGameMode !== 'LAN_2P') {
      this.isOnline = false;
      return; 
    }

    // ── 1) UI geçişi HEMEN yap ──
    this.isGuideOpen = false;
    this.isLanguageSelectOpen = false;
    this.isLanModalOpen = false;
    this.isWelcomeVisible = false;
    this.hasKickoffHappened = false;
    this._stopLanIpPolling();

    // LAN client: entering match should clear any stale disconnect banner.
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT') {
      this.lanConnectionLost = false;
    }

    this._updateDefaultTeamNames();
    this._enforceAwayTeamNameRules();

    // ✅ Banner yarışlarını bitir
    this._bannerVisible = false;
    const token = ++this._bannerOpToken;

    // ✅ Gameplay class'ını ekle (CSS optimizasyonları için)
    document.body.classList.add('is-playing');

    // ── 2) Ads/banner işlerini background'da başlat (UI'yi bloklamaz) ──
    void this._withTimeout(this._hideBannerNow(token), 800, 'hideBanner');
    void this._withTimeout(adsService.init(), 1500, 'ads.init');
    void this._withTimeout(adsService.prepareInterstitial(), 1500, 'ads.prepareInterstitial');
  
    // ✅ Her zaman oyun başlangıç seslerini çal (düdük + gol sesi)
    if (this.onGameStart) {
      this.onGameStart();
    } else {
      console.warn('[Playground] onGameStart callback is not defined');
    }

    // LAN: Host starts broadcasting once match view is active.
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST' && this.lanHostRunning) {
      this._startLanHostStateBroadcast();
    }
  }

  private _resetForNewLanMatch(reason: string) {
    console.info('[LAN] reset for new match', { reason });
    this._clearBotTimers();

    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') {
      this._startNewLanSession();
    }
    this.liveDigitElement = null;
    this.liveDigit = null;

    this.homeScore = 0;
    this.awayScore = 0;
    this.matchMinute = 0;

    this.homeYellows = 0;
    this.awayYellows = 0;
    this.homeReds = 0;
    this.awayReds = 0;

    this.statsHomeYellows = 0;
    this.statsAwayYellows = 0;
    this.statsHomeReds = 0;
    this.statsAwayReds = 0;

    this.homePenalties = 0;
    this.awayPenalties = 0;
    this.homePenResults = [];
    this.awayPenResults = [];

    this.lastEvent = getT(this.language).ready;
    this.lastDigit = null;

    this.isPlaying = false;
    this.isPenaltyMode = false;
    this.isMatchPenalty = false;
    this.isAnimating = false;
    this.isGoalActive = false;
    this.isCardActive = false;
    this.isChampionActive = false;
    this.hasKickoffHappened = false;

    this.extraTurns = 0;
    this.currentTurn = 'Home';
    this.highlightTurn = false;
    this.highlightTeam = null;

    this.lanConnectionLost = false;
    this.lanReconnectState = 'idle';
    this.lanOpponentLeft = false;
    this.lanOpponentLeftMessage = null;

    this._lanInputSeq = 0;
    this._lanIncomingQueue = [];
    this._clearLanFirstSnapshotRetryTimer();

    document.body.classList.remove('is-playing');
    console.info('[LAN] currentTurn initialized', { currentTurn: this.currentTurn });
  }
   

  private _resetGame() {
    this._clearBotTimers();
    this._clearTurnTimers();
    this.turnTimeLimitMs = 0;
    this.turnDeadlineTs = 0;
    this.liveDigitElement = null;
    
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchMinute = 0;
    
    this.homeYellows = 0;
    this.awayYellows = 0;
    this.homeReds = 0;
    this.awayReds = 0;
    
    this.statsHomeYellows = 0;
    this.statsAwayYellows = 0;
    this.statsHomeReds = 0;
    this.statsAwayReds = 0;

    this.homePenalties = 0;
    this.awayPenalties = 0;
    this.lastEvent = getT(this.language).reset;
    this.lastDigit = null; 
    this.isPlaying = false;
    this.isPenaltyMode = false;
    this.isMatchPenalty = false;
    this.isAnimating = false;
    this.homePenResults = [];
    this.awayPenResults = [];
    this.isChampionActive = false;
    this.isSummaryVisible = false;
    this.extraTurns = 0;
    this.currentTurn = 'Home';
    this.hasKickoffHappened = false;
    this._updateDefaultTeamNames();
    this._enforceAwayTeamNameRules();
    
    // ✅ Gameplay class'ını kaldır (reset'te)
    document.body.classList.remove('is-playing');
    
    if (this.onReset) this.onReset();

    // LAN cleanup
    if (this.selectedGameMode === 'LAN_2P') {
      this._stopHosting();
      this._disconnectLanClient();
      this.lanConnectionLost = false;
      this.lanOpponentLeft = false;
      this.lanOpponentLeftMessage = null;
      this.lanMatchHasBegun = false;
      this.lanClientReadySent = false;
      this._closeLanQrModal();
      this._closeQrPermissionInfo();
      this._closeQrSettingsHint();
      void this._stopQrScan();
      this.lanQrError = null;
      this._clearLanReconnectTimers();
      this.lanReconnectState = 'idle';
      this.lanReconnectSecondsLeft = 0;
      this.lanResumeCountdown = 0;
      this.lanReconnectAttempt = 0;
      this._lanResumeShouldPlay = false;
      this._lanWasEverConnected = false;
      this.lanStatus = 'idle';
      this.lanErrorMessage = null;
      this.connectedPeersCount = 0;
      this._stopLanConsumeLoop();
      this._stopLanPingLoop();
    }
  }

  private _exitToWelcome() {
    this._clearTurnTimers();
    this.turnTimeLimitMs = 0;
    this.turnDeadlineTs = 0;
    this._resetGame();
    this.isWelcomeVisible = true;
    this.lastEvent = getT(this.language).ready;
    // ✅ Gameplay class'ını kaldır (menüye dönünce) - _resetGame içinde zaten var ama garanti için
    document.body.classList.remove('is-playing');

    // LAN cleanup (safety)
    this._sendLanLeave('exit');
    this._stopHosting();
    this._disconnectLanClient();
    this.lanConnectionLost = false;
    this.lanOpponentLeft = false;
    this.lanOpponentLeftMessage = null;
    this.lanMatchHasBegun = false;
    this.lanClientReadySent = false;
    this._closeLanQrModal();
    this._closeQrPermissionInfo();
    this._closeQrSettingsHint();
    void this._stopQrScan();
    this.lanQrError = null;
    this._clearLanReconnectTimers();
    this.lanReconnectState = 'idle';
    this.lanReconnectSecondsLeft = 0;
    this.lanResumeCountdown = 0;
    this.lanReconnectAttempt = 0;
    this._lanResumeShouldPlay = false;
    this._lanWasEverConnected = false;
    this.lanStatus = 'idle';
    this.lanErrorMessage = null;
    this.connectedPeersCount = 0;
    this._stopLanConsumeLoop();
    this._stopLanPingLoop();
  }

  // ✅ Tekrar Oyna: İsimleri koruyarak maçı sıfırla ve başlat
  private _restartMatch(opts?: { preserveLanQueue?: boolean }) {
    // LAN CLIENT match_start path passes preserveLanQueue=true so that
    // host state snapshots already sitting in the queue are not lost.
    const preservedQueue = opts?.preserveLanQueue ? [...this._lanIncomingQueue] : null;

    this._clearBotTimers();
    this._clearTurnTimers();
    this.turnTimeLimitMs = 0;
    this.turnDeadlineTs = 0;
    // İsimleri sakla
    const savedHomeTeamName = this.homeTeamName;
    const savedAwayTeamName = this.awayTeamName;
    
    // Oyunu sıfırla (isimler hariç)
    this.liveDigitElement = null;
    
    this.homeScore = 0;
    this.awayScore = 0;
    this.matchMinute = 0;
    
    this.homeYellows = 0;
    this.awayYellows = 0;
    this.homeReds = 0;
    this.awayReds = 0;
    
    this.statsHomeYellows = 0;
    this.statsAwayYellows = 0;
    this.statsHomeReds = 0;
    this.statsAwayReds = 0;

    this.homePenalties = 0;
    this.awayPenalties = 0;
    this.lastEvent = getT(this.language).ready;
    this.lastDigit = null; 
    this.isPlaying = false;
    this.isPenaltyMode = false;
    this.isMatchPenalty = false;
    this.isAnimating = false;
    this.homePenResults = [];
    this.awayPenResults = [];
    this.isChampionActive = false;
    this.isSummaryVisible = false;
    this.isWelcomeVisible = false;
    this.extraTurns = 0;
    this.currentTurn = 'Home';
    this.hasKickoffHappened = false;
    
    // İsimleri geri yükle
    this.homeTeamName = savedHomeTeamName;
    this.awayTeamName = savedAwayTeamName;
    
    // ✅ Gameplay class'ını kaldır
    document.body.classList.remove('is-playing');
    
    if (this.onReset) this.onReset();

    // Restore LAN queue if we preserved it (CLIENT match_start path)
    if (preservedQueue) {
      this._lanIncomingQueue = preservedQueue;
    }
    
    // ✅ Maçı başlat (aynı maçı başlatmak için _startGame çağır)
    this._startGame();
  }

  // ✅ Pointer event handler - mobilde double-trigger önleme
  private _handleBallPointerDown(e: PointerEvent) {
    // Mobilde çift tetiklenme / ghost click önle
    e.preventDefault();
    e.stopPropagation();

    // Bot turnunda insan etkileşimini engelle
    if (this._isBotTurn()) return;

    // LAN CLIENT: pending varken de optimistic tepki ver (queue mekanizması)

    // LAN: only allow local device to act on its own turn
    if (this.selectedGameMode === 'LAN_2P' && !this._isLanLocalInputAllowed()) return;

    // LAN CLIENT için debounce düşük (25ms), diğerleri 90ms
    const debounceMs = (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'CLIENT') ? 25 : 90;
    const now = performance.now();
    if (now - this._lastBallInteractionTs < debounceMs) return;
    this._lastBallInteractionTs = now;

    this._handleBallClick();
  }

  /**
   * Ball click handler for all game modes.
   *
   * ── LAN_2P Mini Test Senaryoları ──
   * 1) QR bağlan → host başla → client sırası → client top click:
   *    - Aynı anda ses + görsel tepki (optimistic override + playKick)
   *    - 1 defa ses (çift ses yok: _lanSuppressNextBallSound + snapshot korelasyonu)
   *    - Host 100-300ms sonra snapshot → state tutarlı
   * 2) Client sırası değilken click:
   *    - Hiçbir şey olmaz, mesaj gitmez (_isLanLocalInputAllowed guard)
   * 3) Paket kaybı simülasyonu (ack gelmesin):
   *    - 4 resend denemesi (80ms interval)
   *    - Sonra rollback + 'Bağlantı gecikti' uyarısı
   * 4) Duplicate input:
   *    - Host DUPLICATE ack → client reject işler, UI düzelir
   * 5) Hızlı ardışık tap (pending varken):
   *    - Queue mekanizması: optimistic tepki anında, input ACK gelince queue'dan gönderilir
   */
  private _handleBallClick() {
    if (this.isChampionActive || this.isAnimating || this.isSummaryVisible) return;
    if (!this.isOnline && this.selectedGameMode !== 'LAN_2P') return;

    // LAN: enforce per-device control
    if (this.selectedGameMode === 'LAN_2P') {
      if (!this._isLanLocalInputAllowed()) return;

      if (this.lanRole === 'CLIENT') {
        // UI-only optimistic toggle: render beklemeden anında görsel tepki
        const newVisual = !this._lanGetVisualPlaying();

        // Optimistic ses: anında çal, host snapshot'ta tekrar çalmasın
        if (!this.isMuted && this.onBallClick) {
          this._lanSuppressNextBallSound = true;
          this.onBallClick(newVisual);
        }

        this._lanVisualPlayingOverride = newVisual;
        this._lanApplyImmediateBallVisual(newVisual); // DOM'a anında yaz, render bekleme!
        queueMicrotask(() => this.requestUpdate()); // Lit state'i microtask'ta eşitle

        // Pending varken yeni input gönderme, queue'ya yaz (ACK gelince otomatik gönderilir)
        if (this._lanPendingInput) {
          this._lanClientDesiredPlaying = newVisual;
          this._lanClientQueuedToggle = true;
          return;
        }

        // Client should not mutate local state; send input to host with retry.
        this._lanClientSendBallToggleWithRetry();
        return;
      }

      if (this.lanRole === 'HOST') {
        this._lanHostApplyToggle();
        return;
      }
    }

    this._setPlaying(!this.isPlaying);
  }

  private _lanHostApplyToggle() {
    const beforeTurn = this.currentTurn;
    const wasPlaying = this.isPlaying;
    const next = !this.isPlaying;
    this._setPlaying(next);
    // NOTE: Do NOT call toggleTurn here!
    // _setPlaying(false) fires onBallClick(false) → processNormalResult/processPenaltyResult/
    // processMatchPenaltyShot which ALREADY call toggleTurn() as part of the game logic.
    // Adding a second toggleTurn here would double-toggle (Home→Away→Home) causing the turn
    // to stay on the same player.
    //
    // Snapshot gönderimi: Ball toggle için immediate snapshot yapma; ACK + 300ms interval yeter.
    // Turn değişikliği zaten processNormalResult içinde _lanScheduleImmediateSnapshot tetikler.
    this._lanSnapshotDirty = true;
    const now = Date.now();
    if (now - this._lanLastHostToggleLogAt > 1000) {
      this._lanLastHostToggleLogAt = now;
      console.info('[LAN] host toggle', {
        wasPlaying,
        next,
        turnBefore: beforeTurn,
        turnAfter: this.currentTurn,
        stateSeq: this._lanStateSeq,
      });
    }
  }

  /**
   * Public method to restart the ball (e.g. after penalty won in case 7).
   * Goes through _setPlaying(true) to ensure all side effects:
   * isBallMoving, animation optimization, auto-stop timer, and LAN snapshot.
   */
  restartBall() {
    this._setPlaying(true);
    if (this.selectedGameMode === 'LAN_2P' && this.lanRole === 'HOST') {
      this._lanScheduleImmediateSnapshot();
    }
  }

  private _optimizeBallAnimation(isSpinning: boolean) {
    // RequestAnimationFrame ile DOM güncellemesini optimize et
    requestAnimationFrame(() => {
      if (!this._ballButtonEl || !this._ballContentEl) this._cacheUiRefs();
      const ballButton = this._ballButtonEl ?? (this.shadowRoot?.querySelector('.ball-button') as HTMLElement | null);
      const ballContent = this._ballContentEl ?? (this.shadowRoot?.querySelector('.ball-content') as HTMLElement | null);
      
      if (ballButton && ballContent) {
        if (isSpinning) {
          // Animasyon aktifken will-change ekle
          ballContent.style.willChange = 'transform';
          ballButton.style.willChange = 'box-shadow';
        } else {
          // Animasyon bittiğinde will-change'i temizle (bellek optimizasyonu)
          ballContent.style.willChange = 'auto';
          ballButton.style.willChange = 'auto';
        }
      }
    });
  }

  /**
   * LAN CLIENT: render beklemeden anında top görseli & pending class'ları güncelle.
   * Lit render sonra çalışıp state ile eşitleyecek; bu sadece "dokunur dokunmaz" DOM tepkisi.
   */
  private _lanApplyImmediateBallVisual(isSpinning: boolean): void {
    if (!this._ballButtonEl || !this._ballContentEl) this._cacheUiRefs();
    const btn = this._ballButtonEl;
    if (!btn) return;

    // spinning class anında aç/kapat
    btn.classList.toggle('spinning', isSpinning);

    // pending class'ları yönet
    const pending = this._lanClientTapPending;
    btn.classList.toggle('tap-pending', pending);
    btn.classList.toggle('is-disabled', pending);

    // digit display minimum dokunuş
    const digitEl = this.liveDigitElement ?? (this.renderRoot as HTMLElement)?.querySelector('#liveDigitEl');
    if (digitEl) {
      digitEl.textContent = isSpinning ? String(this.liveDigit ?? 0) : String(this.lastDigit ?? '-');
    }
  }

  private _renderBallHudChip() {
    if (this.isWelcomeVisible || this.isSummaryVisible) return null;
    if (!this.ballHudVisible) return null;
    const classes = `ball-hud ball-hud--${this.ballHudMode}`;
    return html`
      <div class="${classes}" aria-hidden="true">
        <div class="ball-hud__inner">
          <span class="ball-hud__text">${this.ballHudText}</span>
        </div>
      </div>
    `;
  }

  private _renderTurnTimeHint() {
    if (!this._shouldShowTurnHint()) return null;
    const remainingMs = Math.max(0, this.turnDeadlineTs - Date.now());
    const remainingSec = (remainingMs / 1000).toFixed(1);
    const remainingLabel = getT(this.language).remainingLabel;
    const actionLabel = getT(this.language).stopBall;
    return html`
      <div class="turn-time-hint" data-k=${this.turnDeadlineTs} style="--turn-time-ms: ${this.turnTimeLimitMs}ms;">
        <div class="turn-time-hint__text">${remainingLabel}: ${remainingSec}s · ${actionLabel}</div>
        <div class="turn-time-hint__bar">
          <div class="turn-time-hint__barFill" data-k=${this.turnDeadlineTs}></div>
        </div>
      </div>
    `;
  }

  render() {
    const t = getT(this.language);

    const showOpponentBotLabel = false;

    const visualPlaying = this._lanGetVisualPlaying();

    const ballClasses = classMap({
      'ball-button': true,
      'spinning': visualPlaying,
      'penalty-active': this.isMatchPenalty || this.isPenaltyMode,
      'disabled': this.isAnimating || this.isSummaryVisible || (!this.isOnline && this.selectedGameMode !== 'LAN_2P') || (this.selectedGameMode === 'LAN_2P' && !this._isLanLocalInputAllowed()),
      'tap-pending': this.lanRole === 'CLIENT' && this._lanClientTapPending,
      'is-disabled': this.lanRole === 'CLIENT' && this._lanClientTapPending,
      'bot-turn': this._isBotTurn()
    });

    const currentBall = this.ballTypes[this.currentBallIndex];
    const progressPercent = Math.min(100, (this.matchMinute / 90) * 100);

    // ✅ Banner görünecekse padding bırak
    const shouldPadForBanner =
      this.isOnline && (
        this.isWelcomeVisible ||
        this.isSettingsOpen ||
        this.isGuideOpen ||
        this.isLanguageSelectOpen ||
        this.isLanModalOpen ||
        this._gameModeModalState !== 'closed'
      );

    return html`
      <div
        class="playground ${this.isGoalActive ? 'shake-active' : ''} ${this.isPenaltyMode || this.isMatchPenalty ? 'penalty-mode' : ''} ${this._isLanOpponentTurn() ? 'lan-not-your-turn' : ''}"
        style="padding-bottom:${shouldPadForBanner ? 'var(--bannerH, 50px)' : '0px'};"
      >
        ${this._renderOfflineScreen()}
        ${this._renderWelcome()}
        ${this._renderSummary()}
        ${this._renderBotTurnOverlay()}
        ${this._renderLanOpponentTurnOverlay()}
        
        <div class="main-container">
          <div class="pitch-canvas">
            <div class="spotlight left"></div>
            <div class="spotlight right"></div>
            <div class="pitch-markings">
              <div class="pitch-center-line"></div>
              <div class="pitch-center-circle"></div>
            </div>
          </div>

          <div class="top-bar">
            <div class="header-title"><h1>${t.title}</h1></div>
            <div class="info-row">
              <div class="turn-badge ${this.currentTurn.toLowerCase()} ${this._isBotTurn() ? 'bot-turn-badge' : ''}">
                ${t.attack}: ${this.currentTurn === 'Home' ? this.homeTeamName : this.awayTeamName}
              </div>
              <div class="digit-display ${visualPlaying ? 'active' : ''}">
                ${visualPlaying
                  ? html`<span id="liveDigitEl">${this.liveDigit ?? 0}</span>`
                  : (this.lastDigit ?? '-')}
              </div>
            </div>
          </div>

          <div class="scoreboard-container">
            ${(() => {
              const rawEvent = (this.lastEvent ?? '').trim();
              const isLong = rawEvent.length > 70;
              const showBadge = rawEvent && this.lastDigit != null;
              return html`
              <div class="event-banner ${rawEvent ? 'event-active' : ''}">
                <div class="event-banner-inner">
                  ${showBadge ? html`<span class="event-badge">${this.lastDigit}</span>` : ''}
                  <span class="event-banner-msg ${isLong ? 'event-long' : ''}">${rawEvent}</span>
                </div>
              </div>`;
            })()}

            <div class="scoreboard">
              <div class="team home-team ${this.currentTurn === 'Home' ? 'active-turn' : ''} ${this.highlightTeam === 'Home' && this.highlightTurn ? 'highlight-turn' : ''}">
                <div class="turn-dot"></div>
                <div class="team-name">
                  <span class="team-side left"></span>
                  <span class="team-name-text">${this.homeTeamName}</span>
                  <span class="team-side right">
                    <div class="card-mini yellow" ?hidden=${this.homeYellows === 0}></div>
                    <div class="card-mini red" ?hidden=${this.homeReds === 0}></div>
                    ${this.currentTurn === 'Home' && this.extraTurns > 0 ? html`<span class="advantage-badge">${t.advantage}</span>` : ''}
                  </span>
                </div>
                <div class="score-value">${this.homeScore}</div>
                <div class="penalties-row" ?hidden=${!this.isPenaltyMode}>
                   ${this.homePenResults.map(r => html`<span class="pen-dot ${r ? 'goal' : 'miss'}"></span>`)}
                </div>
              </div>
              
              <div class="match-clock">${this.isPenaltyMode ? 'PEN' : this.matchMinute + '\''}</div>
              
              <div class="team away-team ${this.currentTurn === 'Away' ? 'active-turn' : ''} ${this.highlightTeam === 'Away' && this.highlightTurn ? 'highlight-turn' : ''} ${this._isBotTurn() ? 'bot-turn' : ''}">
                <div class="turn-dot"></div>
                <div class="team-name">
                  <span class="team-side left">
                    ${this.selectedGameMode === 'BOT' ? html`<span class="bot-badge">BOT</span>` : ''}
                    <div class="card-mini yellow" ?hidden=${this.awayYellows === 0}></div>
                    <div class="card-mini red" ?hidden=${this.awayReds === 0}></div>
                    ${this.currentTurn === 'Away' && this.extraTurns > 0 ? html`<span class="advantage-badge">${t.advantage}</span>` : ''}
                  </span>
                  <span class="team-name-text">${this.awayTeamName}</span>
                  <span class="team-side right"></span>
                </div>
                <div class="score-value">${this.awayScore}</div>
                <div class="penalties-row" ?hidden=${!this.isPenaltyMode}>
                   ${this.awayPenResults.map(r => html`<span class="pen-dot ${r ? 'goal' : 'miss'}"></span>`)}
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
              </div>
            </div>

            ${showOpponentBotLabel ? html`<div class="opponent-bot-label">${t.opponentBot}</div>` : null}
          </div>

          <button 
            class="${ballClasses} btn btn--icon" 
            style="${currentBall.css} background-color: #fff;" 
            @pointerdown=${this._handleBallPointerDown}
            ?disabled=${this.lanRole === 'CLIENT' && this._lanClientTapPending}
            aria-disabled="${this.lanRole === 'CLIENT' && this._lanClientTapPending}"
          >
            <span class="ball-content">⚽</span>
          </button>

          ${this._renderBallHudChip()}
          ${this._renderTurnTimeHint()}

          <div class="bottom-controls">
            <button class="control-btn btn btn--ghost btn--sm" @click=${this._openSettings}>${t.settings}</button>

            <button class="control-btn btn btn--ghost btn--sm" @click=${() => {
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this.isMuted = !this.isMuted;
              if (this.onMuteToggle) this.onMuteToggle(this.isMuted);
            }}>
              ${this.isMuted ? '🔇 ' : '🔊 '}${this.isMuted ? t.unmute : t.mute}
            </button>

            <button class="control-btn btn btn--ghost btn--sm" @click=${this._resetGame}>${t.resetBtn}</button>
            <button class="control-btn btn btn--ghost btn--sm" @click=${this._exitToWelcome}>${t.exit}</button>
          </div>

          ${this._renderGoalAnimation()}
          ${this._renderCardAnimation()}
          ${this._renderChampionAnimation()}
        </div>

        ${this._renderSettingsModal()}
        ${this._renderGuideModal()}
        ${this._renderLanguageSelectModal()}
        ${this._renderLanModeModal()}
        ${this._renderLanQrModal()}
        ${this._renderLanQrPermissionInfo()}
        ${this._renderLanSameNetworkPopup()}
        ${this._renderLanQrSettingsHint()}
        ${this._renderLanQrScanOverlay()}
        ${this._renderLanReconnectOverlay()}
      </div>
    `;
  }

  private _renderBotTurnOverlay() {
    if (!this._isBotTurn()) return null;
    // Büyük animasyonlar varken kendi overlay'imiz üst üste binmesin
    if (this.isAnimating || this.isChampionActive || this.isSummaryVisible) return null;
    if (this.lanReconnectState !== 'idle') return null;
    const t = getT(this.language);
    return html`
      <div class="bot-turn-overlay" aria-hidden="true">
        <div class="bot-turn-overlay-card">
          <div class="bot-turn-overlay-title">${t.botTurnTitle}</div>
          <div class="bot-turn-overlay-subtitle">${t.botTurnSubtitle}</div>
        </div>
      </div>
    `;
  }

  private _renderLanOpponentTurnOverlay() {
    if (this.lanStatus !== 'in_match') return null;
    if (!this.lanMatchHasBegun) return null;
    if (this.isWelcomeVisible || this.isSummaryVisible) return null;
    if (this.isAnimating || this.isChampionActive) return null;
    if (this.lanReconnectState !== 'idle') return null;
    if (!this._isLanOpponentTurn()) return null;
    const t = getT(this.language);
    return html`
      <div class="bot-turn-overlay" aria-hidden="true">
        <div class="bot-turn-overlay-card">
          <div class="bot-turn-overlay-title">${t.botTurnTitle}</div>
          <div class="bot-turn-overlay-subtitle">${t.lanOpponentTurnSubtitle}</div>
        </div>
      </div>
    `;
  }

  private _renderLanDisconnectBanner() {
    const t = getT(this.language);
    if (this.selectedGameMode !== 'LAN_2P') return null;
    if (this.lanRole !== 'CLIENT') return null;
    if (this.isWelcomeVisible || this.isSummaryVisible) return null;
    if (!this.lanConnectionLost) return null;

    return html`
      <div class="lan-disconnect-banner" role="status" aria-live="polite">
        <div class="lan-disconnect-text">${t.lanConnectionLost}</div>
        <div class="lan-disconnect-actions">
          <button class="lan-disconnect-btn primary btn btn--primary" @click=${this._connectToHost}>
            ${t.lanReconnect}
          </button>
          <button class="lan-disconnect-btn btn btn--secondary" @click=${this._exitToWelcome}>
            ${t.lanBackToMenu}
          </button>
        </div>
      </div>
    `;
  }

  private _renderLanReconnectOverlay() {
    if (this.selectedGameMode !== 'LAN_2P') return null;
    if (this.isWelcomeVisible || this.isSummaryVisible) return null;
    if (this.lanReconnectState === 'idle') return null;

    const t = getT(this.language);

    const baseTitle = this.lanRole === 'HOST' ? t.lanHostDisconnected : t.lanClientDisconnected;
    let title = baseTitle;
    let subtitle: string | null = null;

    if (this.lanReconnectState === 'reconnecting') {
      title = baseTitle;
      subtitle = `${t.lanReconnecting} (${this.lanReconnectSecondsLeft})`;
    } else if (this.lanReconnectState === 'resumeCountdown') {
      title = t.lanOpponentRejoined;
      subtitle = `${t.lanResuming} ${this.lanResumeCountdown}…`;
    } else if (this.lanReconnectState === 'timedOut') {
      title = t.lanOpponentDidNotReturn;
      subtitle = null;
    } else if (this.lanReconnectState === 'opponentLeft') {
      title = t.lanOpponentLeft;
      subtitle = null;
    }

    // Removed stray template fragment that leaked into UI; keep only valid actions.
    return html`
      <div class="lan-reconnect-overlay" role="status" aria-live="polite">
        <div class="lan-reconnect-card">
          <div class="lan-reconnect-title">${title}</div>
          ${subtitle ? html`<div class="lan-reconnect-subtitle">${subtitle}</div>` : null}
          <div class="lan-reconnect-actions">
            <button class="lan-disconnect-btn btn btn--secondary" @click=${this._exitToWelcome}>
              ${getT(this.language).backToMenu}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== Render helperlar (senin kodunla aynı) =====
  _renderOfflineScreen() {
    if (this.isOnline) return null;
    if (this.selectedGameMode === 'LAN_2P') return null;
    const t = getT(this.language);
    return html`
      <div class="offline-screen" role="status" aria-live="polite">
        <div class="offline-content">
          <div class="offline-icon">!</div>
          <div class="offline-title">${t.noInternet}</div>
          <div class="offline-text">${t.checkConnection}</div>
          <button class="start-button small btn btn--primary" @click=${() => window.location.reload()}>
            ${t.retry}
          </button>
        </div>
      </div>
    `;
  }

  private _isNarrowScreen(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(max-width: 360px)').matches;
  }

  _renderWelcome() {
    if (!this.isWelcomeVisible) return null;
    if (!this.isOnline) return null;
    const t = getT(this.language);
    const isNarrow = this._isNarrowScreen();
    const guideLabel = isNarrow ? t.guideShort : t.guide;
    const modeLabel =
      this.selectedGameMode === 'BOT'
        ? t.singleBot
        : this.selectedGameMode === 'LOCAL_2P'
          ? t.twoPlayers
          : '';
    return html`
      <div class="welcome-screen">
        <div class="welcome-bg-overlay"></div>
        <div class="welcome-content">
          <img src="/logo-v2-cropped.png" alt="Salişe Ligi Logo" class="welcome-logo" />
          <div class="welcome-title">${t.title}</div>
          <div class="welcome-subtitle">${t.subtitle}</div>

          ${this._renderGameModeSelect()}

          ${this.selectedGameMode
            ? html`<div class="gm-selected">${t.selectedLabel} <span class="gm-selected-pill">${modeLabel}</span></div>`
            : html`<div class="gm-selected gm-selected-hint">${t.chooseModeHint}</div>`}

          <div class="welcome-secondary">
            <button class="welcome-mini-btn btn btn--secondary btn--clamp2" @click=${this._openGuide}>${guideLabel}</button>
            <button class="welcome-mini-btn btn btn--secondary" @click=${this._openLanguageSelect}>
              ${t.langBtn}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ===== Requested render helper: game mode selection =====
  private _renderGameModeSelect() {
    const t = getT(this.language);
    const hasSelection = this.selectedGameMode !== null;
    const isNarrow = this._isNarrowScreen();
    const ctaLabel = isNarrow ? t.gameModeSelectShort : t.gameModeSelect;

    const iconBot = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 2h2v2.2c2.9.4 5 2.6 5 5.4V12c1.1.2 2 .9 2 2v4c0 1.7-1.3 3-3 3h-1v-2h1c.6 0 1-.4 1-1v-4h-1v-2.5c0-2.1-1.7-3.5-4-3.5s-4 1.4-4 3.5V14H6v4c0 .6.4 1 1 1h1v2H7c-1.7 0-3-1.3-3-3v-4c0-1.1.9-1.8 2-2V9.6c0-2.8 2.1-5 5-5.4V2Zm-2.2 9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm6.4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>`;
    const iconLocal = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.5 12.2c1.7 0 3-1.4 3-3.1S9.2 6 7.5 6s-3 1.4-3 3.1 1.3 3.1 3 3.1Zm9 0c1.7 0 3-1.4 3-3.1S18.2 6 16.5 6s-3 1.4-3 3.1 1.3 3.1 3 3.1ZM3.5 20c0-2.4 2-4.4 4.5-4.4s4.5 2 4.5 4.4v1H3.5v-1Zm8.5 1v-1c0-1.2-.4-2.3-1-3.2 1-.8 2.3-1.2 3.5-1.2 2.5 0 4.5 2 4.5 4.4v1H12Z"/></svg>`;

    const isOpen = this._gameModeModalState !== 'closed';
    return html`
      <div class="gm-cta-wrap">
        <button class="gm-cta btn btn--primary btn--clamp2" @click=${this._openGameModeModal}>${ctaLabel}</button>
      </div>

      ${isOpen
        ? html`
            <div class="gm-modal-shell mode-modal modal-overlay ${this._gameModeModalState === 'closing' ? 'closing' : ''}" role="dialog" aria-modal="true" aria-label="${t.gameModeTitle}">
              <div class="gm-backdrop mode-backdrop" @click=${this._closeGameModeModal}></div>
              <div class="gm-modal mode-card modal-card" @click=${(e: Event) => e.stopPropagation()}>
                <div class="mode-header modal-header">
                  <button class="gm-close mode-close btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
                    e.stopPropagation();
                    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                    this._closeGameModeModal();
                  }} aria-label="${t.closeLabel}">
                    <span aria-hidden="true">×</span>
                  </button>

                  <div class="gm-modal-title mode-title">${t.gameModeTitle}</div>
                  <div class="mode-subtitle">${t.modeSubtitle}</div>
                </div>

                <div class="mode-content modal-content">
                  <div class="gm-options mode-options" role="radiogroup" aria-label="${t.gameModeTitle}">
                    <button
                      class="gm-option mode-option btn btn--ghost btn--md ${this.selectedGameMode === 'BOT' ? 'active mode-option--active' : ''}"
                      role="radio"
                      aria-checked=${this.selectedGameMode === 'BOT'}
                      @click=${() => this._selectGameMode('BOT')}
                    >
                      <div class="gm-icon">${iconBot}</div>
                      <div class="gm-text">
                        <div class="gm-opt-title">${t.singleBot}</div>
                      </div>
                    </button>

                    <button
                      class="gm-option mode-option btn btn--ghost btn--md ${this.selectedGameMode === 'LOCAL_2P' ? 'active mode-option--active' : ''}"
                      role="radio"
                      aria-checked=${this.selectedGameMode === 'LOCAL_2P'}
                      @click=${() => this._selectGameMode('LOCAL_2P')}
                    >
                      <div class="gm-icon">${iconLocal}</div>
                      <div class="gm-text">
                        <div class="gm-opt-title">${t.twoPlayers}</div>
                      </div>
                    </button>


                  </div>
                </div>

                <div class="mode-footer modal-footer">
                  <button class="gm-start mode-start-btn btn btn--primary btn--cta-neon" ?disabled=${!hasSelection} @click=${this._startFromGameModeModal}>
                    ${t.startBtn}
                  </button>
                </div>
              </div>
            </div>
          `
        : null}
    `;
  }

  _renderSummary() {
    // Senin mevcut summary renderın burada kalabilir (kısaltıyorum)
    if (!this.isSummaryVisible) return null;
    const t = getT(this.language);

    const hasWinner = this.homeScore !== this.awayScore;
    const homeIsWinner = hasWinner && (this.winnerName ? this.winnerName === this.homeTeamName : this.homeScore > this.awayScore);
    const awayIsWinner = hasWinner && (this.winnerName ? this.winnerName === this.awayTeamName : this.awayScore > this.homeScore);

    return html`
      <div class="summary-screen result-screen">
        <div class="summary-card result-card" role="dialog" aria-label=${t.matchResult}>
          <!-- Çıkış ve Tekrar Oyna Butonları - En Üstte -->
          <div class="summary-actions summary-actions-top result-actions">
            <button class="summary-action-btn result-btn result-btn--primary btn btn--primary btn--clamp2 btn--cta-neon" @click=${this._restartMatch}>
              <span class="btn-text">${t.playAgain}</span>
            </button>
            <button class="summary-action-btn summary-action-btn-exit result-btn result-btn--secondary btn btn--secondary btn--clamp2" @click=${this._exitToWelcome}>
              <span class="btn-text">${t.exit}</span>
            </button>
          </div>

          <div class="summary-header result-header">
            <div class="summary-header-icon result-trophy" aria-hidden="true">🏆</div>
            <div class="summary-header-text result-title">${t.matchResult}</div>
          </div>

          <!-- Score Board -->
          <div class="summary-score-board score-card" role="group" aria-label=${t.scoreLabel}>
            <div class="summary-team-card team-block ${homeIsWinner ? 'winner team-block--winner' : ''}">
              <div class="team-card-header">
                <div class="summary-team-name team-name">${this.homeTeamName}</div>
              </div>
              <div class="summary-score score-num">${this.homeScore}</div>
            </div>

            <div class="summary-divider score-divider" aria-hidden="true">VS</div>

            <div class="summary-team-card team-block ${awayIsWinner ? 'winner team-block--winner' : ''}">
              <div class="team-card-header">
                <div class="summary-team-name team-name">${this.awayTeamName}</div>
              </div>
              <div class="summary-score score-num">${this.awayScore}</div>
            </div>
          </div>

          <!-- Statistics Section -->
          <div class="summary-stats-section stats-card">
            <div class="stats-section-header">
              <div class="stats-title">${t.statistics || 'İSTATİSTİKLER'}</div>
            </div>

            <div class="summary-stats-grid">
              <div class="stat-row" role="row">
                <div class="stat-left" role="cell">${this.homeScore}</div>
                <div class="stat-name" role="cell">${t.goals || 'GOL'}</div>
                <div class="stat-right" role="cell">${this.awayScore}</div>
              </div>

              <div class="stat-row" role="row">
                <div class="stat-left stat-yellow" role="cell">${this.statsHomeYellows}</div>
                <div class="stat-name" role="cell">${t.yellowCard || 'SARI KART'}</div>
                <div class="stat-right stat-yellow" role="cell">${this.statsAwayYellows}</div>
              </div>

              <div class="stat-row" role="row">
                <div class="stat-left stat-red" role="cell">${this.statsHomeReds}</div>
                <div class="stat-name" role="cell">${t.redCard || 'KIRMIZI KART'}</div>
                <div class="stat-right stat-red" role="cell">${this.statsAwayReds}</div>
              </div>

              <div class="stat-row" role="row">
                <div class="stat-left" role="cell">${this.homePenalties}</div>
                <div class="stat-name" role="cell">${t.penalties || 'PENALTI'}</div>
                <div class="stat-right" role="cell">${this.awayPenalties}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderGoalAnimation() {
    const t = getT(this.language);
    return html`
      <div class="animation-overlay goal-overlay ${this.isGoalActive ? 'active' : ''}">
        <div class="goal-container">
          <div class="goal-text">${t.goalExclam}</div>
          <div class="goal-team-banner">${this.goalTeam === 'Home' ? this.homeTeamName : this.awayTeamName}</div>
        </div>
        ${Array.from({ length: 10 }).map(() => html`
          <div class="confetti" style="--tw: ${Math.random() * 400 - 200}px; --th: ${Math.random() * 400 - 200}px; left: 50%; top: 50%;"></div>
        `)}
      </div>
    `;
  }

  _renderCardAnimation() {
    const t = getT(this.language);
    return html`
      <div class="animation-overlay card-overlay ${this.isCardActive ? 'active' : ''}">
        <div class="card-flash"></div>
        <div class="card-container">
          <div class="card ${this.cardType}"></div>
          <div class="card-title-text">${this.cardType === 'yellow' ? safeUpper(t.yellowCard) : safeUpper(t.redCard)}</div>
          <div class="card-subtitle-text">${this.cardTeam === 'Home' ? this.homeTeamName : this.awayTeamName}</div>
        </div>
      </div>
    `;
  }

  _renderChampionAnimation() {
    if (!this.isChampionActive) return null;
    const t = getT(this.language);
    return html`
      <div class="animation-overlay goal-overlay active" style="background: radial-gradient(circle, rgba(243, 243, 21, 0.4) 0%, transparent 70%);">
        <div class="goal-container">
          <div class="goal-text" style="color: var(--neon-yellow); text-shadow: 0 0 20px var(--neon-yellow);">${t.champion}</div>
          <div class="goal-team-banner" style="border-color: var(--neon-yellow); color: var(--neon-yellow);">${safeUpper(this.winnerName)}</div>
        </div>
      </div>
    `;
  }

  _renderSettingsModal() {
    const t = getT(this.language);
    const tt = TRANSLATIONS[this.tempLanguage]; // Arayüzü seçilen geçici dile göre güncelle

    // İsim değişikliği:
    // - Bot modunda deplasman ismi kilitli
    // - 2 kişi (aynı telefon) modunda deplasman ismi düzenlenebilir
    let canEditHomeName = true;
    let canEditAwayName = this.selectedGameMode !== 'BOT';
    if (this.selectedGameMode === 'LAN_2P') {
      if (this.lanRole === 'HOST') {
        canEditHomeName = true;
        canEditAwayName = false;
      } else if (this.lanRole === 'CLIENT') {
        canEditHomeName = false;
        canEditAwayName = true;
      }
    }

    const isDurationLocked = this._isMatchDurationLocked();

    // Burada currentBall yerine tempBallIndex kullanıyoruz ki kullanıcı önizlemeyi görsün ama onaylamadan değişmesin
    const previewBall = this.ballTypes[this.tempBallIndex];

    return html`
      <div class="modal-backdrop modal-overlay ${this.isSettingsOpen ? 'active' : ''} settings-modal-backdrop" @click=${this._closeSettings}>
        <div class="modal-card settings-modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2>${tt.settingsTitle}</h2>
            <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
              e.stopPropagation();
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeSettings();
            }} aria-label=${tt.closeLabel}>&times;</button>
          </div>

          <div class="modal-content modal-settings-scroll">
          <div class="setting-item">
            <label>${tt.homeTeam}</label>
            <input type="text" .value=${this.tempHomeTeamName} ?disabled=${!canEditHomeName} @input=${(e: any) => this.tempHomeTeamName = e.target.value}>
          </div>
          <div class="setting-item">
            <label>${tt.awayTeam}</label>
            <input type="text" .value=${this.tempAwayTeamName} ?disabled=${!canEditAwayName} @input=${(e: any) => this.tempAwayTeamName = e.target.value}>
          </div>
          
          <div class="setting-item">
            <label>${tt.duration} <span style="font-size:0.7em;color:#999;font-weight:400;">(${tt.durationNote})</span></label>
            <div class="duration-control ${isDurationLocked ? 'is-locked' : ''}">
                <button class="slider-btn btn btn--ghost btn--sm" ?disabled=${isDurationLocked} @click=${() => {
                  if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                  this._decreaseDuration();
                }}>-</button>
              <div class="duration-display">
                ${this.tempMatchDuration === 0.5 ? `30 ${tt.seconds}` : `${this.tempMatchDuration} ${tt.minutes}`}
              </div>
                <button class="slider-btn btn btn--ghost btn--sm" ?disabled=${isDurationLocked} @click=${() => {
                  if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                  this._increaseDuration();
                }}>+</button>
            </div>
          </div>
          
          <div class="setting-item">
            <label>${tt.frameColor}</label>
            <div class="ball-slider-container">
                <button class="slider-btn btn btn--ghost btn--sm" @click=${() => {
                  if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                  this._prevTempBall();
                }}>&#10094;</button>
              <div class="ball-preview-area">
                <div class="ball-preview" style="${previewBall.css} background-color: #fff;">
                  <span class="ball-content">⚽</span>
                </div>
                <div class="ball-name">${tt[previewBall.nameKey]}</div>
              </div>
                <button class="slider-btn btn btn--ghost btn--sm" @click=${() => {
                  if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                  this._nextTempBall();
                }}>&#10095;</button>
              </div>
            </div>
          </div>

          <div class="modal-footer modal-save-button-container">
            <button class="save-button btn btn--primary btn--md btn--cta-neon" @click=${() => {
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._saveSettings();
            }}>${tt.save}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderLanguageSelectModal() {
    const t = getT(this.language);
    const _pickLang = (lang: AppLanguage) => {
      if (!this.isMuted && this.onButtonClick) this.onButtonClick();
      const changed = this.language !== lang;
      this.language = lang;
      this._updateDefaultTeamNames();
      this._enforceAwayTeamNameRules();
      this.lastEvent = getT(this.language).ready;
      if (changed) this._dispatchLanguageChange();
      this._closeLanguageSelect();
    };
    return html`
      <div 
        id="langModalBackdrop"
        class="modal-backdrop modal-overlay ${this.isLanguageSelectOpen ? 'active' : ''}" 
        @click=${this._closeLanguageSelect}
        aria-hidden=${!this.isLanguageSelectOpen}
      >
        <div 
          class="modal-card language-modal-content" 
          @click=${(e: Event) => e.stopPropagation()}
          tabindex=${this.isLanguageSelectOpen ? '0' : '-1'}
        >
          <div class="modal-header">
            <h2>${t.langSelectTitle}</h2>
            <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
              e.stopPropagation();
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeLanguageSelect();
            }} aria-label=${t.closeLabel}>&times;</button>
          </div>
          <div class="modal-content">
            <div class="language-options">
            <button 
              class="language-option btn btn--ghost btn--md ${this.language === 'tr' ? 'active' : ''}"
              @click=${() => _pickLang('tr')}
            >
              <span class="language-flag">🇹🇷</span>
              <span class="language-name">Türkçe</span>
            </button>
            <button 
              class="language-option btn btn--ghost btn--md ${this.language === 'en' ? 'active' : ''}"
              @click=${() => _pickLang('en')}
            >
              <span class="language-flag">🇬🇧</span>
              <span class="language-name">English</span>
            </button>
            <button 
              class="language-option btn btn--ghost btn--md ${this.language === 'de' ? 'active' : ''}"
              @click=${() => _pickLang('de')}
            >
              <span class="language-flag">🇩🇪</span>
              <span class="language-name">Deutsch</span>
            </button>
            <button 
              class="language-option btn btn--ghost btn--md ${this.language === 'es' ? 'active' : ''}"
              @click=${() => _pickLang('es')}
            >
              <span class="language-flag">🇪🇸</span>
              <span class="language-name">Español</span>
            </button>
            <button 
              class="language-option btn btn--ghost btn--md ${this.language === 'ar' ? 'active' : ''}"
              @click=${() => _pickLang('ar')}
            >
              <span class="language-flag">🇸🇦</span>
              <span class="language-name">العربية</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderLanModeModal() {
    const t = getT(this.language);
    if (!this.isLanModalOpen) return null;
    const isNarrow = this._isNarrowScreen();
    const disconnectLabel = isNarrow ? t.disconnectShort : t.disconnectBtn;
    const hostIp = this.lanHostIp || '';
    const hostIpAvailable = this._isValidLanIp(hostIp);
    const hostIpValid = hostIpAvailable && this._isRfc1918Ip(hostIp);
    const lanConnected = this.lanStatus === 'waiting_start' || this.lanStatus === 'connected';
    const lanMatchStarting = this.lanStatus === 'in_match';

    const footerButtons = (lanConnected || lanMatchStarting || this.lanRole === null)
      ? null
      : (this.lanRole === 'HOST'
        ? html`
            <button
              class="btn btn--secondary btn--clamp2"
              ?disabled=${!hostIpValid || this.hostIpLoading}
              @click=${this._openLanQrModal}
            >
              ${t.lanShowQr}
            </button>
          `
        : html`
            <button
              class="start-button btn btn--primary"
              @click=${() => {
                if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                this._openQrPermissionInfo();
              }}
            >
              ${t.lanJoinWithQr}
            </button>
          `);

    return html`
      <div
        class="modal-backdrop modal-overlay active lan-modal-backdrop"
        @click=${this._closeLanModal}
        aria-hidden=${!this.isLanModalOpen}
      >
        <div
          class="modal-card lan-modal-content"
          @click=${(e: Event) => e.stopPropagation()}
          tabindex=${this.isLanModalOpen ? '0' : '-1'}
        >
          <div class="modal-header">
            <h2>${t.lanModalTitle}</h2>
            <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
              e.stopPropagation();
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeLanModal();
            }} aria-label=${t.closeLabel}>&times;</button>
          </div>

          <div class="modal-content">
            <div class="modal-body lan-modal-body">
<div class="lan-role-switch" role="tablist" aria-label=${t.lanModalTitle}>
            <button
              class="lan-role-btn btn btn--secondary ${this.lanRole === 'HOST' ? 'active' : ''}"
              role="tab"
              aria-selected=${this.lanRole === 'HOST'}
              @click=${() => {
                console.log('[LAN][UI] Host clicked', { time: Date.now() });
                this._setLanRole('HOST');
              }}
            >
              ${t.lanHost}
            </button>
            <button
              class="lan-role-btn btn btn--secondary ${this.lanRole === 'CLIENT' ? 'active' : ''}"
              role="tab"
              aria-selected=${this.lanRole === 'CLIENT'}
              @click=${() => this._setLanRole('CLIENT')}
            >
              ${t.lanJoin}
            </button>
          </div>

          <div class="lan-role-body" role="tabpanel">
            ${lanConnected || lanMatchStarting
              ? html`
                  <div class="lan-connected-overlay" role="status" aria-live="polite">
                    <div class="lan-connected-card">
                      <div class="lan-connected-title">${t.lanConnectedOverlayTitle}</div>
                      <div class="lan-connected-subtitle">${t.lanConnectedOverlaySubtitle}</div>
                    </div>
                  </div>
                `
              : this.lanRole === null
              ? html`
                  <div class="lan-hint">
                    ${t.lanPickRole}
                  </div>
                `
              : this.lanRole === 'HOST'
                ? html`
                    <div class="lan-connection-options">
                      <div class="lan-option">
                        <div class="lan-option-title">${t.lanOption1Title}</div>
                        <div class="lan-option-lines">
                          <div>${t.lanOption1Line1}</div>
                          <div>${t.lanOption1Line2}</div>
                        </div>
                      </div>

                      <div class="lan-option">
                        <div class="lan-option-title">${t.lanOption2Title}</div>
                        <div class="lan-option-lines">
                          <div>${t.lanOption2Line1}</div>
                        </div>
                      </div>

                      <div class="lan-option">
                        <div class="lan-option-title">${t.lanOption3Title}</div>
                        <div class="lan-option-lines">
                          <div>${t.lanOption3Line1}</div>
                        </div>
                      </div>

                    </div>

                    ${!hostIpValid && this.hostIpError
                      ? html`<div class="lan-error">${this.hostIpError}</div>`
                      : null}

                    ${this.lanHostIpWarning
                      ? html`<div class="lan-warning">${this.lanHostIpWarning}</div>`
                      : null}

                    ${this.lanHostError
                      ? html`<div class="lan-error">${this.lanHostError}</div>`
                      : null}

                    ${this.lanHostRunning
                      ? html`
                          <div class="lan-peers" style="margin-top:10px;">
                            ${(this.connectedPeersCount ?? this.lanPeers) >= 1
                              ? t.lanPlayerConnected
                              : t.lanWaitingForPlayer}
                          </div>
                        `
                      : null}
                  `
                : html`
                    <div class="lan-hint" style="margin-top:8px;">
                      ${t.lanClientConnectInfo}
                    </div>

                    ${this.lanQrAutoConnectState === 'retrying'
                      ? html`<div class="lan-hint lan-hint--emphasis" style="margin-top:8px;">${this.lanQrAutoConnectMessage || t.lanConnecting}</div>`
                      : null}

                    ${this.lanQrAutoConnectState === 'failed'
                      ? html`
                          <div class="lan-error" style="margin-top:10px;">
                            <div style="font-weight:700; margin-bottom:6px;">${t.lanQrHostStartNeeded}</div>
                            <div style="margin-top:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                              <button class="lan-retry-btn btn btn--secondary" @click=${this._startLanQrAutoConnect}>${t.lanQrRetry}</button>
                            </div>
                          </div>
                        `
                      : null}

                    ${this.lanClientStatus === 'connecting' && this.lanQrAutoConnectState === 'idle'
                      ? html`<div class="lan-hint">${t.lanConnecting}</div>`
                      : null}

                    ${this.lanClientStatus === 'connected'
                      ? html`<div class="lan-hint">${t.lanConnectedWaitingStart || t.lanConnectedWaiting}</div>`
                      : null}

                    ${this.lanClientStatus === 'error'
                      ? html`
                          <div class="lan-error">
                            <div style="font-weight:700; margin-bottom:6px;">${t.lanConnectionError}</div>
                            ${this.lanClientError ? html`<div style="opacity:0.9;">${this.lanClientError}</div>` : null}
                            <div style="margin-top:10px; display:flex; justify-content:center;">
                              <button class="lan-retry-btn btn btn--secondary" @click=${this._connectToHost}>${t.lanReconnect}</button>
                            </div>
                          </div>
                        `
                      : null}

                    ${this.lanQrError
                      ? html`<div class="lan-error" style="margin-top:10px;">${this.lanQrError}</div>`
                      : null}
                  `}
              </div>
            </div>
          </div>

          ${footerButtons
            ? html`<div class="modal-footer" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">${footerButtons}</div>`
            : null}
        </div>
      </div>
    `;
  }

  private _renderLanQrModal() {
    if (!this.isLanQrModalOpen) return null;
    const t = getT(this.language);
    const value = this.lanQrValue || '';
    const qrHostIp = this.lanHostIp || '';
    const qrHostPort = this.hostPort || this.lanPort;
    const qrPeers = (this.connectedPeersCount ?? this.lanPeers) ?? 0;
    const hostStatusText = this.lanQrHostStatus === 'starting'
      ? t.lanQrHostPreparing
      : this.lanQrHostStatus === 'ready'
        ? t.lanQrHostReady
        : this.lanQrHostStatus === 'error'
          ? (this.lanQrHostMessage || getT(this.language).hostStartFailedDot)
          : '';
    const hostStatusClass = this.lanQrHostStatus === 'ready'
      ? 'lan-qr-status--ready'
      : this.lanQrHostStatus === 'error'
        ? 'lan-qr-status--error'
        : 'lan-qr-status--pending';

    return html`
      <div class="lan-qr-modal-backdrop" @click=${this._closeLanQrModal} aria-hidden=${!this.isLanQrModalOpen}>
        <div class="lan-qr-modal" @click=${(e: Event) => e.stopPropagation()}>
          <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
            e.stopPropagation();
            if (!this.isMuted && this.onButtonClick) this.onButtonClick();
            this._closeLanQrModal();
          }}>&times;</button>
          <div class="modal-header"><h2>${getT(this.language).qrCodeTitle}</h2></div>
                    <div class="lan-qr-body modal-content">
${hostStatusText
            ? html`<div class="lan-qr-status ${hostStatusClass}">${hostStatusText}</div>`
            : null}
          <div class="lan-qr-canvas-wrap">
            <canvas id="lanQrCanvas" class="lan-qr-canvas" width="320" height="320" style="width:320px;height:320px;max-width:100%;background:#fff;display:block;" aria-label="QR"></canvas>
          </div>

          ${this.lanQrError ? html`<div class="lan-error" style="margin-top:10px;">${this.lanQrError}</div>` : null}
          </div>
        </div>
      </div>
    `;
  }

  private _renderLanQrPermissionInfo() {
    if (!this.isLanQrPermissionInfoOpen) return null;
    const t = getT(this.language);

    const isDenied = this.lanQrError === t.lanQrPermissionDenied;
    const text = isDenied ? t.lanQrPermissionDenied : t.lanQrPermissionInfo;

    return html`
      <div class="lan-qr-permission-backdrop" @click=${this._closeQrPermissionInfo} aria-hidden=${!this.isLanQrPermissionInfoOpen}>
        <div class="lan-qr-permission-sheet" @click=${(e: Event) => e.stopPropagation()}>
          <div class="lan-qr-permission-text modal-content">${text}</div>
          <div class="lan-qr-permission-actions modal-footer">
            ${isDenied
              ? html`
                  <button class="btn btn--primary" @click=${() => this._handleQrPermissionFlow(true)}>${t.lanQrRetry}</button>
                  <button class="btn btn--secondary" @click=${() => {
                    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                    this._closeQrPermissionInfo();
                  }}>${t.lanQrManual}</button>
                `
              : html`
                  <button class="btn btn--primary" @click=${() => {
                    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                    this._handleQrPermissionFlow(false);
                  }}>${t.lanContinue}</button>
                  <button class="btn btn--secondary" @click=${() => {
                    if (!this.isMuted && this.onButtonClick) this.onButtonClick();
                    this._closeQrPermissionInfo();
                  }}>${t.lanCancel}</button>
                `}
          </div>
        </div>
      </div>
    `;
  }

  private _renderLanSameNetworkPopup() {
    if (!this.isLanSameNetworkPopupOpen) return null;
    const t = getT(this.language);
    return html`
      <div
        class="modal-backdrop modal-overlay ${this.isLanSameNetworkPopupOpen ? 'active' : ''}"
        @click=${() => this._closeLanSameNetworkPopup()}
        aria-hidden=${!this.isLanSameNetworkPopupOpen}
      >
        <div
          class="modal-card"
          @click=${(e: Event) => e.stopPropagation()}
          style="max-width:420px;"
        >
          <div class="modal-header" style="border-bottom:none; padding-bottom:14px;">
            <h2>${t.lanSameNetworkRequiredTitle}</h2>
            <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
              e.stopPropagation();
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeLanSameNetworkPopup();
            }} aria-label=${t.closeLabel}>&times;</button>
          </div>
          <div class="modal-content">
            <p style="margin:0 0 10px; color:#ccc; font-size:0.85rem;">${t.lanSameNetworkRequired}</p>
            <p style="margin:0; color:#999; font-size:0.75rem;">${t.lanSameNetworkRequiredHint}</p>
          </div>
          <div class="modal-footer" style="text-align:center;">
            <button class="btn btn--primary btn--cta-neon" style="min-width:140px;" @click=${() => {
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeLanSameNetworkPopup();
            }}>${t.closeLabel}</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderLanQrSettingsHint() {
    if (!this.isLanQrSettingsHintOpen) return null;
    const t = getT(this.language);
    return html`
      <div class="lan-qr-permission-backdrop" @click=${this._closeQrSettingsHint} aria-hidden=${!this.isLanQrSettingsHintOpen}>
        <div class="lan-qr-permission-sheet" @click=${(e: Event) => e.stopPropagation()}>
          <div class="lan-qr-permission-title modal-header">${t.lanQrSettingsTitle}</div>
          <div class="lan-qr-permission-text modal-content" style="margin-top:6px;">${t.lanQrSettingsBody}</div>
          <div class="lan-qr-permission-actions modal-footer">
            <button class="btn btn--primary" @click=${this._openAppSettings}>${t.lanOpenSettings}</button>
            <button class="btn btn--secondary" @click=${() => {
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeQrSettingsHint();
            }}>${t.lanGiveUp}</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderLanQrScanOverlay() {
    if (!this.isLanQrScanning) return null;
    const t = getT(this.language);
    return html`
      <div class="qr-scan-overlay qr-modal ${this.lanQrScanFlash ? `qr-scan-${this.lanQrScanFlash}` : ''}" aria-live="polite">
        <div class="qr-scan-card qr-card">
          <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
            e.stopPropagation();
            if (!this.isMuted && this.onButtonClick) this.onButtonClick();
            this._stopQrScan();
          }} aria-label=${getT(this.language).closeLabel}>&times;</button>
          <div class="qr-scan-top-text modal-header">${getT(this.language).qrScanAlign}</div>
          <div class="modal-content" style="width:100%; display:grid; justify-items:center; gap:10px;">
            <div class="qr-scan-frame qr-frame">
              <div class="qr-scan-target"></div>
              <div class="qr-scan-line"></div>
            </div>
            <div class="qr-scan-text qr-status">${t.lanQrScanning}</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderGuideModal() {
    const t = getT(this.language);
    return html`
      <div 
        id="guideModalBackdrop"
        class="modal-backdrop modal-overlay ${this.isGuideOpen ? 'active' : ''}" 
        @click=${this._closeGuide}
        aria-hidden=${!this.isGuideOpen}
      >
        <div 
          class="modal-card guide-modal-content" 
          @click=${(e: Event) => e.stopPropagation()}
          tabindex=${this.isGuideOpen ? '0' : '-1'}
        >
          <div class="modal-header">
            <h2>${t.howToPlay}</h2>
            <button class="close-modal btn btn--ghost btn--icon btn--sm" @click=${(e: Event) => {
              e.stopPropagation();
              if (!this.isMuted && this.onButtonClick) this.onButtonClick();
              this._closeGuide();
            }} aria-label=${t.closeLabel}>&times;</button>
          </div>
          <div class="modal-content modal-guide-scroll">
          <p style="margin-bottom: 15px; color: #ccc; font-size: 0.75rem;">${t.guideDesc}</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">0</span>
              <span style="color: var(--neon-green); font-weight: bold; font-size: 0.75rem;">${t.goalText}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">1</span>
              <span style="color: #888; font-weight: bold; font-size: 0.75rem;">${t.defense}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">2</span>
              <span style="color: #888; font-weight: bold; font-size: 0.75rem;">${t.defense}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">3</span>
              <span style="color: var(--neon-red); font-weight: bold; font-size: 0.75rem;">${t.redCard}!</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">4</span>
              <span style="color: var(--neon-yellow); font-weight: bold; font-size: 0.75rem;">${t.yellowCard}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">5</span>
              <span style="color: #888; font-weight: bold; font-size: 0.75rem;">${t.defense}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">6</span>
              <span style="color: var(--neon-blue); font-weight: bold; font-size: 0.75rem;">${t.offsideLabel}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">7</span>
              <span style="color: var(--neon-blue); font-weight: bold; font-size: 0.75rem;">${t.penaltyLabel}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">8</span>
              <span style="color: var(--neon-yellow); font-weight: bold; font-size: 0.75rem;">${t.fastGame}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
              <span class="digit-display" style="width: 20px; height: 20px; font-size: 0.85rem;">9</span>
              <span style="color: #888; font-weight: bold; font-size: 0.75rem;">${t.defense}</span>
            </div>
          </div>

          <div style="padding: 15px; background: rgba(0,212,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; line-height: 1.4;">
            <p><strong style="color: var(--neon-green);">0:</strong> ${t.guide0}</p>
            <p><strong style="color: #888;">1:</strong> ${t.guide1}</p>
            <p><strong style="color: #888;">2:</strong> ${t.guideOther}</p>
            <p><strong style="color: var(--neon-red);">3:</strong> ${t.guide3}</p>
            <p><strong style="color: var(--neon-yellow);">4:</strong> ${t.guide4}</p>
            <p><strong style="color: #888;">5:</strong> ${t.guideOther}</p>
            <p><strong style="color: var(--neon-blue);">6:</strong> ${t.guide6}</p>
            <p><strong style="color: var(--neon-blue);">7:</strong> ${t.guide7}</p>
            <p><strong style="color: var(--neon-yellow);">8:</strong> ${t.guide8}</p>
            <p><strong style="color: #888;">9:</strong> ${t.guideOther}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,0,0.1); border-radius: 10px; border: 1px solid var(--neon-yellow);">
            <strong style="color: var(--neon-yellow);">${t.ruleYellowTitle}</strong><br>
            <span style="font-size: 0.9rem;">${t.ruleYellowDesc}</span>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: rgba(255,0,0,0.1); border-radius: 10px; border: 1px solid var(--neon-red);">
            <strong style="color: var(--neon-red);">${t.ruleRedTitle}</strong><br>
            <span style="font-size: 0.9rem;">${t.ruleRedDesc}</span>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: rgba(0,255,0,0.1); border-radius: 10px; border: 1px solid var(--neon-green);">
            <strong style="color: var(--neon-green);">${t.ruleAdvantageTitle}</strong><br>
            <span style="font-size: 0.9rem;">${t.ruleAdvantageDesc}</span>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: rgba(0,212,255,0.1); border-radius: 10px; border: 1px solid var(--neon-blue);">
            <strong style="color: var(--neon-blue);">${t.rulePenTitle}</strong><br>
            <span style="font-size: 0.9rem;">${t.rulePenDesc}</span>
          </div>
          </div>
        </div>
      </div>
    `;
  }

}
