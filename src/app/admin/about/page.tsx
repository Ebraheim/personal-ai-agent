import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AboutManager from "./AboutManager";

export default async function AdminAboutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [
    { data: siteContent },
    { data: careerFocus },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("site_content")
      .select(
        "about_label, about_heading, about_primary_text, about_secondary_text, about_focus_heading"
      )
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("career_focus")
      .select("id, title, display_order, is_visible")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("profiles")
      .select("slug")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const previewHref = profile?.slug ? `/${profile.slug}#about` : "/#about";

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <a href="/admin/dashboard" className="text-sm text-cyan-300 transition hover:text-cyan-200">
          ← Back to Dashboard
        </a>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              About Section
            </p>
            <h1 className="text-4xl font-bold md:text-5xl">Edit About</h1>
            <p className="mt-4 max-w-2xl text-white/50">
              Everything here controls the About section shown on your public website.
            </p>
          </div>

          <a href={previewHref} target="_blank" rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white">
            Preview About ↗
          </a>
        </div>

        <div className="mt-10">
          <AboutManager
            userId={user.id}
            initialSectionContent={{
              about_label: siteContent?.about_label ?? "",
              about_heading: siteContent?.about_heading ?? "",
              about_primary_text: siteContent?.about_primary_text ?? "",
              about_secondary_text: siteContent?.about_secondary_text ?? "",
              about_focus_heading: siteContent?.about_focus_heading ?? "",
            }}
            initialCareerFocus={careerFocus ?? []}
          />
        </div>
      </div>
    </main>
  );
}

