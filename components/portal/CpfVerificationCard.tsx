"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CpfVerifyResponse = { status?: string; error?: string };

export default function CpfVerificationCard({ cpfMasked, verified }: { cpfMasked: string; verified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parceiros/cpf/verificar", { method: "POST" });
      const data = (await res.json()) as CpfVerifyResponse;

      if (!res.ok) {
        setError("Não foi possível verificar o CPF agora. Tente novamente.");
        return;
      }
      if (data.status === "failed") {
        setError("CPF não pôde ser validado. Confira os dados informados e tente novamente.");
        return;
      }
      if (data.status === "pending") {
        // API indisponível no momento -- o backend já registrou o motivo técnico.
        setError("Não foi possível verificar o CPF agora. Tente novamente.");
        return;
      }
      // status === "verified"
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (verified) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: 13, marginBottom: 8 }}>
        Para concluir seu cadastro, precisamos validar seu CPF (<b>{cpfMasked}</b>).
      </p>
      <button type="button" className="pf-submit" style={{ width: "auto" }} disabled={loading} onClick={verify}>
        {loading ? "Verificando CPF..." : "Verificar CPF"}
      </button>
      {error && <p className="pf-error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
