import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const FALLBACK_SERVICE_AREA_NOTE =
  "Atualmente, o programa de indicações considera clientes de São Caetano do Sul — SP. Indicações de regiões não atendidas pela Patas & Passos não serão consideradas vendas válidas para comissão.";

/** Configurável pelo admin (app_settings) — nunca hardcoded pro parceiro ler. */
export async function getPartnerServiceAreaNote(supabase: SupabaseClient<Database>): Promise<string> {
  const { data } = await supabase.from("app_settings").select("value").eq("key", "partner_service_area_note").maybeSingle();
  return data?.value ?? FALLBACK_SERVICE_AREA_NOTE;
}
