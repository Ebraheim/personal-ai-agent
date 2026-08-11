import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeroHighlightsManager from "./HeroHighlightsManager";

export default async function AdminHeroHighlightsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: highlights } = await supabase
    .from("hero_highlights")
    .select("id, label, display_order, is_visible")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href="/admin/dashboard"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Hero Highlights Manager
          </p>

          <h1 className="text-4xl font-bold">
            Manage Hero Highlights
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Control the short highlight labels shown under the main hero buttons
            on your public website.
          </p>
        </div>

        <div className="mt-10">
          <HeroHighlightsManager
            userId={user.id}
            initialHighlights={highlights ?? []}
          />
        </div>
      </div>
    </main>
  );
}