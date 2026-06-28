import {
  MonitorPlay,
  Sparkles,
  Microscope,
  Atom,
  BookOpenCheck,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type Module = {
  id: string;
  num: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  status: string;
  color: string;        // CSS color for the module accent
  accent: {
    from: string;       // Gradient start
    via?: string;       // Gradient midpoint (optional 3-stop)
    to: string;         // Gradient end
    ring: string;       // Active card shadow color
    glow: string;       // Large ambient glow color
    border: string;     // Animated border color
  };
  emoji: string;        // Decorative emoji watermark
  featured?: boolean;
};

export const modules: Module[] = [
  {
    id: "presentation",
    num: "001",
    title: "Presentation",
    desc: "Structured biology lesson slides covering all major topics — perfect for study sessions and exam revision.",
    href: "/presentation.html",
    icon: MonitorPlay,
    status: "READY TO LAUNCH",
    color: "#e85d75",
    accent: {
      from: "#e85d75",
      via: "#d4446a",
      to: "#8b2252",
      ring: "rgba(232, 93, 117, 0.35)",
      glow: "rgba(232, 93, 117, 0.10)",
      border: "rgba(232, 93, 117, 0.50)",
    },
    emoji: "🧬",
    featured: true,
  },
  {
    id: "ask",
    num: "002",
    title: "Ask Panel",
    desc: "AI-powered research terminal. Ask anything, get instant explanations from Wikipedia and Cloudflare AI.",
    href: "/ask.html",
    icon: Sparkles,
    status: "AI ONLINE",
    color: "#f59e42",
    accent: {
      from: "#f5b942",
      via: "#f59e42",
      to: "#c2690a",
      ring: "rgba(245, 158, 66, 0.35)",
      glow: "rgba(245, 158, 66, 0.10)",
      border: "rgba(245, 158, 66, 0.50)",
    },
    emoji: "🤖",
  },
  {
    id: "organelles",
    num: "003",
    title: "Organelle Explorer",
    desc: "Deep-dive visual cards for every organelle. Diagrams, functions, and key facts for each structure.",
    href: "/organelles.html",
    icon: Microscope,
    status: "READY",
    color: "#22c55e",
    accent: {
      from: "#4ade80",
      via: "#22c55e",
      to: "#15803d",
      ring: "rgba(34, 197, 94, 0.35)",
      glow: "rgba(34, 197, 94, 0.10)",
      border: "rgba(34, 197, 94, 0.50)",
    },
    emoji: "🔬",
  },
  {
    id: "cell-3d",
    num: "004",
    title: "3D Cell Viewer",
    desc: "Interactive three-dimensional cell model. Rotate, zoom, and explore cell structure in real-time 3D.",
    href: "/cell-3d.html",
    icon: Atom,
    status: "3D ACTIVE",
    color: "#14b8a6",
    accent: {
      from: "#2dd4bf",
      via: "#14b8a6",
      to: "#0f766e",
      ring: "rgba(20, 184, 166, 0.35)",
      glow: "rgba(20, 184, 166, 0.10)",
      border: "rgba(20, 184, 166, 0.50)",
    },
    emoji: "🧫",
  },
  {
    id: "solutions",
    num: "005",
    title: "Q&A Solutions",
    desc: "Complete exercise answers with detailed explanations. Review and reinforce every key concept.",
    href: "/solutions.html",
    icon: BookOpenCheck,
    status: "READY",
    color: "#d97706",
    accent: {
      from: "#fbbf24",
      via: "#d97706",
      to: "#92400e",
      ring: "rgba(217, 119, 6, 0.35)",
      glow: "rgba(217, 119, 6, 0.10)",
      border: "rgba(217, 119, 6, 0.50)",
    },
    emoji: "📝",
  },
  {
    id: "suggestions",
    num: "006",
    title: "Suggestions",
    desc: "Share ideas, report issues, or suggest new features. Help shape the future of BioQuiz directly.",
    href: "/suggestions.html",
    icon: Lightbulb,
    status: "OPEN",
    color: "#ec4899",
    accent: {
      from: "#f472b6",
      via: "#ec4899",
      to: "#9d174d",
      ring: "rgba(236, 72, 153, 0.35)",
      glow: "rgba(236, 72, 153, 0.10)",
      border: "rgba(236, 72, 153, 0.50)",
    },
    emoji: "💡",
  },
];