import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "from-emerald-500/20 to-emerald-600/10";
  if (score >= 60) return "from-yellow-500/20 to-yellow-600/10";
  return "from-red-500/20 to-red-600/10";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  if (score >= 40) return "Below Average";
  return "Needs Work";
}

export const JOB_ROLES = ["Web Developer", "ML Engineer", "Data Analyst"] as const;
export type JobRole = (typeof JOB_ROLES)[number];
