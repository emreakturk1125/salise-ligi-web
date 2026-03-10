# Salise Ligi — Google Arama Sonucu Favicon Analizi

**Site:** saliseligi.com  
**Sorun:** Gizli sekmede favicon doğru; normal sekmede aynı aramada bazen farklı ikon / varsayılan globe.

---

## 1. www ve non-www favicon farkı var mı?

**BULGU:** Kodda favicon linkleri **göreli** (`/logo-v2-cropped.png`, `/favicon.ico`) idi. Google www ve non-www’yi **ayrı hostname** sayar; her biri için ayrı favicon isteyebilir veya cache’leyebilir. Non-www 301 ile www’ye yönlendirildiği için sonuçta aynı HTML sunuluyor ama:
- SERP’te bazen sonuç **www**, bazen **non-www** (veya eski cache) olarak görünebilir.
- Göreli favicon, sayfanın sunulduğu host’a göre çözülür; 301 sonrası her zaman www’den gelse bile, Google’ın non-www için ayrı crawl/cache’i olabilir.
- **Tutarsızlık riski:** İki hostname için aynı fiziksel ikon olsa bile, farklı cache veya farklı “ilk geçerli icon” seçimi farklı SERP ikonu üretebilir.

**DÜZELTME:** Tüm favicon ve manifest linkleri **mutlak URL** ile `https://www.saliseligi.com/...` yapıldı. Böylece hangi host’tan sayfa gelirse gelsin, ikon her zaman aynı canonical adresten isteniyor; www/non-www ayrımı favicon için anlamsızlaşıyor.

---

## 2. Canonical hangi domain’i gösteriyor?

**BULGU:** Tüm sayfalarda canonical **www** kullanılıyor:
- Ana sayfa: `https://www.saliseligi.com/`
- Contact: `https://www.saliseligi.com/contact/`
- How-to-play: `https://www.saliseligi.com/how-to-play/`
- Privacy: `https://www.saliseligi.com/privacy/`

**Sonuç:** Canonical tutarlı; Google’ın ana kaynak olarak www kullanması beklenir. Favicon’un da www’den tek kaynaktan gelmesi bu seçimle uyumlu.

---

## 3. Favicon linkleri her iki host’ta da aynı mı?

**BULGU:** HTML her zaman www’den sunuluyor (non-www 301 ile www’ye gidiyor). Yani tarayıcıda “aynı” sayfa görünüyor; fakat:
- Göreli linkler (`/logo-v2-cropped.png`) sayfa URL’ine göre çözülür; 301 sonrası sayfa www’den geldiği için çözüm zaten www oluyordu.
- Buna rağmen Google tarafında **non-www** için ayrı bir sayfa/favicon kaydı veya eski cache olabilir; bu da SERP’te bazen www ikonu bazen farklı/globe ikonu gösterebilir.

**DÜZELTME:** Favicon linkleri mutlak `https://www.saliseligi.com/...` yapıldı; her iki host için “görünen” favicon kaynağı tek ve aynı.

---

## 4. /favicon.ico, /favicon-32x32.png, /apple-touch-icon.png, /site.webmanifest www ve non-www’de düzgün açılıyor mu?

**BULGU:**
- **_redirects:** `https://saliseligi.com/*` → `https://www.saliseligi.com/:splat` (301). Yani non-www’deki tüm path’ler (favicon.ico, logo-v2-cropped.png, site.webmanifest vb.) 301 ile www’ye gidiyor; dosyalar www’den sunuluyor.
- Projede: `favicon.ico`, `logo-v2-cropped.png`, `site.webmanifest` mevcut. `favicon-32x32.png` ve `apple-touch-icon.png` referansı ana sayfa head’inde yok (sadece logo-v2-cropped ve favicon.ico kullanılıyor).
- Sonuç: www ve non-www’de bu dosyalara istek atıldığında 301 (non-www) ardından 200 (www) beklenir; teknik olarak “düzgün açılıyor”. Tutarsız SERP ikonu, büyük olasılıkla cache veya “hangi host’tan favicon çözülecek” belirsizliğinden kaynaklanıyordu.

**DÜZELTME:** Mutlak URL ile favicon her zaman www’den istendiği için, hem www hem non-www için tek davranış garanti altına alındı.

---

## 5. 301/302 yönlendirme favicon erişimini etkiliyor mu?

