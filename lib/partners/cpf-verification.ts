import "server-only";
import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CpfVerificationStatus, Database } from "@/lib/supabase/types";
import { isValidCPF, onlyDigits } from "@/lib/partners/validation";
import { maskSecret } from "@/lib/partners/mask";
import { describeError } from "@/lib/partners/errors";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";

// ---------------------------------------------------------------------------
// Tipos da API CPF Brasil (https://www.cpf-brasil.org/documentacao/).
// O formato de sucesso veio da documentação exatamente como abaixo — os
// nomes de campo (CPF, NOME, SEXO, NASC, NOME_MAE) não devem ser alterados.
// O formato de ERRO não veio explícito na documentação (só os códigos), então
// `parseCpfBrasilResponse` é defensivo: tenta o formato simétrico ao de
// sucesso e cai com segurança em UNKNOWN_ERROR/pending se a forma real for
// diferente — nunca assume verified/failed a partir de uma resposta que não
// reconhece.
// ---------------------------------------------------------------------------

export type CPFData = {
  CPF: string;
  NOME: string;
  SEXO: string;
  NASC: string;
  NOME_MAE: string;
};

export type CPFMeta = {
  query_time: string;
  api_version: string;
  response_time_ms: number;
};

export type CPFSuccessResponse = {
  success: true;
  data: CPFData;
  meta: CPFMeta;
};

export type CPFVerificationError =
  | "INVALID_API_KEY"
  | "TOKEN_EXPIRED"
  | "PLAN_EXPIRED"
  | "PLAN_SUSPENDED"
  | "QUOTA_EXCEEDED"
  | "MISSING_CPF_PARAMETER"
  | "INVALID_CPF_FORMAT"
  | "CPF_NOT_FOUND"
  | "DATABASE_NOT_FOUND"
  | "DATABASE_QUERY_ERROR"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export type CPFErrorResponse = {
  success: false;
  error: { code: CPFVerificationError | string; message?: string };
};

export type CPFVerificationResult = {
  status: CpfVerificationStatus;
  reason: string;
  apiErrorCode?: CPFVerificationError | string;
};

const CPF_BRASIL_API_BASE = "https://api.cpf-brasil.org/cpf";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const WINDOW_MINUTES = 30;
const AUDIT_ACTION_ATTEMPT = "partner_cpf_verification_attempt";
const AUDIT_ACTION_RESULT = "partner_cpf_verification_result";

// --- normalização ----------------------------------------------------------

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Aceita "YYYY-MM-DD" (como o Postgres devolve) ou "DD/MM/YYYY" (como a API devolve). */
export function normalizeDateToDDMMYYYY(value: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (iso) {
    const [, y, m, d] = iso;
    return `${d}/${m}/${y}`;
  }
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (br) return value.trim();
  return null;
}

export function computeCpfVerificationHash(cpf: string, fullName: string, birthDate: string): string {
  const normalized = `${onlyDigits(cpf)}|${normalizeName(fullName)}|${normalizeDateToDDMMYYYY(birthDate) ?? birthDate}`;
  return createHash("sha256").update(normalized).digest("hex");
}

// --- chamada à API -----------------------------------------------------

