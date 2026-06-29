"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Slideshow, type SlideshowRef } from "@/components/site/Slideshow";
import { ModuleCardSwiper } from "@/components/site/ModuleCardSwiper";
import { modules } from "@/lib/modules";
import { ArrowRight } from "lucide-react";

// Dynamic imports for heavy / rarely-used components
const FilePanel = dynamic(
  () => import("@/components/site/FilePanel").then((mod) => ({ default: mod.FilePanel })),
  { ssr: false }
);
const SharedFileView = dynamic(
  () => import("@/components/site/SharedFileView").then((mod) => ({ default: mod.SharedFileView })),
  { ssr: false }
);
const ChatWidget = dynamic(
  () => import("@/components/site/ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false }
);

/* ── Floating bio-molecule decorations ── */
function BioMolecules() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none decorative-motion" aria-hidden>
      {/* DNA helix dot pattern — top right */}
      <div
        className="absolute top-16 right-[15%] w-32 h-32 opacity-[0.12]"
        style={{ animation: "bio-float-1 18s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="4" fill="#C4A882" />
          <circle cx="60" cy="40" r="3" fill="#C4A882" />
          <circle cx="100" cy="20" r="4" fill="#C4A882" />
          <circle cx="40" cy="60" r="3.5" fill="#C4A882" />
          <circle cx="80" cy="80" r="3" fill="#C4A882" />
          <circle cx="20" cy="100" r="4" fill="#C4A882" />
          <circle cx="100" cy="100" r="3" fill="#C4A882" />
          <line x1="20" y1="20" x2="60" y2="40" stroke="#C4A882" strokeWidth="1" opacity="0.5" />
          <line x1="60" y1="40" x2="100" y2="20" stroke="#C4A882" strokeWidth="1" opacity="0.5" />
          <line x1="40" y1="60" x2="80" y2="80" stroke="#C4A882" strokeWidth="1" opacity="0.5" />
          <line x1="20" y1="100" x2="100" y2="100" stroke="#C4A882" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Cell-like circle cluster — bottom left */}
      <div
        className="absolute bottom-24 left-[10%] w-40 h-40 opacity-[0.10]"
        style={{ animation: "bio-float-2 22s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="30" stroke="#C4A882" strokeWidth="1" opacity="0.6" />
          <circle cx="80" cy="80" r="18" stroke="#C4A882" strokeWidth="0.8" opacity="0.4" />
          <circle cx="80" cy="80" r="6" fill="#C4A882" opacity="0.5" />
          <circle cx="95" cy="65" r="8" stroke="#C4A882" strokeWidth="0.8" opacity="0.5" />
          <circle cx="65" cy="90" r="6" stroke="#C4A882" strokeWidth="0.8" opacity="0.4" />
          <circle cx="90" cy="95" r="5" stroke="#C4A882" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>

      {/* Floating hexagon molecule — mid left */}
      <div
        className="absolute top-[40%] left-[5%] w-24 h-24 opacity-[0.09] hidden sm:block"
        style={{ animation: "bio-float-3 20s ease-in-out infinite" }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#C4A882" strokeWidth="1.2" fill="none" />
          <circle cx="50" cy="50" r="12" stroke="#C4A882" strokeWidth="0.8" fill="none" />
          <circle cx="50" cy="50" r="3" fill="#C4A882" />
          <line x1="50" y1="38" x2="50" y2="5" stroke="#C4A882" strokeWidth="0.6" opacity="0.5" />
          <line x1="50" y1="62" x2="50" y2="95" stroke="#C4A882" strokeWidth="0.6" opacity="0.5" />
          <line x1="38" y1="44" x2="5" y2="27.5" stroke="#C4A882" strokeWidth="0.6" opacity="0.5" />
          <line x1="62" y1="56" x2="95" y2="72.5" stroke="#C4A882" strokeWidth="0.6" opacity="0.5" />
        </svg>
      </div>

      {/* Small dots scattered — top left area */}
      <div className="absolute top-[25%] left-[20%] flex gap-3 opacity-[0.14]" style={{ animation: "bio-float-1 25s ease-in-out infinite reverse" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#C4A882]" />
        <span className="w-1 h-1 rounded-full bg-[#C4A882]" />
        <span className="w-2 h-2 rounded-full bg-[#C4A882]" />
      </div>

      {/* Small dots — bottom right */}
      <div className="absolute bottom-[30%] right-[8%] flex gap-2 opacity-[0.12]" style={{ animation: "bio-float-2 16s ease-in-out infinite" }}>
        <span className="w-1 h-1 rounded-full bg-[#C4A882]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#C4A882]" />
        <span className="w-1 h-1 rounded-full bg-[#C4A882]" />
        <span className="w-2 h-2 rounded-full bg-[#C4A882]" />
      </div>

      {/* ── Floating particles (CSS-animated dots) ── */}
      <span className="hero-particle" style={{ width: 3, height: 3, left: '8%',  bottom: '5%',  '--duration': '22s', '--delay': '0s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 2, height: 2, left: '22%', bottom: '8%',  '--duration': '26s', '--delay': '3s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 2.5, height: 2.5, left: '45%', bottom: '3%',  '--duration': '20s', '--delay': '6s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 1.5, height: 1.5, left: '62%', bottom: '10%', '--duration': '28s', '--delay': '2s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 2, height: 2, left: '78%', bottom: '6%',  '--duration': '24s', '--delay': '8s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 1.5, height: 1.5, left: '35%', bottom: '12%', '--duration': '30s', '--delay': '5s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 2.5, height: 2.5, left: '88%', bottom: '4%',  '--duration': '19s', '--delay': '10s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 2, height: 2, left: '15%', bottom: '15%', '--duration': '25s', '--delay': '12s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 1.5, height: 1.5, left: '55%', bottom: '7%',  '--duration': '21s', '--delay': '7s' } as React.CSSProperties} />
      <span className="hero-particle" style={{ width: 3, height: 3, left: '70%', bottom: '14%', '--duration': '27s', '--delay': '4s' } as React.CSSProperties} />
    </div>
  );
}

export default function Home() {
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const slideRef = useRef<SlideshowRef>(null);
  const heroAnimDone = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("share");
    if (sid) setShareId(sid);
  }, []);

  const closeShareView = useCallback(() => {
    setShareId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("share");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const openFiles = useCallback(() => setFilePanelOpen(true), []);

  const goToModules = useCallback(() => {
    slideRef.current?.goToSlide(1);
  }, []);

  const goToHero = useCallback(() => {
    slideRef.current?.goToSlide(0);
  }, []);

  // GSAP entrance animations for hero elements
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (heroAnimDone.current) return;
    heroAnimDone.current = true;

    import("gsap").then(({ default: gsap }) => {
      const elements = document.querySelectorAll(".hero-anim");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.2 }
      );
    });
  }, []);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col relative"
    >
      {/* ── Permanent fullscreen flower background ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/flower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "blur(3px) brightness(0.88) saturate(0.5)",
        }}
      />

      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:border focus:border-border"
      >
        Skip to content
      </a>

      <Loader />

      {/* TopBar — absolute positioned over slideshow */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar onFilePanelOpen={openFiles} />
      </div>

      {/* Main slideshow */}
      <main id="main-content" className="flex-1 flex flex-col">
        <Slideshow ref={slideRef}>
          {/* ── SLIDE 1: Hero ── */}
          <div className="w-full h-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 pt-20 pb-6 relative">
            {/* Floating bio-molecules */}
            <BioMolecules />

            {/* Subtle gradient mesh background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse 600px 400px at 50% 20%, rgba(196,168,130,0.03) 0%, transparent 70%),
                  radial-gradient(ellipse 400px 300px at 80% 80%, rgba(196,168,130,0.02) 0%, transparent 60%),
                  radial-gradient(ellipse 300px 250px at 15% 70%, rgba(196,168,130,0.02) 0%, transparent 60%)
                `,
              }}
            />

            {/* Top content: Title, subtitle, stats, CTA — liquid glass panel */}
            <div
              className="flex flex-col items-center text-center relative z-10"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(50px) saturate(220%)',
                WebkitBackdropFilter: 'blur(50px) saturate(220%)',
                border: '1px solid rgba(255,255,255,0.80)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
                borderRadius: 24,
                padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 3rem)',
              }}
            >
              {/* Version badge above title */}
              <div className="hero-anim opacity-0 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase px-3 py-1 rounded-full"
                  style={{
                    color: "#1C1C1C",
                    background: "rgba(196,168,130,0.15)",
                    border: "1px solid rgba(196,168,130,0.25)",
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  v2.0 — Live
                </span>
              </div>

              {/* Title with breathing glow */}
              <div className="hero-anim opacity-0 relative inline-block">
                <div className="hero-title-glow" aria-hidden />
                <h1
                  className="relative font-bold tracking-tight"
                  style={{
                    color: "#1C1C1C",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(3rem, 10vw, 5.2rem)",
                    lineHeight: 1.08,
                  }}
                >
                  BioQuiz
                </h1>
              </div>

              {/* Decorative underline */}
              <div
                className="hero-anim opacity-0 mt-1 h-[2px] rounded-full"
                style={{
                  width: "clamp(40px, 8vw, 72px)",
                  background: "linear-gradient(90deg, #C4A882, rgba(196,168,130,0.15))",
                }}
              />

              {/* Subtitle with animated underline */}
              <div className="hero-anim opacity-0 mt-3 relative inline-block">
                <p
                  className="text-sm sm:text-[15px] font-medium leading-relaxed"
                  style={{ color: "#1C1C1C", maxWidth: 440 }}
                >
                  The biology workspace — AI research, 3D cell viewer, organelles, slides and solutions.
                </p>
                <div className="hero-subtitle-underline mt-1" aria-hidden />
              </div>

              {/* Stats line */}
              <div
                className="hero-anim opacity-0 mt-5 inline-flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full"
                style={{ color: "#1C1C1C", fontWeight: 500, background: "rgba(196,168,130,0.08)", border: "1px solid rgba(196,168,130,0.15)" }}
              >
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full" style={{ background: "#C4A882" }} />
                  {modules.length} MODULES
                </span>
                <span style={{ color: "#C4A882" }}>·</span>
                <span>AI RESEARCH</span>
                <span style={{ color: "#C4A882" }}>·</span>
                <span>3D VIEWER</span>
              </div>

              {/* CTA button with animated border + hover gradient glow */}
              <div className="hero-anim opacity-0 mt-7">
                <div
                  className="hero-cta-border hero-cta-hover"
                  style={{ borderRadius: 9999, display: "inline-block" }}
                >
                  <button
                    onClick={goToModules}
                    className="hero-cta-inner group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium text-white btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 relative z-10"
                    style={{
                      background: "#1C1C1C",
                    }}
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: Module pills + hints + footer — liquid glass panel (right below hero glass) */}
            <div
              className="flex flex-col items-center gap-2.5 relative z-10"
              style={{
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(45px) saturate(200%)',
                WebkitBackdropFilter: 'blur(45px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.75)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.65)',
                borderRadius: 16,
                padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
                marginTop: 12,
              }}
            >
              {/* Module preview pills */}
              <div className="hero-anim opacity-0 flex items-center gap-2 flex-wrap justify-center">
                {modules.slice(0, 4).map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full transition-transform duration-200 hover:scale-105 cursor-default"
                    style={{
                      color: m.color,
                      background: `rgba(255,255,255,0.50)`,
                      border: `1px solid ${m.color}30`,
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    <m.icon className="h-2.5 w-2.5" />
                    {m.title}
                  </span>
                ))}
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ color: "#1C1C1C", background: "rgba(255,255,255,0.50)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                >
                  +{modules.length - 4} more
                </span>
              </div>

              {/* Swipe hint (mobile) */}
              <div
                className="hero-anim opacity-0 sm:hidden flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase"
                style={{ color: "#1C1C1C" }}
              >
                <svg
                  className="animate-bounce"
                  style={{ animationDuration: "2s" }}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Swipe to explore
              </div>

              {/* Keyboard hint (desktop only) */}
              <div
                className="hero-anim opacity-0 hidden sm:flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase"
                style={{ color: "#1C1C1C" }}
              >
                Press{" "}
                <kbd
                  className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-mono"
                  style={{
                    background: "rgba(196,168,130,0.15)",
                    border: "1px solid rgba(196,168,130,0.25)",
                    color: "#1C1C1C",
                  }}
                >
                  →
                </kbd>{" "}
                to explore
              </div>

              {/* Mini footer */}
              <div
                className="hero-anim opacity-0 flex items-center gap-4 text-[10px]"
                style={{ color: "#1C1C1C" }}
              >
                <span>&copy; {new Date().getFullYear()} BioQuiz</span>
                <span>·</span>
                <span>Built with <span style={{ color: "#C4A882" }}>&#9829;</span></span>
              </div>
            </div>
          </div>

          {/* ── SLIDE 2: Module Card Swiper ── */}
          <ModuleCardSwiper onBack={goToHero} />
        </Slideshow>
      </main>

      <FilePanel open={filePanelOpen} onClose={() => setFilePanelOpen(false)} />

      {shareId && (
        <SharedFileView shareId={shareId} onClose={closeShareView} />
      )}

      <ChatWidget />
    </div>
  );
}