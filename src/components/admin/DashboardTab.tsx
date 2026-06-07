"use client";

import { useState } from "react";
import type { WidgetConfig } from "@/lib/defaults";
import { WIDGET_THEMES } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Power,
  ShieldCheck,
  MessageSquare,
  Palette,
  Zap,
  Clock,
  Users,
} from "lucide-react";

// ─── Props ──────────────────────────────────────────────────

interface DashboardTabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

// ─── Helpers ────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function themeName(id: string): string {
  return WIDGET_THEMES.find((t) => t.id === id)?.name ?? id;
}

function themePreviewColor(id: string): string {
  return WIDGET_THEMES.find((t) => t.id === id)?.preview ?? "#000";
}

// ─── Status Card ────────────────────────────────────────────

function StatusCard({
  icon,
  label,
  value,
  color,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: string;
  pulse?: boolean;
}) {
  return (
    <SpotlightCard className="p-4 sm:p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-1.5">
            {label}
          </p>
          <div className="flex items-center gap-2">{value}</div>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{
            backgroundColor: color ? `${color}15` : "rgba(255,255,255,0.03)",
            color: color ?? "rgba(255,255,255,0.3)",
          }}
        >
          {icon}
        </div>
      </div>
      {pulse && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: color }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          </span>
          <span className="text-[10px] text-white/25">Live</span>
        </div>
      )}
    </SpotlightCard>
  );
}

// ─── Quick Action Button ────────────────────────────────────

function QuickAction({
  icon,
  label,
  description,
  checked,
  onChange,
  activeColor = "#2EB9DF",
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  activeColor?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 transition-all cursor-pointer ${
        checked
          ? "border-white/[0.08] bg-white/[0.03]"
          : "border-white/[0.04] bg-transparent hover:border-white/[0.08]"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{
            backgroundColor: checked ? `${activeColor}18` : "rgba(255,255,255,0.03)",
            color: checked ? activeColor : "rgba(255,255,255,0.25)",
          }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-medium truncate ${checked ? "text-white/70" : "text-white/40"}`}>
            {label}
          </p>
          <p className="text-[10px] text-white/20 truncate">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
    </div>
  );
}

// ─── Config Summary Row ─────────────────────────────────────

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-white/30">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function DashboardTab({ config, updateConfig }: DashboardTabProps) {
  // Timestamp of when this dashboard mounted — serves as "config version"
  const [mountedAt] = useState(Date.now);

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      {/* ── Status Cards ──────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Widget Status */}
          <StatusCard
            icon={<Power size={16} />}
            label="Widget Status"
            color={config.widgetEnabled ? "#34d399" : "#f87171"}
            pulse={config.widgetEnabled}
            value={
              <span
                className={`text-sm font-semibold ${
                  config.widgetEnabled ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {config.widgetEnabled ? "Active" : "Disabled"}
              </span>
            }
          />

          {/* Default Theme */}
          <StatusCard
            icon={<Palette size={16} />}
            label="Default Theme"
            color="#2EB9DF"
            value={
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 shrink-0 rounded-full border border-white/10"
                  style={{ backgroundColor: themePreviewColor(config.defaultTheme) }}
                />
                <span className="text-sm font-medium text-white/70 truncate">
                  {themeName(config.defaultTheme)}
                </span>
              </div>
            }
          />

          {/* Sync Status */}
          <StatusCard
            icon={<Activity size={16} />}
            label="Sync Status"
            color="#2EB9DF"
            pulse
            value={
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2EB9DF] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2EB9DF]" />
                </span>
                <span className="text-sm font-medium text-[#2EB9DF]">Connected</span>
              </div>
            }
          />

          {/* Config Version */}
          <StatusCard
            icon={<Clock size={16} />}
            label="Last Updated"
            color="#a78bfa"
            value={
              <span className="text-sm font-medium text-white/60">
                {formatTimestamp(mountedAt)}
              </span>
            }
          />
        </div>
      </section>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <SpotlightCard className="p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-white/70 flex items-center gap-2">
          <Zap size={14} className="text-[#2EB9DF]" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <QuickAction
            icon={<Power size={14} />}
            label="Toggle Widget"
            description="Master kill switch"
            checked={config.widgetEnabled}
            onChange={(v) => updateConfig({ widgetEnabled: v })}
            activeColor={config.widgetEnabled ? "#34d399" : "#f87171"}
          />
          <QuickAction
            icon={<ShieldCheck size={14} />}
            label="Disguise Mode"
            description="Calculator cover mode"
            checked={config.disguiseEnabled}
            onChange={(v) => updateConfig({ disguiseEnabled: v })}
          />
          <QuickAction
            icon={<MessageSquare size={14} />}
            label="Profanity Filter"
            description="Filter inappropriate language"
            checked={config.profanityFilter}
            onChange={(v) => updateConfig({ profanityFilter: v })}
          />
          <QuickAction
            icon={<Clock size={14} />}
            label="Slow Mode"
            description="Rate-limit messages per user"
            checked={config.slowMode}
            onChange={(v) => updateConfig({ slowMode: v })}
          />
          <QuickAction
            icon={<Users size={14} />}
            label="Announcements"
            description="Broadcast announcements"
            checked={config.announcementEnabled}
            onChange={(v) => updateConfig({ announcementEnabled: v })}
          />
          <QuickAction
            icon={<Zap size={14} />}
            label="Rate Limiting"
            description="Global message rate limiting"
            checked={config.rateLimitEnabled}
            onChange={(v) => updateConfig({ rateLimitEnabled: v })}
          />
        </div>
      </SpotlightCard>

      {/* ── Configuration Summary ─────────────────────────── */}
      <SpotlightCard className="p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-white/70 flex items-center gap-2">
          <Palette size={14} className="text-[#2EB9DF]" />
          Configuration Summary
        </h3>
        <div className="divide-y divide-white/[0.04]">
          <SummaryRow label="Accent Color">
            <div
              className="h-4 w-4 rounded-full border border-white/10"
              style={{ backgroundColor: config.accentColor }}
            />
            <span className="text-xs font-mono text-white/50">{config.accentColor}</span>
          </SummaryRow>

          <SummaryRow label="Bubble Style">
            <span className="text-xs font-medium text-white/50 capitalize">
              {config.bubbleStyle}
            </span>
          </SummaryRow>

          <SummaryRow label="Font Size">
            <span className="text-xs font-medium text-white/50 uppercase">
              {config.fontSize}
            </span>
          </SummaryRow>

          <SummaryRow label="Character Limit">
            <span className="text-xs font-medium text-white/50">
              {config.charLimit} chars
            </span>
          </SummaryRow>

          <SummaryRow label="Max Messages">
            <span className="text-xs font-medium text-white/50">
              {config.maxMessages} per chat
            </span>
          </SummaryRow>

          <SummaryRow label="Auto Open">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  config.autoOpen ? "text-emerald-400" : "text-white/30"
                }`}
              >
                {config.autoOpen ? "Enabled" : "Disabled"}
              </span>
              {config.autoOpen && (
                <span className="text-[10px] text-white/25">
                  ({(config.autoOpenDelay / 1000).toFixed(1)}s delay)
                </span>
              )}
            </div>
          </SummaryRow>
        </div>
      </SpotlightCard>
    </div>
  );
}
