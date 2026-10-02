"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/partners/labels";
import type { PartnerNotificationRow } from "@/lib/supabase/types";

export default function NotificationBell({
  partnerId,
  notifications,
  unreadCount,
}: {
  partnerId: string;
  notifications: PartnerNotificationRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Mesmo canal de tempo real do card de notificações -- o sininho no topo
  // também atualiza sozinho assim que uma notificação nova é gravada.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`partner-notification-bell-${partnerId}`)
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
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-bell-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Notificações"
      >
        🔔
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-bell-panel">
          <div className="notif-bell-head">
            <span>🔔 Notificações</span>
            {unreadCount > 0 && (
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={markAllRead}>
                Marcar como lidas
              </button>
            )}
          </div>
          <div className="notif-bell-list">
            {notifications.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(245,239,230,.6)", padding: "12px 16px" }}>
                Nenhuma novidade ainda. Você será avisado aqui assim que houver atualização nas suas indicações.
              </p>
            ) : (
              notifications.map((n) => (
                <div className="notif-bell-item" key={n.id}>
                  <div>{n.message}</div>
                  <div className="notif-bell-item-meta">
                    {formatDate(n.created_at)}
                    {!n.read_at && <span className="status-pill tone-pending">Novo</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
