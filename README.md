# CVAnalyzer AI

> **AI-powered CV analysis platform** — upload your CV and get instant ATS scoring, skill gap detection, and a professionally rewritten version. No sign-up required.

Built with **Next.js 16**, **Groq (Llama 3.3 70B)**, and a full shadcn + Spline 3D UI.

---

## Features

- **AI CV Analysis** — Groq Llama 3.3 70B scores your CV across 6 dimensions with detailed feedback
- **ATS Score Engine** — rule-based engine checks keyword density, section structure, formatting, and length
- **Skill Gap Detection** — identifies missing skills for your target role (Web Developer, ML Engineer, Data Analyst)
- **Instant CV Rewrite** — one-click ATS-optimized rewrite tailored to your job role
- **PDF Report Export** — dark-mode PDF with scores, skills, suggestions, and improved CV
- **3D Interactive Hero** — Spline 3D scene with mouse-reactive glow on the landing page
- **No sign-up, no database** — results stored in `sessionStorage`, zero friction

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| AI | Groq API · Llama 3.3 70B Versatile |
| UI | Tailwind CSS v4 · shadcn/ui · Radix UI |
| 3D | Spline (`@splinetool/react-spline`) |
| Charts | Recharts |
| PDF | jsPDF |
| File Parsing | pdf-parse v2 · mammoth |
| Icons | Lucide React |
| Animation | Framer Motion |

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Landing page (3D hero + features)
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard layout with navbar + footer
│   │   └── page.tsx              # Dashboard home
│   ├── upload/
│   │   ├── layout.tsx
│   │   └── page.tsx              # CV upload + job role selector
│   ├── report/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Analysis results (reads from sessionStorage)
│   └── api/
│       ├── analyze/route.ts      # POST — extract text → ATS score → Groq AI
│       └── improve/route.ts      # POST — Groq rewrites the full CV
│
├── components/
│   ├── ui/
│   │   ├── card.tsx              # shadcn Card
│   │   ├── spotlight.tsx         # Aceternity Spotlight
│   │   └── splite.tsx            # Spline 3D scene (SSR-safe)
│   ├── ScoreCard.tsx             # Animated circular score gauge
│   ├── ATSChart.tsx              # Recharts radar chart
│   ├── UploadBox.tsx             # Drag-and-drop file uploader
│   ├── SharedNavbar.tsx          # Global navigation bar
│   └── Footer.tsx                # Shared footer
│
└── lib/
    ├── ai.ts                     # Groq API — analyzeCV() + improveCV()
    ├── atsEngine.ts              # Rule-based ATS scoring logic
    ├── pdf.ts                    # PDF/DOCX/TXT text extraction
    └── utils.ts                  # cn(), score helpers, job roles
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cv-analyzer-ai.git
cd cv-analyzer-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your free Groq API key at [console.groq.com](https://console.groq.com).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

```
User uploads CV (PDF / DOCX / TXT)
        │
        ▼
POST /api/analyze
   ├── Extract text        (pdf-parse v2 / mammoth)
   ├── ATS Score Engine    (keyword density, sections, length, formatting)
   └── Groq AI Analysis    (Llama 3.3 70B — scores, skills, suggestions)
        │
        ▼
Result saved to sessionStorage
        │
        ▼
/report page — Overview · Skills · Suggestions · Improved CV
   └── "Improve My CV" → POST /api/improve → Groq rewrites full CV
   └── "Download PDF"  → jsPDF generates dark-mode report
```

---

## API Reference

### `POST /api/analyze`

Analyzes a CV file and returns a full AI report.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | PDF, DOCX, or TXT (max 5MB) |
| `jobRole` | string | `"Web Developer"` \| `"ML Engineer"` \| `"Data Analyst"` |

**Response**

```json
{
  "fileName": "my-cv.pdf",
  "jobRole": "Web Developer",
  "extractedText": "...",
  "atsScore": 72,
  "atsBreakdown": {
    "totalScore": 72,
    "sectionScore": 100,
    "keywordScore": 65,
    "lengthScore": 85,
    "formattingScore": 90
  },
  "aiResult": {
    "overall_score": 74,
    "ats_score": 70,
    "detected_skills": ["React", "TypeScript", "Node.js"],
    "missing_skills": ["Docker", "CI/CD", "Testing"],
    "job_match_percentage": 68,
    "suggestions": ["Add quantified achievements...", "..."],
    "improved_cv_version": "PROFESSIONAL SUMMARY\n..."
  }
}
```

---

### `POST /api/improve`

Rewrites a CV into an ATS-optimized format using Groq AI.

**Request** — `application/json`

```json
{
  "cvText": "Original CV text...",
  "jobRole": "Web Developer"
}
```

**Response**

```json
{
  "improvedCV": "PROFESSIONAL SUMMARY\n\nResults-driven..."
}
```

---

## ATS Scoring Breakdown

The ATS engine scores CVs across four dimensions:

| Dimension | Weight | What it checks |
|---|---|---|
| Section Score | 35% | Experience, Skills, Education, Projects sections present |
| Keyword Score | 35% | Role-specific keyword density (e.g. React, TypeScript for Web Dev) |
| Length Score | 15% | Optimal word count (300–800 words scores highest) |
| Formatting Score | 15% | Email/phone present, bullet points used, no excessive caps |

---

## Supported Job Roles

| Role | Key Skills Evaluated |
|---|---|
| Web Developer | JavaScript, TypeScript, React, Next.js, Node.js, CSS, Git, REST APIs |
| ML Engineer | Python, TensorFlow, PyTorch, scikit-learn, pandas, Docker, MLOps |
| Data Analyst | SQL, Python, Tableau, Power BI, Excel, statistics, ETL, A/B testing |

---

## Deployment

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add your environment variable in the Vercel dashboard:
- `GROQ_API_KEY` — your Groq API key

### Build for production

```bash
npm run build
npm start
```

---

## Supported File Formats

| Format | Parser |
|---|---|
| `.pdf` | pdf-parse v2 (`PDFParse` class) |
| `.docx` / `.doc` | mammoth |
| `.txt` | native `Buffer.toString()` |

Maximum file size: **5MB**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Groq API key for Llama 3.3 inference |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL (default: `http://localhost:3000`) |

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

**Made with ❤️ by Samiul**

- Built using [Next.js](https://nextjs.org), [Groq](https://groq.com), and [Spline](https://spline.design)
- AI inference by [Groq](https://groq.com) · Model: Llama 3.3 70B Versatile
