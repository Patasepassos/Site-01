"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import LogoutButton from "./LogoutButton";
import { RANK_IMAGE, RANK_THEME } from "@/lib/partners/rankTheme";
import type { RankKey } from "@/lib/supabase/types";

type RankRingStyle = CSSProperties & { "--rc1"?: string; "--rc2"?: string; "--rc-glow"?: string };

const NAV_ITEMS = [
  { href: "/parceiros/dashboard", label: "Início", icon: "🏠" },
  { href: "/parceiros/indicacoes", label: "Indicações", icon: "🐾" },
  { href: "/parceiros/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/parceiros/calculadora", label: "Calculadora", icon: "🧮" },
  { href: "/parceiros/perfil", label: "Perfil", icon: "👤" },
];

export default function AvatarMenu({
  avatarSrc,
  avatarAlt,
  rankKey,
  rankPhotoUrl,
  firstName,
}: {
  avatarSrc: string;
  avatarAlt: string;
  rankKey?: RankKey | null;
  rankPhotoUrl?: string | null;
  firstName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="avatar-menu" ref={ref}>
      <button type="button" className="avatar-menu-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu do parceiro">
        <span
          className={`rank-ring unlocked current${rankKey && RANK_THEME[rankKey].rainbow ? " rainbow" : ""}`}
          style={
            rankKey
              ? ({ "--rc1": RANK_THEME[rankKey].c1, "--rc2": RANK_THEME[rankKey].c2, "--rc-glow": RANK_THEME[rankKey].glow } as RankRingStyle)
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc} alt={avatarAlt} width={40} height={40} style={{ borderRadius: "50%", display: "block" }} />
          {rankKey && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="avatar-rank-badge" src={rankPhotoUrl || RANK_IMAGE[rankKey]} alt="" />
          )}
        </span>
        <span className="avatar-menu-caret">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="avatar-menu-panel">
          <div className="avatar-menu-greeting">Olá, {firstName}!</div>
          <div className="avatar-menu-list">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={`avatar-menu-item${pathname === item.href ? " active" : ""}`}>
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>
          <div className="avatar-menu-footer">
            <LogoutButton label="Sair da conta" redirectTo="/parceiros/login" />
          </div>
        </div>
      )}
    </div>
  );
}
