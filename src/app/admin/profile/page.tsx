import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, professional_title, hero_tagline, bio, location, email, linkedin_url, github_url"
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <a
          href="/admin/dashboard"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-8">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
            Profile Manager
          </p>

          <h1 className="text-4xl font-bold">Edit Profile</h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Update the information used across your personal website and later
            by your AI agent.
          </p>
        </div>

        <div className="mt-10">
          <ProfileForm
            userId={user.id}
            initialProfile={{
              full_name: profile?.full_name ?? "",
              professional_title: profile?.professional_title ?? "",
              hero_tagline: profile?.hero_tagline ?? "",
              bio: profile?.bio ?? "",
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