"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserStatusToggle({ userId, active }: { userId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível atualizar.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={active ? "btn btn-danger btn-sm" : "btn btn-wa btn-sm"}
        disabled={loading}
        onClick={toggle}
      >
        {active ? "Desativar" : "Ativar"}
      </button>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
