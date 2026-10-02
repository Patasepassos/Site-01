import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export type CurrentAdmin = {
  userId: string;
  profile: ProfileRow;
};

/**
 * Confirma sessão + role==='admin' + conta ativa, direto no servidor. Usada
 * nas rotas críticas (dinheiro, exclusão, configuração) — o middleware
 * protege as páginas, mas as rotas de API precisam da própria checagem,
 * porque podem ser chamadas diretamente.
 */
export async function requireAdminUser(): Promise<CurrentAdmin | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin" || !profile.active) return null;

  return { userId: user.id, profile };
}

/**
 * Confirma sessão + role admin OU operator + conta ativa. Usada nas rotas
 * operacionais do dia a dia (aprovar parceiro, fechar venda, confirmar
 * pagamento de venda) — nunca nas rotas críticas (zerar sistema, regras de
 * comissão, marcar saque como pago, gerenciar usuários), que continuam
 * exigindo requireAdminUser.
 */
export async function requireStaffUser(): Promise<CurrentAdmin | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "operator") || !profile.active) return null;

  return { userId: user.id, profile };
}

/**
 * Confirma sessão + role==='admin' + is_owner===true + conta ativa. Nível
 * extra SOMADO ao admin comum (nunca substitui requireAdminUser nas rotas
 * já existentes) — hoje só libera trocar a foto dos níveis de Rank.
 * Atribuído via /admin/usuarios por quem já é admin chefe.
 */
export async function requireOwnerUser(): Promise<CurrentAdmin | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin" || !profile.is_owner || !profile.active) return null;

  return { userId: user.id, profile };
}
