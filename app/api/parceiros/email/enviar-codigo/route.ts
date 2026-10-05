import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPartnerEmailOtp } from "@/lib/partners/email-verification";

/** Envia (ou reenvia) o código de verificação pro e-mail ATUAL do parceiro autenticado. */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id, email_verified")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  if (partner.email_verified) {
    return NextResponse.json({ error: "Seu e-mail já está verificado." }, { status: 400 });
  }

  const outcome = await sendPartnerEmailOtp(supabaseAdmin, partner.id, user.email, { id: user.id, role: "partner" });
  if (!outcome.sent) {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.rateLimited ? 429 : 500 });
  }

  return NextResponse.json({ success: true });
}
