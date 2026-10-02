import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { getPartnerRankInfo } from "@/lib/partners/ranks";
import { getPartnerServiceAreaNote } from "@/lib/partners/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import RankGrid from "@/components/portal/RankGrid";
import RankUpWatcher from "@/components/portal/RankUpWatcher";
import ServiceShareCards from "@/components/portal/ServiceShareCards";
import { RANK_IMAGE } from "@/lib/partners/rankTheme";

export default async function DashboardPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const partnerId = current.partner.id;
  const firstName = current.profile.full_name.split(" ")[0];

  // getPartnerProgress precisa ler `sales` (payment_status), tabela que o
  // RLS reserva só pro admin — por isso usa o client de servidor aqui. A
  // função já garante que o retorno nunca inclui valor de venda, só contagem
  // e o total liberado (quando já desbloqueado).
  const supabaseAdmin = createSupabaseAdminClient();

  const [{ count: totalIndicados }, { count: totalFechados }, progress, rank, serviceAreaNote] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("partner_id", partnerId),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "fechado"),
    getPartnerProgress(supabaseAdmin, partnerId),
    getPartnerRankInfo(supabaseAdmin, partnerId),
    getPartnerServiceAreaNote(supabase),
  ]);

  return (
    <>
      {rank.currentTier && (
        <RankUpWatcher
          partnerId={partnerId}
          currentTierKey={rank.currentTier.key}
          currentTierLabel={rank.currentTier.label}
          currentTierEmoji={rank.currentTier.emoji}
          sortOrder={rank.currentTier.sort_order}
        />
      )}

      <section className="pp-hero">
        <div className="pp-hero-glow" aria-hidden="true" />
        <div className="pp-hero-tag">
          {rank.currentTier ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rank.currentTier.photo_url || RANK_IMAGE[rank.currentTier.key]}
                alt=""
                className="rank-tag-emblem"
              />
              Nível atual: {rank.currentTier.label}
            </>
          ) : (
            "🐾 Bem-vindo"
          )}
        </div>
        <h1 className="pp-hero-title">Continue assim, {firstName}!</h1>
        <p className="pp-hero-desc">
          Você já tem <b>{totalFechados ?? 0}</b> {(totalFechados ?? 0) === 1 ? "venda fechada" : "vendas fechadas"} e{" "}
          <b>{rank.activeClients}</b> {rank.activeClients === 1 ? "cliente ativo" : "clientes ativos"}. Continue
          divulgando seu cupom pra evoluir de nível.
        </p>

        {rank.nextTier && rank.progressToNext !== null && (
          <div className="pp-hero-progress">
            <div className="pp-hero-progress-top">
              <span>
                Progresso para{" "}
                <b>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rank.nextTier.photo_url || RANK_IMAGE[rank.nextTier.key]}
                    alt=""
                    className="rank-tag-emblem"
                  />{" "}
                  {rank.nextTier.label}
                </b>
              </span>
              <span>
                <b>{rank.activeClients}</b> de {rank.nextTier.min_clients}
              </span>
            </div>
            <div className="rank-progress-bg">
              <div className="rank-progress-fill" style={{ width: `${Math.round(rank.progressToNext * 100)}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="portal-card">
        <h2>🏆 Estrutura de níveis</h2>
        <RankGrid tiers={rank.tiers} activeClients={rank.activeClients} currentTierId={rank.currentTier?.id ?? null} />
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

      <div className="portal-card">
        <h2>Seus links de divulgação rápidos</h2>
        <p style={{ marginBottom: 4 }}>Copie seu cupom já pensando no serviço que você vai indicar.</p>
        <ServiceShareCards couponCode={current.partner.coupon_code} />
      </div>

      <div className="portal-card">
        <h2>📍 Área de atendimento</h2>
        <p style={{ marginTop: 6, fontSize: 14 }}>{serviceAreaNote}</p>
      </div>
    </>
  );
}
