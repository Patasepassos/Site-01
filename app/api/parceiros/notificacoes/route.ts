import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Marca todas as notificações não lidas do parceiro logado como lidas. */
export async function PATCH() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

  const { data: partner } = await supabase.from("partners").select("id").eq("profile_id", user.id).maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("partner_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("partner_id", partner.id)
    .is("read_at", null);

  if (error) return NextResponse.json({ error: "Não foi possível atualizar." }, { status: 500 });

  return NextResponse.json({ success: true });
}
