"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImageZoom from "./ProductImageZoom";
import ProductSizeSelector from "./ProductSizeSelector";
import { productVariants, type ProductSize } from "./productVariants";
import styles from "./ProductSection.module.css";

export default function ProductSection() {
  const [selectedSize, setSelectedSize] = useState<ProductSize>("500 ml");
  const selectedVariant = productVariants.find(
    (variant) => variant.size === selectedSize,
  )!;

  return (
    <section id="urunler" className="wrap section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">SOFRANIZDA YER AÇIN</div>
          <h2>
            Her güne biraz <em>zey.</em>
          </h2>
        </div>
      </div>
      <div className="product">
        <div className={styles.productVisual}>
          <ProductImageZoom
            key={selectedSize}
            src={selectedVariant.image}
            size={selectedSize}
          />
          <Link
            href={{
              pathname: "/siparis",
              query: { boyut: selectedVariant.slug },
            }}
            className={styles.orderLink}
          >
            <span>Sipariş ver</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="product-info">
          <div className="eyebrow">SADECE ZEYTİNYAĞI. BİR SÜRÜ GÜZEL AN.</div>
          <h3>Sofranın vazgeçilmezi</h3>
          <p>
            Salatanızın son dokunuşu, ekmeğinizin en güzel arkadaşı. Zey’i
            mutfağınızda nasıl kullanacağınız tamamen size kalmış.
          </p>
          <ProductSizeSelector
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
          />
          <div className="availability">
            <strong>Çok yakında sofranızda</strong>
            <p>Ürün seçenekleri ve satış bilgileri yakında burada.</p>
          </div>
          <small>Görsel ve ambalaj boyları tasarım amaçlıdır.</small>
        </div>
      </div>
    </section>
  );
}
