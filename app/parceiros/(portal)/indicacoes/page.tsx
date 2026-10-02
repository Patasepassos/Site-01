import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SERVICE_LABELS, formatCustomerLabel, formatDate, getUnifiedStatus } from "@/lib/partners/labels";
import ReferralJourney from "@/components/portal/ReferralJourney";
import AddReferralForm from "@/components/portal/AddReferralForm";
import type { CommissionRow, CommissionStatus } from "@/lib/supabase/types";

const COMMISSION_PRIORITY: Record<CommissionStatus, number> = { paga: 3, liberada: 2, bloqueada: 1 };

export default async function IndicacoesPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  // Nunca seleciona customer_name/customer_phone aqui — esses dados são só
  // pro admin. E nunca consulta `sales` — o RLS já bloqueia isso pro
  // parceiro; o status de pagamento é inferido via `commissions`, que só
  // existe depois que o admin confirma o pagamento.
  const [{ data: customers, error: customersError }, { data: commissions, error: commissionsError }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, sequence_number, service, status, coupon_used, created_at, updated_at, closed_at, partner_id")
      .eq("partner_id", partnerId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("commissions").select("*").eq("partner_id", partnerId),
  ]);

  // Achado em produção: essa query podia falhar (ex.: coluna ainda não
  // migrada no banco) e o código assumia lista vazia em silêncio, mostrando
  // "você ainda não tem clientes indicados" pra quem na verdade tinha --
  // sem nenhum log nem aviso. Agora qualquer erro aqui fica registrado e a
  // tela avisa que falhou, em vez de mentir dizendo que está vazia.
  if (customersError) {
    console.error("[indicacoes-page] erro ao buscar customers", { partnerId, error: customersError });
  }
  if (commissionsError) {
    console.error("[indicacoes-page] erro ao buscar commissions", { partnerId, error: commissionsError });
  }
  const loadFailed = Boolean(customersError);

  const bestCommissionByCustomerId = new Map<string, CommissionRow>();
  for (const c of commissions ?? []) {
    if (!c.customer_id) continue;
    const existingBest = bestCommissionByCustomerId.get(c.customer_id);
    if (!existingBest || COMMISSION_PRIORITY[c.status] > COMMISSION_PRIORITY[existingBest.status]) {
      bestCommissionByCustomerId.set(c.customer_id, c);
    }
  }

  return (
    <div className="portal-card">
      <h2>Minhas indicações</h2>
      {loadFailed ? (
        <p style={{ marginBottom: 4, color: "#C0392B" }}>
          Não conseguimos carregar suas indicações agora. Tente recarregar a página em instantes.
        </p>
      ) : (
        <p style={{ marginBottom: 4 }}>
          {customers?.length ?? 0} {customers?.length === 1 ? "cliente indicado" : "clientes indicados"}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <AddReferralForm />
        {loadFailed ? null : !customers || customers.length === 0 ? (
          <p>Você ainda não tem clientes indicados. Registre acima ou compartilhe seu cupom pra começar!</p>
        ) : (
          customers.map((c) => {
            const commission = bestCommissionByCustomerId.get(c.id);
            const unified = getUnifiedStatus({
              customerStatus: c.status,
              paymentStatus: c.status === "fechado" ? (commission ? "confirmado" : "pendente") : undefined,
              commissionStatus: commission?.status,
            });
            const isCancelled = c.status === "cancelado" || c.status === "nao_convertido";
            const stage: 1 | 2 | 3 =
              c.status !== "fechado" ? 1 : commission?.status === "liberada" || commission?.status === "paga" ? 3 : 2;
            return (
              <div className="referral-row" key={c.id}>
                <div>
                  <div className="rr-id">{formatCustomerLabel(c.sequence_number)}</div>
                  <div className="rr-meta">
                    {SERVICE_LABELS[c.service]} · {formatDate(c.created_at)} · cupom {c.coupon_used}
                  </div>
                  {!isCancelled && <ReferralJourney stage={stage} />}
                </div>
                <span className={`status-pill tone-${unified.tone}`}>{unified.emoji} {unified.label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
