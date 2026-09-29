import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PartnerNotificationRow } from "@/lib/supabase/types";

export async function getPartnerNotifications(
  supabase: SupabaseClient<Database>,
  partnerId: string,
  limit = 5
): Promise<PartnerNotificationRow[]> {
  const { data, error } = await supabase
    .from("partner_notifications")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function countUnreadNotifications(
  supabase: SupabaseClient<Database>,
  partnerId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("partner_notifications")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}
