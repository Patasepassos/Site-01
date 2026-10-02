import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { completePartnerPasswordReset } from "@/lib/partners/password-reset";

type Body = { token?: unknown; password?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token) return NextResponse.json({ error: "Sessão de recuperação expirada. Comece de novo." }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Digite a nova senha." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const outcome = await completePartnerPasswordReset(supabaseAdmin, token, password);
  if (!outcome.success) {
    return NextResponse.json({ error: outcome.reason }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
