"use client";

import { useEffect, useState } from "react";
import {
  getPublicCareerFocus,
  getPublicCertifications,
  getPublicHeroHighlights,
  getPublicProfile,
  getPublicProjects,
  getPublicSiteContent,
  getPublicSections,
  getPublicSkills,
} from "@/data/publicData";

type PublicProfile = {
  id: string;
  full_name: string | null;
  professional_title: string | null;
  hero_tagline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
};

type PublicProject = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  technologies: string | null;
  project_url: string | null;
  github_url: string | null;
  status: string;
  display_order: number;
  is_visible: boolean;
};

type PublicCertification = {
  id: string;
  title: string;
  issuer: string | null;
  credential_url: string | null;
  status: string;
  issue_date: string | null;
  expiry_date: string | null;
  display_order: number;
  is_visible: boolean;
};


type PublicSkill = {
  id: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
};

type PublicCareerFocus = {
  id: string;
  title: string;
  display_order: number;
  is_visible: boolean;
};

type PublicHeroHighlight = {
  id: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

type PublicSiteContent = {
  id: string;
  user_id: string;
  about_label: string | null;
  about_heading: string | null;
  about_primary_text: string | null;
  about_secondary_text: string | null;
  about_focus_heading: string | null;
  projects_label: string | null;
  projects_heading: string | null;
  projects_description: string | null;
  skills_label: string | null;
  skills_heading: string | null;
  skills_description: string | null;
  certifications_label: string | null;
  certifications_heading: string | null;
  certifications_description: string | null;
  contact_label: string | null;
  contact_heading: string | null;
  contact_description: string | null;
};

type PublicSection = {
  id: string;
  section_key: string;
  label: string;
  display_order: number;
  is_visible: boolean;
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("home");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [certifications, setCertifications] = useState<PublicCertification[]>([]);
  const [skills, setSkills] = useState<PublicSkill[]>([]);
  const [careerFocus, setCareerFocus] = useState<PublicCareerFocus[]>([]);
  const [heroHighlights, setHeroHighlights] = useState<PublicHeroHighlight[]>([]);
  const [siteContent, setSiteContent] = useState<PublicSiteContent | null>(null);
  const [sections, setSections] = useState<PublicSection[]>([]);
  const [publicDataLoaded, setPublicDataLoaded] = useState(false);

  // Load the correct active nav item if the page opens with a hash.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash) {
      setActiveSection(hash);
    }
  }, []);


  // Load public website content from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadPublicData() {
      try {
        const [
          profileData,
          projectsData,
          certificationsData,
          skillsData,
          careerFocusData,
          heroHighlightsData,
          siteContentData,
          sectionsData,
        ] = await Promise.all([
          getPublicProfile(),
          getPublicProjects(),
          getPublicCertifications(),
          getPublicSkills(),
          getPublicCareerFocus(),
          getPublicHeroHighlights(),
          getPublicSiteContent(),
          getPublicSections(),
        ]);

        if (cancelled) return;

        setProfile(profileData as PublicProfile | null);
        setProjects((projectsData ?? []) as PublicProject[]);
        setCertifications((certificationsData ?? []) as PublicCertification[]);
        setSkills((skillsData ?? []) as PublicSkill[]);
        setCareerFocus((careerFocusData ?? []) as PublicCareerFocus[]);
        setHeroHighlights((heroHighlightsData ?? []) as PublicHeroHighlight[]);
        setSiteContent(siteContentData as PublicSiteContent | null);
        setSections((sectionsData ?? []) as PublicSection[]);
      } catch (error) {
        console.error("Public data load error:", error);
      } finally {
        if (!cancelled) {
          setPublicDataLoaded(true);
        }
      }
    }

    loadPublicData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Ask the AI for owner-specific suggested questions.
  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const response = await fetch("/api/chat/suggestions", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled && Array.isArray(data.suggestions)) {
          setSuggestions(
            data.suggestions
              .filter(
                (item: unknown): item is string =>
                  typeof item === "string" && item.trim().length > 0
              )
              .slice(0, 4)
          );
        }
      } catch (error) {
        console.error("AI suggestions load error:", error);
      }
    }

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll reveal animation.
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  async function downloadLatestCv() {
    try {
      const response = await fetch(
        `/api/public-cv?ts=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        window.alert(
          data.error || "No uploaded CV is available."
        );
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("CV download error:", error);
      window.alert("Could not download the latest CV.");
    }
  }

  async function askAgent() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnswer(data.error || "Something went wrong.");
        return;
      }

      setAnswer(data.answer);
    } catch {
      setAnswer("Could not connect to the AI agent.");
    } finally {
      setLoading(false);
    }
  }

  const buttonClass =
    "rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-7 py-3.5 font-medium text-cyan-200 transition duration-300 hover:-translate-y-1 hover:bg-cyan-300/20 hover:text-white";

  const contactButtonClass =
    "rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-6 py-3 font-medium text-cyan-200 transition duration-300 hover:-translate-y-1 hover:bg-cyan-300/20 hover:text-white";

  const normalNavClass =
    "rounded-lg border border-transparent px-4 py-2 text-white/60 transition hover:border-white/10 hover:bg-white/5 hover:text-white";

  const activeNavClass =
    "rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-cyan-200 transition";

  const sectionConfig = (key: string, fallbackLabel: string) => {
    const section = sections.find((item) => item.section_key === key);

    return {
      label: section?.label || fallbackLabel,
      visible: section ? section.is_visible : true,
    };
  };

  const projectsSection = sectionConfig("projects", "Projects");
  const skillsSection = sectionConfig("skills", "Skills");
  const certificationsSection = sectionConfig(
    "certifications",
    "Certifications"
  );
  const aboutSection = sectionConfig("about", "About");
  const agentSection = sectionConfig("agent", "AI Agent");
  const contactSection = sectionConfig("contact", "Contact");

  const heroTitle =
    profile?.professional_title || "Professional Portfolio";
  const heroTagline =
    profile?.hero_tagline || "";
  const heroName = profile?.full_name || "Portfolio Owner";
  const heroBio =
    profile?.bio ||
    "This portfolio is ready to be personalized from the admin dashboard.";

  const email = profile?.email || "ebraheimpasha@gmail.com";
  const linkedIn =
    profile?.linkedin_url || "https://linkedin.com/in/ebraheim13ae";
  const github =
    profile?.github_url || "https://github.com/Ebraheim";

  const aboutLabel = siteContent?.about_label || "About Me";
  const aboutHeading =
    siteContent?.about_heading || "About";
  const aboutPrimaryText =
    siteContent?.about_primary_text ||
    profile?.bio ||
    "Tell visitors more about yourself, your business, or what you do.";

  const aboutSecondaryText =
    siteContent?.about_secondary_text || "";

  const aboutFocusHeading =
    siteContent?.about_focus_heading || "Focus Areas";

  const projectsLabel = siteContent?.projects_label || "Selected Work";
  const projectsHeading = siteContent?.projects_heading || "Projects";
  const projectsDescription =
    siteContent?.projects_description || "";

  const skillsLabel = siteContent?.skills_label || "Technical Toolkit";
  const skillsHeading = siteContent?.skills_heading || "Skills";
  const skillsDescription = siteContent?.skills_description || "";

  const certificationsLabel =
    siteContent?.certifications_label || "Certifications";
  const certificationsHeading =
    siteContent?.certifications_heading || "Certifications";
  const certificationsDescription =
    siteContent?.certifications_description || "";

  const contactLabel = siteContent?.contact_label || "Contact";
  const contactHeading =
    siteContent?.contact_heading || "Get in touch.";
  const contactDescription =
    siteContent?.contact_description || "";

  return (
    <>
      {/* SCROLL ANIMATION STYLES */}
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.75s ease,
            transform 0.75s ease;
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <main className="min-h-screen overflow-hidden">
        {/* NAVBAR */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a
              href="#home"
              onClick={() => setActiveSection("home")}
              className={`text-lg font-semibold tracking-tight transition ${
                activeSection === "home"
                  ? "text-cyan-300"
                  : "text-white hover:text-cyan-300"
              }`}
            >
              {profile?.full_name
                ? profile.full_name.split(" ")[0] +
                  " " +
                  profile.full_name.split(" ").slice(-1)[0]
                : "Portfolio"}
            </a>

            <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
              {projectsSection.visible && (
              <a
                href="#projects"
                onClick={() => setActiveSection("projects")}
                className={
                  activeSection === "projects"
                    ? activeNavClass
                    : normalNavClass
                }
              >
                {projectsSection.label}
              </a>
              )}

              {skillsSection.visible && (
              <a
                href="#skills"
                onClick={() => setActiveSection("skills")}
                className={
                  activeSection === "skills" ? activeNavClass : normalNavClass
                }
              >
                {skillsSection.label}
              </a>
              )}

              {certificationsSection.visible && (
              <a
                href="#certifications"
                onClick={() => setActiveSection("certifications")}
                className={
                  activeSection === "certifications"
                    ? activeNavClass
                    : normalNavClass
                }
              >
                {certificationsSection.label}
              </a>
              )}

              {aboutSection.visible && (
              <a
                href="#about"
                onClick={() => setActiveSection("about")}
                className={
                  activeSection === "about" ? activeNavClass : normalNavClass
                }
              >
                {aboutSection.label}
              </a>
              )}

              {agentSection.visible && (
              <a
                href="#agent"
                onClick={() => setActiveSection("agent")}
                className={
                  activeSection === "agent" ? activeNavClass : normalNavClass
                }
              >
                {agentSection.label}
              </a>
              )}

              {contactSection.visible && (
              <a
                href="#contact"
                onClick={() => setActiveSection("contact")}
                className={
                  activeSection === "contact" ? activeNavClass : normalNavClass
                }
              >
                {contactSection.label}
              </a>
              )}
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section
          id="home"
          className="relative flex min-h-[90vh] items-center px-6 pt-24"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[5%] top-[15%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />
            <div className="absolute right-[5%] top-[20%] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
            <div className="absolute bottom-[10%] left-[40%] h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-5 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
              {heroTitle}
            </div>

            <p className="mb-6 text-sm font-medium tracking-wide text-white/50">
              {heroTagline}
            </p>

            <h1 className="mb-7 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
              {heroName}
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
              {heroBio}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {projectsSection.visible && (
                <a
                  href="#projects"
                  onClick={() => setActiveSection("projects")}
                  className={buttonClass}
                >
                  View Projects
                </a>
              )}

              {agentSection.visible && (
                <a
                  href="#agent"
                  onClick={() => setActiveSection("agent")}
                  className={buttonClass}
                >
                  Ask My AI Agent
                </a>
              )}
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/40">
              {publicDataLoaded &&
                heroHighlights.length > 0 &&
                heroHighlights.map((item) => (
                  <span key={item.id}>{item.label}</span>
                ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        {projectsSection.visible && (
        <section
          id="projects"
          className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              {projectsLabel}
            </p>

            <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-4xl font-bold md:text-5xl">{projectsHeading}</h2>

                <p className="mt-4 max-w-2xl text-white/50">
                  {projectsDescription}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {publicDataLoaded && projects.length > 0 ? (
                projects.map((project) => (
                  <article
                    key={project.id}
                    className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.055]"
                  >
                    <div className="mb-5 inline-flex rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-xs capitalize text-cyan-300">
                      {project.status.replaceAll("-", " ")}
                    </div>

                    <h3 className="mb-4 text-2xl font-semibold">
                      {project.title}
                    </h3>

                    <p className="mb-6 leading-7 text-white/55">
                      {project.short_description ||
                        project.full_description ||
                        "Project details available in the portfolio manager."}
                    </p>

                    {project.technologies && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item) => (
                            <span
                              key={item}
                              className="rounded-md bg-white/5 px-3 py-1 text-xs text-white/50"
                            >
                              {item}
                            </span>
                          ))}
                      </div>
                    )}

                    {(project.project_url || project.github_url) && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-300 transition hover:text-cyan-200"
                          >
                            View Project ↗
                          </a>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/50 transition hover:text-white"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
                  No projects have been published yet.
                </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* SKILLS */}
        {skillsSection.visible && (
        <section
          id="skills"
          className="reveal border-t border-white/10 px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              {skillsLabel}
            </p>

            <h2 className="text-4xl font-bold md:text-5xl">
              {skillsHeading}
            </h2>

            {skillsDescription && (
              <p className="mt-4 mb-12 max-w-3xl text-lg leading-8 text-white/50">
                {skillsDescription}
              </p>
            )}

            {!skillsDescription && <div className="mb-12" />}

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {publicDataLoaded && skills.length > 0
                ? skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.05]"
                    >
                      <h3 className="mb-3 text-lg font-semibold">
                        {skill.title}
                      </h3>
                      <p className="leading-7 text-white/50">
                        {skill.description}
                      </p>
                    </div>
                  ))
                : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35 md:col-span-2 lg:col-span-3">
                      No skills have been published yet.
                    </div>
                  )}
            </div>
          </div>
        </section>
        )}

        {/* CERTIFICATIONS */}
        {certificationsSection.visible && (
        <section
          id="certifications"
          className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              {certificationsLabel}
            </p>

            <h2 className="text-4xl font-bold md:text-5xl">
              {certificationsHeading}
            </h2>

            {certificationsDescription && (
              <p className="mt-4 mb-12 max-w-3xl text-lg leading-8 text-white/50">
                {certificationsDescription}
              </p>
            )}

            {!certificationsDescription && <div className="mb-12" />}

            {publicDataLoaded && certifications.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {certifications.map((certification) => (
                  <article
                    key={certification.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.05]"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {certification.status.replaceAll("-", " ")}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold">
                      {certification.title}
                    </h3>
                    {certification.issuer && (
                      <p className="mt-2 text-sm text-white/45">
                        {certification.issuer}
                      </p>
                    )}
                    {certification.issue_date && (
                      <p className="mt-4 text-xs text-white/30">
                        Issued {certification.issue_date}
                      </p>
                    )}
                    {certification.credential_url && (
                      <a
                        href={certification.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block text-sm text-cyan-300 transition hover:text-cyan-200"
                      >
                        View Credential ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
                No certifications have been published yet.
              </div>
            )}
          </div>
        </section>
        )}

        {/* ABOUT */}
        {aboutSection.visible && (
        <section
          id="about"
          className="reveal border-t border-white/10 px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              {aboutLabel}
            </p>

            <h2 className="mb-12 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              {aboutHeading}
            </h2>

            <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <p className="mb-6 text-lg leading-8 text-white/60">
                  {aboutPrimaryText}
                </p>

                {aboutSecondaryText && (
                  <p className="text-lg leading-8 text-white/60">
                    {aboutSecondaryText}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-8">
                <h3 className="mb-6 text-xl font-semibold">
                  {aboutFocusHeading}
                </h3>

                <ul className="space-y-4 text-white/60">
                  {publicDataLoaded && careerFocus.length > 0 ? (
                    careerFocus.map((item) => (
                      <li key={item.id}>→ {item.title}</li>
                    ))
                  ) : (
                    <li className="text-white/30">
                      Add focus areas from the admin dashboard.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* AI AGENT */}
        {agentSection.visible && (
        <section
          id="agent"
          className="reveal relative border-t border-white/10 bg-white/[0.015] px-6 py-24"
        >
          <div className="pointer-events-none absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-cyan-400/5 blur-[100px]" />

          <div className="relative mx-auto max-w-6xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
              AI Assistant
            </p>

            <h2 className="mb-5 text-4xl font-bold md:text-5xl">
              Ask a question.
            </h2>

            <p className="mb-10 max-w-3xl text-lg leading-8 text-white/55">
              This AI assistant answers questions using verified information
              provided by the website owner.
            </p>

            <div className="max-w-4xl rounded-3xl border border-white/10 bg-[#0b111b]/90 p-5 shadow-2xl shadow-black/30 md:p-8">
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="mb-4 text-sm font-semibold text-cyan-300">
                  Try asking
                </p>

                <div className="grid gap-2 text-sm text-white/45 md:grid-cols-2">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuestion(suggestion)}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:bg-white/5 hover:text-white/70"
                      >
                        {suggestion}
                      </button>
                    ))
                  ) : (
                    <p className="md:col-span-2 text-white/35">
                      Suggested questions are loading...
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5 min-h-48 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/65">
                  {loading
                    ? "Thinking..."
                    : answer ||
                      "Ask a question and the AI agent will answer using verified information."}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      askAgent();
                    }
                  }}
                  placeholder="Ask a question..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
                />

                <button
                  type="button"
                  onClick={askAgent}
                  disabled={loading}
                  className="rounded-xl bg-cyan-300 px-7 py-4 font-semibold text-black transition duration-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Thinking..." : "Ask Agent"}
                </button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* CONTACT */}
        {contactSection.visible && (
        <section
          id="contact"
          className="reveal border-t border-white/10 px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 md:p-12">
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                {contactLabel}
              </p>

              <h2 className="mb-5 text-4xl font-bold md:text-5xl">
                {contactHeading}
              </h2>

              <p className="mb-9 max-w-3xl text-lg leading-8 text-white/55">
                {contactDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className={contactButtonClass}
                  >
                    Email
                  </a>
                )}

                {linkedIn && (
                  <a
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactButtonClass}
                  >
                    LinkedIn
                  </a>
                )}

                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactButtonClass}
                  >
                    GitHub
                  </a>
                )}

                <button
                  type="button"
                  onClick={downloadLatestCv}
                  className={contactButtonClass}
                >
                  Download CV ↓
                </button>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/30">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  © 2026 {profile?.full_name || "Portfolio Owner"}. All rights reserved.
                </span>
                <span className="text-white/15">·</span>
                <span>
                  Built by{" "}
                  <a
                    href="mailto:ebraheimpasha@gmail.com"
                    className="text-cyan-300/70 transition hover:text-cyan-200"
                  >
                    Ebraheim Mohamed Pasha Qadri
                  </a>
                </span>
                <span className="text-white/15">·</span>
                <a
                  href="mailto:ebraheimpasha@gmail.com?subject=Website%20Enquiry"
                  className="text-cyan-300/70 transition hover:text-cyan-200"
                >
                  Contact Me
                </a>
              </div>

              <a
                href="#home"
                onClick={() => setActiveSection("home")}
                className="transition hover:text-cyan-300"
              >
                Back to top ↑
              </a>
            </div>
          </div>
        </section>
        )}
      </main>
    </>
  );
  }
