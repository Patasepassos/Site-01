import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { getPartnerBalance } from "@/lib/partners/balance";

const MIN_WITHDRAWAL = 20;

/**
 * Solicita o saque do saldo disponível. O valor NUNCA vem do corpo da
 * requisição — é sempre recalculado aqui a partir das comissões liberadas
 * menos saques já em andamento, exatamente como em /parceiros/saldo.
 */
export async function POST() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ error: "Parceiro não está ativo." }, { status: 403 });
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
    actorId: user.id,
    actorRole: "partner",
    action: "payout_requested",
    entityType: "payout",
    entityId: payout.id,
    metadata: { amount: payout.amount },
  });

  return NextResponse.json({ success: true });
}
