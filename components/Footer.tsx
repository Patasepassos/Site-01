import Link from "next/link";
import { siteConfig, waLink, waMessages } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="footer-in">
        <div>
          <div className="fbrand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-main.png" alt="Patas & Passos" style={{ height: 60, width: "auto", objectFit: "contain" }} />
          </div>
          <p>
            Mais do que um passeio, uma jornada de bem-estar para o seu melhor amigo. Passeios,
            pet sitter, hotel e vacinas a domicílio com amor e segurança.
          </p>
        </div>
        <div>
          <h4>Serviços</h4>
          <Link href="/passeios">Passeios (Dog Walker)</Link>
          <Link href="/socializacao">Socialização</Link>
          <Link href="/pet-sitter">Pet Sitter</Link>
          <Link href="/creche">Creche</Link>
          <Link href="/hotel">Hotel</Link>
          <Link href="/vacinas">Vacinas a domicílio</Link>
        </div>
        <div>
          <h4>Patas &amp; Passos</h4>
          <Link href="/">Início</Link>
          <Link href="/parceiros">Parceiros</Link>
          <a href={siteConfig.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
        </div>
        <div>
          <h4>Fale com a gente</h4>
          <a href={waLink(waMessages.default)} target="_blank" rel="noopener">
            WhatsApp · {siteConfig.phoneDisplay}
          </a>
          <p style={{ marginTop: 4 }}>{siteConfig.address}</p>
          <p style={{ marginTop: 10 }}>{siteConfig.hours}</p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 Patas &amp; Passos · Cuidado com amor e segurança
        <span style={{ margin: "0 10px", opacity: 0.4 }}>·</span>
        Desenvolvido por{" "}
        <a href="https://dolvitta.com.br" target="_blank" rel="noopener" style={{ color: "rgba(245,239,230,.65)", textDecoration: "underline" }}>
          Dolvitta
        </a>
      </div>
    </footer>
  );
}
