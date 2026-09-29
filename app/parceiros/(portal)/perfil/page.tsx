import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { buildEligibilityChecklist } from "@/lib/partners/eligibility";
import EditProfileForm from "@/components/portal/EditProfileForm";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";

export default async function PerfilPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const checklist = buildEligibilityChecklist(current.partner, current.emailVerified);

  return (
    <>
      <div className="portal-card">
        <h2>Meus dados</h2>
        <p style={{ marginTop: 8 }}>
          <b>Nome:</b> {current.profile.full_name}
          <br />
          <b>E-mail:</b> {current.email}
          <br />
          <b>Cupom:</b> {current.partner.coupon_code}
        </p>
      </div>

      <div className="portal-card">
        <h2>Status de pagamento</h2>
        <div style={{ marginTop: 6, marginBottom: 10 }}>
          <span className={`status-pill tone-${checklist.eligible ? "done" : "pending"}`}>
            {checklist.eligible ? "✅ Apto para pagamento" : "⏳ Verificação pendente"}
          </span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--ink-soft)" }}>
          <li>{checklist.emailVerified ? "✅" : "⏳"} E-mail verificado</li>
          <li>{checklist.whatsappVerified ? "✅" : "⏳"} WhatsApp verificado</li>
          <li>{checklist.documentVerified ? "✅" : "⏳"} CPF/CNPJ validado</li>
          <li>{checklist.financialDataVerified ? "✅" : "⏳"} Dados financeiros aprovados</li>
        </ul>
        {!checklist.eligible && (
          <p style={{ marginTop: 10, fontSize: 13 }}>
            Enquanto algum item estiver pendente, você não consegue solicitar saque. A Patas &amp; Passos confirma
            isso pra você — não precisa fazer nada além de manter seus dados corretos.
          </p>
        )}
      </div>

      <div className="portal-card">
        <h2>WhatsApp e Pix</h2>
        <p style={{ marginBottom: 10, fontSize: 13 }}>
          Alterar sua chave Pix ou seu WhatsApp exige nova confirmação da Patas &amp; Passos antes do próximo
          pagamento.
        </p>
        <EditProfileForm
          initialPhone={current.profile.phone}
          initialPixKey={current.partner.pix_key}
          initialPixKeyType={current.partner.pix_key_type}
        />
      </div>

      <div className="portal-card">
        <h2>Trocar senha</h2>
        <ChangePasswordForm />
      </div>
    </>
  );
}
