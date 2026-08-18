"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, isActive, waLink, waMessages } from "@/lib/site";

export default function TopBar() {
  const pathname = usePathname() || "/";
  const cta = waLink(waMessages.visita);

  return (
    <div className="wrap">
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
        </div>
      </div>
    </div>
  );
}
