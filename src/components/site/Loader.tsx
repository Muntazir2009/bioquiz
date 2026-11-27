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
 * - Rendered on the server: visible in the initial HTML, before hydration
 * - Fullscreen flower background, blurred via CSS (static, GPU-composited)
 * - "Hello." stroke-draw + fade, then overlay fades out
 * - Only transform/opacity are animated (compositor-only → holds 60fps)
 * - Full animation on the first visit of a session, quick fade afterwards
 */

export function Loader() {
  const [show, setShow] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgTextRef = useRef<SVGTextElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    // Respect reduced-motion: no stroke draw, just a brief branded frame
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const quick = setTimeout(dismiss, 450);
      return () => clearTimeout(quick);
    }

    // 6s fallback — guarantees dismissal even if GSAP or the font fails
    const fallback = setTimeout(dismiss, 6000);

    // First visit of a session gets the full intro; later loads fade fast
    let seen = false;
    try {
      seen = sessionStorage.getItem("bq-intro-seen") === "1";
      sessionStorage.setItem("bq-intro-seen", "1");
    } catch {
      /* storage unavailable — treat as first visit */
    }
    const speed = seen ? 0.22 : 1;

    const run = () => {
      const text = svgTextRef.current;
      const overlay = overlayRef.current;
      const container = containerRef.current;
      if (!text || !overlay || !container) {
        clearTimeout(fallback);
        dismiss();
        return;
      }

      text.style.strokeDasharray = "1000";
      text.style.strokeDashoffset = "1000";

      import("gsap")
        .then(({ default: gsap }) => {
          // Measure the real stroke length, then draw it
          const length = text.getComputedTextLength();
          text.style.strokeDasharray = String(length);
          text.style.strokeDashoffset = String(length);

          const tl = gsap.timeline({
            onComplete: () => {
              clearTimeout(fallback);
              dismiss();
            },
          });

          // 1. Stroke draw
          tl.to(text, { strokeDashoffset: 0, duration: 1.3 * speed, ease: "power2.inOut" }, 0.2);

          // 2. Fill fades in
          tl.to(text, { fillOpacity: 1, duration: 0.4 * speed, ease: "power2.out" }, 0.9 * speed);

          // 3. Subtitle fades in
          tl.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4 * speed, ease: "power2.out" },
            "-=0.1"
          );

          // 4. Overlay + container fade out — opacity only, no filter tweens
          tl.to(overlay, { opacity: 0, duration: 0.6 * speed, ease: "power2.inOut" }, "-=0.1");
          tl.to(container, { opacity: 0, duration: 0.4 * speed, ease: "power2.out" }, "<0.2");
        })
        .catch(() => {
          clearTimeout(fallback);
          dismiss();
        });
    };

    document.fonts
      .load("700 80px 'Dancing Script'")
      .then(run)
      .catch(run);

    return () => {
      clearTimeout(fallback);
    };
  }, [dismiss]);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Loading BioQuiz"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Blurred flower background (static filter, composited once) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/flower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.88) saturate(0.5)",
          transform: "scale(1.1)",
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
