import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function logAudit(
  supabaseAdmin: SupabaseClient<Database>,
  entry: {
    actorId: string | null;
    actorRole: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_id: entry.actorId,
    actor_role: entry.actorRole,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? null,
  });

  // Auditoria nunca deve derrubar o fluxo principal — só registra o erro.
  if (error) {
    console.error("Falha ao gravar audit_log:", error.message);
  }
}
