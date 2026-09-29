"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WhatsappVerifyToggle({ partnerId, verified }: { partnerId: string; verified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/admin/parceiros/${partnerId}/whatsapp-verificado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !verified }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={verified ? "btn btn-danger btn-sm" : "btn btn-wa btn-sm"} disabled={loading} onClick={toggle}>
      {verified ? "Desmarcar WhatsApp verificado" : "Confirmar WhatsApp verificado"}
    </button>
  );
}
