import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { buildEligibilityChecklist } from "@/lib/partners/eligibility";
import { onlyDigits } from "@/lib/partners/validation";
import { formatDateTime } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import EditProfileForm from "@/components/portal/EditProfileForm";
import EditNameForm from "@/components/portal/EditNameForm";
import AvatarPicker from "@/components/portal/AvatarPicker";
import DeleteAccountSection from "@/components/portal/DeleteAccountSection";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";
import MfaSetup from "@/components/MfaSetup";
import CpfVerificationCard from "@/components/portal/CpfVerificationCard";
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
        <h2>Seu avatar</h2>
        <AvatarPicker currentAvatarKey={current.profile.avatar_key} />
      </div>

      <div className="portal-card">
        <h2>Meus dados</h2>
        <p style={{ marginTop: 8 }}>
          <b>Nome:</b> {current.profile.full_name}
          <br />
          <b>E-mail:</b> {current.email}
          <br />
          <b>Cupom:</b> {current.partner.coupon_code}
        </p>
        <EditNameForm initialFullName={current.profile.full_name} />
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
          <li>
            {checklist.financialDataStatus === "approved"
              ? "✅ Dados financeiros aprovados"
              : checklist.financialDataStatus === "rejected"
                ? "⚠️ Correção necessária"
                : "🟡 Dados financeiros em análise"}
            {checklist.financialDataStatus !== "pending" && current.partner.financial_data_reviewed_at && (
              <span style={{ opacity: 0.7 }}> — em {formatDateTime(current.partner.financial_data_reviewed_at)}</span>
            )}
          </li>
        </ul>
        <EmailVerificationCard email={current.email} verified={current.partner.email_verified} />
        <WhatsappVerificationCard
          phone={current.profile.phone}
          verified={current.partner.whatsapp_verified}
          channel={getConfiguredChannel()}
        />
        {isCpf && (
          <CpfVerificationCard
            cpfMasked={maskSecret(current.partner.cpf_cnpj)}
            verified={current.partner.cpf_status === "verified"}
          />
        )}
        {checklist.financialDataStatus === "pending" && (
          <p style={{ marginTop: 10, fontSize: 13 }}>
            Seus dados de pagamento foram enviados e estão aguardando aprovação da Patas &amp; Passos.
          </p>
        )}
        {checklist.financialDataStatus === "approved" && (
          <p style={{ marginTop: 10, fontSize: 13 }}>
            Seus dados de pagamento foram confirmados e estão liberados para receber comissões.
          </p>
        )}
        {checklist.financialDataStatus === "rejected" && (
          <p style={{ marginTop: 10, fontSize: 13 }}>
            Precisamos que você revise seus dados de pagamento e envie novamente.
            {current.partner.financial_data_review_note && (
              <>
                {" "}
                <span style={{ opacity: 0.8 }}>Motivo: {current.partner.financial_data_review_note}</span>
              </>
            )}
          </p>
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

      <DeleteAccountSection />
    </>
  );
}
