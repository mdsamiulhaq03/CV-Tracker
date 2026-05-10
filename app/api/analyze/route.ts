import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/pdf";
import { calculateATSScore } from "@/lib/atsEngine";
import { analyzeCV } from "@/lib/ai";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTS  = /\.(pdf|docx|doc|txt)$/i;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const jobRole  = formData.get("jobRole") as string;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!jobRole || !["Web Developer", "ML Engineer", "Data Analyst"].includes(jobRole))
      return NextResponse.json({ error: "Invalid job role" }, { status: 400 });

    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

    if (!ALLOWED_EXTS.test(file.name))
      return NextResponse.json({ error: "Unsupported file type. Use PDF, DOCX, or TXT" }, { status: 400 });

    const buffer        = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromFile(buffer, file.type, file.name);

    if (!extractedText || extractedText.length < 50)
      return NextResponse.json({ error: "Could not extract enough text from the file" }, { status: 422 });

    const atsBreakdown = calculateATSScore(extractedText, jobRole);
    const aiResult     = await analyzeCV(extractedText, jobRole, atsBreakdown.totalScore);

    return NextResponse.json({
      fileName:      file.name,
      jobRole,
      extractedText,
      aiResult,
      atsScore:      atsBreakdown.totalScore,
      atsBreakdown,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
