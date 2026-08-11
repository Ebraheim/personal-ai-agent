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

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: profile, error: profileError } = await supabaseAdmin
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

  const filePath = `${profile.id}/resume.pdf`;

  const { data, error } = await supabaseAdmin.storage
    .from("cvs")
    .createSignedUrl(filePath, 300, {
      download: "Resume.pdf",
    });

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "No uploaded CV is available." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { url: data.signedUrl },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}