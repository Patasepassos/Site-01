"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_ITEMS = [
  { href: "/admin", label: "Início", icon: "📊", adminOnly: false },
  { href: "/admin/parceiros", label: "Parceiros", icon: "🐾", adminOnly: false },
  { href: "/admin/comissoes", label: "Comissões", icon: "💰", adminOnly: false },
  { href: "/admin/saques", label: "Saques", icon: "💸", adminOnly: false },
  { href: "/admin/perfil", label: "Perfil", icon: "👤", adminOnly: false },
  { href: "/admin/regras", label: "Regras", icon: "⚙️", adminOnly: true },
  { href: "/admin/usuarios", label: "Usuários", icon: "👥", adminOnly: true },
  { href: "/admin/sistema", label: "Sistema", icon: "🧹", adminOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = BASE_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  return (
    <nav className="portal-bottom-nav" aria-label="Navegação do admin">
      {items.map((item) => (
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

export function AdminDesktopNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = BASE_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  return (
    <nav className="portal-nav-desktop" aria-label="Navegação do admin">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : ""}>
          {item.icon} {item.label}
        </Link>
      ))}
    </nav>
  );
}
