import { Brain, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass border-t border-white/5 px-6 py-5 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Brain size={13} />
          <span className="font-medium text-slate-400">CVAnalyzer AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart size={11} className="text-pink-500 fill-pink-500" />
          <span>by <span className="text-slate-400 font-medium">Samiul</span></span>
          <span className="mx-1.5 text-slate-700">·</span>
          <span>© 2026</span>
          <span className="mx-1.5 text-slate-700">·</span>
          <span>Powered by Groq + Llama 3.3</span>
        </div>
      </div>
    </footer>
  );
}
