"use client";

import { useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

type Step = "email" | "email-code" | "sms-code" | "sms-skipped" | "new-password" | "done";

/**
 * Recuperação de senha por código, sem link nenhum pra clicar -- substitui o
 * fluxo antigo (e-mail com link mágico do Supabase), que falhava com
 * frequência. Tudo na mesma tela: 1) código por e-mail, 2) código por SMS
 * (confirma de quebra que o telefone cadastrado é real), 3) nova senha.
 *
 * Se o SMS não puder ser enviado (sem telefone válido, Twilio fora do ar
 * etc.), segue só com a verificação de e-mail -- nunca trava o parceiro fora
 * da própria conta por causa de um provedor terceiro.
 */
export default function PartnerPasswordResetFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState<string | null>(null);

  async function post<T>(url: string, body: unknown): Promise<{ ok: boolean; data: T }> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, data };
  }

  async function handleRequestEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await post<{ token?: string; error?: string }>("/api/parceiros/recuperar-senha/solicitar", { email });
    setLoading(false);
    if (!ok || !data.token) {
      setError(data.error ?? "Não foi possível enviar o código. Tente novamente.");
      return;
    }
    setToken(data.token);
    setStep("email-code");
  }

  async function handleConfirmEmailCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await post<{ error?: string }>("/api/parceiros/recuperar-senha/confirmar-email", {
      token,
      code: emailCode,
    });
    if (!ok) {
      setLoading(false);
      setError(data.error ?? "Código inválido.");
      return;
    }

    // Avança automaticamente pro SMS assim que o e-mail é confirmado.
    const sms = await post<{ sent: boolean; skipped: boolean; reason: string | null }>(
      "/api/parceiros/recuperar-senha/enviar-sms",
      { token }
    );
    setLoading(false);
    if (sms.ok && sms.data.sent) {
      setStep("sms-code");
    } else {
      setSkipReason(sms.data.reason ?? null);
      setStep("sms-skipped");
    }
  }

  async function handleConfirmSmsCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await post<{ error?: string }>("/api/parceiros/recuperar-senha/confirmar-sms", {
      token,
      code: smsCode,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Código inválido.");
      return;
    }
    setStep("new-password");
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { ok, data } = await post<{ error?: string }>("/api/parceiros/recuperar-senha/concluir", { token, password });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Não foi possível redefinir a senha.");
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <>
        <h1>Senha redefinida!</h1>
        <p className="pf-success">Sua senha foi alterada com sucesso. Já pode entrar com ela.</p>
        <p className="pf-link">
          <button type="button" onClick={onBack} className="pf-link-btn">
            Voltar para o login
          </button>
        </p>
      </>
    );
  }

  if (step === "new-password") {
    return (
      <>
        <h1>Crie uma nova senha</h1>
        <p className="lead">Identidade confirmada. Escolha a nova senha da sua conta.</p>
        <form onSubmit={handleSetPassword}>
          <label className="pf-label" htmlFor="newPassword">Nova senha</label>
          <PasswordInput
            id="newPassword"
            className="pf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={10}
            autoComplete="new-password"
            required
          />
          <p className="pf-hint">Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>

          <label className="pf-label" htmlFor="confirmNewPassword">Confirmar nova senha</label>
          <PasswordInput
            id="confirmNewPassword"
            className="pf-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={10}
            autoComplete="new-password"
            required
          />
          {error && <p className="pf-error">{error}</p>}
          <button className="pf-submit" type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </>
    );
  }

  if (step === "sms-skipped" || step === "sms-code") {
    return (
      <>
        <h1>Confirme seu telefone</h1>
        {step === "sms-code" ? (
          <>
            <p className="lead">Enviamos um código por SMS para o telefone cadastrado na sua conta.</p>
            <form onSubmit={handleConfirmSmsCode}>
              <label className="pf-label" htmlFor="smsCode">Código recebido por SMS</label>
              <input
                id="smsCode"
                className="pf-input"
                inputMode="numeric"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                maxLength={10}
                autoFocus
                required
              />
              {error && <p className="pf-error">{error}</p>}
              <button className="pf-submit" type="submit" disabled={loading}>
                {loading ? "Confirmando…" : "Confirmar código"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="lead">
              Não foi possível enviar o SMS agora{skipReason ? ` (${skipReason})` : ""}. Sem problema — você pode
              continuar só com o e-mail já confirmado.
            </p>
            <button type="button" className="pf-submit" onClick={() => setStep("new-password")}>
              Continuar
            </button>
          </>
        )}
      </>
    );
  }

  if (step === "email-code") {
    return (
      <>
        <h1>Digite o código</h1>
        <p className="lead">Enviamos um código de 6 dígitos para {email}.</p>
        <form onSubmit={handleConfirmEmailCode}>
          <label className="pf-label" htmlFor="emailCode">Código recebido por e-mail</label>
          <input
            id="emailCode"
            className="pf-input"
            inputMode="numeric"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            maxLength={6}
            autoFocus
            required
          />
          {error && <p className="pf-error">{error}</p>}
          <button className="pf-submit" type="submit" disabled={loading}>
            {loading ? "Confirmando…" : "Confirmar código"}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <h1>Esqueceu sua senha?</h1>
      <p className="lead">Digite seu e-mail. Vamos confirmar sua identidade em duas etapas (e-mail e SMS) e você já cria a nova senha aqui mesmo.</p>
      <form onSubmit={handleRequestEmail}>
        <label className="pf-label" htmlFor="forgotEmail">E-mail</label>
        <input
          id="forgotEmail"
          type="email"
          className="pf-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="pf-error">{error}</p>}
        <button className="pf-submit" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </form>

      <p className="pf-link">
        <button type="button" onClick={onBack} className="pf-link-btn">
          Voltar para o login
        </button>
      </p>
    </>
  );
}
