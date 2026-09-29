"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "loading" | "disabled" | "enrolling" | "enabled";

export default function MfaSetup() {
  const [step, setStep] = useState<Step>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshFactors() {
    const supabase = createSupabaseBrowserClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setError("Não foi possível verificar o status do 2FA.");
      setStep("disabled");
      return;
    }
    const verified = data.totp.find((f) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStep("enabled");
    } else {
      setStep("disabled");
    }
  }

  async function startEnroll() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (enrollError || !data) {
        setError(
          enrollError?.message.includes("not enabled")
            ? "O 2FA não está habilitado no projeto Supabase ainda (Authentication → MFA)."
            : "Não foi possível iniciar a configuração do 2FA."
        );
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setStep("enrolling");
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge) {
        setError("Não foi possível gerar o desafio. Tente de novo.");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        setError("Código inválido. Confira o app autenticador e tente de novo.");
        return;
      }
      setCode("");
      setQrCode(null);
      setStep("enabled");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    if (!factorId) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollError) {
        setError("Não foi possível desativar o 2FA.");
        return;
      }
      setFactorId(null);
      setStep("disabled");
    } finally {
      setLoading(false);
    }
  }

  if (step === "loading") return <p>Carregando…</p>;

  if (step === "enabled") {
    return (
      <div>
        <p className="pf-success">2FA ativado — sua conta exige o código do autenticador pra entrar no admin.</p>
        {error && <p className="pf-error">{error}</p>}
        <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 10 }} disabled={loading} onClick={disable}>
          Desativar 2FA
        </button>
      </div>
    );
  }

  if (step === "enrolling") {
    return (
      <form onSubmit={confirmEnroll}>
        <p>Escaneie o QR code com um app autenticador (Google Authenticator, Authy, 1Password…):</p>
        {qrCode && <div style={{ margin: "12px 0", maxWidth: 220 }} dangerouslySetInnerHTML={{ __html: qrCode }} />}
        <label className="pf-label" htmlFor="mfa-code">Código de 6 dígitos</label>
        <input
          id="mfa-code"
          className="pf-input"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        {error && <p className="pf-error">{error}</p>}
        <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 10 }} disabled={loading}>
          {loading ? "Confirmando…" : "Confirmar e ativar"}
        </button>
      </form>
    );
  }

  return (
    <div>
      <p>Sua conta ainda não tem 2FA. Recomendado pra contas de administrador.</p>
      {error && <p className="pf-error">{error}</p>}
      <button type="button" className="btn btn-wa btn-sm" style={{ marginTop: 10 }} disabled={loading} onClick={startEnroll}>
        Configurar 2FA
      </button>
    </div>
  );
}
