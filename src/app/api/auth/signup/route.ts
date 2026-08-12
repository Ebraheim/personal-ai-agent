import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      return Response.json(
        { error: "Signup service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const fullName = clean(body.fullName);
    const email = clean(body.email).toLowerCase();
    const password = clean(body.password);

    if (!fullName) {
      return Response.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { data: createdUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (createUserError || !createdUser.user) {
      return Response.json(
        {
          error:
            createUserError?.message ||
            "Could not create your account.",
        },
        { status: 400 }
      );
    }

    createdUserId = createdUser.user.id;

    const baseSlug = makeSlug(fullName) || "profile";
    let slug = baseSlug;

    for (let attempt = 0; attempt < 10; attempt++) {
      const { data: existingSlug, error: slugCheckError } =
        await admin
          .from("profiles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (slugCheckError) {
        throw new Error(
          `Could not check website address: ${slugCheckError.message}`
        );
      }

      if (!existingSlug) {
        break;
      }

      slug = `${baseSlug}-${randomSuffix()}`;
    }

    const { error: profileError } = await admin
      .from("profiles")
      .insert({
        id: createdUserId,
        full_name: fullName,
        email,
        slug,
        professional_title: "",
        hero_tagline: "",
        bio: "",
        location: "",
        linkedin_url: "",
        github_url: "",
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      await admin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: `Could not create your website profile: ${profileError.message}`,
        },
        { status: 500 }
      );
    }

    const defaultSections = [
      {
        user_id: createdUserId,
        section_key: "projects",
        label: "Projects",
        display_order: 1,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "experience",
        label: "Experience",
        display_order: 2,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "skills",
        label: "Skills",
        display_order: 3,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "education",
        label: "Education",
        display_order: 4,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "achievements",
        label: "Achievements",
        display_order: 5,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "certifications",
        label: "Certifications",
        display_order: 6,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "about",
        label: "About",
        display_order: 7,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "agent",
        label: "AI Agent",
        display_order: 8,
        is_visible: true,
      },
      {
        user_id: createdUserId,
        section_key: "contact",
        label: "Contact",
        display_order: 9,
        is_visible: true,
      },
    ];

    const { error: sectionsError } = await admin
      .from("sections")
      .insert(defaultSections);

    if (sectionsError) {
      await admin
        .from("profiles")
        .delete()
        .eq("id", createdUserId);

      await admin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: `Could not create default website sections: ${sectionsError.message}`,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      slug,
    });
  } catch (error: unknown) {
    console.error("SIGNUP ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown signup error";

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}