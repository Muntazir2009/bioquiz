"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, HardDrive, Files, Download, Trash2, Search, Lock,
  Pencil, Check, X, ArrowLeft, BarChart3, Eye, EyeOff, Filter,
  RefreshCw, Copy, Globe, FileText, Image as ImageIcon, Video,
  Music, FileArchive, File, Activity, Trash, LogOut, Calendar,
  Hash, CopyPlus, Database, TrendingUp, Zap, MessageSquare,
  Settings, RotateCcw, Users, Palette, SlidersHorizontal, Shield,
  Save, Upload, Bell, Volume2, Smartphone, Wrench, AlertTriangle,
  Type, MessageCircle, Megaphone, LayoutDashboard, ChevronRight,
  Menu, Ban, Heart,
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

type ChatMessage = {
  key: string;
  text: string;
  uname: string;
  uid: string;
  ts: number;
  type: string;
  edited: boolean;
  reactions: { emoji: string; count: number }[];
};

type DmConversation = {
  dmId: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  messageCount: number;
};

type Section =
  | "overview" | "activity"
  | "global-chat" | "dms" | "announcements"
  | "themes" | "layout" | "messages-appearance"
  | "content-filter" | "rate-limiting" | "user-management"
  | "general" | "security" | "notifications" | "data" | "maintenance"
  | "files" | "disk-usage";

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

// ─── Sidebar Definition ──────────────────────────────────────────────────────

type SidebarCategory = {
  id: string;
  icon: LucideIcon;
  label: string;
  items: { id: Section; label: string; icon: LucideIcon }[];
};

