"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// socket.io-client removed — using polling for Cloudflare compatibility
import {
  ShieldCheck, HardDrive, Files, Download, Trash2, Search, Lock,
  Pencil, Check, X, ArrowLeft, BarChart3, Eye, EyeOff, Filter,
  RefreshCw, Copy, Globe, FileText, Image as ImageIcon, Video,
  Music, FileArchive, File, Activity, Trash, LogOut, Calendar,
  Hash, CopyPlus, Database, TrendingUp, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminStats = {
  totalFiles: number; totalSize: number; totalSizeFormatted: string;
  totalDownloads: number; publicFiles: number; privateFiles: number;
};

type CategoryInfo = { category: string; count: number; size: number; sizeFormatted: string; };

type UploadDay = { date: string; count: number; size: number; };

type AdminFile = {
  id: string; name: string; size: number; sizeFormatted: string;
  mimeType: string; category: string; shareId: string; downloads: number;
  isPublic: boolean; description: string | null; createdAt: string; expiresAt: string | null;
};

type AdminData = { stats: AdminStats; categoryDistribution: CategoryInfo[]; uploadsByDay: UploadDay[]; recentFiles: AdminFile[]; };

type StorageInfo = {
  disk: { used: number; usedFormatted: string; filesOnDisk: number; };
  typeBreakdown: { type: string; count: number; size: number; sizeFormatted: string; downloads: number; }[];
  topDownloaded: { id: string; name: string; downloads: number; sizeFormatted: string; }[];
  largest: { id: string; name: string; size: number; sizeFormatted: string; category: string; }[];
};

type Tab = "overview" | "files" | "storage";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [data, setData] = useState<AdminData | null>(null);
  const [storageData, setStorageData] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  // File management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Realtime via polling (Cloudflare Workers compatible — no WebSocket server needed)
  const [wsConnected, setWsConnected] = useState(true); // always "connected" via polling

  // ─── Auth ────────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setIsAuthed(true); sessionStorage.setItem("admin-auth", password); }
      else setAuthError("Invalid password");
    } catch { setAuthError("Connection failed"); }
    finally { setAuthLoading(false); }
  }, [password]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "0613") { queueMicrotask(() => { setIsAuthed(true); setPassword(saved); }); }
  }, []);

  // ─── Fetch data ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const [mainRes, storageRes] = await Promise.all([
        fetch("/api/admin", { headers: { "x-admin-password": pwd } }),
        fetch("/api/admin/storage", { headers: { "x-admin-password": pwd } }),
      ]);
      if (mainRes.ok) setData(await mainRes.json());
      else if (mainRes.status === 401) { setIsAuthed(false); sessionStorage.removeItem("admin-auth"); }
      else { /* Server error (e.g. DB not configured) — don't log out, just show empty state */ }
      if (storageRes.ok) setStorageData(await storageRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthed) { queueMicrotask(() => fetchData()); } }, [isAuthed, fetchData]);

  // ─── Polling (replaces WebSocket) ────────────────────────────────────────

  useEffect(() => {
    if (!isAuthed) return;
    const interval = setInterval(() => { fetchData(); }, 10000); // poll every 10s
    return () => { clearInterval(interval); };
  }, [isAuthed, fetchData]);

  // ─── File operations ─────────────────────────────────────────────────────

  const getPwd = useCallback(() => password || sessionStorage.getItem("admin-auth") || "", [password]);

  const togglePublic = useCallback(async (id: string, current: boolean) => {
    await fetch(`/api/files/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ isPublic: !current }) });
    fetchData();
  }, [getPwd, fetchData]);

  const renameFile = useCallback(async (id: string, newName: string) => {
    if (!newName.trim()) return;
    await fetch(`/api/files/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ originalName: newName.trim() }) });
    setEditingId(null); fetchData();
  }, [getPwd, fetchData]);

  const updateDescription = useCallback(async (id: string, desc: string) => {
    await fetch(`/api/files/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ description: desc }) });
    fetchData();
  }, [getPwd, fetchData]);

  const deleteFile = useCallback(async (id: string) => {
    await fetch(`/api/files/${id}`, { method: "DELETE", headers: { "x-admin-password": getPwd() } });
    fetchData();
  }, [getPwd, fetchData]);

  const duplicateFile = useCallback(async (id: string) => {
    await fetch("/api/files/duplicate", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ id }) });
    fetchData();
  }, [getPwd, fetchData]);

  const bulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    await fetch("/api/admin/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ ids: Array.from(selectedFiles) }) });
    setSelectedFiles(new Set()); fetchData();
  }, [getPwd, selectedFiles, fetchData]);

  const bulkToggleVisibility = useCallback(async (makePublic: boolean) => {
    if (selectedFiles.size === 0) return;
    await Promise.all(Array.from(selectedFiles).map((id) =>
      fetch(`/api/files/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": getPwd() }, body: JSON.stringify({ isPublic: makePublic }) })
    ));
    fetchData();
  }, [getPwd, selectedFiles, fetchData]);

  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const copyShareLink = useCallback((shareId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}?share=${shareId}`);
    setCopiedShareId(shareId);
    setTimeout(() => setCopiedShareId(null), 2000);
  }, []);

  // ─── Filtered files ──────────────────────────────────────────────────────

  const getFilteredFiles = useCallback(() => {
    if (!data) return [];
    let files = [...data.recentFiles];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      files = files.filter((f) => f.name.toLowerCase().includes(q) || f.mimeType.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q)));
    }
    if (selectedCategory !== "all") files = files.filter((f) => f.category === selectedCategory);
    if (sortBy === "newest") files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "oldest") files.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "name") files.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "size") files.sort((a, b) => b.size - a.size);
    else if (sortBy === "downloads") files.sort((a, b) => b.downloads - a.downloads);
    return files;
  }, [data, searchQuery, selectedCategory, sortBy]);

  const filteredFiles = getFilteredFiles();

  const toggleSelectAll = useCallback(() => {
    const filtered = getFilteredFiles();
    if (selectedFiles.size === filtered.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(filtered.map((f) => f.id)));
  }, [selectedFiles, getFilteredFiles]);

  const logout = useCallback(() => { setIsAuthed(false); sessionStorage.removeItem("admin-auth"); setPassword(""); }, []);

  // ─── Login Screen ────────────────────────────────────────────────────────

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm mx-4 animate-[fade-up_0.5s_ease_both]">
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-foreground/5 blur-xl" />
                <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-foreground/[0.07] border border-foreground/10">
                  <ShieldCheck className="h-7 w-7 text-muted-foreground" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Authenticate to manage your workspace</p>
              </div>
              <div className="w-full space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Enter admin password"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5" autoFocus />
                </div>
                {authError && <p className="text-xs text-red-500 animate-[fade-up_0.2s_ease_both]">{authError}</p>}
                <button onClick={handleLogin} disabled={authLoading || !password}
                  className="h-11 w-full rounded-xl bg-foreground text-background text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40 active:scale-[0.98]">
                  {authLoading ? <span className="flex items-center justify-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />Verifying...</span> : "Access Panel"}
                </button>
              </div>
              <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-3 w-3" />Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-[11px] font-semibold">B</div>
              <span className="text-sm font-medium">Admin</span>
              <span className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">PROTECTED</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`} />
              {wsConnected ? "Polling" : "Offline"}
            </span>
            <button onClick={() => fetchData()} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl gap-1 px-6 pt-2">
          {([
            { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
            { id: "files" as Tab, label: "Files", icon: Files },
            { id: "storage" as Tab, label: "Storage", icon: Database },
          ]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {loading && !data ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        ) : data ? (
          <div className="flex flex-col gap-8">
            {/* ─── OVERVIEW TAB ─────────────────────────────────────────── */}
            {tab === "overview" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard icon={Files} label="Total Files" value={String(data.stats.totalFiles)} color="oklch(0.7 0.12 250)" />
                  <StatCard icon={HardDrive} label="Storage Used" value={data.stats.totalSizeFormatted} color="oklch(0.72 0.16 150)" />
                  <StatCard icon={Download} label="Downloads" value={String(data.stats.totalDownloads)} color="oklch(0.75 0.15 200)" />
                  <StatCard icon={Globe} label="Public" value={String(data.stats.publicFiles)} color="oklch(0.72 0.16 140)" />
                  <StatCard icon={Lock} label="Private" value={String(data.stats.privateFiles)} color="oklch(0.65 0.1 220)" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Distribution */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">Storage by Category</h2>
                    </div>
                    <div className="space-y-3">
                      {data.categoryDistribution.map((cat) => {
                        const pct = data.stats.totalSize > 0 ? (cat.size / data.stats.totalSize) * 100 : 0;
                        const color = categoryColors[cat.category] || categoryColors.file;
                        return (
                          <div key={cat.category} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize font-medium">{cat.category}</span>
                              <span className="text-muted-foreground">{cat.sizeFormatted} · {cat.count} file{cat.count !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })}
                      {data.categoryDistribution.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
                    </div>
                  </div>

                  {/* Upload Activity */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">Upload Activity (7 days)</h2>
                    </div>
                    <div className="space-y-3">
                      {data.uploadsByDay.map((day) => {
                        const maxCount = Math.max(...data.uploadsByDay.map((d) => d.count), 1);
                        const pct = (day.count / maxCount) * 100;
                        return (
                          <div key={day.date} className="flex items-center gap-3">
                            <span className="text-[11px] text-muted-foreground w-20 shrink-0 tabular-nums">
                              {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <div className="flex-1 h-6 overflow-hidden rounded-md bg-foreground/5">
                              <div className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                                style={{ width: `${Math.max(pct, 8)}%`, background: "oklch(0.7 0.12 250 / 0.6)" }}>
                                <span className="text-[10px] font-medium text-background whitespace-nowrap">{day.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {data.uploadsByDay.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No uploads in the last 7 days</p>}
                    </div>
                  </div>
                </div>

                {/* Quick stats: Top Downloaded */}
                {storageData && storageData.topDownloaded.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">Top Downloaded</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {storageData.topDownloaded.map((f, i) => (
                        <div key={f.id} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                          <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{f.downloads} dl · {f.sizeFormatted}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─── FILES TAB ────────────────────────────────────────────── */}
            {tab === "files" && (
              <div className="rounded-2xl border border-border bg-card">
                {/* File Management Header */}
                <div className="flex flex-col gap-4 p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">File Management</h2>
                      <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedFiles.size > 0 && (
                        <>
                          <button onClick={() => bulkToggleVisibility(true)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium transition-colors hover:bg-green-500/20">
                            <Globe className="h-3.5 w-3.5" />Make public
                          </button>
                          <button onClick={() => bulkToggleVisibility(false)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium transition-colors hover:bg-amber-500/20">
                            <Lock className="h-3.5 w-3.5" />Make private
                          </button>
                          <button onClick={bulkDelete}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/20">
                            <Trash className="h-3.5 w-3.5" />Delete ({selectedFiles.size})
                          </button>
                        </>
                      )}
                      <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                          showFilters ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"
                        }`}>
                        <Filter className="h-3.5 w-3.5" />Filters
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files by name, type, or description..."
                      className="h-10 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {showFilters && (
                    <div className="flex flex-wrap gap-3 animate-[fade-up_0.2s_ease_both]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Category:</span>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30">
                          <option value="all">All</option>
                          {data.categoryDistribution.map((cat) => (<option key={cat.category} value={cat.category} className="capitalize">{cat.category}</option>))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Sort:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                          className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30">
                          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
                          <option value="name">Name A-Z</option><option value="size">Largest first</option>
                          <option value="downloads">Most downloads</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Select All */}
                {filteredFiles.length > 0 && (
                  <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-foreground/[0.01]">
                    <button onClick={toggleSelectAll}
                      className={`grid h-5 w-5 place-items-center rounded border transition-colors ${
                        selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"
                      }`}>
                      {selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 && <Check className="h-3 w-3" />}
                    </button>
                    <span className="text-[11px] text-muted-foreground">Select all ({filteredFiles.length})</span>
                  </div>
                )}

                {/* File List */}
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><File className="h-5 w-5 text-muted-foreground" /></div>
                      <div><p className="text-sm font-medium">No files found</p><p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery || selectedCategory !== "all" ? "Try adjusting your filters" : "Upload files to get started"}</p></div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredFiles.map((f) => {
                        const Icon = categoryIcons[f.category] || File;
                        const color = categoryColors[f.category] || categoryColors.file;
                        const isSelected = selectedFiles.has(f.id);
                        const isEditing = editingId === f.id;
                        return (
                          <div key={f.id} className={`flex items-start gap-3 px-6 py-4 transition-colors ${isSelected ? "bg-foreground/[0.03]" : "hover:bg-foreground/[0.01]"}`}>
                            <button onClick={() => { const next = new Set(selectedFiles); if (next.has(f.id)) next.delete(f.id); else next.add(f.id); setSelectedFiles(next); }}
                              className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${isSelected ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}>
                              <Icon className="h-4 w-4" style={{ color }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter") renameFile(f.id, editName); if (e.key === "Escape") setEditingId(null); }}
                                      className="h-8 flex-1 rounded-lg border border-foreground/20 bg-background px-3 text-sm outline-none focus:border-foreground/40" autoFocus />
                                    <button onClick={() => renameFile(f.id, editName)} className="grid h-8 w-8 place-items-center rounded-lg bg-green-500/10 text-green-500 transition-colors hover:bg-green-500/20"><Check className="h-4 w-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5 text-muted-foreground transition-colors hover:bg-foreground/10"><X className="h-4 w-4" /></button>
                                  </div>
                                  <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { updateDescription(f.id, editDesc); setEditingId(null); } }}
                                    placeholder="Add description (optional)"
                                    className="h-7 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30" />
                                </div>
                              ) : (
                                <>
                                  <p className="truncate text-sm font-medium">{f.name}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                    <span>{f.sizeFormatted}</span>
                                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{f.downloads}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(f.createdAt).toLocaleDateString()}</span>
                                    <span className={`flex items-center gap-1 ${f.isPublic ? "text-green-500" : "text-amber-500"}`}>
                                      {f.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                      {f.isPublic ? "Public" : "Private"}
                                    </span>
                                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{f.category}</span>
                                  </div>
                                  {f.description && <p className="mt-1 text-[11px] text-muted-foreground/80 truncate">{f.description}</p>}
                                </>
                              )}
                            </div>
                            {!isEditing && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => togglePublic(f.id, f.isPublic)}
                                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${f.isPublic ? "text-green-500 hover:bg-green-500/10" : "text-amber-500 hover:bg-amber-500/10"}`}
                                  title={f.isPublic ? "Make private" : "Make public"}>
                                  {f.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <button onClick={() => { setEditingId(f.id); setEditName(f.name); setEditDesc(f.description || ""); }}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={() => duplicateFile(f.id)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Duplicate">
                                  <CopyPlus className="h-4 w-4" />
                                </button>
                                <button onClick={() => copyShareLink(f.shareId)}
                                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${copiedShareId === f.shareId ? "bg-green-500/10 text-green-500" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`} title="Copy share link">
                                  {copiedShareId === f.shareId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                                <button onClick={() => deleteFile(f.id)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── STORAGE TAB ──────────────────────────────────────────── */}
            {tab === "storage" && (
              storageData ? (
              <div className="flex flex-col gap-6">
                {/* Disk usage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={HardDrive} label="Disk Usage" value={storageData.disk.usedFormatted} color="oklch(0.72 0.16 150)" />
                  <StatCard icon={Files} label="Files on Disk" value={String(storageData.disk.filesOnDisk)} color="oklch(0.7 0.12 250)" />
                  <StatCard icon={Zap} label="Avg Size" value={storageData.disk.filesOnDisk > 0 ? formatFileSize(storageData.disk.used / storageData.disk.filesOnDisk) : "0 B"} color="oklch(0.75 0.15 200)" />
                </div>

                {/* Type breakdown */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Type Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2.5 font-medium text-muted-foreground">Type</th>
                          <th className="text-right py-2.5 font-medium text-muted-foreground">Files</th>
                          <th className="text-right py-2.5 font-medium text-muted-foreground">Size</th>
                          <th className="text-right py-2.5 font-medium text-muted-foreground">Downloads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storageData.typeBreakdown.map((row) => (
                          <tr key={row.type} className="border-b border-border/50">
                            <td className="py-2.5 capitalize font-medium">{row.type}</td>
                            <td className="text-right py-2.5 tabular-nums">{row.count}</td>
                            <td className="text-right py-2.5 tabular-nums">{row.sizeFormatted}</td>
                            <td className="text-right py-2.5 tabular-nums">{row.downloads}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Largest files */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Largest Files</h2>
                  </div>
                  <div className="space-y-2">
                    {storageData.largest.map((f) => {
                      const Icon = categoryIcons[f.category] || File;
                      const color = categoryColors[f.category] || categoryColors.file;
                      return (
                        <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                          <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}>
                            <Icon className="h-3.5 w-3.5" style={{ color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{f.name}</p>
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">{f.sizeFormatted}</span>
                        </div>
                      );
                    })}
                    {storageData.largest.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No files yet</p>}
                  </div>
                </div>
              </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><Database className="h-5 w-5 text-muted-foreground" /></div>
                  <div><p className="text-sm font-medium">Storage data unavailable</p><p className="mt-1 text-xs text-muted-foreground">Could not load storage analytics. Database may not be configured.</p></div>
                </div>
              )
            )}
          </div>
        ) : null}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-6">
          <div className="grid h-5 w-5 place-items-center rounded-md bg-foreground text-background text-[9px] font-semibold">B</div>
          <span className="text-[11px] text-muted-foreground">&copy; {new Date().getFullYear()} BioQuiz Admin &mdash; Protected workspace</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/10">
      <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
