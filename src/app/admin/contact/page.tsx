import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ContactManager from "./ContactManager";

export default async function AdminContactPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const [{ data: siteContent }, { data: profile }] = await Promise.all([
    supabase
      .from("site_content")
      .select("contact_label, contact_heading, contact_description")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("profiles")
      .select("location, email, linkedin_url, github_url")
      .eq("id", user.id)
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
              Contact Section
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Edit Contact
            </h1>

            <p className="mt-4 max-w-2xl text-white/50">
              Control the contact text and contact links shown on your public website.
            </p>
          </div>

          <a
            href="/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/30 hover:text-white"
          >
            Preview Contact ↗
          </a>
        </div>

        <div className="mt-10">
          <ContactManager
            userId={user.id}
            initialContent={{
              contact_label: siteContent?.contact_label ?? "",
              contact_heading: siteContent?.contact_heading ?? "",
              contact_description: siteContent?.contact_description ?? "",
              location: profile?.location ?? "",
              email: profile?.email ?? user.email ?? "",
              linkedin_url: profile?.linkedin_url ?? "",
              github_url: profile?.github_url ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}