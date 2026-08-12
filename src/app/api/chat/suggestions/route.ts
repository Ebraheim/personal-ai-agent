import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();

    if (!slug) {
      return Response.json(
        {
          suggestions: [],
          error: "Portfolio slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("slug", slug)
      .maybeSingle();

    if (profileError) {
      console.error("Suggestion profile fetch error:", profileError);

      return Response.json(
        {
          suggestions: [],
          error: profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return Response.json(
        {
          suggestions: [],
          error: "No public profile was found.",
        },
        {
          status: 404,
        }
      );
    }

    const { data: savedQuestions, error: questionsError } = await supabase
      .from("suggested_questions")
      .select("question, display_order")
      .eq("user_id", profile.id)
      .order("display_order", { ascending: true })
      .limit(4);

    if (questionsError) {
      console.error("Suggested questions fetch error:", questionsError);

      return Response.json(
        {
          suggestions: [],
          error: questionsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const suggestions = (savedQuestions ?? [])
      .map((item) => item.question?.trim())
      .filter((question): question is string => Boolean(question))
      .slice(0, 4);

    if (suggestions.length > 0) {
      return Response.json({
        suggestions,
        source: "saved",
      });
    }

    const ownerName =
      profile.full_name?.trim().split(" ")[0] || "the website owner";

    return Response.json({
      suggestions: [
        `What does ${ownerName} specialize in?`,
        `What projects has ${ownerName} worked on?`,
        `What are ${ownerName}'s main skills?`,
        `How can I contact ${ownerName}?`,
      ],
      source: "fallback",
    });
  } catch (error: unknown) {
    console.error("SUGGESTIONS API ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown suggestions error";

    return Response.json(
      {
        suggestions: [],
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}