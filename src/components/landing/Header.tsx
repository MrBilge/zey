"use client";

import { useState } from "react";

const navigationLinks = [
  { href: "#urunler", label: "Zeytinyağımız" },
  { href: "#hikayemiz", label: "Hikâyemiz" },
  { href: "#sorular", label: "Merak edilenler" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="wrap header">
      <a className="logo" href="#">zey<sup>®</sup></a>
      <button
        className="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        Menü {isMenuOpen ? "−" : "+"}
      </button>
      <nav className={isMenuOpen ? "open" : ""}>
        {navigationLinks.map(({ href, label }) => (
          <a key={href} href={href} onClick={() => setIsMenuOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <a className="nav-button" href="#urunler">Zey’i keşfet ↗</a>
    </header>
  );
}
