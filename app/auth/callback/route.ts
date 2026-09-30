import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback do fluxo PKCE do Supabase Auth (usado por recuperação de senha e
 * outros e-mails de confirmação). O @supabase/ssr usa PKCE por padrão: o link
 * do e-mail redireciona pra cá com ?code=..., que precisa ser trocado por uma
 * sessão real ANTES de chegar na página final — sem essa troca, a página de
 * destino nunca teria uma sessão válida pra agir.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/parceiros/redefinir-senha";
  // Só aceita caminho relativo interno — nunca um redirect pra fora do site.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/parceiros/redefinir-senha";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Nunca logar o `code` em si (segredo de uso único) — só o motivo da
    // falha, pra diagnosticar sem adivinhar (token expirado/já usado x
    // code_verifier PKCE ausente por ter sido aberto em outro navegador).
    console.error(`[auth/callback] exchangeCodeForSession falhou: status=${error.status ?? "?"} code=${error.code ?? "?"} msg=${error.message}`);
  } else {
    console.error("[auth/callback] chamado sem parâmetro ?code=");
  }

  return NextResponse.redirect(`${origin}/parceiros/login?erro=link-invalido`);
}
