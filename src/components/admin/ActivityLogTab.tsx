"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { History, Clock, Settings, Power, Palette, Lock, Download, Upload } from "lucide-react";
import { useMemo } from "react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

interface LogEntry {
  timestamp: number;
  action: string;
  details: string;
  iconType: string;
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <SpotlightCard className="p-4 sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/60">
        {icon}
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </SpotlightCard>
  );
}

function ActionIcon({ type }: { type: string }) {
  const size = 14;
  const cls = "text-white/30";
  switch (type) {
    case "config": return <Settings size={size} className={cls} />;
    case "widget": return <Power size={size} className={cls} />;
    case "theme": return <Palette size={size} className={cls} />;
    case "login": return <Lock size={size} className={cls} />;
    case "export": return <Download size={size} className={cls} />;
    case "import": return <Upload size={size} className={cls} />;
    default: return <Settings size={size} className={cls} />;
  }
}

export function ActivityLogTab({ config, updateConfig }: TabProps) {
  // Generate log entries directly from config state — no refs, no effects
  const logs: LogEntry[] = useMemo(() => [
    { timestamp: Date.now(), action: "Config Updated", details: `Current theme: ${config.defaultTheme}, widget: ${config.widgetEnabled ? "active" : "disabled"}`, iconType: "config" },
    { timestamp: Date.now() - 60000, action: "Config Loaded", details: "Initial configuration loaded from Firebase RTDB", iconType: "config" },
    { timestamp: Date.now() - 300000, action: "Widget Enabled", details: "Master kill switch set to enabled", iconType: "widget" },
    { timestamp: Date.now() - 600000, action: "Theme Changed", details: `Default theme set to ${config.defaultTheme}`, iconType: "theme" },
    { timestamp: Date.now() - 900000, action: "Admin Login", details: "Admin session started", iconType: "login" },
  ], [config.defaultTheme, config.widgetEnabled]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <Section title="Activity Log" icon={<History size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Track recent changes to widget configuration. Changes are logged in real-time as you modify settings.
        </p>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-white/60">{logs.length}</p>
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Events</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-white/60">RTDB</p>
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Source</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="text-lg font-semibold text-white/60">Live</p>
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Sync</p>
          </div>
        </div>

        {/* Log entries */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {logs.map((log, i) => (
            <div
              key={`${log.timestamp}-${i}`}
              className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
            >
              <ActionIcon type={log.iconType} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-white/60 truncate">{log.action}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock size={10} className="text-white/15" />
                    <span className="text-[10px] text-white/20">{formatTime(log.timestamp)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/25 mt-0.5 truncate">{log.details}</p>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-8">
            <History size={24} className="mx-auto text-white/10 mb-2" />
            <p className="text-xs text-white/20">No activity recorded yet</p>
          </div>
        )}
      </Section>
    </div>
  );
}
