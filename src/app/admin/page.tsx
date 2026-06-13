"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  initializeApp, getApps,
} from "firebase/app";
import {
  getDatabase, ref, onValue, off, set, remove, push, get,
  query, orderByChild, limitToLast,
  type Database,
} from "firebase/database";
import {
  ShieldCheck, HardDrive, Files, Download, Trash2, Search, Lock,
  Pencil, Check, X, ArrowLeft, BarChart3, Eye, EyeOff, Filter,
  RefreshCw, Copy, Globe, FileText, Image as ImageIcon, Video,
  Music, FileArchive, File, Activity, Trash, LogOut, Calendar,
  Hash, CopyPlus, Database, TrendingUp, Zap, MessageSquare,
  Settings, RotateCcw, Users, Palette, SlidersHorizontal, Shield,
  Save, Upload, Bell, Wrench, AlertTriangle,
  Type, MessageCircle, Megaphone, LayoutDashboard, ChevronRight,
  Menu, Ban, Heart, Pin, VolumeX, DownloadCloud, Clock,
  ShieldAlert, ShieldX, Timer, Hourglass, UserX, UserCheck,
  Gavel, AlertCircle, Search as SearchIcon,
  Play, Pause, ArrowDown, Volume2, PieChart as PieChartIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils-client";

// ─── Firebase Config ──────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain:        "bioquiz-chat.firebaseapp.com",
  databaseURL:       "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "bioquiz-chat",
  storageBucket:     "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId:             "1:616382882153:web:9c8a32401be847468d1df8",
};

const FB_PATHS = {
  messages: "bq_messages",
  dms: "bq_dms",
  presence: "bq_presence",
  banned: "bq_banned",
  muted: "bq_muted",
  warnings: "bq_warnings",
  pinned: "bq_pinned",
  config: "bq_widget_config/settings",
  autoModRules: "bq_widget_config/autoModRules",
  autoModLog: "bq_auto_mod_log",
};

let fbApp: ReturnType<typeof initializeApp> | null = null;
let fbDb: Database | null = null;

function getFirebaseDb(): Database {
  if (fbDb) return fbDb;
  if (getApps().length === 0) {
    fbApp = initializeApp(FIREBASE_CONFIG);
  } else {
    fbApp = getApps()[0];
  }
  fbDb = getDatabase(fbApp);
  return fbDb;
}

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
  widgetEnabled?: boolean; disguiseEnabled?: boolean; autoOpen?: boolean;
  autoOpenDelay?: number; defaultTheme?: string; accentColor?: string;
  widgetPosition?: string; bubbleSize?: number; panelWidth?: number;
  panelHeight?: number; charLimit?: number; maxMessages?: number;
  fontSize?: string; profanityFilter?: boolean; slowMode?: boolean;
  slowModeInterval?: number; rateLimitEnabled?: boolean; linkFilter?: boolean;
  announcementEnabled?: boolean; announcementText?: string;
  announcementColor?: string; maintenanceEnabled?: boolean;
  maintenanceMessage?: string; [key: string]: unknown;
};

type PresenceUser = { uid: string; ts?: number; name?: string; status?: string; [key: string]: unknown; };

type ActivityData = { onlineUsers: PresenceUser[]; onlineCount: number; recentMessages: RecentMessage[]; totalMessages: number; };

type RecentMessage = { ts?: number; text?: string; sender?: string; system?: boolean; [key: string]: unknown; };

type ChatMessage = { key: string; text: string; uname: string; uid: string; ts: number; type: string; edited: boolean; reactions: { emoji: string; count: number }[]; };

type DmConversation = { dmId: string; participants: string[]; participantNames: string[]; lastMessage: string; lastMessageTime: number; messageCount: number; };

type BannedUser = { uid: string; bannedAt: number; reason?: string; duration?: number; expiresAt?: number };
type MutedUser = { uid: string; mutedAt: number; reason?: string; duration?: number; expiresAt?: number };
type WarningEntry = { key: string; uid: string; reason: string; adminUid: string; ts: number; duration?: number; expiresAt?: number; userName?: string };
type PinnedMessage = { key: string; pinnedAt: number; pinnedBy: string };

type AutoModRule = {
  id: string;
  trigger: "word" | "regex" | "spam" | "caps" | "length";
  pattern: string;
  action: "warn" | "mute" | "ban" | "delete";
  duration: number;
  enabled: boolean;
};

type AutoModLogEntry = {
  id: string;
  ruleId: string;
  uid: string;
  userName: string;
  trigger: string;
  action: string;
  messageText: string;
  ts: number;
};

type Section =
  | "overview" | "activity" | "analytics"
  | "global-chat" | "dms" | "announcements" | "live-monitor"
  | "themes" | "layout" | "messages-appearance"
  | "content-filter" | "rate-limiting" | "user-management" | "warnings-bans" | "auto-mod" | "user-intel"
  | "general" | "security" | "notifications" | "data" | "maintenance" | "emergency" | "fb-health"
  | "files" | "disk-usage" | "bug-monitor";

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
  widgetEnabled: true, disguiseEnabled: false, autoOpen: false, autoOpenDelay: 0,
  defaultTheme: "pure-black", accentColor: "#ffffff", widgetPosition: "bottom-right",
  bubbleSize: 56, panelWidth: 380, panelHeight: 600, charLimit: 500,
  maxMessages: 50, fontSize: "medium", profanityFilter: true, slowMode: false,
  slowModeInterval: 5, rateLimitEnabled: true, linkFilter: false,
  announcementEnabled: false, announcementText: "", announcementColor: "#f59e0b",
  maintenanceEnabled: false, maintenanceMessage: "",
};

// ─── Sidebar Definition ──────────────────────────────────────────────────────

type SidebarCategory = { id: string; icon: LucideIcon; label: string; items: { id: Section; label: string; icon: LucideIcon }[]; };

const SIDEBAR: SidebarCategory[] = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard", items: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ]},
  { id: "chat", icon: MessageSquare, label: "Chat", items: [
    { id: "global-chat", label: "Global Chat", icon: Globe },
    { id: "dms", label: "DMs", icon: MessageCircle },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "live-monitor", label: "Live Monitor", icon: Activity },
  ]},
  { id: "appearance", icon: Palette, label: "Appearance", items: [
    { id: "themes", label: "Themes", icon: Palette },
    { id: "layout", label: "Layout", icon: SlidersHorizontal },
    { id: "messages-appearance", label: "Messages", icon: Type },
  ]},
  { id: "moderation", icon: Shield, label: "Moderation", items: [
    { id: "content-filter", label: "Content Filter", icon: Filter },
    { id: "rate-limiting", label: "Rate Limiting", icon: Zap },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "warnings-bans", label: "Warnings & Bans", icon: ShieldAlert },
    { id: "auto-mod", label: "Auto-Mod", icon: Shield },
    { id: "user-intel", label: "User Intel", icon: SearchIcon },
  ]},
  { id: "monitor", icon: Activity, label: "Monitor", items: [
    { id: "bug-monitor", label: "Bug Monitor", icon: ShieldAlert },
    { id: "fb-health", label: "Firebase Health", icon: Heart },
  ]},
  { id: "settings", icon: Settings, label: "Settings", items: [
    { id: "general", label: "General", icon: SlidersHorizontal },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data", icon: Database },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "emergency", label: "Emergency", icon: ShieldAlert },
  ]},
  { id: "storage", icon: HardDrive, label: "Storage", items: [
    { id: "files", label: "Files", icon: FileText },
    { id: "disk-usage", label: "Disk Usage", icon: Database },
  ]},
];

