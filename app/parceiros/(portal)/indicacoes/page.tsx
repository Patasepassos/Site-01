import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CUSTOMER_STATUS_LABELS, SERVICE_LABELS, formatCustomerLabel, formatDate } from "@/lib/partners/labels";

export default async function IndicacoesPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("partner_id", current.partner.id)
    .order("created_at", { ascending: false });

  return (
    <div className="portal-card">
      <h2>Minhas indicações</h2>
      <p style={{ marginBottom: 4 }}>
        {customers?.length ?? 0} {customers?.length === 1 ? "cliente indicado" : "clientes indicados"}
      </p>

      <div style={{ marginTop: 14 }}>
        {!customers || customers.length === 0 ? (
          <p>Você ainda não tem clientes indicados. Compartilhe seu cupom pra começar!</p>
        ) : (
          customers.map((c) => (
            <div className="referral-row" key={c.id}>
              <div>
                <div className="rr-id">{formatCustomerLabel(c.sequence_number)}</div>
                <div className="rr-meta">
                  {SERVICE_LABELS[c.service]} · {formatDate(c.created_at)} · cupom {c.coupon_used}
                </div>
              </div>
              <span className={`status-pill ${c.status}`}>{CUSTOMER_STATUS_LABELS[c.status]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
