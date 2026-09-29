"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/partners/labels";
import type { PartnerNotificationRow } from "@/lib/supabase/types";

export default function NotificationsCard({
  notifications,
  unreadCount,
}: {
  notifications: PartnerNotificationRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (notifications.length === 0) return null;

  async function markAllRead() {
    setLoading(true);
    try {
      await fetch("/api/parceiros/notificacoes", { method: "PATCH" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2>🔔 Notificações</h2>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={markAllRead}>
            Marcar como lidas
          </button>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        {notifications.map((n) => (
          <div className="referral-row" key={n.id}>
            <div>
              <div className="rr-id">{n.message}</div>
              <div className="rr-meta">{formatDate(n.created_at)}</div>
            </div>
            {!n.read_at && <span className="status-pill tone-pending">Novo</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
