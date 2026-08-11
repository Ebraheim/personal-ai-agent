"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
    >
      Log Out
    </button>
  );
}