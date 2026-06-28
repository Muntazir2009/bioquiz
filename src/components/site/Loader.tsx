"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Apple "Hello"-style loading screen for BioQuiz.
 *
 * - Soft botanical blurred background (warm tones)
 * - "Welcome to BioQuiz" in Cormorant Garamond 300, white, centered, letter-spaced
 * - Thin animated progress line, fills left→right over 2 seconds
 * - On complete: blur lifts smoothly, text fades, loader dismisses
 * - GSAP dynamic import inside useEffect (SSR-safe for Cloudflare Pages)
 * - Session-based skip via sessionStorage
 * - 5-second fallback setTimeout guarantees dismissal
 */

const SESSION_KEY = "bq.loader.seen";

export function Loader() {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setShow(false);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip if already seen this session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setShow(false);
        return;
      }
    } catch { /* ignore */ }

    setMounted(true);

    // 5-second fallback — guarantees dismissal even if GSAP fails
    const fallback = setTimeout(() => {
      dismiss();
    }, 5000);

    import("gsap").then(({ default: gsap }) => {
      const container = containerRef.current;
      const img = imgRef.current;
      const overlay = overlayRef.current;
      const text = textRef.current;
      const track = lineTrackRef.current;
      const fill = lineFillRef.current;

      if (!container || !text || !fill || !track) {
        clearTimeout(fallback);
        dismiss();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallback);
          dismiss();
        },
      });

      // 1. Text fades in (0.6s)
      tl.fromTo(
        text,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        0.3
      );

      // 2. Progress line fills (2s)
      tl.fromTo(
        fill,
        { width: "0%" },
        { width: "100%", duration: 2, ease: "power1.inOut" },
        0.5
      );

      // 3. Track fades in
      tl.fromTo(
        track,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
        0.3
      );

      // 4. When progress is done: lift blur, fade text/line, fade out container
      tl.to(
        overlay,
        { opacity: 0, duration: 0.8, ease: "power2.inOut" },
        "-=0.1"
      );
      tl.to(
        text,
        { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" },
        "<"
      );
      tl.to(
        track,
        { opacity: 0, duration: 0.4, ease: "power2.in" },
        "<"
      );

      // 5. Un-blur the background image
      if (img) {
        tl.to(
          img,
          { filter: "blur(0px) brightness(1.05)", duration: 0.8, ease: "power2.inOut" },
          "-=0.3"
        );
      }

      // 6. Fade out entire loader
      tl.to(
        container,
        { opacity: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2"
      );
    }).catch(() => {
      clearTimeout(fallback);
      dismiss();
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
      style={{ background: "#1a1410" }}
    >
      {/* Botanical background — blurred 40px, darkened overlay */}
      <img
        ref={imgRef}
        src="/claura-flowers.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{
          filter: "blur(40px) brightness(0.55) saturate(1.3)",
          transformOrigin: "center center",
        }}
      />
      {/* Warm overlay for extra depth */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,20,16,0.3) 0%, rgba(26,20,16,0.15) 50%, rgba(26,20,16,0.5) 100%)",
        }}
      />

      {/* Content: Text + Progress line */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-lg">
        <h1
          ref={textRef}
          className="text-center font-light tracking-[0.18em] text-white/95 opacity-0"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
            fontWeight: 300,
            lineHeight: 1.25,
          }}
        >
          Welcome to BioQuiz
        </h1>

        {/* Progress line */}
        <div
          ref={lineTrackRef}
          className="mt-8 w-48 h-px opacity-0"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <div
            ref={lineFillRef}
            className="h-full rounded-full"
            style={{
              width: "0%",
              background: "rgba(255,255,255,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}