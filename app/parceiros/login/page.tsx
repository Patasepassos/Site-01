"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/parceiros/dashboard";
  const linkError = searchParams.get("erro") === "link-invalido";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

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

    // A área de parceiro é separada da área do admin: uma conta de parceiro
    // nunca pode terminar em /admin, mesmo que a URL de login carregue um
    // ?redirect=/admin/... deixado de uma tentativa anterior (ex.: sessão
    // expirou numa página do admin). Só respeita esse destino se a conta
    // que acabou de logar é realmente staff (admin/operador).
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .maybeSingle();
    const isStaff = profile?.role === "admin" || profile?.role === "operator";
    const target = redirect.startsWith("/admin") && !isStaff ? "/parceiros/dashboard" : redirect;

    // Navegação completa de propósito: com router.push existe uma corrida em
    // que o middleware ainda não vê a sessão recém-criada (cookie ainda não
    // salvo) e manda de volta pro login. window.location garante que a
    // sessão já está salva antes da próxima requisição.
    window.location.href = target;
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/parceiros/redefinir-senha`,
    });
    setForgotLoading(false);

    // O Supabase já não revela se o e-mail existe (retorna sucesso mesmo
    // pra e-mail não cadastrado) — um `error` aqui é falha real (rede,
    // limite de envio etc.), não "e-mail não encontrado". Só nesse caso
    // mostramos erro; senão, sempre a mensagem genérica de sucesso.
    if (error) {
      setForgotError("Não foi possível enviar o link. Tente novamente.");
      return;
    }
    setForgotSent(true);
  }

  if (forgotMode) {
    return (
      <div className="portal-auth">
        <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="portal-auth-card">
          <h1>Esqueceu sua senha?</h1>
          <p className="lead">Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>

          {forgotSent ? (
            <p className="pf-success">
              Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
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
              {forgotError && <p className="pf-error">{forgotError}</p>}
              <button className="pf-submit" type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          )}

          <p className="pf-link">
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brown-2)", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}
            >
              Voltar para o login
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
      </div>
    </div>
  );
}
