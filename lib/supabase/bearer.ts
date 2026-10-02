import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/** Extrai o token de um header "Authorization: Bearer <token>", se houver. */
export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

/**
 * Cliente Supabase autenticado via token do app mobile, em vez de cookie.
 * Continua com a chave anônima e sujeito a RLS normalmente — o token só
 * identifica o usuário, nunca eleva privilégio.
 */
export function createSupabaseBearerClient(accessToken: string) {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
