# Story List — SAC Custom Widget

SAP Analytics Cloud için bir custom widget. Belirli bir klasördeki story'leri
File Repository API üzerinden çeker ve isimlerini **tıklanabilir link** olarak
listeler. Tıklanınca ilgili story `openURL` ile **yeni sekmede** açılır.

## Özellikler

- Builder panelinden **API URL** ve **başlık** ayarlanabilir
- API çağrısı kullanıcının mevcut SAC oturumuyla yapılır (`credentials: include`)
- Yalnızca `resourceType === "STORY"` kayıtları listelenir
- Göreli `openURL` path'i otomatik olarak tam URL'e çevrilir

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `storylist_widget_embedded.json` | **Önerilen.** JS kodu base64 olarak gömülü — host gerektirmez. SAC'a sadece bunu yükle. |
| `storylist_widget.json` | Host'lu manifest. `.js`'i ayrı bir HTTPS adresine koyup URL verirsen kullan. |
| `storylist_widget.js` | Web component kaynağı. |
| `storylist_widget.zip` | Tüm dosyaların paketi. |

## Kullanım

1. SAC → **Custom Widgets** → **Upload** → `storylist_widget_embedded.json`
2. Bir **Story (Optimized)** / **Analytic Application** aç → soldan widget'ı ekle
3. Sağ **builder panelinden** File Repository API URL'ini gir:
   ```
   https://<tenant>.analytics.cloud.sap/api/v1/filerepository/Resources?$filter=parentFolderResourceId%20eq%20%27<FOLDER_ID>%27
   ```
4. Listelenen story adlarına tıkla → yeni sekmede açılır

## Geliştirme notu

`storylist_widget.js` değiştirilirse, embedded manifest'teki base64 yeniden
üretilmelidir (`storylist_widget_embedded.json` içindeki `webcomponents[0].url`).
