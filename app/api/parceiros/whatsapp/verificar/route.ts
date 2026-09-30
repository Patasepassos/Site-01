import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkPartnerWhatsappCode } from "@/lib/partners/whatsapp-verification";
import { normalizeToE164BR } from "@/lib/partners/phone";

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
  if (!/^\d{4,10}$/.test(code)) return NextResponse.json({ error: "Digite o código recebido." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabaseAdmin.from("profiles").select("phone").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("partners").select("id").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const phoneE164 = profile?.phone ? normalizeToE164BR(profile.phone) : null;
  if (!phoneE164) return NextResponse.json({ error: "Cadastre um número de WhatsApp válido antes de verificar." }, { status: 400 });

  const outcome = await checkPartnerWhatsappCode(supabaseAdmin, partner.id, phoneE164, code, {
    id: user.id,
    role: "partner",
  });
  if (outcome.status !== "verified") {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.status === "rate_limited" ? 429 : 400 });
  }

  return NextResponse.json({ success: true });
}
