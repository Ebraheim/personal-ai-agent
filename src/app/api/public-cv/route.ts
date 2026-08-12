import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Supabase server configuration is missing." },
      { status: 500 }
    );
  }

  const slug = request.nextUrl.searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json(
      { error: "Portfolio slug is required." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (profileError) {
    console.error("Public CV profile lookup error:", profileError);

    return NextResponse.json(
      { error: "Could not find the public profile." },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No public profile found for this portfolio." },
      { status: 404 }
    );
  }

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from("cvs")
    .list(profile.id, {
      limit: 100,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  if (listError) {
    console.error("Public CV file list error:", listError);

    return NextResponse.json(
      { error: "Could not read uploaded CV files." },
      { status: 500 }
    );
  }

  const pdfFiles = (files ?? [])
    .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => {
      const aTime = new Date(
        a.updated_at || a.created_at || 0
      ).getTime();

      const bTime = new Date(
        b.updated_at || b.created_at || 0
      ).getTime();

      return bTime - aTime;
    });

  const latestFile = pdfFiles[0];

  if (!latestFile) {
    return NextResponse.json(
      { error: "No uploaded CV is available." },
      { status: 404 }
    );
  }

  const filePath = `${profile.id}/${latestFile.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from("cvs")
    .createSignedUrl(filePath, 300, {
      download: "Resume.pdf",
    });

  if (error || !data?.signedUrl) {
    console.error("Public CV signed URL error:", error);

    return NextResponse.json(
      { error: "Could not create CV download link." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      url: data.signedUrl,
      fileName: latestFile.name,
      slug: profile.slug,
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}