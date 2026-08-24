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
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Premium top progress indicator.
  useEffect(() => {
    function updateScrollProgress() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setScrollProgress(0);
        return;
      }

      setScrollProgress(
        Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
      );
    }

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  // Signature cursor-follow spotlight.
  useEffect(() => {
    const root = document.documentElement;

    function updatePointerGlow(event: PointerEvent) {
      root.style.setProperty("--gradfolio-pointer-x", `${event.clientX}px`);
      root.style.setProperty("--gradfolio-pointer-y", `${event.clientY}px`);
    }

    window.addEventListener("pointermove", updatePointerGlow, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointerGlow);
    };
  }, []);

  // Repeatable scroll reveal animation.
  // Elements reveal every time they enter the viewport and reset after they
  // leave it, so scrolling back up/down keeps the motion alive.
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .reveal-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-3% 0px -8% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [publicDataLoaded]);

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

  // Keep the navigation in sync with the section currently in view.
  // This effect must live after orderedNavigation is initialized.
  useEffect(() => {
    const sectionIds = [
      "home",
      ...orderedNavigation.map((section) => section.key),
    ];

    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-24% 0px -58% 0px",
        threshold: [0.01, 0.12, 0.3, 0.5],
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [publicDataLoaded, sections, projects.length, experience.length, education.length, achievements.length, skills.length, certifications.length]);

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
      {/* PREMIUM VISUAL + MOTION SYSTEM */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #060a11;
        }

        ::selection {
          background: rgba(103, 232, 249, 0.28);
          color: white;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(103, 232, 249, 0.25) rgba(255, 255, 255, 0.03);
        }

        *::-webkit-scrollbar {
          width: 9px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        *::-webkit-scrollbar-thumb {
          border: 2px solid #060a11;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(103, 232, 249, 0.5),
            rgba(129, 140, 248, 0.32)
          );
        }

        @keyframes aurora-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(4%, -3%, 0) scale(1.08);
          }
          66% {
            transform: translate3d(-3%, 4%, 0) scale(0.96);
          }
        }

        @keyframes float-soft {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.82;
            transform: scale(1.08);
          }
        }

        @keyframes shine-sweep {
          0% {
            transform: translateX(-140%) skewX(-16deg);
          }
          55%,
          100% {
            transform: translateX(240%) skewX(-16deg);
          }
        }

        @keyframes gradient-breathe {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes scroll-nudge {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          50% {
            transform: translateY(5px);
            opacity: 1;
          }
        }

        .premium-page-bg {
          background:
            radial-gradient(circle at 12% 8%, rgba(34, 211, 238, 0.07), transparent 30%),
            radial-gradient(circle at 86% 15%, rgba(139, 92, 246, 0.065), transparent 27%),
            radial-gradient(circle at 58% 65%, rgba(59, 130, 246, 0.035), transparent 34%),
            #060a11;
        }

        .premium-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, black 0%, transparent 76%);
        }

        .premium-gradient-text {
          background: linear-gradient(
            110deg,
            #ffffff 8%,
            #ffffff 42%,
            #a5f3fc 63%,
            #c4b5fd 82%,
            #ffffff 100%
          );
          background-size: 220% 220%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradient-breathe 8s ease-in-out infinite;
        }

        .premium-card {
          position: relative;
          isolation: isolate;
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
        }

        .premium-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: inherit;
          pointer-events: none;
          background:
            linear-gradient(
              135deg,
              rgba(103, 232, 249, 0.035),
              transparent 36%,
              rgba(139, 92, 246, 0.025)
            );
        }

        .premium-card:hover {
          box-shadow:
            0 34px 90px rgba(0, 0, 0, 0.36),
            0 0 55px rgba(34, 211, 238, 0.035),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .shine-button {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .shine-button::after {
          content: "";
          position: absolute;
          inset: -30% auto -30% -25%;
          width: 28%;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.55),
            transparent
          );
          animation: shine-sweep 4.8s ease-in-out infinite;
        }

        .reveal,
        .reveal-card {
          opacity: 0;
          filter: blur(7px);
          transform: translateY(34px) scale(0.988);
          transition:
            opacity 0.78s cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 0.78s cubic-bezier(0.2, 0.8, 0.2, 1),
            filter 0.78s ease;
          will-change: opacity, transform, filter;
        }

        .reveal.is-visible,
        .reveal-card.is-visible {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0) scale(1);
        }

        .reveal-card:nth-child(2) {
          transition-delay: 70ms;
        }

        .reveal-card:nth-child(3) {
          transition-delay: 120ms;
        }

        .reveal-card:nth-child(4) {
          transition-delay: 170ms;
        }

        .reveal-card:nth-child(5) {
          transition-delay: 220ms;
        }

        .reveal-card:nth-child(6) {
          transition-delay: 270ms;
        }

        main section {
          position: relative;
        }

        main section::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -1px;
          width: min(76vw, 760px);
          height: 1px;
          transform: translateX(-50%);
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(103, 232, 249, 0.12),
            rgba(167, 139, 250, 0.09),
            transparent
          );
        }

        main article {
          transition:
            transform 0.32s ease,
            border-color 0.32s ease,
            background-color 0.32s ease,
            box-shadow 0.32s ease;
        }

        main article:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.18),
            0 0 40px rgba(34, 211, 238, 0.025);
        }

        main article img {
          transition:
            transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1),
            filter 0.5s ease;
        }

        main article:hover img {
          transform: scale(1.035);
          filter: saturate(1.06) contrast(1.02);
        }

        .float-soft {
          animation: float-soft 5.5s ease-in-out infinite;
        }

        .pulse-soft {
          animation: pulse-soft 5s ease-in-out infinite;
        }

        .scroll-nudge {
          animation: scroll-nudge 2.2s ease-in-out infinite;
        }


        @keyframes orbit-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes glow-breathe {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.7;
          }
        }

        .pointer-spotlight {
          background: radial-gradient(
            460px circle at var(--gradfolio-pointer-x, 50vw)
              var(--gradfolio-pointer-y, 35vh),
            rgba(103, 232, 249, 0.055),
            rgba(129, 140, 248, 0.02) 38%,
            transparent 72%
          );
        }

        .signature-orbit {
          animation: orbit-slow 24s linear infinite;
        }

        .signature-orbit-reverse {
          animation: orbit-reverse 30s linear infinite;
        }

        .signature-glow {
          animation: glow-breathe 6s ease-in-out infinite;
        }

        .hero-marquee-track {
          width: max-content;
          animation: marquee-left 26s linear infinite;
        }

        .hero-marquee:hover .hero-marquee-track {
          animation-play-state: paused;
        }

        .premium-section-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
        }

        .premium-section-kicker::before {
          content: "";
          display: block;
          width: 1.65rem;
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(103, 232, 249, 0.95),
            rgba(103, 232, 249, 0.12)
          );
          box-shadow: 0 0 18px rgba(103, 232, 249, 0.25);
        }

        .premium-section-title {
          text-wrap: balance;
        }

        .premium-lift {
          transition:
            transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .premium-lift:hover {
          transform: translateY(-5px);
          border-color: rgba(103, 232, 249, 0.22);
          box-shadow:
            0 24px 65px rgba(0, 0, 0, 0.28),
            0 0 48px rgba(34, 211, 238, 0.035);
        }

        .glass-edge {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 1px 0 0 rgba(103, 232, 249, 0.035),
            0 22px 70px rgba(0, 0, 0, 0.18);
        }


        /* ---------- V4 ART DIRECTION ---------- */

        main {
          background:
            radial-gradient(circle at 14% 6%, rgba(34, 211, 238, 0.055), transparent 26rem),
            radial-gradient(circle at 88% 18%, rgba(139, 92, 246, 0.055), transparent 28rem),
            linear-gradient(135deg, #050910 0%, #07101a 42%, #090c18 72%, #070a12 100%);
        }

        main::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -8;
          pointer-events: none;
          opacity: 0.32;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0 0.5px, transparent 0.65px),
            radial-gradient(circle at 70% 65%, rgba(255, 255, 255, 0.035) 0 0.5px, transparent 0.65px);
          background-size: 22px 22px, 31px 31px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent 92%);
        }

        section {
          isolation: isolate;
        }

        section[id] {
          background-color: transparent;
          background-repeat: no-repeat;
          background-size: 100% 100%;
        }

        #agent {
          background-image:
            radial-gradient(circle at 6% 22%, rgba(34, 211, 238, 0.075), transparent 30rem),
            radial-gradient(circle at 91% 18%, rgba(129, 140, 248, 0.075), transparent 31rem);
        }

        #projects {
          background-image:
            radial-gradient(circle at 9% 20%, rgba(14, 165, 233, 0.07), transparent 29rem),
            radial-gradient(circle at 88% 78%, rgba(139, 92, 246, 0.07), transparent 32rem);
        }

        #experience {
          background-image:
            radial-gradient(circle at 13% 44%, rgba(45, 212, 191, 0.06), transparent 28rem),
            radial-gradient(circle at 92% 18%, rgba(59, 130, 246, 0.045), transparent 28rem);
        }

        #education {
          background-image:
            radial-gradient(circle at 82% 20%, rgba(99, 102, 241, 0.065), transparent 30rem),
            radial-gradient(circle at 5% 82%, rgba(34, 211, 238, 0.045), transparent 26rem);
        }

        #achievements {
          background-image:
            radial-gradient(circle at 90% 35%, rgba(168, 85, 247, 0.065), transparent 28rem),
            radial-gradient(circle at 8% 78%, rgba(34, 211, 238, 0.04), transparent 28rem);
        }

        #skills {
          background-image:
            radial-gradient(circle at 12% 18%, rgba(34, 211, 238, 0.065), transparent 30rem),
            radial-gradient(circle at 86% 82%, rgba(99, 102, 241, 0.05), transparent 30rem);
        }

        #certifications {
          background-image:
            radial-gradient(circle at 88% 18%, rgba(59, 130, 246, 0.06), transparent 30rem),
            radial-gradient(circle at 15% 88%, rgba(139, 92, 246, 0.045), transparent 28rem);
        }

        #about {
          background-image:
            radial-gradient(circle at 12% 24%, rgba(45, 212, 191, 0.055), transparent 28rem),
            radial-gradient(circle at 88% 72%, rgba(129, 140, 248, 0.05), transparent 30rem);
        }

        #contact {
          background-image:
            radial-gradient(circle at 86% 24%, rgba(139, 92, 246, 0.06), transparent 30rem),
            radial-gradient(circle at 10% 74%, rgba(34, 211, 238, 0.05), transparent 28rem);
        }

        section[id]::before {
          position: absolute;
          z-index: -1;
          top: clamp(4rem, 10vw, 8rem);
          right: clamp(1.5rem, 6vw, 7rem);
          font-size: clamp(6rem, 14vw, 12rem);
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: -0.08em;
          color: rgba(255, 255, 255, 0.018);
          pointer-events: none;
          user-select: none;
        }

        #agent::before {
          content: "AI";
        }

        #projects::before {
          content: "01";
        }

        #experience::before {
          content: "02";
        }

        #education::before {
          content: "03";
        }

        #achievements::before {
          content: "04";
        }

        #skills::before {
          content: "05";
        }

        #certifications::before {
          content: "06";
        }

        #about::before {
          content: "07";
        }

        #contact::before {
          content: "08";
        }

        .premium-section-kicker {
          letter-spacing: 0.34em !important;
          font-size: 0.72rem !important;
          font-weight: 700;
          text-shadow: 0 0 26px rgba(103, 232, 249, 0.22);
        }

        .premium-section-title {
          position: relative;
          display: inline-block;
          max-width: 100%;
          background:
            linear-gradient(
              108deg,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,1) 52%,
              rgba(165,243,252,0.96) 72%,
              rgba(196,181,253,0.92) 100%
            );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
        }

        .premium-section-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.6rem;
          width: min(5rem, 28%);
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #67e8f9, #818cf8, transparent);
          box-shadow: 0 0 22px rgba(103, 232, 249, 0.35);
          transform-origin: left;
          transform: scaleX(0.38);
          transition: transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        section.is-visible .premium-section-title::after {
          transform: scaleX(1);
        }

        main article,
        .premium-card,
        .glass-edge {
          border-color: rgba(255, 255, 255, 0.085);
          background-image:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.028),
              transparent 38%,
              rgba(103,232,249,0.014) 72%,
              rgba(139,92,246,0.018)
            );
          backdrop-filter: blur(18px);
        }

        main article::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0;
          background:
            radial-gradient(
              320px circle at 50% 0%,
              rgba(103, 232, 249, 0.06),
              transparent 70%
            );
          transition: opacity 0.35s ease;
        }

        main article:hover::after {
          opacity: 1;
        }

        .reveal-card:nth-child(odd) {
          transform: translate3d(-22px, 32px, 0) scale(0.988);
        }

        .reveal-card:nth-child(even) {
          transform: translate3d(22px, 32px, 0) scale(0.988);
        }

        .reveal-card.is-visible {
          transform: translate3d(0, 0, 0) scale(1);
        }

        #experience article:nth-child(odd),
        #education article:nth-child(odd),
        #achievements article:nth-child(odd),
        #skills article:nth-child(odd),
        #certifications article:nth-child(odd) {
          background-color: rgba(7, 14, 23, 0.68);
        }

        #experience article:nth-child(even),
        #education article:nth-child(even),
        #achievements article:nth-child(even),
        #skills article:nth-child(even),
        #certifications article:nth-child(even) {
          background-color: rgba(9, 12, 24, 0.68);
        }

        #skills article,
        #certifications article {
          overflow: hidden;
        }

        #skills article::before,
        #certifications article::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(103, 232, 249, 0.35),
            rgba(129, 140, 248, 0.18),
            transparent
          );
          transform: scaleX(0.18);
          opacity: 0.35;
          transition:
            transform 0.5s ease,
            opacity 0.5s ease;
        }

        #skills article:hover::before,
        #certifications article:hover::before {
          transform: scaleX(1);
          opacity: 1;
        }

        #about .premium-card,
        #contact .premium-card {
          background:
            linear-gradient(
              135deg,
              rgba(8, 17, 28, 0.9),
              rgba(10, 13, 25, 0.84)
            );
        }

        #contact a,
        #contact button {
          transition:
            transform 0.28s ease,
            background-color 0.28s ease,
            border-color 0.28s ease,
            box-shadow 0.28s ease;
        }

        #contact a:hover,
        #contact button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
        }

        header nav a {
          position: relative;
        }

        header nav a::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0.35rem;
          width: 0;
          height: 1px;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #67e8f9, #818cf8);
          box-shadow: 0 0 12px rgba(103,232,249,0.28);
          transition: width 0.28s ease;
        }

        header nav a:hover::after {
          width: 42%;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }

          .reveal,
          .reveal-card {
            opacity: 1;
            filter: none;
            transform: none;
          }
        }
      `}</style>

      <main className="premium-page-bg relative isolate flex min-h-screen flex-col overflow-hidden bg-[#050910] text-white">
        <div className="pointer-events-none fixed inset-0 -z-20">
          <div className="premium-grid absolute inset-0 opacity-70" />
          <div className="absolute left-[-12rem] top-[8%] h-[34rem] w-[34rem] rounded-full bg-cyan-400/[0.055] blur-[150px] [animation:aurora-drift_15s_ease-in-out_infinite]" />
          <div className="absolute right-[-13rem] top-[22%] h-[38rem] w-[38rem] rounded-full bg-violet-500/[0.05] blur-[160px] [animation:aurora-drift_18s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[-16rem] left-[38%] h-[34rem] w-[34rem] rounded-full bg-blue-500/[0.035] blur-[160px] [animation:aurora-drift_20s_ease-in-out_infinite]" />
        </div>

        <div
          aria-hidden="true"
          className="fixed left-0 top-0 z-[70] h-[2px] bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 shadow-[0_0_14px_rgba(103,232,249,0.55)] transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        <div
          aria-hidden="true"
          className="pointer-spotlight pointer-events-none fixed inset-0 z-[-5] hidden lg:block"
        />

        <div className="fixed bottom-8 left-6 z-40 hidden 2xl:flex 2xl:flex-col 2xl:items-center 2xl:gap-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.26em] text-white/20 [writing-mode:vertical-rl]">
            Explore
          </span>
          <div className="h-24 w-px overflow-hidden bg-white/[0.08]">
            <div
              className="w-full bg-gradient-to-b from-cyan-300 to-violet-400 transition-[height] duration-200"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold tabular-nums text-cyan-200/55">
            {String(Math.round(scrollProgress)).padStart(2, "0")}
          </span>
        </div>
        {/* NAVBAR */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-[#060a11]/72 shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between py-4">
              <a
                href="#home"
                onClick={() => {
                  setActiveSection("home");
                  setMobileMenuOpen(false);
                }}
                className="group relative text-lg font-semibold tracking-tight text-white transition hover:text-cyan-200"
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
                        ? "rounded-lg border border-cyan-300/15 bg-gradient-to-r from-cyan-300/[0.10] to-violet-400/[0.05] px-4 py-2 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.04)]"
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
                <span aria-hidden="true" className="text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
          style={{ order: 0, scrollMarginTop: "4.75rem" }}
          className="relative flex min-h-[calc(100svh-4.75rem)] items-center overflow-hidden px-6 pb-10 pt-24 lg:pb-12 lg:pt-24"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-11rem] top-[12%] h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.08] blur-[145px] [animation:aurora-drift_13s_ease-in-out_infinite]" />
            <div className="absolute right-[-9rem] top-[14%] h-[33rem] w-[33rem] rounded-full bg-violet-500/[0.075] blur-[150px] [animation:aurora-drift_16s_ease-in-out_infinite_reverse]" />

            <div className="signature-glow absolute left-[39%] top-[18%] hidden h-[20rem] w-[20rem] lg:block">
              <div className="signature-orbit absolute inset-0 rounded-full border border-cyan-300/[0.08]">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300/50 shadow-[0_0_26px_rgba(103,232,249,0.7)]" />
              </div>
              <div className="signature-orbit-reverse absolute inset-10 rounded-full border border-violet-300/[0.08]">
                <span className="absolute bottom-2 right-4 h-2.5 w-2.5 rounded-full bg-violet-300/45 shadow-[0_0_24px_rgba(196,181,253,0.6)]" />
              </div>
              <div className="absolute inset-[5.6rem] rounded-full border border-white/[0.05] bg-white/[0.012] backdrop-blur-sm" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:gap-14">
              <div>
                <p className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/75">
                  {heroTitle}
                </p>

                <h1 className="premium-gradient-text max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.058em] sm:text-6xl md:text-7xl lg:text-[4.85rem]">
                  {heroName}
                </h1>

                {heroTagline && (
                  <p className="mt-5 max-w-3xl text-base font-medium tracking-[-0.01em] text-cyan-100/72 md:text-lg">
                    {heroTagline}
                  </p>
                )}

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/48 md:text-base">
                  {heroBio}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {agentSection.visible && (
                    <a
                      href="#agent"
                      onClick={() => setActiveSection("agent")}
                      className="shine-button rounded-xl bg-cyan-300 px-6 py-3.5 font-semibold text-black shadow-[0_12px_35px_rgba(34,211,238,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-cyan-200 hover:shadow-[0_16px_45px_rgba(34,211,238,0.18)]"
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

                <p className="mt-5 text-sm text-white/28">
                  Ask first, or browse the portfolio normally.
                </p>
              </div>

              <div className="mx-auto w-full max-w-md lg:mx-0">
                <div className="premium-card glass-edge premium-lift rounded-[1.65rem] border border-white/10 bg-[#09111a]/74 p-6 backdrop-blur-2xl">
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

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/35">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
                        AI-ready verified profile
                      </div>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                      <span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">→</span>
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
              <div className="mt-8">
                <a
                  href="#agent"
                  onClick={() => setActiveSection("agent")}
                  className="group inline-flex items-center gap-3 text-sm text-white/28 transition hover:text-white/60"
                >
                  <span className="scroll-nudge flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition group-hover:border-cyan-300/25">
                    ↓
                  </span>
                  Start with my AI
                </a>
              </div>
            )}
          </div>
        </section>

        <div className="hero-marquee relative overflow-hidden border-y border-white/[0.07] bg-gradient-to-r from-cyan-300/[0.018] via-white/[0.012] to-violet-400/[0.018] py-3 backdrop-blur-sm">
          <div className="hero-marquee-track flex items-center gap-8 pr-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
            {[
              "AI-powered portfolio",
              "Verified data",
              "Projects",
              "Experience",
              "Skills",
              "Education",
              "Ask before you scroll",
              "Built with Gradfolio",
              "AI-powered portfolio",
              "Verified data",
              "Projects",
              "Experience",
              "Skills",
              "Education",
              "Ask before you scroll",
              "Built with Gradfolio",
            ].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex shrink-0 items-center gap-3"
              >
                <span className="h-1 w-1 rounded-full bg-cyan-300/70" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* AI AGENT */}
        {agentSection.visible && (
          <section
            id="agent"
            style={{ scrollMarginTop: "4.75rem" }}
            className="reveal relative border-t border-white/10 px-6 py-16 lg:py-18"
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

                <h2 className="premium-gradient-text mt-5 text-4xl font-black tracking-[-0.055em] md:text-5xl lg:text-[3.55rem]">
                  Don&apos;t scroll. Just ask.
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
                  Ask what matters about {firstName}&apos;s work, skills, experience,
                  education, projects, or achievements. The assistant answers from
                  information published on this Gradfolio.
                </p>
              </div>

              <div className="premium-card mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111b]/86 backdrop-blur-xl">
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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

                <div className="p-4 md:p-5">
                  {!answer && !loading && (
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-6 py-7 text-center md:px-8 md:py-8">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] text-xl text-cyan-300 shadow-lg shadow-cyan-950/20">
                        ✦
                      </div>

                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/65">
                        Ask for the proof you need
                      </p>

                      <h3 className="mx-auto mt-2 max-w-xl text-xl font-semibold tracking-tight text-white md:text-2xl">
                        What would you like to know about {firstName}?
                      </h3>

                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/35">
                        Choose a question below or ask your own. You do not need to
                        read the whole portfolio first.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex min-h-[22rem] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 p-6">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-2xl text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                    <div className="rounded-[1.6rem] border border-cyan-300/15 bg-black/20 p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                          ✦
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
                                {firstName} AI
                              </p>
                              <p className="mt-1 text-xs text-white/25">
                                Answered from verified profile information
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setAnswer("");
                                setQuestion("");
                              }}
                              className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:border-cyan-300/20 hover:text-white/70"
                            >
                              Ask something else
                            </button>
                          </div>

                          <div className="mt-6 border-l border-cyan-300/25 pl-5">
                            <p className="whitespace-pre-wrap text-[15px] leading-8 text-white/68 md:text-base">
                              {answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="grid gap-2.5 md:grid-cols-2">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuestion(suggestion)}
                            className="group flex min-h-[3.9rem] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/15 text-[10px] font-semibold text-white/30 transition group-hover:border-cyan-300/20 group-hover:text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="text-sm leading-5 text-white/48 transition group-hover:text-white/75">
                              {suggestion}
                            </span>

                            <span className="ml-auto text-cyan-300/35 transition group-hover:translate-x-0.5 group-hover:text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                        className="min-h-12 flex-1 rounded-xl border border-transparent bg-transparent px-4 py-2.5 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/25 focus:bg-black/10"
                      />

                      <button
                        type="button"
                        onClick={askAgent}
                        disabled={loading || !question.trim()}
                        className="shine-button min-h-12 rounded-xl bg-cyan-300 px-6 py-2.5 font-semibold text-black shadow-[0_10px_30px_rgba(34,211,238,0.10)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                  <span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">✦</span>
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
            className="reveal border-t border-white/10 bg-gradient-to-r from-cyan-300/[0.018] via-white/[0.012] to-violet-400/[0.018] px-6 py-8 backdrop-blur-sm"
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
            className="reveal relative border-t border-white/10 bg-white/[0.012] px-6 py-24"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-[-10rem] top-[8%] h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.045] blur-[150px] [animation:aurora-drift_17s_ease-in-out_infinite]" />
              <div className="absolute right-[-8rem] bottom-[4%] h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.04] blur-[160px] [animation:aurora-drift_20s_ease-in-out_infinite_reverse]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                    {projectsLabel}
                  </p>

                  <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
                    {projectsHeading}
                  </h2>

                  {projectsDescription && (
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
                      {projectsDescription}
                    </p>
                  )}
                </div>

                <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white/35 lg:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-300">
                    ↗
                  </span>
                  <span>
                    Selected work with
                    <br />
                    real outcomes and proof.
                  </span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {publicDataLoaded && projects.length > 0 ? (
                  projects.map((project, index) => (
                    <article
                      key={project.id}
                      className="premium-lift reveal-card premium-card group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0a1018]/88 backdrop-blur-xl"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-black/20">
                        {project.cover_image_url ? (
                          <>
                            <img
                              src={project.cover_image_url}
                              alt={`${project.title} project cover`}
                              className="h-full w-full object-cover"
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071019]/90 via-black/10 to-transparent opacity-80 transition duration-500 group-hover:opacity-55" />

                            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                              <div className="absolute -left-20 top-1/4 h-40 w-40 rounded-full bg-cyan-300/[0.12] blur-3xl" />
                              <div className="absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-violet-400/[0.10] blur-3xl" />
                            </div>
                          </>
                        ) : (
                          <div className="relative flex h-full w-full items-end overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_82%_70%,rgba(99,102,241,0.15),transparent_32%),linear-gradient(135deg,#07111a_0%,#0a1018_48%,#0e1020_100%)] p-6 md:p-7">
                            <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-cyan-300/10 transition duration-700 group-hover:scale-125 group-hover:border-cyan-300/20" />
                            <div className="pointer-events-none absolute right-7 top-7 h-20 w-20 rounded-full border border-white/[0.06] transition duration-700 group-hover:translate-x-2 group-hover:-translate-y-2" />
                            <div className="pointer-events-none absolute bottom-5 left-5 h-px w-24 bg-cyan-300/30 transition-all duration-500 group-hover:w-40" />
                            <div className="pointer-events-none absolute left-6 top-16 text-[6.5rem] font-black leading-none tracking-[-0.08em] text-white/[0.035] transition duration-500 group-hover:text-white/[0.06] md:text-[8rem]">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="relative max-w-[88%]">
                              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                                Project Preview
                              </p>

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300 transition duration-300 group-hover:-translate-y-1 group-hover:rotate-6">
                                ✦
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

                        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                          <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="rounded-full border border-cyan-300/20 bg-[#071019]/80 px-3 py-1.5 text-xs capitalize text-cyan-200 backdrop-blur-md">
                            {project.status.replaceAll("-", " ")}
                          </span>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between px-5 pb-5 opacity-0 transition duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65 backdrop-blur">
                            Explore project
                          </span>

                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.10] text-cyan-200 backdrop-blur">
                            ↗
                          </span>
                        </div>
                      </div>

                      <div className="relative p-7 md:p-8">
                        <div className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-cyan-300/80 to-violet-400/50 transition-all duration-500 group-hover:w-full" />

                        <h3 className="text-2xl font-semibold tracking-tight text-white transition duration-300 group-hover:text-cyan-100">
                          {project.title}
                        </h3>

                        <p className="mt-4 line-clamp-4 leading-7 text-white/50">
                          {project.short_description ||
                            project.full_description ||
                            "Project details available in the portfolio manager."}
                        </p>

                        {project.highlight && (
                          <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] px-3.5 py-2 text-sm font-medium text-cyan-100 transition duration-300 group-hover:border-cyan-300/30 group-hover:bg-cyan-300/[0.10]">
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
                                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/45 transition duration-300 group-hover:border-white/[0.14] group-hover:text-white/55"
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
                                className="shine-button inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(34,211,238,0.10)] transition hover:-translate-y-0.5 hover:bg-cyan-200"
                              >
                                View Project ↗
                              </a>
                            )}

                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/65 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:text-white"
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  Experience
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                        className="premium-lift reveal-card relative md:pl-10"
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  Education
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                      className="premium-lift reveal-card group rounded-2xl border border-white/10 bg-[#0a1019]/65 p-7 transition duration-300 hover:border-cyan-300/25"
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
                        <p className="mt-2 text-base font-medium text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  Highlights
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                      className="premium-lift reveal-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition duration-300 hover:border-cyan-300/25"
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  {skillsLabel}
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                      className="premium-lift reveal-card rounded-2xl border border-white/10 bg-white/[0.018] p-5 transition duration-300 hover:border-cyan-300/25 hover:bg-white/[0.035]"
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  {certificationsLabel}
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                      className="premium-lift reveal-card group rounded-2xl border border-white/10 bg-[#0a1019]/45 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.025]"
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
                <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                  {aboutLabel}
                </p>

                <h2 className="premium-section-title text-4xl font-bold tracking-[-0.04em] text-white drop-shadow-[0_0_30px_rgba(103,232,249,0.04)] md:text-5xl">
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
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
                        Focus
                      </p>

                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {aboutFocusHeading}
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] text-lg text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                    <p className="premium-section-kicker mb-3 text-sm uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.12)]">
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

                    <form
                      action="https://formspree.io/f/mvkpjgze"
                      method="POST"
                      className="mt-6 space-y-3"
                    >
                      <input
                        type="hidden"
                        name="_subject"
                        value="Portfolio Contact Submission"
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Your name"
                          className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/30"
                        />

                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="Your email"
                          className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/30"
                        />
                      </div>

                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="Your message"
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/30"
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-200"
                      >
                        Send Message
                      </button>
                    </form>
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