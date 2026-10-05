/**
 * Extrai uma mensagem legível de qualquer erro — incluindo objetos do
 * Supabase (PostgrestError, AuthError), que não são instâncias de Error.
 */
export function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "Erro desconhecido.";
  }
}
