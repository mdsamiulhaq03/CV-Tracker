import Groq from "groq-sdk";

export interface AIAnalysisResult {
  overall_score: number;
  ats_score: number;
  detected_skills: string[];
  missing_skills: string[];
  job_match_percentage: number;
  suggestions: string[];
  improved_cv_version: string;
}

const MODEL = "llama-3.3-70b-versatile";

const JOB_ROLE_PROMPTS: Record<string, string> = {
  "Web Developer": `
    Focus on: HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, REST APIs, Git,
    responsive design, performance optimization, testing frameworks, databases (SQL/NoSQL).
    Score higher for: portfolio projects, GitHub activity, modern frameworks, CI/CD experience.
    Missing skills should include modern web development essentials the CV lacks.
  `,
  "ML Engineer": `
    Focus on: Python, TensorFlow, PyTorch, scikit-learn, pandas, numpy, machine learning algorithms,
    deep learning, model deployment, MLOps, Docker, cloud platforms (AWS/GCP/Azure), SQL, data pipelines.
    Score higher for: research papers, Kaggle competitions, model deployment experience, large datasets.
    Missing skills should include ML/AI stack essentials the CV lacks.
  `,
  "Data Analyst": `
    Focus on: Python/R, SQL, Excel, Tableau/Power BI, statistics, data visualization, pandas,
    business intelligence, ETL pipelines, A/B testing, reporting, data cleaning.
    Score higher for: business impact metrics, dashboard creation, stakeholder communication, domain expertise.
    Missing skills should include data analysis essentials the CV lacks.
  `,
};

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");
  return new Groq({ apiKey });
}

function parseJSONSafely(text: string): AIAnalysisResult {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  return JSON.parse(cleaned) as AIAnalysisResult;
}

export async function analyzeCV(
  cvText: string,
  jobRole: string,
  atsScore: number
): Promise<AIAnalysisResult> {
  const groq = getGroqClient();
  const roleContext = JOB_ROLE_PROMPTS[jobRole] || JOB_ROLE_PROMPTS["Web Developer"];

  const prompt = `You are an expert CV/Resume reviewer and ATS (Applicant Tracking System) specialist.

Analyze the following CV for a ${jobRole} position and return a detailed JSON analysis.

Job Role Context:
${roleContext}

The rule-based ATS score is: ${atsScore}/100

CV Content:
---
${cvText.slice(0, 6000)}
---

Return ONLY a valid JSON object with this EXACT structure (no markdown, no explanation, no code fences):
{
  "overall_score": <integer 0-100>,
  "ats_score": <integer 0-100, AI assessment of ATS compatibility>,
  "detected_skills": [<array of specific skills/technologies found>],
  "missing_skills": [<top 6-8 important skills for ${jobRole} that are absent>],
  "job_match_percentage": <integer 0-100>,
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>",
    "<actionable suggestion 5>"
  ],
  "improved_cv_version": "<full ATS-optimized CV rewrite preserving real experience>"
}

Rules:
- overall_score = weighted average: ats_score (40%) + job_match_percentage (60%)
- detected_skills: specific technologies/tools only
- missing_skills: top 6-8 most impactful gaps
- suggestions: specific and actionable, not generic
- improved_cv_version: complete professional rewrite, use clear section headers`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  if (!content) throw new Error("Empty response from Groq API");

  try {
    const result = parseJSONSafely(content);
    result.overall_score = Math.min(100, Math.max(0, result.overall_score));
    result.ats_score = Math.min(100, Math.max(0, result.ats_score));
    result.job_match_percentage = Math.min(100, Math.max(0, result.job_match_percentage));
    return result;
  } catch {
    throw new Error("Failed to parse Groq response as JSON — try again");
  }
}

export async function improveCV(cvText: string, jobRole: string): Promise<string> {
  const groq = getGroqClient();
  const roleContext = JOB_ROLE_PROMPTS[jobRole] || JOB_ROLE_PROMPTS["Web Developer"];

  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0.4,
    messages: [
      {
        role: "user",
        content: `You are an expert CV writer specializing in ATS optimization for ${jobRole} positions.

Completely rewrite the following CV to:
1. Use strong action verbs and quantified achievements
2. Incorporate relevant keywords for ${jobRole}
3. Follow ATS-friendly formatting (no tables, no columns, clear section headers)
4. Improve readability and impact
5. Keep all real experience but enhance language, structure, and impact

Job Role Focus: ${roleContext}

Original CV:
---
${cvText.slice(0, 6000)}
---

Return ONLY the improved CV text. No explanations, no markdown formatting, no code fences.
Use clear section headers: PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  if (!content) throw new Error("Empty response from Groq API");
  return content.trim();
}
