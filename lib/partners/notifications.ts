import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationType, PartnerNotificationRow } from "@/lib/supabase/types";
import { sendEmail } from "@/lib/email/resend";
import { describeError } from "@/lib/partners/errors";

const NOTIFICATION_TYPE_SUBJECTS: Record<NotificationType, string> = {
  indicacao_convertida: "🎉 Indicação convertida",
  comissao_liberada: "🔓 Comissão liberada",
  saque_atualizado: "💰 Saque atualizado",
  elegibilidade_atualizada: "✅ Seus dados foram atualizados",
  parceiro_aprovado: "🐾 Você foi aprovado!",
  indicacao_status_atualizado: "📞 Atualização da sua indicação",
};

/**
 * Único ponto que cria uma notificação de parceiro: grava em
 * partner_notifications (sino/Realtime/push) e manda o mesmo aviso por
 * e-mail pro parceiro, pra ele saber mesmo sem abrir o site ou o app. Falha
 * no e-mail nunca derruba quem chamou isso -- a notificação em si já foi
 * gravada antes.
 */
export async function notifyPartner(
  supabaseAdmin: SupabaseClient<Database>,
  input: { partnerId: string; type: NotificationType; message: string; customerId?: string }
): Promise<void> {
  await supabaseAdmin.from("partner_notifications").insert({
    partner_id: input.partnerId,
    customer_id: input.customerId ?? null,
    type: input.type,
    message: input.message,
  });

  try {
    const { data: partner } = await supabaseAdmin
      .from("partners")
      .select("profile_id")
      .eq("id", input.partnerId)
      .maybeSingle();
    if (!partner) return;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(partner.profile_id);
    const email = userData.user?.email;
    if (!email) return;

    await sendEmail({
      to: email,
      subject: `${NOTIFICATION_TYPE_SUBJECTS[input.type]} — Patas & Passos`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
<p>${input.message}</p>
<p style="color:#888;font-size:13px;">Acesse o Portal do Parceiro para mais detalhes.</p>
</div>`,
    });
  } catch (err) {
    console.error("Falha ao notificar parceiro por e-mail:", describeError(err));
  }
}

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
