"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  X,
  Upload,
  FolderOpen,
  Search,
  Filter,
  RefreshCw,
  CloudUpload,
  HardDrive,
  Trash2,
  Globe,
  Lock,
  Check,
} from "lucide-react";
import { FileUploadZone } from "./FileUploadZone";
import { FileList, type FileItem } from "./FileList";
import { getUploaderId } from "@/lib/session";

type Tab = "upload" | "files";

/**
 * Floating FilePanel — Cloudflare-compatible version.
 * Uses polling instead of WebSocket for real-time updates.
 */
export function FilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("upload");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploaderId = typeof window !== "undefined" ? getUploaderId() : "";

  // Build auth headers
  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {};
    if (uploaderId) headers["x-uploader-id"] = uploaderId;
    if (typeof window !== "undefined") {
      const adminAuth = sessionStorage.getItem("admin-auth");
      if (adminAuth === "0613") headers["x-admin-password"] = "0613";
    }
    return headers;
  }, [uploaderId]);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }, [getHeaders]);

  // Initial fetch + polling when panel opens.
  // Polling pauses when the tab is hidden so background tabs don't hammer the API.
  useEffect(() => {
    if (!open) return;

    // Use queueMicrotask so the first fetch doesn't block paint on the panel-open animation.
    queueMicrotask(() => fetchFiles());

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        fetchFiles();
      }, 5000);
    };
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Refresh immediately on focus, then resume polling.
        fetchFiles();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [open, fetchFiles]);

  // Close on Escape — standard modal behavior.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while the panel is open so the background doesn't scroll
  // under it on mobile.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Delete a single file
  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSelectedFiles((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }, [getHeaders]);

  // Batch delete
  const handleBatchDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    const ids = Array.from(selectedFiles);
    await Promise.all(ids.map((id) =>
      fetch(`/api/files/${id}`, { method: "DELETE", headers: getHeaders() })
    ));
    setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  }, [selectedFiles, getHeaders]);

  // Toggle visibility
  const toggleVisibility = useCallback(async (id: string, current: boolean) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getHeaders() },
      body: JSON.stringify({ isPublic: !current }),
    });
    if (res.ok) {
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, isPublic: !current } : f));
    }
  }, [getHeaders]);

  // Rename
  const handleRename = useCallback(async (id: string, newName: string) => {
    if (!newName.trim()) return;
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getHeaders() },
      body: JSON.stringify({ originalName: newName.trim() }),
    });
    if (res.ok) {
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: newName.trim() } : f));
    }
  }, [getHeaders]);

  const handleUploadComplete = useCallback(() => {
    setTab("files");
    fetchFiles();
  }, [fetchFiles]);

  // Filtered & sorted files
  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.mimeType.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((f) => f.category === categoryFilter);
    }
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "size") result.sort((a, b) => b.size - a.size);
    else if (sortBy === "downloads") result.sort((a, b) => b.downloads - a.downloads);
    return result;
  }, [files, searchQuery, categoryFilter, sortBy]);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  }, [selectedFiles, filteredFiles]);

  const categories = useMemo(() => [...new Set(files.map((f) => f.category))].sort(), [files]);

  // Storage stats
  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const publicCount = useMemo(() => files.filter((f) => f.isPublic).length, [files]);
  const privateCount = useMemo(() => files.filter((f) => !f.isPublic).length, [files]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop — clicking it closes the panel. aria-hidden because the
          panel itself announces via role=dialog. */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Floating panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Files panel"
        className="file-panel-floating fixed z-50 flex flex-col rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-foreground/5">
              <CloudUpload className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Files</h2>
              <p className="text-[10px] text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${connected ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} aria-hidden />
            <button
              onClick={() => fetchFiles()}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              title="Refresh"
              aria-label="Refresh file list"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label="Close files panel"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Storage bar */}
        <div className="border-b border-border px-5 py-2.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />Storage</span>
            <span>{formatSize(totalSize)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
            {publicCount > 0 && (
              <div
                className="h-full rounded-full bg-green-500/50"
                style={{ width: `${files.length > 0 ? (publicCount / files.length) * 100 : 0}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[9px]">
            <span className="flex items-center gap-1 text-green-500/80"><Globe className="h-2.5 w-2.5" />{publicCount} public</span>
            <span className="flex items-center gap-1 text-amber-500/80"><Lock className="h-2.5 w-2.5" />{privateCount} private</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {([
            { id: "upload" as Tab, label: "Upload", icon: Upload },
            { id: "files" as Tab, label: "Files", icon: FolderOpen },
          ]).map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {t.id === "files" && files.length > 0 && (
                  <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] tabular-nums">{files.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Batch actions bar */}
        {tab === "files" && selectedFiles.size > 0 && (
          <div className="flex items-center justify-between border-b border-border bg-foreground/[0.02] px-5 py-2 animate-[fade-up_0.15s_ease_both]">
            <span className="text-[11px] text-muted-foreground">{selectedFiles.size} selected</span>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-red-500/10 text-red-500 text-[11px] font-medium transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />Delete
            </button>
          </div>
        )}

        {/* Search bar for files tab */}
        {tab === "files" && (
          <div className="border-b border-border px-4 py-2.5 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="h-8 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none transition-all focus:border-foreground/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    showFilters ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  Filters
                </button>
                {filteredFiles.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className={`grid h-3.5 w-3.5 place-items-center rounded border transition-colors ${
                      selectedFiles.size === filteredFiles.length ? "bg-foreground text-background border-foreground" : "border-border"
                    }`}>
                      {selectedFiles.size === filteredFiles.length && <Check className="h-2 w-2" />}
                    </div>
                    All
                  </button>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {filteredFiles.length} of {files.length}
              </span>
            </div>
            {showFilters && (
              <div className="flex gap-2 animate-[fade-up_0.15s_ease_both]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-7 rounded-md border border-border bg-background px-2 text-[11px] outline-none focus:border-foreground/30"
                >
                  <option value="all">All types</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-7 rounded-md border border-border bg-background px-2 text-[11px] outline-none focus:border-foreground/30"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="downloads">Downloads</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "50vh" }}>
          {tab === "upload" && (
            <FileUploadZone onUploadComplete={handleUploadComplete} uploaderId={uploaderId} />
          )}
          {tab === "files" && (
            <FileList
              files={filteredFiles}
              onDelete={handleDelete}
              onRefresh={fetchFiles}
              onToggleVisibility={toggleVisibility}
              onRename={handleRename}
              selectedFiles={selectedFiles}
              onToggleSelect={(id) => {
                setSelectedFiles((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
              uploaderId={uploaderId}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
            <p className="text-[10px] text-muted-foreground">
              {connected ? "Connected" : "Connecting..."}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </>
  );
}
