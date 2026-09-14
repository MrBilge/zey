import Link from "next/link";

export default function ClosingSection() {
  return (
    <section className="closing wrap">
      <div className="eyebrow">GÜZEL ŞEYLER PAYLAŞTIKÇA ÇOĞALIR.</div>
      <h2>Sofrada <em>buluşalım.</em></h2>
      <Link className="button" href="/urunler">Zey’i keşfet <span>↗</span></Link>
    </section>
  );
}
