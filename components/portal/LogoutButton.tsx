"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/parceiros/login");
    router.refresh();
  }

  return (
    <button type="button" className="portal-logout" onClick={handleLogout}>
      Sair
    </button>
  );
}
