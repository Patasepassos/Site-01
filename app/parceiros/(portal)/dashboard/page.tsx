import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CouponBox from "@/components/portal/CouponBox";

export default async function DashboardPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  const [{ count: totalIndicados }, { count: totalFechados }, progress] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("partner_id", partnerId),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "fechado"),
    getPartnerProgress(supabase, partnerId),
  ]);

  const dots = Array.from({ length: Math.max(progress.goal, 1) }, (_, i) => i < progress.progress);
  const journeyNodes: React.ReactNode[] = [];
  dots.forEach((done, i) => {
    if (i > 0) {
      journeyNodes.push(<div className={`journey-line${dots[i - 1] ? " done" : ""}`} key={`line-${i}`} />);
    }
    const isLast = i === dots.length - 1;
    journeyNodes.push(
      <div key={`dot-${i}`} className={`journey-dot${done ? " done" : ""}${isLast && !progress.locked ? " final" : ""}`}>
        {isLast && !progress.locked ? "🔓" : done ? "✓" : i + 1}
      </div>
    );
  });

  return (
    <>
      <div className="portal-card">
        <h2>🐾 Sua jornada</h2>
        <div className="journey">{journeyNodes}</div>
        <p style={{ textAlign: "center", fontWeight: 700, marginTop: 6 }}>
          {progress.progress} / {progress.goal} clientes
        </p>
        <p style={{ textAlign: "center" }}>{progress.message}</p>
      </div>

      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span className="label">🐾 Indicados</span>
          <span className="num">{totalIndicados ?? 0}</span>
        </div>
        <div className="portal-stat">
          <span className="label">⭐ Fecharam</span>
          <span className="num">{totalFechados ?? 0}</span>
        </div>
      </div>

      <div className={`portal-card lock-card${progress.locked ? "" : " unlocked"}`}>
        <div className="lock-icon">{progress.locked ? "🔒" : "🔓"}</div>
        {progress.locked ? (
          <>
            <h2>Comissão bloqueada</h2>
            <p>{progress.message}</p>
          </>
        ) : (
          <>
            <h2>Comissão liberada!</h2>
            <div className="lock-amount">
              {(progress.unlockedAmount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p>Parabéns! Você atingiu sua meta de {progress.goal} clientes.</p>
          </>
        )}
      </div>

      <CouponBox couponCode={current.partner.coupon_code} />
    </>
  );
}
