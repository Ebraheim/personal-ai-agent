import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#070b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Private Admin
            </p>

            <h1 className="text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-4 text-white/50">
              Signed in as {user.email}
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* PROFILE */}
          <Link
            href="/admin/profile"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Profile</p>

            <h2 className="mt-2 text-xl font-semibold">
              Edit Profile
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Update your name, headline, biography, contact information,
              and social links.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Profile Manager →
            </p>
          </Link>

          {/* WEBSITE TEXT */}
          <Link
            href="/admin/site-content"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Website Text</p>

            <h2 className="mt-2 text-xl font-semibold">
              Website Text Manager
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Edit the About, Projects, and Contact wording shown on the public
              website.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Website Text Manager →
            </p>
          </Link>

          {/* PROJECTS */}
          <Link
            href="/admin/projects"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Projects</p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage Projects
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add, edit, remove, and organize projects shown on your website.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Projects Manager →
            </p>
          </Link>

          {/* SKILLS */}
          <Link
            href="/admin/skills"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Skills</p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage Skills
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add, edit, hide, show, and organize technical skill groups.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Skills Manager →
            </p>
          </Link>

          {/* CAREER FOCUS */}
          <Link
            href="/admin/career-focus"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Career Focus</p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage Career Focus
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add, edit, hide, show, and organize career directions displayed
              on your portfolio.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Career Focus Manager →
            </p>
          </Link>

          {/* HERO HIGHLIGHTS */}
          <Link
            href="/admin/hero-highlights"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Hero Highlights</p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage Hero Highlights
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Control the short highlight labels shown beneath the main hero
              buttons.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Hero Highlights Manager →
            </p>
          </Link>

          {/* CERTIFICATIONS */}
          <Link
            href="/admin/certifications"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Certifications</p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage Certifications
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add certificates, learning records, credential links,
              and status.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Certifications Manager →
            </p>
          </Link>

          {/* CV */}
          <Link
            href="/admin/cv"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">CV</p>

            <h2 className="mt-2 text-xl font-semibold">
              CV Manager
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Upload, view, replace, or remove your latest CV.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open CV Manager →
            </p>
          </Link>

          {/* SECTIONS */}
          <Link
            href="/admin/sections"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">Sections</p>

            <h2 className="mt-2 text-xl font-semibold">
              Section Manager
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add, hide, rename, remove, and reorder website sections.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Section Manager →
            </p>
          </Link>

          {/* AI AGENT */}
          <Link
            href="/admin/knowledge"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
          >
            <p className="text-sm text-cyan-300">
              AI Agent
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Knowledge Manager
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Control which verified information your personal AI agent can use.
            </p>

            <p className="mt-5 text-sm font-medium text-cyan-300">
              Open Knowledge Manager →
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}