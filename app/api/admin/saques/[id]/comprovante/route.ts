import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 300;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: payout } = await supabaseAdmin.from("payouts").select("proof_path").eq("id", params.id).maybeSingle();
  if (!payout?.proof_path) return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });

  const { data, error } = await supabaseAdmin.storage
    .from("comprovantes")
    .createSignedUrl(payout.proof_path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return NextResponse.json({ error: "Não foi possível gerar o link." }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
