import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { getPartnerRankInfo } from "@/lib/partners/ranks";
import { getPartnerServiceAreaNote } from "@/lib/partners/settings";
import { countUnreadNotifications, getPartnerNotifications } from "@/lib/partners/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import CouponBox from "@/components/portal/CouponBox";
import NotificationsCard from "@/components/portal/NotificationsCard";
import RankLadder from "@/components/portal/RankLadder";

export default async function DashboardPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;

  // getPartnerProgress precisa ler `sales` (payment_status), tabela que o
  // RLS reserva só pro admin — por isso usa o client de servidor aqui. A
  // função já garante que o retorno nunca inclui valor de venda, só contagem
  // e o total liberado (quando já desbloqueado).
  const supabaseAdmin = createSupabaseAdminClient();

  const [{ count: totalIndicados }, { count: totalFechados }, progress, rank, serviceAreaNote, notifications, unreadCount] =
    await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("partner_id", partnerId),
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partnerId)
        .eq("status", "fechado"),
      getPartnerProgress(supabaseAdmin, partnerId),
      getPartnerRankInfo(supabaseAdmin, partnerId),
      getPartnerServiceAreaNote(supabase),
      getPartnerNotifications(supabase, partnerId),
      countUnreadNotifications(supabase, partnerId),
    ]);

  return (
    <>
      <NotificationsCard partnerId={partnerId} notifications={notifications} unreadCount={unreadCount} />

      <div className="portal-card">
        <h2>🐾 Seu Rank</h2>
        {rank.currentTier ? (
          <div className="rank-badge-row">
            <div className="rank-badge">{rank.currentTier.emoji}</div>
            <div>
              <div className="rank-badge-name">{rank.currentTier.label}</div>
              <div className="rank-badge-sub">
                {rank.nextTier
                  ? `Faltam ${rank.remainingToNext} para ${rank.nextTier.emoji} ${rank.nextTier.label}`
                  : "Nível máximo alcançado!"}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 6 }}>Nenhum nível configurado ainda.</p>
        )}

        <p style={{ textAlign: "center", fontWeight: 700, margin: "4px 0" }}>
          {rank.activeClients} {rank.nextTier ? `/ ${rank.nextTier.min_clients}` : ""} clientes ativos
        </p>
        {rank.progressToNext !== null && (
          <div className="rank-progress-bg">
            <div className="rank-progress-fill" style={{ width: `${Math.round(rank.progressToNext * 100)}%` }} />
          </div>
        )}

        <RankLadder tiers={rank.tiers} activeClients={rank.activeClients} currentTierId={rank.currentTier?.id ?? null} />
        <p className="rank-disclaimer">
          Metas e benefícios configurados pela Patas &amp; Passos. O valor real de comissão segue sempre as regras
          vigentes do programa.
        </p>
      </div>

      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span className="label">🐾 Indicados</span>
          <span className="num">{totalIndicados ?? 0}</span>
        </div>
        <div className="portal-stat">
          <span className="label">⭐ Vendas fechadas</span>
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

      <div className="portal-card">
        <h2>📍 Área de atendimento</h2>
        <p style={{ marginTop: 6, fontSize: 14 }}>{serviceAreaNote}</p>
      </div>
    </>
  );
}
