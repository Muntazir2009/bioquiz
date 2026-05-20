"use client";

import { memo, useCallback, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Module } from "@/lib/modules";

/**
 * Module card — premium aesthetic design.
 * - Animated gradient border on hover (rotating conic gradient)
 * - Diagonal shimmer sweep on hover
 * - Icon glow with ambient light
 * - Glassmorphism card with backdrop blur
 * - 3D tilt on mouse (useRef, zero re-renders)
 * - Enhanced status indicator with pulsing ring
 * - Color-matched multi-layer shadows
 */
export const Card3D = memo(function Card3D({
  module: m,
  index,
}: {
  module: Module;
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const card = cardRef.current;
      if (!card) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -3;
        const tiltY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
        card.style.willChange = "transform";

        // Update spotlight position
        const spotlight = card.querySelector<HTMLElement>(".card-spotlight");
        if (spotlight) {
          spotlight.style.background = `radial-gradient(400px circle at ${x}px ${y}px, var(--accent-ring), transparent 60%)`;
          spotlight.style.opacity = "1";
        }
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (card) {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      card.style.willChange = "auto";
      const spotlight = card.querySelector<HTMLElement>(".card-spotlight");
      if (spotlight) spotlight.style.opacity = "0";
    }
  }, []);

  const Icon = m.icon;

  // Featured (wide) card for the first module
  if (m.featured) {
    return (
      <a
        ref={cardRef}
        href={m.href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          {
            "--c": m.color,
            "--accent-from": m.accent.from,
            "--accent-to": m.accent.to,
            "--accent-ring": m.accent.ring,
            "--accent-glow": m.accent.glow,
            animationDelay: `${index * 60}ms`,
            transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
            transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease-out, border-color 0.4s ease-out",
          } as React.CSSProperties
        }
        className="group relative flex flex-col sm:flex-row items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-[color:var(--accent-ring)] cursor-pointer animate-[card-in_0.5s_ease_both] p-7 hover:shadow-[0_8px_40px_-8px_var(--accent-ring)]"
      >
        {/* Interactive spotlight — follows cursor */}
        <div
          aria-hidden
          className="card-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0"
        />

        {/* Top gradient line — animated */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] opacity-40 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
        />

        {/* Shimmer sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out z-[1]"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 60%)",
          }}
        />

        {/* Ambient glow behind icon */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-[80px]"
          style={{ background: "var(--accent-glow)" }}
        />

        {/* Icon box — larger for featured */}
        <div className="relative z-10 shrink-0">
          <div
            className="grid h-20 w-20 place-items-center rounded-2xl text-background transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
            style={{
              background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
              boxShadow: "0 8px 32px -8px var(--accent-ring), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Icon className="h-8 w-8 text-background" strokeWidth={1.8} />
          </div>
          {/* Floating ring around icon on hover */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125 group-hover:rounded-3xl"
            style={{ borderColor: "var(--accent-ring)" }}
          />
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col flex-1 min-w-0 gap-2">
          {/* Head: chip */}
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md border"
              style={{
                color: "var(--c)",
                borderColor: "color-mix(in oklab, var(--c) 24%, transparent)",
                background: "color-mix(in oklab, var(--c) 10%, transparent)",
              }}
            >
              MODULE {m.num}
            </span>
            {/* Status chip */}
            <span
              className="text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border"
              style={{
                color: "var(--c)",
                borderColor: "color-mix(in oklab, var(--c) 18%, transparent)",
                background: "color-mix(in oklab, var(--c) 6%, transparent)",
              }}
            >
              {m.status}
            </span>
          </div>

          <h3 className="text-xl font-bold tracking-tight uppercase" style={{ color: "var(--c)" }}>
            {m.title}
          </h3>
          <p className="text-[14px] leading-relaxed text-muted-foreground">{m.desc}</p>

          {/* Launch bar */}
          <div
            className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl border transition-all duration-300 group-hover:border-[color:var(--accent-ring)] group-hover:shadow-[0_0_20px_-4px_var(--accent-glow)]"
            style={{
              borderColor: "color-mix(in oklab, var(--c) 18%, var(--border))",
              background: "color-mix(in oklab, var(--c) 5%, transparent)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="relative flex h-2 w-2"
              >
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                  style={{ background: "var(--c)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--c)", boxShadow: "0 0 8px var(--c)" }}
                />
              </span>
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ color: "var(--c)" }}
              >
                {m.status}
              </span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_12px_var(--accent-ring)]"
              style={{
                borderColor: "color-mix(in oklab, var(--c) 25%, transparent)",
                background: "color-mix(in oklab, var(--c) 10%, transparent)",
                color: "var(--c)",
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Bottom edge glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
        />
      </a>
    );
  }

  // Standard card
  return (
    <a
      ref={cardRef}
      href={m.href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--c": m.color,
          "--accent-from": m.accent.from,
          "--accent-to": m.accent.to,
          "--accent-ring": m.accent.ring,
          "--accent-glow": m.accent.glow,
          animationDelay: `${index * 60}ms`,
          transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease-out, border-color 0.4s ease-out",
        } as React.CSSProperties
      }
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-[color:var(--accent-ring)] cursor-pointer animate-[card-in_0.5s_ease_both] hover:shadow-[0_8px_40px_-8px_var(--accent-ring)]"
    >
      {/* Interactive spotlight — follows cursor */}
      <div
        aria-hidden
        className="card-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 z-0 rounded-2xl"
      />

      {/* Top gradient line — animated */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] opacity-30 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
      />

      {/* Shimmer sweep on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out z-[1]"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 p-6">
        {/* Head: chip + status */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md border"
            style={{
              color: "var(--c)",
              borderColor: "color-mix(in oklab, var(--c) 24%, transparent)",
              background: "color-mix(in oklab, var(--c) 10%, transparent)",
            }}
          >
            MODULE {m.num}
          </span>
          <span
            className="text-[9px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border"
            style={{
              color: "var(--c)",
              borderColor: "color-mix(in oklab, var(--c) 18%, transparent)",
              background: "color-mix(in oklab, var(--c) 6%, transparent)",
            }}
          >
            {m.status}
          </span>
        </div>

        {/* Icon box with ambient glow */}
        <div className="relative">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-background transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
              boxShadow: "0 6px 24px -6px var(--accent-ring), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Icon className="h-7 w-7 text-background relative z-10" strokeWidth={1.8} />
          </div>
          {/* Floating ring on hover */}
          <div
            aria-hidden
            className="absolute top-0 left-0 h-16 w-16 rounded-2xl border opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125 group-hover:rounded-3xl"
            style={{ borderColor: "var(--accent-ring)" }}
          />
          {/* Ambient glow */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-[40px]"
            style={{ background: "var(--accent-glow)" }}
          />
        </div>

        {/* Title + Desc */}
        <h3 className="text-base font-bold tracking-tight uppercase" style={{ color: "var(--c)" }}>
          {m.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
          {m.desc}
        </p>
      </div>

      {/* Launch bar */}
      <div
        className="relative z-10 mt-auto px-6 py-3 flex items-center justify-between border-t transition-all duration-300 group-hover:border-[color:var(--accent-ring)] group-hover:shadow-[0_0_20px_-4px_var(--accent-glow)]"
        style={{
          background: "color-mix(in oklab, var(--c) 4%, transparent)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ background: "var(--c)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "var(--c)", boxShadow: "0 0 8px var(--c)" }}
            />
          </span>
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "var(--c)" }}
          >
            {m.status}
          </span>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_12px_var(--accent-ring)]"
          style={{
            borderColor: "color-mix(in oklab, var(--c) 25%, transparent)",
            background: "color-mix(in oklab, var(--c) 10%, transparent)",
            color: "var(--c)",
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Bottom edge glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
      />
    </a>
  );
});
