"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton({
  label = "Sair",
  redirectTo = "/parceiros/login",
}: {
  label?: string;
  redirectTo?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button type="button" className="portal-logout" onClick={handleLogout}>
      {label}
    </button>
  );
}
