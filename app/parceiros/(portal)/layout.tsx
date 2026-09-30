import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPartnerRankInfo } from "@/lib/partners/ranks";
import LogoutButton from "@/components/portal/LogoutButton";
import { PortalBottomNav, PortalDesktopNav } from "@/components/portal/PortalNav";
import ToastProvider from "@/components/portal/ToastProvider";
import AvatarMenu from "@/components/portal/AvatarMenu";
import { AVATAR_LABELS, avatarSrc } from "@/lib/partners/avatars";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentPartner();

  if (!current) {
    redirect("/parceiros/login");
  }

  const firstName = current.profile.full_name.split(" ")[0];

  if (current.partner.status === "pending") {
    return (
      <div className="parceiro-app">
        <div className="pending-screen">
          <div className="emoji">⏳</div>
          <h1 className="h-lg">Cadastro em análise</h1>
          <p className="lead">
            Olá, {firstName}! Sua conta está aguardando aprovação da Patas &amp; Passos. Assim que
            for aprovada, seu painel libera automaticamente — sem precisar fazer nada.
          </p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  if (current.partner.status === "blocked" && current.partner.account_deleted_at) {
    return (
      <div className="parceiro-app">
        <div className="pending-screen">
          <div className="emoji">👋</div>
          <h1 className="h-lg">Conta excluída</h1>
          <p className="lead">Sua conta de parceiro foi encerrada com sucesso.</p>
          <LogoutButton label="Sair" redirectTo="/parceiros/login" />
        </div>
      </div>
    );
  }

  if (current.partner.status === "blocked") {
    return (
      <div className="parceiro-app">
        <div className="pending-screen">
          <div className="emoji">🚫</div>
          <h1 className="h-lg">Acesso bloqueado</h1>
          <p className="lead">
            Sua conta de parceiro está bloqueada no momento. Fale com a Patas &amp; Passos pelo
            WhatsApp se achar que isso é um engano.
          </p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  const rank = await getPartnerRankInfo(createSupabaseAdminClient(), current.partner.id);

  return (
    <ToastProvider>
      <div className="parceiro-app">
        <div className="portal-shell">
          <header className="portal-topbar">
            <div className="portal-topbar-in">
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", opacity: 0.75, margin: 0 }}>
                  🐾 ÁREA DO PARCEIRO
                </p>
                <h1>Olá, {firstName}!</h1>
                <p>Vamos juntos levar mais cuidado aos pets.</p>
              </div>
              <AvatarMenu
                avatarSrc={avatarSrc(current.profile.avatar_key)}
                avatarAlt={AVATAR_LABELS[current.profile.avatar_key]}
                rankEmoji={rank.currentTier?.emoji}
                firstName={firstName}
              />
            </div>
            <PortalDesktopNav />
          </header>

          <div className="portal-content">{children}</div>

          <PortalBottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
