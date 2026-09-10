"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, isActive, waLink, waMessages } from "@/lib/site";

export default function TopBar() {
  const pathname = usePathname() || "/";
  const cta = waLink(waMessages.visita);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [...nav, { href: "#contato", label: "Contato" }];

  return (
    <div className="wrap tb-wrap">
      <div className="topbar-outer">
        <div className="topbar">
          <Link className="tb-brand" href="/" aria-label="Patas & Passos">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tb-logo" src="/logo-main.png" alt="Patas & Passos" />
          </Link>
          <ul className="tb-nav">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={isActive(pathname, n.href) ? "active" : ""}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="#contato">Contato</Link>
            </li>
          </ul>
          <a className="tb-cta" href={cta} target="_blank" rel="noopener">
            Agendar primeiro passo
          </a>
          <button
            type="button"
            className={`tb-burger${open ? " tb-burger-on" : ""}`}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className={`tb-mobile${open ? " tb-mobile-on" : ""}`}>
          <ul className="tb-mobile-list">
            {links.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={isActive(pathname, n.href) ? "active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a className="tb-mobile-cta" href={cta} target="_blank" rel="noopener" onClick={() => setOpen(false)}>
            Agendar primeiro passo
          </a>
        </div>
      </div>
    </div>
  );
}
