import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PAYOUT_STATUS_LABELS, formatBRL, formatDate } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import PayoutActions from "@/components/admin/PayoutActions";
import ProofLink from "@/components/ProofLink";
import SendReceiptButton from "@/components/admin/SendReceiptButton";
import type { CommissionStatus, PayoutStatus } from "@/lib/supabase/types";

const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  bloqueada: "Bloqueada",
  liberada: "Liberada",
  paga: "Paga",
};

const TABS: { key: PayoutStatus | "pendentes" | "all"; label: string }[] = [
  { key: "pendentes", label: "Pendentes" },
  { key: "pago", label: "Pagas" },
  { key: "all", label: "Todas" },
];

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const activeTab = (searchParams.status ?? "pendentes") as PayoutStatus | "pendentes" | "all";
  const supabaseAdmin = createSupabaseAdminClient();

  let payoutsQuery = supabaseAdmin.from("payouts").select("*").order("requested_at", { ascending: false });
  if (activeTab === "pendentes") payoutsQuery = payoutsQuery.in("status", ["solicitado", "em_analise", "aprovado"]);
  else if (activeTab !== "all") payoutsQuery = payoutsQuery.eq("status", activeTab);

  const [{ data: payouts }, { data: commissions }] = await Promise.all([
    payoutsQuery,
    supabaseAdmin.from("commissions").select("*").order("created_at", { ascending: false }).limit(300),
  ]);

  const partnerIds = Array.from(
    new Set([...(payouts ?? []).map((p) => p.partner_id), ...(commissions ?? []).map((c) => c.partner_id)])
  );
  const ruleIds = Array.from(new Set((commissions ?? []).map((c) => c.rule_id)));

  const [{ data: partners }, { data: rules }] = await Promise.all([
    partnerIds.length ? supabaseAdmin.from("partners").select("*").in("id", partnerIds) : Promise.resolve({ data: [] }),
    ruleIds.length
      ? supabaseAdmin.from("commission_rules").select("*").in("id", ruleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const processedByIds = Array.from(
    new Set((payouts ?? []).map((p) => p.processed_by).filter((id): id is string => Boolean(id)))
  );
  const profileIds = Array.from(new Set([...(partners ?? []).map((p) => p.profile_id), ...processedByIds]));
  const { data: profiles } = profileIds.length
    ? await supabaseAdmin.from("profiles").select("*").in("id", profileIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const partnerById = new Map((partners ?? []).map((p) => [p.id, p]));
  const ruleById = new Map((rules ?? []).map((r) => [r.id, r]));

  return (
    <>
      <div className="portal-card">
        <h2>Saques</h2>
        <p style={{ marginBottom: 4 }}>Pagamento é sempre manual e exige comprovante anexado — nada sai automático daqui.</p>

        <div className="admin-tabs">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/financeiro?status=${tab.key}`}
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

      <div className="portal-card">
        <h2>Comissões geradas</h2>
        <p style={{ marginBottom: 4 }}>
          Calculadas automaticamente pelo servidor sempre que uma venda é fechada. Extrato somente leitura.
        </p>

        <div style={{ marginTop: 14 }}>
          {!commissions || commissions.length === 0 ? (
            <p>Nenhuma comissão gerada ainda.</p>
          ) : (
            commissions.map((c) => {
              const partner = partnerById.get(c.partner_id);
              const partnerName = partner ? profileById.get(partner.profile_id)?.full_name : undefined;
              const rule = ruleById.get(c.rule_id);
              return (
                <div className="referral-row" key={c.id}>
                  <div>
                    <div className="rr-id">{partnerName ?? "Parceiro removido"} · {formatBRL(c.amount)}</div>
                    <div className="rr-meta">
                      {rule?.name ?? "Regra removida"} · período {c.period} · gerada em {formatDate(c.created_at)}
                    </div>
                  </div>
                  <span className={`status-pill ${c.status}`}>{COMMISSION_STATUS_LABELS[c.status]}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
