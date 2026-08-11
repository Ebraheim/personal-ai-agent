import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KnowledgeManager from "./KnowledgeManager";

export default async function AdminKnowledgePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [{ data: knowledge }, { data: siteContent }] = await Promise.all([
    supabase
      .from("agent_knowledge")
      .select("id, title, content, category, is_active, priority")
      .eq("user_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false }),

    supabase
      .from("site_content")
      .select("ai_label, ai_heading, ai_description")
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
              AI Assistant Section
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Edit AI Assistant
            </h1>

            <p className="mt-4 max-w-2xl text-white/50">
              Control the public AI Assistant section and the verified knowledge
              the assistant is allowed to use.
            </p>
          </div>

          <a
            href="/#agent"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white"
          >
            Preview AI Assistant ↗
          </a>
        </div>

        <div className="mt-10">
          <KnowledgeManager
            userId={user.id}
            initialKnowledge={knowledge ?? []}
            initialSectionContent={{
              ai_label: siteContent?.ai_label ?? "",
              ai_heading: siteContent?.ai_heading ?? "",
              ai_description: siteContent?.ai_description ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}