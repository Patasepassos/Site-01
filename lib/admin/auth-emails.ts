import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Busca o e-mail de cada usuário (profiles.id === auth.users.id) via admin API. */
export async function getAuthEmailMap(
  supabaseAdmin: SupabaseClient,
  userIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniqueIds = Array.from(new Set(userIds));

  await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data.user?.email) map.set(id, data.user.email);
    })
  );

  return map;
}

export type AuthUserInfo = { email: string; lastSignInAt: string | null };

/** Igual getAuthEmailMap, mas também traz o último acesso (last_sign_in_at). */
export async function getAuthUserInfoMap(
  supabaseAdmin: SupabaseClient,
  userIds: string[]
): Promise<Map<string, AuthUserInfo>> {
  const map = new Map<string, AuthUserInfo>();
  const uniqueIds = Array.from(new Set(userIds));

  await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id);
      if (data.user?.email) {
        map.set(id, { email: data.user.email, lastSignInAt: data.user.last_sign_in_at ?? null });
      }
    })
  );

  return map;
}
