"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/parceiros/dashboard";

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/parceiros/login");
        return;
      }
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp.find((f) => f.status === "verified");
      if (!verified) {
        router.push(redirectTo);
        return;
      }
      setFactorId(verified.id);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
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
        setError("Código inválido. Tente de novo.");
        return;
      }

      // Mesma separação do login: nunca manda uma conta de parceiro pra
      // /admin por causa de um ?redirect= antigo (ex.: sessão expirou numa
      // página do admin antes, ou o teste usou essa conta como admin antes).
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        : { data: null };
      const isStaff = profile?.role === "admin" || profile?.role === "operator";
      const target = redirectTo.startsWith("/admin") && !isStaff ? "/parceiros/dashboard" : redirectTo;

      // Navegação completa (não router.push) de propósito: garante que o
      // cookie de sessão já elevado (aal2) esteja salvo antes da próxima
      // requisição chegar no middleware — com router.push existe uma corrida
      // em que o middleware ainda vê a sessão antiga e manda de volta pra
      // essa mesma tela, parecendo que o botão travou.
      window.location.href = target;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-auth">
      <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-main.png" alt="Patas & Passos" />
      </Link>
      <div className="portal-auth-card">
        <h1>Verificação em duas etapas</h1>
        <p className="lead">Digite o código do seu app autenticador pra continuar.</p>

        {loading && !factorId ? (
          <p>Carregando…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="pf-label" htmlFor="mfa-code">Código de 6 dígitos</label>
            <input
              id="mfa-code"
              className="pf-input"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="pf-error">{error}</p>}
            <button className="pf-submit" type="submit" disabled={loading}>
              {loading ? "Verificando…" : "Confirmar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MfaChallengePage() {
  return (
    <Suspense fallback={null}>
      <MfaChallengeForm />
    </Suspense>
  );
}
