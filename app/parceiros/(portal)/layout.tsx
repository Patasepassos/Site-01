import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import LogoutButton from "@/components/portal/LogoutButton";
import { PortalBottomNav, PortalDesktopNav } from "@/components/portal/PortalNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentPartner();

  if (!current) {
    redirect("/parceiros/login");
  }

  const firstName = current.profile.full_name.split(" ")[0];

  if (current.partner.status === "pending") {
    return (
      <div className="pending-screen">
        <div className="emoji">⏳</div>
        <h1 className="h-lg">Cadastro em análise</h1>
        <p className="lead">
          Olá, {firstName}! Sua conta está aguardando aprovação da Patas &amp; Passos. Assim que
          for aprovada, seu painel libera automaticamente — sem precisar fazer nada.
        </p>
        <LogoutButton />
      </div>
    );
  }

  if (current.partner.status === "blocked") {
    return (
      <div className="pending-screen">
        <div className="emoji">🚫</div>
        <h1 className="h-lg">Acesso bloqueado</h1>
        <p className="lead">
          Sua conta de parceiro está bloqueada no momento. Fale com a Patas &amp; Passos pelo
          WhatsApp se achar que isso é um engano.
        </p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div className="portal-topbar-in">
          <div>
            <h1>Olá, {firstName}! 🐾</h1>
            <p>Vamos juntos levar mais cuidado aos pets.</p>
          </div>
          <LogoutButton />
        </div>
        <PortalDesktopNav />
      </header>

      <div className="portal-content">{children}</div>

      <PortalBottomNav />
    </div>
  );
}
