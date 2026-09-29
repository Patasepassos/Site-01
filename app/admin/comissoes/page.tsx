import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDate } from "@/lib/partners/labels";
import type { CommissionStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<CommissionStatus, string> = {
  bloqueada: "Bloqueada",
  liberada: "Liberada",
  paga: "Paga",
};

export default async function AdminComissoesPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: commissions } = await supabaseAdmin
    .from("commissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const partnerIds = Array.from(new Set((commissions ?? []).map((c) => c.partner_id)));
  const ruleIds = Array.from(new Set((commissions ?? []).map((c) => c.rule_id)));

  const [{ data: partners }, { data: rules }] = await Promise.all([
    partnerIds.length
      ? supabaseAdmin.from("partners").select("*").in("id", partnerIds)
      : Promise.resolve({ data: [] }),
    ruleIds.length
      ? supabaseAdmin.from("commission_rules").select("*").in("id", ruleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileIds = (partners ?? []).map((p) => p.profile_id);
  const { data: profiles } = profileIds.length
    ? await supabaseAdmin.from("profiles").select("*").in("id", profileIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const partnerById = new Map((partners ?? []).map((p) => [p.id, p]));
  const ruleById = new Map((rules ?? []).map((r) => [r.id, r]));

  return (
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
                <span className={`status-pill ${c.status}`}>{STATUS_LABELS[c.status]}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
