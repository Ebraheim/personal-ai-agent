import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteContentForm from "./SiteContentForm";

export default async function AdminSiteContentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: siteContent } = await supabase
    .from("site_content")
    .select(
      `
      id,
      about_label,
      about_heading,
      about_secondary_text,
      projects_label,
      projects_description,
      contact_label,
      contact_heading,
      contact_description
      `
    )
    .eq("user_id", user.id)
    .maybeSingle();

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
            Website Text Manager
          </p>

          <h1 className="text-4xl font-bold">
            Edit Website Content
          </h1>

          <p className="mt-4 max-w-3xl text-white/50">
            Control the text shown in your About, Projects, and Contact sections.
          </p>
        </div>

        <div className="mt-10">
          <SiteContentForm
            userId={user.id}
            initialContent={siteContent}
          />
        </div>
      </div>
    </main>
  );
}