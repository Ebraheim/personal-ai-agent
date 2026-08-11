import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Supabase server configuration is missing." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
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
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: "Could not find the public profile." },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No public profile found." },
      { status: 404 }
    );
  }

  const { data: files, error: listError } =
    await supabaseAdmin.storage
      .from("cvs")
      .list(profile.id, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

  if (listError) {
    return NextResponse.json(
      { error: "Could not read uploaded CV files." },
      { status: 500 }
    );
  }

  const pdfFiles = (files ?? [])
    .filter(
      (file) =>
        file.name.toLowerCase().endsWith(".pdf")
    )
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

  const { data, error } =
    await supabaseAdmin.storage
      .from("cvs")
      .createSignedUrl(filePath, 300, {
        download: "Resume.pdf",
      });

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Could not create CV download link." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      url: data.signedUrl,
      fileName: latestFile.name,
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}