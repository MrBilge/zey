"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Navigation.module.css";

const navigationLinks = [
  { href: "/urunler", label: "Ürünler" },
  { href: "/merak-edilenler", label: "Merak edilenler" },
  { href: "/hikayemiz", label: "Hikâyemiz" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <button
        type="button"
        className="menu"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        Menü {isMenuOpen ? "−" : "+"}
      </button>
      <nav
        id="primary-navigation"
        aria-label="Ana navigasyon"
        className={isMenuOpen ? "open" : ""}
      >
        {navigationLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.active : undefined}
            aria-current={pathname === href ? "page" : undefined}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link className="nav-button" href="/urunler" onClick={closeMenu}>
        Zey’i keşfet ↗
      </Link>
    </>
  );
}
