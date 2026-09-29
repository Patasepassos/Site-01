"use client";

import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import Footer from "./Footer";
import ContactForm from "./ContactForm";
import LocationSection from "./LocationSection";
import SocialDock from "./SocialDock";

// Rotas do Portal do Parceiro (autenticação + painel) têm sua própria
// identidade de tela cheia — não fazem sentido com o menu de marketing,
// o formulário de contato ou o mapa por baixo.
const APP_SHELL_PREFIXES = [
  "/parceiros/cadastro",
  "/parceiros/login",
  "/parceiros/redefinir-senha",
  "/parceiros/dashboard",
  "/parceiros/indicacoes",
  "/parceiros/comissoes",
  "/parceiros/calculadora",
  "/parceiros/saldo",
  "/parceiros/saques",
  "/parceiros/perfil",
  "/admin",
  "/mfa-challenge",
];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAppShell = APP_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAppShell) {
    return <>{children}</>;
  }

  return (
    <>
      <TopBar />
      {children}
      <div className="wrap">
        <ContactForm />
      </div>
      <div className="wrap">
        <LocationSection />
      </div>
      <Footer />
      <SocialDock />
    </>
  );
}
