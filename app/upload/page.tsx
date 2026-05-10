"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadBox } from "@/components/UploadBox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JOB_ROLES, type JobRole } from "@/lib/utils";
import { Loader2, Sparkles, Brain, Target, Zap, ChevronDown, Cpu } from "lucide-react";

const AI_MESSAGES = [
  "Extracting text from your CV...",
  "Running ATS keyword analysis...",
  "Evaluating skills and experience...",
  "Calculating job match percentage...",
  "Generating improvement suggestions...",
  "Finalizing your analysis report...",
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile]           = useState<File | null>(null);
  const [jobRole, setJobRole]     = useState<JobRole>("Web Developer");
  const [analyzing, setAnalyzing] = useState(false);
  const [msgIndex, setMsgIndex]   = useState(0);
  const [error, setError]         = useState("");

  async function handleAnalyze() {
    if (!file) return;
    setError("");
    setAnalyzing(true);
    setMsgIndex(0);

    const interval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, AI_MESSAGES.length - 1));
    }, 2800);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobRole", jobRole);

      const res  = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Store result in sessionStorage — no database needed
      sessionStorage.setItem("cv_report", JSON.stringify(data));

      router.push("/report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setAnalyzing(false);
    } finally {
      clearInterval(interval);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyze Your CV</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Upload your CV and select a target role for personalized AI analysis.
        </p>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Brain,  label: "AI Analysis",  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { icon: Target, label: "ATS Scoring",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"   },
          { icon: Zap,    label: "CV Rewrite",   color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map(({ icon: Icon, label, color, bg }) => (
          <Card key={label} className={`p-4 text-center border ${bg}`}>
            <Icon size={18} className={`${color} mx-auto mb-1.5`} />
            <p className="text-xs text-slate-300 font-medium">{label}</p>
          </Card>
        ))}
      </div>

      {/* Job role */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Target Job Role</label>
        <div className="relative">
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value as JobRole)}
            disabled={analyzing}
            className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm disabled:opacity-50 cursor-pointer"
          >
            {JOB_ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#0f0f1a]">{r}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          The AI adjusts skill expectations and scoring based on your target role.
        </p>
      </Card>

      {/* Upload */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Your CV</label>
        <UploadBox
          onFileSelect={setFile}
          selectedFile={file}
          onClear={() => setFile(null)}
          isAnalyzing={analyzing}
        />
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {/* AI progress */}
      {analyzing && (
        <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center pulse-ring">
                <Cpu size={15} className="text-purple-400" />
              </div>
              <CardTitle className="text-sm">Groq AI is analyzing your CV</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-slate-300 typing-cursor mb-4">{AI_MESSAGES[msgIndex]}</p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${((msgIndex + 1) / AI_MESSAGES.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">Powered by Llama 3.3 70B via Groq</p>
          </CardContent>
        </Card>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || analyzing}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {analyzing
          ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
          : <><Sparkles size={18} /> Analyze My CV</>
        }
      </button>
    </div>
  );
}
