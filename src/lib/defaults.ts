// ─── WidgetConfig Type & Defaults ───────────────────────────
// Mirror of the Firebase RTDB path: bq_widget_config/settings

export interface QuickReply {
  id: string;
  label: string;
  message: string;
}

export interface WidgetConfig {
  // ── Appearance ──
  primaryColor: string;
  fontFamily: string;
  borderRadius: number;        // px
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widgetSize: "sm" | "md" | "lg";
  darkMode: boolean;
  customCSS: string;

  // ── Behavior ──
  autoOpen: boolean;
  autoOpenDelay: number;       // ms
  typingIndicator: boolean;
  soundEnabled: boolean;
  persistHistory: boolean;
  rateLimit: number;           // messages per minute

  // ── Welcome Screen ──
  botName: string;
  avatarUrl: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  bgGradientPreset: string;    // e.g. "ocean", "sunset", "forest", "midnight"

  // ── Quick Replies ──
  quickReplies: QuickReply[];

  // ── AI Persona ──
  systemPrompt: string;
  temperature: number;         // 0-1
  fallbackMessage: string;
  workerUrl: string;

  // ── Access Control ──
  enabled: boolean;            // master kill switch
  allowedDomains: string;      // newline-separated
}

export const DEFAULT_CONFIG: WidgetConfig = {
  // Appearance
  primaryColor: "#2EB9DF",
  fontFamily: "Geist, system-ui, sans-serif",
  borderRadius: 16,
  position: "bottom-right",
  widgetSize: "md",
  darkMode: true,
  customCSS: "",

  // Behavior
  autoOpen: false,
  autoOpenDelay: 3000,
  typingIndicator: true,
  soundEnabled: true,
  persistHistory: true,
  rateLimit: 20,

  // Welcome Screen
  botName: "BioQuiz AI",
  avatarUrl: "",
  welcomeTitle: "Hey there! 👋",
  welcomeSubtitle: "Ask me anything about biology",
  bgGradientPreset: "midnight",

  // Quick Replies
  quickReplies: [
    { id: "1", label: "Cell Structure", message: "Explain the basic structure of a cell" },
    { id: "2", label: "Mitosis vs Meiosis", message: "What's the difference between mitosis and meiosis?" },
    { id: "3", label: "DNA Replication", message: "How does DNA replication work?" },
  ],

  // AI Persona
  systemPrompt:
    "You are BioQuiz AI, a helpful and knowledgeable biology tutor. Answer questions clearly and concisely, using examples where appropriate. Keep responses friendly and encouraging.",
  temperature: 0.7,
  fallbackMessage: "Sorry, I couldn't process that. Please try again!",
  workerUrl: "ask-ai.killermunu.workers.dev",

  // Access Control
  enabled: true,
  allowedDomains: "",
};

export const GRADIENT_PRESETS = [
  { value: "midnight", label: "Midnight", css: "linear-gradient(135deg, #0c0c1d, #1a1a3e)" },
  { value: "ocean", label: "Ocean", css: "linear-gradient(135deg, #0a1628, #1e3a5f)" },
  { value: "sunset", label: "Sunset", css: "linear-gradient(135deg, #1a0a2e, #4a1942)" },
  { value: "forest", label: "Forest", css: "linear-gradient(135deg, #0a1a0a, #1a3a2a)" },
  { value: "aurora", label: "Aurora", css: "linear-gradient(135deg, #0a0a2e, #1a3a4a)" },
  { value: "ember", label: "Ember", css: "linear-gradient(135deg, #1a0a0a, #3a1a1a)" },
] as const;
