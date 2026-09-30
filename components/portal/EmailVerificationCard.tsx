"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailVerificationCard({ email, verified }: { email: string; verified: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/email/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível verificar agora.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/email/enviar-codigo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o código agora.");
        return;
      }
      setInfo("Código enviado! Confira sua caixa de entrada.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível alterar o e-mail agora.");
        return;
      }
      setChanging(false);
      setNewEmail("");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (changing) {
    return (
      <form onSubmit={handleChangeEmail} style={{ marginTop: 10 }}>
        <label className="pf-label" htmlFor="newEmail">Novo e-mail</label>
        <input
          id="newEmail"
          type="email"
          className="pf-input"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <p className="pf-hint">Você vai precisar confirmar o novo e-mail com um código antes de continuar.</p>
        {error && <p className="pf-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="pf-submit" type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Trocar e-mail"}
          </button>
          <button type="button" className="btn btn-sm" disabled={loading} onClick={() => setChanging(false)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  if (verified) {
    return (
      <div style={{ marginTop: 6 }}>
        <button type="button" className="btn btn-sm" onClick={() => setChanging(true)}>
          Trocar e-mail
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: 13, marginBottom: 8 }}>
        Enviamos um código de 6 dígitos para <b>{email}</b>. Digite abaixo para confirmar.
      </p>
      <form onSubmit={handleVerify} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="pf-input"
          style={{ maxWidth: 140 }}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button className="pf-submit" type="submit" disabled={loading} style={{ width: "auto" }}>
          {loading ? "Verificando…" : "Confirmar"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={handleResend}>
          Reenviar código
        </button>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={() => setChanging(true)}>
          Digitei o e-mail errado
        </button>
      </div>
      {error && <p className="pf-error" style={{ marginTop: 8 }}>{error}</p>}
      {info && <p className="pf-success" style={{ marginTop: 8 }}>{info}</p>}
    </div>
  );
}
