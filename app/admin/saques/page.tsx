import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PAYOUT_STATUS_LABELS, formatBRL, formatDate } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import PayoutActions from "@/components/admin/PayoutActions";

export default async function AdminSaquesPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: payouts } = await supabaseAdmin
    .from("payouts")
    .select("*")
    .order("requested_at", { ascending: false });

  const partnerIds = Array.from(new Set((payouts ?? []).map((p) => p.partner_id)));
  const { data: partners } = partnerIds.length
    ? await supabaseAdmin.from("partners").select("*").in("id", partnerIds)
    : { data: [] };

  const profileIds = (partners ?? []).map((p) => p.profile_id);
  const { data: profiles } = profileIds.length
    ? await supabaseAdmin.from("profiles").select("*").in("id", profileIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const partnerById = new Map((partners ?? []).map((p) => [p.id, p]));

  return (
    <div className="portal-card">
      <h2>Saques</h2>
      <p style={{ marginBottom: 4 }}>Pagamento via Pix é sempre manual — nada sai automático daqui.</p>

      <div style={{ marginTop: 14 }}>
        {!payouts || payouts.length === 0 ? (
          <p>Nenhum saque solicitado ainda.</p>
        ) : (
          payouts.map((p) => {
            const partner = partnerById.get(p.partner_id);
            const partnerName = partner ? profileById.get(partner.profile_id)?.full_name : undefined;
            return (
              <div className="referral-row" key={p.id} style={{ alignItems: "flex-start" }}>
                <div>
                  <div className="rr-id">{partnerName ?? "Parceiro removido"} · {formatBRL(p.amount)}</div>
                  <div className="rr-meta">
                    Pix ({maskSecret(p.pix_key_snapshot)}) · solicitado em {formatDate(p.requested_at)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`status-pill ${p.status}`}>{PAYOUT_STATUS_LABELS[p.status]}</span>
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
