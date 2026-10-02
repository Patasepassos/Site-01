import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getBearerToken } from "@/lib/supabase/bearer";
import { getCurrentPartnerFromBearer } from "@/lib/partners/session";
import { logAudit } from "@/lib/partners/audit";
import { getPartnerBalance } from "@/lib/partners/balance";
import { notifyAdmin } from "@/lib/email/admin-notify";
import { describeError } from "@/lib/partners/errors";
import type { Database, PartnerRow } from "@/lib/supabase/types";

const MIN_WITHDRAWAL = 20;

/**
 * Solicita o saque do saldo disponível. O valor NUNCA vem do corpo da
 * requisição — é sempre recalculado aqui a partir das comissões liberadas
 * menos saques já em andamento, exatamente como em /parceiros/financeiro.
 *
 * Aceita tanto a sessão via cookie (site web) quanto um token
 * "Authorization: Bearer" (app mobile) — o valor e a elegibilidade são
 * sempre recalculados no servidor nos dois casos.
 */
export async function POST(request: Request) {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  let partner: PartnerRow | null;

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const current = await getCurrentPartnerFromBearer(bearerToken);
    if (!current) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    supabase = current.supabase;
    userId = current.userId;
    partner = current.partner;
  } else {
    supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    userId = user.id;
    const { data: p } = await supabase.from("partners").select("*").eq("profile_id", user.id).maybeSingle();
    partner = p;
  }

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ error: "Parceiro não está ativo." }, { status: 403 });
  }
  if (!partner.payout_eligible) {
    return NextResponse.json(
      { error: "Seus dados ainda precisam ser confirmados antes de solicitar saque. Veja o status em Perfil." },
      { status: 403 }
    );
  }

  const { disponivel } = await getPartnerBalance(supabase, partner.id);

  if (disponivel < MIN_WITHDRAWAL) {
    return NextResponse.json(
      { error: `Saldo mínimo para saque é de R$ ${MIN_WITHDRAWAL.toFixed(2)}.` },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: payout, error } = await supabaseAdmin
    .from("payouts")
    .insert({
      partner_id: partner.id,
      amount: disponivel,
      pix_key_snapshot: partner.pix_key,
      status: "solicitado",
    })
    .select("id, amount")
    .single();

  if (error || !payout) {
    return NextResponse.json({ error: "Não foi possível registrar o saque." }, { status: 500 });
  }

  await logAudit(supabaseAdmin, {
    actorId: userId,
    actorRole: "partner",
    action: "payout_requested",
    entityType: "payout",
    entityId: payout.id,
    metadata: { amount: payout.amount },
  });

  try {
    await notifyAdmin({
      subject: "💰 Nova solicitação de saque",
      html: `<p>Um parceiro solicitou saque.</p>
<p><strong>Cupom do parceiro:</strong> ${partner.coupon_code}<br/>
<strong>Valor:</strong> R$ ${Number(payout.amount).toFixed(2).replace(".", ",")}</p>
<p>Revise e aprove em /admin/saques.</p>`,
    });
  } catch (err) {
    console.error("Falha ao notificar admin sobre solicitação de saque:", describeError(err));
  }

  return NextResponse.json({ success: true });
}
