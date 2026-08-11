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

  const { data: certifications } = await supabase
    .from("certifications")
    .select(
      "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
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
            Certifications Manager
          </p>

          <h1 className="text-4xl font-bold">
            Manage Certifications
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Add, edit, hide, show, and remove certifications from your
            portfolio.
          </p>
        </div>

        <div className="mt-10">
          <CertificationsManager
            userId={user.id}
            initialCertifications={certifications ?? []}
          />
        </div>
      </div>
    </main>
  );
}