import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SectionsManager from "./SectionsManager";

export default async function AdminSectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: sections } = await supabase
    .from("sections")
    .select("id, section_key, label, display_order, is_visible")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

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
            Section Manager
          </p>

          <h1 className="text-4xl font-bold">Manage Website Sections</h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Control section names, visibility, and display order for your public
            website.
          </p>
        </div>

        <div className="mt-10">
          <SectionsManager
            userId={user.id}
            initialSections={sections ?? []}
          />
        </div>
      </div>
    </main>
  );
}