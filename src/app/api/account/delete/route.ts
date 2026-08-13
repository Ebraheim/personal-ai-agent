import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      return Response.json(
        { error: "Account deletion service is not configured." },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const userId = user.id;

    // Remove uploaded CV files first.
    const { data: cvFiles, error: listError } = await admin.storage
      .from("cvs")
      .list(userId, {
        limit: 1000,
      });

    if (listError) {
      console.error("CV list error:", listError);
    } else if (cvFiles && cvFiles.length > 0) {
      const filePaths = cvFiles
        .filter((file) => file.name)
        .map((file) => `${userId}/${file.name}`);

      if (filePaths.length > 0) {
        const { error: removeError } = await admin.storage
          .from("cvs")
          .remove(filePaths);

        if (removeError) {
          console.error("CV remove error:", removeError);
        }
      }
    }

    // Delete rows from user-owned tables.
    const userOwnedTables = [
      "suggested_questions",
      "profile_analytics_events",
      "agent_knowledge",
      "hero_highlights",
      "career_focus",
      "achievements",
      "education",
      "experience",
      "certifications",
      "skills",
      "projects",
      "sections",
      "site_content",
    ];

    for (const table of userOwnedTables) {
      const { error } = await admin
        .from(table)
        .delete()
        .eq("user_id", userId);

      // Analytics uses profile_user_id instead of user_id.
      if (
        error &&
        table === "profile_analytics_events"
      ) {
        const { error: analyticsError } = await admin
          .from("profile_analytics_events")
          .delete()
          .eq("profile_user_id", userId);

        if (analyticsError) {
          console.error(
            `Could not clean ${table}:`,
            analyticsError
          );
        }

        continue;
      }

      if (error) {
        console.error(`Could not clean ${table}:`, error);
      }
    }

    // Delete the profile last because other rows may reference it.
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Profile delete error:", profileError);

      return Response.json(
        {
          error:
            "Could not fully delete the account data. Please try again.",
        },
        { status: 500 }
      );
    }

    // Finally remove the Supabase Auth user.
    const { error: authDeleteError } =
      await admin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error(
        "Auth user delete error:",
        authDeleteError
      );

      return Response.json(
        {
          error:
            "Website data was removed, but the login account could not be deleted.",
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);

    return Response.json(
      { error: "Could not delete the account." },
      { status: 500 }
    );
  }
}