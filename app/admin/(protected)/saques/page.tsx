import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PAYOUT_STATUS_LABELS, formatBRL, formatDate } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import PayoutActions from "@/components/admin/PayoutActions";
import ProofLink from "@/components/ProofLink";
import SendReceiptButton from "@/components/admin/SendReceiptButton";
import type { PayoutStatus } from "@/lib/supabase/types";

const TABS: { key: PayoutStatus | "pendentes" | "all"; label: string }[] = [
  { key: "pendentes", label: "Pendentes" },
  { key: "pago", label: "Pagas" },
  { key: "all", label: "Todas" },
];

export default async function AdminSaquesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const activeTab = (searchParams.status ?? "pendentes") as PayoutStatus | "pendentes" | "all";
  const supabaseAdmin = createSupabaseAdminClient();

  let query = supabaseAdmin.from("payouts").select("*").order("requested_at", { ascending: false });
  if (activeTab === "pendentes") query = query.in("status", ["solicitado", "em_analise", "aprovado"]);
  else if (activeTab !== "all") query = query.eq("status", activeTab);
  const { data: payouts } = await query;

  const partnerIds = Array.from(new Set((payouts ?? []).map((p) => p.partner_id)));
  const { data: partners } = partnerIds.length
    ? await supabaseAdmin.from("partners").select("*").in("id", partnerIds)
    : { data: [] };

  const processedByIds = Array.from(
    new Set((payouts ?? []).map((p) => p.processed_by).filter((id): id is string => Boolean(id)))
  );
  const profileIds = Array.from(new Set([...(partners ?? []).map((p) => p.profile_id), ...processedByIds]));
  const { data: profiles } = profileIds.length
    ? await supabaseAdmin.from("profiles").select("*").in("id", profileIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const partnerById = new Map((partners ?? []).map((p) => [p.id, p]));

  return (
    <div className="portal-card">
      <h2>Saques</h2>
      <p style={{ marginBottom: 4 }}>Pagamento é sempre manual e exige comprovante anexado — nada sai automático daqui.</p>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/saques?status=${tab.key}`}
            className={`admin-tab${activeTab === tab.key ? " active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {!payouts || payouts.length === 0 ? (
          <p>Nenhum saque nessa categoria.</p>
        ) : (
          payouts.map((p) => {
            const partner = partnerById.get(p.partner_id);
            const partnerProfile = partner ? profileById.get(partner.profile_id) : undefined;
            const processedByProfile = p.processed_by ? profileById.get(p.processed_by) : undefined;

            return (
              <div className="referral-row" key={p.id} style={{ alignItems: "flex-start" }}>
                <div>
                  <div className="rr-id">{partnerProfile?.full_name ?? "Parceiro removido"} · {formatBRL(p.amount)}</div>
                  <div className="rr-meta">
                    Pix ({maskSecret(p.pix_key_snapshot)}) · solicitado em {formatDate(p.requested_at)}
                  </div>
                  {p.status === "pago" && (
                    <div className="rr-meta">
                      Pago em {p.processed_at ? formatDate(p.processed_at) : "—"} via {p.payment_method ?? "—"}
                      {processedByProfile ? ` · confirmado por ${processedByProfile.full_name}` : ""}
                      {p.transaction_reference ? ` · ref. ${p.transaction_reference}` : ""}
                      {p.notes ? ` · Obs.: ${p.notes}` : ""}
                    </div>
                  )}
                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`status-pill ${p.status}`}>{PAYOUT_STATUS_LABELS[p.status]}</span>
                    {p.status === "pago" && p.proof_path && (
                      <>
                        <ProofLink endpoint={`/api/admin/saques/${p.id}/comprovante`} />
                        {partnerProfile?.phone && (
                          <SendReceiptButton
                            partnerPhone={partnerProfile.phone}
                            amount={Number(p.amount)}
                            paidAt={p.processed_at ?? p.requested_at}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
                <PayoutActions payoutId={p.id} status={p.status} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
