"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClosingSection() {
  const pathName = usePathname();

  const productsPage = pathName === "/urunler";
  return (
    <section className="closing wrap">
      <div className="eyebrow">GÜZEL ŞEYLER PAYLAŞTIKÇA ÇOĞALIR.</div>
      <h2>
        Sofrada <em>buluşalım.</em>
      </h2>
      {!productsPage && (
        <Link className="button" href="/urunler">
          Zey’i keşfet <span>↗</span>
        </Link>
      )}
    </section>
  );
}
