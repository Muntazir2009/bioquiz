"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
// socket.io-client removed — using polling for Cloudflare compatibility
import {
  ShieldCheck, HardDrive, Files, Download, Trash2, Search, Lock,
  Pencil, Check, X, ArrowLeft, BarChart3, Eye, EyeOff, Filter,
  RefreshCw, Copy, Globe, FileText, Image as ImageIcon, Video,
  Music, FileArchive, File, Activity, Trash, LogOut, Calendar,
  Hash, CopyPlus, Database, TrendingUp, Zap, MessageSquare,
  Settings, RotateCcw, Users, Palette, SlidersHorizontal, Shield,
  Save, Upload, Bell, Volume2, Smartphone, Wrench, AlertTriangle,
  Type, MessageCircle,
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

type WidgetConfig = {
  widgetEnabled?: boolean;
  disguiseEnabled?: boolean;
  autoOpen?: boolean;
  autoOpenDelay?: number;
  defaultTheme?: string;
  accentColor?: string;
  widgetPosition?: string;
  bubbleSize?: number;
  panelWidth?: number;
  panelHeight?: number;
  charLimit?: number;
  maxMessages?: number;
  fontSize?: string;
  profanityFilter?: boolean;
  slowMode?: boolean;
  slowModeInterval?: number;
  rateLimitEnabled?: boolean;
  linkFilter?: boolean;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementColor?: string;
  maintenanceEnabled?: boolean;
  maintenanceMessage?: string;
  [key: string]: unknown;
};

type PresenceUser = {
  uid: string;
  ts?: number;
  name?: string;
  status?: string;
  [key: string]: unknown;
};

type RecentMessage = {
  ts?: number;
  text?: string;
  sender?: string;
  system?: boolean;
  [key: string]: unknown;
};

type ActivityData = {
  onlineUsers: PresenceUser[];
  onlineCount: number;
  recentMessages: RecentMessage[];
  totalMessages: number;
};

type Tab = "overview" | "files" | "storage" | "widget" | "activity" | "settings";

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

const defaultWidgetConfig: WidgetConfig = {
  widgetEnabled: true,
  disguiseEnabled: false,
  autoOpen: false,
  autoOpenDelay: 0,
  defaultTheme: "pure-black",
  accentColor: "#ffffff",
  widgetPosition: "bottom-right",
  bubbleSize: 56,
  panelWidth: 380,
  panelHeight: 600,
  charLimit: 500,
  maxMessages: 50,
  fontSize: "medium",
  profanityFilter: true,
  slowMode: false,
  slowModeInterval: 5,
  rateLimitEnabled: true,
  linkFilter: false,
  announcementEnabled: false,
  announcementText: "",
  announcementColor: "#f59e0b",
  maintenanceEnabled: false,
  maintenanceMessage: "",
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

  // Widget config
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(defaultWidgetConfig);
  const [widgetConfigLoading, setWidgetConfigLoading] = useState(false);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Activity
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  // Widget refresh toast
  const [widgetRefreshToast, setWidgetRefreshToast] = useState(false);

  // Settings
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [pushNotifications, setPushNotifications] = useState(false);
  const [soundOnMessage, setSoundOnMessage] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

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

  // ─── Widget Config ─────────────────────────────────────────────────────

  const fetchWidgetConfig = useCallback(async () => {
    setWidgetConfigLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch("/api/admin/widget-config", { headers: { "x-admin-password": pwd } });
      if (res.ok) {
        const json = await res.json();
        setWidgetConfig({ ...defaultWidgetConfig, ...(json.config || {}) });
      }
    } catch { /* ignore */ }
    finally { setWidgetConfigLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthed && tab === "widget") { queueMicrotask(() => fetchWidgetConfig()); } }, [isAuthed, tab, fetchWidgetConfig]);

  const writeWidgetConfig = useCallback((key: string, value: unknown) => {
    setWidgetConfig((prev) => {
      const updated = { ...prev, [key]: value };
      // Show sync indicator
      setSyncingKey(key);
      // Debounce the API write
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const pwd = password || sessionStorage.getItem("admin-auth") || "";
        try {
          await fetch("/api/admin/widget-config", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin-password": pwd },
            body: JSON.stringify({ [key]: value }),
          });
        } catch { /* ignore */ }
        setSyncingKey(null);
      }, 300);
      return updated;
    });
  }, [password]);

  // ─── Activity ──────────────────────────────────────────────────────────

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch("/api/admin/activity", { headers: { "x-admin-password": pwd } });
      if (res.ok) setActivityData(await res.json());
    } catch { /* ignore */ }
    finally { setActivityLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthed && tab === "activity") { queueMicrotask(() => fetchActivity()); } }, [isAuthed, tab, fetchActivity]);

  // Auto-refresh activity every 10 seconds
  useEffect(() => {
    if (!isAuthed || tab !== "activity") return;
    const interval = setInterval(() => { fetchActivity(); }, 10000);
    return () => { clearInterval(interval); };
  }, [isAuthed, tab, fetchActivity]);

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

  // ─── Widget Refresh ────────────────────────────────────────────────────

  const handleWidgetRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent("bq-admin-refresh"));
    // Also force-reload the script
    const oldScript = document.getElementById("bq-chat-script");
    if (oldScript) oldScript.remove();
    const oldBubble = document.getElementById("bqb");
    if (oldBubble) oldBubble.remove();
    const oldPanel = document.getElementById("bqp");
    if (oldPanel) oldPanel.remove();
    // Re-create script tag with cache-bust
    const script = document.createElement("script");
    script.id = "bq-chat-script";
    script.src = `/chat-widget.js?t=${Date.now()}`;
    document.body.appendChild(script);
    setWidgetRefreshToast(true);
    setTimeout(() => setWidgetRefreshToast(false), 2000);
  }, []);

  // ─── Settings: Export/Import/Reset ─────────────────────────────────────

  const handleExportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(widgetConfig, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bioquiz-widget-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [widgetConfig]);

  const handleImportConfig = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      setWidgetConfig({ ...defaultWidgetConfig, ...config });
      const pwd = password || sessionStorage.getItem("admin-auth") || "";
      await fetch("/api/admin/widget-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": pwd },
        body: JSON.stringify(config),
      });
    } catch { /* ignore invalid JSON */ }
    e.target.value = "";
  }, [password]);

  const handleResetDefaults = useCallback(async () => {
    setWidgetConfig(defaultWidgetConfig);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    await fetch("/api/admin/widget-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd },
      body: JSON.stringify(defaultWidgetConfig),
    });
    setShowResetConfirm(false);
  }, [password]);

  const handlePasswordChange = useCallback(() => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    setPasswordMsg("Password updated locally");
    sessionStorage.setItem("admin-auth", newPassword);
    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMsg(""), 3000);
  }, [newPassword, confirmPassword]);

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
      {/* Widget Refresh Toast */}
      {widgetRefreshToast && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-up_0.2s_ease_both] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium">Widget refreshed</span>
        </div>
      )}

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
            <button onClick={handleWidgetRefresh} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Widget">
              <RotateCcw className="h-4 w-4" />
            </button>
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
      <div className="border-b border-border bg-background/50 backdrop-blur-sm overflow-x-auto">
        <div className="mx-auto flex max-w-7xl gap-1 px-6 pt-2">
          {([
            { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
            { id: "files" as Tab, label: "Files", icon: Files },
            { id: "storage" as Tab, label: "Storage", icon: Database },
            { id: "widget" as Tab, label: "Widget", icon: MessageSquare },
            { id: "activity" as Tab, label: "Activity", icon: Activity },
            { id: "settings" as Tab, label: "Settings", icon: Settings },
          ]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
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

            {/* ─── WIDGET TAB ────────────────────────────────────────────── */}
            {tab === "widget" && (
              <div className="flex flex-col gap-6">
                {widgetConfigLoading && !widgetConfig ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Section: General */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">General</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigToggle label="Widget Enabled" value={widgetConfig.widgetEnabled ?? true} syncing={syncingKey === "widgetEnabled"} onChange={(v) => writeWidgetConfig("widgetEnabled", v)} />
                        <ConfigToggle label="Disguise Mode" value={widgetConfig.disguiseEnabled ?? false} syncing={syncingKey === "disguiseEnabled"} onChange={(v) => writeWidgetConfig("disguiseEnabled", v)} />
                        <ConfigToggle label="Auto Open" value={widgetConfig.autoOpen ?? false} syncing={syncingKey === "autoOpen"} onChange={(v) => writeWidgetConfig("autoOpen", v)} />
                        <ConfigSlider label="Auto Open Delay" value={widgetConfig.autoOpenDelay ?? 0} min={0} max={10} step={1} unit="s" syncing={syncingKey === "autoOpenDelay"} onChange={(v) => writeWidgetConfig("autoOpenDelay", v)} />
                      </div>
                    </div>

                    {/* Section: Appearance */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Appearance</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigSelect label="Default Theme" value={widgetConfig.defaultTheme ?? "pure-black"} options={[{ value: "pure-black", label: "Pure Black" }, { value: "golden", label: "Golden" }]} syncing={syncingKey === "defaultTheme"} onChange={(v) => writeWidgetConfig("defaultTheme", v)} />
                        <ConfigColorPicker label="Accent Color" value={widgetConfig.accentColor ?? "#ffffff"} syncing={syncingKey === "accentColor"} onChange={(v) => writeWidgetConfig("accentColor", v)} />
                        <ConfigSelect label="Widget Position" value={widgetConfig.widgetPosition ?? "bottom-right"} options={[{ value: "bottom-right", label: "Bottom Right" }, { value: "bottom-left", label: "Bottom Left" }, { value: "top-right", label: "Top Right" }, { value: "top-left", label: "Top Left" }]} syncing={syncingKey === "widgetPosition"} onChange={(v) => writeWidgetConfig("widgetPosition", v)} />
                        <ConfigSlider label="Bubble Size" value={widgetConfig.bubbleSize ?? 56} min={40} max={72} step={2} unit="px" syncing={syncingKey === "bubbleSize"} onChange={(v) => writeWidgetConfig("bubbleSize", v)} />
                        <ConfigSlider label="Panel Width" value={widgetConfig.panelWidth ?? 380} min={300} max={500} step={10} unit="px" syncing={syncingKey === "panelWidth"} onChange={(v) => writeWidgetConfig("panelWidth", v)} />
                        <ConfigSlider label="Panel Height" value={widgetConfig.panelHeight ?? 600} min={400} max={800} step={10} unit="px" syncing={syncingKey === "panelHeight"} onChange={(v) => writeWidgetConfig("panelHeight", v)} />
                      </div>
                    </div>

                    {/* Section: Messages */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Messages</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigSlider label="Character Limit" value={widgetConfig.charLimit ?? 500} min={100} max={1000} step={10} unit="" syncing={syncingKey === "charLimit"} onChange={(v) => writeWidgetConfig("charLimit", v)} />
                        <ConfigSlider label="Max Messages" value={widgetConfig.maxMessages ?? 50} min={20} max={100} step={5} unit="" syncing={syncingKey === "maxMessages"} onChange={(v) => writeWidgetConfig("maxMessages", v)} />
                        <ConfigSelect label="Font Size" value={widgetConfig.fontSize ?? "medium"} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} syncing={syncingKey === "fontSize"} onChange={(v) => writeWidgetConfig("fontSize", v)} />
                      </div>
                    </div>

                    {/* Section: Features */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Features</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigToggle label="Profanity Filter" value={widgetConfig.profanityFilter ?? true} syncing={syncingKey === "profanityFilter"} onChange={(v) => writeWidgetConfig("profanityFilter", v)} />
                        <ConfigToggle label="Slow Mode" value={widgetConfig.slowMode ?? false} syncing={syncingKey === "slowMode"} onChange={(v) => writeWidgetConfig("slowMode", v)} />
                        {widgetConfig.slowMode && (
                          <ConfigSlider label="Slow Mode Interval" value={widgetConfig.slowModeInterval ?? 5} min={1} max={60} step={1} unit="s" syncing={syncingKey === "slowModeInterval"} onChange={(v) => writeWidgetConfig("slowModeInterval", v)} />
                        )}
                        <ConfigToggle label="Rate Limiting" value={widgetConfig.rateLimitEnabled ?? true} syncing={syncingKey === "rateLimitEnabled"} onChange={(v) => writeWidgetConfig("rateLimitEnabled", v)} />
                        <ConfigToggle label="Link Filter" value={widgetConfig.linkFilter ?? false} syncing={syncingKey === "linkFilter"} onChange={(v) => writeWidgetConfig("linkFilter", v)} />
                      </div>
                    </div>

                    {/* Section: Announcements */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Announcements</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigToggle label="Announcement Enabled" value={widgetConfig.announcementEnabled ?? false} syncing={syncingKey === "announcementEnabled"} onChange={(v) => writeWidgetConfig("announcementEnabled", v)} />
                        <ConfigColorPicker label="Announcement Color" value={widgetConfig.announcementColor ?? "#f59e0b"} syncing={syncingKey === "announcementColor"} onChange={(v) => writeWidgetConfig("announcementColor", v)} />
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Announcement Text</span>
                            {syncingKey === "announcementText" && <SyncIndicator />}
                          </div>
                          <input type="text" value={widgetConfig.announcementText ?? ""} maxLength={200}
                            onChange={(e) => writeWidgetConfig("announcementText", e.target.value)}
                            placeholder="Enter announcement message..."
                            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-foreground/30" />
                          <span className="text-[10px] text-muted-foreground text-right">{(widgetConfig.announcementText ?? "").length}/200</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── ACTIVITY TAB ──────────────────────────────────────────── */}
            {tab === "activity" && (
              <div className="flex flex-col gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={Users} label="Online Now" value={String(activityData?.onlineCount ?? 0)} color="oklch(0.72 0.16 140)" />
                  <StatCard icon={MessageSquare} label="Total Messages" value={String(activityData?.totalMessages ?? 0)} color="oklch(0.7 0.12 250)" />
                  <StatCard icon={Activity} label="Active Today" value={String(Math.max(activityData?.onlineCount ?? 0, Math.min(activityData?.totalMessages ?? 0, 99)))} color="oklch(0.75 0.15 200)" />
                </div>

                {activityLoading && !activityData ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                  </div>
                ) : activityData ? (
                  <>
                    {/* Online Users */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold">Online Users</h2>
                          <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-500 font-medium">{activityData.onlineCount} online</span>
                        </div>
                        <button onClick={fetchActivity} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh">
                          <RefreshCw className={`h-3.5 w-3.5 ${activityLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {activityData.onlineUsers.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No users currently online</p>
                        ) : (
                          <div className="space-y-2">
                            {activityData.onlineUsers.map((user) => {
                              const userName = (user.name as string) || user.uid || "Anonymous";
                              const status = (user.status as string) || "online";
                              const statusColor = status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-red-500";
                              const lastSeen = user.ts ? new Date(user.ts).toLocaleTimeString() : "Unknown";
                              return (
                                <div key={user.uid} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                                  <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">
                                    {userName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">{userName}</p>
                                    <p className="text-[10px] text-muted-foreground">Last seen: {lastSeen}</p>
                                  </div>
                                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor}`} title={status} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Recent Messages</h2>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {activityData.recentMessages.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-8">No recent messages</p>
                        ) : (
                          <div className="space-y-2">
                            {activityData.recentMessages.map((msg, i) => {
                              const isSystem = msg.system === true;
                              const sender = (msg.sender as string) || "Unknown";
                              const text = (msg.text as string) || "";
                              const time = msg.ts ? new Date(msg.ts).toLocaleTimeString() : "";
                              return (
                                <div key={i} className={`flex items-start gap-3 rounded-xl border border-border p-3 ${isSystem ? "bg-foreground/[0.02]" : "bg-background"}`}>
                                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${isSystem ? "bg-foreground/5 text-muted-foreground" : "bg-foreground/10"}`}>
                                    {isSystem ? "S" : sender.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-medium ${isSystem ? "text-muted-foreground" : ""}`}>{isSystem ? "System" : sender}</span>
                                      {time && <span className="text-[10px] text-muted-foreground">{time}</span>}
                                    </div>
                                    <p className={`text-xs mt-0.5 truncate ${isSystem ? "text-muted-foreground" : ""}`}>{text || "(empty)"}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><Activity className="h-5 w-5 text-muted-foreground" /></div>
                    <div><p className="text-sm font-medium">Activity data unavailable</p><p className="mt-1 text-xs text-muted-foreground">Could not load activity data.</p></div>
                  </div>
                )}
              </div>
            )}

            {/* ─── SETTINGS TAB ──────────────────────────────────────────── */}
            {tab === "settings" && (
              <div className="flex flex-col gap-6">
                {/* Section: Security */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Security</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">Admin Password Change</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(""); }}
                          placeholder="New password"
                          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
                        <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(""); }}
                          placeholder="Confirm password"
                          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
                        <button onClick={handlePasswordChange} className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 shrink-0">
                          <Save className="h-3.5 w-3.5" />Save
                        </button>
                      </div>
                      {passwordMsg && <p className={`text-xs ${passwordMsg.includes("not match") ? "text-red-500" : "text-green-500"}`}>{passwordMsg}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Session Timeout</span>
                      <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                        className="h-9 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                        <option value="1h">1 Hour</option>
                        <option value="6h">6 Hours</option>
                        <option value="24h">24 Hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Data Management */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Data Management</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleExportConfig} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5">
                      <Download className="h-3.5 w-3.5" />Export Config
                    </button>
                    <label className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5 cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />Import Config
                      <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
                    </label>
                    <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10">
                      <AlertTriangle className="h-3.5 w-3.5" />Reset to Defaults
                    </button>
                  </div>
                  {showResetConfirm && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 animate-[fade-up_0.2s_ease_both]">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">Reset all widget settings to defaults?</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">This action cannot be undone.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleResetDefaults} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium transition-colors hover:bg-red-600">Reset</button>
                        <button onClick={() => setShowResetConfirm(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Notifications */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Notifications</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Push Notifications</span>
                      </div>
                      <ToggleSwitch value={pushNotifications} onChange={setPushNotifications} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sound on Message</span>
                      </div>
                      <ToggleSwitch value={soundOnMessage} onChange={setSoundOnMessage} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Haptic Feedback</span>
                      </div>
                      <ToggleSwitch value={hapticFeedback} onChange={setHapticFeedback} />
                    </div>
                  </div>
                </div>

                {/* Section: Maintenance */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Maintenance</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigToggle label="Maintenance Mode" value={widgetConfig.maintenanceEnabled ?? false} syncing={syncingKey === "maintenanceEnabled"} onChange={(v) => writeWidgetConfig("maintenanceEnabled", v)} />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Maintenance Message</span>
                        {syncingKey === "maintenanceMessage" && <SyncIndicator />}
                      </div>
                      <input type="text" value={widgetConfig.maintenanceMessage ?? ""}
                        onChange={(e) => writeWidgetConfig("maintenanceMessage", e.target.value)}
                        placeholder="Site is under maintenance..."
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-foreground/30" />
                    </div>
                  </div>
                </div>
              </div>
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

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${value ? "bg-foreground" : "bg-foreground/20"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ─── Sync Indicator ───────────────────────────────────────────────────────────

function SyncIndicator() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
      syncing
    </span>
  );
}

// ─── Config Toggle ────────────────────────────────────────────────────────────

function ConfigToggle({ label, value, syncing, onChange }: { label: string; value: boolean; syncing: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {syncing && <SyncIndicator />}
      </div>
      <ToggleSwitch value={value} onChange={onChange} />
    </div>
  );
}

// ─── Config Slider ────────────────────────────────────────────────────────────

function ConfigSlider({ label, value, min, max, step, unit, syncing, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; syncing: boolean; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          {syncing && <SyncIndicator />}
        </div>
        <span className="text-xs font-medium tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-foreground/10 accent-foreground"
      />
    </div>
  );
}

// ─── Config Select ────────────────────────────────────────────────────────────

function ConfigSelect({ label, value, options, syncing, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; syncing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {syncing && <SyncIndicator />}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Config Color Picker ──────────────────────────────────────────────────────

function ConfigColorPicker({ label, value, syncing, onChange }: {
  label: string; value: string; syncing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {syncing && <SyncIndicator />}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs font-mono outline-none focus:border-foreground/30"
        />
      </div>
    </div>
  );
}
