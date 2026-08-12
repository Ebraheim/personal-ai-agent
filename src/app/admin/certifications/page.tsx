import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CertificationsManager from "./CertificationsManager";

export default async function AdminCertificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [
    { data: certifications },
    { data: siteContent },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("certifications")
      .select(
        "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
      )
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),

    supabase
      .from("site_content")
      .select(
        "certifications_label, certifications_heading, certifications_description"
      )
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("profiles")
      .select("slug")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const previewHref = profile?.slug
    ? `/${profile.slug}#certifications`
    : "/#certifications";

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <a href="/admin/dashboard" className="text-sm text-cyan-300 transition hover:text-cyan-200">
          ← Back to Dashboard
        </a>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Certifications Section
            </p>
            <h1 className="text-4xl font-bold md:text-5xl">Edit Certifications</h1>
            <p className="mt-4 max-w-2xl text-white/50">
              Everything here controls the Certifications section shown on your public website.
            </p>
          </div>

          <a href={previewHref} target="_blank" rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white">
            Preview Certifications ↗
          </a>
        </div>

        <div className="mt-10">
          <CertificationsManager
            userId={user.id}
            initialCertifications={certifications ?? []}
            initialSectionContent={{
              certifications_label: siteContent?.certifications_label ?? "",
              certifications_heading: siteContent?.certifications_heading ?? "",
              certifications_description: siteContent?.certifications_description ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}

