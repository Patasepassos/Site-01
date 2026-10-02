import "server-only";
import { Resend } from "resend";

// Sandbox do Resend até você verificar um domínio próprio: só entrega pro
// e-mail da conta Resend, não serve pra parceiros de verdade. Depois de
// verificar um domínio (ex.: patasepassos.com.br), configure
// RESEND_FROM_EMAIL na Vercel (ex.: "Patas & Passos <verificacao@patasepassos.com.br>").
const DEFAULT_FROM = "onboarding@resend.dev";

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada no ambiente.");

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail via Resend: ${error.message}`);
  }
}
