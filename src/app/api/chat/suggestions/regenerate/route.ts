import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

function clean(value: string | null | undefined) {
  return value?.trim() || "";
}

function stripJsonFences(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const userId = user.id;

    const [
      profileResult,
      projectsResult,
      skillsResult,
      experienceResult,
      educationResult,
      achievementsResult,
      highlightsResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "full_name, professional_title, hero_tagline, bio"
        )
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("projects")
        .select("title, short_description")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(8),

      supabase
        .from("skills")
        .select("title, description")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(12),

      supabase
        .from("experience")
        .select("company, role")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(8),

      supabase
        .from("education")
        .select("institution, degree, field")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(8),

      supabase
        .from("achievements")
        .select("title")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(8),

      supabase
        .from("hero_highlights")
        .select("label")
        .eq("user_id", userId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .limit(8),
    ]);

    if (profileResult.error) {
      return Response.json(
        { error: profileResult.error.message },
        { status: 500 }
      );
    }

    const profile = profileResult.data;

    if (!profile) {
      return Response.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    const context = {
      profile: {
        name: clean(profile.full_name),
        title: clean(profile.professional_title),
        tagline: clean(profile.hero_tagline),
        bio: clean(profile.bio),
      },
      projects: projectsResult.data ?? [],
      skills: skillsResult.data ?? [],
      experience: experienceResult.data ?? [],
      education: educationResult.data ?? [],
      achievements: achievementsResult.data ?? [],
      highlights: highlightsResult.data ?? [],
    };

    const prompt = `
Create exactly 4 short suggested questions that a visitor could ask the website AI assistant.

Use only the verified owner information below.

VERIFIED INFORMATION:
${JSON.stringify(context, null, 2)}

RULES:
- Return JSON only.
- Return exactly this shape:
  {"questions":["","","",""]}
- Exactly 4 questions.
- Questions should be useful to a recruiter, customer, client, or visitor based on the type of website owner.
- Prefer specific questions grounded in available data.
- Do not invent facts.
- Do not ask about a category when there is no information for it.
- Avoid duplicate or nearly identical questions.
- Keep each question concise and natural.
- Do not include markdown.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      return Response.json(
        { error: "Gemini returned an empty response." },
        { status: 500 }
      );
    }

    let parsed: { questions?: unknown };

    try {
      parsed = JSON.parse(stripJsonFences(rawText));
    } catch {
      console.error(
        "Suggestion regeneration raw response:",
        rawText
      );

      return Response.json(
        {
          error:
            "Gemini did not return valid suggested questions.",
        },
        { status: 500 }
      );
    }

    const questions = Array.isArray(parsed.questions)
      ? parsed.questions
          .filter(
            (item): item is string =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .map((item) => item.trim())
          .slice(0, 4)
      : [];

    if (questions.length !== 4) {
      return Response.json(
        {
          error:
            "Gemini did not return exactly four suggested questions.",
        },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("suggested_questions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return Response.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabase
      .from("suggested_questions")
      .insert(
        questions.map((question, index) => ({
          user_id: userId,
          question,
          display_order: index,
          updated_at: new Date().toISOString(),
        }))
      );

    if (insertError) {
      return Response.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      suggestions: questions,
    });
  } catch (error: unknown) {
    console.error(
      "SUGGESTION REGENERATION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown suggestion regeneration error";

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}