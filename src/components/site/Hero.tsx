"use client";

import { ArrowRight, CloudUpload, Zap } from "lucide-react";

/**
 * Hero section — clean, modern, no old-HTML vibes.
 * Simple one-column layout: headline + description + CTAs.
 */
export function Hero({ onOpenFiles }: { onOpenFiles?: () => void }) {
  return (
    <section id="overview" className="relative overflow-hidden border-b border-border">
      {/* ── Background layers ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-spotlight" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36">
        {/* Status badge */}
        <div
          className="hero-badge-pulse inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-3.5 py-1.5 text-[11px] text-muted-foreground animate-[fade-up_0.5s_ease_both]"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          All systems operational
        </div>

        {/* Heading */}
        <h1
          className="mt-7 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl animate-[fade-up_0.6s_ease_both]"
          style={{ animationDelay: "60ms" }}
        >
          The biology workspace.
          <br />
          <span className="hero-gradient-text">Built for clarity.</span>
        </h1>

        {/* Description */}
        <p
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground animate-[fade-up_0.6s_ease_both]"
          style={{ animationDelay: "130ms" }}
        >
          Seven beautifully crafted modules — quizzes, AI research, a 3D cell
          viewer, organelles, slides and solutions, all in one calm workspace.
        </p>

        {/* CTAs */}
        <div
          className="mt-8 flex flex-wrap items-center gap-3 animate-[fade-up_0.6s_ease_both]"
          style={{ animationDelay: "200ms" }}
        >
          <div className="hero-cta-border">
            <a
              href="#modules"
              className="hero-cta-inner group inline-flex h-10 items-center gap-1.5 bg-foreground px-4 text-[13px] font-medium text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" />
              Browse modules
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <button
            onClick={onOpenFiles}
            className="inline-flex h-10 items-center rounded-lg border border-border bg-card/60 backdrop-blur-sm px-4 text-[13px] font-medium text-foreground transition-all hover:bg-card hover:border-primary/30"
          >
            <CloudUpload className="h-3.5 w-3.5 mr-1.5" />
            Upload files
          </button>
        </div>
      </div>
    </section>
  );
}
