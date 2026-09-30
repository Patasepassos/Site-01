"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/parceiros/dashboard", label: "Início", icon: "🏠" },
  { href: "/parceiros/indicacoes", label: "Indicações", icon: "🐾" },
  { href: "/parceiros/comissoes", label: "Comissões", icon: "💰" },
  { href: "/parceiros/saldo", label: "Saldo", icon: "💳" },
  { href: "/parceiros/saques", label: "Saques", icon: "💸" },
  { href: "/parceiros/perfil", label: "Perfil", icon: "👤" },
];

export function PortalBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="portal-bottom-nav" aria-label="Navegação do parceiro">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`pbn-item${pathname === item.href ? " active" : ""}`}
        >
          <span className="pbn-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function PortalDesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="portal-nav-desktop" aria-label="Navegação do parceiro">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? "active" : ""}
        >
          {item.icon} {item.label}
        </Link>
      ))}
    </nav>
  );
}
