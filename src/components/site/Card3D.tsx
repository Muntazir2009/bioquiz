"use client";

import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Module } from "@/lib/modules";

/**
 * Module card — premium 3D aesthetic design.
 * - Static 3D depth via layered box-shadows and edge highlights
 * - No hover tilt / spotlight / shimmer — clean and performant
 * - Color-matched shadows for each module
 * - Smooth entrance animation
 * - Glassmorphism card with backdrop blur
 *
 * The 3D effect is achieved through:
 * 1. Multi-layer box-shadows creating "elevation"
 * 2. A visible bottom edge using a pseudo-element (via CSS class .card-3d)
 * 3. Subtle border lighting on top-left edges
 */
export const Card3D = memo(function Card3D({
  module: m,
  index,
}: {
  module: Module;
  index: number;
}) {
  const Icon = m.icon;

  // Featured (wide) card for the first module
  if (m.featured) {
    return (
      <a
        href={m.href}
        aria-label={`Open ${m.title} module`}
        style={
          {
            "--c": m.color,
            "--accent-from": m.accent.from,
            "--accent-to": m.accent.to,
            "--accent-ring": m.accent.ring,
            "--accent-glow": m.accent.glow,
            animationDelay: `${index * 60}ms`,
          } as React.CSSProperties
        }
        className="card-3d group relative flex flex-col sm:flex-row items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card/90 sm:backdrop-blur-sm cursor-pointer animate-[card-in_0.45s_ease_both] p-6 sm:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {/* Top gradient line */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] opacity-60"
          style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
        />

        {/* Icon box */}
        <div className="relative z-10 shrink-0">
          <div
            className="grid h-18 w-18 place-items-center rounded-2xl text-background"
            style={{
              background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
              boxShadow: "0 6px 28px -6px var(--accent-ring), inset 0 1px 0 rgba(255,255,255,0.18)",
              width: "72px",
              height: "72px",
            }}
          >
            <Icon className="h-7 w-7 text-background" strokeWidth={1.8} aria-hidden />
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-col flex-1 min-w-0 gap-2">
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
            className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl border"
            style={{
              borderColor: "color-mix(in oklab, var(--c) 18%, var(--border))",
              background: "color-mix(in oklab, var(--c) 5%, transparent)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 motion-ok">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{
                borderColor: "color-mix(in oklab, var(--c) 25%, transparent)",
                background: "color-mix(in oklab, var(--c) 10%, transparent)",
                color: "var(--c)",
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </div>
          </div>
        </div>
      </a>
    );
  }

  // Standard card
  return (
    <a
      href={m.href}
      aria-label={`Open ${m.title} module`}
      style={
        {
          "--c": m.color,
          "--accent-from": m.accent.from,
          "--accent-to": m.accent.to,
          "--accent-ring": m.accent.ring,
          "--accent-glow": m.accent.glow,
          animationDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
      className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/90 sm:backdrop-blur-sm cursor-pointer animate-[card-in_0.45s_ease_both] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {/* Top gradient line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] opacity-40"
        style={{ background: "linear-gradient(90deg, transparent 10%, var(--c) 50%, transparent 90%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 p-5 sm:p-6">
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

        {/* Icon box */}
        <div className="relative">
          <div
            className="grid h-14 w-14 place-items-center rounded-xl text-background"
            style={{
              background: "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
              boxShadow: "0 4px 20px -4px var(--accent-ring), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <Icon className="h-6 w-6 text-background" strokeWidth={1.8} aria-hidden />
          </div>
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
        className="relative z-10 mt-auto px-5 sm:px-6 py-3 flex items-center justify-between border-t"
        style={{
          borderColor: "color-mix(in oklab, var(--c) 12%, var(--border))",
          background: "color-mix(in oklab, var(--c) 4%, transparent)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 motion-ok">
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
          className="flex h-8 w-8 items-center justify-center rounded-lg border"
          style={{
            borderColor: "color-mix(in oklab, var(--c) 25%, transparent)",
            background: "color-mix(in oklab, var(--c) 10%, transparent)",
            color: "var(--c)",
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </div>
      </div>
    </a>
  );
});
