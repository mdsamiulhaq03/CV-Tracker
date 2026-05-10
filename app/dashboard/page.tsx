"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, ArrowRight, Cpu, Brain, Target, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Welcome */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/25 to-blue-600/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">CVAnalyzer AI</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Upload your CV and get an instant AI-powered analysis. No account needed.
        </p>
      </div>

      {/* Main CTA */}
      <Link href="/upload">
        <Card className="p-8 text-center border-purple-500/20 bg-gradient-to-br from-purple-500/8 to-blue-500/5 hover:border-purple-500/40 transition-all group cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Analyze Your CV</h2>
          <p className="text-sm text-slate-400 mb-4">
            Upload PDF, DOCX, or TXT — get scores, skill gaps, and an improved version in seconds.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium">
            Get Started <ArrowRight size={15} />
          </div>
        </Card>
      </Link>

      {/* Feature cards */}
      <div className=" mt-10 grid grid-cols-3 gap-4">
        {[
          { icon: Brain,  title: "AI Score",    desc: "Overall CV quality scored by Llama 3.3",   color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { icon: Target, title: "ATS Score",   desc: "Keyword density & formatting check",        color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"   },
          { icon: Zap,    title: "CV Rewrite",  desc: "Full ATS-optimized rewrite in one click",   color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <Card key={title} className={`p-4 border ${bg}`}>
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-xs font-semibold text-white mb-1">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
        <Cpu size={12} /> Powered by Groq · Llama 3.3 70B Versatile
      </div>
    </div>
  );
}
