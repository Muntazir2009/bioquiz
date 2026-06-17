"use client";

import { Card3D } from "./Card3D";
import { modules } from "@/lib/modules";
import { Badge } from "@/components/ui/badge";

/**
 * Modules grid — clean layout with aesthetic cards.
 * Featured (wide) card spans full width, rest in 3-col grid.
 *
 * Performance: section uses `content-visibility: auto` so the browser can
 * skip rendering work for cards that are offscreen. This dramatically
 * reduces initial paint cost on the index page.
 */
export function ModulesGrid() {
  const featured = modules.find((m) => m.featured);
  const rest = modules.filter((m) => !m.featured);

  // Spell out the count word — 6 -> "Six", 7 -> "Seven", etc. Falls back to
  // the numeric form for counts beyond ten so we don't ship a giant lookup.
  const countWord = (() => {
    const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    return words[modules.length] ?? String(modules.length);
  })();

  return (
    <section
      id="modules"
      className="scroll-mt-20 border-b border-border"
      style={{
        // Skip rendering offscreen cards until the user scrolls near them.
        // `content-visibility: auto` is widely supported (Chrome 85+, Safari 18+, Firefox 125+).
        contentVisibility: "auto",
        // Reserve enough vertical space so the scrollbar doesn't jump when
        // the section renders. This is a conservative estimate.
        containIntrinsicSize: "auto 1200px",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <div
          className="mb-10 animate-[fade-up_0.5s_ease_both]"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Modules
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            <Badge
              variant="outline"
              className="h-5 border-primary/20 bg-primary/5 text-[9px] text-primary/70 px-2"
            >
              {modules.length} modules
            </Badge>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {countWord} modules.
          </h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Designed to work beautifully together.
          </p>
        </div>

        {/* Featured card — full width */}
        {featured && (
          <div className="mb-6">
            <Card3D module={featured} index={0} />
          </div>
        )}

        {/* Standard grid — 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((m, i) => (
            <Card3D key={m.id} module={m} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
