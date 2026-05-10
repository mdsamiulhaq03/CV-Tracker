import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVAnalyzer AI – Intelligent CV Review Platform",
  description: "AI-powered CV analysis with ATS scoring, skill gap detection, and instant improvement suggestions.",
  keywords: "CV review, resume analyzer, ATS score, AI CV, job application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-slate-100">
        {children}
      </body>
    </html>
  );
}
