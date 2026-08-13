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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slug, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile?.onboarding_completed) {
    redirect("/admin/onboarding");
  }

  const publicWebsiteHref = profile.slug
    ? `/${profile.slug}`
    : "/";

  const editorCards = [
    {
      title: "Home",
      subtitle: "Homepage",
      description:
        "Edit the main hero area including your name, title, tagline, introduction, and highlights.",
      href: "/admin/home",
      action: "Edit Home",
      icon: "⌂",
    },
    {
      title: "Projects",
      subtitle: "Projects Section",
      description:
        "Edit the Projects section text and manage the projects shown on your website.",
      href: "/admin/projects",
      action: "Edit Projects",
      icon: "◫",
    },
    {
      title: "Experience",
      subtitle: "Career Section",
      description:
        "Manage your work experience, roles, companies, dates, locations, and descriptions.",
      href: "/admin/experience",
      action: "Edit Experience",
      icon: "↗",
    },
    {
      title: "Education",
      subtitle: "Education Section",
      description:
        "Manage your degrees, institutions, fields of study, dates, and education details.",
      href: "/admin/education",
      action: "Edit Education",
      icon: "▣",
    },
    {
      title: "Achievements",
      subtitle: "Achievements Section",
      description:
        "Manage awards, competitions, recognitions, research highlights, and other key achievements.",
      href: "/admin/achievements",
      action: "Edit Achievements",
      icon: "★",
    },
    {
      title: "Skills",
      subtitle: "Skills Section",
      description:
        "Edit the Skills section text and manage your skills, capabilities, technologies, or services.",
      href: "/admin/skills",
      action: "Edit Skills",
      icon: "◇",
    },
    {
      title: "Certifications",
      subtitle: "Certifications Section",
      description:
        "Edit the Certifications section and manage credentials, qualifications, awards, and learning records.",
      href: "/admin/certifications",
      action: "Edit Certifications",
      icon: "✓",
    },
    {
      title: "About",
      subtitle: "About Section",
      description:
        "Edit your About heading, main text, supporting text, focus heading, and focus items.",
      href: "/admin/about",
      action: "Edit About",
      icon: "○",
    },
    {
      title: "AI Knowledge",
      subtitle: "AI Assistant Data",
      description:
        "Manage the verified information your website AI is allowed to use when answering visitor questions.",
      href: "/admin/knowledge",
      action: "Manage AI Knowledge",
      icon: "✦",
    },
    {
      title: "Contact",
      subtitle: "Contact Section",
      description:
        "Edit your contact message, email, location, social links, and access the CV manager.",
      href: "/admin/contact",
      action: "Edit Contact",
      icon: "↗",
    },
    {
      title: "Section Settings",
      subtitle: "Website Layout",
      description:
        "Control section visibility, navigation labels, ordering, and how your public website is arranged.",
      href: "/admin/sections",
      action: "Manage Sections",
      icon: "⚙",
    },
    {
      title: "Account",
      subtitle: "Account Settings",
      description:
        "View your account email and website address, manage your password, and access account controls.",
      href: "/admin/settings",
      action: "Open Account Settings",
      icon: "◉",
    },
  ];

  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <header className="border-b border-white/10 bg-[#070b12]/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
              Website Editor
            </p>

            <h1 className="mt-1 text-xl font-semibold">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={publicWebsiteHref}
              target="_blank"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:border-cyan-300/30 hover:bg-white/[0.06] hover:text-white"
            >
              View Website ↗
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <section className="mb-12">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              Edit Your Website
            </p>

            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              What would you like to edit?
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/50">
              Choose a section below. Each editor controls the matching part
              of your public website.
            </p>

            <p className="mt-3 text-sm text-white/30">
              Signed in as {user.email}
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-cyan-300">
                Public Website
              </p>

              <p className="mt-1 text-sm text-white/45">
                Changes saved inside the editors update the content shown on
                your website.
              </p>
            </div>

            <Link
              href={publicWebsiteHref}
              target="_blank"
              className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
            >
              Preview Website ↗
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Website Sections
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Content Editors
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {editorCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {card.subtitle}
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold">
                      {card.title}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-white/50 transition group-hover:border-cyan-300/25 group-hover:text-cyan-300">
                    {card.icon}
                  </div>
                </div>

                <p className="mt-5 min-h-[72px] text-sm leading-6 text-white/45">
                  {card.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm font-medium text-cyan-300">
                    {card.action}
                  </span>

                  <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-cyan-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-sm font-medium text-white/60">
            AI Assistant
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/35">
            The public AI Assistant design and system behavior are protected.
            Website owners can manage verified AI knowledge, while the assistant
            interface and core rules stay controlled by the platform.
          </p>
        </section>
      </div>
    </main>
  );
}