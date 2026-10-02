const SPECIAL_CHARS = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
const COMPANY_TOKENS = ["patas", "passos", "patasepassos", "patas&passos"];

export type PasswordContext = {
  fullName?: string;
  email?: string;
  phone?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Política de senha forte: 10+ caracteres, maiúscula, minúscula, número,
 * caractere especial, e nunca igual/baseada no nome, e-mail, telefone do
 * próprio usuário ou no nome da empresa. Retorna a mensagem de erro, ou
 * null se a senha é válida.
 */
export function validatePasswordPolicy(password: string, context: PasswordContext = {}): string | null {
  if (password.length < 10) return "A senha precisa ter pelo menos 10 caracteres.";
  if (!/[A-Z]/.test(password)) return "A senha precisa ter pelo menos 1 letra maiúscula.";
  if (!/[a-z]/.test(password)) return "A senha precisa ter pelo menos 1 letra minúscula.";
  if (!/[0-9]/.test(password)) return "A senha precisa ter pelo menos 1 número.";
  if (!SPECIAL_CHARS.test(password)) return "A senha precisa ter pelo menos 1 caractere especial.";

  const normalizedPassword = normalize(password);

  const forbiddenTokens: string[] = [...COMPANY_TOKENS];

  if (context.fullName) {
    for (const part of context.fullName.split(/\s+/)) {
      if (part.length >= 3) forbiddenTokens.push(part);
    }
  }
  if (context.email) {
    const local = context.email.split("@")[0];
    if (local && local.length >= 3) forbiddenTokens.push(local);
  }
  if (context.phone) {
    const digits = context.phone.replace(/\D/g, "");
    if (digits.length >= 6) forbiddenTokens.push(digits);
  }

  for (const token of forbiddenTokens) {
    const normalizedToken = normalize(token);
    if (normalizedToken.length >= 3 && normalizedPassword.includes(normalizedToken)) {
      return "A senha não pode conter seu nome, e-mail, telefone ou o nome da empresa.";
    }
  }

  return null;
}
