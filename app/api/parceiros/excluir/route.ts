import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";

const CONFIRM_PHRASE = "EXCLUIR CONTA";

/**
 * Autoexclusão de conta do próprio parceiro autenticado -- nunca aceita um
 * id de parceiro alvo (sempre o dono da sessão), pra impedir que um parceiro
 * exclua a conta de outro. Nunca faz DELETE de linha: profile_id/partner_id
 * têm "on delete cascade" até vendas/comissões/saques, então apagar de
 * verdade apagaria histórico financeiro. Em vez disso: bane o usuário no
 * Supabase Auth (impede login) e anonimiza PII, mantendo o histórico.
 */
export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  let body: { confirm?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  if (body.confirm !== CONFIRM_PHRASE) {
    return NextResponse.json({ error: "Confirmação inválida." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id, account_deleted_at")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
  if (partner.account_deleted_at) {
    return NextResponse.json({ error: "Esta conta já foi excluída." }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ full_name: "Conta excluída", phone: "" })
    .eq("id", user.id);
  if (profileError) {
    console.error(`[excluir-conta] update em profiles falhou: code=${profileError.code ?? "?"} message=${profileError.message}`);
    return NextResponse.json({ error: "Não foi possível excluir a conta. Tente novamente." }, { status: 500 });
  }

  const { error: partnerError } = await supabaseAdmin
    .from("partners")
    .update({
      status: "blocked",
      account_deleted_at: new Date().toISOString(),
      cpf_cnpj: "00000000000",
      pix_key: "conta-excluida",
      cpf_status: "pending",
      cpf_verification_reason: null,
      cpf_verification_hash: null,
    })
    .eq("id", partner.id);
  if (partnerError) {
    console.error(`[excluir-conta] update em partners falhou: code=${partnerError.code ?? "?"} message=${partnerError.message}`);
    return NextResponse.json({ error: "Não foi possível excluir a conta. Tente novamente." }, { status: 500 });
  }

  // Bane o usuário no Auth -- impede qualquer novo login/refresh com essa
  // conta, sem apagar a linha de auth.users (evitaria o cascade acima).
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { ban_duration: "876000h" });
  if (banError) {
    console.error("Falha ao banir usuário após autoexclusão:", describeError(banError));
  }

  await logAudit(supabaseAdmin, {
    actorId: user.id,
    actorRole: "partner",
    action: "partner_account_deleted",
    entityType: "partner",
    entityId: partner.id,
  });

  return NextResponse.json({ success: true });
}
