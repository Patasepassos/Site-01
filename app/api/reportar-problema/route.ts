import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/email/admin-notify";
import { describeError } from "@/lib/partners/errors";

const MAX_MESSAGE_LENGTH = 2000;

type ReportBody = { message?: unknown; pageUrl?: unknown; userEmail?: unknown };

/**
 * Botão "Reportar um problema" -- disponível em TODAS as páginas do site,
 * inclusive pra quem não está logado ou está bloqueado (nunca exige
 * sessão). Reaproveita notifyAdmin() (Resend já integrado) -- nenhuma
 * integração nova.
 */
export async function POST(request: Request) {
  let body: ReportBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.trim() : "";
  const userEmail = typeof body.userEmail === "string" ? body.userEmail.trim() : "";

  if (!message) return NextResponse.json({ error: "Descreva o problema." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Mensagem muito longa." }, { status: 400 });
  }

  try {
    await notifyAdmin({
      subject: "🐛 Problema reportado no site",
      html: `<p><strong>Página:</strong> ${pageUrl || "não informada"}<br/>
<strong>Usuário:</strong> ${userEmail || "não identificado / não logado"}</p>
<p><strong>Mensagem:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`,
    });
  } catch (err) {
    console.error("Falha ao notificar admin sobre problema reportado:", describeError(err));
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente de novo em instantes." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
