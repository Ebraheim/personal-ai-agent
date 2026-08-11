import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProfileData = {
  full_name?: string;
  professional_title?: string;
  hero_tagline?: string;
  bio?: string;
  location?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
};

type ExperienceItem = {
  company?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
};

type EducationItem = {
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
};

type ProjectItem = {
  title?: string;
  short_description?: string;
  full_description?: string;
  technologies?: string;
  status?: string;
};

type SkillItem = {
  title?: string;
  description?: string;
};

type CertificationItem = {
  title?: string;
  issuer?: string;
  status?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
};

type KnowledgeItem = {
  title?: string;
  category?: string;
  content?: string;
  priority?: number;
};

type ImportBody = {
  profile?: ProfileData;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  skills?: SkillItem[];
  certifications?: CertificationItem[];
  knowledge?: KnowledgeItem[];
  selected?: {
    profile?: boolean;
    experience?: boolean;
    education?: boolean;
    projects?: boolean;
    skills?: boolean;
    certifications?: boolean;
    knowledge?: boolean;
  };
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeStatus(value: unknown) {
  const status = clean(value).toLowerCase();

  if (
    status === "completed" ||
    status === "in-progress" ||
    status === "planned"
  ) {
    return status;
  }

  return "completed";
}

function safeDate(value: unknown) {
  const date = clean(value);

  if (!date) {
    return null;
  }

  // Existing certification table uses date values.
  // Only send values that already look like YYYY-MM-DD.
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ImportBody;
    const selected = body.selected ?? {};

    const imported = {
      profile: 0,
      experience: 0,
      education: 0,
      projects: 0,
      skills: 0,
      certifications: 0,
      knowledge: 0,
    };

    if (selected.profile && body.profile) {
      const profileData: Record<string, string> = {};

      const allowedFields: (keyof ProfileData)[] = [
        "full_name",
        "professional_title",
        "hero_tagline",
        "bio",
        "location",
        "email",
        "linkedin_url",
        "github_url",
      ];

      for (const field of allowedFields) {
        const value = clean(body.profile[field]);

        // Empty extracted values should never erase existing profile data.
        if (value) {
          profileData[field] = value;
        }
      }

      if (Object.keys(profileData).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          throw new Error(`Profile import failed: ${error.message}`);
        }

        imported.profile = 1;
      }
    }

    if (selected.projects && Array.isArray(body.projects)) {
      const rows = body.projects
        .filter((item) => clean(item.title))
        .map((item, index) => ({
          user_id: user.id,
          title: clean(item.title),
          short_description: clean(item.short_description),
          full_description: clean(item.full_description),
          technologies: clean(item.technologies),
          project_url: "",
          github_url: "",
          status: safeStatus(item.status),
          display_order: index,
          is_visible: true,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("projects")
          .insert(rows);

        if (error) {
          throw new Error(`Projects import failed: ${error.message}`);
        }

        imported.projects = rows.length;
      }
    }

    if (selected.skills && Array.isArray(body.skills)) {
      const rows = body.skills
        .filter(
          (item) =>
            clean(item.title) && clean(item.description)
        )
        .map((item, index) => ({
          user_id: user.id,
          title: clean(item.title),
          description: clean(item.description),
          display_order: index,
          is_visible: true,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("skills")
          .insert(rows);

        if (error) {
          throw new Error(`Skills import failed: ${error.message}`);
        }

        imported.skills = rows.length;
      }
    }

    if (
      selected.certifications &&
      Array.isArray(body.certifications)
    ) {
      const rows = body.certifications
        .filter((item) => clean(item.title))
        .map((item, index) => ({
          user_id: user.id,
          title: clean(item.title),
          issuer: clean(item.issuer),
          credential_url: clean(item.credential_url),
          status: safeStatus(item.status),
          issue_date: safeDate(item.issue_date),
          expiry_date: safeDate(item.expiry_date),
          display_order: index,
          is_visible: true,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("certifications")
          .insert(rows);

        if (error) {
          throw new Error(
            `Certifications import failed: ${error.message}`
          );
        }

        imported.certifications = rows.length;
      }
    }

    const knowledgeRows: Array<{
      user_id: string;
      title: string;
      content: string;
      category: string;
      is_active: boolean;
      priority: number;
    }> = [];

    if (selected.knowledge && Array.isArray(body.knowledge)) {
      for (const item of body.knowledge) {
        const title = clean(item.title);
        const content = clean(item.content);

        if (!title || !content) {
          continue;
        }

        knowledgeRows.push({
          user_id: user.id,
          title,
          content,
          category: clean(item.category) || "general",
          is_active: true,
          priority:
            typeof item.priority === "number"
              ? item.priority
              : 0,
        });
      }
    }

    // The current project does not have dedicated experience/education tables.
    // Approved CV experience and education are therefore added to the verified
    // AI knowledge base instead of inventing new database tables.
    if (selected.experience && Array.isArray(body.experience)) {
      for (const item of body.experience) {
        const company = clean(item.company);
        const role = clean(item.role);

        if (!company && !role) {
          continue;
        }

        const dateRange = [
          clean(item.start_date),
          clean(item.end_date),
        ]
          .filter(Boolean)
          .join(" – ");

        const content = [
          role && company
            ? `${role} at ${company}`
            : role || company,
          dateRange,
          clean(item.location),
          clean(item.description),
        ]
          .filter(Boolean)
          .join(". ");

        knowledgeRows.push({
          user_id: user.id,
          title:
            role && company
              ? `${role} — ${company}`
              : role || company || "Experience",
          content,
          category: "experience",
          is_active: true,
          priority: 5,
        });

        imported.experience += 1;
      }
    }

    if (selected.education && Array.isArray(body.education)) {
      for (const item of body.education) {
        const institution = clean(item.institution);
        const degree = clean(item.degree);
        const field = clean(item.field);

        if (!institution && !degree && !field) {
          continue;
        }

        const dateRange = [
          clean(item.start_date),
          clean(item.end_date),
        ]
          .filter(Boolean)
          .join(" – ");

        const qualification = [degree, field]
          .filter(Boolean)
          .join(" — ");

        const content = [
          qualification,
          institution,
          dateRange,
          clean(item.description),
        ]
          .filter(Boolean)
          .join(". ");

        knowledgeRows.push({
          user_id: user.id,
          title:
            qualification || institution || "Education",
          content,
          category: "education",
          is_active: true,
          priority: 5,
        });

        imported.education += 1;
      }
    }

    if (knowledgeRows.length > 0) {
      const { error } = await supabase
        .from("agent_knowledge")
        .insert(knowledgeRows);

      if (error) {
        throw new Error(
          `AI knowledge import failed: ${error.message}`
        );
      }

      imported.knowledge = knowledgeRows.length;
    }

    return NextResponse.json({
      success: true,
      imported,
    });
  } catch (error: unknown) {
    console.error("CV IMPORT ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown CV import error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}