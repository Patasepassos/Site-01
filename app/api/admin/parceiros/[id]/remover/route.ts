import { NextResponse } from "next/server";
import { requireOwnerUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";

const CONFIRM_PHRASE = "REMOVER PARCEIRO";

/**
 * Remoção de parceiro pelo admin chefe -- mesmo princípio da autoexclusão em
 * /api/parceiros/excluir (nunca DELETE de linha, porque sales/commissions
 * têm histórico financeiro vinculado): bane o login no Supabase Auth e
 * anonimiza PII, mantendo o histórico. Só is_owner chama essa rota; é uma
 * ação sobre a conta de outra pessoa, não autoexclusão, por isso exige a
 * mesma frase de confirmação digitada.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireOwnerUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

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
    .select("id, profile_id, account_deleted_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
  if (partner.account_deleted_at) {
    return NextResponse.json({ error: "Este parceiro já foi removido." }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ full_name: "Conta removida", phone: "" })
    .eq("id", partner.profile_id);
  if (profileError) {
    return NextResponse.json({ error: "Não foi possível remover a conta." }, { status: 500 });
  }

  const { error: partnerError } = await supabaseAdmin
    .from("partners")
    .update({
      status: "blocked",
      account_deleted_at: new Date().toISOString(),
      cpf_cnpj: "00000000000",
      pix_key: "conta-removida",
      cpf_status: "pending",
      cpf_verification_reason: null,
      cpf_verification_hash: null,
    })
    .eq("id", partner.id);
  if (partnerError) {
    return NextResponse.json({ error: "Não foi possível remover a conta." }, { status: 500 });
  }

  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(partner.profile_id, {
    ban_duration: "876000h",
  });
  if (banError) {
    console.error("Falha ao banir usuário na remoção pelo admin:", describeError(banError));
  }

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "partner_removed_by_admin",
    entityType: "partner",
    entityId: partner.id,
  });

  return NextResponse.json({ success: true });
}
