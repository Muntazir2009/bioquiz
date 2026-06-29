"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Apple "Hello."-style loading screen for BioQuiz.
 *
 * - Fullscreen flower background, blurred (blur 40px, brightness 0.7)
 * - "Hello." in Dancing Script 700, 80px, white — SVG stroke-draw animation
 * - strokeDashoffset from full length → 0 over 2.2s (power2.inOut)
 * - Fill fades in at 1.5s delay
 * - After complete: "— BioQuiz" fades in (18px Inter, #C4A882)
 * - Then: overlay fades out + blur lifts to 0px (1.2s) simultaneously
 * - Shows every page load — no skip, no cache
 * - SSR safe: returns null if typeof window === "undefined"
 * - All GSAP via dynamic import("gsap") inside useEffect
 */

export function Loader() {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgTextRef = useRef<SVGTextElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setMounted(true);

    // 10s fallback — guarantees dismissal even if GSAP or font fails
    const fallback = setTimeout(() => {
      dismiss();
    }, 10000);

    // Wait for Dancing Script font before measuring stroke length
    document.fonts
      .load("700 80px 'Dancing Script'")
      .then(() => {
        import("gsap").then(({ default: gsap }) => {
          const container = containerRef.current;
          const bg = bgRef.current;
          const overlay = overlayRef.current;
          const text = svgTextRef.current;
          const subtitle = subtitleRef.current;

          if (!container || !text || !bg || !overlay) {
            clearTimeout(fallback);
            dismiss();
            return;
          }

          // Measure stroke length for the handwriting animation
          const length = text.getComputedTextLength();
          text.style.strokeDasharray = String(length);
          text.style.strokeDashoffset = String(length);

          const tl = gsap.timeline({
            onComplete: () => {
              clearTimeout(fallback);
              dismiss();
            },
          });

          // 1. Stroke draw: full length → 0 over 2.2s, power2.inOut
          tl.to(
            text,
            {
              strokeDashoffset: 0,
              duration: 2.2,
              ease: "power2.inOut",
            },
            0.5
          );

          // 2. Fill fades in at 1.5s delay (0.8s duration)
          tl.to(
            text,
            {
              fillOpacity: 1,
              duration: 0.8,
              ease: "power2.out",
            },
            1.5
          );

          // 3. After stroke complete: subtitle fades in
          if (subtitle) {
            tl.fromTo(
              subtitle,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              "-=0.2"
            );
          }

          // 4. Blur lifts (1.2s) + overlay fades out simultaneously
          tl.to(
            bg,
            {
              filter: "blur(0px) brightness(0.85) saturate(0.7)",
              duration: 1.2,
              ease: "power2.inOut",
            },
            "-=0.3"
          );

          tl.to(
            overlay,
            {
              opacity: 0,
              duration: 1.0,
              ease: "power2.inOut",
            },
            "<"
          );

          // 5. Container fades out
          tl.to(
            container,
            {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.3"
          );
        }).catch(() => {
          clearTimeout(fallback);
          dismiss();
        });
      })
      .catch(() => {
        // Font failed to load — still run GSAP with fallback measurement
        import("gsap").then(({ default: gsap }) => {
          const container = containerRef.current;
          const bg = bgRef.current;
          const overlay = overlayRef.current;
          const text = svgTextRef.current;

          if (!container || !text || !bg || !overlay) {
            clearTimeout(fallback);
            dismiss();
            return;
          }

          const length = text.getComputedTextLength();
          text.style.strokeDasharray = String(length);
          text.style.strokeDashoffset = String(length);

          const tl = gsap.timeline({
            onComplete: () => {
              clearTimeout(fallback);
              dismiss();
            },
          });

          tl.to(text, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0.5);
          tl.to(text, { fillOpacity: 1, duration: 0.8, ease: "power2.out" }, 1.5);

          if (subtitleRef.current) {
            tl.fromTo(subtitleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");
          }

          tl.to(bg, { filter: "blur(0px) brightness(0.85) saturate(0.7)", duration: 1.2, ease: "power2.inOut" }, "-=0.3");
          tl.to(overlay, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "<");
          tl.to(container, { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
        }).catch(() => {
          clearTimeout(fallback);
          dismiss();
        });
      });

    return () => {
      clearTimeout(fallback);
    };
  }, [dismiss]);

  if (!mounted || !show) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Loading BioQuiz"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Blurred flower background ── */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/flower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.85) saturate(0.7)",
        }}
      />

      {/* ── Dark overlay for text contrast ── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
      />

      {/* ── SVG "Hello." with stroke-draw animation ── */}
      <svg
        className="relative z-10"
        width="420"
        height="130"
        viewBox="0 0 420 130"
        aria-hidden="true"
      >
        <text
          ref={svgTextRef}
          x="210"
          y="92"
          textAnchor="middle"
          className={dancingScript.className}
          style={{
            fontSize: "80px",
            fontWeight: 700,
            fill: "white",
            stroke: "white",
            strokeWidth: 1,
            fillOpacity: 0,
          }}
        >
          Hello.
        </text>
      </svg>

      {/* ── Subtitle: — BioQuiz ── */}
      <div
        ref={subtitleRef}
        className="relative z-10 mt-1 opacity-0"
        style={{
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          fontSize: "18px",
          color: "#C4A882",
          letterSpacing: "0.04em",
        }}
      >
        — BioQuiz
      </div>
    </div>
  );
}