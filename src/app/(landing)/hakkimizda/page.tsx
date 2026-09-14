import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Hakkımızda | zey",
  description: "Zey'i ve sofraya taşıdığı yaklaşımı daha yakından tanıyın.",
};

export default function AboutPage() {
  return (
    <>
      <section className={`wrap ${styles.intro}`}>
        <div className="eyebrow">BİZİ TANIYIN</div>
        <h1>
          Sade, özenli ve<br />
          <em>sofraya yakın.</em>
        </h1>
        <p>
          Zey, iyi zeytinyağının gündelik hayatın doğal bir parçası olması
          gerektiğine inanan bir sofra markası.
        </p>
      </section>

      <section className={`wrap section ${styles.grid}`}>
        <div className={styles.card}>
          <span>01</span>
          <h2>Özüne sadık</h2>
          <p>
            Gösterişten uzak, anlaşılır ve iyi hazırlanmış ürünleri sofranıza
            taşımak için çalışıyoruz.
          </p>
        </div>
        <div className={styles.card}>
          <span>02</span>
          <h2>Paylaşmaya değer</h2>
          <p>
            Bizim için sofra yalnızca yemek yenilen bir yer değil; birlikte
            geçirilen zamanın merkezidir.
          </p>
        </div>
        <div className={styles.card}>
          <span>03</span>
          <h2>Köküne yakın</h2>
          <p>
            Toprağa, emeğe ve zeytinin zamana yayılan kültürüne saygı duyan bir
            yol izliyoruz.
          </p>
        </div>
      </section>

      <section className="closing wrap">
        <div className="eyebrow">KÖKÜ TOPRAKTA. YERİ SOFRANIZDA.</div>
        <h2>
          Hikâyemizi <em>keşfedin.</em>
        </h2>
        <Link className="button" href="/hikayemiz">
          Hikâyemize göz atın <span>→</span>
        </Link>
      </section>
    </>
  );
}
