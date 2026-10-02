"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/partners/labels";
import type { PartnerNotificationRow } from "@/lib/supabase/types";

export default function NotificationsCard({
  partnerId,
  notifications,
  unreadCount,
}: {
  partnerId: string;
  notifications: PartnerNotificationRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Tempo real: quando uma notificação nova é gravada pra esse parceiro, o
  // card atualiza sozinho (refetch do server component) — sem precisar de F5.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`partner-notifications-${partnerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "partner_notifications", filter: `partner_id=eq.${partnerId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

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
        {notifications.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            Nenhuma novidade ainda. Assim que a gente mover uma das suas indicações (em contato, serviço
            contratado, fechada...) ou liberar uma comissão, o aviso aparece aqui.
          </p>
        ) : (
          notifications.map((n) => (
            <div className="referral-row" key={n.id}>
              <div>
                <div className="rr-id">{n.message}</div>
                <div className="rr-meta">{formatDate(n.created_at)}</div>
              </div>
              {!n.read_at && <span className="status-pill tone-pending">Novo</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
