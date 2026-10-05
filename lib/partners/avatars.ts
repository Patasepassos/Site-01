import type { AvatarKey } from "@/lib/supabase/types";

export const AVATAR_KEYS: AvatarKey[] = ["pig", "sheep", "chicken", "dog", "horse", "turtle", "cat"];

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  pig: "Porquinho",
  sheep: "Ovelha",
  chicken: "Galinha",
  dog: "Cachorro",
  horse: "Cavalo",
  turtle: "Tartaruga",
  cat: "Gato",
};

export function isAvatarKey(value: unknown): value is AvatarKey {
  return typeof value === "string" && (AVATAR_KEYS as string[]).includes(value);
}

export function avatarSrc(key: AvatarKey): string {
  return `/avatars/${key}.png`;
}
