import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { isValidPhone, isValidPixKey, onlyDigits, PIX_KEY_TYPES } from "@/lib/partners/validation";
import type { PixKeyType } from "@/lib/supabase/types";

type PerfilBody = {
  phone?: unknown;
  pixKey?: unknown;
  pixKeyType?: unknown;
};

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  let body: PerfilBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const pixKey = typeof body.pixKey === "string" ? body.pixKey.trim() : "";
  const pixKeyType = typeof body.pixKeyType === "string" ? (body.pixKeyType as PixKeyType) : null;

  if (!isValidPhone(phone)) return NextResponse.json({ error: "WhatsApp inválido." }, { status: 400 });
  if (!pixKeyType || !PIX_KEY_TYPES.includes(pixKeyType)) {
    return NextResponse.json({ error: "Tipo de chave Pix inválido." }, { status: 400 });
  }
  if (!isValidPixKey(pixKeyType, pixKey)) {
    return NextResponse.json({ error: "Chave Pix inválida para o tipo selecionado." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const [{ error: profileError }, { error: partnerError }] = await Promise.all([
    supabaseAdmin.from("profiles").update({ phone: onlyDigits(phone) }).eq("id", user.id),
    supabaseAdmin.from("partners").update({ pix_key: pixKey, pix_key_type: pixKeyType }).eq("id", partner.id),
  ]);

  if (profileError || partnerError) {
    return NextResponse.json({ error: "Não foi possível salvar as alterações." }, { status: 500 });
  }

  await logAudit(supabaseAdmin, {
    actorId: user.id,
    actorRole: "partner",
    action: "partner_profile_updated",
    entityType: "partner",
    entityId: partner.id,
  });

  return NextResponse.json({ success: true });
}
