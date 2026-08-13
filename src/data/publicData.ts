import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function getPublicProfileBySlug(slug: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, slug, full_name, professional_title, hero_tagline, bio, location, email, linkedin_url, github_url"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error:", error);
    return null;
  }

  return data;
}

export async function getPublicProjects(userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, short_description, full_description, technologies, project_url, github_url, cover_image_url, highlight, status, display_order, is_visible"
    )
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Projects fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicCertifications(userId: string) {
  const { data, error } = await supabase
    .from("certifications")
    .select(
      "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
    )
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Certifications fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicSkills(userId: string) {
  const { data, error } = await supabase
    .from("skills")
    .select("id, title, description, display_order, is_visible")
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Skills fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicCareerFocus(userId: string) {
  const { data, error } = await supabase
    .from("career_focus")
    .select("id, title, display_order, is_visible")
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Career focus fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicHeroHighlights(userId: string) {
  const { data, error } = await supabase
    .from("hero_highlights")
    .select("id, label, display_order, is_visible")
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Hero highlights fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicExperience(userId: string) {
  const { data, error } = await supabase
    .from("experience")
    .select(
      "id, company, role, start_date, end_date, location, description, display_order, is_visible"
    )
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Experience fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicEducation(userId: string) {
  const { data, error } = await supabase
    .from("education")
    .select(
      "id, institution, degree, field, start_date, end_date, description, display_order, is_visible"
    )
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Education fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicAchievements(userId: string) {
  const { data, error } = await supabase
    .from("achievements")
    .select(
      "id, title, description, date, display_order, is_visible"
    )
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Achievements fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicSiteContent(userId: string) {
  const { data, error } = await supabase
    .from("site_content")
    .select(
      `
      id,
      user_id,
      about_label,
      about_heading,
      about_primary_text,
      about_secondary_text,
      about_focus_heading,
      projects_label,
      projects_heading,
      projects_description,
      skills_label,
      skills_heading,
      skills_description,
      certifications_label,
      certifications_heading,
      certifications_description,
      contact_label,
      contact_heading,
      contact_description
      `
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Site content fetch error:", error);
    return null;
  }

  return data;
}

export async function getPublicSections(userId: string) {
  const { data, error } = await supabase
    .from("sections")
    .select("id, section_key, label, display_order, is_visible")
    .eq("user_id", userId)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Sections fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicKnowledge(userId: string) {
  const { data, error } = await supabase
    .from("agent_knowledge")
    .select("id, title, content, category, priority, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Knowledge fetch error:", error);
    return [];
  }

  return data ?? [];
}