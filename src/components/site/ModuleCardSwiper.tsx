"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUpRight, ArrowLeft, Search } from "lucide-react";
import { modules, type Module } from "@/lib/modules";

/**
 * Horizontal module card swiper — Netflix / Cover-flow style.
 *
 * - Cards responsive: ~72vw mobile, ~48vw tablet, ~32vw desktop
 * - Active card centered, GSAP-powered snap (NOT native scroll)
 * - Cover flow: active = scale 1.0 / opacity 1, neighbours = 0.88 / 0.65
 * - 3D rotateY on side cards with perspective
 * - Touch swipe + keyboard nav + dot indicators + progress bar
 * - SSR-safe: all GSAP via dynamic import inside useEffect
 */

const CARD_GAP = 20;

/** Consistent card width used everywhere (CSS, JS calculations, resize) */
function getCardWidthPx(vw: number): number {
  return vw < 640 ? vw * 0.72 : vw < 1024 ? Math.min(vw * 0.48, 400) : Math.min(vw * 0.32, 420);
}

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
    return getCardWidthPx(window.innerWidth);
  }, []);

  /** Apply cover-flow scale/opacity to every card (GSAP) */
  const applyCoverFlow = useCallback(
    (gsap: any, index: number, duration: number) => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        if (i === index) {
          gsap.to(card, { scale: 1, opacity: 1, z: 30, duration, ease: "power3.out" });
        } else if (Math.abs(i - index) === 1) {
          gsap.to(card, {
            scale: 0.88,
            opacity: 0.65,
            z: 0,
            rotateY: i < index ? 4 : -4,
            duration,
            ease: "power3.out",
          });
        } else {
          gsap.to(card, {
            scale: 0.82,
            opacity: 0.35,
            z: -20,
            rotateY: i < index ? 6 : -6,
            duration,
            ease: "power3.out",
          });
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

        // 2. Cover-flow scale/opacity/rotate (simultaneous)
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
  /*  Keyboard navigation (left/right arrows)                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        goToCard(activeIndexRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        goToCard(activeIndexRef.current - 1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goToCard]);

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
        const cardWidth = getCardWidthPx(vw);
        const containerWidth = vw;
        const offsetX = containerWidth / 2 - cardWidth / 2;
        gsap.set(track, { x: offsetX });
      }

      // Entrance: cards start invisible, then fade in with cover-flow values
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, { opacity: 0, y: 16 });
        gsap.to(card, {
          opacity: i === 0 ? 1 : Math.abs(i) === 1 ? 0.65 : 0.35,
          y: 0,
          scale: i === 0 ? 1 : Math.abs(i) === 1 ? 0.88 : 0.82,
          rotateY: i === 0 ? 0 : i < 0 ? -6 : i === 1 ? -4 : 6,
          z: i === 0 ? 30 : 0,
          duration: 0.5,
          ease: "power2.out",
          delay: i * 0.05,
        });
      });

      // One-time swipe hint nudge (plays 1.5s after mount)
      if (track && totalCards > 1) {
        const currentX = gsap.getProperty(track, "x") as number;
        gsap.to(track, {
          x: currentX - 12,
          duration: 0.35,
          ease: "power2.inOut",
          delay: 1.5,
          onComplete: () => {
            gsap.to(track, {
              x: currentX,
              duration: 0.4,
              ease: "power2.inOut",
            });
          },
        });
      }
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
          const cardWidth = getCardWidthPx(vw);
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
    <div className="w-full h-full flex flex-col relative" style={{ background: "transparent" }}>
      {/* ── Compact header — centered liquid glass pill ── */}
      <div className="flex-shrink-0 flex items-center justify-center pt-16 sm:pt-[72px] pb-3 px-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              style={{
                background: 'rgba(255,255,255,0.40)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.50)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                color: '#1C1C1C',
              }}
              aria-label="Back to home"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <span
            className="text-xs font-semibold tracking-wide px-5 py-2 rounded-full select-none"
            style={{
              color: '#1C1C1C',
              background: 'rgba(255,255,255,0.40)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.50)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            Modules
          </span>
        </div>
      </div>

      {/* ── Cards area ── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden min-h-0"
        style={{ perspective: 1200 }}
      >
        <div
          ref={trackRef}
          className="flex items-center h-full"
          style={{ gap: CARD_GAP, willChange: "transform", transformStyle: "preserve-3d" }}
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

      {/* ── Dot indicators + counter — liquid glass ── */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-2 pb-5 pt-3"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderTop: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Progress bar — 3px tall with gradient + glowing dot */}
        <div
          className="w-40 h-[3px] rounded-full overflow-visible relative"
          style={{ background: "rgba(196,168,130,0.12)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out relative"
            style={{
              width: `${((activeIndex + 1) / modules.length) * 100}%`,
              background: `linear-gradient(90deg, ${modules[activeIndex]?.accent?.border ?? "#C4A882"}, ${modules[activeIndex]?.accent?.from ?? "#C4A882"})`,
              boxShadow: `0 0 8px ${modules[activeIndex]?.accent?.ring ?? "rgba(196,168,130,0.3)"}`,
            }}
          >
            {/* Glowing dot at the end of progress */}
            <span
              className="absolute top-1/2 -translate-y-1/2 -right-[3px] w-[7px] h-[7px] rounded-full transition-colors duration-300"
              style={{
                background: modules[activeIndex]?.accent?.border ?? "#C4A882",
                boxShadow: `0 0 6px 2px ${modules[activeIndex]?.accent?.ring ?? "rgba(196,168,130,0.3)"}`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modules.map((m, i) => (
            <button
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              onClick={() => goToCard(i)}
              aria-label={`Go to module ${i + 1}`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 transition-colors duration-300"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                background: i === activeIndex
                  ? (m.accent?.border ?? "#C4A882")
                  : "rgba(196,168,130,0.25)",
                borderRadius: 3,
                boxShadow: i === activeIndex
                  ? `0 0 10px ${m.accent?.ring ?? "rgba(196,168,130,0.3)"}`
                  : "none",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium tabular-nums tracking-wide"
            style={{ color: modules[activeIndex]?.accent?.border ?? "#A09A94" }}
          >
            {activeIndex + 1}
          </span>
          <span className="text-[10px] text-[#C4A882]/40">/</span>
          <span
            className="text-[10px] tabular-nums tracking-wide"
            style={{ color: "#A09A94" }}
          >
            {modules.length}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ModuleCard — square gradient, cover-flow ready, rich visual       */
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

  // Build gradient string (2 or 3 stops)
  const gradientStops = m.accent.via
    ? `linear-gradient(145deg, ${m.accent.from} 0%, ${m.accent.via} 45%, ${m.accent.to} 100%)`
    : `linear-gradient(145deg, ${m.accent.from} 0%, ${m.accent.to} 100%)`;

  return (
    <a
      ref={mergedRef}
      href={m.href}
      aria-label={`Open ${m.title} module`}
      className={`flex-shrink-0 relative overflow-hidden group${isActive ? " card-glow-pulse" : ""}`}
      style={{
        width: "min(72vw, 420px)",
        maxWidth: "85vw",
        aspectRatio: "1/1",
        borderRadius: 28,
        boxShadow: isActive
          ? `0 8px 40px -8px ${m.accent.ring}, 0 24px 64px -12px rgba(0,0,0,0.22)`
          : "0 4px 20px -4px rgba(0,0,0,0.06)",
        border: isActive
          ? `1.5px solid ${m.accent.border}`
          : "1px solid rgba(255,255,255,0.10)",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={isActive ? () => {
        if (typeof window === "undefined") return;
        const el = internalRef.current;
        if (!el) return;
        import("gsap").then(({ default: gsap }) => {
          gsap.to(el, {
            y: -6,
            boxShadow: `0 16px 56px -8px ${m.accent.ring}, 0 32px 80px -12px rgba(0,0,0,0.30)`,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      } : undefined}
      onMouseLeave={isActive ? () => {
        if (typeof window === "undefined") return;
        const el = internalRef.current;
        if (!el) return;
        import("gsap").then(({ default: gsap }) => {
          gsap.to(el, {
            y: 0,
            boxShadow: `0 8px 40px -8px ${m.accent.ring}, 0 24px 64px -12px rgba(0,0,0,0.22)`,
            duration: 0.35,
            ease: "power2.out",
          });
        });
      } : undefined}
    >
      {/* ── Solid 3D gradient background ── */}
      <div
        className="absolute inset-0"
        style={{ background: gradientStops }}
      />

      {/* ── Secondary diagonal overlay for depth ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)`,
        }}
      />

      {/* ── Dot-grid texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.06,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── Soft light glow bottom-left ── */}
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,0.15), transparent 65%)`,
        }}
      />

      {/* ── Dark vignette top-right ── */}
      <div
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0,0,0,0.20), transparent 65%)`,
        }}
      />

      {/* ── Animated shimmer sweep (active card) ── */}
      {isActive && (
        <div
          className="absolute inset-0 z-[2] pointer-events-none motion-ok"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.08) 58%, transparent 70%)",
            backgroundSize: "250% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      )}

      {/* ── Feature ribbon on quiz card (module index 0) ── */}
      {index === 0 && (
        <span className="feature-ribbon" aria-label="Most popular module">
          ★ MOST POPULAR
        </span>
      )}

      {/* ── Decorative emoji watermark ── */}
      <span
        className="absolute bottom-3 right-4 pointer-events-none select-none z-[1]"
        style={{
          fontSize: "clamp(60px, 16vw, 100px)",
          lineHeight: 1,
          opacity: 0.08,
          filter: "blur(1px)",
        }}
        aria-hidden
      >
        {m.emoji}
      </span>

      {/* ── Module number watermark ── */}
      <span
        className="absolute top-4 right-4 pointer-events-none select-none z-[1]"
        style={{
          fontSize: "clamp(48px, 12vw, 80px)",
          fontWeight: 800,
          color: "rgba(255,255,255,0.05)",
          lineHeight: 1,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}
        aria-hidden
      >
        {String(parseInt(m.num))}
      </span>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
        {/* Top row: module num + status — glass pills */}
        <div className="flex items-start justify-between flex-shrink-0">
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.95)",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            MODULE {m.num}
          </span>
          <span
            className="text-[8px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
            style={{
              color: "rgba(255,255,255,0.95)",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35)",
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
              width: "clamp(72px, 16vw, 100px)",
              height: "clamp(72px, 16vw, 100px)",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
            }}
          >
            <Icon
              className="text-white drop-shadow-sm"
              style={{
                width: "clamp(30px, 6.5vw, 42px)",
                height: "clamp(30px, 6.5vw, 42px)",
              }}
              strokeWidth={1.4}
            />
          </div>
        </div>

        {/* Bottom: Title + desc + CTA — liquid glass panel */}
        <div
          className="space-y-1.5 flex-shrink-0 rounded-xl px-3 py-2.5"
          style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)',
          }}
        >
          <h3
            className="font-bold tracking-tight leading-tight"
            style={{
              color: "#FFFFFF",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.25rem, 3.5vw, 1.65rem)",
              textShadow: "0 2px 8px rgba(0,0,0,0.20)",
            }}
          >
            {m.title}
          </h3>
          <p className="text-white/70 text-[11px] sm:text-xs leading-relaxed line-clamp-2"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
          >
            {m.desc}
          </p>

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="relative flex h-2 w-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: `0 0 8px rgba(255,255,255,0.5), 0 0 2px ${m.accent.border}`,
                  animation: "status-pulse 2s ease-in-out infinite",
                }}
              />
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/80">
                {m.status}
              </span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
