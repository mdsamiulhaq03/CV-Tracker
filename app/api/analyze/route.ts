import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/pdf";
import { calculateATSScore } from "@/lib/atsEngine";
import { analyzeCV } from "@/lib/ai";

export const maxDuration = 60; // seconds — give Groq enough time

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTS  = /\.(pdf|docx|doc|txt)$/i;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const jobRole  = formData.get("jobRole") as string;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!["Web Developer", "ML Engineer", "Data Analyst"].includes(jobRole))
      return NextResponse.json({ error: "Invalid job role" }, { status: 400 });

    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "File too large — maximum 5MB" }, { status: 400 });

    if (!ALLOWED_EXTS.test(file.name))
      return NextResponse.json({ error: "Unsupported file type. Please use PDF, DOCX, or TXT" }, { status: 400 });

    // ── Step 1: Extract text ──────────────────────────────────────
    let extractedText: string;
    try {
      const buffer  = Buffer.from(await file.arrayBuffer());
      extractedText = await extractTextFromFile(buffer, file.type, file.name);
    } catch (err) {
      console.error("Text extraction error:", err);
      return NextResponse.json(
        { error: `Could not read the file: ${err instanceof Error ? err.message : "unknown error"}` },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.length < 50)
      return NextResponse.json(
        { error: "Not enough text found in the file. Make sure the PDF isn't a scanned image." },
        { status: 422 }
      );

    // ── Step 2: ATS score ─────────────────────────────────────────
    const atsBreakdown = calculateATSScore(extractedText, jobRole);

    // ── Step 3: Groq AI analysis ──────────────────────────────────
    let aiResult;
    try {
      aiResult = await analyzeCV(extractedText, jobRole, atsBreakdown.totalScore);
    } catch (err) {
      console.error("Groq AI error:", err);
      return NextResponse.json(
        { error: `AI analysis failed: ${err instanceof Error ? err.message : "Check your GROQ_API_KEY"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fileName:      file.name,
      jobRole,
      extractedText,
      aiResult,
      atsScore:      atsBreakdown.totalScore,
      atsBreakdown,
    });

  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error — please try again" },
      { status: 500 }
    );
  }
}
