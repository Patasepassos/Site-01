"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validatePasswordPolicy } from "@/lib/partners/password-policy";

type SessionCheck = "checking" | "valid" | "invalid";

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionCheck, setSessionCheck] = useState<SessionCheck>("checking");
  const [loginPath, setLoginPath] = useState("/parceiros/login");

  useEffect(() => {
    // Essa página só deve funcionar pra quem chegou pelo fluxo real de
    // recuperação (via /auth/callback, que já trocou o código por uma
    // sessão). Sem sessão, não mostra o formulário — evita passar a
    // impressão de que dá pra mudar senha de qualquer jeito por aqui.
    async function checkSession() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSessionCheck(user ? "valid" : "invalid");

      // Login de admin/operador é separado do de parceiro — os links desta
      // página precisam apontar pra porta certa depois de trocar a senha.
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        const isStaff = profile?.role === "admin" || profile?.role === "operator";
        setLoginPath(isStaff ? "/admin/login" : "/parceiros/login");
      }
    }
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle()
      : { data: null };

    const policyError = validatePasswordPolicy(password, {
      fullName: profile?.full_name ?? "",
      email: user?.email ?? "",
      phone: profile?.phone ?? "",
    });
    if (policyError) {
      setError(policyError);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível redefinir a senha. Peça um novo link e tente de novo.");
      return;
    }

    setDone(true);
  }

  return (
    <div className="portal-auth">
      <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
      </Link>
      <div className="portal-auth-card">
        <h1>Crie uma nova senha</h1>
        <p className="lead">Escolha uma nova senha para acessar a Área de Parceiro.</p>

        {sessionCheck === "checking" ? (
          <p>Verificando link…</p>
        ) : sessionCheck === "invalid" ? (
          <>
            <p className="pf-error">Esse link é inválido ou já expirou.</p>
            <Link className="btn btn-wa btn-lg" href="/parceiros/login" style={{ marginTop: 12 }}>
              Pedir um novo link
            </Link>
          </>
        ) : done ? (
          <>
            <p className="pf-success">Senha alterada com sucesso!</p>
            <Link className="btn btn-wa btn-lg" href={loginPath} style={{ marginTop: 12 }}>
              Entrar novamente
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="pf-label" htmlFor="password">Nova senha</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pf-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={10}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <p className="pf-hint">Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>

            <label className="pf-label" htmlFor="confirmPassword">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
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
        )}
      </div>
    </div>
  );
}
