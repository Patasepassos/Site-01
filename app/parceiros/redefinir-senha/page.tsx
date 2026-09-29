"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validatePasswordPolicy } from "@/lib/partners/password-policy";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    setTimeout(() => router.push("/parceiros/login"), 2000);
  }

  return (
    <div className="portal-auth">
      <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
      </Link>
      <div className="portal-auth-card">
        <h1>Nova senha</h1>
        <p className="lead">Escolha uma nova senha para acessar o Portal do Parceiro.</p>

        {done ? (
          <p className="pf-success">Senha atualizada! Redirecionando para o login…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="pf-label" htmlFor="password">Nova senha</label>
            <input
              id="password"
              type="password"
              className="pf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              required
            />
            <p className="pf-hint">Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>

            <label className="pf-label" htmlFor="confirmPassword">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              className="pf-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={10}
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
