import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

// Cliente administrativo — usa a service_role key, IGNORA o RLS.
// Só pode ser importado por código de servidor (Route Handlers). Nunca
// exponha o resultado bruto deste cliente para o parceiro sem antes
// filtrar exatamente os campos que ele pode ver.
export function createSupabaseAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    // O supabase-js usa fetch por baixo dos panos -- sem isso, o Next.js pode
    // cachear a resposta do PostgREST no Data Cache e servir dado velho
    // mesmo numa rota renderizada dinamicamente (cookies() só evita o cache
    // de HTML, não o cache por fetch individual).
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
  });
}
