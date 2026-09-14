import Link from "next/link";

export default function Footer() {
  return (
    <footer className="wrap footer">
      <Link className="logo" href="/" aria-label="Zey ana sayfa">zey<sup>®</sup></Link>
      <p>Kökü toprakta. Yeri sofranızda.</p>
      <span>© {new Date().getFullYear()} zey.</span>
      <a href="#">Başa dön ↑</a>
    </footer>
  );
}
