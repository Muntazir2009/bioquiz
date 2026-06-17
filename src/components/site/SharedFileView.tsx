"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  File,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Globe,
  Lock,
  Calendar,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  image: ImageIcon, video: Video, audio: Music, pdf: FileText,
  archive: FileArchive, document: FileText, text: FileText, file: File,
};

const categoryColors: Record<string, string> = {
  image: "oklch(0.75 0.15 200)", video: "oklch(0.7 0.18 300)", audio: "oklch(0.72 0.16 150)",
  pdf: "oklch(0.65 0.2 25)", archive: "oklch(0.68 0.12 60)", document: "oklch(0.7 0.12 250)",
  text: "oklch(0.65 0.1 220)", file: "oklch(0.55 0.08 250)",
};

type SharedFile = {
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  category: string;
  downloads: number;
  createdAt: string;
  shareId: string;
  isPublic?: boolean;
  description?: string | null;
};

export function SharedFileView({ shareId, onClose }: { shareId: string; onClose: () => void }) {
  const [file, setFile] = useState<SharedFile | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/share/${shareId}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "This file is private" : r.status === 410 ? "This file has expired" : "File not found");
        return r.json();
      })
      .then((data) => setFile(data.file))
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
      });
    return () => controller.abort();
  }, [shareId]);

  // Close on Escape + lock body scroll while the modal is mounted.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
        <div className="mx-4 w-full max-w-sm animate-[fade-up_0.4s_ease_both]">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10">
              {error.includes("private") ? (
                <Lock className="h-7 w-7 text-amber-500" />
              ) : error.includes("expired") ? (
                <Clock className="h-7 w-7 text-amber-500" />
              ) : (
                <File className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {error.includes("private") ? "Private File" : error.includes("expired") ? "File Expired" : "File Not Found"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-full rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  const Icon = categoryIcons[file.category] || File;
  const color = categoryColors[file.category] || categoryColors.file;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
      <div className="mx-4 w-full max-w-sm animate-[fade-up_0.4s_ease_both]">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-2xl">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30" style={{ background: color }} />
            <div
              className="relative grid h-20 w-20 place-items-center rounded-2xl"
              style={{ background: `color-mix(in oklab, ${color} 15%, transparent)` }}
            >
              <Icon className="h-9 w-9" style={{ color }} />
            </div>
          </div>

          {/* Info */}
          <div className="text-center w-full">
            <h2 className="text-base font-semibold truncate px-2">{file.name}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{file.sizeFormatted}</span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {file.downloads}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(file.createdAt).toLocaleDateString()}
              </span>
            </div>
            {file.isPublic !== undefined && (
              <span className={`mt-2 inline-flex items-center gap-1 text-[11px] ${file.isPublic ? "text-green-500" : "text-amber-500"}`}>
                {file.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {file.isPublic ? "Public file" : "Shared via link"}
              </span>
            )}
            {file.description && (
              <p className="mt-2 text-xs text-muted-foreground/80 px-2">{file.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex w-full gap-2">
            <a
              href={`/api/share/${shareId}?download=true`}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              onClick={copyLink}
              className="grid h-11 w-11 place-items-center rounded-xl border border-border transition-colors hover:bg-foreground/5"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {/* Back link */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
