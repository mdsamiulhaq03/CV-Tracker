export interface ATSScoreBreakdown {
  totalScore: number;
  sectionScore: number;
  keywordScore: number;
  lengthScore: number;
  formattingScore: number;
  details: {
    foundSections: string[];
    missingSections: string[];
    keywordDensity: number;
    wordCount: number;
  };
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  "Web Developer": [
    "javascript", "typescript", "react", "next.js", "node.js", "html", "css",
    "api", "rest", "git", "github", "responsive", "frontend", "backend",
    "database", "sql", "mongodb", "docker", "testing", "performance",
    "webpack", "npm", "yarn", "agile", "scrum",
  ],
  "ML Engineer": [
    "python", "tensorflow", "pytorch", "scikit-learn", "machine learning",
    "deep learning", "neural network", "pandas", "numpy", "model", "training",
    "deployment", "mlops", "docker", "kubernetes", "aws", "gcp", "azure",
    "data pipeline", "feature engineering", "sql", "spark", "kafka",
  ],
  "Data Analyst": [
    "python", "sql", "r", "excel", "tableau", "power bi", "statistics",
    "data visualization", "pandas", "analysis", "dashboard", "reporting",
    "etl", "data cleaning", "a/b testing", "business intelligence",
    "kpi", "metrics", "insight", "stakeholder", "matplotlib",
  ],
};

const REQUIRED_SECTIONS = [
  { name: "Experience", patterns: ["experience", "work history", "employment", "career"] },
  { name: "Skills", patterns: ["skills", "technical skills", "core competencies", "technologies"] },
  { name: "Education", patterns: ["education", "academic", "degree", "university", "college"] },
  { name: "Projects", patterns: ["projects", "portfolio", "work samples", "achievements"] },
];

const OPTIONAL_SECTIONS = [
  { name: "Summary", patterns: ["summary", "objective", "profile", "about"] },
  { name: "Certifications", patterns: ["certification", "certificate", "license", "credential"] },
  { name: "Awards", patterns: ["award", "honor", "recognition", "achievement"] },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s.]/g, " ");
}

function checkSections(text: string): { found: string[]; missing: string[] } {
  const normalized = normalizeText(text);
  const found: string[] = [];
  const missing: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    const hasSection = section.patterns.some((p) => normalized.includes(p));
    if (hasSection) found.push(section.name);
    else missing.push(section.name);
  }

  for (const section of OPTIONAL_SECTIONS) {
    const hasSection = section.patterns.some((p) => normalized.includes(p));
    if (hasSection) found.push(section.name);
  }

  return { found, missing };
}

function calculateKeywordDensity(text: string, jobRole: string): number {
  const normalized = normalizeText(text);
  const keywords = ROLE_KEYWORDS[jobRole] || ROLE_KEYWORDS["Web Developer"];
  const words = normalized.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords === 0) return 0;

  let keywordHits = 0;
  for (const keyword of keywords) {
    if (normalized.includes(keyword)) {
      // Count occurrences
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      const matches = normalized.match(regex);
      keywordHits += matches ? matches.length : 0;
    }
  }

  return Math.min(1, keywordHits / (keywords.length * 0.6));
}

function scoreLength(wordCount: number): number {
  // Ideal CV: 300-800 words
  if (wordCount < 100) return 20;
  if (wordCount < 200) return 50;
  if (wordCount < 300) return 70;
  if (wordCount <= 800) return 100;
  if (wordCount <= 1200) return 85;
  return 60; // Too long
}

function scoreFormatting(text: string): number {
  let score = 100;
  const normalized = normalizeText(text);

  // Penalize if no phone/email pattern found
  const hasEmail = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/.test(normalized);
  const hasPhone = /(\d[\s\-.]?){10,}/.test(text);
  if (!hasEmail) score -= 15;
  if (!hasPhone) score -= 10;

  // Reward bullet points
  const bulletCount = (text.match(/[•\-\*]\s/g) || []).length;
  if (bulletCount < 3) score -= 10;

  // Penalize all caps sections that might confuse ATS
  const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (allCapsWords > 20) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function calculateATSScore(text: string, jobRole: string): ATSScoreBreakdown {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const { found: foundSections, missing: missingSections } = checkSections(text);
  const keywordDensity = calculateKeywordDensity(text, jobRole);

  // Section score: 25 points max
  const sectionScore = Math.round(
    ((foundSections.filter((s) =>
      REQUIRED_SECTIONS.map((r) => r.name).includes(s)
    ).length) / REQUIRED_SECTIONS.length) * 100
  );

  // Keyword score: 0-100
  const keywordScore = Math.round(keywordDensity * 100);

  // Length score
  const lengthScore = scoreLength(wordCount);

  // Formatting score
  const formattingScore = scoreFormatting(text);

  // Weighted total
  const totalScore = Math.round(
    sectionScore * 0.35 +
    keywordScore * 0.35 +
    lengthScore * 0.15 +
    formattingScore * 0.15
  );

  return {
    totalScore: Math.min(100, Math.max(0, totalScore)),
    sectionScore,
    keywordScore,
    lengthScore,
    formattingScore,
    details: {
      foundSections,
      missingSections,
      keywordDensity: Math.round(keywordDensity * 100) / 100,
      wordCount,
    },
  };
}
