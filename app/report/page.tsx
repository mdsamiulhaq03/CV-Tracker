"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import { ATSChart } from "@/components/ATSChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import {
  Brain, Target, TrendingUp, Loader2, Download,
  CheckCircle, XCircle, Lightbulb, FileText, Sparkles,
  ArrowLeft, Copy, Check, Cpu, Upload, AlertCircle
} from "lucide-react";
import { getScoreColor } from "@/lib/utils";

interface AIResult {
  overall_score: number;
  ats_score: number;
  detected_skills: string[];
  missing_skills: string[];
  job_match_percentage: number;
  suggestions: string[];
  improved_cv_version: string;
}

interface ReportData {
  fileName: string;
  jobRole: string;
  extractedText: string;
  aiResult: AIResult;
  atsScore: number;
}

type Tab = "overview" | "skills" | "suggestions" | "improved";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport]           = useState<ReportData | null>(null);
  const [notFound, setNotFound]       = useState(false);
  const [improving, setImproving]     = useState(false);
  const [improveError, setImproveError] = useState("");
  const [improvedCV, setImprovedCV]   = useState("");
  const [copied, setCopied]           = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab]     = useState<Tab>("overview");

  // ── Load from sessionStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cv_report");
      if (!raw) { setNotFound(true); return; }
      const data = JSON.parse(raw) as ReportData;
      setReport(data);
      if (data.aiResult?.improved_cv_version) setImprovedCV(data.aiResult.improved_cv_version);
    } catch {
      setNotFound(true);
    }
  }, []);

  useEffect(() => {
    if (notFound) router.replace("/upload");
  }, [notFound, router]);

  // ── Improve CV ────────────────────────────────────────────────
  async function handleImprove() {
    if (!report) return;
    setImproving(true);
    setImproveError("");
    try {
      const res  = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: report.extractedText, jobRole: report.jobRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve CV");
      setImprovedCV(data.improvedCV);
      // Persist in sessionStorage
      const updated = { ...report, aiResult: { ...report.aiResult, improved_cv_version: data.improvedCV } };
      sessionStorage.setItem("cv_report", JSON.stringify(updated));
      setActiveTab("improved");
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setImproving(false);
    }
  }

  // ── Copy helper ───────────────────────────────────────────────
  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── PDF Download ──────────────────────────────────────────────
  async function handleDownloadPDF() {
    if (!report) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const M = 20;
      let y   = M;

      const addLine = (text: string, size: number, bold = false, rgb: [number, number, number] = [200, 210, 230]) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...rgb);
        doc.splitTextToSize(text, W - M * 2).forEach((l: string) => {
          if (y > 272) { doc.addPage(); y = M; }
          doc.text(l, M, y);
          y += size * 0.45;
        });
        y += 2;
      };
      const addDivider = () => {
        y += 2;
        doc.setDrawColor(50, 50, 70);
        doc.line(M, y, W - M, y);
        y += 5;
      };

      // Background
      doc.setFillColor(10, 10, 20);
      doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

      // Header bar
      doc.setFillColor(80, 40, 160);
      doc.rect(0, 0, W, 36, "F");
      doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text("CVAnalyzer AI — Analysis Report", M, 17);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 170, 255);
      doc.text(`${report.fileName}  ·  ${report.jobRole}  ·  Groq Llama 3.3 70B`, M, 28);
      y = 46;

      addLine("SCORES", 12, true, [160, 100, 255]); addDivider();
      [
        ["Overall AI Score", `${report.aiResult.overall_score}/100`],
        ["ATS Score",        `${report.atsScore}/100`],
        ["Job Match",        `${report.aiResult.job_match_percentage}%`],
      ].forEach(([l, v]) => {
        doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(170, 180, 200);
        doc.text(l, M, y);
        doc.setFont("helvetica", "bold"); doc.setTextColor(190, 150, 255);
        doc.text(v, M + 80, y);
        y += 8;
      });
      y += 4;

      addLine("DETECTED SKILLS", 12, true, [100, 180, 255]); addDivider();
      addLine(report.aiResult.detected_skills.join(", ") || "None detected", 10);

      addLine("MISSING SKILLS", 12, true, [255, 110, 110]); addDivider();
      addLine(report.aiResult.missing_skills.join(", ") || "None identified", 10);

      addLine("IMPROVEMENT SUGGESTIONS", 12, true, [100, 220, 160]); addDivider();
      report.aiResult.suggestions.forEach((s, i) => addLine(`${i + 1}. ${s}`, 10));

      if (improvedCV) {
        doc.addPage();
        doc.setFillColor(10, 10, 20);
        doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");
        y = M;
        addLine("AI-IMPROVED CV VERSION", 12, true, [160, 100, 255]); addDivider();
        addLine(improvedCV, 9);
      }

      // Footer on each page
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8); doc.setTextColor(80, 80, 100);
        doc.text(`Made by Samiul · CVAnalyzer AI · Page ${p} of ${totalPages}`, M, 287);
      }

      doc.save(`CV_Report_${report.fileName.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────
  if (!report && !notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={30} className="animate-spin text-purple-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview",    label: "Overview"    },
    { id: "skills",      label: "Skills"      },
    { id: "suggestions", label: "Suggestions" },
    { id: "improved",    label: "Improved CV" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Sticky action bar ─────────────────────────────────── */}
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Left: back + file info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/upload"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white flex-shrink-0 text-sm transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:block">New Analysis</span>
            </Link>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Brain size={12} className="text-white" />
              </div>
              <span className="text-sm text-white font-medium truncate">{report.fileName}</span>
              <span className="text-xs text-slate-500 flex-shrink-0 hidden md:block">
                · {report.jobRole}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => copyText(
                `CV Analysis for ${report.fileName}\n\nAI Score: ${report.aiResult.overall_score}/100\nATS Score: ${report.atsScore}/100\nJob Match: ${report.aiResult.job_match_percentage}%\n\nDetected Skills: ${report.aiResult.detected_skills.join(", ")}\nMissing Skills: ${report.aiResult.missing_skills.join(", ")}`,
                "summary"
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-slate-300 hover:text-white transition-all"
              title="Copy summary to clipboard"
            >
              {copied === "summary"
                ? <><Check size={12} className="text-emerald-400" /> Copied</>
                : <><Copy size={12} /> Copy</>}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xs text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {downloading
                ? <Loader2 size={12} className="animate-spin" />
                : <Download size={12} />}
              <span>{downloading ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Score cards — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreCard title="AI Score"  score={report.aiResult.overall_score}        icon={<Brain size={17} />} />
          <ScoreCard title="ATS Score" score={report.atsScore}                      icon={<Target size={17} />} />
          <ScoreCard title="Job Match" score={report.aiResult.job_match_percentage} icon={<TrendingUp size={17} />} subtitle={report.jobRole} />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 glass p-1 rounded-xl overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-[80px] ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview ────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-5">
            <ATSChart
              overallScore={report.aiResult.overall_score}
              atsScore={report.atsScore}
              jobMatchPercentage={report.aiResult.job_match_percentage}
              detectedSkillsCount={report.aiResult.detected_skills.length}
              missingSkillsCount={report.aiResult.missing_skills.length}
            />
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-sm">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-0">
                {[
                  { label: "Overall Score",     value: `${report.aiResult.overall_score}/100`, color: getScoreColor(report.aiResult.overall_score) },
                  { label: "ATS Compatibility", value: `${report.atsScore}/100`,               color: getScoreColor(report.atsScore) },
                  { label: "Job Match",         value: `${report.aiResult.job_match_percentage}%`, color: getScoreColor(report.aiResult.job_match_percentage) },
                  { label: "Skills Detected",   value: `${report.aiResult.detected_skills.length} found`,  color: "text-blue-400" },
                  { label: "Skills Missing",    value: `${report.aiResult.missing_skills.length} gaps`,    color: "text-orange-400" },
                  { label: "Suggestions",       value: `${report.aiResult.suggestions.length} tips`,       color: "text-yellow-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Skills ──────────────────────────────────────────── */}
        {activeTab === "skills" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <CardTitle className="text-sm">Detected Skills</CardTitle>
                  <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {report.aiResult.detected_skills.length} found
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {report.aiResult.detected_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.aiResult.detected_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No skills detected. Make sure your CV lists specific technologies.</p>
                )}
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-400" />
                  <CardTitle className="text-sm">Missing Skills</CardTitle>
                  <span className="ml-auto text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                    {report.aiResult.missing_skills.length} gaps
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {report.aiResult.missing_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.aiResult.missing_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Great — no critical skill gaps found!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Suggestions ─────────────────────────────────────── */}
        {activeTab === "suggestions" && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-400" />
                <CardTitle className="text-sm">AI Improvement Suggestions</CardTitle>
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                  <Cpu size={11} /> Groq Llama 3.3
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {report.aiResult.suggestions.length > 0 ? (
                report.aiResult.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/15 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-yellow-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No suggestions available.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Improved CV ─────────────────────────────────────── */}
        {activeTab === "improved" && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  <CardTitle className="text-sm">AI-Improved CV</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {improvedCV && (
                    <button
                      onClick={() => copyText(improvedCV, "cv")}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                    >
                      {copied === "cv"
                        ? <><Check size={12} className="text-emerald-400" /> Copied</>
                        : <><Copy size={12} /> Copy Text</>}
                    </button>
                  )}
                  {!improvedCV && (
                    <button
                      onClick={handleImprove}
                      disabled={improving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {improving
                        ? <><Loader2 size={13} className="animate-spin" /> Rewriting...</>
                        : <><Sparkles size={13} /> Improve My CV</>}
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Error */}
              {improveError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={14} /> {improveError}
                </div>
              )}

              {/* Animating */}
              {improving && (
                <div className="text-center py-14">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 pulse-ring">
                    <Cpu size={20} className="text-purple-400" />
                  </div>
                  <p className="text-white font-medium typing-cursor">Groq is rewriting your CV</p>
                  <p className="text-sm text-slate-500 mt-1">Usually 15–30 seconds · Llama 3.3 70B</p>
                </div>
              )}

              {/* Empty state */}
              {!improving && !improvedCV && (
                <div className="text-center py-14">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <FileText size={22} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">No improved version yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Click &quot;Improve My CV&quot; above — Groq will rewrite your entire CV
                    into an ATS-optimized, professional format.
                  </p>
                </div>
              )}

              {/* Result */}
              {improvedCV && (
                <pre className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-white/[0.02] rounded-xl p-5 max-h-[600px] overflow-y-auto border border-white/5">
                  {improvedCV}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analyze another CTA */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm text-slate-300 hover:text-white hover:border-purple-500/30 transition-all"
          >
            <Upload size={15} /> Analyze Another CV
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pb-2">
          <Cpu size={12} /> Powered by Groq · Llama 3.3 70B Versatile
        </div>
      </div>

      <Footer />
    </div>
  );
}
