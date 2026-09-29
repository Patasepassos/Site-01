import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPartnerBalance } from "@/lib/partners/balance";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function SaldoPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const balance = await getPartnerBalance(supabase, current.partner.id);

  return (
    <div className="portal-card">
      <h2>Meu saldo</h2>

      <div className="portal-stat-grid" style={{ marginTop: 14 }}>
        <div className="portal-stat">
          <span className="label">Disponível</span>
          <span className="num">{formatBRL(balance.disponivel)}</span>
        </div>
        <div className="portal-stat">
          <span className="label">Pendente</span>
          <span className="num">{formatBRL(balance.pendente)}</span>
        </div>
      </div>
      <div className="portal-stat" style={{ marginTop: 12 }}>
        <span className="label">Total já recebido</span>
        <span className="num">{formatBRL(balance.recebido)}</span>
      </div>

      <p style={{ marginTop: 16, fontSize: 13 }}>
        Quer sacar seu saldo disponível? Acesse <b>Saques</b> no menu.
      </p>
    </div>
  );
}
