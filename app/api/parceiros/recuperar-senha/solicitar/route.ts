import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requestPartnerPasswordReset } from "@/lib/partners/password-reset";

type Body = { email?: unknown };

/**
 * Primeira etapa da recuperação de senha: recebe o e-mail e sempre responde
 * com um token (exista ou não esse e-mail cadastrado) -- nunca revela se o
 * e-mail existe. O código de verdade só é gerado/enviado quando o e-mail
 * bate com um parceiro de verdade.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Digite um e-mail válido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { token } = await requestPartnerPasswordReset(supabaseAdmin, email);

  return NextResponse.json({ token });
}
