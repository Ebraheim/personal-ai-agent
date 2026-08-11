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

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, title, short_description, full_description, technologies, project_url, github_url, status, display_order, is_visible"
    )
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <a
          href="/admin/dashboard"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Projects Manager
          </p>

          <h1 className="text-4xl font-bold">
            Manage Projects
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Add, edit, hide, show, and remove projects from your portfolio.
          </p>
        </div>

        <div className="mt-10">
          <ProjectsManager
            userId={user.id}
            initialProjects={projects ?? []}
          />
        </div>
      </div>
    </main>
  );
}