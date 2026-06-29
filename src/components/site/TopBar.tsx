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

  const iconBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.50)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.06)',
    color: '#1C1C1C',
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md" aria-label="BioQuiz home">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-semibold tracking-tight transition-transform group-hover:scale-105">
              B
            </div>
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: '#1C1C1C' }}>BioQuiz</span>
            <span className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium sm:inline" style={{ color: '#1C1C1C', background: 'rgba(196,168,130,0.12)', borderColor: 'rgba(196,168,130,0.20)' }}>
              v2.0
            </span>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-1.5" style={{ color: '#1C1C1C' }}>
            {mounted && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] mr-1" style={{ color: '#1C1C1C' }} aria-label={`Current time ${time}`}>
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
                    className="group grid h-8 w-8 place-items-center rounded-lg transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    style={iconBtnStyle}
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
                  className="group grid h-8 w-8 place-items-center rounded-lg transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  style={iconBtnStyle}
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
                  className="group grid h-8 w-8 place-items-center rounded-lg transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  style={iconBtnStyle}
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