const SIDEBAR: SidebarCategory[] = [
  {
    id: "dashboard",
    icon: BarChart3,
    label: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "activity", label: "Activity", icon: Activity },
    ],
  },
  {
    id: "chat",
    icon: MessageSquare,
    label: "Chat",
    items: [
      { id: "global-chat", label: "Global Chat", icon: Globe },
      { id: "dms", label: "DMs", icon: MessageCircle },
      { id: "announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    id: "appearance",
    icon: Palette,
    label: "Appearance",
    items: [
      { id: "themes", label: "Themes", icon: Palette },
      { id: "layout", label: "Layout", icon: SlidersHorizontal },
      { id: "messages-appearance", label: "Messages", icon: Type },
    ],
  },
  {
    id: "moderation",
    icon: Shield,
    label: "Moderation",
    items: [
      { id: "content-filter", label: "Content Filter", icon: Filter },
      { id: "rate-limiting", label: "Rate Limiting", icon: Zap },
      { id: "user-management", label: "User Management", icon: Users },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    items: [
      { id: "general", label: "General", icon: SlidersHorizontal },
      { id: "security", label: "Security", icon: Lock },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "data", label: "Data", icon: Database },
      { id: "maintenance", label: "Maintenance", icon: Wrench },
    ],
  },
  {
    id: "storage",
    icon: HardDrive,
    label: "Storage",
    items: [
      { id: "files", label: "Files", icon: FileText },
      { id: "disk-usage", label: "Disk Usage", icon: Database },
    ],
  },
];

// ─── Helper: section → category ──────────────────────────────────────────────

function categoryForSection(section: Section): string {
  for (const cat of SIDEBAR) {
    if (cat.items.some((it) => it.id === section)) return cat.id;
  }
  return "dashboard";
}

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

  // Sidebar navigation
  const [section, setSection] = useState<Section>("overview");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["dashboard"]));
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [wsConnected] = useState(true);

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

  // Chat state
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const [dmConversations, setDmConversations] = useState<DmConversation[]>([]);
  const [selectedDm, setSelectedDm] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [selectedChatMessages, setSelectedChatMessages] = useState<Set<string>>(new Set());
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

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
      if (storageRes.ok) setStorageData(await storageRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthed) { queueMicrotask(() => fetchData()); } }, [isAuthed, fetchData]);

  // ─── Polling ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthed) return;
    const interval = setInterval(() => { fetchData(); }, 10000);
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

  // Fetch widget config when any appearance/moderation/general/settings section is active
  const widgetSections: Section[] = ["themes", "layout", "messages-appearance", "content-filter", "rate-limiting", "announcements", "general", "maintenance"];
  useEffect(() => {
    if (isAuthed && widgetSections.includes(section)) { queueMicrotask(() => fetchWidgetConfig()); }
  }, [isAuthed, section, fetchWidgetConfig]);

  const writeWidgetConfig = useCallback((key: string, value: unknown) => {
    setWidgetConfig((prev) => {
      const updated = { ...prev, [key]: value };
      setSyncingKey(key);
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

  useEffect(() => {
    if (isAuthed && (section === "activity" || section === "user-management")) {
      queueMicrotask(() => fetchActivity());
    }
  }, [isAuthed, section, fetchActivity]);

  useEffect(() => {
    if (!isAuthed || (section !== "activity" && section !== "user-management")) return;
    const interval = setInterval(() => { fetchActivity(); }, 10000);
    return () => { clearInterval(interval); };
  }, [isAuthed, section, fetchActivity]);

  // ─── Chat fetching ──────────────────────────────────────────────────────

  const fetchGlobalChat = useCallback(async () => {
    setChatLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch(`/api/admin/chat?type=global`, { headers: { "x-admin-password": pwd } });
      if (res.ok) {
        const json = await res.json();
        setGlobalMessages(json.messages || []);
      }
    } catch { /* ignore */ }
    finally { setChatLoading(false); }
  }, [password]);

  const fetchDms = useCallback(async () => {
    setChatLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch(`/api/admin/chat?type=dms`, { headers: { "x-admin-password": pwd } });
      if (res.ok) {
        const json = await res.json();
        setDmConversations(json.conversations || []);
      }
    } catch { /* ignore */ }
    finally { setChatLoading(false); }
  }, [password]);

  const fetchDmMessages = useCallback(async (dmId: string) => {
    setChatLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch(`/api/admin/chat?type=dm-messages&dmId=${dmId}`, { headers: { "x-admin-password": pwd } });
      if (res.ok) {
        const json = await res.json();
        setDmMessages(json.messages || []);
      }
    } catch { /* ignore */ }
    finally { setChatLoading(false); }
  }, [password]);

  useEffect(() => {
    if (!isAuthed) return;
    if (section === "global-chat") { queueMicrotask(() => fetchGlobalChat()); }
    else if (section === "dms") { queueMicrotask(() => fetchDms()); }
  }, [isAuthed, section, fetchGlobalChat, fetchDms]);

  useEffect(() => {
    if (selectedDm) { queueMicrotask(() => fetchDmMessages(selectedDm)); }
  }, [selectedDm, fetchDmMessages]);

  // Auto-refresh chat every 10s
  useEffect(() => {
    if (!isAuthed) return;
    if (section !== "global-chat" && section !== "dms") return;
    const interval = setInterval(() => {
      if (section === "global-chat") fetchGlobalChat();
      else if (section === "dms" && !selectedDm) fetchDms();
    }, 10000);
    return () => { clearInterval(interval); };
  }, [isAuthed, section, selectedDm, fetchGlobalChat, fetchDms]);

  const deleteChatMessage = useCallback(async (messageKey: string, context: "global" | "dm", dmId?: string) => {
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      await fetch("/api/admin/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": pwd },
        body: JSON.stringify({ messageKey, context, dmId }),
      });
      if (section === "global-chat") fetchGlobalChat();
      else if (section === "dms" && selectedDm) fetchDmMessages(selectedDm);
    } catch { /* ignore */ }
  }, [password, section, selectedDm, fetchGlobalChat, fetchDmMessages]);

  const kickUser = useCallback(async (uid: string) => {
    const FB = "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";
    try {
      await fetch(`${FB}/bq_presence/${uid}.json`, { method: "DELETE" });
      fetchActivity();
    } catch { /* ignore */ }
  }, [fetchActivity]);

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
    const oldScript = document.getElementById("bq-chat-script");
    if (oldScript) oldScript.remove();
    const oldBubble = document.getElementById("bqb");
    if (oldBubble) oldBubble.remove();
    const oldPanel = document.getElementById("bqp");
    if (oldPanel) oldPanel.remove();
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

  // ─── Sidebar helpers ────────────────────────────────────────────────────

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  const navigateTo = useCallback((s: Section) => {
    setSection(s);
    setSidebarOpen(false);
    // Make sure the parent category is expanded
    const catId = categoryForSection(s);
    setExpandedCategories((prev) => {
      if (prev.has(catId)) return prev;
      const next = new Set(prev);
      next.add(catId);
      return next;
    });
  }, []);

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
    <div className="min-h-screen flex bg-background">
      {/* Widget Refresh Toast */}
      {widgetRefreshToast && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-up_0.2s_ease_both] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium">Widget refreshed</span>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-card border-r border-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-[11px] font-semibold">B</div>
            <span className="text-sm font-semibold">BioQuiz</span>
            <span className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">ADMIN</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleWidgetRefresh} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh Widget">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => fetchData()} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh Data">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {SIDEBAR.map((cat) => {
            const isExpanded = expandedCategories.has(cat.id);
            const hasActive = cat.items.some((it) => it.id === section);
            return (
              <div key={cat.id} className="mb-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${
                    hasActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">{cat.label}</span>
                  <ChevronRight className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {/* Sub-items */}
                {isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {cat.items.map((item) => {
                      const isActive = section === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
                            isActive
                              ? "bg-foreground/5 text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-foreground" />
                          )}
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`} />
              {wsConnected ? "Polling" : "Offline"}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => router.push("/")} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Back to site">
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={logout} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-[11px] font-semibold">B</div>
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleWidgetRefresh} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-12 items-center justify-between px-8">
            <div className="flex items-center gap-2">
              {(() => {
                const cat = SIDEBAR.find((c) => c.items.some((it) => it.id === section));
                const item = cat?.items.find((it) => it.id === section);
                if (!item || !cat) return null;
                return (
                  <>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{cat.label}</span>
                  </>
                );
              })()}
            </div>
            <button onClick={() => fetchData()} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {loading && !data ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          ) : data ? (
            <div className="flex flex-col gap-8 max-w-5xl">
              {/* ─── OVERVIEW ─────────────────────────────────────────── */}
              {section === "overview" && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon={Files} label="Total Files" value={String(data.stats.totalFiles)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={HardDrive} label="Storage Used" value={data.stats.totalSizeFormatted} color="oklch(0.72 0.16 150)" />
                    <StatCard icon={Download} label="Downloads" value={String(data.stats.totalDownloads)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={Globe} label="Public" value={String(data.stats.publicFiles)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Lock} label="Private" value={String(data.stats.privateFiles)} color="oklch(0.65 0.1 220)" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              {/* ─── ACTIVITY ──────────────────────────────────────────── */}
              {section === "activity" && (
                <div className="flex flex-col gap-6">
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
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Online Users</h2>
                            <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-500 font-medium">{activityData.onlineCount} online</span>
                          </div>
                          <button onClick={fetchActivity} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
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

              {/* ─── GLOBAL CHAT ───────────────────────────────────────── */}
              {section === "global-chat" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={MessageSquare} label="Total Messages" value={String(globalMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Activity} label="Messages Today" value={String(globalMessages.filter((m) => { const d = new Date(m.ts); const now = new Date(); return d.toDateString() === now.toDateString(); }).length)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={Users} label="Active Chatters" value={String(new Set(globalMessages.map((m) => m.uid)).size)} color="oklch(0.72 0.16 140)" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card">
                    <div className="flex flex-col gap-4 p-6 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold">Global Messages</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedChatMessages.size > 0 && (
                            <button onClick={async () => { await Promise.all(Array.from(selectedChatMessages).map((k) => deleteChatMessage(k, "global"))); setSelectedChatMessages(new Set()); }}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/20">
                              <Trash className="h-3.5 w-3.5" />Delete ({selectedChatMessages.size})
                            </button>
                          )}
                          <button onClick={fetchGlobalChat} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                            <RefreshCw className={`h-3.5 w-3.5 ${chatLoading ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)}
                          placeholder="Search messages..."
                          className="h-10 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5" />
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {chatLoading && globalMessages.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                        </div>
                      ) : globalMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><MessageSquare className="h-5 w-5 text-muted-foreground" /></div>
                          <p className="text-xs text-muted-foreground">No global messages yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {globalMessages
                            .filter((m) => !chatSearchQuery || m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()) || m.uname.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                            .map((msg) => (
                              <div key={msg.key} className="flex items-start gap-3 px-6 py-3 hover:bg-foreground/[0.01] transition-colors">
                                <button onClick={() => { const next = new Set(selectedChatMessages); if (next.has(msg.key)) next.delete(msg.key); else next.add(msg.key); setSelectedChatMessages(next); }}
                                  className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${selectedChatMessages.has(msg.key) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>
                                  {selectedChatMessages.has(msg.key) && <Check className="h-3 w-3" />}
                                </button>
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">
                                  {msg.uname.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{msg.uname}</span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleString()}</span>
                                    {msg.reactions.length > 0 && (
                                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Heart className="h-3 w-3" />{msg.reactions.reduce((a, r) => a + r.count, 0)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs mt-0.5 break-words">{msg.text}</p>
                                  {msg.reactions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {msg.reactions.map((r, i) => (
                                        <span key={i} className="inline-flex items-center gap-0.5 rounded-full bg-foreground/5 px-2 py-0.5 text-[10px]">
                                          {r.emoji} {r.count}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {deleteConfirmKey === msg.key ? (
                                    <>
                                      <button onClick={() => { deleteChatMessage(msg.key, "global"); setDeleteConfirmKey(null); }}
                                        className="h-7 px-2 rounded-md bg-red-500 text-white text-[10px] font-medium">Confirm</button>
                                      <button onClick={() => setDeleteConfirmKey(null)}
                                        className="h-7 px-2 rounded-md border border-border text-[10px] font-medium">Cancel</button>
                                    </>
                                  ) : (
                                    <button onClick={() => setDeleteConfirmKey(msg.key)}
                                      className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── DMs ───────────────────────────────────────────────── */}
              {section === "dms" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard icon={MessageCircle} label="Total DMs" value={String(dmConversations.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Activity} label="Active Today" value={String(dmConversations.filter((d) => { const dt = new Date(d.lastMessageTime); const now = new Date(); return dt.toDateString() === now.toDateString(); }).length)} color="oklch(0.75 0.15 200)" />
                  </div>

                  {selectedDm ? (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-3 p-6 border-b border-border">
                        <button onClick={() => { setSelectedDm(null); setDmMessages([]); }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold">DM: {selectedDm}</h2>
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {chatLoading ? (
                          <div className="flex items-center justify-center py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                          </div>
                        ) : dmMessages.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-16">No messages in this DM</p>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {dmMessages.map((msg) => (
                              <div key={msg.key} className="flex items-start gap-3 px-6 py-3 hover:bg-foreground/[0.01]">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">
                                  {msg.uname.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{msg.uname}</span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs mt-0.5 break-words">{msg.text}</p>
                                </div>
                                {deleteConfirmKey === msg.key ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => { deleteChatMessage(msg.key, "dm", selectedDm); setDeleteConfirmKey(null); }}
                                      className="h-7 px-2 rounded-md bg-red-500 text-white text-[10px] font-medium">Confirm</button>
                                    <button onClick={() => setDeleteConfirmKey(null)}
                                      className="h-7 px-2 rounded-md border border-border text-[10px] font-medium">Cancel</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteConfirmKey(msg.key)}
                                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <h2 className="text-sm font-semibold">DM Conversations</h2>
                        </div>
                        <button onClick={fetchDms} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                          <RefreshCw className={`h-3.5 w-3.5 ${chatLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {chatLoading && dmConversations.length === 0 ? (
                          <div className="flex items-center justify-center py-16">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                          </div>
                        ) : dmConversations.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-16">No DM conversations found</p>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {dmConversations.map((dm) => (
                              <button key={dm.dmId} onClick={() => setSelectedDm(dm.dmId)}
                                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.02] transition-colors text-left">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/5">
                                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">{dm.participants.join(", ") || dm.dmId}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">{dm.lastMessage || "No messages"}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  {dm.lastMessageTime > 0 && <p className="text-[10px] text-muted-foreground">{new Date(dm.lastMessageTime).toLocaleDateString()}</p>}
                                  <p className="text-[10px] text-muted-foreground">{dm.messageCount} msg{dm.messageCount !== 1 ? "s" : ""}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ANNOUNCEMENTS ─────────────────────────────────────── */}
              {section === "announcements" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
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
              )}

              {/* ─── THEMES ────────────────────────────────────────────── */}
              {section === "themes" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Themes</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigSelect label="Default Theme" value={widgetConfig.defaultTheme ?? "pure-black"} options={[{ value: "pure-black", label: "Pure Black" }, { value: "golden", label: "Golden" }]} syncing={syncingKey === "defaultTheme"} onChange={(v) => writeWidgetConfig("defaultTheme", v)} />
                    <ConfigColorPicker label="Accent Color" value={widgetConfig.accentColor ?? "#ffffff"} syncing={syncingKey === "accentColor"} onChange={(v) => writeWidgetConfig("accentColor", v)} />
                  </div>
                  {/* Theme Preview */}
                  <div className="mt-6 rounded-xl border border-border overflow-hidden">
                    <div className="p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium bg-foreground/[0.02]">Preview</div>
                    <div className="p-4" style={{ background: widgetConfig.defaultTheme === "golden" ? "#1a1500" : "#000" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full" style={{ background: widgetConfig.accentColor || "#fff" }} />
                        <div>
                          <div className="h-2 w-16 rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.6 }} />
                          <div className="h-1.5 w-10 rounded-full mt-1" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.3 }} />
                        </div>
                      </div>
                      <div className="rounded-lg p-2 mb-1.5" style={{ background: widgetConfig.accentColor ? `${widgetConfig.accentColor}15` : "rgba(255,255,255,0.05)" }}>
                        <div className="h-1.5 w-full rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.5 }} />
                      </div>
                      <div className="rounded-lg p-2" style={{ background: widgetConfig.accentColor ? `${widgetConfig.accentColor}08` : "rgba(255,255,255,0.02)" }}>
                        <div className="h-1.5 w-3/4 rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.3 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── LAYOUT ────────────────────────────────────────────── */}
              {section === "layout" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Layout</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigSelect label="Widget Position" value={widgetConfig.widgetPosition ?? "bottom-right"} options={[{ value: "bottom-right", label: "Bottom Right" }, { value: "bottom-left", label: "Bottom Left" }, { value: "top-right", label: "Top Right" }, { value: "top-left", label: "Top Left" }]} syncing={syncingKey === "widgetPosition"} onChange={(v) => writeWidgetConfig("widgetPosition", v)} />
                    <ConfigSlider label="Bubble Size" value={widgetConfig.bubbleSize ?? 56} min={40} max={72} step={2} unit="px" syncing={syncingKey === "bubbleSize"} onChange={(v) => writeWidgetConfig("bubbleSize", v)} />
                    <ConfigSlider label="Panel Width" value={widgetConfig.panelWidth ?? 380} min={300} max={500} step={10} unit="px" syncing={syncingKey === "panelWidth"} onChange={(v) => writeWidgetConfig("panelWidth", v)} />
                    <ConfigSlider label="Panel Height" value={widgetConfig.panelHeight ?? 600} min={400} max={800} step={10} unit="px" syncing={syncingKey === "panelHeight"} onChange={(v) => writeWidgetConfig("panelHeight", v)} />
                  </div>
                </div>
              )}

              {/* ─── MESSAGES APPEARANCE ───────────────────────────────── */}
              {section === "messages-appearance" && (
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
              )}

              {/* ─── CONTENT FILTER ────────────────────────────────────── */}
              {section === "content-filter" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Content Filter</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigToggle label="Profanity Filter" value={widgetConfig.profanityFilter ?? true} syncing={syncingKey === "profanityFilter"} onChange={(v) => writeWidgetConfig("profanityFilter", v)} />
                    <ConfigToggle label="Link Filter" value={widgetConfig.linkFilter ?? false} syncing={syncingKey === "linkFilter"} onChange={(v) => writeWidgetConfig("linkFilter", v)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4">Profanity filter replaces offensive words with ***. Link filter strips URLs from messages.</p>
                </div>
              )}

              {/* ─── RATE LIMITING ─────────────────────────────────────── */}
              {section === "rate-limiting" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Rate Limiting</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigToggle label="Slow Mode" value={widgetConfig.slowMode ?? false} syncing={syncingKey === "slowMode"} onChange={(v) => writeWidgetConfig("slowMode", v)} />
                    {widgetConfig.slowMode && (
                      <ConfigSlider label="Slow Mode Interval" value={widgetConfig.slowModeInterval ?? 5} min={1} max={60} step={1} unit="s" syncing={syncingKey === "slowModeInterval"} onChange={(v) => writeWidgetConfig("slowModeInterval", v)} />
                    )}
                    <ConfigToggle label="Rate Limiting" value={widgetConfig.rateLimitEnabled ?? true} syncing={syncingKey === "rateLimitEnabled"} onChange={(v) => writeWidgetConfig("rateLimitEnabled", v)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4">Slow mode adds a cooldown between messages. Rate limiting prevents spam by capping messages per minute.</p>
                </div>
              )}

              {/* ─── USER MANAGEMENT ───────────────────────────────────── */}
              {section === "user-management" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard icon={Users} label="Online Now" value={String(activityData?.onlineCount ?? 0)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Users} label="Known Users" value={String(activityData?.onlineUsers?.length ?? 0)} color="oklch(0.7 0.12 250)" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold">Users</h2>
                      </div>
                      <button onClick={fetchActivity} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                        <RefreshCw className={`h-3.5 w-3.5 ${activityLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {activityLoading && !activityData ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                        </div>
                      ) : activityData && activityData.onlineUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-16">No users found</p>
                      ) : activityData ? (
                        <div className="divide-y divide-border/50">
                          {activityData.onlineUsers.map((user) => {
                            const userName = (user.name as string) || user.uid || "Anonymous";
                            const status = (user.status as string) || "online";
                            const statusColor = status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-red-500";
                            const lastSeen = user.ts ? new Date(user.ts).toLocaleString() : "Unknown";
                            return (
                              <div key={user.uid} className="flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.01] transition-colors">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{userName}</span>
                                    <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                                    <span className="text-[10px] text-muted-foreground capitalize">{status}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">UID: {user.uid}</span>
                                    <span className="text-[10px] text-muted-foreground">Last: {lastSeen}</span>
                                  </div>
                                </div>
                                <button onClick={() => kickUser(user.uid)}
                                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20">
                                  <Ban className="h-3.5 w-3.5" />Kick
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── GENERAL ───────────────────────────────────────────── */}
              {section === "general" && (
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
              )}

              {/* ─── SECURITY ──────────────────────────────────────────── */}
              {section === "security" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Lock className="h-4 w-4 text-muted-foreground" />
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
              )}

              {/* ─── NOTIFICATIONS ─────────────────────────────────────── */}
              {section === "notifications" && (
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
              )}

              {/* ─── DATA ──────────────────────────────────────────────── */}
              {section === "data" && (
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
              )}

              {/* ─── MAINTENANCE ───────────────────────────────────────── */}
              {section === "maintenance" && (
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
              )}

              {/* ─── FILES ─────────────────────────────────────────────── */}
              {section === "files" && (
                <div className="rounded-2xl border border-border bg-card">
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

              {/* ─── DISK USAGE ────────────────────────────────────────── */}
              {section === "disk-usage" && (
                storageData ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <StatCard icon={HardDrive} label="Disk Usage" value={storageData.disk.usedFormatted} color="oklch(0.72 0.16 150)" />
                      <StatCard icon={Files} label="Files on Disk" value={String(storageData.disk.filesOnDisk)} color="oklch(0.7 0.12 250)" />
                      <StatCard icon={Zap} label="Avg Size" value={storageData.disk.filesOnDisk > 0 ? formatFileSize(storageData.disk.used / storageData.disk.filesOnDisk) : "0 B"} color="oklch(0.75 0.15 200)" />
                    </div>
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

        {/* Footer */}
        <footer className="border-t border-border mt-auto">
          <div className="flex items-center justify-center gap-2 px-6 py-4">
            <div className="grid h-5 w-5 place-items-center rounded-md bg-foreground text-background text-[9px] font-semibold">B</div>
            <span className="text-[11px] text-muted-foreground">&copy; {new Date().getFullYear()} BioQuiz Admin</span>
          </div>
        </footer>
      </div>
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
          className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent"
        />
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}
