import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyAndPersistPartnerCpf } from "@/lib/partners/cpf-verification";
import { describeError } from "@/lib/partners/errors";
import { onlyDigits } from "@/lib/partners/validation";

/**
 * Reverifica o CPF do PARCEIRO AUTENTICADO. Não recebe CPF, nome nem data de
 * nascimento no corpo da requisição — lê tudo direto do registro do próprio
 * parceiro no banco, então não há como alguém usar essa rota pra consultar
 * o CPF de outra pessoa.
 */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id, cpf_cnpj")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  if (onlyDigits(partner.cpf_cnpj).length !== 11) {
    return NextResponse.json(
      { error: "Verificação automática disponível apenas para CPF. CNPJ é validado pela Patas & Passos." },
      { status: 400 }
    );
  }

  try {
    const outcome = await verifyAndPersistPartnerCpf(supabaseAdmin, partner.id, { id: user.id, role: "partner" });
    if (outcome.rateLimited) {
      return NextResponse.json({ error: outcome.reason }, { status: 429 });
    }
    return NextResponse.json({ status: outcome.status, cached: outcome.cached });
  } catch (err) {
    console.error("Erro ao reverificar CPF:", describeError(err));
    return NextResponse.json({ error: "Não foi possível verificar agora. Tente novamente em instantes." }, { status: 500 });
  }
}
