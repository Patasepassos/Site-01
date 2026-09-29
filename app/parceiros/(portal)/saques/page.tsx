import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPartnerBalance } from "@/lib/partners/balance";
import { PAYOUT_STATUS_LABELS, formatDate } from "@/lib/partners/labels";
import { maskSecret } from "@/lib/partners/mask";
import RequestPayoutButton from "@/components/portal/RequestPayoutButton";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function SaquesPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  const [balance, { data: payouts }] = await Promise.all([
    getPartnerBalance(supabase, partnerId),
    supabase.from("payouts").select("*").eq("partner_id", partnerId).order("requested_at", { ascending: false }),
  ]);

  return (
    <>
      <div className="portal-card">
        <h2>Chave Pix</h2>
        <p style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{maskSecret(current.partner.pix_key)}</p>
        <p style={{ marginTop: 10, fontSize: 13 }}>
          Para alterar sua chave Pix, acesse <b>Perfil</b>.
        </p>
      </div>

      <div className="portal-card">
        <h2>Saldo disponível</h2>
        <div className="lock-amount" style={{ margin: "6px 0 16px" }}>{formatBRL(balance.disponivel)}</div>
        <RequestPayoutButton disponivel={balance.disponivel} />
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
