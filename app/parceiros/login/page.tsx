"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function LoginParceiroPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/parceiros/dashboard";
  const linkError = searchParams.get("erro") === "link-invalido";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.user) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // A área de parceiro é separada da área do admin: login de parceiro
    // nunca leva a /admin, mesmo com ?redirect=/admin/... deixado de uma
    // tentativa anterior. O admin tem sua própria página em /admin/login.
    const target = redirect.startsWith("/admin") ? "/parceiros/dashboard" : redirect;

    // Navegação completa de propósito: com router.push existe uma corrida em
    // que o middleware ainda não vê a sessão recém-criada (cookie ainda não
    // salvo) e manda de volta pro login. window.location garante que a
    // sessão já está salva antes da próxima requisição.
    window.location.href = target;
  }

  return (
    <div className="pls-wrap">
      <div className="pls-visual">
        <div className="pls-visual-glow" aria-hidden="true" />
        <Link className="pls-visual-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="pls-visual-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/dog-cutout.png" alt="" aria-hidden="true" />
        </div>
        <div className="pls-visual-tagline">
          <h2>Conectando cuidados, recompensando parcerias.</h2>
        </div>
      </div>

      <div className="pls-mobile-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
        <span>Conectando cuidados, recompensando parcerias.</span>
      </div>

      <div className="pls-form-side">
        <div className="pls-form-card">
          {forgotMode ? (
            <ForgotPasswordForm onBack={() => setForgotMode(false)} />
          ) : (
            <>
              <h1>🐾 Área do Parceiro</h1>
              <p className="lead">Acesse seu painel de parceiro Patas &amp; Passos.</p>

              {linkError && (
                <p className="pf-error">Esse link de recuperação é inválido ou já expirou. Peça um novo abaixo.</p>
              )}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
