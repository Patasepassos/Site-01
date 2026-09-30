"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AvatarKey } from "@/lib/supabase/types";
import { AVATAR_KEYS, AVATAR_LABELS, avatarSrc } from "@/lib/partners/avatars";

export default function AvatarPicker({ currentAvatarKey }: { currentAvatarKey: AvatarKey }) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [loading, setLoading] = useState<AvatarKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseAvatar(avatarKey: AvatarKey) {
    if (avatarKey === currentAvatarKey) {
      setPicking(false);
      return;
    }
    setError(null);
    setLoading(avatarKey);
    try {
      const res = await fetch("/api/parceiros/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível trocar o avatar.");
        return;
      }
      setPicking(false);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc(currentAvatarKey)}
          alt={AVATAR_LABELS[currentAvatarKey]}
          width={72}
          height={72}
          style={{ borderRadius: "50%" }}
        />
        <button type="button" className="btn btn-sm" onClick={() => setPicking((v) => !v)}>
          {picking ? "Cancelar" : "Trocar avatar"}
        </button>
      </div>

      {picking && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 14, marginBottom: 10 }}>Escolha seu companheiro 🐾</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
              gap: 12,
              maxWidth: 420,
            }}
          >
            {AVATAR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => chooseAvatar(key)}
                disabled={loading !== null}
                title={AVATAR_LABELS[key]}
                style={{
                  background: "none",
                  border: key === currentAvatarKey ? "3px solid var(--brown-2)" : "3px solid transparent",
                  borderRadius: "50%",
                  padding: 2,
                  cursor: "pointer",
                  opacity: loading && loading !== key ? 0.5 : 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc(key)} alt={AVATAR_LABELS[key]} width={64} height={64} style={{ borderRadius: "50%" }} />
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 12 }}>
            Ícones: Kat_Branch /{" "}
            <a href="https://www.freepik.com" target="_blank" rel="noopener noreferrer">
              Freepik
            </a>
          </p>
        </div>
      )}

      {error && <p className="pf-error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
