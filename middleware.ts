import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

// /parceiros/regras fica fora daqui de propósito: qualquer pessoa (mesmo
// antes de se cadastrar) precisa poder ler as regras da parceria.
const PORTAL_PATHS = [
  "/parceiros/dashboard",
  "/parceiros/indicacoes",
  "/parceiros/comissoes",
  "/parceiros/calculadora",
  "/parceiros/saldo",
  "/parceiros/saques",
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
  const isAdminPath = pathname.startsWith("/admin");

  if ((isPortalPath || isAdminPath) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/parceiros/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
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

    // 2FA obrigatório pra admin: se já tem um fator TOTP verificado mas a
    // sessão atual não chegou em aal2, manda pro desafio antes de liberar
    // qualquer rota /admin/*. Quem ainda não configurou 2FA passa direto —
    // sem isso, o primeiro admin nunca conseguiria nem configurar o 2FA.
    if (profile.role === "admin") {
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
  }

  return response;
}

export const config = {
  matcher: ["/parceiros/:path*", "/admin/:path*"],
};
