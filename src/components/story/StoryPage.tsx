import Image from "next/image";
import Link from "next/link";
import styles from "./StoryPage.module.css";

export default function StoryPage() {
  return (
    <article className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/story-olive-tree.png"
          alt="Gümülceli’de köklü bir zeytin ağacı"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={`wrap ${styles.heroContent}`}>
          <p className={styles.kicker}>GÜMÜLCELİ · SARUHANLI · MANİSA</p>
          <h1 className={styles.heroTitle}>
            Köklerinden başlayan
            <br />
            <em>bir sofra hikâyesi.</em>
          </h1>
          <p className={styles.heroIntro}>
            Bizim hikâyemiz, Manisa’nın Saruhanlı ilçesine bağlı Gümülceli’de,
            yıllardır aynı toprakta kök salan zeytin ağaçlarıyla başlıyor.
          </p>
        </div>
        <span className={styles.scrollCue} aria-hidden="true">
          Hikâyeyi keşfet <span>↓</span>
        </span>
      </section>

      <section className={`wrap ${styles.roots}`}>
        <div className={styles.chapterLabel}>
          <p>KÖKLER</p>
        </div>
        <div className={styles.rootsCopy}>
          <p className={styles.rootsStory}>
            <span className={styles.lead}>
              Bu topraklarda zeytin, bizim için yalnızca bir ürün değil;{" "}
            </span>
            <span className={styles.rootsBody}>
              aileden gelen bir emeğin ve yıllardır devam eden bir sofranın
              parçası. Ağaçlarımızdan toplanan zeytinlerden elde edilen yağ,
              uzun zamandır önce kendi soframızda, ardından yakınlarımızın ve
              dostlarımızın sofralarında yerini buluyor.
            </span>
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.harvest}`}>
        <figure className={styles.harvestImageWrap}>
          <Image
            src="/story-harvest.png"
            alt="Zeytin dalından özenle toplanan zeytinler"
            fill
            sizes="(max-width: 760px) 90vw, 48vw"
            className={styles.harvestImage}
          />
          <figcaption>Gümülceli’de hasat zamanı</figcaption>
        </figure>

        <div className={styles.harvestCopy}>
          <div className={styles.chapterLabel}>
            <p>EMEK</p>
          </div>
          <h2>Yıllardır aynı özenle.</h2>
          <p className={styles.bodyCopy}>
            Zamanla fark ettik ki yıllardır ailemiz ve çevremiz için ürettiğimiz
            bu zeytinyağını daha fazla sofrayla buluşturmak istiyoruz. Böylece
            Gümülceli’nin zeytinlerinden başlayan bu küçük aile hikâyesini,
            kendi adı ve kimliği olan bir markaya dönüştürmeye karar verdik.
          </p>
          <span className={styles.signature}>zey.</span>
        </div>
      </section>

      <section className={styles.promise}>
        <div className={`wrap ${styles.promiseInner}`}>
          <span className={styles.promiseMark}>“</span>
          <p>
            Kendi soframıza gönül rahatlığıyla koyduğumuz ürünü, aynı özenle
            sizin sofranıza ulaştırmak.
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.tableStory}`}>
        <div className={styles.tableCard}>
          <div className={styles.chapterLabel}>
            <p>SOFRA</p>
          </div>
          <h2>Mesele yalnızca zeytinyağı satmak değil.</h2>
          <p>
            Nereden geldiğini bildiğimiz, hikâyesini bildiğimiz ve kendi
            soframıza gönül rahatlığıyla koyduğumuz bir ürünü aynı özenle sizin
            sofranıza ulaştırmak.
          </p>
          <p className={styles.finalLine}>
            Çünkü iyi bir sofranın hikâyesi, <em>köklerinden başlar.</em>
          </p>
          <Link className={styles.storyLink} href="/urunler">
            Sofranıza zey katın <span>↗</span>
          </Link>
        </div>
        <div className={styles.tableImageWrap}>
          <figure className={styles.harvestImageWrap}>
            <Image
              src="/story-table.png"
              alt="Sofrada ekmek ve zeytinyağı"
              fill
              sizes="(max-width: 760px) 90vw, 72vw"
              className={styles.tableImage}
            />
            <figcaption>Sofranızdaki yeri</figcaption>
          </figure>
        </div>
      </section>
    </article>
  );
}
