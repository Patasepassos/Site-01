import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { buildEligibilityChecklist } from "@/lib/partners/eligibility";
import { onlyDigits } from "@/lib/partners/validation";
import { formatDateTime } from "@/lib/partners/labels";
import EditProfileForm from "@/components/portal/EditProfileForm";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";
import MfaSetup from "@/components/MfaSetup";
import CpfVerifyRetryButton from "@/components/portal/CpfVerifyRetryButton";
import EmailVerificationCard from "@/components/portal/EmailVerificationCard";
import WhatsappVerificationCard from "@/components/portal/WhatsappVerificationCard";
import { getConfiguredChannel } from "@/lib/sms/twilio";

export default async function PerfilPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const checklist = buildEligibilityChecklist(current.partner);
  const isCpf = onlyDigits(current.partner.cpf_cnpj).length === 11;
  const cpfBadge = !isCpf
    ? { emoji: "✅", label: "CPF/CNPJ validado" }
    : current.partner.cpf_status === "verified"
      ? { emoji: "🟢", label: "CPF verificado" }
      : current.partner.cpf_status === "failed"
        ? { emoji: "🔴", label: "Não foi possível validar o CPF" }
        : { emoji: "🟡", label: "Aguardando verificação do CPF" };

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
          <li>
            {checklist.emailVerified ? "✅ E-mail verificado" : "🟡 Aguardando verificação do e-mail"}
            {checklist.emailVerified && current.partner.email_verified_at && (
              <span style={{ opacity: 0.7 }}> — verificado em {formatDateTime(current.partner.email_verified_at)}</span>
            )}
          </li>
          <li>
            {checklist.whatsappVerified ? "✅ Telefone verificado" : "🟡 Aguardando verificação do telefone"}
            {checklist.whatsappVerified && current.partner.whatsapp_verified_at && (
              <span style={{ opacity: 0.7 }}> — verificado em {formatDateTime(current.partner.whatsapp_verified_at)}</span>
            )}
          </li>
          <li>
            {cpfBadge.emoji} {cpfBadge.label}
            {isCpf && current.partner.cpf_verified_at && (
              <span style={{ opacity: 0.7 }}> — última verificação em {formatDateTime(current.partner.cpf_verified_at)}</span>
            )}
          </li>
          <li>{checklist.financialDataVerified ? "✅" : "⏳"} Dados financeiros aprovados</li>
        </ul>
        <EmailVerificationCard email={current.email} verified={current.partner.email_verified} />
        <WhatsappVerificationCard
          phone={current.profile.phone}
          verified={current.partner.whatsapp_verified}
          channel={getConfiguredChannel()}
        />
        {isCpf && (current.partner.cpf_status === "pending" || current.partner.cpf_status === "failed") && (
          <CpfVerifyRetryButton />
        )}
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

      <div className="portal-card">
        <h2>Autenticação em dois fatores</h2>
        <MfaSetup />
      </div>
    </>
  );
}
