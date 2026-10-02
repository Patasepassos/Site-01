import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPasswordResetPhoneCode } from "@/lib/partners/password-reset";

type Body = { token?: unknown; code?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!token) return NextResponse.json({ error: "Sessão de recuperação expirada. Comece de novo." }, { status: 400 });
  if (!/^\d{4,10}$/.test(code)) return NextResponse.json({ error: "Digite o código recebido." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const outcome = await verifyPasswordResetPhoneCode(supabaseAdmin, token, code);
  if (outcome.status !== "verified") {
    return NextResponse.json({ error: outcome.reason }, { status: outcome.status === "rate_limited" ? 429 : 400 });
  }

  return NextResponse.json({ success: true });
}
