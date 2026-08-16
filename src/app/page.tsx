"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Slideshow, type SlideshowRef } from "@/components/site/Slideshow";
import { ModuleCardSwiper } from "@/components/site/ModuleCardSwiper";
import { modules } from "@/lib/modules";
import { ArrowRight } from "lucide-react";

const FilePanel = dynamic(
  () => import("@/components/site/FilePanel").then((mod) => ({ default: mod.FilePanel })),
  { ssr: false }
);
const SharedFileView = dynamic(
  () => import("@/components/site/SharedFileView").then((mod) => ({ default: mod.SharedFileView })),
  { ssr: false }
);

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
  const goToModules = useCallback(() => slideRef.current?.goToSlide(1), []);
  const goToHero = useCallback(() => slideRef.current?.goToSlide(0), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (heroAnimDone.current) return;
    heroAnimDone.current = true;
    import("gsap").then(({ default: gsap }) => {
      const elements = document.querySelectorAll(".hero-anim");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.07, delay: 0.15 }
      );
    });
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* Fullscreen flower background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/flower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "brightness(0.70) saturate(1.15)",
        }}
      />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:border focus:border-border">
        Skip to content
      </a>

      <Loader />

      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar onFilePanelOpen={openFiles} />
      </div>

      <main id="main-content" className="flex-1 flex flex-col">
        <Slideshow ref={slideRef}>
          {/* ── SLIDE 1: Hero ── */}
          <div className="w-full h-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 pt-20 pb-6 relative">
            {/* Subtle ambient light */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse 500px 350px at 50% 25%, rgba(196,168,130,0.04) 0%, transparent 70%),
                  radial-gradient(ellipse 350px 250px at 80% 75%, rgba(196,168,130,0.03) 0%, transparent 60%)
                `,
              }}
            />

            {/* Hero frosted glass panel */}
            <div
              className="flex flex-col items-center text-center relative z-10"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(28px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
                borderRadius: 24,
                padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 3rem)',
              }}
            >
              {/* Version badge */}
              <div className="hero-anim opacity-0 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase px-3 py-1 rounded-full"
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                  </span>
                  v2.0 — Live
                </span>
              </div>

              {/* Title */}
              <div className="hero-anim opacity-0 relative inline-block">
                <h1
                  className="relative font-bold tracking-tight"
                  style={{
                    color: "#FFFFFF",
                    textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 0 4px rgba(0,0,0,0.3)",
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
                className="hero-anim opacity-0 mt-2 h-[2px] rounded-full"
                style={{
                  width: "clamp(40px, 8vw, 72px)",
                  background: "linear-gradient(90deg, rgba(196,168,130,0.9), rgba(196,168,130,0.15))",
                }}
              />

              {/* Subtitle */}
              <div className="hero-anim opacity-0 mt-3">
                <p
                  className="text-sm sm:text-[15px] font-medium leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 8px rgba(0,0,0,0.5)", maxWidth: 440 }}
                >
                  The biology workspace — AI research, 3D cell viewer, organelles, slides and solutions.
                </p>
              </div>

              {/* Stats line */}
              <div
                className="hero-anim opacity-0 mt-5 inline-flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full"
                style={{ color: "rgba(255,255,255,0.88)", fontWeight: 500, textShadow: "0 1px 6px rgba(0,0,0,0.4)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full" style={{ background: "#C4A882" }} />
                  {modules.length} MODULES
                </span>
                <span style={{ color: "rgba(196,168,130,0.7)" }}>·</span>
                <span>AI RESEARCH</span>
                <span style={{ color: "rgba(196,168,130,0.7)" }}>·</span>
                <span>3D VIEWER</span>
              </div>

              {/* CTA button */}
              <div className="hero-anim opacity-0 mt-7">
                <button
                  onClick={goToModules}
                  className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium text-white btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  style={{
                    background: "linear-gradient(135deg, #1a3a6a, #0D1B2A)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Bottom frosted glass panel */}
            <div
              className="flex flex-col items-center gap-2.5 relative z-10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(22px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)',
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
                      color: "rgba(255,255,255,0.90)",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    <m.icon className="h-2.5 w-2.5" />
                    {m.title}
                  </span>
                ))}
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
                >
                  +{modules.length - 4} more
                </span>
              </div>

              {/* Swipe hint (mobile) */}
              <div
                className="hero-anim opacity-0 sm:hidden flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase"
                style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
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

              {/* Keyboard hint (desktop) */}
              <div
                className="hero-anim opacity-0 hidden sm:flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase"
                style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
              >
                Press{" "}
                <kbd
                  className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-mono"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.90)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }}
                >
                  →
                </kbd>{" "}
                to explore
              </div>

              {/* Footer */}
              <div
                className="hero-anim opacity-0 flex items-center gap-4 text-[10px]"
                style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
                <span>&copy; {new Date().getFullYear()} BioQuiz</span>
                <span>·</span>
                <span>Built with <span style={{ color: "rgba(196,168,130,0.8)" }}>&#9829;</span></span>
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
    </div>
  );
}
