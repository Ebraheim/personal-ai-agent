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

type AchievementItem = {
  title?: string;
  description?: string;
  date?: string;
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
  achievements?: AchievementItem[];
  projects?: ProjectItem[];
  skills?: SkillItem[];
  certifications?: CertificationItem[];
  knowledge?: KnowledgeItem[];
  selected?: {
    profile?: boolean;
    experience?: boolean;
    education?: boolean;
    achievements?: boolean;
    projects?: boolean;
    skills?: boolean;
    certifications?: boolean;
    knowledge?: boolean;
  };
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value: unknown) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
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

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function isAchievementCategory(value: unknown) {
  const category = normalize(value);

  return [
    "achievement",
    "achievements",
    "award",
    "awards",
    "recognition",
    "recognitions",
  ].includes(category);
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

    const userId = user.id;

    const body = (await request.json()) as ImportBody;
    const selected = body.selected ?? {};

    const imported = {
      profile: 0,
      experience: 0,
      education: 0,
      achievements: 0,
      projects: 0,
      skills: 0,
      certifications: 0,
      knowledge: 0,
    };

    const skippedDuplicates = {
      experience: 0,
      education: 0,
      achievements: 0,
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

        // Never let an empty AI value erase existing profile data.
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
          .eq("id", userId);

        if (error) {
          throw new Error(`Profile import failed: ${error.message}`);
        }

        imported.profile = 1;
      }
    }

    // Load existing rows once so pressing Confirm Import twice is safe.
    const [
      existingExperienceResult,
      existingEducationResult,
      existingAchievementsResult,
      existingProjectsResult,
      existingSkillsResult,
      existingCertificationsResult,
      existingKnowledgeResult,
    ] = await Promise.all([
      supabase
        .from("experience")
        .select(
          "company, role, start_date, end_date, display_order"
        )
        .eq("user_id", userId),

      supabase
        .from("education")
        .select(
          "institution, degree, field, start_date, end_date, display_order"
        )
        .eq("user_id", userId),

      supabase
        .from("achievements")
        .select("title, description, date, display_order")
        .eq("user_id", userId),

      supabase
        .from("projects")
        .select("title, display_order")
        .eq("user_id", userId),

      supabase
        .from("skills")
        .select("title, display_order")
        .eq("user_id", userId),

      supabase
        .from("certifications")
        .select("title, issuer, display_order")
        .eq("user_id", userId),

      supabase
        .from("agent_knowledge")
        .select("title, category, content")
        .eq("user_id", userId),
    ]);

    const existingResults = [
      ["experience", existingExperienceResult.error],
      ["education", existingEducationResult.error],
      ["achievements", existingAchievementsResult.error],
      ["projects", existingProjectsResult.error],
      ["skills", existingSkillsResult.error],
      ["certifications", existingCertificationsResult.error],
      ["AI knowledge", existingKnowledgeResult.error],
    ] as const;

    for (const [label, error] of existingResults) {
      if (error) {
        throw new Error(
          `Could not check existing ${label}: ${error.message}`
        );
      }
    }

    const existingExperienceKeys = new Set(
      (existingExperienceResult.data ?? []).map(
        (item) =>
          `${normalize(item.company)}|${normalize(
            item.role
          )}|${normalize(item.start_date)}|${normalize(
            item.end_date
          )}`
      )
    );

    const existingEducationKeys = new Set(
      (existingEducationResult.data ?? []).map(
        (item) =>
          `${normalize(item.institution)}|${normalize(
            item.degree
          )}|${normalize(item.field)}|${normalize(
            item.start_date
          )}|${normalize(item.end_date)}`
      )
    );

    const existingAchievementKeys = new Set(
      (existingAchievementsResult.data ?? []).map(
        (item) =>
          `${normalize(item.title)}|${normalize(
            item.description
          )}|${normalize(item.date)}`
      )
    );

    const existingProjectTitles = new Set(
      (existingProjectsResult.data ?? []).map((item) =>
        normalize(item.title)
      )
    );

    const existingSkillTitles = new Set(
      (existingSkillsResult.data ?? []).map((item) =>
        normalize(item.title)
      )
    );

    const existingCertificationKeys = new Set(
      (existingCertificationsResult.data ?? []).map(
        (item) =>
          `${normalize(item.title)}|${normalize(item.issuer)}`
      )
    );

    const existingKnowledgeKeys = new Set(
      (existingKnowledgeResult.data ?? []).map(
        (item) =>
          `${normalize(item.title)}|${normalize(
            item.category
          )}|${normalize(item.content)}`
      )
    );

    const nextExperienceOrder =
      Math.max(
        -1,
        ...(existingExperienceResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const nextEducationOrder =
      Math.max(
        -1,
        ...(existingEducationResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const nextAchievementOrder =
      Math.max(
        -1,
        ...(existingAchievementsResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const nextProjectOrder =
      Math.max(
        -1,
        ...(existingProjectsResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const nextSkillOrder =
      Math.max(
        -1,
        ...(existingSkillsResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const nextCertificationOrder =
      Math.max(
        -1,
        ...(existingCertificationsResult.data ?? []).map(
          (item) => item.display_order ?? -1
        )
      ) + 1;

    const knowledgeRows: Array<{
      user_id: string;
      title: string;
      content: string;
      category: string;
      is_active: boolean;
      priority: number;
    }> = [];

    function addKnowledgeRow(row: {
      title: string;
      content: string;
      category: string;
      priority: number;
    }) {
      const key = `${normalize(row.title)}|${normalize(
        row.category
      )}|${normalize(row.content)}`;

      if (existingKnowledgeKeys.has(key)) {
        skippedDuplicates.knowledge += 1;
        return false;
      }

      existingKnowledgeKeys.add(key);

      knowledgeRows.push({
        user_id: userId,
        title: row.title,
        content: row.content,
        category: row.category,
        is_active: true,
        priority: row.priority,
      });

      return true;
    }

    if (selected.experience && Array.isArray(body.experience)) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.experience) {
        const company = clean(item.company);
        const role = clean(item.role);
        const startDate = clean(item.start_date);
        const endDate = clean(item.end_date);
        const location = clean(item.location);
        const description = clean(item.description);

        if (!company && !role) {
          continue;
        }

        const key = `${normalize(company)}|${normalize(
          role
        )}|${normalize(startDate)}|${normalize(endDate)}`;

        if (existingExperienceKeys.has(key)) {
          skippedDuplicates.experience += 1;
        } else {
          existingExperienceKeys.add(key);

          rows.push({
            user_id: userId,
            company,
            role: role || "Experience",
            start_date: startDate,
            end_date: endDate,
            location,
            description,
            display_order: nextExperienceOrder + rows.length,
            is_visible: true,
          });
        }

        const dateRange = [startDate, endDate]
          .filter(Boolean)
          .join(" – ");

        const content = [
          role && company
            ? `${role} at ${company}`
            : role || company,
          dateRange,
          location,
          description,
        ]
          .filter(Boolean)
          .join(". ");

        addKnowledgeRow({
          title:
            role && company
              ? `${role} — ${company}`
              : role || company || "Experience",
          content,
          category: "experience",
          priority: 5,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("experience")
          .insert(rows);

        if (error) {
          throw new Error(
            `Experience import failed: ${error.message}`
          );
        }

        imported.experience = rows.length;
      }
    }

    if (selected.education && Array.isArray(body.education)) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.education) {
        const institution = clean(item.institution);
        const degree = clean(item.degree);
        const field = clean(item.field);
        const startDate = clean(item.start_date);
        const endDate = clean(item.end_date);
        const description = clean(item.description);

        if (!institution && !degree && !field) {
          continue;
        }

        const key = `${normalize(institution)}|${normalize(
          degree
        )}|${normalize(field)}|${normalize(
          startDate
        )}|${normalize(endDate)}`;

        if (existingEducationKeys.has(key)) {
          skippedDuplicates.education += 1;
        } else {
          existingEducationKeys.add(key);

          rows.push({
            user_id: userId,
            institution: institution || "Institution",
            degree,
            field,
            start_date: startDate,
            end_date: endDate,
            description,
            display_order: nextEducationOrder + rows.length,
            is_visible: true,
          });
        }

        const dateRange = [startDate, endDate]
          .filter(Boolean)
          .join(" – ");

        const qualification = [degree, field]
          .filter(Boolean)
          .join(" — ");

        const content = [
          qualification,
          institution,
          dateRange,
          description,
        ]
          .filter(Boolean)
          .join(". ");

        addKnowledgeRow({
          title:
            qualification || institution || "Education",
          content,
          category: "education",
          priority: 5,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("education")
          .insert(rows);

        if (error) {
          throw new Error(
            `Education import failed: ${error.message}`
          );
        }

        imported.education = rows.length;
      }
    }

    if (
      selected.achievements &&
      Array.isArray(body.achievements)
    ) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.achievements) {
        const title = clean(item.title);
        const description = clean(item.description);
        const date = clean(item.date);

        if (!title) {
          continue;
        }

        const key = `${normalize(title)}|${normalize(
          description
        )}|${normalize(date)}`;

        if (existingAchievementKeys.has(key)) {
          skippedDuplicates.achievements += 1;
        } else {
          existingAchievementKeys.add(key);

          rows.push({
            user_id: userId,
            title,
            description,
            date,
            display_order: nextAchievementOrder + rows.length,
            is_visible: true,
          });
        }

        addKnowledgeRow({
          title,
          content: [description, date].filter(Boolean).join(". "),
          category: "achievements",
          priority: 5,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("achievements")
          .insert(rows);

        if (error) {
          throw new Error(
            `Achievements import failed: ${error.message}`
          );
        }

        imported.achievements = rows.length;
      }
    }

    if (selected.projects && Array.isArray(body.projects)) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.projects) {
        const title = clean(item.title);

        if (!title) continue;

        const key = normalize(title);

        if (existingProjectTitles.has(key)) {
          skippedDuplicates.projects += 1;
          continue;
        }

        existingProjectTitles.add(key);

        rows.push({
          user_id: userId,
          title,
          short_description: clean(item.short_description),
          full_description: clean(item.full_description),
          technologies: clean(item.technologies),
          project_url: "",
          github_url: "",
          status: safeStatus(item.status),
          display_order: nextProjectOrder + rows.length,
          is_visible: true,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("projects")
          .insert(rows);

        if (error) {
          throw new Error(
            `Projects import failed: ${error.message}`
          );
        }

        imported.projects = rows.length;
      }
    }

    if (selected.skills && Array.isArray(body.skills)) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.skills) {
        const title = clean(item.title);
        const description = clean(item.description);

        if (!title || !description) continue;

        const key = normalize(title);

        if (existingSkillTitles.has(key)) {
          skippedDuplicates.skills += 1;
          continue;
        }

        existingSkillTitles.add(key);

        rows.push({
          user_id: userId,
          title,
          description,
          display_order: nextSkillOrder + rows.length,
          is_visible: true,
        });
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("skills")
          .insert(rows);

        if (error) {
          throw new Error(
            `Skills import failed: ${error.message}`
          );
        }

        imported.skills = rows.length;
      }
    }

    if (
      selected.certifications &&
      Array.isArray(body.certifications)
    ) {
      const rows: Array<Record<string, unknown>> = [];

      for (const item of body.certifications) {
        const title = clean(item.title);
        const issuer = clean(item.issuer);

        if (!title) continue;

        const key = `${normalize(title)}|${normalize(issuer)}`;

        if (existingCertificationKeys.has(key)) {
          skippedDuplicates.certifications += 1;
          continue;
        }

        existingCertificationKeys.add(key);

        rows.push({
          user_id: userId,
          title,
          issuer,
          credential_url: clean(item.credential_url),
          status: safeStatus(item.status),
          issue_date: safeDate(item.issue_date),
          expiry_date: safeDate(item.expiry_date),
          display_order: nextCertificationOrder + rows.length,
          is_visible: true,
        });
      }

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

    if (selected.knowledge && Array.isArray(body.knowledge)) {
      const achievementRows: Array<Record<string, unknown>> = [];

      for (const item of body.knowledge) {
        const title = clean(item.title);
        const content = clean(item.content);
        const category = clean(item.category) || "general";

        if (!title || !content) {
          continue;
        }

        addKnowledgeRow({
          title,
          content,
          category,
          priority:
            typeof item.priority === "number"
              ? item.priority
              : 0,
        });

        // Older extraction results may place awards/achievements inside
        // Additional AI Knowledge instead of a dedicated achievements array.
        // Mirror those items into the public Achievements table too.
        if (isAchievementCategory(category)) {
          const key = `${normalize(title)}|${normalize(
            content
          )}|`;

          if (existingAchievementKeys.has(key)) {
            skippedDuplicates.achievements += 1;
          } else {
            existingAchievementKeys.add(key);

            achievementRows.push({
              user_id: userId,
              title,
              description: content,
              date: "",
              display_order:
                nextAchievementOrder + achievementRows.length,
              is_visible: true,
            });
          }
        }
      }

      if (achievementRows.length > 0) {
        const { error } = await supabase
          .from("achievements")
          .insert(achievementRows);

        if (error) {
          throw new Error(
            `Achievements import failed: ${error.message}`
          );
        }

        imported.achievements += achievementRows.length;
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

    const { error: onboardingError } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (onboardingError) {
      throw new Error(
        `Could not complete onboarding: ${onboardingError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      imported,
      skippedDuplicates,
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