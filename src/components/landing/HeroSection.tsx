import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <Image
          src="/zey-olive-oil.png"
          alt="Zey zeytinyağı ambalaj konsepti, zeytin dalları ve altın renkli zeytinyağı"
          fill
          priority
          sizes="(max-width:760px) 100vw,65vw"
          className={styles.image}
        />
      </div>
      <div className={`wrap ${styles.content}`}>
        <div className={styles.copy}>
          <div className="eyebrow">— TOPRAKTAN SOFRAYA, ZEY.</div>
          <h1>
            İyi bir sofranın
            <br />
            <em>kökü.</em>
          </h1>
          <p>
            Bir dilim ekmek. Uzayan bir kahvaltı.
            <br />
            Sevdiklerinizle paylaştığınız bir masa.
            <br />
            Hayatın en güzel anlarına, bir damla zey.
          </p>
          <div className="actions">
            <Link className="button" href="/urunler">
              Zeytinyağımızı keşfet <span>↗</span>
            </Link>
            <Link href="/hikayemiz">Bizi tanıyın →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
