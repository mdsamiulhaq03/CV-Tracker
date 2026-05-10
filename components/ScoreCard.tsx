"use client";

import { useEffect, useState } from "react";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  subtitle?: string;
  icon: React.ReactNode;
}

export function ScoreCard({ title, score, subtitle, icon }: ScoreCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const duration = 1200;
    const steps    = 60;
    const increment = score / steps;
    let current  = 0;
    let step     = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(score);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer); // cleanup on unmount / score change
  }, [score]);

  const circumference     = 2 * Math.PI * 36;
  const strokeDashoffset  = circumference - (display / 100) * circumference;
  const ringColor         = score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="glass-card p-5 flex flex-col items-center text-center">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 text-slate-400">
        {icon}
      </div>

      {/* Circular progress */}
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="44" cy="44" r="36" fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-75"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-black ${getScoreColor(score)}`}>{display}</span>
        </div>
      </div>

      <h3 className="text-xs font-semibold text-white mb-0.5">{title}</h3>
      <p className={`text-xs font-medium ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-full">{subtitle}</p>}
    </div>
  );
}
