import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SkillsManager from "./SkillsManager";

export default async function AdminSkillsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [{ data: skills }, { data: siteContent }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, title, description, display_order, is_visible")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("site_content")
      .select(
        "skills_label, skills_heading, skills_description"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
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
              Skills Section
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Edit Skills
            </h1>

            <p className="mt-4 max-w-2xl text-white/50">
              Everything here controls the Skills section shown on your public
              website.
            </p>
          </div>

          <a
            href="/#skills"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white"
          >
            Preview Skills ↗
          </a>
        </div>

        <div className="mt-10">
          <SkillsManager
            userId={user.id}
            initialSkills={skills ?? []}
            initialSectionContent={{
              skills_label: siteContent?.skills_label ?? "",
              skills_heading: siteContent?.skills_heading ?? "",
              skills_description: siteContent?.skills_description ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}