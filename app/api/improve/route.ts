import { NextRequest, NextResponse } from "next/server";
import { improveCV } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobRole } = await req.json();

    if (!cvText || !jobRole)
      return NextResponse.json({ error: "cvText and jobRole are required" }, { status: 400 });

    const improvedCV = await improveCV(cvText, jobRole);
    return NextResponse.json({ improvedCV });
  } catch (error) {
    console.error("Improve error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Improvement failed" },
      { status: 500 }
    );
  }
}
