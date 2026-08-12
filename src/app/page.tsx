import Link from "next/link";

const features = [
  {
    title: "AI-powered setup",
    description:
      "Upload your CV, review the extracted information, and turn it into a structured website without starting from a blank page.",
    icon: "✦",
  },
  {
    title: "Your own public website",
    description:
      "Every account gets its own public profile URL with projects, experience, skills, education, achievements, and more.",
    icon: "↗",
  },
  {
    title: "Built-in AI assistant",
    description:
      "Visitors can ask questions about you, and the assistant answers using only the verified information connected to your website.",
    icon: "◇",
  },
  {
    title: "Easy website editor",
    description:
      "Update your homepage, projects, experience, skills, certifications, contact details, and other sections from one dashboard.",
    icon: "◫",
  },
  {
    title: "You control what is public",
    description:
      "Show, hide, reorder, and edit your content whenever you want while keeping each account's data isolated.",
    icon: "✓",
  },
  {
    title: "Always ready to improve",
    description:
      "Keep your website current as your projects, career, qualifications, and achievements grow.",
    icon: "○",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up and reserve your personal website address.",
  },
  {
    number: "02",
    title: "Import or build manually",
    description:
      "Upload your CV for AI-assisted setup or enter your information yourself.",
  },
  {
    number: "03",
    title: "Review your content",
    description:
      "Choose what should appear publicly and edit anything before publishing.",
  },
  {
    number: "04",
    title: "Share your website",
    description:
      "Use your public link as a portfolio, professional profile, or personal website.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-lg text-cyan-300 transition group-hover:bg-cyan-300/15">
              ✦
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                AI Website
              </p>
              <p className="text-xs text-white/35">
                Personal portfolio builder
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-white/50 md:flex">
            <a
              href="#features"
              className="transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How It Works
            </a>
            <Link
              href="/ebraheim"
              className="transition hover:text-white"
            >
              Example
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white sm:inline-flex"
            >
              Sign In
            </Link>

            <Link
              href="/admin"
              className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200"
            >
              Create Website
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-300/[0.055] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 md:pb-32 md:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2 text-sm text-cyan-200">
              <span>✦</span>
              AI-assisted personal website builder
            </div>

            <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-7xl">
              Turn your experience into
              <span className="block bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                a website that speaks for you.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/50 md:text-xl">
              Create a professional public website, manage your career content,
              and give visitors an AI assistant that can answer questions from
              your verified information.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-xl bg-cyan-300 px-7 py-3.5 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                Build My Website →
              </Link>

              <Link
                href="/ebraheim"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 font-medium text-white/70 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                View Example ↗
              </Link>
            </div>

            <p className="mt-5 text-sm text-white/25">
              Start from your CV or build your website manually.
            </p>
          </div>

          <div className="mx-auto mt-20 max-w-5xl rounded-[28px] border border-white/10 bg-white/[0.025] p-3 shadow-2xl shadow-black/30">
            <div className="rounded-2xl border border-white/10 bg-[#0a1019] p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                    Your website
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Everything important, in one place.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/60" />
                </div>
              </div>

              <div className="grid gap-4 pt-5 md:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7">
                  <p className="text-sm text-cyan-300">
                    Professional profile
                  </p>

                  <div className="mt-5 h-8 w-3/4 rounded-lg bg-white/10" />
                  <div className="mt-3 h-4 w-1/2 rounded-lg bg-white/[0.06]" />

                  <div className="mt-8 space-y-3">
                    <div className="h-3 w-full rounded-lg bg-white/[0.05]" />
                    <div className="h-3 w-[92%] rounded-lg bg-white/[0.05]" />
                    <div className="h-3 w-[78%] rounded-lg bg-white/[0.05]" />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {["Projects", "Experience", "Skills", "Education"].map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.05] px-3 py-2 text-xs text-cyan-200/70"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                    ✦
                  </div>

                  <h3 className="mt-5 font-semibold">
                    AI Assistant
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    Ask about projects, experience, skills, qualifications,
                    achievements, or contact information.
                  </p>

                  <div className="mt-6 space-y-2">
                    <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs text-white/40">
                      What projects has this person worked on?
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs text-white/40">
                      What are their main skills?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-white/10 bg-white/[0.012]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Platform
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              More than a static portfolio.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/45">
              Your website becomes a living professional profile that you can
              update as your work changes.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                How it works
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                From account to public website.
              </h2>

              <p className="mt-5 text-lg leading-8 text-white/45">
                Start quickly with AI-assisted CV extraction, but keep control
                over what actually gets published.
              </p>

              <Link
                href="/admin"
                className="mt-8 inline-flex rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/20 hover:text-white"
              >
                Start building →
              </Link>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-[70px_1fr]"
                >
                  <div className="text-sm font-semibold tracking-[0.2em] text-cyan-300">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/40">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-cyan-300/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Your professional presence
            </p>

            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Build once. Keep improving.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/45">
              Give recruiters, clients, collaborators, and visitors one place
              to understand who you are, what you have done, and how to reach
              you.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-xl bg-cyan-300 px-7 py-3.5 font-semibold text-black transition hover:bg-cyan-200"
              >
                Create My Website →
              </Link>

              <Link
                href="/ebraheim"
                className="rounded-xl border border-white/10 px-7 py-3.5 font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Explore Example
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-cyan-300">✦</span>
            <span>AI Website</span>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/admin"
              className="transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/ebraheim"
              className="transition hover:text-white"
            >
              Example Website
            </Link>
          </div>

          <p>
            © {new Date().getFullYear()} AI Website
          </p>
        </div>
      </footer>
    </main>
  );
}