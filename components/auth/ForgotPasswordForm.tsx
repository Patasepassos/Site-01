"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Sem querystring de propósito: a allow-list de Redirect URLs do Supabase
    // faz correspondência exata quando a URL cadastrada não tem wildcard —
    // /auth/callback já usa /parceiros/redefinir-senha como destino padrão.
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setLoading(false);

    // O Supabase não revela se o e-mail existe (sucesso mesmo pra e-mail não
    // cadastrado) — um `error` aqui é falha real (rede, limite de envio).
    if (resetError) {
      setError("Não foi possível enviar o link. Tente novamente.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      <h1>Esqueceu sua senha?</h1>
      <p className="lead">Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>

      {sent ? (
        <p className="pf-success">Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.</p>
      ) : (
        <form onSubmit={handleSubmit}>
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
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
      )}

      <p className="pf-link">
        <button
          type="button"
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brown-2)", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}
        >
          Voltar para o login
        </button>
      </p>
    </>
  );
}
