import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

function cleanText(value: string | null | undefined) {
  return value?.trim() || "";
}

async function generateWithRetry(
  contents: string,
  maxRetries = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
      });
    } catch (error: unknown) {
      lastError = error;

      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? (error as { status?: number }).status
          : undefined;

      if (status !== 503 || attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 1500)
      );
    }
  }

  throw lastError;
}

function parseSuggestions(text: string) {
  const lines = text
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*[-*•]\s*/, "")
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .filter((line) => line.endsWith("?"));

  return [...new Set(lines)].slice(0, 4);
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "id, full_name, professional_title, hero_tagline, bio"
        )
        .limit(1)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Suggestion profile fetch error:",
        profileError
      );
    }

    if (!profile) {
      return Response.json({
        suggestions: [],
      });
    }

    const ownerId = profile.id;

    const [
      projectsResult,
      skillsResult,
      certificationsResult,
      careerFocusResult,
      knowledgeResult,
      highlightsResult,
      siteContentResult,
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("title, short_description, full_description, technologies, status")
        .eq("user_id", ownerId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),

      supabase
        .from("skills")
        .select("title, description")
        .eq("user_id", ownerId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),

      supabase
        .from("certifications")
        .select("title, issuer, status")
        .eq("user_id", ownerId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),

      supabase
        .from("career_focus")
        .select("title")
        .eq("user_id", ownerId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),

      supabase
        .from("agent_knowledge")
        .select("title, content, category")
        .eq("user_id", ownerId)
        .eq("is_active", true)
        .order("priority", { ascending: false }),

      supabase
        .from("hero_highlights")
        .select("label")
        .eq("user_id", ownerId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),

      supabase
        .from("site_content")
        .select(
          "about_heading, about_secondary_text, projects_description, contact_heading, contact_description"
        )
        .eq("user_id", ownerId)
        .maybeSingle(),
    ]);

    const context = `
PROFILE
Name: ${cleanText(profile.full_name)}
Title: ${cleanText(profile.professional_title)}
Tagline: ${cleanText(profile.hero_tagline)}
Bio: ${cleanText(profile.bio)}

PROJECTS
${(projectsResult.data ?? [])
  .map(
    (item) =>
      `${cleanText(item.title)} | ${cleanText(
        item.short_description
      )} | ${cleanText(item.full_description)} | ${cleanText(
        item.technologies
      )} | ${cleanText(item.status)}`
  )
  .join("\n")}

SKILLS
${(skillsResult.data ?? [])
  .map(
    (item) =>
      `${cleanText(item.title)}: ${cleanText(item.description)}`
  )
  .join("\n")}

CERTIFICATIONS
${(certificationsResult.data ?? [])
  .map(
    (item) =>
      `${cleanText(item.title)} | ${cleanText(
        item.issuer
      )} | ${cleanText(item.status)}`
  )
  .join("\n")}

FOCUS
${(careerFocusResult.data ?? [])
  .map((item) => cleanText(item.title))
  .join("\n")}

HIGHLIGHTS
${(highlightsResult.data ?? [])
  .map((item) => cleanText(item.label))
  .join("\n")}

ADDITIONAL VERIFIED KNOWLEDGE
${(knowledgeResult.data ?? [])
  .map(
    (item) =>
      `${cleanText(item.title)} | ${cleanText(
        item.category
      )}: ${cleanText(item.content)}`
  )
  .join("\n")}

WEBSITE TEXT
${siteContentResult.data
  ? [
      cleanText(siteContentResult.data.about_heading),
      cleanText(siteContentResult.data.about_secondary_text),
      cleanText(siteContentResult.data.projects_description),
      cleanText(siteContentResult.data.contact_heading),
      cleanText(siteContentResult.data.contact_description),
    ]
      .filter(Boolean)
      .join("\n")
  : ""}
`.trim();

    const prompt = `
Using only the verified website information below, generate exactly 4 useful questions a visitor would naturally want to ask the website's AI assistant.

The website may belong to a person, business, gym, restaurant, consultant, service provider, or another type of owner. Infer the appropriate visitor intent only from the supplied information.

Rules:
- Generate exactly 4 questions.
- Each question must be directly answerable from the verified information.
- Keep each question short and natural.
- Make the four questions meaningfully different.
- Do not invent services, facts, products, prices, achievements, or experience.
- Do not assume the website owner is a job seeker or engineer unless the information supports that.
- Use the owner's actual name only when it sounds natural.
- Output only the four questions.
- One question per line.
- No numbering, bullets, headings, explanations, Markdown, or extra text.

VERIFIED WEBSITE INFORMATION:

${context}
`;

    const response = await generateWithRetry(prompt);

    const suggestions = parseSuggestions(
      response.text ?? ""
    );

    return Response.json({
      suggestions,
    });
  } catch (error) {
    console.error(
      "AI SUGGESTIONS API ERROR:",
      error
    );

    return Response.json({
      suggestions: [],
    });
  }
}