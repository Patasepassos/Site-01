import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { getPartnerBalance } from "@/lib/partners/balance";
import { PAYOUT_STATUS_LABELS, formatDate, formatBRL } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import RequestPayoutButton from "@/components/portal/RequestPayoutButton";
import ProofLink from "@/components/ProofLink";

export default async function FinanceiroPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  // getPartnerProgress lê `sales`, reservada ao admin pelo RLS.
  const [progress, balance, { data: commissions }, { data: payouts }] = await Promise.all([
    getPartnerProgress(createSupabaseAdminClient(), partnerId),
    getPartnerBalance(supabase, partnerId),
    supabase.from("commissions").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false }),
    supabase.from("payouts").select("*").eq("partner_id", partnerId).order("requested_at", { ascending: false }),
  ]);

  return (
    <>
      <div className="portal-card">
        <h2>Como funciona o seu financeiro?</h2>
        <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7 }}>
          <b>Indicação</b> → <b>Cliente convertido</b> → <b>Comissão registrada</b> → <b>Comissão
          liberada</b> → <b>Você solicita o saque</b> → <b>Patas &amp; Passos paga via Pix</b>.
        </p>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink-soft)" }}>
          Cada venda confirmada gera uma comissão. Ela fica <b>bloqueada</b> até você atingir a meta
          de clientes ativos da sua regra — ao bater a meta, todas as comissões daquele período são{" "}
          <b>liberadas</b> de uma vez. Só então o valor entra no seu <b>saldo disponível</b> pra
          saque. O pagamento é sempre feito manualmente via Pix pela Patas &amp; Passos, com
          comprovante anexado assim que confirmado.
        </p>
      </div>

      <div className={`portal-card lock-card${progress.locked ? "" : " unlocked"}`}>
        <div className="lock-icon">{progress.locked ? "🔒" : "🔓"}</div>
        <h2>{progress.locked ? "Comissão bloqueada" : "Comissão liberada"}</h2>
        <p>
          {progress.progress} / {progress.goal} clientes · {progress.message}
        </p>
      </div>

      <div className="portal-card">
        <h2>Saldo</h2>
        <div className="portal-stat-grid" style={{ marginTop: 14 }}>
          <div className="portal-stat">
            <span className="label">Disponível</span>
            <span className="num">{formatBRL(balance.disponivel)}</span>
          </div>
          <div className="portal-stat">
            <span className="label">Pendente (saque em andamento)</span>
            <span className="num">{formatBRL(balance.pendente)}</span>
          </div>
        </div>
        <div className="portal-stat" style={{ marginTop: 12 }}>
          <span className="label">Total já recebido</span>
          <span className="num">{formatBRL(balance.recebido)}</span>
        </div>
      </div>

      <div className="portal-card">
        <h2>Chave Pix e saque</h2>
        <p style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{maskSecret(current.partner.pix_key)}</p>
        <p style={{ marginTop: 6, fontSize: 13 }}>
          Para alterar sua chave Pix, acesse <b>Perfil</b>.
        </p>
        <div style={{ marginTop: 14 }}>
          <RequestPayoutButton disponivel={balance.disponivel} />
        </div>
      </div>

      <div className="portal-card">
        <h2>Comissões geradas</h2>
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

      <div className="portal-card">
        <h2>Histórico de saques</h2>
        {!payouts || payouts.length === 0 ? (
          <p style={{ marginTop: 8 }}>Nenhum saque solicitado ainda.</p>
        ) : (
          <div style={{ marginTop: 14 }}>
            {payouts.map((p) => (
              <div className="referral-row" key={p.id}>
                <div>
                  <div className="rr-id">{formatBRL(p.amount)}</div>
                  <div className="rr-meta">{formatDate(p.requested_at)}</div>
                  {p.status === "pago" && p.proof_path && (
                    <div style={{ marginTop: 6 }}>
                      <ProofLink endpoint={`/api/parceiros/saques/${p.id}/comprovante`} />
                    </div>
                  )}
                </div>
                <span className={`status-pill ${p.status}`}>{PAYOUT_STATUS_LABELS[p.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
