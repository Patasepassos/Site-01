import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
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

  const [{ data: profile }, { data: partner }] = await Promise.all([
    supabaseAdmin.from("profiles").select("phone").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("partners").select("*").eq("profile_id", user.id).maybeSingle(),
  ]);
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const newPhoneDigits = onlyDigits(phone);
  const phoneChanged = profile?.phone !== newPhoneDigits;
  const pixChanged = partner.pix_key !== pixKey || partner.pix_key_type !== pixKeyType;

  const partnerUpdate: {
    pix_key: string;
    pix_key_type: PixKeyType;
    financial_data_status?: "pending";
    financial_data_reviewed_at?: null;
    financial_data_review_note?: null;
  } = {
    pix_key: pixKey,
    pix_key_type: pixKeyType,
  };
  // Trocar a chave Pix invalida a aprovação anterior dos dados financeiros —
  // o admin precisa revisar de novo antes de qualquer pagamento novo sair.
  if (pixChanged) {
    partnerUpdate.financial_data_status = "pending";
    partnerUpdate.financial_data_reviewed_at = null;
    partnerUpdate.financial_data_review_note = null;
  }

  const [{ error: profileError }, { error: partnerError }] = await Promise.all([
    supabaseAdmin.from("profiles").update({ phone: newPhoneDigits }).eq("id", user.id),
    supabaseAdmin.from("partners").update(partnerUpdate).eq("id", partner.id),
  ]);

  if (profileError || partnerError) {
    return NextResponse.json({ error: "Não foi possível salvar as alterações." }, { status: 500 });
  }

  // Trocar o WhatsApp também invalida a verificação anterior desse número —
  // a verificação é real (Twilio Verify) e vale só pro número que foi confirmado.
  if (phoneChanged) {
    await supabaseAdmin
      .from("partners")
      .update({ whatsapp_verified: false, whatsapp_verified_at: null })
      .eq("id", partner.id);
  }

  await logAudit(supabaseAdmin, {
    actorId: user.id,
    actorRole: "partner",
    action: "partner_profile_updated",
    entityType: "partner",
    entityId: partner.id,
    metadata: { phoneChanged, pixChanged },
  });

  if (phoneChanged || pixChanged) {
    await recomputePartnerEligibility(supabaseAdmin, partner.id, { id: user.id, role: "partner" });
  }

  return NextResponse.json({ success: true });
}
