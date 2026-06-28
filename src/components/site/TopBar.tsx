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
    // Use a microtask-free mounted flag — safe in React 19.
    setMounted(true);

    const update = () => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    update();

    // Align the next tick to the start of the next minute, then update every
    // 60s. Updating every 30s with HH:MM precision meant the displayed minute
    // could be up to 30s stale — now it flips within ~1s of the actual minute.
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startupTimer = setTimeout(() => {
      update();
      intervalId = setInterval(update, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(startupTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "brown" : "dark");
  }, [theme, setTheme]);

  const iconBtnClass =
    "group grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md" aria-label="BioQuiz home">
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
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground mr-1" aria-label={`Current time ${time}`}>
                <Clock className="h-3 w-3" aria-hidden />
                <span className="tabular-nums">{time}</span>
              </div>
            )}

            <StreakBadge />

            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={iconBtnClass}
                    aria-label={theme === "dark" ? "Switch to brown mode" : "Switch to dark mode"}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-500" aria-hidden />
                    ) : (
                      <Moon className="h-4 w-4" aria-hidden />
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
                  href="/admin"
                  className={iconBtnClass}
                  aria-label="Open admin panel"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Admin</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onFilePanelOpen}
                  className={iconBtnClass}
                  aria-label="Open files panel"
                >
                  <CloudUpload className="h-4 w-4" aria-hidden />
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
