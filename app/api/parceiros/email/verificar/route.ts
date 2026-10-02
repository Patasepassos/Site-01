import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPartnerEmailOtp } from "@/lib/partners/email-verification";

type VerificarBody = { code?: unknown };

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  let body: VerificarBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Digite os 6 dígitos do código." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: partner } = await supabaseAdmin.from("partners").select("id").eq("profile_id", user.id).maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const outcome = await verifyPartnerEmailOtp(supabaseAdmin, partner.id, code, { id: user.id, role: "partner" });
  if (outcome.status !== "verified") {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.status === "rate_limited" ? 429 : 400 });
  }

  return NextResponse.json({ success: true });
}
