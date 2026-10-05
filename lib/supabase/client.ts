"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

// Cliente de navegador — usa a chave anônima/publicável, respeita RLS.
// Nunca importar lib/supabase/admin.ts a partir de um Client Component.
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
