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

  // ── Moderation ──
  profanityFilter: boolean;
  slowMode: boolean;
  slowModeInterval: number;       // seconds between messages in slow mode
  linkFilter: boolean;
  maxAccounts: number;            // max accounts per device

  // ── Announcements ──
  announcementEnabled: boolean;
  announcementText: string;
  announcementColor: string;      // banner accent color
  announcementDismiss: boolean;

  // ── Streaks ──
  streaksEnabled: boolean;
  streakFreezeDays: number;       // freeze days per month
  streakMultiplier: number;
  streakRewardMessage: string;

  // ── Welcome Message ──
  welcomeEnabled: boolean;
  welcomeMessage: string;
  welcomeDelay: number;           // ms before showing welcome

  // ── Widget Position & Size ──
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widgetOffsetX: number;          // px from edge
  widgetOffsetY: number;          // px from edge
  bubbleSize: number;             // px
  panelWidth: number;             // px
  panelHeight: number;            // px

  // ── Rate Limiting ──
  rateLimitEnabled: boolean;
  rateLimitMessages: number;      // max messages per interval
  rateLimitInterval: number;      // seconds
  spamProtection: boolean;

  // ── Sound & Haptics ──
  messageSound: string;
  sendSound: boolean;
  hapticFeedback: boolean;

  // ── Online Indicators ──
  showOnlineCount: boolean;
  showTypingIndicator: boolean;   // show "X is typing" for all users

  // ── Custom Reactions ──
  customReactions: string;        // comma-separated emoji list

  // ── Message Templates ──
  messageTemplates: string;       // newline-separated quick reply templates

  // ── Maintenance Mode ──
  maintenanceEnabled: boolean;
  maintenanceMessage: string;

  // ── Chat Features ──
  imageUpload: boolean;
  voiceMessages: boolean;
  fileSharing: boolean;

  // ── Privacy ──
  showReadReceipts: boolean;
  showPresence: boolean;
  allowDeleteMessages: boolean;

  // ── Widget Animation ──
  openAnimation: "slide" | "fade" | "scale" | "none";
  closeAnimation: "slide" | "fade" | "scale" | "none";

  // ── Emoji Settings ──
  emojiSkinTone: "default" | "light" | "medium-light" | "medium" | "medium-dark" | "dark";
  frequentEmojiTracking: boolean;
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
  defaultTheme: "pure-black",

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

  // Moderation
  profanityFilter: true,
  slowMode: false,
  slowModeInterval: 5,
  linkFilter: false,
  maxAccounts: 3,

  // Announcements
  announcementEnabled: false,
  announcementText: "",
  announcementColor: "#2EB9DF",
  announcementDismiss: true,

  // Streaks
  streaksEnabled: true,
  streakFreezeDays: 3,
  streakMultiplier: 1,
  streakRewardMessage: "🔥 Amazing! You're on a {days}-day streak!",

  // Welcome Message
  welcomeEnabled: true,
  welcomeMessage: "Welcome to BioQuiz Chat! 🧬 Ask me anything about biology.",
  welcomeDelay: 2000,

  // Widget Position & Size
  widgetPosition: "bottom-right",
  widgetOffsetX: 24,
  widgetOffsetY: 24,
  bubbleSize: 56,
  panelWidth: 400,
  panelHeight: 600,

  // Rate Limiting
  rateLimitEnabled: true,
  rateLimitMessages: 10,
  rateLimitInterval: 30,
  spamProtection: true,

  // Sound & Haptics
  messageSound: "default",
  sendSound: false,
  hapticFeedback: true,

  // Online Indicators
  showOnlineCount: true,
  showTypingIndicator: true,

  // Custom Reactions
  customReactions: "❤️,😂,👍,😮,🎉,🤔,👏,💯",

  // Message Templates
  messageTemplates: "Help\nWhat is mitosis?\nExplain DNA replication\nCell division",

  // Maintenance Mode
  maintenanceEnabled: false,
  maintenanceMessage: "Under maintenance. Please check back soon.",

  // Chat Features
  imageUpload: true,
  voiceMessages: false,
  fileSharing: false,

  // Privacy
  showReadReceipts: true,
  showPresence: true,
  allowDeleteMessages: true,

  // Widget Animation
  openAnimation: "slide",
  closeAnimation: "slide",

  // Emoji Settings
  emojiSkinTone: "default",
  frequentEmojiTracking: true,
};

// ─── Only two themes: Pure Black and Golden Brown ──────────
export const WIDGET_THEMES = [
  { id: "pure-black", name: "Pure Black", type: "dark" as const, preview: "#000000", accent: "#ffffff", description: "True black background, white accents" },
  { id: "golden", name: "Golden Brown", type: "dark" as const, preview: "#1a1508", accent: "#d4a056", description: "Warm golden tones on deep brown" },
] as const;

// ─── Status options ─────────────────────────────────────────
export const STATUS_OPTIONS = [
  { id: "online", label: "Online", color: "#34d399", iconType: "circle" as const },
  { id: "studying", label: "Studying", color: "#60a5fa", iconType: "book" as const },
  { id: "away", label: "Away", color: "#fbbf24", iconType: "clock" as const },
  { id: "busy", label: "Busy", color: "#f87171", iconType: "minus" as const },
] as const;
