import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import OrderForm from "@/components/order/OrderForm";
import { productVariants } from "@/components/landing/productVariants";
import styles from "./OrderPage.module.css";

export const metadata: Metadata = {
  title: "Sipariş Ver | zey",
  description: "Zey zeytinyağı siparişinizi oluşturun.",
};

type OrderPageProps = {
  searchParams: Promise<{ boyut?: string | string[] }>;
};

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const { boyut } = await searchParams;
  const selectedSlug = Array.isArray(boyut) ? boyut[0] : boyut;
  const product =
    productVariants.find((variant) => variant.slug === selectedSlug) ??
    productVariants[1];

  return (
    <div className={`wrap ${styles.page}`}>
      <Link href="/urunler" className={styles.backLink}>
        <span aria-hidden="true">←</span>
        Ürünlere dön
      </Link>

      <div className={styles.layout}>
        <OrderForm productSize={product.size} />

        <aside className={styles.summary} aria-label="Sipariş verilen ürün">
          <div className={styles.imageWrap}>
            <span className={styles.tag}>SEÇTİĞİNİZ ÜRÜN · {product.size}</span>
            <Image
              src={product.image}
              alt={`Zey ${product.size} zeytinyağı şişesi`}
              width={800}
              height={800}
              sizes="(max-width: 920px) 90vw, 36vw"
              priority
            />
          </div>
          <div className={styles.details}>
            <div className="eyebrow">ZEY NATÜREL SIZMA ZEYTİNYAĞI</div>
            <h2>Zey · {product.size}</h2>
            <p>{product.description}</p>
            <ul className={styles.featureList}>
              <li>Soğuk sıkım</li>
              <li>Erken hasat zeytinlerden</li>
              <li>Özenle paketlenir</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
