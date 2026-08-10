import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantKnowledge } from "@/data/retrieve";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

async function generateWithRetry(
  aiClient: GoogleGenAI,
  contents: string,
  maxRetries = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
      });
    } catch (error: any) {
      lastError = error;

      const status = error?.status;

      if (status !== 503 || attempt === maxRetries) {
        throw error;
      }

      const delay = attempt * 1500;

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body.question;

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "A valid question is required." },
        { status: 400 }
      );
    }

    const relevantKnowledge = retrieveRelevantKnowledge(question);

    const prompt = `
You are the personal AI agent for Ebraheim Mohamed Pasha Qadri.

Use only the verified information below when answering questions.

RELEVANT VERIFIED KNOWLEDGE:
${relevantKnowledge}

RULES:
- Do not invent qualifications, experience, certifications, or project results.
- Clearly distinguish completed work from work that is still in progress.
- If information is missing, say so.
- Keep answers professional, concise, and recruiter-friendly.
- Do not exaggerate skill level.
- Use phrases such as "has experience with", "has worked with", or "has used" unless the verified information explicitly supports a stronger claim.
- Never describe Ebraheim as an expert, highly skilled, advanced, or proficient unless that wording is explicitly supported by the verified information.
- Clearly separate technologies he has used in projects from technologies he has only studied or completed training on.
- Respond in clean plain text.
- Do not use Markdown symbols such as **, ##, or backticks.
- Prefer short recruiter-friendly paragraphs or simple bullet points.
- Keep normal answers concise: usually 100 to 180 words unless the user asks for more detail.
- Lead with the most relevant information instead of listing everything Ebraheim has ever done.
- For role-fit questions, do not claim Ebraheim is definitely suitable based only on a job title.
- If no job description is provided, give only a preliminary assessment and clearly say that a proper match requires the actual job description.
- When evaluating a job, structure the answer as:
  1. Likely Match
  2. Supporting Evidence
  3. Overall Assessment
- Do not hide unfinished project work.
- Do not include weaknesses, gaps, or areas for growth unless they are directly relevant to the user's question or necessary for an honest job-match assessment.

User question:
${question}
`;

    const response = await generateWithRetry(ai, prompt);

    return Response.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return Response.json(
      {
        error: "Something went wrong while generating the response.",
      },
      {
        status: 500,
      }
    );
  }
}