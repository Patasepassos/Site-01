import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPartnerWhatsappCode } from "@/lib/partners/whatsapp-verification";
import { normalizeToE164BR } from "@/lib/partners/phone";

/** Envia (ou reenvia) o código de verificação pro WhatsApp ATUAL do parceiro autenticado. */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabaseAdmin.from("profiles").select("phone").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("partners").select("id, whatsapp_verified").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  if (partner.whatsapp_verified) {
    return NextResponse.json({ error: "Seu WhatsApp já está verificado." }, { status: 400 });
  }

  const phoneE164 = profile?.phone ? normalizeToE164BR(profile.phone) : null;
  if (!phoneE164) return NextResponse.json({ error: "Cadastre um número de WhatsApp válido antes de verificar." }, { status: 400 });

  const outcome = await sendPartnerWhatsappCode(supabaseAdmin, partner.id, phoneE164, { id: user.id, role: "partner" });
  if (!outcome.sent) {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.rateLimited ? 429 : 500 });
  }

  return NextResponse.json({ success: true });
}
