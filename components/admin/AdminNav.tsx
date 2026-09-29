"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/parceiros", label: "Parceiros", icon: "🐾" },
  { href: "/admin/comissoes", label: "Comissões", icon: "💰" },
  { href: "/admin/saques", label: "Saques", icon: "💸" },
  { href: "/admin/regras", label: "Regras", icon: "⚙️" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="portal-bottom-nav" aria-label="Navegação do admin">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`pbn-item${isActive(pathname, item.href) ? " active" : ""}`}
        >
          <span className="pbn-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminDesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="portal-nav-desktop" aria-label="Navegação do admin">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : ""}>
          {item.icon} {item.label}
        </Link>
      ))}
    </nav>
  );
}
