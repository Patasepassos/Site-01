import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetPhoneCode } from "@/lib/partners/password-reset";

type Body = { token?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Sessão de recuperação expirada. Comece de novo." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const outcome = await sendPasswordResetPhoneCode(supabaseAdmin, token);

  // "skipped" não é um erro pro fluxo -- é um estado válido que a tela usa
  // pra pular direto pra nova senha, sem travar o parceiro por causa da
  // Twilio ou de telefone ausente/inválido.
  return NextResponse.json({ sent: outcome.sent, skipped: !outcome.sent && outcome.skipped, reason: outcome.sent ? null : outcome.reason });
}
