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

  const { data: knowledge } = await supabase
    .from("agent_knowledge")
    .select("id, title, content, category, is_active, priority")
    .eq("user_id", user.id)
    .order("priority", { ascending: false })
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
            AI Knowledge Manager
          </p>

          <h1 className="text-4xl font-bold">
            Manage Agent Knowledge
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Add and control verified information that your personal AI agent
            can use when answering questions.
          </p>
        </div>

        <div className="mt-10">
          <KnowledgeManager
            userId={user.id}
            initialKnowledge={knowledge ?? []}
          />
        </div>
      </div>
    </main>
  );
}