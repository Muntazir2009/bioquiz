"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  "CELL" — Black monochrome atom/cell loader
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  Optimized: 1.1s duration (was 1.4s), no heavy effects.
 *  Pure black & white. Atom icon with 3 orbital rings.
 */

const BRAND = "BIOQUIZ";
const DURATION = 0.85;

export function Loader() {
  const [show, setShow] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;

    const ctrl = animate(0, 100, {
      duration: DURATION,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(v) {
        if (cancelled) return;
        const val = Math.round(v);
        if (barRef.current) barRef.current.style.width = `${val}%`;
        if (pctRef.current) pctRef.current.textContent = `${val}`;
        if (phaseRef.current) {
          if (val < 30) phaseRef.current.textContent = "Initializing";
          else if (val < 60) phaseRef.current.textContent = "Loading";
          else if (val < 88) phaseRef.current.textContent = "Preparing";
          else phaseRef.current.textContent = "Ready";
        }
      },
      onComplete() {
        if (cancelled) return;
        if (phaseRef.current) phaseRef.current.textContent = "Done";
        setTimeout(() => {
          if (!cancelled) setShow(false);
        }, 150);
      },
    });

    return () => {
      cancelled = true;
      ctrl.stop();
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          className="loader-mono fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Dot matrix background ── */}
          <div aria-hidden className="loader-mono-dots absolute inset-0" />

          {/* ── Content ── */}
          <motion.div
            className="relative z-10 flex flex-col items-center w-[340px] px-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Atom / Cell icon ── */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.03 }}
            >
              <div className="loader-atom">
                <div className="loader-atom-scene">
                  <div className="loader-atom-nucleus" />
                  <div className="loader-atom-orbit loader-atom-orbit-1">
                    <div className="loader-atom-electron-spin">
                      <div className="loader-atom-electron" />
                    </div>
                  </div>
                  <div className="loader-atom-orbit loader-atom-orbit-2">
                    <div className="loader-atom-electron-spin loader-atom-electron-delay-2">
                      <div className="loader-atom-electron" />
                    </div>
                  </div>
                  <div className="loader-atom-orbit loader-atom-orbit-3">
                    <div className="loader-atom-electron-spin loader-atom-electron-delay-3">
                      <div className="loader-atom-electron" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Brand name ── */}
            <motion.div
              className="flex items-center gap-[0.35em] mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              {BRAND.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  className="loader-mono-brand-letter"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.03,
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* ── Subtitle ── */}
            <motion.span
              className="loader-mono-subtitle mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              Workspace
            </motion.span>

            {/* ── Divider ── */}
            <motion.div
              className="loader-mono-divider w-full mb-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            />

            {/* ── Progress bar ── */}
            <div className="w-full space-y-2.5">
              <div className="loader-mono-bar-track relative h-[3px] w-full overflow-hidden rounded-full">
                <div
                  ref={barRef}
                  className="loader-mono-bar-fill absolute inset-y-0 left-0 rounded-full"
                  style={{ width: "0%" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span ref={phaseRef} className="loader-mono-phase">
                  Initializing
                </span>
                <div className="flex items-center gap-1">
                  <span ref={pctRef} className="loader-mono-pct">
                    0
                  </span>
                  <span className="loader-mono-pct-sign">%</span>
                </div>
              </div>
            </div>

            {/* ── Skeleton lines ── */}
            <motion.div
              className="w-full mt-6 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <div className="loader-mono-skeleton h-[2px] w-full rounded-full" />
              <div
                className="loader-mono-skeleton h-[2px] w-3/4 rounded-full"
                style={{ animationDelay: "0.15s" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