async function fetchCpfBrasil(cpf: string): Promise<{ httpStatus: number; body: unknown }> {
  const apiKey = process.env.CPF_BRASIL_API_KEY;
  if (!apiKey) throw new Error("CPF_BRASIL_API_KEY não configurada no ambiente.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${CPF_BRASIL_API_BASE}/${cpf}`, {
      method: "GET",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    return { httpStatus: res.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

type ParsedCpfResponse =
  | { kind: "success"; data: CPFData }
  | { kind: "error"; code: CPFVerificationError | string; message?: string };

function parseCpfBrasilResponse(httpStatus: number, body: unknown): ParsedCpfResponse {
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;

    if (obj.success === true && obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (
        typeof d.CPF === "string" &&
        typeof d.NOME === "string" &&
        typeof d.SEXO === "string" &&
        typeof d.NASC === "string" &&
        typeof d.NOME_MAE === "string"
      ) {
        return { kind: "success", data: d as unknown as CPFData };
      }
    }

    if (obj.success === false) {
      const errObj = obj.error;
      if (errObj && typeof errObj === "object") {
        const e = errObj as Record<string, unknown>;
        return {
          kind: "error",
          code: typeof e.code === "string" ? e.code : "UNKNOWN_ERROR",
          message: typeof e.message === "string" ? e.message : undefined,
        };
      }
    }

    if (typeof obj.code === "string") return { kind: "error", code: obj.code };
    if (typeof obj.error === "string") return { kind: "error", code: obj.error };
  }

  if (httpStatus === 401) return { kind: "error", code: "INVALID_API_KEY" };
  if (httpStatus === 404) return { kind: "error", code: "CPF_NOT_FOUND" };
  if (httpStatus === 429) return { kind: "error", code: "QUOTA_EXCEEDED" };
  if (httpStatus >= 500) return { kind: "error", code: "DATABASE_ERROR" };

  return { kind: "error", code: "UNKNOWN_ERROR" };
}

function mapApiErrorToResult(code: string, message?: string): CPFVerificationResult {
  switch (code) {
    case "CPF_NOT_FOUND":
      return {
        status: "failed",
        reason: "Não conseguimos validar o CPF informado. Confira os dados e tente novamente.",
        apiErrorCode: code,
      };
    case "INVALID_CPF_FORMAT":
      return { status: "failed", reason: "CPF informado é inválido.", apiErrorCode: code };
    case "INVALID_API_KEY":
    case "TOKEN_EXPIRED":
    case "PLAN_EXPIRED":
    case "PLAN_SUSPENDED":
    case "QUOTA_EXCEEDED":
      console.error(`[cpf-brasil] problema de configuração da integração (${code})${message ? `: ${message}` : ""}`);
      return {
        status: "pending",
        reason: `Verificação temporariamente indisponível — configuração da integração precisa de ajuste (${code}).`,
        apiErrorCode: code,
      };
    case "MISSING_CPF_PARAMETER":
      console.error("[cpf-brasil] MISSING_CPF_PARAMETER — bug interno, revisar chamada.");
      return { status: "pending", reason: "Erro interno ao consultar o CPF. Tente novamente.", apiErrorCode: code };
    case "DATABASE_NOT_FOUND":
    case "DATABASE_QUERY_ERROR":
    case "DATABASE_ERROR":
      return {
        status: "pending",
        reason: "Consulta indisponível no momento. Tente novamente em instantes.",
        apiErrorCode: code,
      };
    default:
      return {
        status: "pending",
        reason: "Não foi possível concluir a verificação agora. Tente novamente em instantes.",
        apiErrorCode: code || "UNKNOWN_ERROR",
      };
  }
}

async function performCpfVerification(input: {
  cpf: string;
  fullName: string;
  birthDate: string;
}): Promise<CPFVerificationResult> {
  const cpf = onlyDigits(input.cpf);
  if (!isValidCPF(cpf)) {
    return { status: "failed", reason: "CPF inválido." };
  }

  let httpStatus: number;
  let body: unknown;
  try {
    const res = await fetchCpfBrasil(cpf);
    httpStatus = res.httpStatus;
    body = res.body;
  } catch (err) {
    return { status: "pending", reason: `Consulta indisponível no momento (${describeError(err)}).` };
  }

  const parsed = parseCpfBrasilResponse(httpStatus, body);
  if (parsed.kind === "error") return mapApiErrorToResult(parsed.code, parsed.message);

  const data = parsed.data;
  const cpfMatches = onlyDigits(data.CPF) === cpf;
  const nameMatches = normalizeName(data.NOME) === normalizeName(input.fullName);
  const apiDate = normalizeDateToDDMMYYYY(data.NASC);
  const inputDate = normalizeDateToDDMMYYYY(input.birthDate);
  const dateMatches = apiDate !== null && apiDate === inputDate;

  if (cpfMatches && nameMatches && dateMatches) {
    return { status: "verified", reason: "Verificado com sucesso." };
  }

  const mismatches = [!cpfMatches && "CPF", !nameMatches && "nome", !dateMatches && "data de nascimento"].filter(
    Boolean
  );
  return { status: "failed", reason: `Dados incompatíveis com o CPF consultado (${mismatches.join(", ")}).` };
}

// --- orquestração: cache, rate limit, persistência, auditoria, elegibilidade

export type CpfVerificationOutcome = {
  status: CpfVerificationStatus;
  reason: string;
  cached: boolean;
  rateLimited?: boolean;
};

/**
 * Único ponto que dispara a verificação de CPF. Sempre lê CPF/nome/nascimento
 * do próprio registro do parceiro no banco — nunca de um valor vindo do
 * corpo da requisição — então não existe jeito de alguém consultar o CPF de
 * outra pessoa através dessa função.
 */
export async function verifyAndPersistPartnerCpf(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  actor: { id: string | null; role: string | null }
): Promise<CpfVerificationOutcome> {
  const { data: partner, error } = await supabaseAdmin.from("partners").select("*").eq("id", partnerId).maybeSingle();
  if (error || !partner) throw error ?? new Error("Parceiro não encontrado para verificação de CPF.");

  const cpf = onlyDigits(partner.cpf_cnpj);
  if (cpf.length !== 11) {
    throw new Error("Verificação de CPF só se aplica a parceiros pessoa física (CNPJ é aprovado manualmente).");
  }
  if (!partner.birth_date) {
    return { status: "pending", reason: "Data de nascimento não informada.", cached: false };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", partner.profile_id)
    .maybeSingle();
  const fullName = profile?.full_name ?? "";

  const currentHash = computeCpfVerificationHash(cpf, fullName, partner.birth_date);

  // Cache: nada mudou desde a última verificação bem-sucedida — não bate na API de novo.
  if (partner.cpf_status === "verified" && partner.cpf_verification_hash === currentHash) {
    return { status: "verified", reason: partner.cpf_verification_reason ?? "Verificado com sucesso.", cached: true };
  }

  // Rate limit por parceiro (sem Redis no projeto — contagem via audit_logs,
  // real e funciona em Postgres; não substitui proteção de borda por IP).
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "partner")
    .eq("entity_id", partnerId)
    .eq("action", AUDIT_ACTION_ATTEMPT)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      status: partner.cpf_status,
      reason: "Muitas tentativas de verificação. Tente novamente mais tarde.",
      cached: false,
      rateLimited: true,
    };
  }

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_ATTEMPT,
    entityType: "partner",
    entityId: partnerId,
    metadata: { cpfMasked: maskSecret(cpf) },
  });

  const result = await performCpfVerification({ cpf, fullName, birthDate: partner.birth_date });
  const previousStatus = partner.cpf_status;

  const { error: updateError } = await supabaseAdmin
    .from("partners")
    .update({
      cpf_status: result.status,
      cpf_verified_at: new Date().toISOString(),
      cpf_verification_reason: result.reason,
      cpf_verification_hash: currentHash,
    })
    .eq("id", partnerId);
  if (updateError) throw updateError;

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_RESULT,
    entityType: "partner",
    entityId: partnerId,
    metadata: {
      cpfMasked: maskSecret(cpf),
      previousStatus,
      newStatus: result.status,
      reason: result.reason,
      apiErrorCode: result.apiErrorCode ?? null,
    },
  });

  await recomputePartnerEligibility(supabaseAdmin, partnerId, actor);

  return { status: result.status, reason: result.reason, cached: false };
}
