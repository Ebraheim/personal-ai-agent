import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function getPublicProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, professional_title, hero_tagline, bio, location, email, linkedin_url, github_url"
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error:", error);
    return null;
  }

  return data;
}

export async function getPublicProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, short_description, full_description, technologies, project_url, github_url, status, display_order, is_visible"
    )
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Projects fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicCertifications() {
  const { data, error } = await supabase
    .from("certifications")
    .select(
      "id, title, issuer, credential_url, status, issue_date, expiry_date, display_order, is_visible"
    )
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Certifications fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicSkills() {
  const { data, error } = await supabase
    .from("skills")
    .select("id, title, description, display_order, is_visible")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Skills fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicCareerFocus() {
  const { data, error } = await supabase
    .from("career_focus")
    .select("id, title, display_order, is_visible")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Career focus fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicHeroHighlights() {
  const { data, error } = await supabase
    .from("hero_highlights")
    .select("id, label, display_order, is_visible")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Hero highlights fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicSiteContent() {
  const { data, error } = await supabase
    .from("site_content")
    .select(
      `
      id,
      user_id,
      about_label,
      about_heading,
      about_secondary_text,
      projects_label,
      projects_description,
      contact_label,
      contact_heading,
      contact_description
      `
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Site content fetch error:", error);
    return null;
  }

  return data;
}

export async function getPublicSections() {
  const { data, error } = await supabase
    .from("sections")
    .select("id, section_key, label, display_order, is_visible")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Sections fetch error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPublicKnowledge() {
  const { data, error } = await supabase
    .from("agent_knowledge")
    .select("id, title, content, category, priority, is_active")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Knowledge fetch error:", error);
    return [];
  }

  return data ?? [];
}