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
  });
}
