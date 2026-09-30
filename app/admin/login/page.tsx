"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function LoginAdminPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

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

    // Login administrativo é uma porta separada da do parceiro: só entra
    // aqui quem realmente é admin/operador. Qualquer outra conta é barrada
    // e desconectada imediatamente, mesmo com credenciais corretas.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", signInData.user.id)
      .maybeSingle();
    const isStaff = profile?.active && (profile.role === "admin" || profile.role === "operator");

    if (!isStaff) {
      await supabase.auth.signOut();
      setError("Esta conta não tem acesso administrativo.");
      setLoading(false);
      return;
    }

    // Navegação completa de propósito: com router.push existe uma corrida em
    // que o middleware ainda não vê a sessão recém-criada (cookie ainda não
    // salvo) e manda de volta pro login.
    window.location.href = redirect.startsWith("/admin") ? redirect : "/admin";
  }

  return (
    <div className="portal-auth">
      <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
      </Link>
      <div className="portal-auth-card">
        {forgotMode ? (
          <ForgotPasswordForm onBack={() => setForgotMode(false)} />
        ) : (
          <>
            <h1>🔐 Acesso Administrativo</h1>
            <p className="lead">Área restrita à equipe Patas &amp; Passos.</p>

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
          </>
        )}
      </div>
    </div>
  );
}
