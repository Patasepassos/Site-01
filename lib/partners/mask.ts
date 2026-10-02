export function maskSecret(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return "*".repeat(value.length);
  return "*".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
