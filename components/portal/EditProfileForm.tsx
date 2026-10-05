"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PixKeyType } from "@/lib/supabase/types";

const PIX_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  aleatoria: "Chave aleatória",
};

export default function EditProfileForm({
  initialPhone,
  initialPixKey,
  initialPixKeyType,
}: {
  initialPhone: string;
  initialPixKey: string;
  initialPixKeyType: PixKeyType;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [pixKey, setPixKey] = useState(initialPixKey);
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(initialPixKeyType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/parceiros/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pixKey, pixKeyType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="phone">WhatsApp</label>
      <input id="phone" className="pf-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />

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
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="pf-label" htmlFor="pixKey">Chave Pix</label>
          <input id="pixKey" className="pf-input" value={pixKey} onChange={(e) => setPixKey(e.target.value)} required />
        </div>
      </div>

      {error && <p className="pf-error">{error}</p>}
      {success && <p className="pf-success">Dados atualizados!</p>}

      <button className="pf-submit" type="submit" disabled={loading}>
        {loading ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
