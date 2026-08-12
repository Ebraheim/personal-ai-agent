import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

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
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data: files, error: listError } = await supabase.storage
      .from("cvs")
      .list(user.id, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (listError) {
      return NextResponse.json(
        { error: listError.message },
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
        { error: "No uploaded CV was found." },
        { status: 404 }
      );
    }

    const filePath = `${user.id}/${latestFile.name}`;

    const { data: cvBlob, error: downloadError } =
      await supabase.storage
        .from("cvs")
        .download(filePath);

    if (downloadError || !cvBlob) {
      return NextResponse.json(
        {
          error:
            downloadError?.message ||
            "Could not download the uploaded CV.",
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await cvBlob.arrayBuffer();

    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "The CV is too large to process." },
        { status: 413 }
      );
    }

    const pdfBase64 =
      Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Extract structured information from this CV/resume.

IMPORTANT RULES:

- Use ONLY information explicitly present in the CV.
- Do not guess, embellish, or invent missing facts.
- If a value is missing, use an empty string or empty array.
- Keep wording concise but faithful to the CV.
- Do not treat a skill as work experience.
- Do not turn unfinished/planned work into completed achievements.
- Put awards, recognitions, competition placements, publications, and clearly stated accomplishments into "achievements".
- Do not duplicate a certification as an achievement unless the CV explicitly presents it as an award or recognition.
- Return valid JSON only.
- Do not include markdown or code fences.

Return exactly this JSON shape:

{
  "profile": {
    "full_name": "",
    "professional_title": "",
    "hero_tagline": "",
    "bio": "",
    "location": "",
    "email": "",
    "linkedin_url": "",
    "github_url": ""
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "start_date": "",
      "end_date": "",
      "location": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "start_date": "",
      "end_date": "",
      "description": ""
    }
  ],
  "achievements": [
    {
      "title": "",
      "description": "",
      "date": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "short_description": "",
      "full_description": "",
      "technologies": "",
      "status": ""
    }
  ],
  "skills": [
    {
      "title": "",
      "description": ""
    }
  ],
  "certifications": [
    {
      "title": "",
      "issuer": "",
      "status": "",
      "issue_date": "",
      "expiry_date": "",
      "credential_url": ""
    }
  ],
  "knowledge": [
    {
      "title": "",
      "category": "",
      "content": "",
      "priority": 0
    }
  ]
}

For "knowledge", create a small set of useful factual entries that would help
a website AI assistant answer questions about the CV owner. Use only facts
already present in the CV.
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
      ],
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 500 }
      );
    }

    let extracted: unknown;

    try {
      extracted = JSON.parse(stripJsonFences(rawText));
    } catch {
      console.error("CV extraction raw response:", rawText);

      return NextResponse.json(
        {
          error:
            "The AI read the CV but did not return valid structured data. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fileName: latestFile.name,
      extracted,
    });
  } catch (error: unknown) {
    console.error("CV EXTRACTION ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown CV extraction error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}