import type { Metadata } from "next";
import Link from "next/link";
import PartnerTermsContent from "@/components/PartnerTermsContent";
import PartnerPortalGuideContent from "@/components/PartnerPortalGuideContent";

export const metadata: Metadata = {
  title: "Regras da Parceria · Patas & Passos",
  description: "Entenda como funciona o programa de parceiros da Patas & Passos.",
};

export default function RegrasParceriaPage() {
  return (
    <div className="wrap">
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="sec-head center reveal">
          <span className="eyebrow">🤝 Área do Parceiro</span>
          <h1 className="h-lg">
            Regras da <span className="hl">Parceria</span>
          </h1>
          <p className="lead">
            Tudo o que você precisa saber antes de indicar clientes pra Patas &amp; Passos.
          </p>
        </div>

        <div className="card reveal" style={{ maxWidth: 680, margin: "0 auto" }}>
          <PartnerTermsContent />
        </div>

        <div className="sec-head center reveal" style={{ marginTop: 40 }}>
          <span className="eyebrow">📱 Portal do Parceiro</span>
          <h2 className="h-lg">Como funciona o Portal e o Painel</h2>
          <p className="lead">
            Veja como acompanhar suas indicações, comissões, oportunidades, notificações e
            pagamentos.
          </p>
        </div>
        <div className="card reveal" style={{ maxWidth: 680, margin: "0 auto" }}>
          <PartnerPortalGuideContent />
        </div>

        <div className="cta-row reveal" style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <Link className="btn btn-wa btn-lg" href="/parceiros/cadastro">
            Quero ser parceiro
          </Link>
          <Link className="btn btn-white btn-lg" href="/parceiros/login">
            Já sou parceiro
          </Link>
        </div>
      </section>
    </div>
  );
}
