"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from "react";

/**
 * 2-slide horizontal GSAP-powered slideshow.
 *
 * - Full viewport slides (100vw × 100vh)
 * - GSAP x-translation for transitions (0.7s, power3.inOut)
 * - Touch swipe (horizontal-only, >50px threshold) — only on hero slide
 * - Keyboard navigation (ArrowRight/Left, skips INPUT/TEXTAREA)
 * - Dot indicators with active scaling — hidden on modules slide
 * - SSR-safe: GSAP loaded via dynamic import inside useEffect
 */

interface SlideshowProps {
  children: ReactNode[];
}

export interface SlideshowRef {
  goToSlide: (index: number) => void;
}

export const Slideshow = forwardRef<SlideshowRef, SlideshowProps>(
  function Slideshow({ children }, ref) {
    const [activeIndex, setActiveIndex] = useState(0);
    const slideCount = children.length;

    const trackRef = useRef<HTMLDivElement>(null);
    const dotsContainerRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const isAnimating = useRef(false);
    const activeIndexRef = useRef(0);

    const goToSlide = useCallback(
      (index: number) => {
        if (isAnimating.current) return;
        if (index < 0 || index >= slideCount) return;
        if (index === activeIndexRef.current) return;

        isAnimating.current = true;
        const track = trackRef.current;

        import("gsap").then(({ default: gsap }) => {
          if (!track) {
            isAnimating.current = false;
            return;
          }

          gsap.to(track, {
            x: -index * 100 + "vw",
            duration: 0.7,
            ease: "power3.inOut",
            onComplete: () => {
              isAnimating.current = false;
            },
          });

          activeIndexRef.current = index;
          setActiveIndex(index);

          // Animate dots
          dotsRef.current.forEach((dot, i) => {
            if (!dot) return;
            if (i === index) {
              gsap.to(dot, { scale: 1.3, duration: 0.4, ease: "back.out(2)" });
            } else {
              gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
            }
          });
        });
      },
      [slideCount]
    );

    useImperativeHandle(ref, () => ({ goToSlide }), [goToSlide]);

    // Keyboard navigation
    useEffect(() => {
      if (typeof window === "undefined") return;

      const handleKey = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          goToSlide(activeIndexRef.current + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          goToSlide(activeIndexRef.current - 1);
        }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [goToSlide]);

    // Touch swipe — only on hero slide (index 0)
    useEffect(() => {
      if (typeof window === "undefined") return;
      const track = trackRef.current;
      if (!track) return;
      const container = track.parentElement;
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
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (isHorizontal === false) return;
        if (isHorizontal === null) return;

        const dx = e.changedTouches[0].clientX - startX;

        if (Math.abs(dx) > 50) {
          if (dx < 0) {
            goToSlide(activeIndexRef.current + 1);
          } else {
            goToSlide(activeIndexRef.current - 1);
          }
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
    }, [goToSlide]);

    return (
      <div className="relative flex-1 overflow-hidden">
        {/* Slide track */}
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ willChange: "transform" }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className="w-screen h-screen flex-shrink-0 flex items-center justify-center overflow-hidden"
            >
              {child}
            </div>
          ))}
        </div>

        {/* Dot indicators — hidden on modules slide (index > 0) */}
        <div
          ref={dotsContainerRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 transition-opacity duration-300"
          style={{ opacity: activeIndex === 0 ? 1 : 0, pointerEvents: activeIndex === 0 ? "auto" : "none" }}
        >
          {children.map((_, i) => (
            <button
              key={i}
              ref={(el) => { dotsRef.current[i] = el; }}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                background: i === activeIndex ? "#C4A882" : "rgba(196,168,130,0.3)",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);