**BULGU:** Non-www → www 301 var. Favicon isteği:
- Göreli linkle yapılıyorsa, sayfa zaten www’den geldiği için favicon da www’den isteniyor; 301 favicon’u doğrudan bozmaz.
- Ancak Google, bazen doğrudan `https://saliseligi.com/favicon.ico` gibi adresleri de tarayabilir; 301 sonrası www’deki dosyaya ulaşır. Sorun 301 değil, **hostname’e göre farklı cache / farklı “site” davranışı** olabilir.

**DÜZELTME:** Favicon artık HTML’de mutlak www URL’i ile verildiği için, Google’ın hangi host’u kullandığından bağımsız olarak tek URL’den ikon alınır; 301’in etkisi minimize edildi.

---

## 6. Google’ın eski cache veya eski SERP varyantı kullanmasına neden olacak teknik tutarsızlık var mı?

**BULGU:**
- **Evet:** Göreli favicon + www/non-www iki hostname → Google’da iki “site” gibi işlenebilir; biri güncel ikon, diğeri eski veya varsayılan ikon cache’lenmiş olabilir.
- **Evet:** Birden fazla icon tanımı (örn. `rel="icon"` + `rel="shortcut icon"`) farklı tarayıcı/crawler’da farklı “ilk geçerli” seçime yol açabilir; bu da cache tutarsızlığı yaratabilir.
- **Evet:** Normal sekmede tarayıcı ve/veya Google’ın eski favicon’u cache’lemesi; gizli sekmede her seferinde taze istek atılması — klasik “bazen doğru bazen yanlış” senaryosu.

**DÜZELTME:** Mutlak www URL + aynı ikon kaynağı; sıralama net (önce PNG, sonra ico). Zamanla cache’ler güncellenir; yeni crawl’larda tutarlı ikon kullanılır.

---

## 7. Head içinde birden fazla icon tanımı çakışıyor mu?

**BULGU:** Evet, iki ayrı “icon” vardı:
- `<link rel="icon" type="image/png" href="...">` (logo-v2-cropped.png)
- `<link rel="shortcut icon" href="...">` (favicon.ico)

Tarayıcılar ve Google genelde **ilk geçerli** `rel="icon"` veya `rel="shortcut icon"` kullanır. Sıra doğruydu (önce PNG) ama iki kaynak = iki farklı dosya; birinde sorun veya farklı cache olursa tutarsızlık çıkabilir. Çakışma “hata” değil, “tutarsızlık riski”.

**DÜZELTME:** Sıra korundu (önce PNG logo, sonra ico); her ikisi de artık **aynı canonical (www) mutlak URL** ile verildi. Böylece hangisi seçilirse seçilsin, kaynak tek host; cache karışması azalır.

---

## 8. Manifest içindeki icon path’leri doğru mu?

**BULGU:** Manifest’te `"src": "/logo-v2-cropped.png"` (göreli) vardı. Manifest `https://www.saliseligi.com/site.webmanifest` üzerinden yüklendiği için çözüm www’ye gidiyordu; path doğruydu. Yine de tutarlılık için manifest’teki icon **mutlak URL** yapıldı.

**DÜZELTME:** `site.webmanifest` içinde icon src: `https://www.saliseligi.com/logo-v2-cropped.png` olarak güncellendi.

---

## 9. Cloudflare / CDN cache farkı olabilir mi?

**BULGU:** Olabilir. Farklı hostname’ler (www vs non-www) veya farklı path’ler farklı cache key’lere sahip olabilir; biri güncel ikon, diğeri eski ikon veya hata sayfası cache’i dönüyor olabilir. Gizli sekme farklı cache kullandığı için “doğru”, normal sekme eski cache’i gösterebilir.

**DÜZELTME:** Tüm favicon istekleri tek mutlak URL’e (www) yönlendirildiği için cache key tek; Cloudflare/CDN’de tek kaynak cache’lenir. Deploy sonrası www için cache purge önerilir (favicon ve logo path’leri).

---

## 10. En olası ana sebep ve kesin çözüm

**En olası sebepler (öncelik sırasıyla):**

1. **www vs non-www hostname ayrımı:** Google www ve non-www’yi ayrı site gibi işleyebiliyor; biri güncel favicon, diğeri eski veya varsayılan (globe) cache’lenmiş olabilir. Göreli favicon ile “hangi host’tan istendiği” net değildi.
2. **Tarayıcı / Google cache:** Normal sekmede eski favicon veya farklı host’tan gelen ikon cache’te kalmış; gizli sekmede taze istek atıldığı için doğru ikon görünüyor.
3. **İki icon tanımı (PNG + ico):** Farklı istemciler farklı linki seçebilir; biri ico’yu (veya farklı cache’lenmiş bir varyantı) kullanıyorsa tutarsızlık çıkar.

