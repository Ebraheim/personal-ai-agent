"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getPublicAchievements,
  getPublicCareerFocus,
  getPublicCertifications,
  getPublicEducation,
  getPublicExperience,
  getPublicHeroHighlights,
  getPublicProfileBySlug,
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
  cover_image_url: string | null;
  highlight: string | null;
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

type PublicExperience = {
  id: string;
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  description: string | null;
  display_order: number;
  is_visible: boolean;
};

type PublicEducation = {
  id: string;
  institution: string;
  degree: string | null;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
  is_visible: boolean;
};

type PublicAchievement = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
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

type PortfolioClientProps = {
  slug: string;
};

export default function PortfolioClient({
  slug,
}: PortfolioClientProps) {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [certifications, setCertifications] = useState<PublicCertification[]>([]);
  const [skills, setSkills] = useState<PublicSkill[]>([]);
  const [careerFocus, setCareerFocus] = useState<PublicCareerFocus[]>([]);
  const [heroHighlights, setHeroHighlights] = useState<PublicHeroHighlight[]>([]);
  const [experience, setExperience] = useState<PublicExperience[]>([]);
  const [education, setEducation] = useState<PublicEducation[]>([]);
  const [achievements, setAchievements] = useState<PublicAchievement[]>([]);
  const [siteContent, setSiteContent] = useState<PublicSiteContent | null>(null);
  const [sections, setSections] = useState<PublicSection[]>([]);
  const [publicDataLoaded, setPublicDataLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Load the correct active nav item if the page opens with a hash.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash) {
      setActiveSection(hash);
    }
  }, []);


  // Show editing controls only when the signed-in user owns this profile.
  useEffect(() => {
    let cancelled = false;

    async function checkProfileOwner() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        setIsOwner(Boolean(user && profile?.id && user.id === profile.id));
      } catch (error) {
        console.error("Owner check error:", error);

        if (!cancelled) {
          setIsOwner(false);
        }
      }
    }

    checkProfileOwner();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  // Record one profile view per browser session for this public profile.
  useEffect(() => {
    const storageKey = `profile-view-recorded:${slug}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }

      window.sessionStorage.setItem(storageKey, "true");
    } catch {
      // Analytics should never block the public portfolio.
    }

    async function recordProfileView() {
      try {
        const response = await fetch("/api/analytics/profile-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug }),
        });

        if (!response.ok) {
          console.error("Profile view analytics request failed.");
        }
      } catch (error) {
        console.error("Profile view analytics error:", error);
      }
    }

    recordProfileView();
  }, [slug]);

  // Load public website content from Supabase.
  useEffect(() => {
    let cancelled = false;

    async function loadPublicData() {
      try {
        const profileData = await getPublicProfileBySlug(slug);

        if (cancelled) return;

        if (!profileData) {
          setProfile(null);
          setProjects([]);
          setCertifications([]);
          setSkills([]);
          setCareerFocus([]);
          setHeroHighlights([]);
          setExperience([]);
          setEducation([]);
          setAchievements([]);
          setSiteContent(null);
          setSections([]);
          return;
        }

        const userId = profileData.id;

        const [
          projectsData,
          certificationsData,
          skillsData,
          careerFocusData,
          heroHighlightsData,
          experienceData,
          educationData,
          achievementsData,
          siteContentData,
          sectionsData,
        ] = await Promise.all([
          getPublicProjects(userId),
          getPublicCertifications(userId),
          getPublicSkills(userId),
          getPublicCareerFocus(userId),
          getPublicHeroHighlights(userId),
          getPublicExperience(userId),
          getPublicEducation(userId),
          getPublicAchievements(userId),
          getPublicSiteContent(userId),
          getPublicSections(userId),
        ]);

        if (cancelled) return;

        setProfile(profileData as PublicProfile | null);
        setProjects((projectsData ?? []) as PublicProject[]);
        setCertifications((certificationsData ?? []) as PublicCertification[]);
        setSkills((skillsData ?? []) as PublicSkill[]);
        setCareerFocus((careerFocusData ?? []) as PublicCareerFocus[]);
        setHeroHighlights((heroHighlightsData ?? []) as PublicHeroHighlight[]);
        setExperience((experienceData ?? []) as PublicExperience[]);
        setEducation((educationData ?? []) as PublicEducation[]);
        setAchievements((achievementsData ?? []) as PublicAchievement[]);
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
  }, [slug]);

  // Ask the AI for owner-specific suggested questions.
  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const response = await fetch(`/api/chat/suggestions?slug=${encodeURIComponent(slug)}`, {
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
  }, [slug]);

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
        `/api/public-cv?slug=${encodeURIComponent(slug)}&ts=${Date.now()}`,
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

  async function askAgent(questionOverride?: string) {
    const questionToAsk = (questionOverride ?? question).trim();

    if (!questionToAsk) return;

    setQuestion(questionToAsk);
    setSubmittedQuestion(questionToAsk);
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionToAsk,
          slug,
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

  // Section settings control label, visibility, and actual public-page order.
  const sectionConfig = (
    key: string,
    fallbackLabel: string,
    fallbackOrder: number
  ) => {
    const section = sections.find((item) => item.section_key === key);

    return {
      key,
      label: section?.label || fallbackLabel,
      visible: section ? section.is_visible : true,
      order: section?.display_order ?? fallbackOrder,
    };
  };

  const projectsSection = sectionConfig("projects", "Projects", 10);
  const experienceSection = sectionConfig("experience", "Experience", 20);
  const educationSection = sectionConfig("education", "Education", 30);
  const achievementsSection = sectionConfig(
    "achievements",
    "Achievements",
    40
  );
  const skillsSection = sectionConfig("skills", "Skills", 50);
  const certificationsSection = sectionConfig(
    "certifications",
    "Certifications",
    60
  );
  const aboutSection = sectionConfig("about", "About", 70);
  const agentSection = sectionConfig("agent", "AI Agent", 80);
  const contactSection = sectionConfig("contact", "Contact", 90);

  const sectionHasData: Record<string, boolean> = {
    projects: projects.length > 0,
    experience: experience.length > 0,
    education: education.length > 0,
    achievements: achievements.length > 0,
    skills: skills.length > 0,
    certifications: certifications.length > 0,
    about: true,
    agent: true,
    contact: true,
  };

  const isSectionActuallyVisible = (section: {
    key: string;
    visible: boolean;
  }) =>
    section.visible &&
    (sectionHasData[section.key] ?? true);

  const orderedNavigation = [
    agentSection,
    ...[
      projectsSection,
      experienceSection,
      educationSection,
      achievementsSection,
      skillsSection,
      certificationsSection,
      aboutSection,
      contactSection,
    ]
      .filter((section) => isSectionActuallyVisible(section))
      .sort((a, b) => a.order - b.order),
  ].filter((section) => isSectionActuallyVisible(section));

  const heroTitle =
    profile?.professional_title || "Professional Portfolio";
  const heroTagline =
    profile?.hero_tagline || "";
  const heroName = profile?.full_name || "Portfolio Owner";
  const firstName = heroName.split(" ")[0] || "this candidate";
  const heroBio =
    profile?.bio ||
    "This portfolio is ready to be personalized from the admin dashboard.";

  const email = profile?.email || "";
  const linkedIn = profile?.linkedin_url || "";
  const github = profile?.github_url || "";

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

      <main className="flex min-h-screen flex-col overflow-hidden">
        {/* NAVBAR */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#070b12]/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between py-4">
              <a
                href="#home"
                onClick={() => {
                  setActiveSection("home");
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-semibold tracking-tight text-white transition hover:text-cyan-300"
              >
                {profile?.full_name
                  ? profile.full_name.split(" ")[0] +
                    " " +
                    profile.full_name.split(" ").slice(-1)[0]
                  : "Portfolio"}
              </a>

              <nav className="hidden items-center gap-1 text-sm xl:flex">
                {orderedNavigation.map((section) => (
                  <a
                    key={section.key}
                    href={`#${section.key}`}
                    onClick={() => setActiveSection(section.key)}
                    className={
                      activeSection === section.key
                        ? "rounded-lg bg-white/[0.06] px-4 py-2 text-cyan-300"
                        : "rounded-lg px-4 py-2 text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                    }
                  >
                    {section.label}
                  </a>
                ))}

                {isOwner && (
                  <a
                    href="/admin/confirm-edit"
                    className="ml-2 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-2 font-medium text-cyan-200 transition hover:bg-cyan-300/[0.15] hover:text-white"
                  >
                    Edit Website
                  </a>
                )}
              </nav>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:border-cyan-300/30 hover:bg-white/[0.06] hover:text-white xl:hidden"
              >
                <span>{mobileMenuOpen ? "Close" : "Menu"}</span>
                <span aria-hidden="true" className="text-cyan-300">
                  {mobileMenuOpen ? "×" : "☰"}
                </span>
              </button>
            </div>

            {mobileMenuOpen && (
              <nav
                id="mobile-navigation"
                className="border-t border-white/10 pb-4 pt-3 xl:hidden"
              >
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {orderedNavigation.map((section) => (
                    <a
                      key={section.key}
                      href={`#${section.key}`}
                      onClick={() => {
                        setActiveSection(section.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        activeSection === section.key
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 bg-white/[0.025] text-white/60 hover:border-cyan-300/20 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {section.label}
                    </a>
                  ))}

                  {isOwner && (
                    <a
                      href="/admin/confirm-edit"
                      className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/[0.15] hover:text-white"
                    >
                      Edit Website
                    </a>
                  )}
                </div>
              </nav>
            )}
          </div>
        </header>

        {/* HERO */}
        <section
          id="home"
          style={{ order: 0 }}
          className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10rem] top-[15%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.05] blur-[150px]" />
            <div className="absolute right-[-8rem] top-[18%] h-[30rem] w-[30rem] rounded-full bg-violet-500/[0.05] blur-[150px]" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
              <div>
                <p className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/75">
                  {heroTitle}
                </p>

                <h1 className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-[5.1rem]">
                  {heroName}
                </h1>

                {heroTagline && (
                  <p className="mt-6 max-w-3xl text-base font-medium text-cyan-100/75 md:text-lg">
                    {heroTagline}
                  </p>
                )}

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/48 md:text-base">
                  {heroBio}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  {agentSection.visible && (
                    <a
                      href="#agent"
                      onClick={() => setActiveSection("agent")}
                      className="rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-cyan-200"
                    >
                      Ask My AI ✦
                    </a>
                  )}

                  {isSectionActuallyVisible(projectsSection) && (
                    <a
                      href="#projects"
                      onClick={() => setActiveSection("projects")}
                      className="rounded-xl border border-white/10 bg-white/[0.025] px-6 py-3.5 font-medium text-white/70 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                    >
                      View My Work →
                    </a>
                  )}
                </div>

                <p className="mt-7 text-sm text-white/28">
                  Ask first, or browse the portfolio normally.
                </p>
              </div>

              <div className="mx-auto w-full max-w-md lg:mx-0">
                <div className="rounded-[1.75rem] border border-white/10 bg-[#0a1019]/90 p-7 shadow-2xl shadow-black/30">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
                        Profile
                      </p>

                      <h2 className="mt-3 text-2xl font-semibold leading-8 text-white">
                        {heroTitle}
                      </h2>

                      {profile?.location && (
                        <p className="mt-2 text-sm text-white/38">
                          {profile.location}
                        </p>
                      )}
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                      ✦
                    </div>
                  </div>

                  {publicDataLoaded && heroHighlights.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {heroHighlights.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45"
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {agentSection.visible && (
                    <a
                      href="#agent"
                      onClick={() => setActiveSection("agent")}
                      className="mt-7 flex w-full items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-4 text-left transition hover:bg-cyan-300/[0.11]"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-cyan-100">
                          Ask about {firstName}
                        </span>
                        <span className="mt-1 block text-xs text-white/30">
                          Projects, skills, experience and education
                        </span>
                      </span>
                      <span className="text-cyan-300">→</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={downloadLatestCv}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3.5 text-sm font-medium text-white/55 transition hover:border-cyan-300/20 hover:text-white"
                  >
                    Download CV ↓
                  </button>
                </div>
              </div>
            </div>

            {agentSection.visible && (
              <div className="mt-14">
                <a
                  href="#agent"
                  onClick={() => setActiveSection("agent")}
                  className="group inline-flex items-center gap-3 text-sm text-white/28 transition hover:text-white/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition group-hover:border-cyan-300/25">
                    ↓
                  </span>
                  Start with my AI
                </a>
              </div>
            )}
          </div>
        </section>

        {/* AI AGENT */}
        {agentSection.visible && (
          <section
            id="agent"
            className="reveal relative border-t border-white/10 px-6 py-24"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-[-8rem] top-20 h-[28rem] w-[28rem] rounded-full bg-cyan-400/[0.055] blur-[140px]" />
              <div className="absolute right-[-8rem] bottom-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/[0.05] blur-[150px]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    AI Career Assistant
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verified portfolio data
                  </span>
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
                  Don&apos;t scroll. Just ask.
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
                  Ask what matters about {firstName}&apos;s work, skills, experience,
                  education, projects, or achievements. The assistant answers from
                  information published on this Gradfolio.
                </p>
              </div>

              <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111b]/92 shadow-2xl shadow-black/30">
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300">
                      ✦
                    </div>

                    <div>
                      <p className="font-semibold text-white">{firstName} AI</p>
                      <p className="text-xs text-white/30">
                        Portfolio intelligence, without the searching
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/35">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Ready to answer
                  </div>
                </div>

                <div className="p-5 md:p-7">
                  {!answer && !loading && (
                    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 px-6 py-10 text-center md:px-10 md:py-12">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-2xl text-cyan-300 shadow-lg shadow-cyan-950/20">
                        ✦
                      </div>

                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/65">
                        Ask for the proof you need
                      </p>

                      <h3 className="mx-auto mt-3 max-w-xl text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        What would you like to know about {firstName}?
                      </h3>

                      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/35">
                        Choose a question below or ask your own. You do not need to
                        read the whole portfolio first.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex min-h-[22rem] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 p-6">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-2xl text-cyan-300">
                          ✦
                        </div>

                        <p className="mt-5 text-base font-medium text-white/65">
                          Looking through verified portfolio data...
                        </p>

                        <p className="mt-2 text-sm text-white/30">
                          Building a focused answer for you.
                        </p>
                      </div>
                    </div>
                  )}

                  {answer && !loading && (
                    <div className="overflow-hidden rounded-[1.6rem] border border-cyan-300/15 bg-black/20">
                      <div className="border-b border-white/10 bg-cyan-300/[0.035] px-6 py-5 md:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300">
                                ✦
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
                                  {firstName} AI
                                </p>
                                <p className="mt-1 text-xs text-white/30">
                                  Answered from verified portfolio information
                                </p>
                              </div>
                            </div>

                            {submittedQuestion && (
                              <div className="mt-5 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                  Your question
                                </p>
                                <p className="mt-1.5 text-sm leading-6 text-white/60">
                                  {submittedQuestion}
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAnswer("");
                              setQuestion("");
                              setSubmittedQuestion("");
                            }}
                            className="shrink-0 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:border-cyan-300/20 hover:text-white/70"
                          >
                            New question
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-7 md:px-8 md:py-8">
                        <p className="whitespace-pre-wrap text-[15px] leading-8 text-white/72 md:text-base">
                          {answer}
                        </p>

                        <div className="mt-8 border-t border-white/10 pt-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
                            Go straight to the proof
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {isSectionActuallyVisible(projectsSection) && (
                              <a
                                href="#projects"
                                onClick={() => setActiveSection("projects")}
                                className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                              >
                                View Projects →
                              </a>
                            )}

                            {isSectionActuallyVisible(experienceSection) && (
                              <a
                                href="#experience"
                                onClick={() => setActiveSection("experience")}
                                className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                              >
                                View Experience →
                              </a>
                            )}

                            {isSectionActuallyVisible(skillsSection) && (
                              <a
                                href="#skills"
                                onClick={() => setActiveSection("skills")}
                                className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                              >
                                View Skills →
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={downloadLatestCv}
                              className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/[0.14] hover:text-white"
                            >
                              Download CV ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white/65">
                          {answer ? "Ask a follow-up" : "Quick questions"}
                        </p>
                        <p className="mt-1 text-xs text-white/28">
                          {answer
                            ? "Continue with another recruiter-style question."
                            : "Start with something recruiters commonly ask."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2.5 md:grid-cols-2">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => askAgent(suggestion)}
                            disabled={loading}
                            className="group flex min-h-[4.7rem] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/15 text-[10px] font-semibold text-white/30 transition group-hover:border-cyan-300/20 group-hover:text-cyan-300">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="text-sm leading-5 text-white/48 transition group-hover:text-white/75">
                              {suggestion}
                            </span>

                            <span className="ml-auto text-cyan-300/35 transition group-hover:translate-x-0.5 group-hover:text-cyan-300">
                              →
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/30 md:col-span-2">
                          Suggested questions are loading...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            askAgent();
                          }
                        }}
                        placeholder={`Ask anything about ${firstName}'s profile...`}
                        className="min-h-14 flex-1 rounded-xl border border-transparent bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/25 focus:bg-black/10"
                      />

                      <button
                        type="button"
                        onClick={() => askAgent()}
                        disabled={loading || !question.trim()}
                        className="min-h-14 rounded-xl bg-cyan-300 px-7 py-3 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {loading ? "Thinking..." : "Ask AI →"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-xs text-white/24 sm:flex-row sm:items-center sm:justify-between">
                    <span>Grounded in information published on this Gradfolio.</span>
                    <span>When the answer is not available, the AI can say so.</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <p className="inline-flex items-center gap-2 text-xs text-white/28">
                  <span className="text-cyan-300">✦</span>
                  Built to help recruiters and visitors find relevant proof faster.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* RECRUITER SHORTCUTS */}
        {agentSection.visible && (
          <section
            aria-label="Portfolio shortcuts"
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-8"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  Prefer to browse directly?
                </p>
                <p className="mt-1 text-sm text-white/35">
                  Jump straight to the part of the portfolio you want to review.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isSectionActuallyVisible(projectsSection) && (
                  <a
                    href="#projects"
                    onClick={() => setActiveSection("projects")}
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                  >
                    Projects
                  </a>
                )}

                {isSectionActuallyVisible(experienceSection) && (
                  <a
                    href="#experience"
                    onClick={() => setActiveSection("experience")}
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                  >
                    Experience
                  </a>
                )}

                {isSectionActuallyVisible(skillsSection) && (
                  <a
                    href="#skills"
                    onClick={() => setActiveSection("skills")}
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                  >
                    Skills
                  </a>
                )}

                {isSectionActuallyVisible(educationSection) && (
                  <a
                    href="#education"
                    onClick={() => setActiveSection("education")}
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 transition hover:border-cyan-300/25 hover:bg-white/[0.05] hover:text-white"
                  >
                    Education
                  </a>
                )}

                <button
                  type="button"
                  onClick={downloadLatestCv}
                  className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/[0.14] hover:text-white"
                >
                  Download CV ↓
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {isSectionActuallyVisible(projectsSection) && (
          <section
            id="projects"
            style={{ order: projectsSection.order }}
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  {projectsLabel}
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {projectsHeading}
                </h2>

                {projectsDescription && (
                  <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                    {projectsDescription}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {publicDataLoaded && projects.length > 0 ? (
                  projects.map((project, index) => (
                    <article
                      key={project.id}
                      className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1018] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:shadow-2xl hover:shadow-black/30"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-black/20">
                        {project.cover_image_url ? (
                          <>
                            <img
                              src={project.cover_image_url}
                              alt={`${project.title} project cover`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="relative flex h-full w-full items-end overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_82%_70%,rgba(99,102,241,0.15),transparent_32%),linear-gradient(135deg,#07111a_0%,#0a1018_48%,#0e1020_100%)] p-6 md:p-7">
                            <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-cyan-300/10" />
                            <div className="pointer-events-none absolute right-7 top-7 h-20 w-20 rounded-full border border-white/[0.06]" />
                            <div className="pointer-events-none absolute bottom-5 left-5 h-px w-24 bg-cyan-300/30" />
                            <div className="pointer-events-none absolute left-6 top-16 text-[6.5rem] font-black leading-none tracking-[-0.08em] text-white/[0.035] md:text-[8rem]">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="relative max-w-[88%]">
                              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                                Project Preview
                              </p>

                              <div className="h-10 w-10 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] p-2.5">
                                <div className="h-full w-full rounded-full border border-cyan-300/50" />
                              </div>

                              {project.technologies && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                  {project.technologies
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean)
                                    .slice(0, 3)
                                    .map((item) => (
                                      <span
                                        key={item}
                                        className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/55 backdrop-blur"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="absolute right-4 top-4 rounded-full border border-cyan-300/20 bg-[#071019]/85 px-3 py-1.5 text-xs capitalize text-cyan-200 backdrop-blur">
                          {project.status.replaceAll("-", " ")}
                        </span>
                      </div>

                      <div className="p-7 md:p-8">

                        <h3 className="text-2xl font-semibold tracking-tight text-white">
                          {project.title}
                        </h3>

                        <p className="mt-4 line-clamp-4 leading-7 text-white/50">
                          {project.short_description ||
                            project.full_description ||
                            "Project details available in the portfolio manager."}
                        </p>

                        {project.highlight && (
                          <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-3.5 py-2 text-sm font-medium text-cyan-100">
                            <span className="text-cyan-300">✦</span>
                            <span>{project.highlight}</span>
                          </div>
                        )}

                        {project.technologies && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {project.technologies
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .slice(0, 8)
                              .map((item) => (
                                <span
                                  key={item}
                                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45"
                                >
                                  {item}
                                </span>
                              ))}
                          </div>
                        )}

                        {(project.project_url || project.github_url) && (
                          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                            {project.project_url && (
                              <a
                                href={project.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200"
                              >
                                View Project ↗
                              </a>
                            )}

                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/65 transition hover:border-cyan-300/25 hover:text-white"
                              >
                                GitHub ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35 md:col-span-2">
                    No projects have been published yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {isSectionActuallyVisible(experienceSection) && (
          <section
            id="experience"
            style={{ order: experienceSection.order }}
            className="reveal border-t border-white/10 px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Experience
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Work & Internships
                </h2>

                <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                  Practical experience, internships, and roles that helped shape
                  my technical and professional growth.
                </p>
              </div>

              {publicDataLoaded && experience.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-0 left-[7px] top-0 hidden w-px bg-white/10 md:block" />

                  <div className="space-y-5">
                    {experience.map((item) => (
                      <article
                        key={item.id}
                        className="relative md:pl-10"
                      >
                        <div className="absolute left-0 top-8 hidden h-4 w-4 rounded-full border border-cyan-300/35 bg-[#070b12] md:block">
                          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300" />
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1019]/75 transition duration-300 hover:border-cyan-300/25 hover:bg-[#0b131e]">
                          <div className="grid gap-0 lg:grid-cols-[0.32fr_0.68fr]">
                            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-7">
                              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                                {item.company}
                              </p>

                              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                {item.role}
                              </h3>

                              {(item.start_date || item.end_date) && (
                                <p className="mt-4 text-sm text-white/45">
                                  {[item.start_date, item.end_date]
                                    .filter(Boolean)
                                    .join(" — ")}
                                </p>
                              )}

                              {item.location && (
                                <p className="mt-2 text-sm text-white/30">
                                  {item.location}
                                </p>
                              )}
                            </div>

                            <div className="p-6 lg:p-7">
                              {item.description ? (
                                <p className="max-w-3xl whitespace-pre-line text-[15px] leading-7 text-white/50">
                                  {item.description}
                                </p>
                              ) : (
                                <p className="text-sm text-white/30">
                                  Experience details available on request.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
                  No experience has been published yet.
                </div>
              )}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {isSectionActuallyVisible(educationSection) && (
          <section
            id="education"
            style={{ order: educationSection.order }}
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Education
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Academic Background
                </h2>

                <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                  Degrees, studies, and academic experience that support my
                  professional direction.
                </p>
              </div>

              {publicDataLoaded && education.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {education.map((item) => (
                    <article
                      key={item.id}
                      className="group rounded-2xl border border-white/10 bg-[#0a1019]/65 p-7 transition duration-300 hover:border-cyan-300/25"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/65">
                          Education
                        </span>

                        {(item.start_date || item.end_date) && (
                          <span className="text-xs text-white/30">
                            {[item.start_date, item.end_date]
                              .filter(Boolean)
                              .join(" — ")}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-xl font-semibold leading-8 text-white">
                        {[item.degree, item.field]
                          .filter(Boolean)
                          .join(" — ") || "Education"}
                      </h3>

                      {item.institution && (
                        <p className="mt-2 text-base font-medium text-cyan-300">
                          {item.institution}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/45">
                          {item.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
                  No education has been published yet.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS */}
        {isSectionActuallyVisible(achievementsSection) && (
          <section
            id="achievements"
            style={{ order: achievementsSection.order }}
            className="reveal border-t border-white/10 px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Highlights
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Achievements
                </h2>

                <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                  Milestones, recognition, and outcomes worth highlighting.
                </p>
              </div>

              {publicDataLoaded && achievements.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {achievements.map((item, index) => (
                    <article
                      key={item.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition duration-300 hover:border-cyan-300/25"
                    >
                      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-cyan-300/70 via-cyan-300/15 to-transparent" />

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-medium tracking-[0.2em] text-white/25">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {item.date && (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan-300/70">
                            {item.date}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-white">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-3 leading-7 text-white/48">
                          {item.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35">
                  No achievements have been published yet.
                </div>
              )}
            </div>
          </section>
        )}

        {/* SKILLS */}
        {isSectionActuallyVisible(skillsSection) && (
          <section
            id="skills"
            style={{ order: skillsSection.order }}
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  {skillsLabel}
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {skillsHeading}
                </h2>

                {skillsDescription && (
                  <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                    {skillsDescription}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publicDataLoaded && skills.length > 0 ? (
                  skills.map((skill) => (
                    <article
                      key={skill.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 transition duration-300 hover:border-cyan-300/25 hover:bg-white/[0.035]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-cyan-300/70" />
                        <h3 className="text-base font-semibold text-white">
                          {skill.title}
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-white/42">
                        {skill.description}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/35 sm:col-span-2 lg:col-span-3">
                    No skills have been published yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {isSectionActuallyVisible(certificationsSection) && (
          <section
            id="certifications"
            style={{ order: certificationsSection.order }}
            className="reveal border-t border-white/10 px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  {certificationsLabel}
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {certificationsHeading}
                </h2>

                {certificationsDescription && (
                  <p className="mt-4 text-base leading-7 text-white/45 md:text-lg">
                    {certificationsDescription}
                  </p>
                )}
              </div>

              {publicDataLoaded && certifications.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {certifications.map((certification, index) => (
                    <article
                      key={certification.id}
                      className="group rounded-2xl border border-white/10 bg-[#0a1019]/45 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.025]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-semibold tracking-[0.22em] text-white/20">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="inline-flex items-center gap-2 text-[11px] capitalize text-cyan-300/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
                          {certification.status.replaceAll("-", " ")}
                        </span>
                      </div>

                      <h3 className="mt-5 text-base font-semibold leading-6 text-white">
                        {certification.title}
                      </h3>

                      {certification.issuer && (
                        <p className="mt-2 text-sm text-white/38">
                          {certification.issuer}
                        </p>
                      )}

                      <div className="mt-5 flex min-h-5 flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 text-xs">
                        {certification.issue_date ? (
                          <span className="text-white/25">
                            {certification.issue_date}
                          </span>
                        ) : (
                          <span />
                        )}

                        {certification.credential_url && (
                          <a
                            href={certification.credential_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-cyan-300/80 transition group-hover:text-cyan-200"
                          >
                            Credential ↗
                          </a>
                        )}
                      </div>
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
            style={{ order: aboutSection.order }}
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                  {aboutLabel}
                </p>

                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {aboutHeading}
                </h2>
              </div>

              <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#0a1019]/55 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="relative p-8 md:p-10 lg:p-12">
                  <div className="absolute left-0 top-10 h-20 w-px bg-gradient-to-b from-cyan-300/70 to-transparent" />

                  <div className="max-w-3xl">
                    <p className="text-base leading-8 text-white/58 md:text-lg md:leading-9">
                      {aboutPrimaryText}
                    </p>

                    {aboutSecondaryText && (
                      <p className="mt-7 border-t border-white/[0.07] pt-7 text-base leading-8 text-white/40 md:text-lg md:leading-9">
                        {aboutSecondaryText}
                      </p>
                    )}
                  </div>
                </div>

                <aside className="border-t border-white/10 bg-gradient-to-br from-cyan-300/[0.045] to-transparent p-8 md:p-10 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                        Focus
                      </p>

                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {aboutFocusHeading}
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] text-lg text-cyan-300">
                      ✦
                    </div>
                  </div>

                  <div className="mt-7 space-y-2.5">
                    {publicDataLoaded && careerFocus.length > 0 ? (
                      careerFocus.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3"
                        >
                          <span className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300/55">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="text-sm leading-6 text-white/58">
                            {item.title}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/30">
                        Add focus areas from the admin dashboard.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {contactSection.visible && (
          <section
            id="contact"
            style={{ order: contactSection.order }}
            className="reveal border-t border-white/10 bg-white/[0.015] px-6 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1019]/85">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-cyan-300/[0.08]" />
                <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-cyan-300/[0.06]" />

                <div className="grid gap-10 p-8 md:p-10 lg:grid-cols-[1fr_0.85fr] lg:p-12">
                  <div className="relative">
                    <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300">
                      {contactLabel}
                    </p>

                    <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
                      {contactHeading}
                    </h2>

                    {contactDescription && (
                      <p className="mt-5 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
                        {contactDescription}
                      </p>
                    )}

                    <div className="mt-8 flex items-center gap-3 text-sm text-white/35">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-300">
                        ✦
                      </span>
                      <span>Open to conversations, opportunities, and collaborations.</span>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-white/[0.08] bg-black/10 p-5 md:p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/28">
                      Connect
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-sm text-white/70 transition hover:border-cyan-300/25 hover:text-white"
                        >
                          <span>Email</span>
                          <span className="text-cyan-300/60 transition group-hover:translate-x-0.5">↗</span>
                        </a>
                      )}

                      {linkedIn && (
                        <a
                          href={linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-sm text-white/70 transition hover:border-cyan-300/25 hover:text-white"
                        >
                          <span>LinkedIn</span>
                          <span className="text-cyan-300/60 transition group-hover:translate-x-0.5">↗</span>
                        </a>
                      )}

                      {github && (
                        <a
                          href={github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-sm text-white/70 transition hover:border-cyan-300/25 hover:text-white"
                        >
                          <span>GitHub</span>
                          <span className="text-cyan-300/60 transition group-hover:translate-x-0.5">↗</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={downloadLatestCv}
                        className="flex items-center justify-between rounded-xl bg-cyan-300 px-4 py-4 text-left text-sm font-semibold text-black transition hover:bg-cyan-200"
                      >
                        <span>Download CV</span>
                        <span>↓</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] px-8 py-6 md:px-10 lg:px-12">
                  <div className="flex flex-col gap-5 text-sm sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-white/25">
                        © {new Date().getFullYear()}{" "}
                        {profile?.full_name || "Portfolio Owner"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/20">
                        <span>
                          Built by{" "}
                          <a
                            href="mailto:ebraheimpasha@gmail.com"
                            className="text-cyan-300/60 transition hover:text-cyan-200"
                          >
                            Ebraheim Mohamed Pasha Qadri
                          </a>
                        </span>

                        <span className="text-white/10">·</span>

                        <a
                          href="mailto:ebraheimpasha@gmail.com?subject=Website%20Enquiry"
                          className="text-cyan-300/60 transition hover:text-cyan-200"
                        >
                          Contact Me
                        </a>
                      </div>
                    </div>

                    <a
                      href="#home"
                      onClick={() => setActiveSection("home")}
                      className="inline-flex items-center gap-2 text-sm text-white/30 transition hover:text-cyan-300"
                    >
                      Back to top
                      <span>↑</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}