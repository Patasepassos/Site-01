import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PartnerRow, ProfileRow } from "@/lib/supabase/types";

export type CurrentPartner = {
  userId: string;
  email: string;
  profile: ProfileRow;
  partner: PartnerRow;
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
