"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginParceiroPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/parceiros/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/parceiros/redefinir-senha`,
    });

    // Sempre mostra sucesso, mesmo se o e-mail não existir — evita
    // confirmar pra terceiros quais e-mails têm cadastro.
    setForgotSent(true);
    setForgotLoading(false);
  }

  if (forgotMode) {
    return (
      <div className="portal-auth">
        <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="portal-auth-card">
          <h1>Recuperar senha</h1>
          <p className="lead">Enviamos um link de redefinição para o seu e-mail.</p>

          {forgotSent ? (
            <p className="pf-success">
              Se esse e-mail estiver cadastrado, você vai receber um link em instantes.
            </p>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <label className="pf-label" htmlFor="forgotEmail">E-mail</label>
              <input
                id="forgotEmail"
                type="email"
                className="pf-input"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button className="pf-submit" type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Enviando…" : "Enviar link"}
              </button>
            </form>
          )}

          <p className="pf-link">
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brown-2)", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}
            >
              ← Voltar para o login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-auth">
      <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
      </Link>
      <div className="portal-auth-card">
        <h1>Área do Parceiro</h1>
        <p className="lead">Entre para acompanhar suas indicações e comissões.</p>

        <form onSubmit={handleLogin}>
          <label className="pf-label" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="pf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="pf-label" htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            className="pf-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="pf-error">{error}</p>}

          <button className="pf-submit" type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="pf-link">
          <button
            type="button"
            onClick={() => setForgotMode(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brown-2)", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}
          >
            Esqueci minha senha
          </button>
        </p>
        <p className="pf-link">
          Ainda não é parceiro? <Link href="/parceiros/cadastro">Quero ser parceiro</Link>
        </p>
      </div>
    </div>
  );
}
