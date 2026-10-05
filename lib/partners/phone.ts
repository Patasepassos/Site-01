import { onlyDigits } from "@/lib/partners/validation";

/**
 * Normaliza um telefone brasileiro pro formato E.164 (+55DDDNNNNNNNNN).
 * Aceita com ou sem o "55" na frente, com ou sem formatação. Retorna null
 * se não tiver a quantidade de dígitos esperada pra um número brasileiro.
 */
export function normalizeToE164BR(raw: string): string | null {
  const digits = onlyDigits(raw);

  if (digits.length === 12 || digits.length === 13) {
    if (!digits.startsWith("55")) return null;
    const rest = digits.slice(2);
    return rest.length === 10 || rest.length === 11 ? `+55${rest}` : null;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return null;
}