**Kesin çözüm (yapılanlar):**

- Tüm favicon ve manifest linklerini **mutlak URL** ile `https://www.saliseligi.com/...` yapmak.
- Ana sayfa ve tüm alt sayfalarda (contact, how-to-play, privacy) **aynı favicon mutlak URL** kullanmak.
- Manifest’te icon **src**’yi mutlak www URL yapmak.
- Deploy sonrası Cloudflare’da ilgili path’ler için **cache purge** (opsiyonel ama önerilir).
- Birkaç gün/hafta içinde Google’ın yeniden taramasını beklemek; gerekirse Search Console’dan URL inspection / re-indexing.

---

## BULGU (Özet)

- Canonical ve redirect www’ye dönük; tutarlı.
- Favicon linkleri **göreli** olduğu için www/non-www ve cache senaryolarında **tek bir favicon kaynağı** garanti değildi.
- İki icon tanımı (PNG + shortcut icon) ve manifest’te göreli path, tutarsız SERP ikonu riskini artırıyordu.
- Gizli sekme = taze istek (doğru ikon); normal sekme = cache (bazen eski/globe) — tipik cache/hostname tutarsızlığı.

---

## KÖK NEDEN

Google ve tarayıcıların **www** ile **non-www**’yi ayrı hostname sayması; favicon’un **göreli** verilmesi ve bazen iki farklı icon linki olması nedeniyle, farklı crawl/cache anlarında **farklı favicon URL’inin** kullanılması veya cache’lenmesi. Sonuç: SERP’te bazen doğru logo, bazen varsayılan globe veya eski ikon.

---

## DÜZELTME (Yapılanlar)

1. Ana sayfa `index.html`: Favicon ve manifest linkleri **mutlak URL** (`https://www.saliseligi.com/...`) yapıldı.
2. Alt sayfalar (`contact`, `how-to-play`, `privacy`): `rel="icon"` **mutlak URL** ile güncellendi.
3. `site.webmanifest`: Icon `src` **mutlak URL** yapıldı.
4. Favicon sırası korundu: önce PNG (logo), sonra shortcut icon (ico); ikisi de www canonical.

---

## GÜNCELLENMİŞ HEAD KODU (Favicon bloğu – ana sayfa)

```html
<!-- ===== Favicon & App Icons (Google arama sonucu = logonuz) ===== -->
<!-- Mutlak URL: www canonical tek kaynak; www/non-www aynı ikon, cache tutarlılığı -->
<link rel="icon" type="image/png" href="https://www.saliseligi.com/logo-v2-cropped.png" />
<link rel="shortcut icon" href="https://www.saliseligi.com/favicon.ico" />
<link rel="apple-touch-icon" href="https://www.saliseligi.com/logo-v2-cropped.png" />
<link rel="manifest" href="https://www.saliseligi.com/site.webmanifest" />
```

---

## TEST ADIMLARI

1. **Deploy sonrası kontrol**
   - `https://www.saliseligi.com/` → View Page Source → favicon linklerinin `https://www.saliseligi.com/...` ile başladığını doğula.
   - `https://www.saliseligi.com/logo-v2-cropped.png` ve `https://www.saliseligi.com/favicon.ico` doğrudan açılıyor mu, 200 dönüyor mu kontrol et.

2. **non-www**
   - `https://saliseligi.com/` aç → 301 ile www’ye gittiğini doğula; www’deki sayfada yine mutlak www favicon linklerini kontrol et.

3. **Cache**
   - Cloudflare Dashboard → Caching → Purge Everything (veya en azından `/logo-v2-cropped.png`, `/favicon.ico`, `/site.webmanifest`, `/`).
   - Tarayıcıda hard refresh (Ctrl+Shift+R) veya cache temizle; favicon’un www’deki PNG/ico ile güncellendiğini kontrol et.

4. **Google**
   - Birkaç gün sonra: `site:saliseligi.com` ile arama yap; sonuçlarda ikonun tutarlı şekilde logonuz olduğunu gözle.
   - İstersen: Search Console → URL Inspection → ana sayfa → “Request indexing” (yeniden indeksleme).

5. **Gizli vs normal sekme**
   - Aynı aramayı normal ve gizli sekmede yap; bir süre sonra her ikisinde de aynı favicon’un görünmesini bekleyin (cache güncellendikten sonra).
