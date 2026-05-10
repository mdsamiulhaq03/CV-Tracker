"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { SharedNavbar } from "@/components/SharedNavbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles, FileText, Target, Shield, Zap,
  ArrowRight, BarChart3, Brain, Cpu
} from "lucide-react";

export default function LandingPage() {
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div className="bg-[#0a0a0f]">

      {/* ── Full-screen 3D Hero ──────────────────────────────────── */}
      <section
        className="relative min-h-screen w-full overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Spline 3D — fills entire viewport */}
        <div className="absolute inset-0 z-0">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>

        {/* Static dark overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-black/55" />

        {/* Mouse-reactive radial glow — follows cursor */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(700px circle at ${glow.x}% ${glow.y}%,
              rgba(139, 92, 246, 0.18) 0%,
              rgba(59, 130, 246, 0.10) 35%,
              transparent 70%)`,
          }}
        />

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-[3] pointer-events-none bg-gradient-to-b from-transparent to-[#0a0a0f]" />

        {/* Navbar floats on top */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <SharedNavbar transparent />
        </div>

        {/* ── Centered hero content ──────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={12} />
            AI-Powered CV Analysis · Groq Llama 3.3
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 max-w-3xl">
            <span className="text-white drop-shadow-lg">Land Your</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400">
              Dream Job
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-neutral-300 text-lg leading-relaxed mb-10 max-w-lg">
            AI-powered CV analysis with ATS scoring, skill gap detection, and
            an instant professional rewrite — in under 30 seconds. No sign-up needed.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-all hover:scale-[1.03] shadow-xl shadow-white/10"
            >
              Analyze My CV Free <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/8 hover:border-white/30 backdrop-blur-sm transition-all"
            >
              View Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10">
            {[
              { value: "95%", label: "ATS Pass Rate"   },
              { value: "3×",  label: "More Interviews" },
              { value: "30s", label: "Analysis Time"   },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-purple-400 text-xs font-medium mb-4">
            <Cpu size={11} /> Powered by Groq + Llama 3.3 70B
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Everything You Need to Get Hired
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            No account needed. Upload your CV and get comprehensive AI feedback instantly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Brain,    title: "Groq AI Analysis",      desc: "Llama 3.3 70B analyzes your CV and gives comprehensive scores with detailed feedback.",           gradient: "from-purple-500/15 to-purple-600/5",  border: "border-purple-500/20",  color: "text-purple-400" },
            { icon: Target,   title: "ATS Score Engine",      desc: "Rule-based ATS checks keyword density, section structure, and formatting compatibility.",           gradient: "from-blue-500/15 to-blue-600/5",     border: "border-blue-500/20",    color: "text-blue-400"   },
            { icon: Zap,      title: "Instant CV Rewrite",    desc: "One click rewrites your CV into an ATS-optimized format tailored to your target role.",            gradient: "from-emerald-500/15 to-emerald-600/5",border: "border-emerald-500/20", color: "text-emerald-400"},
            { icon: BarChart3,"title":"Skill Gap Detection",  desc: "Discover exactly which skills you are missing and get a prioritized list to close the gap.",        gradient: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/20",  color: "text-orange-400" },
            { icon: FileText, title: "PDF Report Export",     desc: "Export a dark-mode PDF with all scores, skill analysis, suggestions, and your improved CV.",        gradient: "from-pink-500/15 to-pink-600/5",     border: "border-pink-500/20",    color: "text-pink-400"   },
            { icon: Shield,   title: "Session History",       desc: "Every analysis is saved to your session. View your results anytime during the same visit.",        gradient: "from-cyan-500/15 to-cyan-600/5",     border: "border-cyan-500/20",    color: "text-cyan-400"   },
          ].map((f) => (
            <Card key={f.title} className={`p-6 bg-gradient-to-br ${f.gradient} border ${f.border} hover:scale-[1.02] hover:shadow-lg transition-all cursor-default`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
