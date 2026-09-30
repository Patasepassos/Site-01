import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthEmailMap } from "@/lib/admin/auth-emails";
import {
  PARTNER_STATUS_LABELS,
  SERVICE_LABELS,
  formatCustomerLabel,
  formatDate,
  formatDateTime,
  getUnifiedStatus,
} from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import { onlyDigits } from "@/lib/partners/validation";
import PartnerStatusActions from "@/components/admin/PartnerStatusActions";
import AddCustomerForm from "@/components/admin/AddCustomerForm";
import CustomerActions from "@/components/admin/CustomerActions";
import CustomerRowMenu from "@/components/admin/CustomerRowMenu";
import TestFlagToggle from "@/components/admin/TestFlagToggle";
import WhatsappVerifyToggle from "@/components/admin/WhatsappVerifyToggle";
import FinancialDataReviewActions from "@/components/admin/FinancialDataReviewActions";
import PixKeyReveal from "@/components/admin/PixKeyReveal";
import { buildEligibilityChecklist } from "@/lib/partners/eligibility";
import type { CommissionRow, CommissionStatus } from "@/lib/supabase/types";

function formatPhone(digits: string): string {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

const COMMISSION_PRIORITY: Record<CommissionStatus, number> = { paga: 3, liberada: 2, bloqueada: 1 };

function pickBestCommission(commissions: CommissionRow[]): CommissionRow | undefined {
  return commissions.sort((a, b) => COMMISSION_PRIORITY[b.status] - COMMISSION_PRIORITY[a.status])[0];
}

export default async function AdminPartnerDetailPage({ params }: { params: { id: string } }) {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin.from("partners").select("*").eq("id", params.id).maybeSingle();
  if (!partner) notFound();

  const [{ data: profile }, emailMap, { data: customers }] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("id", partner.profile_id).maybeSingle(),
    getAuthEmailMap(supabaseAdmin, [partner.profile_id]),
    supabaseAdmin.from("customers").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
  ]);

  const email = emailMap.get(partner.profile_id) ?? "e-mail indisponível";
  const checklist = buildEligibilityChecklist(partner);
  const isCpf = onlyDigits(partner.cpf_cnpj).length === 11;

  const customerIds = (customers ?? []).map((c) => c.id);
  const { data: sales } = customerIds.length
    ? await supabaseAdmin.from("sales").select("*").in("customer_id", customerIds).order("created_at", { ascending: false })
    : { data: [] };
  const saleByCustomerId = new Map((sales ?? []).map((s) => [s.customer_id, s]));

  const saleIds = (sales ?? []).map((s) => s.id);
  const { data: commissions } = saleIds.length
    ? await supabaseAdmin.from("commissions").select("*").in("sale_id", saleIds)
    : { data: [] };
  const commissionsBySaleId = new Map<string, CommissionRow[]>();
  for (const c of commissions ?? []) {
    if (!c.sale_id) continue;
    const list = commissionsBySaleId.get(c.sale_id) ?? [];
    list.push(c);
    commissionsBySaleId.set(c.sale_id, list);
  }

  return (
    <>
      <div className="portal-card">
        <h2>{profile?.full_name ?? "Parceiro"}</h2>
        <p style={{ marginTop: 6 }}>{email}</p>
        <p>WhatsApp: {profile ? formatPhone(profile.phone) : "—"}</p>
        <p>CPF/CNPJ: {maskSecret(partner.cpf_cnpj)}</p>
        <p>Pix ({partner.pix_key_type}): {maskSecret(partner.pix_key)}</p>
        <p>Cupom: <b>{partner.coupon_code}</b></p>
        <p>Parceiro desde {formatDate(partner.created_at)}</p>

        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className={`status-pill ${partner.status}`}>{PARTNER_STATUS_LABELS[partner.status]}</span>
          {partner.is_test && <span className="admin-badge-test">TESTE</span>}
          <PartnerStatusActions partnerId={partner.id} status={partner.status} />
          <TestFlagToggle kind="parceiros" id={partner.id} isTest={partner.is_test} />
        </div>
      </div>

      <div className="portal-card">
        <h2>Elegibilidade de pagamento</h2>
        <div style={{ marginTop: 6, marginBottom: 10 }}>
          <span className={`status-pill tone-${checklist.eligible ? "done" : "pending"}`}>
            {checklist.eligible ? "✅ Apto para pagamento" : "⏳ Verificação pendente"}
          </span>
        </div>
        <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 14, color: "var(--ink-soft)" }}>
          <li>{checklist.partnerActive ? "✅" : "⏳"} Conta ativa</li>
          <li>
            {checklist.emailVerified ? "✅" : "⏳"} E-mail verificado
            {checklist.emailVerified && partner.email_verified_at && (
              <span style={{ opacity: 0.7 }}> — em {formatDateTime(partner.email_verified_at)}</span>
            )}
          </li>
          <li>
            {checklist.whatsappVerified ? "✅" : "⏳"} Telefone verificado
            {checklist.whatsappVerified && partner.whatsapp_verified_at && (
              <span style={{ opacity: 0.7 }}> — em {formatDateTime(partner.whatsapp_verified_at)}</span>
            )}
          </li>
          <li>{checklist.documentVerified ? "✅" : "⏳"} CPF/CNPJ validado</li>
          <li>
            {checklist.financialDataStatus === "approved"
              ? "✅ Dados financeiros aprovados"
              : checklist.financialDataStatus === "rejected"
                ? "⚠️ Dados financeiros — correção necessária"
                : "🟡 Dados financeiros em análise"}
            {checklist.financialDataStatus !== "pending" && partner.financial_data_reviewed_at && (
              <span style={{ opacity: 0.7 }}> — em {formatDateTime(partner.financial_data_reviewed_at)}</span>
            )}
          </li>
        </ul>
        <WhatsappVerifyToggle partnerId={partner.id} verified={partner.whatsapp_verified} />
      </div>

      <div className="portal-card">
        <h2>Dados financeiros (Pix)</h2>
        <PixKeyReveal partnerId={partner.id} pixKeyType={partner.pix_key_type} pixKeyMasked={maskSecret(partner.pix_key)} />
        <p>
          Status:{" "}
          <span
            className={`status-pill tone-${checklist.financialDataStatus === "approved" ? "done" : checklist.financialDataStatus === "rejected" ? "cancelled" : "pending"}`}
          >
            {checklist.financialDataStatus === "approved"
              ? "✅ Aprovado"
              : checklist.financialDataStatus === "rejected"
                ? "⚠️ Correção necessária"
                : "🟡 Em análise"}
          </span>
        </p>
        {partner.financial_data_reviewed_at && (
          <p>Última revisão: {formatDateTime(partner.financial_data_reviewed_at)}</p>
        )}
        {checklist.financialDataStatus === "rejected" && partner.financial_data_review_note && (
          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Motivo: {partner.financial_data_review_note}</p>
        )}
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
          Aprovação manual — nenhuma API de validação de titularidade Pix integrada ainda.
        </p>
        <FinancialDataReviewActions partnerId={partner.id} />
      </div>

      <div className="portal-card">
        <h2>Verificação de CPF</h2>
        {!isCpf ? (
          <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            Este parceiro é pessoa jurídica (CNPJ) — não há verificação automática contratada para CNPJ. A aprovação
            de documento acima é manual.
          </p>
        ) : (
          <>
            <p style={{ marginTop: 6 }}>
              CPF: <b>{maskSecret(partner.cpf_cnpj)}</b>
            </p>
            <p>
              Status:{" "}
              <span className={`status-pill tone-${partner.cpf_status === "verified" ? "done" : partner.cpf_status === "failed" ? "cancelled" : "pending"}`}>
                {partner.cpf_status === "verified" ? "🟢 Verificado" : partner.cpf_status === "failed" ? "🔴 Não verificado" : "🟡 Aguardando verificação"}
              </span>
            </p>
            {partner.cpf_verified_at && <p>Última verificação: {formatDateTime(partner.cpf_verified_at)}</p>}
            {partner.cpf_verification_reason && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                Resultado: {partner.cpf_verification_reason}
              </p>
            )}
          </>
        )}
      </div>

      <div className="portal-card">
        <h2>Adicionar cliente indicado</h2>
        <p style={{ marginBottom: 12 }}>Use quando o parceiro indicar alguém por WhatsApp ou pessoalmente.</p>
        <AddCustomerForm partnerId={partner.id} />
      </div>

      <div className="portal-card">
        <h2>Indicações</h2>
        <p style={{ marginBottom: 4 }}>
          {customers?.length ?? 0} {customers?.length === 1 ? "cliente indicado" : "clientes indicados"}
        </p>

        <div style={{ marginTop: 14 }}>
          {!customers || customers.length === 0 ? (
            <p>Nenhum cliente indicado ainda.</p>
          ) : (
            customers.map((c) => {
              const sale = saleByCustomerId.get(c.id) ?? null;
              const bestCommission = sale ? pickBestCommission(commissionsBySaleId.get(sale.id) ?? []) : undefined;
              const unified = getUnifiedStatus({
                customerStatus: c.status,
                paymentStatus: sale?.payment_status,
                commissionStatus: bestCommission?.status,
              });

              return (
                <div className="referral-row" key={c.id} style={{ alignItems: "flex-start" }}>
                  <div>
                    <div className="rr-id">
                      {formatCustomerLabel(c.sequence_number)}
                      {c.customer_name ? ` · ${c.customer_name}` : ""}
                      {c.is_test && <span className="admin-badge-test">TESTE</span>}
                      {c.archived_at && <span className="admin-badge-test">ARQUIVADO</span>}
                    </div>
                    <div className="rr-meta">
                      {SERVICE_LABELS[c.service]} · indicado em {formatDate(c.created_at)}
                      {c.customer_phone ? ` · ${c.customer_phone}` : ""}
                      {sale?.payment_method ? ` · pago via ${sale.payment_method}` : ""}
                    </div>
                    {sale?.notes && <div className="rr-meta">Obs.: {sale.notes}</div>}
                    <div style={{ marginTop: 6 }}>
                      <span className={`status-pill tone-${unified.tone}`}>{unified.emoji} {unified.label}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <CustomerActions customerId={c.id} status={c.status} sale={sale} />
                    <CustomerRowMenu customerId={c.id} isTest={c.is_test} isArchived={Boolean(c.archived_at)} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
