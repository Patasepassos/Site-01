"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerToggle({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/owner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOwner: !isOwner }),
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
      <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={toggle}>
        {isOwner ? "Remover admin chefe" : "Tornar admin chefe"}
      </button>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
