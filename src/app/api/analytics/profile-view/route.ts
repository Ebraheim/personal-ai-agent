import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug =
      typeof body?.slug === "string" ? body.slug.trim() : "";

    if (!slug) {
      return NextResponse.json(
        { error: "Missing profile slug." },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error(
        "Analytics configuration is missing Supabase environment variables."
      );

      return NextResponse.json(
        { error: "Analytics is not configured." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Could not resolve analytics profile:",
        profileError
      );

      return NextResponse.json(
        { error: "Could not record profile view." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      );
    }

    const forwardedFor =
      request.headers.get("x-forwarded-for") || "";
    const ip =
      forwardedFor.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent =
      request.headers.get("user-agent") || "unknown";

    const visitorKey = createHash("sha256")
      .update(`${ip}|${userAgent}`)
      .digest("hex");

    const referer =
      request.headers.get("referer") || null;

    const { error: insertError } = await supabase
      .from("profile_analytics_events")
      .insert({
        profile_user_id: profile.id,
        event_type: "profile_view",
        visitor_key: visitorKey,
        metadata: {
          referer,
        },
      });

    if (insertError) {
      console.error(
        "Could not insert analytics event:",
        insertError
      );

      return NextResponse.json(
        { error: "Could not record profile view." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Unexpected profile analytics error:",
      error
    );

    return NextResponse.json(
      { error: "Could not record profile view." },
      { status: 500 }
    );
  }
}