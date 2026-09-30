import "server-only";
import { describeError } from "@/lib/partners/errors";

// Verify Service SID não é segredo (é só um identificador do serviço,
// equivalente ao "from" do Resend) — pode ter um valor padrão no código.
// Account SID e Auth Token são segredos e SÓ vêm de variável de ambiente.
const DEFAULT_VERIFY_SERVICE_SID = "VA93dfe39a4310cb3e3f460ef8ac317107";
const DEFAULT_CHANNEL = "sms";
const REQUEST_TIMEOUT_MS = 8_000;

export type TwilioVerificationStatus =
  | "pending"
  | "approved"
  | "canceled"
  | "max_attempts_reached"
  | "deleted"
  | "failed"
  | "expired";

export type TwilioStartResult = { ok: true; status: TwilioVerificationStatus } | { ok: false; reason: string };
export type TwilioCheckResult = { ok: true; status: TwilioVerificationStatus } | { ok: false; reason: string };
export type TwilioVerifyChannel = "sms" | "whatsapp";

/**
 * Canal configurado (não é segredo — só o nome do canal). Usado pra UI
 * mostrar "Enviar código por SMS" ou "por WhatsApp" sem nunca importar
 * `getCredentials()` (que exige Account SID/Auth Token) de um lugar que só
 * precisa saber o canal, como uma Server Component renderizando a página.
 */
export function getConfiguredChannel(): TwilioVerifyChannel {
  return process.env.TWILIO_VERIFY_CHANNEL === "whatsapp" ? "whatsapp" : "sms";
}

function isVerificationStatus(value: unknown): value is TwilioVerificationStatus {
  return (
    typeof value === "string" &&
    ["pending", "approved", "canceled", "max_attempts_reached", "deleted", "failed", "expired"].includes(value)
  );
}

function getCredentials(): { accountSid: string; authToken: string; serviceSid: string; channel: string } {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN não configurados no ambiente.");
  }
  return {
    accountSid,
    authToken,
    serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID || DEFAULT_VERIFY_SERVICE_SID,
    // Trial só libera SMS/RCS; troque pra "whatsapp" via env var assim que a
    // conta liberar o canal — nenhum código precisa mudar.
    channel: process.env.TWILIO_VERIFY_CHANNEL || DEFAULT_CHANNEL,
  };
}

type TwilioApiResponse = { status?: string; code?: number; message?: string };

async function callTwilio(
  resource: "Verifications" | "VerificationCheck",
  params: Record<string, string>
): Promise<{ httpStatus: number; data: TwilioApiResponse }> {
  const { accountSid, authToken, serviceSid } = getCredentials();
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/${resource}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as TwilioApiResponse;
    return { httpStatus: res.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Conta Trial da Twilio só pode mandar código pra números verificados na
 * Twilio (Console → Phone Numbers → Verified Caller IDs). A Twilio sinaliza
 * isso na própria mensagem de erro — não existe um jeito de contornar isso
 * por código, só reconhecer e explicar com clareza pro parceiro/admin.
 */
function isTrialUnverifiedNumberError(message: string | undefined): boolean {
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("unverified") && (normalized.includes("trial") || normalized.includes("verify"));
}

const TRIAL_UNVERIFIED_REASON =
  "Sua conta Twilio está em modo Trial e só pode enviar código pra números verificados na Twilio. " +
  "Verifique este número em Twilio Console → Phone Numbers → Verified Caller IDs, ou faça upgrade da conta.";

export async function startPhoneVerification(phoneE164: string): Promise<TwilioStartResult> {
  const { channel } = getCredentials();
  try {
    const { httpStatus, data } = await callTwilio("Verifications", { To: phoneE164, Channel: channel });
    if (httpStatus >= 200 && httpStatus < 300 && isVerificationStatus(data.status)) {
      return { ok: true, status: data.status };
    }
    console.error(`[twilio-verify] falha ao iniciar verificação (http ${httpStatus}, code ${data.code ?? "?"}, msg: ${data.message ?? "?"})`);
    if (isTrialUnverifiedNumberError(data.message)) {
      return { ok: false, reason: TRIAL_UNVERIFIED_REASON };
    }
    return { ok: false, reason: "Não foi possível enviar o código agora. Tente novamente em instantes." };
  } catch (err) {
    console.error("[twilio-verify] erro ao iniciar verificação:", describeError(err));
    return { ok: false, reason: "Não foi possível enviar o código agora. Tente novamente em instantes." };
  }
}

export async function checkPhoneVerification(phoneE164: string, code: string): Promise<TwilioCheckResult> {
  try {
    const { httpStatus, data } = await callTwilio("VerificationCheck", { To: phoneE164, Code: code });
    if (httpStatus >= 200 && httpStatus < 300 && isVerificationStatus(data.status)) {
      return { ok: true, status: data.status };
    }
    console.error(`[twilio-verify] falha ao checar código (http ${httpStatus}, code ${data.code ?? "?"})`);
    return { ok: false, reason: "Não foi possível verificar o código agora. Tente novamente." };
  } catch (err) {
    console.error("[twilio-verify] erro ao checar código:", describeError(err));
    return { ok: false, reason: "Não foi possível verificar o código agora. Tente novamente." };
  }
}
