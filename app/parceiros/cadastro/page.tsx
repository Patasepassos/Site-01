"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onlyDigits } from "@/lib/partners/validation";
import { waLink, waMessages } from "@/lib/site";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import EmailVerificationCard from "@/components/portal/EmailVerificationCard";
import PasswordInput from "@/components/ui/PasswordInput";
import RankUpIntro from "@/components/portal/RankUpIntro";
import type { PixKeyType } from "@/lib/supabase/types";

const PIX_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  aleatoria: "Chave aleatória",
};

export default function CadastroParceiroPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  // "Quero ser parceiro" sempre cai aqui primeiro -- escolhe entre o
  // cadastro de afiliado (autosservico, abaixo) ou parceria de empresa
  // (negociação manual, vai direto pro WhatsApp em vez de formulário).
  const [intent, setIntent] = useState<"choice" | "affiliate">("choice");

  // Mostra a evolução de Rank só na transição pra tela de sucesso (nunca de
  // novo ao atualizar a página — um F5 aqui volta pro formulário, já que
  // couponCode não é persistido em lugar nenhum). Todo cadastro novo começa
  // no Filhote, por isso o nível é fixo aqui.
  useEffect(() => {
    if (couponCode) setShowRankUp(true);
  }, [couponCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/parceiros/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          cpfCnpj,
          birthDate: onlyDigits(cpfCnpj).length === 11 ? birthDate : undefined,
          password,
          confirmPassword,
          pixKey,
          pixKeyType,
          termsAccepted,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir o cadastro.");
        return;
      }

      setCouponCode(data.couponCode);

      // Login automático: o código de verificação de e-mail exige uma sessão
      // (supabase.auth.getUser()), e a conta ainda "pendente" não tem acesso
      // ao portal — sem isso o parceiro nunca conseguiria usar o código antes
      // dele expirar em 10 minutos. Se o login automático falhar por algum
      // motivo, o cadastro já foi concluído mesmo assim; o parceiro só
      // precisará verificar o e-mail depois, pelo login normal.
      try {
        await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
      } catch {
        // silencioso: cadastro já foi concluído, verificação fica para depois
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (intent === "choice") {
    return (
      <div className="portal-auth">
        <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="portal-auth-card" style={{ textAlign: "center" }}>
          <h1>Você chegou ao lugar de quem quer fazer a diferença 🐾</h1>
          <p className="lead">
            Cada indicação pode representar um passeio, uma rotina melhor, uma família mais
            tranquila. Escolha como você quer participar.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <button type="button" className="btn btn-wa btn-lg" onClick={() => setIntent("affiliate")}>
              Quero fazer a diferença
            </button>
            <a
              className="btn btn-white btn-lg"
              href={waLink(waMessages.parceriaEmpresa)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Parceria de Empresa
            </a>
          </div>

          <p className="pf-link">
            Já faz parte? <Link href="/parceiros/login">Entrar</Link>
          </p>
        </div>
      </div>
    );
  }

  if (couponCode) {
    return (
      <div className="portal-auth">
        {showRankUp && <RankUpIntro rankKey="filhote" onClose={() => setShowRankUp(false)} />}
        <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="portal-auth-card welcome-card" style={{ textAlign: "center" }}>
          <div className="welcome-icon" style={{ fontSize: 44, marginBottom: 10 }}>🎉🐾</div>
          <h1>Seja muito bem-vindo à Patas &amp; Passos!</h1>
          <p className="lead">
            Estamos muito felizes em receber você! Obrigado por escolher fazer parte da nossa rede
            de parceiros. Seu cadastro foi recebido com muito carinho e agora passará pela nossa
            análise.
          </p>
          <p className="lead">
            Estamos construindo uma parceria feita para crescer junto, e esperamos ter você com a
            gente nessa jornada. 💛
          </p>
          <p className="lead">Obrigado pela confiança. Será um prazer ter você no nosso time!</p>
          <p className="lead" style={{ marginTop: 14 }}>
            Seu cupom exclusivo é <b>{couponCode}</b>. Sua conta está <b>aguardando aprovação</b>{" "}
            da Patas &amp; Passos — assim que for aprovada, seu painel libera automaticamente.
          </p>

          <div style={{ textAlign: "left", marginTop: 16 }}>
            {emailVerified ? (
              <p className="pf-success">✅ E-mail verificado! Já pode aguardar a aprovação tranquilo.</p>
            ) : (
              <EmailVerificationCard email={email} verified={false} onVerified={() => setEmailVerified(true)} />
            )}
          </div>

          <a
            className="btn btn-wa btn-lg"
            style={{ marginTop: 18 }}
            href={waLink(
              `Olá! Acabei de me cadastrar como parceiro(a) da Patas & Passos. Meu nome é ${fullName} e meu cupom é ${couponCode}. Só queria avisar que estou interessado(a)! 🐾`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Avisar no WhatsApp 📲
          </a>
          <Link className="btn btn-white btn-lg" href="/parceiros/login" style={{ marginTop: 10 }}>
            Ir para o login
          </Link>
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
        <h1>Quero fazer a diferença 🐾</h1>
        <p className="lead">Você indica. A gente cuida. E você também é recompensado por isso.</p>

        <form onSubmit={handleSubmit}>
          <label className="pf-label" htmlFor="fullName">Nome completo</label>
          <input
            id="fullName"
            className="pf-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label className="pf-label" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="pf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="pf-label" htmlFor="phone">WhatsApp</label>
          <input
            id="phone"
            className="pf-input"
            placeholder="(11) 91234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label className="pf-label" htmlFor="cpfCnpj">CPF ou CNPJ</label>
          <input
            id="cpfCnpj"
            className="pf-input"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            required
          />

          {onlyDigits(cpfCnpj).length === 11 && (
            <>
              <label className="pf-label" htmlFor="birthDate">Data de nascimento</label>
              <input
                id="birthDate"
                type="date"
                className="pf-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
              <p className="pf-hint">Usamos pra confirmar seu CPF automaticamente antes de liberar pagamentos.</p>
            </>
          )}

          <div className="pf-row">
            <div>
              <label className="pf-label" htmlFor="password">Senha</label>
              <PasswordInput
                id="password"
                className="pf-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={10}
                required
              />
              <p className="pf-hint">Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>
            </div>
            <div>
              <label className="pf-label" htmlFor="confirmPassword">Confirmar senha</label>
              <PasswordInput
                id="confirmPassword"
                className="pf-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={10}
                required
              />
            </div>
          </div>

          <div className="pf-row">
            <div>
              <label className="pf-label" htmlFor="pixKeyType">Tipo de chave Pix</label>
              <select
                id="pixKeyType"
                className="pf-select"
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
              >
                {Object.entries(PIX_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="pf-label" htmlFor="pixKey">Chave Pix</label>
              <input
                id="pixKey"
                className="pf-input"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                required
              />
            </div>
          </div>

          <label className="pf-check">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            Li e aceito os{" "}
            <Link href="/parceiros/regras" target="_blank">
              termos da parceria
            </Link>
            .
          </label>

          {error && <p className="pf-error">{error}</p>}

          <button className="pf-submit" type="submit" disabled={loading || !termsAccepted}>
            {loading ? "Enviando…" : "Quero ser parceiro"}
          </button>
        </form>

        <p className="pf-link">
          Já faz parte? <Link href="/parceiros/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
