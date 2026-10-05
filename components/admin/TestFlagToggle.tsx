"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TestFlagToggle({
  kind,
  id,
  isTest,
}: {
  kind: "parceiros" | "clientes";
  id: string;
  isTest: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/admin/${kind}/${id}/marcar-teste`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTest: !isTest }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={toggle}>
      {isTest ? "Desmarcar teste" : "Marcar como teste"}
    </button>
  );
}
