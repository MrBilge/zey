import Link from "next/link";

export default function StorySection() {
  return (
    <section className="story" id="hikayemiz">
      <div className="wrap story-grid">
        <div>
          <div className="eyebrow">BİZİM HİKÂYEMİZ</div>
          <h2>Bir ağaçla başlar.<br />Bir sofrada<br /><em>devam eder.</em></h2>
        </div>
        <div className="story-copy">
          <span className="story-logo">zey.</span>
          <p>
            Bizim için zeytinyağı, bir yemeğin içindekiler listesinden çok daha
            fazlası. Bir araya gelmenin, özenle hazırlamanın ve paylaşmanın bir
            parçası.
          </p>
          <p>
            Zey’i bu düşünceyle kuruyoruz: kendi zeytinyağımızı, kendi hikâyemizle
            sofranıza getirmek için.
          </p>
          <Link href="/urunler">Sofranıza zey katın ↗</Link>
        </div>
      </div>
    </section>
  );
}
