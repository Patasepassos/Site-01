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
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/parceiros/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/parceiros/:path*", "/admin/:path*"],
};
