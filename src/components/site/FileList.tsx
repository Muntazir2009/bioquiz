"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  File,
  Copy,
  Check,
  Trash2,
  Download,
  Pencil,
  X,
  Globe,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  category: string;
  shareId: string;
  downloads: number;
  isPublic: boolean;
  description: string | null;
  uploaderId?: string | null;
  createdAt: string;
  expiresAt: string | null;
};

const categoryIcons: Record<string, LucideIcon> = {
  image: ImageIcon, video: Video, audio: Music, pdf: FileText,
  archive: FileArchive, document: FileText, spreadsheet: FileText,
  presentation: FileText, text: FileText, file: File,
};

const categoryColors: Record<string, string> = {
  image: "oklch(0.75 0.15 200)", video: "oklch(0.7 0.18 300)", audio: "oklch(0.72 0.16 150)",
  pdf: "oklch(0.65 0.2 25)", archive: "oklch(0.68 0.12 60)", document: "oklch(0.7 0.12 250)",
  spreadsheet: "oklch(0.72 0.16 140)", presentation: "oklch(0.75 0.15 30)",
  text: "oklch(0.65 0.1 220)", file: "oklch(0.55 0.08 250)",
};

export function FileList({
  files,
  onDelete,
  onRefresh,
  onToggleVisibility,
  onRename,
  selectedFiles,
  onToggleSelect,
  uploaderId,
}: {
  files: FileItem[];
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  onToggleVisibility?: (id: string, current: boolean) => Promise<void>;
  onRename?: (id: string, newName: string) => Promise<void>;
  selectedFiles?: Set<string>;
  onToggleSelect?: (id: string) => void;
  uploaderId?: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const copyShareLink = useCallback((shareId: string, fileId: string) => {
    const url = `${window.location.origin}?share=${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirmDeleteId === id) {
        setDeletingId(id);
        setConfirmDeleteId(null);
        try {
          await onDelete(id);
        } finally {
          setDeletingId(null);
        }
      } else {
        setConfirmDeleteId(id);
        // Auto-cancel after 3s
        setTimeout(() => setConfirmDeleteId((prev) => prev === id ? null : prev), 3000);
      }
    },
    [onDelete, confirmDeleteId]
  );

  const startRename = useCallback((file: FileItem) => {
    setEditingId(file.id);
    setEditName(file.name);
  }, []);

  const saveRename = useCallback(async (id: string) => {
    if (!editName.trim()) return;
    if (onRename) {
      await onRename(id, editName.trim());
    }
    setEditingId(null);
  }, [editName, onRename]);

  const handleToggleVisibility = useCallback(async (id: string, current: boolean) => {
    if (!onToggleVisibility) return;
    setTogglingId(id);
    try {
      await onToggleVisibility(id, current);
    } finally {
      setTogglingId(null);
    }
  }, [onToggleVisibility]);

  // Check if current user is the owner of a file
  const isOwner = useCallback((file: FileItem) => {
    return uploaderId && file.uploaderId === uploaderId;
  }, [uploaderId]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-foreground/5">
          <File className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No files found</p>
          <p className="mt-1 text-xs text-muted-foreground">Upload a file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {files.map((f) => {
        const Icon = categoryIcons[f.category] || File;
        const color = categoryColors[f.category] || categoryColors.file;
        const isEditing = editingId === f.id;
        const isToggling = togglingId === f.id;
        const owner = isOwner(f);
        const isSelected = selectedFiles?.has(f.id);
        const isConfirmDelete = confirmDeleteId === f.id;

        return (
          <div
            key={f.id}
            className={`group rounded-xl border transition-colors ${
              isSelected ? "border-foreground/20 bg-foreground/[0.03]" : "border-border bg-card hover:bg-foreground/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2 p-2.5">
              {/* Select checkbox */}
              {onToggleSelect && (
                <button
                  onClick={() => onToggleSelect(f.id)}
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${
                    isSelected ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5" />}
                </button>
              )}

              {/* Icon */}
              <div
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename(f.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 flex-1 rounded-md border border-foreground/20 bg-background px-2 text-xs outline-none focus:border-foreground/40"
                      autoFocus
                    />
                    <button
                      onClick={() => saveRename(f.id)}
                      className="grid h-7 w-7 place-items-center rounded-md bg-green-500/10 text-green-500 transition-colors hover:bg-green-500/20"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="grid h-7 w-7 place-items-center rounded-md bg-foreground/5 text-muted-foreground transition-colors hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs font-medium">{f.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground">
                      <span>{f.sizeFormatted}</span>
                      <span>·</span>
                      <span>{f.downloads} dl</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span className={`flex items-center gap-0.5 ${f.isPublic ? "text-green-500/80" : "text-amber-500/80"}`}>
                        {f.isPublic ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                        {f.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div className="flex items-center gap-0.5">
                  {/* Visibility toggle - only for owners */}
                  {owner && onToggleVisibility && (
                    <button
                      onClick={() => handleToggleVisibility(f.id, f.isPublic)}
                      disabled={isToggling}
                      className={`grid h-7 w-7 place-items-center rounded-md transition-colors disabled:opacity-40 ${
                        f.isPublic
                          ? "text-green-500/70 hover:bg-green-500/10 hover:text-green-500"
                          : "text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500"
                      }`}
                      title={f.isPublic ? "Make private" : "Make public"}
                    >
                      {isToggling ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : f.isPublic ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  {/* Rename - only for owners */}
                  {owner && onRename && (
                    <button
                      onClick={() => startRename(f)}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                      title="Rename"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => copyShareLink(f.shareId, f.id)}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    title="Copy share link"
                  >
                    {copiedId === f.id ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <a
                    href={`/api/share/${f.shareId}?download=true`}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                  {/* Delete - only for owners */}
                  {owner && (
                    <button
                      onClick={() => handleDelete(f.id)}
                      disabled={deletingId === f.id}
                      className={`grid h-7 w-7 place-items-center rounded-md transition-colors disabled:opacity-40 ${
                        isConfirmDelete
                          ? "bg-red-500/20 text-red-500"
                          : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      }`}
                      title={isConfirmDelete ? "Click again to confirm" : "Delete"}
                    >
                      {deletingId === f.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
