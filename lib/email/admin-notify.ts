import "server-only";
import { sendEmail } from "./resend";

/**
 * E-mails de alerta para a administração (não para o parceiro). Nunca trava
 * o fluxo que chama isso — quem usa envolve a chamada em try/catch, igual já
 * se faz com CPF/OTP no cadastro.
 */
export async function notifyAdmin(input: { subject: string; html: string }): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) throw new Error("ADMIN_NOTIFICATION_EMAIL não configurada no ambiente.");
  await sendEmail({ to, subject: input.subject, html: input.html });
}
