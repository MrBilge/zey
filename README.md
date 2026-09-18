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

Ürün boyutu seçimi, görsel yakınlaştırma, büyük görsel önizlemesi, sipariş formu ve modal içinde geliştirme amaçlı ödeme simülatörü içerir. `MockPaymentProvider`, gerçek kart bilgisi veya dış ödeme servisi kullanmadan başarılı ve başarısız ödeme senaryolarını çalıştırır. Başarılı senaryo sipariş e-postası akışını da tetikler ve e-postayı açıkça `[MOCK]` olarak işaretler.

Geliştirme ortamında `PAYMENT_PROVIDER=mock` kullanılmalıdır. İmzalı mock oturumları için `ORDER_TOKEN_SECRET`, fiyatlar için `ZEY_PRICE_250_ML`, `ZEY_PRICE_500_ML` ve `ZEY_PRICE_1_L` gerekir. Değişkenler `.env.example` dosyasında listelenmiştir. `MockPaymentProvider` production ortamında çalışmayı reddeder; gerçek sağlayıcıya geçmeden production sipariş akışı açılmamalıdır.
