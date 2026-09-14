import type { ReactNode } from "react";
import Link from "next/link";

type HeaderProps = {
  children: ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="wrap header">
      <Link className="logo" href="/" aria-label="Zey ana sayfa">
        zey<sup>®</sup>
      </Link>
      {children}
    </header>
  );
}
