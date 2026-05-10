"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isAnalyzing?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function UploadBox({ onFileSelect, selectedFile, onClear, isAnalyzing }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setDragError("File too large. Maximum size is 5MB.");
      return false;
    }
    const isValid = ACCEPTED_TYPES.includes(file.type) || /\.(pdf|docx|txt)$/i.test(file.name);
    if (!isValid) {
      setDragError("Unsupported format. Please use PDF, DOCX, or TXT.");
      return false;
    }
    setDragError("");
    return true;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (selectedFile) {
    return (
      <div className="glass-card p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            {isAnalyzing ? (
              <Loader2 size={20} className="text-emerald-400 animate-spin" />
            ) : (
              <CheckCircle size={20} className="text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-400">{formatSize(selectedFile.size)}</p>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClear}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "glass-card p-10 text-center cursor-pointer transition-all duration-200 border-dashed",
          isDragging
            ? "border-purple-500/60 bg-purple-500/5"
            : "border-white/10 hover:border-purple-500/40 hover:bg-white/[0.02]",
          isAnalyzing && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all",
          isDragging
            ? "bg-purple-500/20 border border-purple-500/40"
            : "bg-white/5 border border-white/10"
        )}>
          {isDragging ? (
            <FileText size={28} className="text-purple-400" />
          ) : (
            <Upload size={28} className="text-slate-400" />
          )}
        </div>
        <p className="text-white font-medium mb-1">
          {isDragging ? "Drop your CV here" : "Upload your CV"}
        </p>
        <p className="text-sm text-slate-400">
          Drag & drop or click to browse
        </p>
        <p className="text-xs text-slate-500 mt-2">PDF, DOCX, TXT — Max 5MB</p>
      </div>
      {dragError && (
        <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
          <X size={14} />
          {dragError}
        </p>
      )}
    </div>
  );
}
