import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 300;

/** Só gera o link se o saque pertencer ao parceiro logado. */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { data: partner } = await supabase.from("partners").select("id").eq("profile_id", user.id).maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: payout } = await supabaseAdmin
    .from("payouts")
    .select("proof_path, partner_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!payout || payout.partner_id !== partner.id) {
    return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });
  }
  if (!payout.proof_path) return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });

  const { data, error } = await supabaseAdmin.storage
    .from("comprovantes")
    .createSignedUrl(payout.proof_path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
