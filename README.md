# zey

Zey zeytinyağı için Next.js ve TypeScript ile hazırlanmış landing page.

## Geliştirme

```bash
npm ci
npm run dev
```

Sayfa: http://localhost:3000

## Kontroller

```bash
npm run build
npm run lint
```

## Yapı

- `src/app/(landing)/page.tsx`: landing page yerleşimi
- `src/components/landing`: sayfa bölümleri ve etkileşimli bileşenler
- `public/products`: boyuta göre ürün görselleri

Ürün boyutu seçimi, görsel yakınlaştırma, büyük görsel önizlemesi, sipariş formu ve modal içinde iyzico Checkout Form içerir. Kart bilgileri doğrudan iyzico tarafından alınır. Sipariş e-postası yalnızca iyzico callback sonucu sunucuda doğrulandıktan ve ödeme başarılı olduktan sonra gönderilir.

iyzico için `IYZIPAY_API_KEY`, `IYZIPAY_SECRET_KEY`, `IYZIPAY_URI`, `ORDER_TOKEN_SECRET`, `SITE_URL` ve ürün fiyatı ortam değişkenleri `.env.example` dosyasında listelenmiştir. iyzico callback adresi geçerli bir HTTPS adresinde çalışmalıdır.
