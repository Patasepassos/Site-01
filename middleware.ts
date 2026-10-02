import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { REMEMBER_ME_COOKIE } from "@/lib/partners/rememberMe";

// /parceiros/regras fica fora daqui de propósito: qualquer pessoa (mesmo
// antes de se cadastrar) precisa poder ler as regras da parceria.
const PORTAL_PATHS = [
  "/parceiros/dashboard",
  "/parceiros/indicacoes",
  "/parceiros/financeiro",
  "/parceiros/calculadora",
  "/parceiros/perfil",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPortalPath = PORTAL_PATHS.some((p) => pathname.startsWith(p));
  // /admin/login fica fora de propósito, assim como /parceiros/login — é a
  // própria porta de entrada do ambiente administrativo, não pode exigir
  // sessão pra ser acessada (senão vira loop de redirecionamento).
  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if ((isPortalPath || isAdminPath) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = isAdminPath ? "/admin/login" : "/parceiros/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // "Lembrar login por 14 dias": a sessão do Supabase em si já persiste por
  // muito mais tempo que isso por padrão -- esse cookie à parte é o que
  // decide se ainda deixa passar. Marcado no login, dura 14 dias;
  // desmarcado, é cookie de sessão e some ao fechar o navegador. Sem ele
  // aqui (nunca existiu, ou expirou), força logout de verdade em vez de
  // deixar a sessão antiga do Supabase seguir valendo escondida.
  if (isPortalPath && user && !request.cookies.get(REMEMBER_ME_COOKIE)) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/parceiros/login";
    loginUrl.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // signOut() acima já mandou limpar os cookies de sessão através do
    // adapter (que escreve em `response`, não no redirect) -- repassa pro
    // response de verdade que vai pro navegador, senão a sessão do Supabase
    // continua "viva" por trás mesmo depois do logout forçado.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .maybeSingle();

    const isStaff = profile?.active && (profile.role === "admin" || profile.role === "operator");
    if (!isStaff) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/parceiros/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 2FA: quem configurou (admin, operador ou parceiro — qualquer um pode
  // ativar no próprio perfil) tem a sessão elevada exigida aqui. Se ainda
  // não tem fator verificado, passa direto — sem isso, ninguém conseguiria
  // nem configurar o 2FA a primeira vez.
  if ((isPortalPath || isAdminPath) && user) {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = (factorsData?.totp ?? []).some((f) => f.status === "verified");
    if (hasVerifiedTotp) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.currentLevel !== "aal2" && aal.nextLevel === "aal2") {
        const mfaUrl = request.nextUrl.clone();
        mfaUrl.pathname = "/mfa-challenge";
        mfaUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(mfaUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/parceiros/:path*", "/admin/:path*"],
};
