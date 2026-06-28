"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { modules, type Module } from "@/lib/modules";

/**
 * Horizontal module card swiper — Netflix / Cover-flow style.
 *
 * - Cards ~75vw on mobile, ~480px on desktop, fit within one viewport
 * - Active card centered, GSAP-powered snap (NOT native scroll)
 * - Cover flow: active = scale 1.0 / opacity 1, neighbours = 0.85 / 0.6
 * - Touch swipe + dot indicators
 * - SSR-safe: all GSAP via dynamic import inside useEffect
 */

const CARD_GAP = 16;

interface ModuleCardSwiperProps {
  onBack?: () => void;
}

export function ModuleCardSwiper({ onBack }: ModuleCardSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const isAnimating = useRef(false);
  const activeIndexRef = useRef(0);
  const totalCards = modules.length;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 420;
    const vw = window.innerWidth;
    return vw < 768 ? vw * 0.72 : 420;
  }, []);

  /** Apply cover-flow scale/opacity to every card (GSAP) */
  const applyCoverFlow = useCallback(
    (gsap: any, index: number, duration: number) => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        if (i === index) {
          gsap.to(card, { scale: 1, opacity: 1, duration, ease: "power3.out" });
        } else if (Math.abs(i - index) === 1) {
          gsap.to(card, { scale: 0.85, opacity: 0.6, duration, ease: "power3.out" });
        } else {
          gsap.to(card, { scale: 0.85, opacity: 0.4, duration, ease: "power3.out" });
        }
      });
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  goToCard — center + cover-flow in one GSAP pass                    */
  /* ------------------------------------------------------------------ */

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
        const cardWidth = getCardWidth();
        const containerWidth = vw;
        // Center the target card:  container/2 − card/2 − index*(card+gap)
        const offsetX =
          containerWidth / 2 - cardWidth / 2 - index * (cardWidth + CARD_GAP);

        // 1. Slide the track
        gsap.to(track, {
          x: offsetX,
          duration: 0.55,
          ease: "power3.out",
          onComplete: () => {
            isAnimating.current = false;
          },
        });

        // 2. Cover-flow scale/opacity (simultaneous)
        applyCoverFlow(gsap, index, 0.55);

        // 3. Dots
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          if (i === index) {
            gsap.to(dot, {
              scale: 1.4,
              opacity: 1,
              duration: 0.3,
              ease: "back.out(2)",
            });
          } else {
            gsap.to(dot, {
              scale: 1,
              opacity: 0.35,
              duration: 0.25,
              ease: "power2.out",
            });
          }
        });
      });
    },
    [totalCards, getCardWidth, applyCoverFlow]
  );

  /* ------------------------------------------------------------------ */
  /*  Touch swipe (stops propagation to parent Slideshow)                */
  /* ------------------------------------------------------------------ */

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
        e.stopPropagation();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isHorizontal) return;
      e.stopPropagation();
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

  /* ------------------------------------------------------------------ */
  /*  Initial mount: position + entrance + cover-flow                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    import("gsap").then(({ default: gsap }) => {
      const track = trackRef.current;
      if (track) {
        const vw = window.innerWidth;
        const cardWidth = vw < 768 ? vw * 0.72 : 420;
        const containerWidth = vw;
        const offsetX = containerWidth / 2 - cardWidth / 2;
        gsap.set(track, { x: offsetX });
      }

      // Entrance: cards start invisible, then fade in with cover-flow values
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 16 });
        gsap.to(card, {
          opacity: i === 0 ? 1 : Math.abs(i) === 1 ? 0.6 : 0.4,
          y: 0,
          scale: i === 0 ? 1 : 0.85,
          duration: 0.45,
          ease: "power2.out",
          delay: i * 0.04,
        });
      });
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Resize handler                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      import("gsap").then(({ default: gsap }) => {
        const track = trackRef.current;
        if (track) {
          const vw = window.innerWidth;
          const cardWidth = vw < 768 ? vw * 0.75 : 480;
          const containerWidth = vw;
          const idx = activeIndexRef.current;
          const offsetX =
            containerWidth / 2 - cardWidth / 2 - idx * (cardWidth + CARD_GAP);
          gsap.set(track, { x: offsetX });
        }
        applyCoverFlow(gsap, activeIndexRef.current, 0);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyCoverFlow]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#F8F5F0" }}>
      {/* ── Compact header ── */}
      <div className="flex-shrink-0 px-5 sm:px-8 pt-16 sm:pt-[72px] pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-7 w-7 items-center justify-center rounded-lg btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                style={{
                  background: "rgba(28,28,28,0.05)",
                  color: "#6B6560",
                }}
                aria-label="Back to home"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="leading-tight">
              <h2
                className="font-semibold tracking-tight"
                style={{
                  color: "#1C1C1C",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                }}
              >
                Modules
              </h2>
              <p
                className="text-[10px] sm:text-[11px] leading-tight"
                style={{ color: "#8A8580" }}
              >
                Swipe to explore all {modules.length} modules
              </p>
            </div>
          </div>
          <span
            className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
            style={{
              color: "#C4A882",
              background: "rgba(196,168,130,0.1)",
              border: "1px solid rgba(196,168,130,0.2)",
            }}
          >
            {modules.length} MODULES
          </span>
        </div>
      </div>

      {/* ── Cards area ── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden min-h-0"
      >
        <div
          ref={trackRef}
          className="flex items-center h-full"
          style={{ gap: CARD_GAP, willChange: "transform" }}
        >
          {modules.map((m: Module, i: number) => (
            <ModuleCard
              key={m.id}
              module={m}
              index={i}
              isActive={mounted && i === activeIndex}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1.5 pb-5 pt-1">
        {modules.map((_, i) => (
          <button
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            onClick={() => goToCard(i)}
            aria-label={`Go to module ${i + 1}`}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            style={{
              width: i === activeIndex ? 18 : 5,
              height: 5,
              background: "#C4A882",
              opacity: i === activeIndex ? 1 : 0.35,
              borderRadius: 2.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ModuleCard — square gradient, cover-flow ready                    */
/* ================================================================== */

function ModuleCard({
  module: m,
  index,
  isActive,
  cardRef,
}: {
  module: Module;
  index: number;
  isActive: boolean;
  cardRef?: (el: HTMLAnchorElement | null) => void;
}) {
  const internalRef = useRef<HTMLAnchorElement>(null);

  const mergedRef = useCallback(
    (el: HTMLAnchorElement | null) => {
      (internalRef as React.MutableRefObject<HTMLAnchorElement | null>).current =
        el;
      cardRef?.(el);
    },
    [cardRef]
  );

  const Icon = m.icon;

  return (
    <a
      ref={mergedRef}
      href={m.href}
      aria-label={`Open ${m.title} module`}
      className="flex-shrink-0 relative overflow-hidden group"
      style={{
        width: "min(72vw, 420px)",
        maxWidth: "85vw",
        aspectRatio: "1/1",
        borderRadius: 24,
        boxShadow: isActive
          ? `0 8px 40px -8px ${m.accent.ring}, 0 20px 60px -12px rgba(0,0,0,0.2)`
          : "0 4px 20px -4px rgba(0,0,0,0.08)",
        border: `1px solid ${m.color}30`,
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* ── Full gradient background ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(155deg, ${m.accent.from} 0%, ${m.accent.to} 50%, ${m.color}99 100%)`,
        }}
      />

      {/* ── Dot-grid texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.07,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── Large soft glow in corner ── */}
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)`,
        }}
      />
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0,0,0,0.15), transparent 70%)`,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
        {/* Top row: module num + status */}
        <div className="flex items-start justify-between flex-shrink-0">
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            MODULE {m.num}
          </span>
          <span
            className="text-[8px] font-semibold tracking-[0.12em] uppercase px-2 py-1 rounded-full"
            style={{
              color: "rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {m.status}
          </span>
        </div>

        {/* Center: Icon in glass container */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{
              width: "clamp(68px, 15vw, 96px)",
              height: "clamp(68px, 15vw, 96px)",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <Icon
              className="text-white drop-shadow-sm"
              style={{
                width: "clamp(28px, 6vw, 40px)",
                height: "clamp(28px, 6vw, 40px)",
              }}
              strokeWidth={1.4}
            />
          </div>
        </div>

        {/* Bottom: Title + desc + CTA */}
        <div className="space-y-2 flex-shrink-0">
          <h3
            className="font-bold tracking-tight leading-tight"
            style={{
              color: "#FFFFFF",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
            }}
          >
            {m.title}
          </h3>
          <p className="text-white/60 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
            {m.desc}
          </p>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"
                  style={{ boxShadow: "0 0 8px rgba(255,255,255,0.6)" }}
                />
              </span>
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/65">
                {m.status}
              </span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
