import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSettingsClient from "./AccountSettingsClient";

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const websiteHref = profile?.slug
    ? `/${profile.slug}`
    : "/";

  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <header className="border-b border-white/10 bg-[#070b12]/95">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
              Account Settings
            </p>

            <h1 className="mt-1 text-xl font-semibold">
              Manage Your Account
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              ← Dashboard
            </Link>

            <Link
              href={websiteHref}
              target="_blank"
              className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
            >
              View Website ↗
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <AccountSettingsClient
          email={user.email ?? ""}
          websiteHref={websiteHref}
        />
      </div>
    </main>
  );
}