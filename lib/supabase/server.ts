import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

// Cliente de servidor (Server Components / Route Handlers) — usa a chave
// anônima e a sessão do cookie do usuário, respeita RLS. Este é o cliente
// que toda leitura "própria do parceiro" deve usar.
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    // Evita que o Next.js cacheie a resposta do PostgREST no Data Cache --
    // cookies() só tira a página do cache de HTML, não o cache por fetch
    // individual, então sem isso uma query podia devolver dado velho mesmo
    // logo depois de um INSERT/UPDATE confirmado.
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Chamado a partir de um Server Component: o middleware já cuida
          // de renovar o cookie de sessão nesse caso.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Idem set().
        }
      },
    },
  });
}
