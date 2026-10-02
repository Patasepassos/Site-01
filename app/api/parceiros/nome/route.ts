import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { onlyDigits } from "@/lib/partners/validation";

type NomeBody = { fullName?: unknown };

/**
 * Corrige o nome completo do PARCEIRO AUTENTICADO. Só ele pode alterar o
 * próprio nome (nunca recebe um ID de parceiro no corpo da requisição).
 *
 * Como o nome entra na verificação real de CPF (comparado contra o nome
 * oficial retornado pela API), trocar o nome invalida qualquer verificação
 * de CPF anterior — senão um resultado "verificado" ficaria valendo pra um
 * nome que não é mais o cadastrado.
 */
export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  let body: NomeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 3) return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabaseAdmin.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("partners").select("id, cpf_cnpj, cpf_status").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!profile || !partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const nameChanged = profile.full_name !== fullName;

  const { error: profileError } = await supabaseAdmin.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (profileError) return NextResponse.json({ error: "Não foi possível salvar o nome." }, { status: 500 });

  const isCpf = onlyDigits(partner.cpf_cnpj).length === 11;
  if (nameChanged && isCpf && partner.cpf_status !== "pending") {
    await supabaseAdmin
      .from("partners")
      .update({ cpf_status: "pending", cpf_verified_at: null, cpf_verification_reason: null, cpf_verification_hash: null })
      .eq("id", partner.id);
  }

  await logAudit(supabaseAdmin, {
    actorId: user.id,
    actorRole: "partner",
    action: "partner_name_updated",
    entityType: "partner",
    entityId: partner.id,
    metadata: { nameChanged },
  });

  if (nameChanged) {
    await recomputePartnerEligibility(supabaseAdmin, partner.id, { id: user.id, role: "partner" });
  }

  return NextResponse.json({ success: true });
}
