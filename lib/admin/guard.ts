import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export type CurrentAdmin = {
  userId: string;
  profile: ProfileRow;
};

/**
 * Confirma sessão + role==='admin' direto no servidor. Usada em toda rota
 * /api/admin/* — o middleware protege as páginas, mas as rotas de API
 * precisam da própria checagem, porque podem ser chamadas diretamente.
 */
export async function requireAdminUser(): Promise<CurrentAdmin | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return null;

  return { userId: user.id, profile };
}
