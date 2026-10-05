import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { changePartnerEmail } from "@/lib/partners/email-verification";
import { isValidEmail } from "@/lib/partners/validation";

type PatchBody = { newEmail?: unknown };

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim().toLowerCase() : "";
  if (!isValidEmail(newEmail)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: partner } = await supabaseAdmin.from("partners").select("id").eq("profile_id", user.id).maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  if (newEmail === user.email) {
    return NextResponse.json({ error: "Esse já é o seu e-mail atual." }, { status: 400 });
  }

  const outcome = await changePartnerEmail(supabaseAdmin, partner.id, user.id, newEmail, {
    id: user.id,
    role: "partner",
  });
  if (!outcome.success) return NextResponse.json({ error: outcome.reason }, { status: 400 });

  return NextResponse.json({ success: true });
}
