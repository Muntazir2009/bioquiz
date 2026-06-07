// ─── WidgetConfig Type & Defaults ───────────────────────────
// Mirrors what chat-widget.js actually uses
// Firebase RTDB path: bq_widget_config/settings

export interface NotifPrefs {
  inApp: boolean;
  push: boolean;
  sound: boolean;
  globalChat: boolean;
  dms: boolean;
  mentions: boolean;
}

export interface WidgetConfig {
  // ── Appearance (CSS Custom Properties) ──
  accentColor: string;        // --bq-accent
  accent2Color: string;       // --bq-accent-2
  bgColor: string;            // --bq-bg
  bgElevated: string;         // --bq-bg-elevated
  textColor: string;          // --bq-text
  borderRadius: number;       // --bq-radius (px)
  bubbleMine: string;         // --bq-bubble-mine gradient
  fontSize: "sm" | "md" | "lg";
  bubbleStyle: "rounded" | "modern" | "minimal";

  // ── Theme ──
  defaultTheme: string;       // Theme ID applied to new users

  // ── Behavior ──
  autoOpen: boolean;
  autoOpenDelay: number;      // ms
  typingIndicator: boolean;
  readReceipts: boolean;
  charLimit: number;          // max chars per message
  maxMessages: number;        // max messages fetched per chat

  // ── Notifications ──
  notifPrefs: NotifPrefs;

  // ── Disappearing Messages ──
  disappearingEnabled: boolean;
  disappearDefaultTtl: number; // ms (default 1hr)

  // ── Profile / Bot Identity ──
  botName: string;
  botStatus: "online" | "studying" | "away" | "busy";
  botBio: string;
  botInitials: string;
  botBannerColor: string;

  // ── Security ──
  widgetEnabled: boolean;     // master kill switch
  disguiseEnabled: boolean;   // calculator cover mode
  widgetPin: string;          // PIN to unlock disguise
  dmLockEnabled: boolean;
  allowedDomains: string;     // newline-separated

  // ── Advanced ──
  workerUrl: string;
  giphyApiKey: string;
  imageHost: string;
  customCSS: string;
  debugMode: boolean;
}

export const DEFAULT_CONFIG: WidgetConfig = {
  // Appearance
  accentColor: "#60a5fa",
  accent2Color: "#a78bfa",
  bgColor: "#080808",
  bgElevated: "#111113",
  textColor: "#f0f0f0",
  borderRadius: 16,
  bubbleMine: "linear-gradient(145deg,#3b82f6,#6366f1)",
  fontSize: "md",
  bubbleStyle: "rounded",

  // Theme
  defaultTheme: "none",

  // Behavior
  autoOpen: false,
  autoOpenDelay: 3000,
  typingIndicator: true,
  readReceipts: true,
  charLimit: 320,
  maxMessages: 50,

  // Notifications
  notifPrefs: {
    inApp: true,
    push: false,
    sound: true,
    globalChat: true,
    dms: true,
    mentions: true,
  },

  // Disappearing
  disappearingEnabled: false,
  disappearDefaultTtl: 3600000,

  // Profile
  botName: "BioQuiz AI",
  botStatus: "online",
  botBio: "Your biology study companion",
  botInitials: "BQ",
  botBannerColor: "#60a5fa",

  // Security
  widgetEnabled: true,
  disguiseEnabled: false,
  widgetPin: "1306",
  dmLockEnabled: false,
  allowedDomains: "",

  // Advanced
  workerUrl: "ask-ai.killermunu.workers.dev",
  giphyApiKey: "hylHrfS6vc3Hnbc6R6QRgpbHfWbwSCWY",
  imageHost: "",
  customCSS: "",
  debugMode: false,
};

// ─── All 28 themes the widget supports ──────────────────────
export const WIDGET_THEMES = [
  { id: "none", name: "Dark", type: "dark" as const, preview: "#080808" },
  { id: "light", name: "Light", type: "light" as const, preview: "#f8f9fa" },
  { id: "black", name: "Pure Black", type: "dark" as const, preview: "#000000" },
  { id: "noir", name: "Noir", type: "dark" as const, preview: "#0a0a0c" },
  { id: "aurora", name: "Aurora", type: "dark" as const, preview: "#0c1220" },
  { id: "ocean", name: "Ocean", type: "dark" as const, preview: "#0a1628" },
  { id: "oceanv2", name: "Ocean V2", type: "dark" as const, preview: "#091a2a" },
  { id: "midnight", name: "Midnight", type: "dark" as const, preview: "#0c0c1d" },
  { id: "midnightpurple", name: "Midnight Purple", type: "dark" as const, preview: "#120c20" },
  { id: "crimson", name: "Crimson", type: "dark" as const, preview: "#150d10" },
  { id: "sunset", name: "Sunset", type: "dark" as const, preview: "#1a0a2e" },
  { id: "sunsetv2", name: "Sunset V2", type: "dark" as const, preview: "#1c0e2e" },
  { id: "forest", name: "Forest", type: "dark" as const, preview: "#0a1a0a" },
  { id: "bubblegum", name: "Bubblegum", type: "dark" as const, preview: "#1a0a1e" },
  { id: "rose", name: "Rose", type: "light" as const, preview: "#fce4ec" },
  { id: "peach", name: "Peach", type: "light" as const, preview: "#fff3e0" },
  { id: "carbon", name: "Carbon", type: "dark" as const, preview: "#1a1a1a" },
  { id: "monochrome", name: "Monochrome", type: "dark" as const, preview: "#111111" },
  { id: "plain", name: "Plain", type: "dark" as const, preview: "#000000" },
  { id: "golden", name: "Golden", type: "dark" as const, preview: "#1a1508" },
  { id: "pure-black", name: "Pure Black+", type: "dark" as const, preview: "#000000" },
  { id: "grid", name: "Grid", type: "dark" as const, preview: "#080808" },
  { id: "dots", name: "Dots", type: "dark" as const, preview: "#080808" },
  { id: "wave", name: "Wave", type: "dark" as const, preview: "#0a0a1a" },
  { id: "whatsapp", name: "WhatsApp", type: "light" as const, preview: "#ece5dd" },
  { id: "wadark", name: "WhatsApp Dark", type: "dark" as const, preview: "#0b141a" },
  { id: "walight", name: "WhatsApp Light", type: "light" as const, preview: "#f0f0f0" },
  { id: "paper", name: "Paper", type: "light" as const, preview: "#faf8f5" },
] as const;

// ─── Status options ─────────────────────────────────────────
export const STATUS_OPTIONS = [
  { id: "online", label: "Online", color: "#34d399", icon: "🟢" },
  { id: "studying", label: "Studying", color: "#60a5fa", icon: "📚" },
  { id: "away", label: "Away", color: "#fbbf24", icon: "🟡" },
  { id: "busy", label: "Busy", color: "#f87171", icon: "🔴" },
] as const;
