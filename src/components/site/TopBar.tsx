"use client";

import { useState, useEffect, useCallback } from "react";
import { StreakBadge } from "./StreakBadge";
import { CloudUpload, ShieldCheck, Sun, Moon, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TopBar({ onFilePanelOpen }: { onFilePanelOpen?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "brown" : "dark");
  }, [theme, setTheme]);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-semibold tracking-tight transition-transform group-hover:scale-105">
              B
            </div>
            <span className="text-[14px] font-semibold tracking-tight">BioQuiz</span>
            <span className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              v2.0
            </span>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {mounted && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground mr-1">
                <Clock className="h-3 w-3" />
                <span className="tabular-nums">{time}</span>
              </div>
            )}

            <StreakBadge />

            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className="group grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-45" />
                    ) : (
                      <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {theme === "dark" ? "Brown mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/admin.html"
                  className="group grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-105" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Admin</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onFilePanelOpen}
                  className="group grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                >
                  <CloudUpload className="h-4 w-4 transition-transform group-hover:scale-105" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Files</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
