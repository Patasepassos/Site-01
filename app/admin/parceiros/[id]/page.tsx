import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthEmailMap } from "@/lib/admin/auth-emails";
import {
  CUSTOMER_STATUS_LABELS,
  PARTNER_STATUS_LABELS,
  SERVICE_LABELS,
  formatCustomerLabel,
  formatDate,
} from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import PartnerStatusActions from "@/components/admin/PartnerStatusActions";
import AddCustomerForm from "@/components/admin/AddCustomerForm";
import CustomerActions from "@/components/admin/CustomerActions";

function formatPhone(digits: string): string {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
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
          <PartnerStatusActions partnerId={partner.id} status={partner.status} />
        </div>
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
            customers.map((c) => (
              <div className="referral-row" key={c.id} style={{ alignItems: "flex-start" }}>
                <div>
                  <div className="rr-id">{formatCustomerLabel(c.sequence_number)}</div>
                  <div className="rr-meta">
                    {SERVICE_LABELS[c.service]} · indicado em {formatDate(c.created_at)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`status-pill ${c.status}`}>{CUSTOMER_STATUS_LABELS[c.status]}</span>
                  </div>
                </div>
                <CustomerActions customerId={c.id} status={c.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
