export default function Footer() {
  return (
    <footer className="wrap footer">
      <a className="logo" href="#">zey<sup>®</sup></a>
      <p>Kökü toprakta. Yeri sofranızda.</p>
      <span>© {new Date().getFullYear()} zey.</span>
      <a href="#">Başa dön ↑</a>
    </footer>
  );
}
