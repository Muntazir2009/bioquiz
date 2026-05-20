"use client";

import { Heart, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">
              B
            </div>
            <div>
              <span className="text-[13px] font-semibold tracking-tight">BioQuiz</span>
              <p className="text-[10px] text-muted-foreground">The biology workspace</p>
            </div>
          </div>

          {/* Divider — visible on desktop */}
          <Separator orientation="vertical" className="hidden sm:block h-8 bg-border" />

          {/* Center tagline */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary/60" />
            Seven modules. One workspace.
          </div>

          {/* Status + Copyright */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="text-[10px] text-muted-foreground">All systems operational</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              &copy; {new Date().getFullYear()} BioQuiz — Built with <Heart className="inline h-3 w-3 text-red-500/70" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