function categoryForSection(section: Section): string {
  for (const cat of SIDEBAR) { if (cat.items.some((it) => it.id === section)) return cat.id; }
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

  // Real-time connection
  const [fbConnected, setFbConnected] = useState(false);

  // Widget config (real-time from Firebase)
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(defaultWidgetConfig);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);

  // Real-time chat state
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const [dmConversations, setDmConversations] = useState<DmConversation[]>([]);
  const [selectedDm, setSelectedDm] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [selectedChatMessages, setSelectedChatMessages] = useState<Set<string>>(new Set());
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Pagination state for global messages
  const [messagesPageSize, setMessagesPageSize] = useState(50);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  // Pagination state for DM messages
  const [dmMessagesPageSize, setDmMessagesPageSize] = useState(50);
  const [dmTotalMessageCount, setDmTotalMessageCount] = useState(0);
  const [dmHasMoreMessages, setDmHasMoreMessages] = useState(false);
  const [loadingMoreDmMessages, setLoadingMoreDmMessages] = useState(false);
  const [dmListLoading, setDmListLoading] = useState(false);

  // DM search filter
  const [dmSearchQuery, setDmSearchQuery] = useState("");

  // Real-time user state
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [warnings, setWarnings] = useState<WarningEntry[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);

  // Warn/Mute dialog
  const [warnDialogUid, setWarnDialogUid] = useState<string | null>(null);
  const [warnReason, setWarnReason] = useState("");
  const [warnDuration, setWarnDuration] = useState<number>(0); // 0 = permanent, >0 = hours
  const [muteDialogUid, setMuteDialogUid] = useState<string | null>(null);
  const [muteReason, setMuteReason] = useState("");
  const [muteDuration, setMuteDuration] = useState<number>(1); // default 1 hour

  // Ban dialog
  const [banDialogUid, setBanDialogUid] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number>(0); // 0 = permanent

  // Warnings & Bans section
  const [warningsBansSearch, setWarningsBansSearch] = useState("");
  const [warningsBansTab, setWarningsBansTab] = useState<"warnings" | "bans" | "mutes">("warnings");
  const [quickActionUid, setQuickActionUid] = useState("");
  const [quickActionMode, setQuickActionMode] = useState<"warn" | "ban" | "mute" | null>(null);

  // Widget refresh toast
  const [widgetRefreshToast, setWidgetRefreshToast] = useState(false);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastAsSystem, setBroadcastAsSystem] = useState(true);
  const [broadcastPriority, setBroadcastPriority] = useState<"normal" | "important" | "urgent">("normal");

  // Maintenance preview
  const [maintenancePreviewVisible, setMaintenancePreviewVisible] = useState(false);

  // Settings
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Live Monitor
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveAutoScroll, setLiveAutoScroll] = useState(true);
  const [livePaused, setLivePaused] = useState(false);
  const [liveFilter, setLiveFilter] = useState<"all" | "user" | "system">("all");
  const [liveSoundEnabled, setLiveSoundEnabled] = useState(false);
  const liveMessagesEndRef = useRef<HTMLDivElement>(null);
  const prevLiveMsgCountRef = useRef(0);

  // Analytics
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Auto-Mod
  const [autoModRules, setAutoModRules] = useState<AutoModRule[]>([]);
  const [autoModLog, setAutoModLog] = useState<AutoModLogEntry[]>([]);
  const [newRuleTrigger, setNewRuleTrigger] = useState<"word" | "regex" | "spam" | "caps" | "length">("word");
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleAction, setNewRuleAction] = useState<"warn" | "mute" | "ban" | "delete">("delete");
  const [newRuleDuration, setNewRuleDuration] = useState(1);
  const [testModText, setTestModText] = useState("");
  const [showAddRule, setShowAddRule] = useState(false);

  // User Intel
  const [intelSearchQuery, setIntelSearchQuery] = useState("");
  const [intelSelectedUser, setIntelSelectedUser] = useState<string | null>(null);

  // Emergency
  const [nukeConfirmStep, setNukeConfirmStep] = useState(0);
  const [massKickConfirm, setMassKickConfirm] = useState(false);
  const [chatFrozen, setChatFrozen] = useState(false);

  // Firebase Health
  const [fbLatency, setFbLatency] = useState<number | null>(null);
  const [fbHealthStatus, setFbHealthStatus] = useState<"checking" | "healthy" | "degraded" | "down">("checking");
  const [fbDiagResults, setFbDiagResults] = useState<Record<string, {ok: boolean; ms: number; error?: string}> | null>(null);
  const [fbDiagRunning, setFbDiagRunning] = useState(false);

  // Magic Link (Account Access)
  const [magicLinkUsername, setMagicLinkUsername] = useState("");
  const [magicLinkExpiry, setMagicLinkExpiry] = useState<number>(24); // hours
  const [magicLinkOneTime, setMagicLinkOneTime] = useState(true);
  const [magicLinkGenerating, setMagicLinkGenerating] = useState(false);
  const [magicLinkGenerated, setMagicLinkGenerated] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState("");
  const [magicLinkHistory, setMagicLinkHistory] = useState<{token: string; username: string; createdAt: number; expiresAt: number; oneTime: boolean; used: boolean; usedBy?: string; usedAt?: number}[]>([]);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  // Bug Monitor
  type BugLogEntry = { id: string; sev: string; cat: string; msg: string; detail: string; ts: number; ua?: string; url?: string };
  const [bugLogs, setBugLogs] = useState<BugLogEntry[]>([]);
  const [bugLogFilter, setBugLogFilter] = useState<"all" | "error" | "warn" | "info">("all");
  const [bugLogSearch, setBugLogSearch] = useState("");
  const [bugLogAutoRefresh, setBugLogAutoRefresh] = useState(true);

  // Action message helper (must be before useCallback hooks that use it)
  const showActionMsg = useCallback((msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); }, []);

  // ─── Auth ────────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    setAuthLoading(true); setAuthError("");
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) { setIsAuthed(true); sessionStorage.setItem("admin-auth", password); }
      else setAuthError("Invalid password");
    } catch { setAuthError("Connection failed"); }
    finally { setAuthLoading(false); }
  }, [password]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "0613") { queueMicrotask(() => { setIsAuthed(true); setPassword(saved); }); }
  }, []);

  // ─── Firebase Real-Time Listeners ─────────────────────────────────────────

  // Global messages listener — separate useEffect so it re-runs on page size change
  useEffect(() => {
    if (!isAuthed) return;
    const db = getFirebaseDb();

    // One-time read to get total count
    const countRef = ref(db, FB_PATHS.messages);
    get(countRef).then((snap) => {
      if (snap.exists()) {
        const count = Object.keys(snap.val()).length;
        setTotalMessageCount(count);
        setHasMoreMessages(count > messagesPageSize);
      } else {
        setTotalMessageCount(0);
        setHasMoreMessages(false);
      }
    });

    // Paginated real-time listener for displayed messages
    const msgQuery = query(ref(db, FB_PATHS.messages), orderByChild('ts'), limitToLast(messagesPageSize));
    const unsubMsg = onValue(msgQuery, (snap) => {
      if (!snap.exists()) { setGlobalMessages([]); return; }
      const val = snap.val();
      const msgs: ChatMessage[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        key: k, text: v?.text || "", uname: v?.uname || "Unknown", uid: v?.uid || "",
        ts: v?.ts || 0, type: v?.type || "user", edited: v?.edited || false,
        reactions: v?.reactions ? (Array.isArray(v.reactions) ? v.reactions : Object.values(v.reactions)) : [],
      }));
      msgs.sort((a, b) => b.ts - a.ts);
      setGlobalMessages(msgs);
      setLoadingMoreMessages(false);
    });

    return () => { off(msgQuery); };
  }, [isAuthed, messagesPageSize]);

  // Load More handler
  const loadMoreMessages = useCallback(() => {
    setLoadingMoreMessages(true);
    setMessagesPageSize((prev) => prev + 50);
  }, []);

  // Other Firebase listeners (not affected by message pagination)
  useEffect(() => {
    if (!isAuthed) return;
    const db = getFirebaseDb();
    setFbConnected(true);

    // DMs — lightweight: fetch DM list via REST API (not real-time listener)
    // Using onValue on bq_dms downloads ALL message bodies for ALL DMs — extremely heavy.
    // Instead, we use the REST API with shallow=true + targeted meta fetches.
    // (fetchDmConversations is called separately below)

    // Presence
    const presRef = ref(db, FB_PATHS.presence);
    const unsubPres = onValue(presRef, (snap) => {
      if (!snap.exists()) { setOnlineUsers([]); return; }
      const val = snap.val();
      const users: PresenceUser[] = Object.entries(val).map(([uid, v]: [string, any]) => ({
        uid, ts: v?.ts, name: v?.name, status: v?.status,
      }));
      setOnlineUsers(users);
    });

    // Widget config
    const cfgRef = ref(db, FB_PATHS.config);
    const unsubCfg = onValue(cfgRef, (snap) => {
      if (!snap.exists()) return;
      setWidgetConfig((prev) => ({ ...prev, ...snap.val() }));
      setSyncingKey(null);
    });

    // Banned
    const banRef = ref(db, FB_PATHS.banned);
    const unsubBan = onValue(banRef, (snap) => {
      if (!snap.exists()) { setBannedUsers([]); return; }
      const val = snap.val();
      setBannedUsers(Object.entries(val).map(([uid, v]: [string, any]) => ({ uid, bannedAt: v?.bannedAt || 0, reason: v?.reason || '', duration: v?.duration || 0, expiresAt: v?.expiresAt || 0 })));
    });

    // Muted
    const mutRef = ref(db, FB_PATHS.muted);
    const unsubMut = onValue(mutRef, (snap) => {
      if (!snap.exists()) { setMutedUsers([]); return; }
      const val = snap.val();
      setMutedUsers(Object.entries(val).map(([uid, v]: [string, any]) => ({ uid, mutedAt: v?.mutedAt || 0, reason: v?.reason, duration: v?.duration || 0, expiresAt: v?.expiresAt || 0 })));
    });

    // Warnings
    const warnRef = ref(db, FB_PATHS.warnings);
    const unsubWarn = onValue(warnRef, (snap) => {
      if (!snap.exists()) { setWarnings([]); return; }
      const val = snap.val();
      setWarnings(Object.entries(val).map(([k, v]: [string, any]) => ({ key: k, uid: v?.uid || "", reason: v?.reason || "", adminUid: v?.adminUid || "", ts: v?.ts || 0, duration: v?.duration || 0, expiresAt: v?.expiresAt || 0, userName: v?.userName || '' })));
    });

    // Pinned
    const pinRef = ref(db, FB_PATHS.pinned);
    const unsubPin = onValue(pinRef, (snap) => {
      if (!snap.exists()) { setPinnedMessages([]); return; }
      const val = snap.val();
      setPinnedMessages(Object.entries(val).map(([k, v]: [string, any]) => ({ key: k, pinnedAt: v?.pinnedAt || 0, pinnedBy: v?.pinnedBy || "" })));
    });

    // Bug Monitor logs
    const bugRef = ref(db, "bq_bug_logs");
    const unsubBug = onValue(bugRef, (snap) => {
      if (!snap.exists()) { setBugLogs([]); return; }
      const val = snap.val();
      const logs: BugLogEntry[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        id: k,
        sev: v?.sev || "info",
        cat: v?.cat || "unknown",
        msg: v?.msg || "",
        detail: v?.detail || "",
        ts: v?.ts || 0,
        ua: v?.ua || "",
        url: v?.url || "",
      })).sort((a, b) => b.ts - a.ts);
      setBugLogs(logs);
    });

    return () => {
      off(presRef); off(cfgRef);
      off(banRef); off(mutRef); off(warnRef); off(pinRef);
      off(bugRef);
      setFbConnected(false);
    };
  }, [isAuthed]);

  // ─── DM Conversations: Lightweight REST API fetch ───────────────────────────
  // Uses REST API with shallow=true + targeted meta fetches instead of onValue
  // which would download ALL message bodies for ALL DMs.

  const fetchDmConversations = useCallback(async () => {
    if (!isAuthed) return;
    setDmListLoading(true);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    try {
      const res = await fetch(`/api/admin/chat?type=dms`, {
        headers: { "x-admin-password": pwd },
      });
      if (res.ok) {
        const data = await res.json();
        const convos: DmConversation[] = (data.conversations || []).map((c: any) => ({
          dmId: c.dmId,
          participants: c.participants || [],
          participantNames: c.participantNames || [],
          lastMessage: c.lastMessage || "",
          lastMessageTime: c.lastMessageTime || 0,
          messageCount: c.messageCount || 0,
        }));
        setDmConversations(convos);
      }
    } catch { /* ignore */ }
    finally { setDmListLoading(false); }
  }, [isAuthed, password]);

  // Fetch DM list on auth
  useEffect(() => {
    if (isAuthed) fetchDmConversations();
  }, [isAuthed, fetchDmConversations]);

  // ─── DM Messages: Paginated real-time listener ───────────────────────────

  // When selecting a new DM, reset pagination state
  useEffect(() => {
    if (selectedDm) {
      setDmMessagesPageSize(50);
      setDmHasMoreMessages(false);
      setDmTotalMessageCount(0);
    }
  }, [selectedDm]);

  // Paginated DM messages listener
  useEffect(() => {
    if (!isAuthed || !selectedDm) { setDmMessages([]); return; }
    const db = getFirebaseDb();

    // One-time read to get total message count for this DM
    const countRef = ref(db, `${FB_PATHS.dms}/${selectedDm}/messages`);
    get(countRef).then((snap) => {
      if (snap.exists()) {
        const count = Object.keys(snap.val()).length;
        setDmTotalMessageCount(count);
        setDmHasMoreMessages(count > dmMessagesPageSize);
      } else {
        setDmTotalMessageCount(0);
        setDmHasMoreMessages(false);
      }
    });

    // Paginated real-time listener — only fetch the latest N messages
    const dmMsgQuery = query(
      ref(db, `${FB_PATHS.dms}/${selectedDm}/messages`),
      orderByChild('ts'),
      limitToLast(dmMessagesPageSize)
    );
    const unsub = onValue(dmMsgQuery, (snap) => {
      if (!snap.exists()) { setDmMessages([]); return; }
      const val = snap.val();
      const msgs: ChatMessage[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        key: k, text: v?.text || "", uname: v?.uname || "Unknown", uid: v?.uid || "",
        ts: v?.ts || 0, type: v?.type || "user", edited: v?.edited || false,
        reactions: v?.reactions ? (Array.isArray(v.reactions) ? v.reactions : Object.values(v.reactions)) : [],
      }));
      msgs.sort((a, b) => b.ts - a.ts);
      setDmMessages(msgs);
      setLoadingMoreDmMessages(false);
    });
    return () => { off(dmMsgQuery); };
  }, [isAuthed, selectedDm, dmMessagesPageSize]);

  // Load More DM messages handler
  const loadMoreDmMessages = useCallback(() => {
    setLoadingMoreDmMessages(true);
    setDmMessagesPageSize((prev) => prev + 50);
  }, []);

  // ─── Live Monitor: Real-time listener ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthed) return;
    const db = getFirebaseDb();
    const liveQuery = query(ref(db, FB_PATHS.messages), orderByChild('ts'), limitToLast(200));
    const unsub = onValue(liveQuery, (snap) => {
      if (!snap.exists()) { setLiveMessages([]); return; }
      const val = snap.val();
      const msgs: ChatMessage[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        key: k, text: v?.text || "", uname: v?.uname || "Unknown", uid: v?.uid || "",
        ts: v?.ts || 0, type: v?.type || "user", edited: v?.edited || false,
        reactions: v?.reactions ? (Array.isArray(v.reactions) ? v.reactions : Object.values(v.reactions)) : [],
      }));
      msgs.sort((a, b) => a.ts - b.ts);
      // Check for new messages (sound notification)
      if (liveSoundEnabled && prevLiveMsgCountRef.current > 0 && msgs.length > prevLiveMsgCountRef.current) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880; osc.type = "sine";
          gain.gain.value = 0.1;
          osc.start(); osc.stop(ctx.currentTime + 0.08);
        } catch {}
      }
      prevLiveMsgCountRef.current = msgs.length;
      if (!livePaused) setLiveMessages(msgs);
    });
    return () => { off(liveQuery); };
  }, [isAuthed, livePaused, liveSoundEnabled]);

  // Auto-scroll for live monitor
  useEffect(() => {
    if (liveAutoScroll && liveMessagesEndRef.current) {
      liveMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveMessages, liveAutoScroll]);

  // ─── Auto-Mod: Real-time listener for rules ──────────────────────────────
  useEffect(() => {
    if (!isAuthed) return;
    const db = getFirebaseDb();
    const rulesRef = ref(db, FB_PATHS.autoModRules);
    const unsubRules = onValue(rulesRef, (snap) => {
      if (!snap.exists()) { setAutoModRules([]); return; }
      const val = snap.val();
      const rules: AutoModRule[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        id: k, trigger: v?.trigger || "word", pattern: v?.pattern || "",
        action: v?.action || "delete", duration: v?.duration || 1, enabled: v?.enabled ?? true,
      }));
      setAutoModRules(rules);
    });
    const logRef = ref(db, FB_PATHS.autoModLog);
    const unsubLog = onValue(logRef, (snap) => {
      if (!snap.exists()) { setAutoModLog([]); return; }
      const val = snap.val();
      const entries: AutoModLogEntry[] = Object.entries(val).map(([k, v]: [string, any]) => ({
        id: k, ruleId: v?.ruleId || "", uid: v?.uid || "", userName: v?.userName || "",
        trigger: v?.trigger || "", action: v?.action || "", messageText: v?.messageText || "",
        ts: v?.ts || 0,
      }));
      entries.sort((a, b) => b.ts - a.ts);
      setAutoModLog(entries.slice(0, 10));
    });
    // Chat frozen listener
    const frozenRef = ref(db, "bq_widget_config/chatFrozen");
    const unsubFrozen = onValue(frozenRef, (snap) => {
      setChatFrozen(snap.exists() && snap.val() === true);
    });
    return () => { off(rulesRef); off(logRef); off(frozenRef); };
  }, [isAuthed]);

  // ─── Fetch data (file stats) ──────────────────────────────────────────────

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
  useEffect(() => { if (!isAuthed) return; const i = setInterval(() => { fetchData(); }, 30000); return () => clearInterval(i); }, [isAuthed, fetchData]);

  // ─── Widget Config Write (immediate to Firebase) ──────────────────────────

  const writeWidgetConfig = useCallback((key: string, value: unknown) => {
    setWidgetConfig((prev) => ({ ...prev, [key]: value }));
    setSyncingKey(key);
    const db = getFirebaseDb();
    const cfgRef = ref(db, FB_PATHS.config);
    // Use the API route which does a Firebase PATCH (preserves other fields)
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    fetch("/api/admin/widget-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd },
      body: JSON.stringify({ [key]: value }),
    }).then(() => setSyncingKey(null)).catch(() => setSyncingKey(null));
  }, [password]);

  // ─── Firebase Admin Actions ───────────────────────────────────────────────

  const deleteMessage = useCallback(async (msgKey: string, context: "global" | "dm", dmId?: string) => {
    const db = getFirebaseDb();
    const path = context === "global" ? `${FB_PATHS.messages}/${msgKey}` : `${FB_PATHS.dms}/${dmId}/messages/${msgKey}`;
    await remove(ref(db, path));
    // Real-time listener will update state automatically
  }, []);

  const clearAllMessages = useCallback(async (context: "global" | "dm", dmId?: string) => {
    const db = getFirebaseDb();
    const path = context === "global" ? FB_PATHS.messages : `${FB_PATHS.dms}/${dmId}/messages`;
    await remove(ref(db, path));
    setClearAllConfirm(false);
    setActionMsg(context === "global" ? "All global messages cleared" : "DM messages cleared");
    setTimeout(() => setActionMsg(""), 3000);
  }, []);

  const sendAnnouncement = useCallback(async () => {
    if (!announcementText.trim()) return;
    setAnnouncementSending(true);
    try {
      const db = getFirebaseDb();
      await push(ref(db, FB_PATHS.messages), {
        text: announcementText.trim(), uname: "System", uid: "system",
        ts: Date.now(), type: "system", edited: false,
      });
      setAnnouncementText("");
      setActionMsg("Announcement sent!");
      setTimeout(() => setActionMsg(""), 3000);
    } catch { /* ignore */ }
    finally { setAnnouncementSending(false); }
  }, [announcementText]);

  const kickUser = useCallback(async (uid: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.presence}/${uid}`));
  }, []);

  const banUser = useCallback(async (uid: string, reason?: string, duration?: number) => {
    const db = getFirebaseDb();
    const now = Date.now();
    const expiresAt = duration && duration > 0 ? now + duration * 3600000 : 0;
    await set(ref(db, `${FB_PATHS.banned}/${uid}`), { bannedAt: now, reason: reason || "No reason provided", duration: duration || 0, expiresAt });
    await remove(ref(db, `${FB_PATHS.presence}/${uid}`));
    setBanDialogUid(null);
    setBanReason("");
    setBanDuration(0);
  }, []);

  const unbanUser = useCallback(async (uid: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.banned}/${uid}`));
  }, []);

  const muteUser = useCallback(async (uid: string, reason: string, duration?: number) => {
    const db = getFirebaseDb();
    const now = Date.now();
    const expiresAt = duration && duration > 0 ? now + duration * 3600000 : 0;
    await set(ref(db, `${FB_PATHS.muted}/${uid}`), { mutedAt: now, reason: reason || "No reason provided", duration: duration || 0, expiresAt });
    setMuteDialogUid(null);
    setMuteReason("");
    setMuteDuration(1);
  }, []);

  const unmuteUser = useCallback(async (uid: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.muted}/${uid}`));
  }, []);

  const warnUser = useCallback(async (uid: string, reason: string, duration?: number) => {
    const db = getFirebaseDb();
    const now = Date.now();
    const expiresAt = duration && duration > 0 ? now + duration * 3600000 : 0;
    // Look up username from online users
    const onlineUser = onlineUsers.find(u => u.uid === uid);
    const userName = onlineUser?.name || '';
    await push(ref(db, FB_PATHS.warnings), {
      uid, reason: reason || "No reason provided", adminUid: "admin", ts: now,
      duration: duration || 0, expiresAt, userName,
    });
    setWarnDialogUid(null);
    setWarnReason("");
    setWarnDuration(0);
  }, [onlineUsers]);

  const pinMessage = useCallback(async (msgKey: string) => {
    const db = getFirebaseDb();
    await set(ref(db, `${FB_PATHS.pinned}/${msgKey}`), { pinnedAt: Date.now(), pinnedBy: "admin" });
  }, []);

  const unpinMessage = useCallback(async (msgKey: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.pinned}/${msgKey}`));
  }, []);

  const removeWarning = useCallback(async (warnKey: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.warnings}/${warnKey}`));
  }, []);

  const clearAllWarnings = useCallback(async () => {
    const db = getFirebaseDb();
    await remove(ref(db, FB_PATHS.warnings));
    setActionMsg("All warnings cleared");
    setTimeout(() => setActionMsg(""), 3000);
  }, []);

  const clearAllBans = useCallback(async () => {
    const db = getFirebaseDb();
    await remove(ref(db, FB_PATHS.banned));
    setActionMsg("All bans cleared");
    setTimeout(() => setActionMsg(""), 3000);
  }, []);

  const clearAllMutes = useCallback(async () => {
    const db = getFirebaseDb();
    await remove(ref(db, FB_PATHS.muted));
    setActionMsg("All mutes cleared");
    setTimeout(() => setActionMsg(""), 3000);
  }, []);

  const bulkDeleteMessages = useCallback(async (msgKeys: string[], context: "global" | "dm", dmId?: string) => {
    const db = getFirebaseDb();
    const basePath = context === "global" ? FB_PATHS.messages : `${FB_PATHS.dms}/${dmId}/messages`;
    await Promise.all(msgKeys.map((k) => remove(ref(db, `${basePath}/${k}`))));
    setSelectedChatMessages(new Set());
  }, []);

  // ─── Broadcast ────────────────────────────────────────────────────────────

  const sendBroadcast = useCallback(async () => {
    if (!broadcastText.trim()) return;
    setBroadcastSending(true);
    try {
      const db = getFirebaseDb();
      const priorityStyles: Record<string, string> = {
        normal: "📢",
        important: "⚠️",
        urgent: "🚨",
      };
      const prefix = priorityStyles[broadcastPriority] || "📢";
      const text = broadcastPriority !== "normal" ? `${prefix} [${broadcastPriority.toUpperCase()}] ${broadcastText.trim()}` : broadcastText.trim();
      await push(ref(db, FB_PATHS.messages), {
        text,
        uname: broadcastAsSystem ? "System" : "Admin",
        uid: broadcastAsSystem ? "system" : "admin",
        ts: Date.now(),
        type: broadcastAsSystem ? "system" : "user",
        edited: false,
        priority: broadcastPriority,
      });
      setBroadcastText("");
      setBroadcastPriority("normal");
      setActionMsg("Broadcast sent!");
      setTimeout(() => setActionMsg(""), 3000);
    } catch { /* ignore */ }
    finally { setBroadcastSending(false); }
  }, [broadcastText, broadcastAsSystem, broadcastPriority]);

  const refreshOnlineUsers = useCallback(() => {
    const db = getFirebaseDb();
    const presRef = ref(db, FB_PATHS.presence);
    get(presRef).then((snap) => {
      if (!snap.exists()) { setOnlineUsers([]); return; }
      const val = snap.val();
      const users: PresenceUser[] = Object.entries(val).map(([uid, v]: [string, any]) => ({
        uid, ts: v?.ts, name: v?.name, status: v?.status,
      }));
      setOnlineUsers(users);
    });
  }, []);

  // ─── Auto-Mod Actions ──────────────────────────────────────────────────────

  const saveAutoModRule = useCallback(async (rule: Omit<AutoModRule, "id">) => {
    const db = getFirebaseDb();
    const newRef = push(ref(db, FB_PATHS.autoModRules));
    await set(newRef, { ...rule, id: newRef.key });
    setShowAddRule(false);
    setNewRulePattern("");
    setTestModText("");
    showActionMsg("Rule created");
  }, []);

  const deleteAutoModRule = useCallback(async (ruleId: string) => {
    const db = getFirebaseDb();
    await remove(ref(db, `${FB_PATHS.autoModRules}/${ruleId}`));
    showActionMsg("Rule deleted");
  }, []);

  const toggleAutoModRule = useCallback(async (ruleId: string, enabled: boolean) => {
    const db = getFirebaseDb();
    await set(ref(db, `${FB_PATHS.autoModRules}/${ruleId}/enabled`), !enabled);
  }, []);

  const testAutoModRules = useCallback((text: string): { rule: AutoModRule; matched: boolean }[] => {
    return autoModRules.filter(r => r.enabled).map(rule => {
      let matched = false;
      switch (rule.trigger) {
        case "word": matched = text.toLowerCase().includes(rule.pattern.toLowerCase()); break;
        case "regex": try { matched = new RegExp(rule.pattern, "i").test(text); } catch { matched = false; } break;
        case "caps": matched = text.length > 5 && text === text.toUpperCase() && /[A-Z]/.test(text); break;
        case "spam": matched = (text.match(/(.)\1{4,}/g) || []).length > 0; break;
        case "length": matched = text.length > parseInt(rule.pattern) || 500; break;
      }
      return { rule, matched };
    });
  }, [autoModRules]);

  const initPresetRules = useCallback(async () => {
    const db = getFirebaseDb();
    const presets: Omit<AutoModRule, "id">[] = [
      { trigger: "word", pattern: "badword,damn,hell,crap", action: "delete", duration: 0, enabled: true },
      { trigger: "caps", pattern: "", action: "warn", duration: 1, enabled: true },
      { trigger: "spam", pattern: "", action: "mute", duration: 1, enabled: true },
      { trigger: "length", pattern: "500", action: "delete", duration: 0, enabled: true },
    ];
    for (const p of presets) {
      const newRef = push(ref(db, FB_PATHS.autoModRules));
      await set(newRef, { ...p, id: newRef.key });
    }
    showActionMsg("Preset rules added");
  }, []);

  // ─── Emergency Actions ─────────────────────────────────────────────────────

  const triggerPanic = useCallback(async () => {
    writeWidgetConfig("maintenanceEnabled", true);
    writeWidgetConfig("widgetEnabled", false);
    showActionMsg("⚠️ PANIC MODE ACTIVATED — Maintenance ON, Widget OFF");
  }, [writeWidgetConfig]);

  const toggleLockdown = useCallback(async (enable: boolean) => {
    if (enable) {
      writeWidgetConfig("slowMode", true);
      writeWidgetConfig("slowModeInterval", 60);
      writeWidgetConfig("rateLimitEnabled", true);
      writeWidgetConfig("profanityFilter", true);
      writeWidgetConfig("linkFilter", true);
      showActionMsg("🔒 Lockdown mode ENABLED — All restrictions active");
    } else {
      writeWidgetConfig("slowMode", false);
      writeWidgetConfig("linkFilter", false);
      showActionMsg("🔓 Lockdown mode DISABLED");
    }
  }, [writeWidgetConfig]);

  const nukeChat = useCallback(async () => {
    const db = getFirebaseDb();
    await remove(ref(db, FB_PATHS.messages));
    await remove(ref(db, FB_PATHS.dms));
    await remove(ref(db, FB_PATHS.warnings));
    setNukeConfirmStep(0);
    showActionMsg("💣 NUKE COMPLETE — All messages, DMs, and warnings cleared");
  }, []);

  const massKickAll = useCallback(async () => {
    const db = getFirebaseDb();
    await remove(ref(db, FB_PATHS.presence));
    setMassKickConfirm(false);
    showActionMsg("👢 All users kicked");
  }, []);

  const toggleChatFreeze = useCallback(async (freeze: boolean) => {
    const db = getFirebaseDb();
    if (freeze) {
      await set(ref(db, "bq_widget_config/chatFrozen"), true);
      showActionMsg("❄️ Chat FROZEN — Read-only mode");
    } else {
      await remove(ref(db, "bq_widget_config/chatFrozen"));
      showActionMsg("💬 Chat UNFROZEN — Users can send messages");
    }
  }, []);

  // ─── Firebase Health Actions ───────────────────────────────────────────────

  const measureFbLatency = useCallback(async () => {
    const db = getFirebaseDb();
    const start = performance.now();
    try {
      const testRef = ref(db, "bq_widget_config/_health_ping");
      await set(testRef, Date.now());
      await get(testRef);
      await remove(testRef);
      const ms = Math.round(performance.now() - start);
      setFbLatency(ms);
      setFbHealthStatus(ms < 200 ? "healthy" : ms < 500 ? "degraded" : "down");
    } catch {
      setFbLatency(null);
      setFbHealthStatus("down");
    }
  }, []);

  const runFbDiagnostics = useCallback(async () => {
    setFbDiagRunning(true);
    setFbDiagResults(null);
    const db = getFirebaseDb();
    const results: Record<string, { ok: boolean; ms: number; error?: string }> = {};
    // Test 1: Read
    try {
      const t0 = performance.now();
      await get(ref(db, FB_PATHS.config));
      results.read = { ok: true, ms: Math.round(performance.now() - t0) };
    } catch (e: any) {
      results.read = { ok: false, ms: 0, error: e.message };
    }
    // Test 2: Write
    try {
      const t0 = performance.now();
      await set(ref(db, "bq_widget_config/_diag"), Date.now());
      results.write = { ok: true, ms: Math.round(performance.now() - t0) };
    } catch (e: any) {
      results.write = { ok: false, ms: 0, error: e.message };
    }
    // Test 3: Delete
    try {
      const t0 = performance.now();
      await remove(ref(db, "bq_widget_config/_diag"));
      results.delete = { ok: true, ms: Math.round(performance.now() - t0) };
    } catch (e: any) {
      results.delete = { ok: false, ms: 0, error: e.message };
    }
    // Test 4: Messages node
    try {
      const t0 = performance.now();
      const snap = await get(ref(db, FB_PATHS.messages));
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      results.messages = { ok: true, ms: Math.round(performance.now() - t0) };
    } catch (e: any) {
      results.messages = { ok: false, ms: 0, error: e.message };
    }
    setFbDiagResults(results);
    setFbDiagRunning(false);
  }, []);

  // Measure latency on mount and periodically
  useEffect(() => {
    if (!isAuthed) return;
    measureFbLatency();
    const interval = setInterval(measureFbLatency, 30000);
    return () => clearInterval(interval);
  }, [isAuthed, measureFbLatency]);

  // ─── Chat Export ──────────────────────────────────────────────────────────

  const exportChat = useCallback((msgs: ChatMessage[], filename: string) => {
    const blob = new Blob([JSON.stringify(msgs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, []);

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

  const copyShareLink = useCallback((shareId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}?share=${shareId}`);
    setCopiedShareId(shareId);
    setTimeout(() => setCopiedShareId(null), 2000);
  }, []);

  // ─── Widget Refresh ────────────────────────────────────────────────────

  const handleWidgetRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent("bq-admin-refresh"));
    const oldScript = document.getElementById("bq-chat-script"); if (oldScript) oldScript.remove();
    const oldBubble = document.getElementById("bqb"); if (oldBubble) oldBubble.remove();
    const oldPanel = document.getElementById("bqp"); if (oldPanel) oldPanel.remove();
    const script = document.createElement("script"); script.id = "bq-chat-script"; script.src = `/chat-widget.js?t=${Date.now()}`;
    document.body.appendChild(script);
    setWidgetRefreshToast(true); setTimeout(() => setWidgetRefreshToast(false), 2000);
  }, []);

  // ─── Settings: Export/Import/Reset ─────────────────────────────────────

  const handleExportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(widgetConfig, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "bioquiz-widget-config.json"; a.click(); URL.revokeObjectURL(url);
  }, [widgetConfig]);

  const handleImportConfig = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text(); const config = JSON.parse(text);
      setWidgetConfig({ ...defaultWidgetConfig, ...config });
      const pwd = password || sessionStorage.getItem("admin-auth") || "";
      await fetch("/api/admin/widget-config", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": pwd }, body: JSON.stringify(config) });
    } catch { /* ignore */ }
    e.target.value = "";
  }, [password]);

  const handleResetDefaults = useCallback(async () => {
    setWidgetConfig(defaultWidgetConfig);
    const pwd = password || sessionStorage.getItem("admin-auth") || "";
    await fetch("/api/admin/widget-config", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": pwd }, body: JSON.stringify(defaultWidgetConfig) });
    setShowResetConfirm(false);
  }, [password]);

  const handlePasswordChange = useCallback(() => {
    if (!newPassword || newPassword !== confirmPassword) { setPasswordMsg("Passwords do not match"); return; }
    setPasswordMsg("Password updated locally"); sessionStorage.setItem("admin-auth", newPassword); setPassword(newPassword);
    setNewPassword(""); setConfirmPassword(""); setTimeout(() => setPasswordMsg(""), 3000);
  }, [newPassword, confirmPassword]);

  // ─── Magic Link Generation ──────────────────────────────────────────────────

  const generateMagicLink = useCallback(async () => {
    if (!magicLinkUsername.trim()) { setMagicLinkError("Enter a username"); return; }
    setMagicLinkGenerating(true); setMagicLinkError(""); setMagicLinkGenerated(null);
    try {
      const db = getFirebaseDb();
      const name = magicLinkUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (!name) { setMagicLinkError("Invalid username"); setMagicLinkGenerating(false); return; }

      // Look up UID from bq_usernames
      const uidSnap = await get(ref(db, `bq_usernames/${name}`));
      if (!uidSnap.exists()) { setMagicLinkError(`@${name} not found in registry`); setMagicLinkGenerating(false); return; }
      const uid = uidSnap.val();

      // Generate a secure random token (32 bytes = 64 hex chars)
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes, b => b.toString(16).padStart(2, "0")).join("");

      const now = Date.now();
      const expiresAt = magicLinkExpiry > 0 ? now + magicLinkExpiry * 3600000 : 0; // 0 = never expires

      const linkData = {
        uid,
        username: name,
        createdAt: now,
        expiresAt,
        oneTime: magicLinkOneTime,
        used: false,
        adminCreated: true,
      };

      // Store in Firebase
      await set(ref(db, `bq_admin_magic_links/${token}`), linkData);

      // Build the magic URL
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const magicUrl = `${baseUrl}/?magic=${token}`;

      setMagicLinkGenerated(magicUrl);

      // Refresh history
      loadMagicLinkHistory();
    } catch (err) {
      setMagicLinkError("Failed to generate link: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setMagicLinkGenerating(false);
    }
  }, [magicLinkUsername, magicLinkExpiry, magicLinkOneTime]);

  const loadMagicLinkHistory = useCallback(async () => {
    setMagicLinkLoading(true);
    try {
      const db = getFirebaseDb();
      const snap = await get(ref(db, "bq_admin_magic_links"));
      if (!snap.exists()) { setMagicLinkHistory([]); setMagicLinkLoading(false); return; }
      const links: typeof magicLinkHistory = [];
      snap.forEach((child) => {
        const v = child.val();
        links.push({
          token: child.key || "",
          username: v.username || "?",
          createdAt: v.createdAt || 0,
          expiresAt: v.expiresAt || 0,
          oneTime: v.oneTime ?? true,
          used: v.used ?? false,
          usedBy: v.usedBy,
          usedAt: v.usedAt,
        });
      });
      // Sort newest first
      links.sort((a, b) => b.createdAt - a.createdAt);
      setMagicLinkHistory(links);
    } catch {
      setMagicLinkHistory([]);
    } finally {
      setMagicLinkLoading(false);
    }
  }, []);

  const revokeMagicLink = useCallback(async (token: string) => {
    try {
      const db = getFirebaseDb();
      await remove(ref(db, `bq_admin_magic_links/${token}`));
      loadMagicLinkHistory();
      showActionMsg("Magic link revoked");
    } catch { /* ignore */ }
  }, [loadMagicLinkHistory, showActionMsg]);

  const revokeAllMagicLinks = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      await remove(ref(db, "bq_admin_magic_links"));
      setMagicLinkHistory([]);
      showActionMsg("All magic links revoked");
    } catch { /* ignore */ }
  }, [showActionMsg]);

  // Load magic link history when security section is active
  useEffect(() => {
    if (!isAuthed || section !== "security") return;
    loadMagicLinkHistory();
  }, [isAuthed, section, loadMagicLinkHistory]);

  // ─── Filtered files ──────────────────────────────────────────────────────

  const getFilteredFiles = useCallback(() => {
    if (!data) return [];
    let files = [...data.recentFiles];
    if (searchQuery) { const q = searchQuery.toLowerCase(); files = files.filter((f) => f.name.toLowerCase().includes(q) || f.mimeType.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q))); }
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

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(catId)) next.delete(catId); else next.add(catId); return next; });
  }, []);

  const navigateTo = useCallback((s: Section) => {
    setSection(s); setSidebarOpen(false);
    const catId = categoryForSection(s);
    setExpandedCategories((prev) => { if (prev.has(catId)) return prev; const next = new Set(prev); next.add(catId); return next; });
  }, []);

  // ─── Computed values ──────────────────────────────────────────────────────

  const msgsToday = globalMessages.filter((m) => new Date(m.ts).toDateString() === new Date().toDateString()).length;
  const activeChatters = new Set(globalMessages.filter((m) => m.type !== "system").map((m) => m.uid)).size;
  const isPinned = (key: string) => pinnedMessages.some((p) => p.key === key);
  const isBanned = (uid: string) => bannedUsers.some((b) => b.uid === uid);
  const isMuted = (uid: string) => mutedUsers.some((m) => m.uid === uid);

  // Expiry helpers
  const isExpired = (expiresAt: number) => expiresAt > 0 && Date.now() > expiresAt;
  const formatDuration = (hours: number) => {
    if (hours <= 0) return "Permanent";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remaining = hours % 24;
    return remaining > 0 ? `${days}d ${remaining}h` : `${days}d`;
  };
  const formatExpiry = (expiresAt: number) => {
    if (!expiresAt) return "Never (Permanent)";
    if (isExpired(expiresAt)) return "Expired";
    const diff = expiresAt - Date.now();
    if (diff < 60000) return "Less than 1 min";
    if (diff < 3600000) return `${Math.ceil(diff / 60000)} min remaining`;
    if (diff < 86400000) return `${Math.ceil(diff / 3600000)} hr remaining`;
    return `${Math.ceil(diff / 86400000)} days remaining`;
  };

  // Active warnings = non-expired
  const activeWarnings = warnings.filter((w) => !isExpired(w.expiresAt));
  const expiredWarnings = warnings.filter((w) => isExpired(w.expiresAt));
  const activeBans = bannedUsers.filter((b) => !isExpired(b.expiresAt));
  const activeMutes = mutedUsers.filter((m) => !isExpired(m.expiresAt));

  // Resolve username from uid
  const resolveUserName = (uid: string) => {
    const online = onlineUsers.find(u => u.uid === uid);
    if (online?.name) return online.name as string;
    // Check warnings for cached username
    const warned = warnings.find(w => w.uid === uid && w.userName);
    if (warned?.userName) return warned.userName;
    return uid;
  };

  // Peak hour calculation
  const peakHour = (() => {
    if (globalMessages.length === 0) return "N/A";
    const hours: Record<number, number> = {};
    globalMessages.forEach((m) => { const h = new Date(m.ts).getHours(); hours[h] = (hours[h] || 0) + 1; });
    const peak = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
    return peak ? `${peak[0]}:00` : "N/A";
  })();

  // Most active user
  const mostActiveUser = (() => {
    if (globalMessages.length === 0) return "N/A";
    const counts: Record<string, number> = {};
    globalMessages.filter((m) => m.type !== "system").forEach((m) => { counts[m.uname] = (counts[m.uname] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "N/A";
  })();

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
      {widgetRefreshToast && (
        <div className="fixed top-4 right-4 z-50 animate-[fade-up_0.2s_ease_both] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
          <Check className="h-4 w-4 text-green-500" /><span className="text-xs font-medium">Widget refreshed</span>
        </div>
      )}

      {/* Warn Dialog */}
      {warnDialogUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-[fade-up_0.2s_ease_both]">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/10"><AlertTriangle className="h-4 w-4 text-orange-500" /></div>
              <h3 className="text-sm font-semibold">Warn User</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">User: {resolveUserName(warnDialogUid)}</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Reason</span>
                <input type="text" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} placeholder="Warning reason..." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-xs font-medium">{warnDuration === 0 ? "Permanent" : formatDuration(warnDuration)}</span>
                </div>
                <select value={warnDuration} onChange={(e) => setWarnDuration(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                  <option value={0}>Permanent (No Expiry)</option>
                  <option value={0.5}>30 Minutes</option>
                  <option value={1}>1 Hour</option>
                  <option value={3}>3 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>1 Day</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                  <option value={720}>1 Month</option>
                </select>
                {warnDuration > 0 && (
                  <p className="text-[10px] text-muted-foreground">Warning will auto-expire and be removed after {formatDuration(warnDuration)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
              <button onClick={() => { setWarnDialogUid(null); setWarnReason(""); setWarnDuration(0); }} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button>
              <button onClick={() => warnUser(warnDialogUid, warnReason, warnDuration)} className="h-8 px-3 rounded-lg bg-orange-500 text-white text-xs font-medium transition-colors hover:bg-orange-600">Warn</button>
            </div>
          </div>
        </div>
      )}

      {/* Mute Dialog */}
      {muteDialogUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-[fade-up_0.2s_ease_both]">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-500/10"><VolumeX className="h-4 w-4 text-yellow-600" /></div>
              <h3 className="text-sm font-semibold">Mute User</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">User: {resolveUserName(muteDialogUid)}</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Reason</span>
                <input type="text" value={muteReason} onChange={(e) => setMuteReason(e.target.value)} placeholder="Mute reason..." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-xs font-medium">{muteDuration === 0 ? "Permanent" : formatDuration(muteDuration)}</span>
                </div>
                <select value={muteDuration} onChange={(e) => setMuteDuration(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                  <option value={0.5}>30 Minutes</option>
                  <option value={1}>1 Hour</option>
                  <option value={3}>3 Hours</option>
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>1 Day</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                  <option value={0}>Permanent</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
              <button onClick={() => { setMuteDialogUid(null); setMuteReason(""); setMuteDuration(1); }} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button>
              <button onClick={() => muteUser(muteDialogUid, muteReason, muteDuration)} className="h-8 px-3 rounded-lg bg-yellow-600 text-white text-xs font-medium transition-colors hover:bg-yellow-700">Mute</button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Dialog */}
      {banDialogUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-[fade-up_0.2s_ease_both]">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/10"><Ban className="h-4 w-4 text-red-500" /></div>
              <h3 className="text-sm font-semibold">Ban User</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">User: {resolveUserName(banDialogUid)}</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Reason</span>
                <input type="text" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Ban reason..." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-xs font-medium">{banDuration === 0 ? "Permanent" : formatDuration(banDuration)}</span>
                </div>
                <select value={banDuration} onChange={(e) => setBanDuration(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                  <option value={0}>Permanent Ban</option>
                  <option value={1}>1 Hour</option>
                  <option value={6}>6 Hours</option>
                  <option value={24}>1 Day</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                  <option value={720}>1 Month</option>
                </select>
                {banDuration > 0 && (
                  <p className="text-[10px] text-muted-foreground">Ban will auto-expire after {formatDuration(banDuration)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-[10px] text-red-400">Banning will immediately disconnect the user and block all future access.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
              <button onClick={() => { setBanDialogUid(null); setBanReason(""); setBanDuration(0); }} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button>
              <button onClick={() => banUser(banDialogUid, banReason, banDuration)} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium transition-colors hover:bg-red-600">Ban</button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-card border-r border-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {SIDEBAR.map((cat) => {
            const isExpanded = expandedCategories.has(cat.id);
            const hasActive = cat.items.some((it) => it.id === section);
            return (
              <div key={cat.id} className="mb-1">
                <button onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${hasActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <cat.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">{cat.label}</span>
                  <ChevronRight className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {cat.items.map((item) => {
                      const isActive = section === item.id;
                      return (
                        <button key={item.id} onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02]"}`}>
                          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-foreground" />}
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

        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${fbConnected ? "bg-green-500" : "bg-red-500"}`} />
              {fbConnected ? "Real-time" : "Offline"}
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
              <button onClick={handleWidgetRefresh} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><RotateCcw className="h-4 w-4" /></button>
              <button onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <header className="hidden lg:block sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-12 items-center justify-between px-8">
            <div className="flex items-center gap-2">
              {(() => { const cat = SIDEBAR.find((c) => c.items.some((it) => it.id === section)); const item = cat?.items.find((it) => it.id === section); if (!item || !cat) return null; return (<><item.icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{item.label}</span><span className="text-[10px] text-muted-foreground">{cat.label}</span></>); })()}
              {widgetConfig.maintenanceEnabled && <span className="ml-3 flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500"><Wrench className="h-3 w-3" />Maintenance Mode</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={`inline-block h-1.5 w-1.5 rounded-full ${fbConnected ? "bg-green-500" : "bg-red-500"}`} />{fbConnected ? "Real-time" : "Offline"}</span>
              <button onClick={() => fetchData()} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {loading && !data ? (
            <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" /></div>
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
                  {/* Chat overview stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={MessageSquare} label="Chat Messages" value={String(globalMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Users} label="Online Users" value={String(onlineUsers.length)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={MessageCircle} label="Active DMs" value={String(dmConversations.length)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={Activity} label="Messages Today" value={String(msgsToday)} color="oklch(0.65 0.2 25)" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><BarChart3 className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Storage by Category</h2></div>
                      <div className="space-y-3">
                        {data.categoryDistribution.map((cat) => {
                          const pct = data.stats.totalSize > 0 ? (cat.size / data.stats.totalSize) * 100 : 0;
                          const color = categoryColors[cat.category] || categoryColors.file;
                          return (<div key={cat.category} className="flex flex-col gap-1.5"><div className="flex items-center justify-between text-xs"><span className="capitalize font-medium">{cat.category}</span><span className="text-muted-foreground">{cat.sizeFormatted} · {cat.count} file{cat.count !== 1 ? "s" : ""}</span></div><div className="h-2 overflow-hidden rounded-full bg-foreground/5"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, background: color }} /></div></div>);
                        })}
                        {data.categoryDistribution.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><Activity className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Upload Activity (7 days)</h2></div>
                      <div className="space-y-3">
                        {data.uploadsByDay.map((day) => { const maxCount = Math.max(...data.uploadsByDay.map((d) => d.count), 1); const pct = (day.count / maxCount) * 100; return (<div key={day.date} className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground w-20 shrink-0 tabular-nums">{new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><div className="flex-1 h-6 overflow-hidden rounded-md bg-foreground/5"><div className="h-full rounded-md transition-all duration-500 flex items-center px-2" style={{ width: `${Math.max(pct, 8)}%`, background: "oklch(0.7 0.12 250 / 0.6)" }}><span className="text-[10px] font-medium text-background whitespace-nowrap">{day.count}</span></div></div></div>); })}
                        {data.uploadsByDay.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No uploads in the last 7 days</p>}
                      </div>
                    </div>
                  </div>
                  {storageData && storageData.topDownloaded.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><TrendingUp className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Top Downloaded</h2></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {storageData.topDownloaded.map((f, i) => (<div key={f.id} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"><span className="text-xs font-bold text-muted-foreground">{i + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.downloads} dl · {f.sizeFormatted}</p></div></div>))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ─── ACTIVITY ──────────────────────────────────────────── */}
              {section === "activity" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Online Now" value={String(onlineUsers.length)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={MessageSquare} label="Total Messages" value={String(totalMessageCount || globalMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Activity} label="Messages Today" value={String(msgsToday)} color="oklch(0.75 0.15 200)" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Online Users</h2><span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-500 font-medium">{onlineUsers.length} online</span></div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {onlineUsers.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-8">No users currently online</p>) : (
                        <div className="space-y-2">
                          {onlineUsers.map((user) => {
                            const userName = (user.name as string) || user.uid || "Anonymous";
                            const status = (user.status as string) || "online";
                            const statusColor = status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-red-500";
                            return (<div key={user.uid} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">{userName.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{userName}</p><p className="text-[10px] text-muted-foreground">Last seen: {user.ts ? new Date(user.ts).toLocaleTimeString() : "Unknown"}</p></div><span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor}`} title={status} /></div>);
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><MessageSquare className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Recent Messages</h2></div>
                    <div className="max-h-96 overflow-y-auto">
                      {globalMessages.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-8">No recent messages</p>) : (
                        <div className="space-y-2">
                          {globalMessages.slice(0, 20).map((msg) => {
                            const isSystem = msg.type === "system";
                            return (<div key={msg.key} className={`flex items-start gap-3 rounded-xl border border-border p-3 ${isSystem ? "bg-foreground/[0.02]" : "bg-background"}`}><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${isSystem ? "bg-foreground/5 text-muted-foreground" : "bg-foreground/10"}`}>{isSystem ? "S" : msg.uname.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`text-xs font-medium ${isSystem ? "text-muted-foreground" : ""}`}>{isSystem ? "System" : msg.uname}</span>{msg.ts > 0 && <span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleTimeString()}</span>}</div><p className={`text-xs mt-0.5 truncate ${isSystem ? "text-muted-foreground" : ""}`}>{msg.text || "(empty)"}</p></div></div>);
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Activity Log */}
                  {warnings.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><AlertTriangle className="h-4 w-4 text-orange-500" /><h2 className="text-sm font-semibold">Recent Warnings</h2></div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {warnings.sort((a, b) => b.ts - a.ts).slice(0, 20).map((w) => (
                          <div key={w.key} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500/10 text-orange-500"><AlertTriangle className="h-3.5 w-3.5" /></div>
                            <div className="min-w-0 flex-1"><p className="text-xs font-medium">UID: {w.uid}</p><p className="text-[10px] text-muted-foreground">{w.reason} · {new Date(w.ts).toLocaleString()}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── GLOBAL CHAT ───────────────────────────────────────── */}
              {section === "global-chat" && (
                <div className="flex flex-col gap-6">
                  {actionMsg && (<div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 animate-[fade-up_0.2s_ease_both]"><Check className="h-4 w-4 text-green-500" /><span className="text-xs font-medium text-green-500">{actionMsg}</span></div>)}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard icon={MessageSquare} label="Total Messages" value={String(totalMessageCount || globalMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Activity} label="Messages Today" value={String(msgsToday)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={Users} label="Active Chatters" value={String(activeChatters)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Clock} label="Peak Hour" value={peakHour} color="oklch(0.65 0.2 25)" />
                    <StatCard icon={TrendingUp} label="Most Active" value={mostActiveUser.length > 10 ? mostActiveUser.slice(0, 10) + "..." : mostActiveUser} color="oklch(0.68 0.12 60)" />
                  </div>

                  {/* Pinned Messages */}
                  {pinnedMessages.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-center gap-2 p-4 border-b border-amber-500/10">
                        <Pin className="h-4 w-4 text-amber-500" /><h2 className="text-sm font-semibold text-amber-500">Pinned Messages</h2>
                      </div>
                      <div className="divide-y divide-amber-500/10">
                        {pinnedMessages.map((pin) => {
                          const msg = globalMessages.find((m) => m.key === pin.key);
                          if (!msg) return null;
                          return (
                            <div key={pin.key} className="flex items-start gap-3 px-4 py-3">
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-500/10 text-amber-500"><Pin className="h-3.5 w-3.5" /></div>
                              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium">{msg.uname}</span><span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleString()}</span></div><p className="text-xs mt-0.5 break-words">{msg.text}</p></div>
                              <button onClick={() => unpinMessage(pin.key)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Unpin"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Send Announcement */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><Megaphone className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Send Announcement</h2></div>
                    <div className="flex gap-2">
                      <input type="text" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendAnnouncement()} placeholder="Type an announcement message..." className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-foreground/30" />
                      <button onClick={sendAnnouncement} disabled={!announcementText.trim() || announcementSending} className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-40 shrink-0">
                        {announcementSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Megaphone className="h-3.5 w-3.5" />}Send
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card">
                    <div className="flex flex-col gap-4 p-6 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Global Messages</h2><span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">Live</span></div>
                        <div className="flex items-center gap-2">
                          {selectedChatMessages.size > 0 && (
                            <button onClick={() => bulkDeleteMessages(Array.from(selectedChatMessages), "global")} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/20">
                              <Trash className="h-3.5 w-3.5" />Delete ({selectedChatMessages.size})
                            </button>
                          )}
                          <button onClick={() => exportChat(globalMessages, "global-chat.json")} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5"><DownloadCloud className="h-3.5 w-3.5" />Export</button>
                          {!clearAllConfirm ? (
                            <button onClick={() => setClearAllConfirm(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" />Clear All</button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => clearAllMessages("global")} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium">Confirm</button>
                              <button onClick={() => setClearAllConfirm(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} placeholder="Search loaded messages..." className="h-10 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5" />
                      </div>
                      {totalMessageCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Showing {globalMessages.length} of {totalMessageCount} messages</span>
                          {chatSearchQuery && <span className="text-[10px] text-muted-foreground">Search limited to loaded messages</span>}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {globalMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center"><div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><MessageSquare className="h-5 w-5 text-muted-foreground" /></div><p className="text-xs text-muted-foreground">No global messages yet</p></div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {globalMessages
                            .filter((m) => !chatSearchQuery || m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()) || m.uname.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                            .map((msg) => (
                              <div key={msg.key} className={`flex items-start gap-3 px-6 py-3 hover:bg-foreground/[0.01] transition-colors ${msg.type === "system" ? "bg-foreground/[0.02]" : ""}`}>
                                <button onClick={() => { const next = new Set(selectedChatMessages); if (next.has(msg.key)) next.delete(msg.key); else next.add(msg.key); setSelectedChatMessages(next); }}
                                  className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${selectedChatMessages.has(msg.key) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>
                                  {selectedChatMessages.has(msg.key) && <Check className="h-3 w-3" />}
                                </button>
                                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${msg.type === "system" ? "bg-foreground/10 text-foreground" : isPinned(msg.key) ? "bg-amber-500/10 text-amber-500" : "bg-foreground/5"}`}>
                                  {msg.type === "system" ? <Megaphone className="h-4 w-4" /> : isPinned(msg.key) ? <Pin className="h-4 w-4" /> : msg.uname.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-medium ${msg.type === "system" ? "text-foreground/70 italic" : ""}`}>{msg.uname}</span>
                                    {msg.type === "system" && <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">SYSTEM</span>}
                                    {isPinned(msg.key) && <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">PINNED</span>}
                                    {isBanned(msg.uid) && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span>}
                                    {isMuted(msg.uid) && <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span>}
                                    <span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleString()}</span>
                                    {msg.reactions.length > 0 && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Heart className="h-3 w-3" />{msg.reactions.reduce((a, r) => a + r.count, 0)}</span>}
                                  </div>
                                  <p className={`text-xs mt-0.5 break-words ${msg.type === "system" ? "text-foreground/60" : ""}`}>{msg.text}</p>
                                  {msg.reactions.length > 0 && (<div className="flex flex-wrap gap-1 mt-1">{msg.reactions.map((r, i) => (<span key={i} className="inline-flex items-center gap-0.5 rounded-full bg-foreground/5 px-2 py-0.5 text-[10px]">{r.emoji} {r.count}</span>))}</div>)}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {deleteConfirmKey === msg.key ? (
                                    <><button onClick={() => { deleteMessage(msg.key, "global"); setDeleteConfirmKey(null); }} className="h-7 px-2 rounded-md bg-red-500 text-white text-[10px] font-medium">Yes</button><button onClick={() => setDeleteConfirmKey(null)} className="h-7 px-2 rounded-md border border-border text-[10px] font-medium">No</button></>
                                  ) : (
                                    <>
                                      {msg.type !== "system" && (
                                        <button onClick={() => isPinned(msg.key) ? unpinMessage(msg.key) : pinMessage(msg.key)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500" title={isPinned(msg.key) ? "Unpin" : "Pin"}>
                                          <Pin className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      {msg.type !== "system" && (
                                        <button onClick={() => setWarnDialogUid(msg.uid)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-orange-500/10 hover:text-orange-500" title="Warn"><AlertTriangle className="h-3.5 w-3.5" /></button>
                                      )}
                                      {msg.type !== "system" && (
                                        <button onClick={() => setMuteDialogUid(msg.uid)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-yellow-500/10 hover:text-yellow-600" title="Mute"><VolumeX className="h-3.5 w-3.5" /></button>
                                      )}
                                      <button onClick={() => setDeleteConfirmKey(msg.key)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          {hasMoreMessages && (
                            <div className="flex items-center justify-center py-4 border-t border-border/50">
                              <button onClick={loadMoreMessages} disabled={loadingMoreMessages} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5 disabled:opacity-40">
                                {loadingMoreMessages ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                                Load Older Messages
                              </button>
                            </div>
                          )}
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
                    <StatCard icon={Activity} label="Active Today" value={String(dmConversations.filter((d) => { const dt = new Date(d.lastMessageTime); return dt.toDateString() === new Date().toDateString(); }).length)} color="oklch(0.75 0.15 200)" />
                  </div>

                  {selectedDm ? (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-3 p-6 border-b border-border">
                        <button onClick={() => { setSelectedDm(null); setDmMessages([]); setDmMessagesPageSize(50); setSelectedChatMessages(new Set()); }} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
                        <div className="flex items-center gap-2 flex-1"><MessageCircle className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">DM: {dmConversations.find((d) => d.dmId === selectedDm)?.participantNames?.join(" & ") || selectedDm}</h2></div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Bulk actions */}
                          {selectedChatMessages.size > 0 && (
                            <button onClick={() => bulkDeleteMessages(Array.from(selectedChatMessages), "dm", selectedDm)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/20">
                              <Trash className="h-3.5 w-3.5" />Delete ({selectedChatMessages.size})
                            </button>
                          )}
                          {/* Pagination info */}
                          <span className="text-[10px] text-muted-foreground tabular-nums">{Math.min(dmMessages.length, dmMessagesPageSize)} / {dmTotalMessageCount || dmMessages.length} msgs</span>
                          <button onClick={() => exportChat(dmMessages, `dm-${selectedDm}.json`)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5"><DownloadCloud className="h-3.5 w-3.5" />Export</button>
                          {!clearAllConfirm ? (<button onClick={() => setClearAllConfirm(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" />Clear</button>) : (
                            <div className="flex items-center gap-1.5"><button onClick={() => clearAllMessages("dm", selectedDm)} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium">Confirm</button><button onClick={() => setClearAllConfirm(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button></div>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {dmMessages.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-16">No messages in this DM</p>) : (
                          <div>
                            {/* Load More button at the top (for older messages) */}
                            {dmHasMoreMessages && (
                              <div className="flex justify-center py-3 border-b border-border/50">
                                <button onClick={loadMoreDmMessages} disabled={loadingMoreDmMessages} className="flex items-center gap-1.5 h-8 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5 disabled:opacity-50">
                                  {loadingMoreDmMessages ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5 rotate-90" />}
                                  Load Older Messages
                                </button>
                              </div>
                            )}
                            <div className="divide-y divide-border/50">
                              {dmMessages.map((msg) => (
                                <div key={msg.key} className="flex items-start gap-3 px-6 py-3 hover:bg-foreground/[0.01]">
                                  <button onClick={() => { const next = new Set(selectedChatMessages); if (next.has(msg.key)) next.delete(msg.key); else next.add(msg.key); setSelectedChatMessages(next); }}
                                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${selectedChatMessages.has(msg.key) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>
                                    {selectedChatMessages.has(msg.key) && <Check className="h-3 w-3" />}
                                  </button>
                                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">{msg.uname.charAt(0).toUpperCase()}</div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2"><span className="text-xs font-medium">{msg.uname}</span>{isBanned(msg.uid) && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span>}{isMuted(msg.uid) && <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span>}<span className="text-[10px] text-muted-foreground">{new Date(msg.ts).toLocaleString()}</span></div>
                                    <p className="text-xs mt-0.5 break-words">{msg.text}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {deleteConfirmKey === msg.key ? (<><button onClick={() => { deleteMessage(msg.key, "dm", selectedDm); setDeleteConfirmKey(null); }} className="h-7 px-2 rounded-md bg-red-500 text-white text-[10px] font-medium">Yes</button><button onClick={() => setDeleteConfirmKey(null)} className="h-7 px-2 rounded-md border border-border text-[10px] font-medium">No</button></>) : (
                                      <>
                                        <button onClick={() => setWarnDialogUid(msg.uid)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-orange-500/10 hover:text-orange-500" title="Warn"><AlertTriangle className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => setDeleteConfirmKey(msg.key)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">DM Conversations</h2></div>
                        <div className="flex items-center gap-2">
                          {/* Search */}
                          <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              value={dmSearchQuery}
                              onChange={(e) => setDmSearchQuery(e.target.value)}
                              placeholder="Search DMs..."
                              className="h-8 w-44 rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none transition-all focus:border-foreground/30 focus:w-56"
                            />
                          </div>
                          {/* Refresh */}
                          <button onClick={fetchDmConversations} disabled={dmListLoading} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50" title="Refresh DM list">
                            <RefreshCw className={`h-3.5 w-3.5 ${dmListLoading ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        {dmListLoading && dmConversations.length === 0 ? (
                          <div className="flex items-center justify-center py-16"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /><span className="ml-2 text-xs text-muted-foreground">Loading DMs...</span></div>
                        ) : dmConversations.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-16">No DM conversations found</p>) : (
                          <div className="divide-y divide-border/50">
                            {dmConversations
                              .filter((dm) => {
                                if (!dmSearchQuery) return true;
                                const q = dmSearchQuery.toLowerCase();
                                return (
                                  dm.participantNames?.some(n => n.toLowerCase().includes(q)) ||
                                  dm.lastMessage?.toLowerCase().includes(q) ||
                                  dm.dmId.toLowerCase().includes(q)
                                );
                              })
                              .map((dm) => {
                                // Check if any participant is online
                                const isParticipantOnline = dm.participants.some(p => onlineUsers.some(u => u.uid === p));
                                return (
                                <div key={dm.dmId} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.02] transition-colors text-left group">
                                  <button onClick={() => { setSelectedDm(dm.dmId); setSelectedChatMessages(new Set()); }} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/5"><MessageCircle className="h-4 w-4 text-muted-foreground" /></div>
                                      {isParticipantOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                                    </div>
                                    <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{dm.participantNames?.join(" & ") || dm.participants.join(", ") || dm.dmId}</p><p className="text-[11px] text-muted-foreground truncate">{dm.lastMessage || "No messages"}</p></div>
                                    <div className="text-right shrink-0">{dm.lastMessageTime > 0 && <p className="text-[10px] text-muted-foreground">{new Date(dm.lastMessageTime).toLocaleDateString()}</p>}<p className="text-[10px] text-muted-foreground">{dm.messageCount} msg{dm.messageCount !== 1 ? "s" : ""}</p></div>
                                  </button>
                                  <button onClick={async () => { if (confirm("Delete this entire DM conversation?")) { const db = getFirebaseDb(); await remove(ref(db, `${FB_PATHS.dms}/${dm.dmId}`)); fetchDmConversations(); } }} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500 shrink-0" title="Delete conversation"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ANNOUNCEMENTS ─────────────────────────────────────── */}
              {section === "announcements" && (
                <div className="flex flex-col gap-6">
                  {/* Widget Announcement Config */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Megaphone className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Announcement Banner</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ConfigToggle label="Announcement Enabled" value={widgetConfig.announcementEnabled ?? false} syncing={syncingKey === "announcementEnabled"} onChange={(v) => writeWidgetConfig("announcementEnabled", v)} />
                      <ConfigColorPicker label="Announcement Color" value={widgetConfig.announcementColor ?? "#f59e0b"} syncing={syncingKey === "announcementColor"} onChange={(v) => writeWidgetConfig("announcementColor", v)} />
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Announcement Text</span>{syncingKey === "announcementText" && <SyncIndicator />}</div>
                        <input type="text" value={widgetConfig.announcementText ?? ""} maxLength={200} onChange={(e) => writeWidgetConfig("announcementText", e.target.value)} placeholder="Enter announcement message..." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-foreground/30" />
                        <span className="text-[10px] text-muted-foreground text-right">{(widgetConfig.announcementText ?? "").length}/200</span>
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  {widgetConfig.announcementEnabled && widgetConfig.announcementText && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-4"><Eye className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Preview</h2></div>
                      <div className="rounded-xl p-4" style={{ background: `${widgetConfig.announcementColor || "#f59e0b"}15`, borderLeft: `3px solid ${widgetConfig.announcementColor || "#f59e0b"}` }}>
                        <div className="flex items-center gap-2"><Megaphone className="h-4 w-4" style={{ color: widgetConfig.announcementColor || "#f59e0b" }} /><span className="text-sm font-medium" style={{ color: widgetConfig.announcementColor || "#f59e0b" }}>{widgetConfig.announcementText}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Global Broadcast */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Megaphone className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Global Broadcast</h2><span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">Chat</span></div>
                    <div className="flex flex-col gap-4">
                      {/* Broadcast Message Input */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Broadcast Message</span>
                          <span className={`text-[10px] tabular-nums ${broadcastText.length > 450 ? "text-red-500" : "text-muted-foreground"}`}>{broadcastText.length}/500</span>
                        </div>
                        <textarea value={broadcastText} onChange={(e) => setBroadcastText(e.target.value.slice(0, 500))} placeholder="Type a broadcast message to all users..." rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-foreground/30 resize-none" />
                      </div>

                      {/* Send as System + Priority */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`grid h-5 w-9 shrink-0 place-items-center rounded-full transition-colors ${broadcastAsSystem ? "bg-foreground" : "bg-foreground/10"}`} onClick={() => setBroadcastAsSystem(!broadcastAsSystem)}>
                            <div className={`h-3.5 w-3.5 rounded-full bg-background transition-transform ${broadcastAsSystem ? "translate-x-1.5" : "-translate-x-1.5"}`} />
                          </div>
                          <div>
                            <span className="text-xs font-medium">Send as System</span>
                            <p className="text-[10px] text-muted-foreground">Message appears from "System" instead of "Admin"</p>
                          </div>
                        </label>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs text-muted-foreground">Priority Level</span>
                          <div className="flex gap-2">
                            {(["normal", "important", "urgent"] as const).map((p) => {
                              const colors: Record<string, string> = {
                                normal: "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                                important: "border-amber-500/30 bg-amber-500/5 text-amber-500",
                                urgent: "border-red-500/30 bg-red-500/5 text-red-500",
                              };
                              const activeColors: Record<string, string> = {
                                normal: "border-foreground/20 bg-foreground/5 text-foreground",
                                important: "border-amber-500/30 bg-amber-500/5 text-amber-500",
                                urgent: "border-red-500/30 bg-red-500/5 text-red-500",
                              };
                              return (
                                <button key={p} onClick={() => setBroadcastPriority(p)} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors capitalize ${broadcastPriority === p ? activeColors[p] : colors[p]}`}>
                                  {p === "normal" && <MessageSquare className="h-3 w-3" />}
                                  {p === "important" && <AlertTriangle className="h-3 w-3" />}
                                  {p === "urgent" && <AlertCircle className="h-3 w-3" />}
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Priority Preview */}
                      {broadcastPriority !== "normal" && broadcastText.trim() && (
                        <div className={`rounded-xl p-3 animate-[fade-up_0.2s_ease_both] ${broadcastPriority === "important" ? "bg-amber-500/5 border border-amber-500/20" : "bg-red-500/5 border border-red-500/20"}`}>
                          <div className="flex items-center gap-2">
                            {broadcastPriority === "important" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            {broadcastPriority === "urgent" && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <span className={`text-xs font-medium ${broadcastPriority === "important" ? "text-amber-500" : "text-red-500"}`}>[{broadcastPriority.toUpperCase()}]</span>
                            <span className="text-xs">{broadcastText.trim()}</span>
                          </div>
                        </div>
                      )}

                      {/* Send Button */}
                      <button onClick={sendBroadcast} disabled={!broadcastText.trim() || broadcastSending} className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-40 shrink-0 w-full md:w-auto md:self-end">
                        {broadcastSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Megaphone className="h-3.5 w-3.5" />}{broadcastSending ? "Sending..." : "Send Broadcast"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── THEMES ────────────────────────────────────────────── */}
              {section === "themes" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5"><Palette className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Themes</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigSelect label="Default Theme" value={widgetConfig.defaultTheme ?? "pure-black"} options={[{ value: "pure-black", label: "Pure Black" }, { value: "golden", label: "Golden" }]} syncing={syncingKey === "defaultTheme"} onChange={(v) => writeWidgetConfig("defaultTheme", v)} />
                    <ConfigColorPicker label="Accent Color" value={widgetConfig.accentColor ?? "#ffffff"} syncing={syncingKey === "accentColor"} onChange={(v) => writeWidgetConfig("accentColor", v)} />
                  </div>
                  <div className="mt-6 rounded-xl border border-border overflow-hidden">
                    <div className="p-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium bg-foreground/[0.02]">Preview</div>
                    <div className="p-4" style={{ background: widgetConfig.defaultTheme === "golden" ? "#1a1500" : "#000" }}>
                      <div className="flex items-center gap-2 mb-3"><div className="h-8 w-8 rounded-full" style={{ background: widgetConfig.accentColor || "#fff" }} /><div><div className="h-2 w-16 rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.6 }} /><div className="h-1.5 w-10 rounded-full mt-1" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.3 }} /></div></div>
                      <div className="rounded-lg p-2 mb-1.5" style={{ background: widgetConfig.accentColor ? `${widgetConfig.accentColor}15` : "rgba(255,255,255,0.05)" }}><div className="h-1.5 w-full rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.5 }} /></div>
                      <div className="rounded-lg p-2" style={{ background: widgetConfig.accentColor ? `${widgetConfig.accentColor}08` : "rgba(255,255,255,0.02)" }}><div className="h-1.5 w-3/4 rounded-full" style={{ background: widgetConfig.accentColor || "#fff", opacity: 0.3 }} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── LAYOUT ────────────────────────────────────────────── */}
              {section === "layout" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5"><SlidersHorizontal className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Layout</h2></div>
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
                  <div className="flex items-center gap-2 mb-5"><Type className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Messages</h2></div>
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
                  <div className="flex items-center gap-2 mb-5"><Filter className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Content Filter</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigToggle label="Profanity Filter" value={widgetConfig.profanityFilter ?? true} syncing={syncingKey === "profanityFilter"} onChange={(v) => writeWidgetConfig("profanityFilter", v)} />
                    <ConfigToggle label="Link Filter" value={widgetConfig.linkFilter ?? false} syncing={syncingKey === "linkFilter"} onChange={(v) => writeWidgetConfig("linkFilter", v)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4">Profanity filter replaces offensive words with ***. Link filter strips URLs from messages.</p>
                </div>
              )}

              {/* ─── RATE LIMITING ─────────────────────────────────────── */}
              {section === "rate-limiting" && (
                <div className="flex flex-col gap-6">
                  {/* Rate Limit Status */}
                  <div className={`flex items-center gap-3 rounded-xl border p-4 animate-[fade-up_0.2s_ease_both] ${widgetConfig.rateLimitEnabled ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    {widgetConfig.rateLimitEnabled ? (
                      <><Zap className="h-5 w-5 text-green-500 shrink-0" /><div><p className="text-xs font-medium text-green-500">Rate Limiting Active</p><p className="text-[10px] text-muted-foreground mt-0.5">Spam protection is enabled. Messages are rate-limited to prevent flooding.</p></div></>
                    ) : (
                      <><AlertTriangle className="h-5 w-5 text-red-500 shrink-0" /><div><p className="text-xs font-medium text-red-500">Rate Limiting Disabled</p><p className="text-[10px] text-muted-foreground mt-0.5">Warning: No spam protection is active. Users can send messages without restrictions.</p></div></>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Zap className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Rate Limiting Controls</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ConfigToggle label="Slow Mode" value={widgetConfig.slowMode ?? false} syncing={syncingKey === "slowMode"} onChange={(v) => writeWidgetConfig("slowMode", v)} />
                      <ConfigToggle label="Rate Limiting" value={widgetConfig.rateLimitEnabled ?? true} syncing={syncingKey === "rateLimitEnabled"} onChange={(v) => writeWidgetConfig("rateLimitEnabled", v)} />
                    </div>

                    {/* Slow Mode Interval Slider */}
                    {widgetConfig.slowMode && (
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Slow Mode Interval</span>
                          <span className="text-xs font-medium tabular-nums">{widgetConfig.slowModeInterval ?? 5}s</span>
                        </div>
                        <input type="range" min={1} max={60} step={1} value={widgetConfig.slowModeInterval ?? 5} onChange={(e) => writeWidgetConfig("slowModeInterval", Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-foreground/10 accent-foreground cursor-pointer" />
                        <div className="flex justify-between text-[10px] text-muted-foreground"><span>1s</span><span>30s</span><span>60s</span></div>
                      </div>
                    )}

                    {/* Quick Presets */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Quick Presets</span>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => { writeWidgetConfig("slowMode", true); writeWidgetConfig("slowModeInterval", 30); writeWidgetConfig("rateLimitEnabled", true); }} className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${widgetConfig.slowModeInterval === 30 && widgetConfig.rateLimitEnabled ? "border-green-500/30 bg-green-500/5 text-green-500" : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}><Zap className="h-3.5 w-3.5" />Relaxed (10msg/30s)</button>
                        <button onClick={() => { writeWidgetConfig("slowMode", true); writeWidgetConfig("slowModeInterval", 10); writeWidgetConfig("rateLimitEnabled", true); }} className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${widgetConfig.slowModeInterval === 10 && widgetConfig.rateLimitEnabled ? "border-amber-500/30 bg-amber-500/5 text-amber-500" : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}><Zap className="h-3.5 w-3.5" />Normal (5msg/10s)</button>
                        <button onClick={() => { writeWidgetConfig("slowMode", true); writeWidgetConfig("slowModeInterval", 5); writeWidgetConfig("rateLimitEnabled", true); }} className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${widgetConfig.slowModeInterval === 5 && widgetConfig.rateLimitEnabled ? "border-red-500/30 bg-red-500/5 text-red-500" : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}><Zap className="h-3.5 w-3.5" />Strict (3msg/5s)</button>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-4">Slow mode adds a cooldown between messages. Rate limiting prevents spam by capping messages per minute.</p>
                  </div>
                </div>
              )}

              {/* ─── USER MANAGEMENT ───────────────────────────────────── */}
              {section === "user-management" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Online Now" value={String(onlineUsers.length)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Ban} label="Banned" value={String(bannedUsers.length)} color="oklch(0.65 0.2 25)" />
                    <StatCard icon={VolumeX} label="Muted" value={String(mutedUsers.length)} color="oklch(0.68 0.12 60)" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Online Users</h2><span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-500 font-medium">{onlineUsers.length} online</span></div>
                      <button onClick={refreshOnlineUsers} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {onlineUsers.length === 0 ? (<p className="text-xs text-muted-foreground text-center py-16">No users found</p>) : (
                        <div className="divide-y divide-border/50">
                          {onlineUsers.map((user) => {
                            const userName = (user.name as string) || user.uid || "Anonymous";
                            const status = (user.status as string) || "online";
                            const statusColor = status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-red-500";
                            return (
                              <div key={user.uid} className="flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.01] transition-colors">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">{userName.charAt(0).toUpperCase()}</div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2"><span className="text-xs font-medium">{userName}</span><span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} /><span className="text-[10px] text-muted-foreground capitalize">{status}</span>{isBanned(user.uid) && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span>}{isMuted(user.uid) && <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span>}</div>
                                  <div className="flex items-center gap-3 mt-0.5"><span className="text-[10px] text-muted-foreground">UID: {user.uid}</span><span className="text-[10px] text-muted-foreground">Last: {user.ts ? new Date(user.ts).toLocaleString() : "Unknown"}</span></div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                  <button onClick={() => setWarnDialogUid(user.uid)} className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-orange-500 text-xs font-medium transition-colors hover:bg-orange-500/10 border border-orange-500/20"><AlertTriangle className="h-3.5 w-3.5" />Warn</button>
                                  <button onClick={() => setMuteDialogUid(user.uid)} className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-yellow-600 text-xs font-medium transition-colors hover:bg-yellow-500/10 border border-yellow-500/20"><VolumeX className="h-3.5 w-3.5" />Mute</button>
                                  <button onClick={() => setBanDialogUid(user.uid)} className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Ban className="h-3.5 w-3.5" />Ban</button>
                                  <button onClick={() => kickUser(user.uid)} className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Trash2 className="h-3.5 w-3.5" />Kick</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banned Users */}
                  {bannedUsers.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-2 p-6 border-b border-border"><Ban className="h-4 w-4 text-red-500" /><h2 className="text-sm font-semibold">Banned Users</h2><span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">{bannedUsers.length}</span></div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                        {bannedUsers.map((user) => (
                          <div key={user.uid} className="flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.01] transition-colors">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-500/10 text-xs font-semibold text-red-500"><Ban className="h-4 w-4" /></div>
                            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium">{user.uid}</span><span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span></div><span className="text-[10px] text-muted-foreground">Banned {user.bannedAt > 0 ? new Date(user.bannedAt).toLocaleString() : "unknown"}</span></div>
                            <button onClick={() => unbanUser(user.uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-green-500 text-xs font-medium transition-colors hover:bg-green-500/10 border border-green-500/20"><Check className="h-3.5 w-3.5" />Unban</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Muted Users */}
                  {mutedUsers.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-2 p-6 border-b border-border"><VolumeX className="h-4 w-4 text-yellow-600" /><h2 className="text-sm font-semibold">Muted Users</h2><span className="rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600">{mutedUsers.length}</span></div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                        {mutedUsers.map((user) => (
                          <div key={user.uid} className="flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.01] transition-colors">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-yellow-500/10 text-xs font-semibold text-yellow-600"><VolumeX className="h-4 w-4" /></div>
                            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium">{user.uid}</span><span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span></div><span className="text-[10px] text-muted-foreground">{user.reason ? `Reason: ${user.reason} · ` : ""}Muted {user.mutedAt > 0 ? new Date(user.mutedAt).toLocaleString() : "unknown"}</span></div>
                            <button onClick={() => unmuteUser(user.uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-green-500 text-xs font-medium transition-colors hover:bg-green-500/10 border border-green-500/20"><Check className="h-3.5 w-3.5" />Unmute</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Warnings */}
                  {warnings.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card">
                      <div className="flex items-center gap-2 p-6 border-b border-border"><AlertTriangle className="h-4 w-4 text-orange-500" /><h2 className="text-sm font-semibold">Recent Warnings</h2><span className="rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-500">{warnings.length}</span></div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                        {warnings.sort((a, b) => b.ts - a.ts).slice(0, 20).map((w) => (
                          <div key={w.key} className="flex items-center gap-3 px-6 py-4 hover:bg-foreground/[0.01] transition-colors">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-500/10 text-orange-500"><AlertTriangle className="h-4 w-4" /></div>
                            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium">UID: {w.uid}</span><span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium text-orange-500">WARNING</span></div><span className="text-[10px] text-muted-foreground">{w.reason} · {new Date(w.ts).toLocaleString()}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── WARNINGS & BANS ────────────────────────────────────── */}
              {section === "warnings-bans" && (
                <div className="flex flex-col gap-6">
                  {actionMsg && (<div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 animate-[fade-up_0.2s_ease_both]"><Check className="h-4 w-4 text-green-500" /><span className="text-xs font-medium text-green-500">{actionMsg}</span></div>)}

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard icon={AlertTriangle} label="Active Warnings" value={String(activeWarnings.length)} color="oklch(0.75 0.15 60)" />
                    <StatCard icon={Clock} label="Expired Warnings" value={String(expiredWarnings.length)} color="oklch(0.65 0.1 220)" />
                    <StatCard icon={Ban} label="Banned Users" value={String(bannedUsers.length)} color="oklch(0.65 0.2 25)" />
                    <StatCard icon={VolumeX} label="Muted Users" value={String(mutedUsers.length)} color="oklch(0.68 0.12 60)" />
                    <StatCard icon={Users} label="Online Now" value={String(onlineUsers.length)} color="oklch(0.72 0.16 140)" />
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><Gavel className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Quick Actions</h2></div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" value={quickActionUid} onChange={(e) => setQuickActionUid(e.target.value)} placeholder="Enter user UID..." className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground/30" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { if (quickActionUid) { setWarnDialogUid(quickActionUid); } }} disabled={!quickActionUid} className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-orange-500 text-xs font-medium transition-colors hover:bg-orange-500/10 border border-orange-500/20 disabled:opacity-40"><AlertTriangle className="h-3.5 w-3.5" />Warn</button>
                        <button onClick={() => { if (quickActionUid) { setMuteDialogUid(quickActionUid); } }} disabled={!quickActionUid} className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-yellow-600 text-xs font-medium transition-colors hover:bg-yellow-500/10 border border-yellow-500/20 disabled:opacity-40"><VolumeX className="h-3.5 w-3.5" />Mute</button>
                        <button onClick={() => { if (quickActionUid) { setBanDialogUid(quickActionUid); } }} disabled={!quickActionUid} className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20 disabled:opacity-40"><Ban className="h-3.5 w-3.5" />Ban</button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs: Warnings / Bans / Mutes */}
                  <div className="rounded-2xl border border-border bg-card">
                    <div className="flex items-center gap-1 p-2 border-b border-border">
                      <button onClick={() => setWarningsBansTab("warnings")} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${warningsBansTab === "warnings" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "text-muted-foreground hover:bg-foreground/5"}`}><AlertTriangle className="h-3.5 w-3.5" />Warnings<span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px]">{warnings.length}</span></button>
                      <button onClick={() => setWarningsBansTab("bans")} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${warningsBansTab === "bans" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "text-muted-foreground hover:bg-foreground/5"}`}><Ban className="h-3.5 w-3.5" />Bans<span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px]">{bannedUsers.length}</span></button>
                      <button onClick={() => setWarningsBansTab("mutes")} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${warningsBansTab === "mutes" ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" : "text-muted-foreground hover:bg-foreground/5"}`}><VolumeX className="h-3.5 w-3.5" />Mutes<span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px]">{mutedUsers.length}</span></button>
                      <div className="flex-1" />
                      <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input type="text" value={warningsBansSearch} onChange={(e) => setWarningsBansSearch(e.target.value)} placeholder="Search..." className="h-8 w-40 rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-foreground/30" />
                      </div>
                    </div>

                    {/* Warnings Tab */}
                    {warningsBansTab === "warnings" && (
                      <div className="max-h-[600px] overflow-y-auto">
                        {warnings.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500/10"><AlertTriangle className="h-5 w-5 text-orange-500" /></div><p className="text-sm font-medium">No warnings yet</p><p className="text-xs text-muted-foreground">Warnings issued to users will appear here</p></div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {warnings
                              .filter((w) => {
                                if (!warningsBansSearch) return true;
                                const q = warningsBansSearch.toLowerCase();
                                return w.uid.toLowerCase().includes(q) || w.reason.toLowerCase().includes(q) || (w.userName && w.userName.toLowerCase().includes(q));
                              })
                              .sort((a, b) => {
                                // Active first, then by time
                                const aExpired = isExpired(a.expiresAt);
                                const bExpired = isExpired(b.expiresAt);
                                if (aExpired !== bExpired) return aExpired ? 1 : -1;
                                return b.ts - a.ts;
                              })
                              .map((w) => {
                              const expired = isExpired(w.expiresAt);
                              const userName = w.userName || resolveUserName(w.uid);
                              return (
                                <div key={w.key} className={`flex items-center gap-3 px-6 py-4 transition-colors hover:bg-foreground/[0.01] ${expired ? "opacity-50" : ""}`}>
                                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${expired ? "bg-foreground/5 text-muted-foreground" : "bg-orange-500/10 text-orange-500"}`}>
                                    <AlertTriangle className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-medium">{userName}</span>
                                      {expired
                                        ? <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">EXPIRED</span>
                                        : <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium text-orange-500">ACTIVE</span>
                                      }
                                      {w.duration > 0 && <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Timer className="h-2.5 w-2.5" />{formatDuration(w.duration)}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="text-[10px] text-muted-foreground">{w.reason}</span>
                                      <span className="text-[10px] text-muted-foreground">·</span>
                                      <span className="text-[10px] text-muted-foreground">{new Date(w.ts).toLocaleString()}</span>
                                      {w.expiresAt > 0 && (
                                        <>
                                          <span className="text-[10px] text-muted-foreground">·</span>
                                          <span className={`text-[10px] ${expired ? "text-muted-foreground" : "text-amber-500"}`}>
                                            <Hourglass className="h-2.5 w-2.5 inline mr-0.5" />{formatExpiry(w.expiresAt)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => removeWarning(w.key)} className="flex items-center gap-1 h-7 px-2 rounded-lg text-muted-foreground text-[10px] font-medium transition-colors hover:bg-foreground/5 hover:text-foreground" title="Remove warning"><X className="h-3 w-3" /></button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {warnings.length > 0 && (
                          <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">{activeWarnings.length} active · {expiredWarnings.length} expired</span>
                            <div className="flex items-center gap-2">
                              {expiredWarnings.length > 0 && (
                                <button onClick={async () => {
                                  const db = getFirebaseDb();
                                  for (const w of expiredWarnings) {
                                    await remove(ref(db, `${FB_PATHS.warnings}/${w.key}`));
                                  }
                                  setActionMsg(`${expiredWarnings.length} expired warnings cleaned up`);
                                  setTimeout(() => setActionMsg(""), 3000);
                                }} className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-muted-foreground text-[10px] font-medium transition-colors hover:bg-foreground/5 hover:text-foreground border border-border"><Trash2 className="h-3 w-3" />Clear Expired</button>
                              )}
                              <button onClick={() => { if (confirm("Clear ALL warnings?")) clearAllWarnings(); }} className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-red-500 text-[10px] font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Trash2 className="h-3 w-3" />Clear All</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bans Tab */}
                    {warningsBansTab === "bans" && (
                      <div className="max-h-[600px] overflow-y-auto">
                        {bannedUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/10"><Ban className="h-5 w-5 text-red-500" /></div><p className="text-sm font-medium">No banned users</p><p className="text-xs text-muted-foreground">Banned users will appear here</p></div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {bannedUsers
                              .filter((b) => {
                                if (!warningsBansSearch) return true;
                                const q = warningsBansSearch.toLowerCase();
                                return b.uid.toLowerCase().includes(q) || (b.reason && b.reason.toLowerCase().includes(q));
                              })
                              .map((user) => {
                              const expired = isExpired(user.expiresAt);
                              return (
                                <div key={user.uid} className={`flex items-center gap-3 px-6 py-4 transition-colors hover:bg-foreground/[0.01] ${expired ? "opacity-50" : ""}`}>
                                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${expired ? "bg-foreground/5 text-muted-foreground" : "bg-red-500/10 text-red-500"}`}>
                                    <Ban className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-medium">{resolveUserName(user.uid)}</span>
                                      {expired
                                        ? <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">EXPIRED</span>
                                        : <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span>
                                      }
                                      {user.duration > 0 && <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Timer className="h-2.5 w-2.5" />{formatDuration(user.duration)}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {user.reason && <span className="text-[10px] text-muted-foreground">{user.reason}</span>}
                                      <span className="text-[10px] text-muted-foreground">· Banned {user.bannedAt > 0 ? new Date(user.bannedAt).toLocaleString() : "unknown"}</span>
                                      {user.expiresAt > 0 && (
                                        <>
                                          <span className="text-[10px] text-muted-foreground">·</span>
                                          <span className={`text-[10px] ${expired ? "text-muted-foreground" : "text-amber-500"}`}>
                                            <Hourglass className="h-2.5 w-2.5 inline mr-0.5" />{formatExpiry(user.expiresAt)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => unbanUser(user.uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-green-500 text-xs font-medium transition-colors hover:bg-green-500/10 border border-green-500/20"><UserCheck className="h-3.5 w-3.5" />Unban</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {bannedUsers.length > 0 && (
                          <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">{activeBans.length} active · {bannedUsers.length - activeBans.length} expired</span>
                            <button onClick={() => { if (confirm("Unban ALL users?")) clearAllBans(); }} className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-red-500 text-[10px] font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Trash2 className="h-3 w-3" />Clear All Bans</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mutes Tab */}
                    {warningsBansTab === "mutes" && (
                      <div className="max-h-[600px] overflow-y-auto">
                        {mutedUsers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-yellow-500/10"><VolumeX className="h-5 w-5 text-yellow-600" /></div><p className="text-sm font-medium">No muted users</p><p className="text-xs text-muted-foreground">Muted users will appear here</p></div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {mutedUsers
                              .filter((m) => {
                                if (!warningsBansSearch) return true;
                                const q = warningsBansSearch.toLowerCase();
                                return m.uid.toLowerCase().includes(q) || (m.reason && m.reason.toLowerCase().includes(q));
                              })
                              .map((user) => {
                              const expired = isExpired(user.expiresAt);
                              return (
                                <div key={user.uid} className={`flex items-center gap-3 px-6 py-4 transition-colors hover:bg-foreground/[0.01] ${expired ? "opacity-50" : ""}`}>
                                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${expired ? "bg-foreground/5 text-muted-foreground" : "bg-yellow-500/10 text-yellow-600"}`}>
                                    <VolumeX className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-medium">{resolveUserName(user.uid)}</span>
                                      {expired
                                        ? <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">EXPIRED</span>
                                        : <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span>
                                      }
                                      {user.duration > 0 && <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Timer className="h-2.5 w-2.5" />{formatDuration(user.duration)}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {user.reason && <span className="text-[10px] text-muted-foreground">{user.reason}</span>}
                                      <span className="text-[10px] text-muted-foreground">· Muted {user.mutedAt > 0 ? new Date(user.mutedAt).toLocaleString() : "unknown"}</span>
                                      {user.expiresAt > 0 && (
                                        <>
                                          <span className="text-[10px] text-muted-foreground">·</span>
                                          <span className={`text-[10px] ${expired ? "text-muted-foreground" : "text-amber-500"}`}>
                                            <Hourglass className="h-2.5 w-2.5 inline mr-0.5" />{formatExpiry(user.expiresAt)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => unmuteUser(user.uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-green-500 text-xs font-medium transition-colors hover:bg-green-500/10 border border-green-500/20"><UserCheck className="h-3.5 w-3.5" />Unmute</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {mutedUsers.length > 0 && (
                          <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">{activeMutes.length} active · {mutedUsers.length - activeMutes.length} expired</span>
                            <button onClick={() => { if (confirm("Unmute ALL users?")) clearAllMutes(); }} className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-red-500 text-[10px] font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Trash2 className="h-3 w-3" />Clear All Mutes</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Warning History Timeline */}
                  {warnings.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-4"><Clock className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Activity Timeline</h2></div>
                      <div className="relative pl-6">
                        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />
                        {[...warnings.sort((a, b) => b.ts - a.ts).slice(0, 10)].map((w, i) => {
                          const expired = isExpired(w.expiresAt);
                          return (
                            <div key={w.key} className="relative pb-4 last:pb-0">
                              <div className={`absolute -left-3.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-background ${expired ? "bg-muted-foreground/30" : "bg-orange-500"}`} />
                              <div className="ml-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{w.userName || resolveUserName(w.uid)}</span>
                                  <span className="text-[9px] text-muted-foreground">{new Date(w.ts).toLocaleString()}</span>
                                  {expired ? <span className="rounded bg-foreground/5 px-1 py-0.5 text-[8px] text-muted-foreground">expired</span> : <span className="rounded bg-orange-500/10 px-1 py-0.5 text-[8px] text-orange-500">active</span>}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{w.reason}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── GENERAL ───────────────────────────────────────────── */}
              {section === "general" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5"><SlidersHorizontal className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">General</h2></div>
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
                <div className="flex flex-col gap-6">
                  {/* Password & Session */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Lock className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Security</h2></div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">Admin Password Change</span>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(""); }} placeholder="New password" className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
                          <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(""); }} placeholder="Confirm password" className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
                          <button onClick={handlePasswordChange} className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 shrink-0"><Save className="h-3.5 w-3.5" />Save</button>
                        </div>
                        {passwordMsg && <p className={`text-xs ${passwordMsg.includes("not match") ? "text-red-500" : "text-green-500"}`}>{passwordMsg}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5"><span className="text-xs text-muted-foreground">Session Timeout</span><select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="h-9 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30"><option value="1h">1 Hour</option><option value="6h">6 Hours</option><option value="24h">24 Hours</option><option value="never">Never</option></select></div>
                    </div>
                  </div>

                  {/* ─── Magic Link Generator ─── */}
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.02] p-6">
                    <div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-purple-500" /><h2 className="text-sm font-semibold">Account Access Links</h2><span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-500 ml-1">ADMIN</span></div>
                    <p className="text-[10px] text-muted-foreground mb-3">Generate magic links that instantly log into any account from any device — no password, no security checks, full access.</p>

                    {/* Danger warning */}
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-3 mb-5">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-semibold text-amber-500">Powerful & Dangerous</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">Anyone with this link gains <span className="text-amber-500/80 font-medium">full, unrestricted access</span> to the target account. They can read DMs, send messages, change profiles — everything. The link works on <span className="text-amber-500/80 font-medium">any device</span>, even one that has never logged in before.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 md:col-span-1">
                        <span className="text-xs text-muted-foreground">Username</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                          <input type="text" value={magicLinkUsername} onChange={(e) => { setMagicLinkUsername(e.target.value); setMagicLinkError(""); setMagicLinkGenerated(null); }} placeholder="username" className="h-9 w-full rounded-lg border border-border bg-background pl-7 pr-3 text-sm outline-none focus:border-purple-500/40" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">Link Expiry</span>
                        <select value={magicLinkExpiry} onChange={(e) => setMagicLinkExpiry(Number(e.target.value))} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-purple-500/40">
                          <option value={1}>1 Hour</option>
                          <option value={6}>6 Hours</option>
                          <option value={24}>24 Hours</option>
                          <option value={72}>3 Days</option>
                          <option value={168}>7 Days</option>
                          <option value={0}>Never (⚠️ use carefully)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">One-time Use</span>
                        <div className="flex items-center gap-2 h-9">
                          <ToggleSwitch value={magicLinkOneTime} onChange={setMagicLinkOneTime} />
                          <span className="text-[10px] text-muted-foreground">{magicLinkOneTime ? "Destroyed after first use" : "Reusable until expiry"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button onClick={generateMagicLink} disabled={magicLinkGenerating || !magicLinkUsername.trim()} className="flex items-center justify-center gap-1.5 h-9 px-5 rounded-lg bg-purple-600 text-white text-xs font-medium transition-all hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
                        {magicLinkGenerating ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Generating...</> : <><Zap className="h-3.5 w-3.5" />Generate Link</>}
                      </button>
                      {!magicLinkOneTime && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500"><AlertTriangle className="h-3 w-3" />Reusable links stay active — consider one-time for security</span>
                      )}
                    </div>

                    {magicLinkError && <p className="text-xs text-red-500 mt-3">{magicLinkError}</p>}

                    {/* Generated Link Display */}
                    {magicLinkGenerated && (
                      <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4 animate-[fade-up_0.2s_ease_both]">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-medium text-green-500">Magic Link Generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" readOnly value={magicLinkGenerated} className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs font-mono outline-none select-all" onClick={(e) => (e.target as HTMLInputElement).select()} />
                          <button onClick={() => { navigator.clipboard.writeText(magicLinkGenerated); showActionMsg("Link copied!"); }} className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5 shrink-0"><Copy className="h-3.5 w-3.5" />Copy</button>
                          <button onClick={() => { window.open(magicLinkGenerated, "_blank"); }} className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 shrink-0"><Play className="h-3.5 w-3.5" />Open</button>
                        </div>
                        <div className="mt-3 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-[10px] text-muted-foreground leading-relaxed">
                            This link grants <span className="text-amber-500 font-medium">full access to @{magicLinkUsername.trim().toLowerCase()}</span> on any device. When opened, the user will see a confirmation with security warnings before the account is activated.
                            {magicLinkOneTime ? " This link will be destroyed after first use." : " This link can be used multiple times until it expires."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─── Active Links ─── */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Active Magic Links</h2></div>
                      <div className="flex items-center gap-2">
                        <button onClick={loadMagicLinkHistory} className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border text-[10px] text-muted-foreground transition-colors hover:bg-foreground/5"><RefreshCw className={`h-3 w-3 ${magicLinkLoading ? "animate-spin" : ""}`} />Refresh</button>
                        {magicLinkHistory.length > 0 && (
                          <button onClick={revokeAllMagicLinks} className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-red-500/20 text-[10px] text-red-500 transition-colors hover:bg-red-500/10"><Trash2 className="h-3 w-3" />Revoke All</button>
                        )}
                      </div>
                    </div>
                    {magicLinkHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No magic links generated yet</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                        {magicLinkHistory.map((link) => {
                          const isExpired = link.expiresAt > 0 && Date.now() > link.expiresAt;
                          const isDead = isExpired || (link.oneTime && link.used);
                          return (
                            <div key={link.token} className={`flex items-center gap-3 px-2 py-3 transition-colors ${isDead ? "opacity-50" : ""}`}>
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold" style={{ background: isDead ? "oklch(0.5 0 0 / 10%)" : "oklch(0.7 0.18 300 / 15%)", color: isDead ? "oklch(0.5 0 0)" : "oklch(0.7 0.18 300)" }}>
                                {link.oneTime ? <Hash className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">@{link.username}</span>
                                  {link.used && <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">USED{link.usedBy ? ` by ${link.usedBy}` : ""}</span>}
                                  {isExpired && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">EXPIRED</span>}
                                  {!isDead && <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-medium text-green-500">ACTIVE</span>}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Created {new Date(link.createdAt).toLocaleString()}
                                  {link.expiresAt > 0 ? ` · Expires ${new Date(link.expiresAt).toLocaleString()}` : " · Never expires"}
                                  {link.oneTime ? " · One-time" : " · Reusable"}
                                  {link.usedAt ? ` · Used ${new Date(link.usedAt).toLocaleString()}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => { const url = `${window.location.origin}/?magic=${link.token}`; navigator.clipboard.writeText(url); showActionMsg("Link copied!"); }} className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-foreground/5 hover:text-foreground" title="Copy link"><Copy className="h-3 w-3" /></button>
                                <button onClick={() => revokeMagicLink(link.token)} className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-red-500/10 hover:text-red-500" title="Revoke"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── NOTIFICATIONS ─────────────────────────────────────── */}
              {section === "notifications" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5"><Bell className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Notifications</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ConfigToggle label="Push Notifications" value={widgetConfig.pushNotifications ?? false} syncing={syncingKey === "pushNotifications"} onChange={(v) => writeWidgetConfig("pushNotifications", v)} />
                    <ConfigToggle label="Sound on Message" value={widgetConfig.soundOnMessage ?? false} syncing={syncingKey === "soundOnMessage"} onChange={(v) => writeWidgetConfig("soundOnMessage", v)} />
                    <ConfigToggle label="Haptic Feedback" value={widgetConfig.hapticFeedback ?? false} syncing={syncingKey === "hapticFeedback"} onChange={(v) => writeWidgetConfig("hapticFeedback", v)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4">These settings are saved to Firebase and apply in real-time to all connected widgets.</p>
                </div>
              )}

              {/* ─── DATA ──────────────────────────────────────────────── */}
              {section === "data" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5"><Database className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Data Management</h2></div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleExportConfig} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5"><Download className="h-3.5 w-3.5" />Export Config</button>
                    <label className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5 cursor-pointer"><Upload className="h-3.5 w-3.5" />Import Config<input type="file" accept=".json" onChange={handleImportConfig} className="hidden" /></label>
                    <button onClick={() => exportChat(globalMessages, "global-chat-export.json")} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5"><DownloadCloud className="h-3.5 w-3.5" />Export Chat</button>
                    <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10"><AlertTriangle className="h-3.5 w-3.5" />Reset to Defaults</button>
                  </div>
                  {showResetConfirm && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 animate-[fade-up_0.2s_ease_both]">
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                      <div className="flex-1"><p className="text-xs font-medium">Reset all widget settings to defaults?</p><p className="text-[10px] text-muted-foreground mt-0.5">This action cannot be undone.</p></div>
                      <div className="flex items-center gap-2"><button onClick={handleResetDefaults} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium transition-colors hover:bg-red-600">Reset</button><button onClick={() => setShowResetConfirm(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium transition-colors hover:bg-foreground/5">Cancel</button></div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── MAINTENANCE ───────────────────────────────────────── */}
              {section === "maintenance" && (
                <div className="flex flex-col gap-6">
                  {/* Status Banner */}
                  <div className={`flex items-center gap-3 rounded-xl border p-4 animate-[fade-up_0.2s_ease_both] ${widgetConfig.maintenanceEnabled ? "border-amber-500/20 bg-amber-500/5" : "border-green-500/20 bg-green-500/5"}`}>
                    {widgetConfig.maintenanceEnabled ? (
                      <><Wrench className="h-5 w-5 text-amber-500 shrink-0" /><div><p className="text-xs font-medium text-amber-500">Maintenance Mode is Active</p><p className="text-[10px] text-muted-foreground mt-0.5">The chat widget is currently showing a maintenance overlay to all users.</p></div></>
                    ) : (
                      <><ShieldCheck className="h-5 w-5 text-green-500 shrink-0" /><div><p className="text-xs font-medium text-green-500">System is Online</p><p className="text-[10px] text-muted-foreground mt-0.5">All services are running normally. No maintenance overlay is active.</p></div></>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Wrench className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Maintenance Controls</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ConfigToggle label="Maintenance Mode" value={widgetConfig.maintenanceEnabled ?? false} syncing={syncingKey === "maintenanceEnabled"} onChange={(v) => writeWidgetConfig("maintenanceEnabled", v)} />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Maintenance Message</span>{syncingKey === "maintenanceMessage" && <SyncIndicator />}</div>
                        <input type="text" value={widgetConfig.maintenanceMessage ?? ""} onChange={(e) => writeWidgetConfig("maintenanceMessage", e.target.value)} placeholder="Site is under maintenance..." className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-foreground/30" />
                      </div>
                    </div>

                    {/* Preset Messages */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">Preset Messages</span>
                      <div className="flex flex-wrap gap-2">
                        {["Under Maintenance", "Back in 5 minutes", "System Update", "Upgrading servers"].map((preset) => (
                          <button key={preset} onClick={() => writeWidgetConfig("maintenanceMessage", preset)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">{preset}</button>
                        ))}
                      </div>
                    </div>

                    {/* Preview Button */}
                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => setMaintenancePreviewVisible(!maintenancePreviewVisible)} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                        {maintenancePreviewVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{maintenancePreviewVisible ? "Hide Preview" : "Preview Overlay"}
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Overlay Preview */}
                  {maintenancePreviewVisible && (
                    <div className="rounded-2xl border border-border bg-card p-6 animate-[fade-up_0.2s_ease_both]">
                      <div className="flex items-center gap-2 mb-4"><Eye className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Maintenance Preview</h2></div>
                      <div className="relative rounded-xl border border-amber-500/20 overflow-hidden" style={{ minHeight: 200 }}>
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 p-6">
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10"><Wrench className="h-6 w-6 text-amber-500" /></div>
                          <p className="text-sm font-medium text-amber-500">Maintenance Mode</p>
                          <p className="text-xs text-muted-foreground text-center">{widgetConfig.maintenanceMessage || "Site is under maintenance. Please check back later."}</p>
                        </div>
                        <div className="p-4 opacity-20 pointer-events-none">
                          <div className="h-3 w-24 rounded-full bg-foreground/10 mb-2" />
                          <div className="h-2 w-full rounded-full bg-foreground/5 mb-1" />
                          <div className="h-2 w-3/4 rounded-full bg-foreground/5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── FILES ─────────────────────────────────────────────── */}
              {section === "files" && (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="flex flex-col gap-4 p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">File Management</h2><span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">{filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}</span></div>
                      <div className="flex items-center gap-2">
                        {selectedFiles.size > 0 && (<><button onClick={() => bulkToggleVisibility(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium transition-colors hover:bg-green-500/20"><Globe className="h-3.5 w-3.5" />Make public</button><button onClick={() => bulkToggleVisibility(false)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium transition-colors hover:bg-amber-500/20"><Lock className="h-3.5 w-3.5" />Make private</button><button onClick={bulkDelete} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/20"><Trash className="h-3.5 w-3.5" />Delete ({selectedFiles.size})</button></>)}
                        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${showFilters ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"}`}><Filter className="h-3.5 w-3.5" />Filters</button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search files by name, type, or description..." className="h-10 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5" />
                      {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
                    </div>
                    {showFilters && (
                      <div className="flex flex-wrap gap-3 animate-[fade-up_0.2s_ease_both]">
                        <div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">Category:</span><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30"><option value="all">All</option>{data.categoryDistribution.map((cat) => (<option key={cat.category} value={cat.category} className="capitalize">{cat.category}</option>))}</select></div>
                        <div className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">Sort:</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A-Z</option><option value="size">Largest first</option><option value="downloads">Most downloads</option></select></div>
                      </div>
                    )}
                  </div>
                  {filteredFiles.length > 0 && (
                    <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-foreground/[0.01]">
                      <button onClick={toggleSelectAll} className={`grid h-5 w-5 place-items-center rounded border transition-colors ${selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>{selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 && <Check className="h-3 w-3" />}</button>
                      <span className="text-[11px] text-muted-foreground">Select all ({filteredFiles.length})</span>
                    </div>
                  )}
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center"><div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><File className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm font-medium">No files found</p><p className="mt-1 text-xs text-muted-foreground">{searchQuery || selectedCategory !== "all" ? "Try adjusting your filters" : "Upload files to get started"}</p></div></div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {filteredFiles.map((f) => {
                          const Icon = categoryIcons[f.category] || File;
                          const color = categoryColors[f.category] || categoryColors.file;
                          const isSelected = selectedFiles.has(f.id);
                          const isEditing = editingId === f.id;
                          return (
                            <div key={f.id} className={`flex items-start gap-3 px-6 py-4 transition-colors ${isSelected ? "bg-foreground/[0.03]" : "hover:bg-foreground/[0.01]"}`}>
                              <button onClick={() => { const next = new Set(selectedFiles); if (next.has(f.id)) next.delete(f.id); else next.add(f.id); setSelectedFiles(next); }} className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${isSelected ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/30"}`}>{isSelected && <Check className="h-3 w-3" />}</button>
                              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}><Icon className="h-4 w-4" style={{ color }} /></div>
                              <div className="min-w-0 flex-1">
                                {isEditing ? (
                                  <div className="flex flex-col gap-2"><div className="flex items-center gap-2"><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") renameFile(f.id, editName); if (e.key === "Escape") setEditingId(null); }} className="h-8 flex-1 rounded-lg border border-foreground/20 bg-background px-3 text-sm outline-none focus:border-foreground/40" autoFocus /><button onClick={() => renameFile(f.id, editName)} className="grid h-8 w-8 place-items-center rounded-lg bg-green-500/10 text-green-500 transition-colors hover:bg-green-500/20"><Check className="h-4 w-4" /></button><button onClick={() => setEditingId(null)} className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5 text-muted-foreground transition-colors hover:bg-foreground/10"><X className="h-4 w-4" /></button></div><input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { updateDescription(f.id, editDesc); setEditingId(null); } }} placeholder="Add description (optional)" className="h-7 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30" /></div>
                                ) : (
                                  <><p className="truncate text-sm font-medium">{f.name}</p><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"><span>{f.sizeFormatted}</span><span className="flex items-center gap-1"><Download className="h-3 w-3" />{f.downloads}</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(f.createdAt).toLocaleDateString()}</span><span className={`flex items-center gap-1 ${f.isPublic ? "text-green-500" : "text-amber-500"}`}>{f.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{f.isPublic ? "Public" : "Private"}</span><span className="flex items-center gap-1"><Hash className="h-3 w-3" />{f.category}</span></div>{f.description && <p className="mt-1 text-[11px] text-muted-foreground/80 truncate">{f.description}</p>}</>
                                )}
                              </div>
                              {!isEditing && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => togglePublic(f.id, f.isPublic)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${f.isPublic ? "text-green-500 hover:bg-green-500/10" : "text-amber-500 hover:bg-amber-500/10"}`} title={f.isPublic ? "Make private" : "Make public"}>{f.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                                  <button onClick={() => { setEditingId(f.id); setEditName(f.name); setEditDesc(f.description || ""); }} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></button>
                                  <button onClick={() => duplicateFile(f.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground" title="Duplicate"><CopyPlus className="h-4 w-4" /></button>
                                  <button onClick={() => copyShareLink(f.shareId)} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${copiedShareId === f.shareId ? "bg-green-500/10 text-green-500" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`} title="Copy share link">{copiedShareId === f.shareId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                                  <button onClick={() => deleteFile(f.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
                      <div className="flex items-center gap-2 mb-5"><Database className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Type Breakdown</h2></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs"><thead><tr className="border-b border-border"><th className="text-left py-2.5 font-medium text-muted-foreground">Type</th><th className="text-right py-2.5 font-medium text-muted-foreground">Files</th><th className="text-right py-2.5 font-medium text-muted-foreground">Size</th><th className="text-right py-2.5 font-medium text-muted-foreground">Downloads</th></tr></thead><tbody>{storageData.typeBreakdown.map((row) => (<tr key={row.type} className="border-b border-border/50"><td className="py-2.5 capitalize font-medium">{row.type}</td><td className="text-right py-2.5 tabular-nums">{row.count}</td><td className="text-right py-2.5 tabular-nums">{row.sizeFormatted}</td><td className="text-right py-2.5 tabular-nums">{row.downloads}</td></tr>))}</tbody></table>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><HardDrive className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Largest Files</h2></div>
                      <div className="space-y-2">
                        {storageData.largest.map((f) => { const Icon = categoryIcons[f.category] || File; const color = categoryColors[f.category] || categoryColors.file; return (<div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"><div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}><Icon className="h-3.5 w-3.5" style={{ color }} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{f.name}</p></div><span className="text-xs tabular-nums text-muted-foreground">{f.sizeFormatted}</span></div>); })}
                        {storageData.largest.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No files yet</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-24 text-center"><div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><Database className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm font-medium">Storage data unavailable</p><p className="mt-1 text-xs text-muted-foreground">Could not load storage analytics. Database may not be configured.</p></div></div>
                )
              )}

              {/* ─── ANALYTICS ──────────────────────────────────────────── */}
              {section === "analytics" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    {(["24h", "7d", "30d"] as const).map((r) => (
                      <button key={r} onClick={() => setAnalyticsTimeRange(r)} className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${analyticsTimeRange === r ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"}`}>{r}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={MessageSquare} label="Total Messages" value={String(globalMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Users} label="Active Users" value={String(activeChatters)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Activity} label="Messages Today" value={String(msgsToday)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={TrendingUp} label="Peak Hour" value={peakHour} color="oklch(0.65 0.2 25)" />
                  </div>

                  {/* Message Volume by Hour */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><BarChart3 className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Message Volume by Hour</h2></div>
                    {(() => {
                      const now = Date.now();
                      const rangeMs = analyticsTimeRange === "24h" ? 86400000 : analyticsTimeRange === "7d" ? 604800000 : 2592000000;
                      const filtered = globalMessages.filter(m => m.ts > now - rangeMs);
                      const hourMap: Record<number, number> = {};
                      for (let h = 0; h < 24; h++) hourMap[h] = 0;
                      filtered.forEach(m => { const h = new Date(m.ts).getHours(); hourMap[h] = (hourMap[h] || 0) + 1; });
                      const maxCount = Math.max(...Object.values(hourMap), 1);
                      return (
                        <div className="flex items-end gap-1 h-40">
                          {Array.from({ length: 24 }, (_, h) => (
                            <div key={h} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] text-muted-foreground tabular-nums">{hourMap[h]}</span>
                              <div className="w-full rounded-t-sm bg-foreground/10 relative" style={{ height: "100%" }}>
                                <div className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-500" style={{ height: `${(hourMap[h] / maxCount) * 100}%`, background: hourMap[h] === maxCount && maxCount > 0 ? "oklch(0.65 0.2 25)" : "oklch(0.7 0.12 250 / 0.5)" }} />
                              </div>
                              <span className="text-[8px] text-muted-foreground tabular-nums">{h}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Peak Hours Heatmap */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Activity className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Activity Heatmap</h2></div>
                    {(() => {
                      const now = Date.now();
                      const rangeMs = analyticsTimeRange === "24h" ? 86400000 : analyticsTimeRange === "7d" ? 604800000 : 2592000000;
                      const filtered = globalMessages.filter(m => m.ts > now - rangeMs);
                      const dayHourMap: Record<string, Record<number, number>> = {};
                      filtered.forEach(m => {
                        const d = new Date(m.ts).toLocaleDateString("en-US", { weekday: "short" });
                        const h = new Date(m.ts).getHours();
                        if (!dayHourMap[d]) dayHourMap[d] = {};
                        dayHourMap[d][h] = (dayHourMap[d][h] || 0) + 1;
                      });
                      const maxVal = Math.max(...Object.values(dayHourMap).flatMap(h => Object.values(h)), 1);
                      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                      return (
                        <div className="overflow-x-auto">
                          <div className="min-w-[500px]">
                            <div className="flex gap-0.5 mb-1 pl-10">
                              {Array.from({ length: 24 }, (_, h) => (<span key={h} className="flex-1 text-center text-[7px] text-muted-foreground tabular-nums">{h % 4 === 0 ? h : ""}</span>))}
                            </div>
                            {days.map(day => (
                              <div key={day} className="flex items-center gap-0.5 mb-0.5">
                                <span className="w-10 text-[9px] text-muted-foreground shrink-0">{day}</span>
                                {Array.from({ length: 24 }, (_, h) => {
                                  const val = dayHourMap[day]?.[h] || 0;
                                  const intensity = val / maxVal;
                                  return (<div key={h} className="flex-1 h-5 rounded-sm" style={{ background: intensity === 0 ? "oklch(0.95 0 0)" : `oklch(${0.4 + intensity * 0.3} ${intensity * 0.2} 25)` }} title={`${day} ${h}:00 — ${val} messages`} />);
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* User Engagement - Top 10 */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Users className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Top 10 Most Active Users</h2></div>
                    {(() => {
                      const now = Date.now();
                      const rangeMs = analyticsTimeRange === "24h" ? 86400000 : analyticsTimeRange === "7d" ? 604800000 : 2592000000;
                      const filtered = globalMessages.filter(m => m.ts > now - rangeMs && m.type !== "system");
                      const counts: Record<string, { name: string; count: number }> = {};
                      filtered.forEach(m => {
                        if (!counts[m.uid]) counts[m.uid] = { name: m.uname, count: 0 };
                        counts[m.uid].count++;
                      });
                      const top10 = Object.entries(counts).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
                      const maxC = top10.length > 0 ? top10[0][1].count : 1;
                      return top10.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">No user messages in this time range</p> : (
                        <div className="space-y-2">
                          {top10.map(([uid, data], i) => (
                            <div key={uid} className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground/5 text-[10px] font-semibold">{data.name.charAt(0).toUpperCase()}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-medium truncate">{data.name}</span>
                                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{data.count} msgs</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(data.count / maxC) * 100}%`, background: `oklch(${0.5 + (1 - i / 10) * 0.2} 0.15 250)` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Trending Words */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Hash className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Trending Words</h2></div>
                    {(() => {
                      const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","is","it","this","that","was","are","with","i","you","me","my","we","be","have","has","do","not","no","so","if","as","up","out","just","about","also","how","what","when","where","who","why","all","can","will","would","could","should","than","then","there","here","from","by","an","am","been","being","did","does","had","he","she","they","them","their","its","our","your","more","some","any","very","too","much","many","such","each","every","own","other","which","who","whom","these","those","get","got","go","going","come","make","made","take","want","like","know","think","see","look","find","give","tell","say","said","one","two","new","now","way","may","day","get","got","im","ive","dont","cant","wont","thats","ur","u","r","lol","hi","hey","hello","ok","okay","yeah","yes","nope","oh","wow","haha"]);
                      const now = Date.now();
                      const rangeMs = analyticsTimeRange === "24h" ? 86400000 : analyticsTimeRange === "7d" ? 604800000 : 2592000000;
                      const filtered = globalMessages.filter(m => m.ts > now - rangeMs && m.type !== "system");
                      const wordCounts: Record<string, number> = {};
                      filtered.forEach(m => {
                        m.text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).forEach(w => {
                          if (w.length > 2 && !stopWords.has(w)) wordCounts[w] = (wordCounts[w] || 0) + 1;
                        });
                      });
                      const top15 = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
                      const maxW = top15.length > 0 ? top15[0][1] : 1;
                      return top15.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">Not enough messages to extract trends</p> : (
                        <div className="flex flex-wrap gap-2">
                          {top15.map(([word, count], i) => (
                            <span key={word} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/5" style={{ fontSize: `${Math.max(10, 14 - i)}px` }}>
                              <span>{word}</span>
                              <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Message Type Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><PieChartIcon className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Message Types</h2></div>
                      {(() => {
                        const now = Date.now();
                        const rangeMs = analyticsTimeRange === "24h" ? 86400000 : analyticsTimeRange === "7d" ? 604800000 : 2592000000;
                        const filtered = globalMessages.filter(m => m.ts > now - rangeMs);
                        const userCount = filtered.filter(m => m.type !== "system").length;
                        const sysCount = filtered.filter(m => m.type === "system").length;
                        const total = filtered.length || 1;
                        return (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 justify-center">
                              <svg viewBox="0 0 36 36" className="w-32 h-32">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.95 0 0)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.7 0.12 250)" strokeWidth="3" strokeDasharray={`${(userCount / total) * 100} ${100 - (userCount / total) * 100}`} strokeDashoffset="25" strokeLinecap="round" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.75 0.15 60)" strokeWidth="3" strokeDasharray={`${(sysCount / total) * 100} ${100 - (sysCount / total) * 100}`} strokeDashoffset={`${25 - (userCount / total) * 100}`} strokeLinecap="round" />
                              </svg>
                            </div>
                            <div className="flex items-center justify-center gap-6">
                              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.7 0.12 250)" }} /><span className="text-xs">User ({userCount})</span></div>
                              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.75 0.15 60)" }} /><span className="text-xs">System ({sysCount})</span></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Daily Trend */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-5"><TrendingUp className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Daily Trend (7d)</h2></div>
                      {(() => {
                        const days: { label: string; count: number }[] = [];
                        for (let i = 6; i >= 0; i--) {
                          const d = new Date(); d.setDate(d.getDate() - i);
                          const ds = d.toDateString();
                          days.push({ label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }), count: globalMessages.filter(m => new Date(m.ts).toDateString() === ds).length });
                        }
                        const maxD = Math.max(...days.map(d => d.count), 1);
                        return (
                          <div className="flex items-end gap-2 h-32">
                            {days.map((d, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-muted-foreground tabular-nums">{d.count}</span>
                                <div className="w-full rounded-t-sm bg-foreground/10 relative" style={{ height: "100%" }}>
                                  <div className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-500" style={{ height: `${(d.count / maxD) * 100}%`, background: "oklch(0.7 0.12 250 / 0.6)" }} />
                                </div>
                                <span className="text-[8px] text-muted-foreground">{d.label}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── LIVE MONITOR ─────────────────────────────────────── */}
              {section === "live-monitor" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Activity} label="Live Messages" value={String(liveMessages.length)} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Users} label="Online Users" value={String(onlineUsers.length)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={Zap} label="Messages/min" value={String(liveMessages.filter(m => m.ts > Date.now() - 60000).length)} color="oklch(0.75 0.15 200)" />
                    <StatCard icon={MessageSquare} label="Status" value={livePaused ? "PAUSED" : fbConnected ? "LIVE" : "OFFLINE"} color={livePaused ? "oklch(0.75 0.15 60)" : fbConnected ? "oklch(0.72 0.16 140)" : "oklch(0.65 0.2 25)"} />
                  </div>

                  {/* Controls */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${fbConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        <span className="text-xs text-muted-foreground">{fbConnected ? "Connected" : "Disconnected"}</span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <button onClick={() => setLivePaused(!livePaused)} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${livePaused ? "border-green-500/20 bg-green-500/5 text-green-500" : "border-amber-500/20 bg-amber-500/5 text-amber-500"}`}>
                        {livePaused ? <><Play className="h-3.5 w-3.5" />Resume</> : <><Pause className="h-3.5 w-3.5" />Pause</>}
                      </button>
                      <button onClick={() => setLiveMessages([])} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</button>
                      <button onClick={() => setLiveAutoScroll(!liveAutoScroll)} className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${liveAutoScroll ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"}`}>
                        <ArrowDown className="h-3.5 w-3.5" />Auto-scroll {liveAutoScroll ? "ON" : "OFF"}
                      </button>
                      <label className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 cursor-pointer">
                        <input type="checkbox" checked={liveSoundEnabled} onChange={(e) => setLiveSoundEnabled(e.target.checked)} className="sr-only" />
                        {liveSoundEnabled ? <Volume2 className="h-3.5 w-3.5 text-green-500" /> : <VolumeX className="h-3.5 w-3.5" />}
                        Sound {liveSoundEnabled ? "ON" : "OFF"}
                      </label>
                      <select value={liveFilter} onChange={(e) => setLiveFilter(e.target.value as any)} className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-foreground/30">
                        <option value="all">All Messages</option>
                        <option value="user">User Only</option>
                        <option value="system">System Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Terminal-style chat view */}
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-foreground/[0.02]">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                      <span className="ml-2 text-[10px] font-mono text-muted-foreground">live-feed://bq_messages</span>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto p-4 font-mono text-xs bg-[oklch(0.12_0_0)]">
                      {liveMessages
                        .filter(m => liveFilter === "all" || (liveFilter === "user" && m.type !== "system") || (liveFilter === "system" && m.type === "system"))
                        .map((msg) => {
                          const isSystem = msg.type === "system";
                          const color = isSystem ? "text-amber-400" : msg.uid === "admin" ? "text-blue-400" : "text-white";
                          const ts = new Date(msg.ts).toLocaleTimeString("en-US", { hour12: false });
                          return (
                            <div key={msg.key} className={`flex items-start gap-2 py-0.5 ${color} hover:bg-white/5 transition-colors`}>
                              <span className="text-muted-foreground/60 shrink-0 tabular-nums text-[10px]">{ts}</span>
                              <span className={`shrink-0 rounded px-1 py-0 text-[9px] font-bold ${isSystem ? "bg-amber-500/20 text-amber-400" : msg.uid === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/70"}`}>
                                {isSystem ? "SYS" : msg.uname.slice(0, 6).toUpperCase()}
                              </span>
                              <span className="break-all">{msg.text}</span>
                            </div>
                          );
                        })}
                      {liveMessages.length === 0 && <div className="text-muted-foreground/40 text-center py-8">Waiting for messages...</div>}
                      <div ref={liveMessagesEndRef} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── AUTO-MOD ──────────────────────────────────────────── */}
              {section === "auto-mod" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Shield} label="Active Rules" value={String(autoModRules.filter(r => r.enabled).length)} color="oklch(0.72 0.16 140)" />
                    <StatCard icon={ShieldX} label="Disabled Rules" value={String(autoModRules.filter(r => !r.enabled).length)} color="oklch(0.65 0.1 220)" />
                    <StatCard icon={Gavel} label="Auto-Actions" value={String(autoModLog.length)} color="oklch(0.75 0.15 60)" />
                    <StatCard icon={Activity} label="Total Rules" value={String(autoModRules.length)} color="oklch(0.7 0.12 250)" />
                  </div>

                  {/* Add Rule */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Auto-Moderation Rules</h2></div>
                      <div className="flex items-center gap-2">
                        {autoModRules.length === 0 && (
                          <button onClick={initPresetRules} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><CopyPlus className="h-3.5 w-3.5" />Load Presets</button>
                        )}
                        <button onClick={() => setShowAddRule(!showAddRule)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90">+ Add Rule</button>
                      </div>
                    </div>

                    {showAddRule && (
                      <div className="rounded-xl border border-border bg-background p-4 mb-4 animate-[fade-up_0.2s_ease_both]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">Trigger Type</span>
                            <select value={newRuleTrigger} onChange={(e) => setNewRuleTrigger(e.target.value as any)} className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                              <option value="word">Word Match</option>
                              <option value="regex">Regex Pattern</option>
                              <option value="spam">Spam Detection</option>
                              <option value="caps">Caps Lock</option>
                              <option value="length">Max Length</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">Pattern {newRuleTrigger === "spam" || newRuleTrigger === "caps" ? "(auto)" : ""}</span>
                            <input type="text" value={newRulePattern} onChange={(e) => setNewRulePattern(e.target.value)} disabled={newRuleTrigger === "spam" || newRuleTrigger === "caps"} placeholder={newRuleTrigger === "word" ? "badword1,badword2" : newRuleTrigger === "regex" ? "pattern" : newRuleTrigger === "length" ? "500" : "Auto-detected"} className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30 disabled:opacity-40" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">Action</span>
                            <select value={newRuleAction} onChange={(e) => setNewRuleAction(e.target.value as any)} className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
                              <option value="delete">Delete Message</option>
                              <option value="warn">Warn User</option>
                              <option value="mute">Mute User</option>
                              <option value="ban">Ban User</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">Duration (hours, 0=permanent)</span>
                            <input type="number" value={newRuleDuration} onChange={(e) => setNewRuleDuration(Number(e.target.value))} min={0} className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => saveAutoModRule({ trigger: newRuleTrigger, pattern: newRulePattern, action: newRuleAction, duration: newRuleDuration, enabled: true })} className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90"><Check className="h-3.5 w-3.5" />Save Rule</button>
                          <button onClick={() => setShowAddRule(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Rules List */}
                    {autoModRules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12"><div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5"><Shield className="h-5 w-5 text-muted-foreground" /></div><p className="text-sm font-medium">No auto-mod rules</p><p className="text-xs text-muted-foreground">Add rules or load presets to get started</p></div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {autoModRules.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-3 py-3">
                            <button onClick={() => toggleAutoModRule(rule.id, rule.enabled)} className={`grid h-8 w-12 shrink-0 place-items-center rounded-full transition-colors ${rule.enabled ? "bg-green-500" : "bg-foreground/10"}`}>
                              <div className={`h-6 w-6 rounded-full bg-background transition-transform ${rule.enabled ? "translate-x-2" : "-translate-x-2"}`} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium capitalize">{rule.trigger}</span>
                                {rule.pattern && <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground truncate max-w-32">{rule.pattern}</span>}
                                <span className="text-[9px] text-muted-foreground">→</span>
                                <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium capitalize ${rule.action === "delete" ? "bg-red-500/10 text-red-500" : rule.action === "warn" ? "bg-orange-500/10 text-orange-500" : rule.action === "mute" ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-500"}`}>{rule.action}</span>
                              </div>
                            </div>
                            <button onClick={() => deleteAutoModRule(rule.id)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Test Rules */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><Search className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Test Rules</h2></div>
                    <div className="flex gap-2">
                      <input type="text" value={testModText} onChange={(e) => setTestModText(e.target.value)} placeholder="Enter text to test against rules..." className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
                    </div>
                    {testModText && (
                      <div className="mt-3 space-y-1.5">
                        {testAutoModRules(testModText).map(({ rule, matched }, i) => (
                          <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${matched ? "bg-red-500/5 border border-red-500/20" : "bg-foreground/[0.02] border border-border/50"}`}>
                            {matched ? <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /> : <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                            <span className="capitalize font-medium">{rule.trigger}</span>
                            {rule.pattern && <span className="font-mono text-muted-foreground">{rule.pattern}</span>}
                            <span className="text-muted-foreground">→</span>
                            <span className="capitalize">{rule.action}</span>
                            <span className={`ml-auto text-[9px] font-medium ${matched ? "text-red-500" : "text-green-500"}`}>{matched ? "TRIGGERED" : "PASS"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Execution Log */}
                  {autoModLog.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-2 mb-4"><Clock className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Recent Auto-Mod Actions</h2></div>
                      <div className="space-y-2">
                        {autoModLog.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground/5"><Shield className="h-3.5 w-3.5 text-muted-foreground" /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2"><span className="text-xs font-medium">{entry.userName || entry.uid}</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-medium capitalize ${entry.action === "delete" ? "bg-red-500/10 text-red-500" : entry.action === "warn" ? "bg-orange-500/10 text-orange-500" : "bg-yellow-500/10 text-yellow-600"}`}>{entry.action}</span></div>
                              <p className="text-[10px] text-muted-foreground truncate">Triggered by {entry.trigger} · "{entry.messageText.slice(0, 40)}"</p>
                            </div>
                            <span className="text-[9px] text-muted-foreground shrink-0">{new Date(entry.ts).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── USER INTEL ───────────────────────────────────────── */}
              {section === "user-intel" && (
                <div className="flex flex-col gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><SearchIcon className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">User Intelligence</h2></div>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" value={intelSearchQuery} onChange={(e) => { setIntelSearchQuery(e.target.value); setIntelSelectedUser(null); }} placeholder="Search by UID or username..." className="h-10 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition-all focus:border-foreground/30" />
                    </div>
                    {intelSearchQuery && !intelSelectedUser && (
                      <div className="mt-3 max-h-48 overflow-y-auto divide-y divide-border/50 rounded-lg border border-border">
                        {(() => {
                          const q = intelSearchQuery.toLowerCase();
                          const matches = onlineUsers.filter(u => (u.uid?.toLowerCase().includes(q)) || ((u.name as string)?.toLowerCase().includes(q)));
                          // Also search from messages for non-online users
                          const msgUsers = new Map<string, { uname: string; uid: string }>();
                          globalMessages.forEach(m => { if (!msgUsers.has(m.uid)) msgUsers.set(m.uid, { uname: m.uname, uid: m.uid }); });
                          msgUsers.forEach((v, k) => { if (!matches.some(u => u.uid === k) && (k.toLowerCase().includes(q) || v.uname.toLowerCase().includes(q))) { matches.push({ uid: k, name: v.uname, ts: 0 } as PresenceUser); } });
                          return matches.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">No users found</p> : matches.slice(0, 10).map(u => (
                            <button key={u.uid} onClick={() => setIntelSelectedUser(u.uid)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/[0.02] transition-colors text-left">
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/5 text-xs font-semibold">{((u.name as string) || u.uid).charAt(0).toUpperCase()}</div>
                              <div className="min-w-0 flex-1"><p className="text-xs font-medium truncate">{(u.name as string) || u.uid}</p><p className="text-[10px] text-muted-foreground">UID: {u.uid}</p></div>
                              {onlineUsers.some(o => o.uid === u.uid) && <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {intelSelectedUser && (() => {
                    const uid = intelSelectedUser;
                    const isOnline = onlineUsers.some(u => u.uid === uid);
                    const onlineUser = onlineUsers.find(u => u.uid === uid);
                    const userName = (onlineUser?.name as string) || (() => { const m = globalMessages.find(m => m.uid === uid); return m?.uname || uid; })();
                    const userMsgs = globalMessages.filter(m => m.uid === uid);
                    const userWarnings = warnings.filter(w => w.uid === uid);
                    const activeWarningsCount = userWarnings.filter(w => !isExpired(w.expiresAt)).length;
                    const isBannedUser = bannedUsers.some(b => b.uid === uid && !isExpired(b.expiresAt));
                    const isMutedUser = mutedUsers.some(m => m.uid === uid && !isExpired(m.expiresAt));
                    const banInfo = bannedUsers.find(b => b.uid === uid);
                    const muteInfo = mutedUsers.find(m => m.uid === uid);
                    const userDms = dmConversations.filter(d => d.participants?.includes(uid));
                    const firstSeen = userMsgs.length > 0 ? new Date(Math.min(...userMsgs.map(m => m.ts))).toLocaleString() : "Unknown";
                    const riskLevel = activeWarningsCount === 0 ? "low" : activeWarningsCount <= 2 ? "medium" : "high";
                    const riskColor = riskLevel === "low" ? "bg-green-500/10 text-green-500" : riskLevel === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500";
                    const riskLabel = riskLevel === "low" ? "LOW" : riskLevel === "medium" ? "MEDIUM" : "HIGH";

                    return (
                      <div className="flex flex-col gap-6 animate-[fade-up_0.2s_ease_both]">
                        {/* Profile Card */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                          <div className="flex items-start gap-4">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foreground/5 text-lg font-semibold">{userName.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold">{userName}</h3>
                                {isOnline ? <span className="flex items-center gap-1 rounded-md bg-green-500/10 px-1.5 py-0.5 text-[9px] font-medium text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />ONLINE</span> : <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">OFFLINE</span>}
                                {isBannedUser && <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">BANNED</span>}
                                {isMutedUser && <span className="rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-[9px] font-medium text-yellow-600">MUTED</span>}
                                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${riskColor}`}>RISK: {riskLabel}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">UID: {uid}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                                <span>Total Messages: <strong className="text-foreground">{userMsgs.length}</strong></span>
                                <span>Warnings: <strong className={activeWarningsCount > 0 ? "text-orange-500" : "text-foreground"}>{activeWarningsCount}</strong></span>
                                <span>DMs: <strong className="text-foreground">{userDms.length}</strong></span>
                                <span>First Seen: <strong className="text-foreground">{firstSeen}</strong></span>
                                <span>Last Seen: <strong className="text-foreground">{onlineUser?.ts ? new Date(onlineUser.ts).toLocaleString() : "Unknown"}</strong></span>
                              </div>
                            </div>
                          </div>
                          {/* Quick Actions */}
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                            <button onClick={() => setWarnDialogUid(uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-orange-500 text-xs font-medium transition-colors hover:bg-orange-500/10 border border-orange-500/20"><AlertTriangle className="h-3.5 w-3.5" />Warn</button>
                            <button onClick={() => setMuteDialogUid(uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-yellow-600 text-xs font-medium transition-colors hover:bg-yellow-500/10 border border-yellow-500/20"><VolumeX className="h-3.5 w-3.5" />Mute</button>
                            <button onClick={() => setBanDialogUid(uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><Ban className="h-3.5 w-3.5" />Ban</button>
                            <button onClick={() => kickUser(uid)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10 border border-red-500/20"><UserX className="h-3.5 w-3.5" />Kick</button>
                            <button onClick={async () => { setMagicLinkUsername(userName); setSection("security"); }} className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-purple-500 text-xs font-medium transition-colors hover:bg-purple-500/10 border border-purple-500/20"><Zap className="h-3.5 w-3.5" />Magic Link</button>
                          </div>
                        </div>

                        {/* Ban/Mute Details */}
                        {(isBannedUser || isMutedUser) && (
                          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-xs font-medium text-red-500">Active Restrictions</span></div>
                            {isBannedUser && banInfo && <p className="text-[10px] text-muted-foreground">Banned: {banInfo.reason || "No reason"} · Since {new Date(banInfo.bannedAt).toLocaleString()} {banInfo.expiresAt > 0 ? `· Expires ${formatExpiry(banInfo.expiresAt)}` : "· Permanent"}</p>}
                            {isMutedUser && muteInfo && <p className="text-[10px] text-muted-foreground">Muted: {muteInfo.reason || "No reason"} · Since {new Date(muteInfo.mutedAt).toLocaleString()} {muteInfo.expiresAt > 0 ? `· Expires ${formatExpiry(muteInfo.expiresAt)}` : "· Permanent"}</p>}
                          </div>
                        )}

                        {/* Recent Messages */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                          <div className="flex items-center gap-2 mb-4"><MessageSquare className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Recent Messages ({userMsgs.length})</h2></div>
                          <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
                            {userMsgs.slice(0, 20).map(msg => (
                              <div key={msg.key} className="flex items-start gap-3 px-2 py-3 hover:bg-foreground/[0.01] transition-colors">
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mt-0.5">{new Date(msg.ts).toLocaleTimeString()}</span>
                                <p className="text-xs break-words flex-1">{msg.text}</p>
                                <button onClick={() => deleteMessage(msg.key, "global")} className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            ))}
                            {userMsgs.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No messages found</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ─── EMERGENCY ─────────────────────────────────────────── */}
              {section === "emergency" && (
                <div className="flex flex-col gap-6">
                  {actionMsg && (<div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 animate-[fade-up_0.2s_ease_both]"><Check className="h-4 w-4 text-green-500" /><span className="text-xs font-medium text-green-500">{actionMsg}</span></div>)}

                  {/* Status Banner */}
                  <div className="flex flex-col gap-3">
                    {widgetConfig.maintenanceEnabled && (
                      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 animate-[fade-up_0.2s_ease_both]"><Wrench className="h-5 w-5 text-amber-500 shrink-0" /><div><p className="text-xs font-medium text-amber-500">Maintenance Mode Active</p><p className="text-[10px] text-muted-foreground mt-0.5">Widget is showing maintenance overlay to all users</p></div></div>
                    )}
                    {!widgetConfig.widgetEnabled && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 animate-[fade-up_0.2s_ease_both]"><ShieldAlert className="h-5 w-5 text-red-500 shrink-0" /><div><p className="text-xs font-medium text-red-500">Widget is DISABLED</p><p className="text-[10px] text-muted-foreground mt-0.5">The chat widget is completely turned off</p></div></div>
                    )}
                    {chatFrozen && (
                      <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 animate-[fade-up_0.2s_ease_both]"><Lock className="h-5 w-5 text-blue-500 shrink-0" /><div><p className="text-xs font-medium text-blue-500">Chat is FROZEN</p><p className="text-[10px] text-muted-foreground mt-0.5">Chat is in read-only mode. Users cannot send messages.</p></div></div>
                    )}
                  </div>

                  {/* Panic Button */}
                  <div className="rounded-2xl border-2 border-red-500/30 bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><ShieldAlert className="h-4 w-4 text-red-500" /><h2 className="text-sm font-semibold text-red-500">Panic Button</h2></div>
                    <p className="text-xs text-muted-foreground mb-4">Instantly enables maintenance mode and disables the widget. Use in emergencies.</p>
                    <button onClick={triggerPanic} className="flex items-center justify-center gap-2 h-14 w-full rounded-xl bg-red-500 text-white text-sm font-bold transition-all hover:bg-red-600 active:scale-[0.98] shadow-lg shadow-red-500/20">
                      <AlertTriangle className="h-5 w-5" />ACTIVATE PANIC MODE
                    </button>
                  </div>

                  {/* Lockdown Mode */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Lockdown Mode</h2></div>
                      <button onClick={() => toggleLockdown(!widgetConfig.slowMode || !widgetConfig.profanityFilter || !widgetConfig.linkFilter)} className={`flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-colors ${widgetConfig.slowMode && widgetConfig.profanityFilter && widgetConfig.linkFilter ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-foreground text-background hover:opacity-90"}`}>
                        {widgetConfig.slowMode && widgetConfig.profanityFilter && widgetConfig.linkFilter ? <><ShieldX className="h-3.5 w-3.5" />Disable Lockdown</> : <><Shield className="h-3.5 w-3.5" />Enable Lockdown</>}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Enables: Slow Mode (60s), Rate Limiting, Profanity Filter, Link Filter</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${widgetConfig.slowMode ? "bg-green-500/10 text-green-500" : "bg-foreground/5 text-muted-foreground"}`}>Slow Mode {widgetConfig.slowMode ? "✓" : "✗"}</span>
                      <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${widgetConfig.rateLimitEnabled ? "bg-green-500/10 text-green-500" : "bg-foreground/5 text-muted-foreground"}`}>Rate Limit {widgetConfig.rateLimitEnabled ? "✓" : "✗"}</span>
                      <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${widgetConfig.profanityFilter ? "bg-green-500/10 text-green-500" : "bg-foreground/5 text-muted-foreground"}`}>Profanity Filter {widgetConfig.profanityFilter ? "✓" : "✗"}</span>
                      <span className={`rounded-md px-2 py-1 text-[9px] font-medium ${widgetConfig.linkFilter ? "bg-green-500/10 text-green-500" : "bg-foreground/5 text-muted-foreground"}`}>Link Filter {widgetConfig.linkFilter ? "✓" : "✗"}</span>
                    </div>
                  </div>

                  {/* Freeze Chat */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Freeze Chat</h2></div>
                        <p className="text-[10px] text-muted-foreground mt-1">Makes chat read-only. Users can see messages but cannot send new ones.</p>
                      </div>
                      <button onClick={() => toggleChatFreeze(!chatFrozen)} className={`flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium transition-colors ${chatFrozen ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-foreground text-background hover:opacity-90"}`}>
                        {chatFrozen ? <><Lock className="h-3.5 w-3.5" />Unfreeze</> : <><Lock className="h-3.5 w-3.5" />Freeze</>}
                      </button>
                    </div>
                  </div>

                  {/* Nuke Chat */}
                  <div className="rounded-2xl border-2 border-red-500/20 bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><Trash2 className="h-4 w-4 text-red-500" /><h2 className="text-sm font-semibold text-red-500">Nuke Chat</h2></div>
                    <p className="text-xs text-muted-foreground mb-4">Permanently deletes ALL messages, DMs, and warnings. This action cannot be undone.</p>
                    {nukeConfirmStep === 0 ? (
                      <button onClick={() => setNukeConfirmStep(1)} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-500/30 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10"><Trash2 className="h-4 w-4" />Nuke Everything</button>
                    ) : nukeConfirmStep === 1 ? (
                      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="flex-1"><p className="text-xs font-medium text-red-500">Are you absolutely sure?</p><p className="text-[10px] text-muted-foreground">This will delete all messages, DMs, and warnings forever.</p></div>
                        <div className="flex items-center gap-2"><button onClick={() => setNukeConfirmStep(2)} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium">Yes, continue</button><button onClick={() => setNukeConfirmStep(0)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border-2 border-red-500/30 bg-red-500/10 p-4 animate-pulse">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="flex-1"><p className="text-xs font-bold text-red-500">FINAL WARNING — Type "NUKE" to confirm</p><p className="text-[10px] text-muted-foreground">There is no going back.</p></div>
                        <div className="flex items-center gap-2"><button onClick={nukeChat} className="h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-bold">💥 NUKE</button><button onClick={() => setNukeConfirmStep(0)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button></div>
                      </div>
                    )}
                  </div>

                  {/* Mass Kick */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2"><UserX className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Mass Kick</h2></div>
                        <p className="text-[10px] text-muted-foreground mt-1">Disconnect all {onlineUsers.length} online users.</p>
                      </div>
                      {!massKickConfirm ? (
                        <button onClick={() => setMassKickConfirm(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-red-500/20 text-red-500 text-xs font-medium transition-colors hover:bg-red-500/10"><UserX className="h-3.5 w-3.5" />Kick All</button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={massKickAll} className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium">Confirm</button>
                          <button onClick={() => setMassKickConfirm(false)} className="h-8 px-3 rounded-lg border border-border text-xs font-medium">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── BUG MONITOR ───────────────────────────────────── */}
              {section === "bug-monitor" && (
                <div className="flex flex-col gap-6">
                  {/* Header Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={ShieldAlert} label="Total Issues" value={String(bugLogs.length)} color="oklch(0.65 0.2 25)" />
                    <StatCard icon={AlertCircle} label="Errors" value={String(bugLogs.filter(b => b.sev === "error" || b.sev === "critical").length)} color="oklch(0.65 0.2 25)" />
                    <StatCard icon={AlertTriangle} label="Warnings" value={String(bugLogs.filter(b => b.sev === "warn").length)} color="oklch(0.75 0.15 60)" />
                    <StatCard icon={Activity} label="Monitor" value={bugLogAutoRefresh ? "Active" : "Paused"} color="oklch(0.72 0.16 140)" />
                  </div>

                  {/* Controls */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <input
                          type="text"
                          placeholder="Search bug logs..."
                          value={bugLogSearch}
                          onChange={e => setBugLogSearch(e.target.value)}
                          className="h-8 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {(["all", "error", "warn", "info"] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setBugLogFilter(f)}
                            className={`h-7 px-2.5 rounded-md text-[10px] font-medium transition-colors ${
                              bugLogFilter === f
                                ? f === "error" ? "bg-red-500/15 text-red-500 border border-red-500/30"
                                : f === "warn" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                : f === "info" ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                                : "bg-foreground/10 text-foreground border border-foreground/20"
                                : "text-muted-foreground border border-transparent hover:bg-foreground/5"
                            }`}
                          >
                            {f === "all" ? "All" : f === "error" ? "Errors" : f === "warn" ? "Warnings" : "Info"}
                          </button>
                        ))}
                        <button
                          onClick={() => setBugLogAutoRefresh(!bugLogAutoRefresh)}
                          className={`h-7 px-2.5 rounded-md text-[10px] font-medium transition-colors ${bugLogAutoRefresh ? "bg-green-500/15 text-green-500 border border-green-500/30" : "text-muted-foreground border border-transparent"}`}
                        >
                          {bugLogAutoRefresh ? "Auto" : "Manual"}
                        </button>
                        <button
                          onClick={async () => {
                            const db = getFirebaseDb();
                            if (db) {
                              await remove(ref(db, "bq_bug_logs"));
                              setBugLogs([]);
                              showActionMsg("Bug logs cleared");
                            }
                          }}
                          className="h-7 px-2.5 rounded-md text-[10px] font-medium text-red-500 border border-red-500/20 transition-colors hover:bg-red-500/10"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bug Category Summary */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><ShieldAlert className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Issue Categories</h2></div>
                    {(() => {
                      const cats: Record<string, number> = {};
                      bugLogs.forEach(b => { cats[b.cat] = (cats[b.cat] || 0) + 1; });
                      const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
                      if (!sorted.length) return <p className="text-xs text-muted-foreground text-center py-4">No issues detected — system is healthy!</p>;
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {sorted.slice(0, 8).map(([cat, count]) => {
                            const hasErrors = bugLogs.some(b => b.cat === cat && (b.sev === "error" || b.sev === "critical"));
                            return (
                              <div key={cat} className="rounded-xl border border-border bg-background p-3 flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{cat.replace(/-/g, " ")}</span>
                                <span className={`text-lg font-semibold tabular-nums ${hasErrors ? "text-red-500" : "text-amber-500"}`}>{count}</span>
                                <div className="h-1 rounded-full bg-foreground/5"><div className={`h-full rounded-full ${hasErrors ? "bg-red-500/40" : "bg-amber-500/40"}`} style={{ width: `${Math.min(100, count * 10)}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bug Log List */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Bug Log</h2></div>
                      <span className="text-[10px] text-muted-foreground">{bugLogs.length} entries</span>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin" }}>
                      {(() => {
                        const filtered = bugLogs.filter(b => {
                          if (bugLogFilter === "error" && b.sev !== "error" && b.sev !== "critical") return false;
                          if (bugLogFilter === "warn" && b.sev !== "warn") return false;
                          if (bugLogFilter === "info" && b.sev !== "info") return false;
                          if (bugLogSearch && !b.msg.toLowerCase().includes(bugLogSearch.toLowerCase()) && !b.cat.toLowerCase().includes(bugLogSearch.toLowerCase()) && !b.detail.toLowerCase().includes(bugLogSearch.toLowerCase())) return false;
                          return true;
                        });
                        if (!filtered.length) return <p className="text-xs text-muted-foreground text-center py-8">No matching entries found</p>;
                        return filtered.slice(0, 100).map(bug => (
                          <div key={bug.id} className={`flex items-start gap-3 rounded-xl border p-3 ${
                            bug.sev === "critical" ? "border-red-500/30 bg-red-500/5" :
                            bug.sev === "error" ? "border-red-500/20 bg-red-500/[0.03]" :
                            bug.sev === "warn" ? "border-amber-500/20 bg-amber-500/[0.03]" :
                            "border-border bg-background"
                          }`}>
                            <div className={`mt-0.5 shrink-0 rounded-md p-1 ${
                              bug.sev === "critical" ? "bg-red-500/20 text-red-500" :
                              bug.sev === "error" ? "bg-red-500/15 text-red-500" :
                              bug.sev === "warn" ? "bg-amber-500/15 text-amber-500" :
                              "bg-blue-500/10 text-blue-500"
                            }`}>
                              {bug.sev === "critical" || bug.sev === "error" ? <AlertCircle className="h-3.5 w-3.5" /> :
                               bug.sev === "warn" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                               <Activity className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  bug.sev === "critical" ? "bg-red-500/20 text-red-500" :
                                  bug.sev === "error" ? "bg-red-500/15 text-red-500" :
                                  bug.sev === "warn" ? "bg-amber-500/15 text-amber-500" :
                                  "bg-blue-500/10 text-blue-500"
                                }`}>{bug.sev}</span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{bug.cat.replace(/-/g, " ")}</span>
                                <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{new Date(bug.ts).toLocaleString()}</span>
                              </div>
                              <p className="text-xs font-medium mt-1 break-words">{bug.msg}</p>
                              {bug.detail && <p className="text-[10px] text-muted-foreground mt-0.5 break-words font-mono">{bug.detail.slice(0, 200)}</p>}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Monitor Info */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4"><Wrench className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Monitor System</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Monitors</span>
                        <div className="space-y-1.5">
                          {["JS Error Catcher", "Promise Rejection", "Firebase Errors", "Scroll Anomaly", "DOM Consistency", "Render Performance", "Firebase Health", "Self-Healing"].map(m => (
                            <div key={m} className="flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span className="text-[11px]">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Self-Healing Capabilities</span>
                        <div className="space-y-1.5">
                          {["Duplicate DOM removal", "Stale separator cleanup", "Ghost message suppression", "Firebase retry logic", "Detached node cleanup", "Connection state recovery"].map(m => (
                            <div key={m} className="flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span className="text-[11px]">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── FIREBASE HEALTH ───────────────────────────────────── */}
              {section === "fb-health" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Heart} label="Status" value={fbHealthStatus === "healthy" ? "Healthy" : fbHealthStatus === "degraded" ? "Degraded" : fbHealthStatus === "down" ? "Down" : "Checking..."} color={fbHealthStatus === "healthy" ? "oklch(0.72 0.16 140)" : fbHealthStatus === "degraded" ? "oklch(0.75 0.15 60)" : "oklch(0.65 0.2 25)"} />
                    <StatCard icon={Zap} label="Latency" value={fbLatency !== null ? `${fbLatency}ms` : "..."} color="oklch(0.7 0.12 250)" />
                    <StatCard icon={Activity} label="Connection" value={fbConnected ? "Connected" : "Disconnected"} color={fbConnected ? "oklch(0.72 0.16 140)" : "oklch(0.65 0.2 25)"} />
                    <StatCard icon={Database} label="Messages Node" value={String(totalMessageCount)} color="oklch(0.75 0.15 200)" />
                  </div>

                  {/* Connection Status Card */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Heart className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Connection Status</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-3 w-3 rounded-full ${fbConnected ? "bg-green-500" : "bg-red-500"} ${fbConnected ? "animate-pulse" : ""}`} />
                          <span className="text-sm font-medium">{fbConnected ? "Connected" : "Disconnected"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Latency</span>
                        <div className="flex items-center gap-2">
                          {fbLatency !== null ? (
                            <><span className="text-sm font-medium tabular-nums">{fbLatency}ms</span>
                            <span className={`text-[10px] font-medium ${fbLatency < 200 ? "text-green-500" : fbLatency < 500 ? "text-amber-500" : "text-red-500"}`}>{fbLatency < 200 ? "Good" : fbLatency < 500 ? "Slow" : "Poor"}</span></>
                          ) : <span className="text-sm text-muted-foreground">Measuring...</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Checked</span>
                        <span className="text-sm font-medium tabular-nums">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button onClick={measureFbLatency} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground mt-4"><RefreshCw className="h-3.5 w-3.5" />Refresh Latency</button>
                  </div>

                  {/* Database Size Estimate */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-5"><Database className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Database Overview</h2></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Messages", count: totalMessageCount || globalMessages.length, color: "oklch(0.7 0.12 250)" },
                        { label: "Online Users", count: onlineUsers.length, color: "oklch(0.72 0.16 140)" },
                        { label: "Warnings", count: warnings.length, color: "oklch(0.75 0.15 60)" },
                        { label: "DM Conversations", count: dmConversations.length, color: "oklch(0.75 0.15 200)" },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-1.5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                          <span className="text-lg font-semibold tabular-nums">{item.count}</span>
                          <div className="h-1 rounded-full bg-foreground/5"><div className="h-full rounded-full" style={{ width: `${Math.min(100, item.count / 10)}%`, background: item.color }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostics */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">Diagnostics</h2></div>
                      <button onClick={runFbDiagnostics} disabled={fbDiagRunning} className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-40">
                        {fbDiagRunning ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Running...</> : <><Wrench className="h-3.5 w-3.5" />Run Diagnostics</>}
                      </button>
                    </div>
                    {fbDiagResults ? (
                      <div className="space-y-2">
                        {Object.entries(fbDiagResults).map(([test, result]) => (
                          <div key={test} className={`flex items-center gap-3 rounded-xl border p-3 ${result.ok ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                            {result.ok ? <Check className="h-4 w-4 text-green-500 shrink-0" /> : <X className="h-4 w-4 text-red-500 shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium capitalize">{test}</span>
                                <span className="text-[10px] text-muted-foreground tabular-nums">{result.ms}ms</span>
                              </div>
                              {result.error && <p className="text-[10px] text-red-500">{result.error}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">Click "Run Diagnostics" to test read, write, and delete operations</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>

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

// ─── Helper Components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/10">
      <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}><Icon className="h-4 w-4" style={{ color }} /></div>
      <div><p className="text-xl font-semibold tabular-nums">{value}</p><p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p></div>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (<button onClick={() => onChange(!value)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${value ? "bg-foreground" : "bg-foreground/20"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} /></button>);
}

function SyncIndicator() {
  return (<span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><RefreshCw className="h-2.5 w-2.5 animate-spin" />syncing</span>);
}

function ConfigToggle({ label, value, syncing, onChange }: { label: string; value: boolean; syncing: boolean; onChange: (v: boolean) => void }) {
  return (<div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{label}</span>{syncing && <SyncIndicator />}</div><ToggleSwitch value={value} onChange={onChange} /></div>);
}

function ConfigSlider({ label, value, min, max, step, unit, syncing, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; syncing: boolean; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><div className="flex items-center gap-2">{syncing && <SyncIndicator />}<span className="text-xs font-medium tabular-nums">{value}{unit}</span></div></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-foreground/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground" />
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
}

function ConfigSelect({ label, value, options, syncing, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; syncing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{label}</span>{syncing && <SyncIndicator />}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-foreground/30">
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function ConfigColorPicker({ label, value, syncing, onChange }: {
  label: string; value: string; syncing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{label}</span>{syncing && <SyncIndicator />}</div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded-lg border border-border bg-transparent cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs font-mono outline-none focus:border-foreground/30" />
      </div>
    </div>
  );
}
