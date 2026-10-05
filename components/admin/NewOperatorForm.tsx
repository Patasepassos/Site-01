"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function NewOperatorForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar o operador.");
        return;
      }
      setSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="op-name">Nome completo</label>
      <input id="op-name" className="pf-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

      <div className="pf-row">
        <div>
          <label className="pf-label" htmlFor="op-email">E-mail</label>
          <input id="op-email" type="email" className="pf-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="pf-label" htmlFor="op-phone">WhatsApp</label>
          <input id="op-phone" className="pf-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 91234-5678" required />
        </div>
      </div>

      <label className="pf-label" htmlFor="op-password">Senha inicial</label>
      <PasswordInput
        id="op-password"
        className="pf-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={10}
        required
      />
      <p className="pf-hint">Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo.</p>

      {error && <p className="pf-error">{error}</p>}
      {success && <p className="pf-success">Operador criado com sucesso.</p>}

      <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 16 }} disabled={loading}>
        {loading ? "Criando…" : "Criar operador"}
      </button>
    </form>
  );
}
