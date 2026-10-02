"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_ITEMS = [
  { href: "/admin", label: "Início", icon: "📊", adminOnly: false },
  { href: "/admin/parceiros", label: "Parceiros", icon: "🐾", adminOnly: false },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰", adminOnly: false },
  { href: "/admin/perfil", label: "Perfil", icon: "👤", adminOnly: false },
  { href: "/admin/regras", label: "Regras", icon: "⚙️", adminOnly: true },
  { href: "/admin/ranks", label: "Ranks", icon: "🏆", adminOnly: true },
  { href: "/admin/usuarios", label: "Usuários", icon: "👥", adminOnly: true },
  { href: "/admin/sistema", label: "Sistema", icon: "🧹", adminOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        display: "inline-flex", minWidth: 16, height: 16, borderRadius: 999, background: "#8c241d",
        color: "#fff", fontSize: 10, fontWeight: 700, alignItems: "center", justifyContent: "center",
        padding: "0 4px", marginLeft: 4, verticalAlign: "top",
      }}
    >
      {count}
    </span>
  );
}

export function AdminBottomNav({ isAdmin, pendingPartners = 0 }: { isAdmin: boolean; pendingPartners?: number }) {
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
          {item.href === "/admin/parceiros" && <NavBadge count={pendingPartners} />}
        </Link>
      ))}
    </nav>
  );
}

export function AdminDesktopNav({ isAdmin, pendingPartners = 0 }: { isAdmin: boolean; pendingPartners?: number }) {
  const pathname = usePathname();
  const items = BASE_ITEMS.filter((item) => isAdmin || !item.adminOnly);
  return (
    <nav className="portal-nav-desktop" aria-label="Navegação do admin">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : ""}>
          {item.icon} {item.label}
          {item.href === "/admin/parceiros" && <NavBadge count={pendingPartners} />}
        </Link>
      ))}
    </nav>
  );
}
