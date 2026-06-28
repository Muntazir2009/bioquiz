"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Slideshow, type SlideshowRef } from "@/components/site/Slideshow";
import { ModuleCardSwiper } from "@/components/site/ModuleCardSwiper";
import { modules } from "@/lib/modules";
import { ArrowRight, ArrowLeft } from "lucide-react";

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
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: "#F8F5F0" }}>
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
          <div className="w-full h-full flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-20 pb-10">
            {/* Top content: Title, subtitle, stats, CTA */}
            <div className="flex flex-col items-center text-center">
              {/* Title */}
              <h1
                className="hero-anim opacity-0 font-light tracking-tight"
                style={{
                  color: "#1C1C1C",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2.8rem, 10vw, 5rem)",
                  lineHeight: 1.1,
                }}
              >
                BioQuiz
              </h1>

              {/* Subtitle */}
              <p
                className="hero-anim opacity-0 mt-2 text-sm sm:text-base"
                style={{ color: "#8A8580", maxWidth: 420 }}
              >
                The biology workspace — AI research, 3D cell viewer, organelles, slides and solutions.
              </p>

              {/* Stats line */}
              <div className="hero-anim opacity-0 mt-4 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-medium" style={{ color: "#6B6560" }}>
                <span>{modules.length} MODULES</span>
                <span style={{ color: "#C4A882" }}>·</span>
                <span>AI RESEARCH</span>
                <span style={{ color: "#C4A882" }}>·</span>
                <span>3D VIEWER</span>
              </div>

              {/* CTA */}
              <button
                onClick={goToModules}
                className="hero-anim opacity-0 mt-6 group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                style={{
                  background: "#1C1C1C",
                  boxShadow: "0 2px 8px rgba(28,28,28,0.15), 0 8px 24px rgba(28,28,28,0.1)",
                }}
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Bottom: Swipe hint + mini footer */}
            <div className="flex flex-col items-center gap-3">
              {/* Swipe hint */}
              <div className="hero-anim opacity-0 flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase" style={{ color: "#A09A94" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Swipe to explore
              </div>

              {/* Mini footer */}
              <div className="hero-anim opacity-0 flex items-center gap-4 text-[10px]" style={{ color: "#A09A94" }}>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  Operational
                </span>
                <span>·</span>
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