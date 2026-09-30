"use client";

import Link from "next/link";
import { useState } from "react";
import { onlyDigits } from "@/lib/partners/validation";
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
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (couponCode) {
    return (
      <div className="portal-auth">
        <Link className="portal-auth-brand" href="/" aria-label="Voltar para o site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-main.png" alt="Patas & Passos" />
        </Link>
        <div className="portal-auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🐾</div>
          <h1>Cadastro enviado!</h1>
          <p className="lead">
            Seu cupom exclusivo é <b>{couponCode}</b>. Sua conta está <b>aguardando aprovação</b>{" "}
            da Patas &amp; Passos — assim que for aprovada, seu painel libera automaticamente.
          </p>
          <Link className="btn btn-wa btn-lg" href="/parceiros/login" style={{ marginTop: 18 }}>
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
        <h1>Seja nosso parceiro 🐾</h1>
        <p className="lead">Indique, conecte e ganhe com a Patas &amp; Passos.</p>

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
            </div>
            <div>
              <label className="pf-label" htmlFor="confirmPassword">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
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
          Já é parceiro? <Link href="/parceiros/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
