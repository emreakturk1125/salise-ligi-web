# Font Dosyaları

Bu klasöre aşağıdaki font dosyalarını indirip yerleştirin:

## Gerekli Font Dosyaları:

1. **Bebas Neue** (Regular - 400):
   - `bebas-neue-v14-latin-regular.woff2`
   - `bebas-neue-v14-latin-regular.woff`

2. **Roboto Condensed** (Regular - 400):
   - `roboto-condensed-v27-latin-regular.woff2`
   - `roboto-condensed-v27-latin-regular.woff`

3. **Roboto Condensed** (Bold - 700):
   - `roboto-condensed-v27-latin-700.woff2`
   - `roboto-condensed-v27-latin-700.woff`

## Font Dosyalarını İndirme:

1. https://google-webfonts-helper.herokuapp.com/ adresine gidin
2. "Bebas Neue" fontunu arayın ve indirin
3. "Roboto Condensed" fontunu arayın ve indirin
4. İndirilen dosyaları bu klasöre kopyalayın

VEYA

Aşağıdaki komutu çalıştırarak otomatik indirebilirsiniz (curl veya wget gerekir):

```bash
# Bebas Neue
curl -o public/fonts/bebas-neue-v14-latin-regular.woff2 "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2"
curl -o public/fonts/bebas-neue-v14-latin-regular.woff "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9Wlhyw.woff"

# Roboto Condensed Regular
curl -o public/fonts/roboto-condensed-v27-latin-regular.woff2 "https://fonts.gstatic.com/s/robotocondensed/v27/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQk6YvM.woff2"
curl -o public/fonts/roboto-condensed-v27-latin-regular.woff "https://fonts.gstatic.com/s/robotocondensed/v27/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQk6YvM.woff"

# Roboto Condensed Bold
curl -o public/fonts/roboto-condensed-v27-latin-700.woff2 "https://fonts.gstatic.com/s/robotocondensed/v27/ieVg2ZhZI2eCN5jzbjEETS9weq8-19K7DQk6YvM.woff2"
curl -o public/fonts/roboto-condensed-v27-latin-700.woff "https://fonts.gstatic.com/s/robotocondensed/v27/ieVg2ZhZI2eCN5jzbjEETS9weq8-19K7DQk6YvM.woff"
```

