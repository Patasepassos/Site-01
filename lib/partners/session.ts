import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseBearerClient } from "@/lib/supabase/bearer";
import type { Database, PartnerRow, ProfileRow } from "@/lib/supabase/types";

export type CurrentPartner = {
  userId: string;
  email: string;
  profile: ProfileRow;
  partner: PartnerRow;
};

export type CurrentPartnerWithClient = CurrentPartner & {
  supabase: SupabaseClient<Database>;
};

/**
 * Retorna o parceiro autenticado (perfil + linha de partners) ou null se não
 * houver sessão. Não decide autorização — quem chama decide o que fazer com
 * o status (pending/active/blocked).
 */
export async function getCurrentPartner(): Promise<CurrentPartner | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
    partner,
  };
}

/**
 * Igual a getCurrentPartner(), mas autenticando via token Bearer (app
 * mobile) em vez de cookie. Usada apenas pelas rotas que o app chama
 * diretamente — nunca substitui o fluxo de cookie do site web.
 */
export async function getCurrentPartnerFromBearer(
  accessToken: string
): Promise<CurrentPartnerWithClient | null> {
  const supabase = createSupabaseBearerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!partner) return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
    partner,
    supabase,
  };
}
