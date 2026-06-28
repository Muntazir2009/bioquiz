"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { modules, type Module } from "@/lib/modules";

/**
 * Horizontal module card swiper — Netflix/App-drawer style.
 *
 * - Cards are ~75vw wide on mobile, ~520px on desktop, nearly full slide height
 * - 1 card visible at a time, next card peeks from right
 * - GSAP-powered swipe animation with snap (NOT native scroll)
 * - Touch swipe + dot indicators below cards
 * - SSR-safe: GSAP loaded via dynamic import inside useEffect
 * - Stops touch propagation to avoid conflicting with parent slideshow
 */

interface ModuleCardSwiperProps {
  onBack?: () => void;
}

export function ModuleCardSwiper({ onBack }: ModuleCardSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isAnimating = useRef(false);
  const activeIndexRef = useRef(0);
  const totalCards = modules.length;

  // Keep ref in sync with state
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const goToCard = useCallback(
    (index: number) => {
      if (isAnimating.current) return;
      if (index < 0 || index >= totalCards) return;

      isAnimating.current = true;
      setActiveIndex(index);
      activeIndexRef.current = index;

      import("gsap").then(({ default: gsap }) => {
        const track = trackRef.current;
        if (!track) {
          isAnimating.current = false;
          return;
        }

        const vw = window.innerWidth;
        const isMobile = vw < 768;
        const cardWidth = isMobile ? vw * 0.75 : 520;
        const gap = 20;
        const containerWidth = vw;
        const offsetX = containerWidth / 2 - (cardWidth / 2) - index * (cardWidth + gap);

        gsap.to(track, {
          x: offsetX,
          duration: 0.6,
          ease: "power3.out",
          onComplete: () => {
            isAnimating.current = false;
          },
        });

        // Animate dots
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          if (i === index) {
            gsap.to(dot, { scale: 1.4, opacity: 1, duration: 0.3, ease: "back.out(2)" });
          } else {
            gsap.to(dot, { scale: 1, opacity: 0.35, duration: 0.25, ease: "power2.out" });
          }
        });
      });
    },
    [totalCards]
  );

  // Touch swipe for cards — stops propagation to prevent parent slideshow conflict
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let isHorizontal: boolean | null = null;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontal = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isHorizontal !== null) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > 8 || dy > 8) {
        isHorizontal = dx > dy;
      }
      if (isHorizontal) {
        e.preventDefault();
        e.stopPropagation(); // Prevent parent slideshow from handling
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isHorizontal) return;
      e.stopPropagation(); // Prevent parent slideshow from handling
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) goToCard(activeIndexRef.current + 1);
        else goToCard(activeIndexRef.current - 1);
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToCard]);

  // Initial position + entrance animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    const track = trackRef.current;
    if (track) {
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      const cardWidth = isMobile ? vw * 0.75 : 520;
      const containerWidth = vw;
      const offsetX = containerWidth / 2 - cardWidth / 2;
      track.style.transform = `translateX(${offsetX}px)`;
    }
  }, []);

  // Handle resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      goToCard(activeIndexRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [goToCard]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#F8F5F0" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 sm:px-10 pt-20 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                style={{ background: "rgba(28,28,28,0.05)", color: "#6B6560" }}
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2
              className="font-semibold tracking-tight"
              style={{ color: "#1C1C1C", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}
            >
              Modules
            </h2>
            <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: "#8A8580" }}>
              Swipe to explore all {modules.length} modules
            </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
              style={{ color: "#C4A882", background: "rgba(196,168,130,0.1)", border: "1px solid rgba(196,168,130,0.2)" }}
            >
              {modules.length} MODULES
            </span>
          </div>
        </div>
      </div>

      {/* Cards area — containerRef for touch event handling */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden min-h-0">
        <div ref={trackRef} className="flex items-center h-full py-4 sm:py-6" style={{ willChange: "transform" }}>
          {modules.map((m: Module, i: number) => (
            <ModuleCard key={m.id} module={m} index={i} isActive={mounted && i === activeIndex} />
          ))}
        </div>
      </div>

      {/* Card dots */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 pb-6 pt-2">
        {modules.map((_, i) => (
          <button
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            onClick={() => goToCard(i)}
            aria-label={`Go to module ${i + 1}`}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              background: "#C4A882",
              opacity: i === activeIndex ? 1 : 0.35,
              borderRadius: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Individual immersive module card */
function ModuleCard({ module: m, index, isActive }: { module: Module; index: number; isActive: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Subtle entrance animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = cardRef.current;
    if (!el) return;

    import("gsap").then(({ default: gsap }) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out", delay: index * 0.05 }
      );
    });
  }, [index]);

  const Icon = m.icon;

  return (
    <a
      ref={cardRef}
      href={m.href}
      aria-label={`Open ${m.title} module`}
      className="flex-shrink-0 flex flex-col justify-between overflow-hidden relative group"
      style={{
        width: "clamp(75vw, 400px, 520px)",
        maxWidth: "85vw",
        height: "100%",
        maxHeight: "calc(100% - 16px)",
        background: "#FFFFFF",
        borderRadius: 20,
        boxShadow: isActive
          ? "0 4px 6px rgba(0,0,0,0.03), 0 10px 24px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.04)"
          : "0 2px 4px rgba(0,0,0,0.02), 0 6px 16px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* Top color accent bar */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${m.color} 50%, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${m.color}, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 p-6 sm:p-8">
        {/* Top row */}
        <div className="flex items-start justify-between flex-shrink-0">
          <span
            className="text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-md"
            style={{
              color: m.color,
              background: `${m.color}10`,
              border: `1px solid ${m.color}30`,
            }}
          >
            MODULE {m.num}
          </span>
          <span
            className="text-[9px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
            style={{
              color: m.color,
              background: `${m.color}08`,
              border: `1px solid ${m.color}20`,
            }}
          >
            {m.status}
          </span>
        </div>

        {/* Icon — centered */}
        <div className="flex-1 flex items-center justify-center py-4 sm:py-8">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{
              width: "clamp(56px, 12vw, 80px)",
              height: "clamp(56px, 12vw, 80px)",
              background: `linear-gradient(135deg, ${m.accent.from}, ${m.accent.to})`,
              boxShadow: `0 8px 32px -8px ${m.accent.ring}, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            <Icon
              className="text-white"
              style={{ width: "clamp(24px, 5vw, 36px)", height: "clamp(24px, 5vw, 36px)" }}
              strokeWidth={1.6}
            />
          </div>
        </div>

        {/* Title + Description */}
        <div className="space-y-2 flex-shrink-0">
          <h3
            className="font-bold tracking-tight"
            style={{ color: m.color, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.3rem, 4vw, 1.8rem)" }}
          >
            {m.title}
          </h3>
          <p className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "#6B6560" }}>
            {m.desc}
          </p>
        </div>
      </div>

      {/* Bottom launch bar */}
      <div
        className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-t flex-shrink-0"
        style={{
          borderColor: `${m.color}15`,
          background: `${m.color}05`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ background: m.color }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
            />
          </span>
          <span
            className="text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{ color: m.color }}
          >
            {m.status}
          </span>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            border: `1px solid ${m.color}30`,
            background: `${m.color}10`,
            color: m.color,
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </a>
  );
}