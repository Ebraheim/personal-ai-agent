import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, slug, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/admin/dashboard");
  }

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Welcome
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Make your CV stand out, {firstName}.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">
            Turn your student or graduate CV into a polished personal website
            with projects, skills, education, achievements, and an AI assistant
            that can answer questions using your verified information.
          </p>
        </div>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-sm font-semibold text-cyan-300">
              1
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Upload your CV
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Upload your current PDF CV with your education, skills,
              internships, projects, certifications, and achievements.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-semibold text-white/60">
              2
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Review the AI extraction
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Check what AI extracted and choose exactly what should appear on
              your personal website.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-semibold text-white/60">
              3
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Share one better link
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Use your website alongside job applications, internships,
              LinkedIn, networking, and your normal CV.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.035] p-7 md:p-9">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-300">
                Recommended
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Build from your CV
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                This is the fastest way to create your website. Nothing is
                imported until you review the extracted information and press
                Confirm Import.
              </p>
            </div>

            <Link
              href="/admin/cv"
              className="shrink-0 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-black transition hover:bg-cyan-200"
            >
              Upload & Import CV →
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-medium text-white/75">
                Want to build it yourself?
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/35">
                You can skip CV import and manually add your information,
                projects, skills, education, and achievements.
              </p>
            </div>

            <Link
              href="/admin/home"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/60 transition hover:border-cyan-300/25 hover:text-white"
            >
              Set Up Manually
            </Link>
          </div>
        </section>

        {profile?.slug && (
          <p className="mt-8 text-center text-xs text-white/25">
            Your personal website is reserved at /{profile.slug}
          </p>
        )}
      </div>
    </main>
  );
}