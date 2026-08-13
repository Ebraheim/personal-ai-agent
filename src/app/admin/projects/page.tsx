import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectsManager from "./ProjectsManager";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [
    { data: projects },
    { data: siteContent },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, title, short_description, full_description, technologies, project_url, github_url, cover_image_url, highlight, status, display_order, is_visible"
      )
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("site_content")
      .select("projects_label, projects_heading, projects_description")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("profiles")
      .select("slug")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const previewHref = profile?.slug
    ? `/${profile.slug}#projects`
    : "/#projects";

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
              Projects Section
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">Edit Projects</h1>

            <p className="mt-4 max-w-2xl text-white/50">
              Everything here controls the Projects section shown on your public
              website.
            </p>
          </div>

          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white"
          >
            Preview Projects ↗
          </a>
        </div>

        <div className="mt-10">
          <ProjectsManager
            userId={user.id}
            initialProjects={projects ?? []}
            initialSectionContent={{
              projects_label: siteContent?.projects_label ?? "",
              projects_heading: siteContent?.projects_heading ?? "",
              projects_description: siteContent?.projects_description ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}