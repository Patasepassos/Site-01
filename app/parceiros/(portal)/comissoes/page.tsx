import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ComissoesPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  // getPartnerProgress lê `sales`, reservada ao admin pelo RLS — mesmo
  // motivo do dashboard.
  const [progress, { data: commissions }] = await Promise.all([
    getPartnerProgress(createSupabaseAdminClient(), partnerId),
    supabase
      .from("commissions")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <div className={`portal-card lock-card${progress.locked ? "" : " unlocked"}`}>
        <div className="lock-icon">{progress.locked ? "🔒" : "🔓"}</div>
        <h2>{progress.locked ? "Comissão bloqueada" : "Comissão liberada"}</h2>
        <p>
          {progress.progress} / {progress.goal} clientes · {progress.message}
        </p>
      </div>

      <div className="portal-card">
        <h2>Minhas comissões</h2>
        {!commissions || commissions.length === 0 ? (
          <p style={{ marginTop: 8 }}>
            Nenhuma comissão registrada ainda. Assim que suas indicações forem confirmadas pela
            Patas &amp; Passos, elas aparecem aqui.
          </p>
        ) : (
          <div style={{ marginTop: 14 }}>
            {commissions.map((c) => (
              <div className="referral-row" key={c.id}>
                <div>
                  <div className="rr-id">{c.period}</div>
                  <div className="rr-meta">
                    {c.status === "bloqueada"
                      ? "Comissão bloqueada"
                      : c.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
                <span className={`status-pill ${c.status}`}>
                  {c.status === "bloqueada" ? "Bloqueada" : c.status === "liberada" ? "Liberada" : "Paga"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
