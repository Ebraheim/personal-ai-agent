import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeEditor from "./HomeEditor";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [{ data: profile }, { data: highlights }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, professional_title, hero_tagline, bio"
      )
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("hero_highlights")
      .select(
        "id, label, display_order, is_visible"
      )
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <a
          href="/admin/dashboard"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Home Section
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Edit Home
            </h1>

            <p className="mt-4 max-w-2xl text-white/50">
              Everything here controls the main Home section visitors see when
              they first open your website.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white"
          >
            Preview Website ↗
          </a>
        </div>

        <div className="mt-10">
          <HomeEditor
            userId={user.id}
            initialProfile={{
              full_name: profile?.full_name ?? "",
              professional_title:
                profile?.professional_title ?? "",
              hero_tagline: profile?.hero_tagline ?? "",
              bio: profile?.bio ?? "",
            }}
            initialHighlights={highlights ?? []}
          />
        </div>
      </div>
    </main>
  );
}