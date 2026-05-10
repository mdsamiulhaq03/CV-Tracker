"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharedNavbarProps {
  transparent?: boolean;
}

export function SharedNavbar({ transparent = false }: SharedNavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "w-full z-50 px-6 py-4",
        transparent
          ? "absolute top-0 left-0 bg-transparent"
          : "sticky top-0 glass border-b border-white/5"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-base gradient-text hidden sm:block">CVAnalyzer AI</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all",
              pathname === "/dashboard"
                ? "bg-white/8 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>

          <Link
            href="/upload"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              pathname === "/upload"
                ? "bg-white/8 text-white"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
            )}
          >
            <Upload size={14} />
            <span className="hidden sm:block">Analyze CV</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
