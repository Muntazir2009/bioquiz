import {
  MonitorPlay,
  BrainCircuit,
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
    from: string;
    to: string;
    ring: string;
    glow: string;       // Large ambient glow color
  };
  featured?: boolean;   // Wide card for first module
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
    color: "#8b5cf6",   // violet/fire
    accent: {
      from: "oklch(0.72 0.18 280)",
      to: "oklch(0.58 0.22 300)",
      ring: "oklch(0.72 0.18 280 / 0.35)",
      glow: "oklch(0.72 0.18 280 / 0.08)",
    },
    featured: true,
  },
  {
    id: "quiz",
    num: "002",
    title: "Biology Quiz",
    desc: "Timed challenges across all cell biology topics — organelles, membranes, molecular processes. Real-time scoring and instant feedback.",
    href: "/quiz.html",
    icon: BrainCircuit,
    status: "READY TO LAUNCH",
    color: "#60a5fa",   // cyan
    accent: {
      from: "oklch(0.78 0.18 240)",
      to: "oklch(0.65 0.20 250)",
      ring: "oklch(0.75 0.18 245 / 0.35)",
      glow: "oklch(0.75 0.18 245 / 0.08)",
    },
  },
  {
    id: "ask",
    num: "003",
    title: "Ask Panel",
    desc: "AI-powered research terminal. Ask anything, get instant explanations from Wikipedia and Cloudflare AI.",
    href: "/ask.html",
    icon: Sparkles,
    status: "AI ONLINE",
    color: "#a78bfa",   // violet
    accent: {
      from: "oklch(0.80 0.18 290)",
      to: "oklch(0.68 0.22 300)",
      ring: "oklch(0.76 0.20 295 / 0.35)",
      glow: "oklch(0.76 0.20 295 / 0.08)",
    },
  },
  {
    id: "organelles",
    num: "004",
    title: "Organelle Explorer",
    desc: "Deep-dive visual cards for every organelle. Diagrams, functions, and key facts for each structure.",
    href: "/organelles.html",
    icon: Microscope,
    status: "READY",
    color: "#34d399",   // green
    accent: {
      from: "oklch(0.78 0.18 160)",
      to: "oklch(0.62 0.20 170)",
      ring: "oklch(0.72 0.18 165 / 0.35)",
      glow: "oklch(0.72 0.18 165 / 0.08)",
    },
  },
  {
    id: "cell-3d",
    num: "005",
    title: "3D Cell Viewer",
    desc: "Interactive three-dimensional cell model. Rotate, zoom, and explore cell structure in real-time 3D.",
    href: "/cell-3d.html",
    icon: Atom,
    status: "3D ACTIVE",
    color: "#22d3ee",   // teal
    accent: {
      from: "oklch(0.75 0.20 195)",
      to: "oklch(0.62 0.24 200)",
      ring: "oklch(0.70 0.22 197 / 0.35)",
      glow: "oklch(0.70 0.22 197 / 0.08)",
    },
  },
  {
    id: "solutions",
    num: "006",
    title: "Q&A Solutions",
    desc: "Complete exercise answers with detailed explanations. Review and reinforce every key concept.",
    href: "/solutions.html",
    icon: BookOpenCheck,
    status: "READY",
    color: "#f59e0b",   // amber
    accent: {
      from: "oklch(0.80 0.18 75)",
      to: "oklch(0.68 0.20 65)",
      ring: "oklch(0.76 0.18 70 / 0.35)",
      glow: "oklch(0.76 0.18 70 / 0.08)",
    },
  },
  {
    id: "suggestions",
    num: "007",
    title: "Suggestions",
    desc: "Share ideas, report issues, or suggest new features. Help shape the future of BioQuiz directly.",
    href: "/suggestions.html",
    icon: Lightbulb,
    status: "OPEN",
    color: "#c084fc",   // pink
    accent: {
      from: "oklch(0.82 0.16 310)",
      to: "oklch(0.68 0.20 320)",
      ring: "oklch(0.76 0.18 315 / 0.35)",
      glow: "oklch(0.76 0.18 315 / 0.08)",
    },
  },
];
