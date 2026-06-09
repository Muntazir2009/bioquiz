"use client";

import { useEffect, useRef } from "react";
import type { WidgetConfig } from "@/lib/defaults";
import { WIDGET_THEMES } from "@/lib/defaults";
import { STATUS_OPTIONS } from "@/lib/defaults";
import { MessageCircle, X, Send, ChevronDown, Phone, Smile, ImageIcon, Circle, BookOpen, Clock, Minus } from "lucide-react";

interface LivePreviewProps {
  config: WidgetConfig;
}

function StatusDot({ id, color }: { id: string; color: string }) {
  switch (id) {
    case "online":
      return <Circle size={6} fill={color} stroke={color} />;
    case "studying":
      return <BookOpen size={8} style={{ color }} />;
    case "away":
      return <Clock size={8} style={{ color }} />;
    case "busy":
      return <Minus size={8} style={{ color }} />;
    default:
      return <Circle size={6} fill={color} stroke={color} />;
  }
}

export function LivePreview({ config }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Post config to iframe whenever it changes
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: "BQ_CONFIG_UPDATE", config },
        "*",
      );
    } catch {
      // iframe may not be ready yet
    }
  }, [config]);

  const theme = WIDGET_THEMES.find((t) => t.id === config.defaultTheme);
  const bg = theme?.preview ?? config.bgColor;
  const statusInfo = STATUS_OPTIONS.find((s) => s.id === config.botStatus);
  const isGolden = config.defaultTheme === "golden";

  // Theme-aware colors
  const themeAccent = isGolden ? "#d4a056" : config.accentColor;
  const themeText = isGolden ? "#f4e3c7" : config.textColor;
  const themeBgElevated = isGolden ? "#1a0d04" : config.bgElevated;
  const themeBubbleMine = isGolden
    ? "linear-gradient(135deg,#d4a056 0%,#8a5a1f 100%)"
    : config.bubbleMine;
  const themeBubbleTheirs = isGolden
    ? "rgba(212,160,86,.10)"
    : "rgba(255,255,255,.055)";
  const themeBubbleTheirsBorder = isGolden
    ? "rgba(212,160,86,.22)"
    : "rgba(255,255,255,.09)";
  const themeInputBorder = isGolden
    ? "rgba(212,160,86,.22)"
    : "rgba(255,255,255,.12)";
  const themeHeaderBg = isGolden
    ? "linear-gradient(180deg,#1a0d04,#0a0503)"
    : config.bgElevated;

  // Template list
  const templates = config.messageTemplates?.split("\n").filter(Boolean).slice(0, 3) ?? ["Cell Structure", "Mitosis vs Meiosis", "DNA"];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex items-center gap-1">
          <span className="h-[6px] w-[6px] rounded-full bg-white/10" />
          <span className="h-[6px] w-[6px] rounded-full bg-white/10" />
          <span className="h-[6px] w-[6px] rounded-full bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0a0a0f] p-3 sm:p-4">
        {/* Phone frame */}
        <div
          className="mx-auto flex flex-col h-full max-w-[340px] overflow-hidden border border-white/[0.08]"
          style={{
            borderRadius: config.borderRadius,
            background: bg,
            maxHeight: "calc(100vh - 180px)",
          }}
        >
          {/* Announcement banner */}
          {config.announcementEnabled && config.announcementText && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-medium"
              style={{
                background: `${config.announcementColor}15`,
                color: config.announcementColor,
                borderBottom: `1px solid ${config.announcementColor}30`,
              }}
            >
              <span className="truncate flex-1">{config.announcementText}</span>
              {config.announcementDismiss && (
                <X size={10} className="shrink-0 opacity-50" />
              )}
            </div>
          )}

          {/* Maintenance banner */}
          {config.maintenanceEnabled && (
            <div
              className="flex items-center justify-center gap-2 px-3 py-4 text-[10px] text-white/40"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span>{config.maintenanceMessage || "Under maintenance"}</span>
            </div>
          )}

          {/* Widget header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
            style={{
              borderColor: isGolden ? "rgba(212,160,86,.18)" : "rgba(255,255,255,0.06)",
              background: themeHeaderBg,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{
                  backgroundColor: themeAccent,
                  borderRadius: config.borderRadius / 2,
                }}
              >
                {config.botInitials || "BQ"}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: themeText }}>
                  {config.botName}
                </p>
                <div className="flex items-center gap-1">
                  <StatusDot id={statusInfo?.id ?? "online"} color={statusInfo?.color ?? "#34d399"} />
                  <p className="text-[9px]" style={{ color: statusInfo?.color }}>
                    {statusInfo?.label}
                    {config.showOnlineCount && (
                      <span style={{ color: isGolden ? "rgba(244,227,199,.4)" : "rgba(255,255,255,.3)" }}>
                        {" "}· 12 online
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={12} style={{ color: themeText, opacity: 0.4 }} />
              <ChevronDown size={14} style={{ color: themeText, opacity: 0.4 }} />
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex flex-col gap-2 p-3 flex-1 overflow-auto"
            style={{
              minHeight: 180,
              background: isGolden
                ? "radial-gradient(ellipse at top,#1a0d04,#0a0503)"
                : bg,
            }}
          >
            {/* Date separator */}
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px" style={{ background: isGolden ? "rgba(212,160,86,.12)" : "rgba(255,255,255,.06)" }} />
              <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: isGolden ? "rgba(244,227,199,.3)" : "rgba(255,255,255,.2)" }}>
                Today
              </span>
              <div className="flex-1 h-px" style={{ background: isGolden ? "rgba(212,160,86,.12)" : "rgba(255,255,255,.06)" }} />
            </div>

            {/* Bot welcome message */}
            {config.welcomeEnabled && (
              <div className="flex items-end gap-1.5 max-w-[80%]">
                <div
                  className="px-3 py-2 text-xs"
                  style={{
                    background: themeBubbleTheirs,
                    border: `1px solid ${themeBubbleTheirsBorder}`,
                    color: themeText,
                    borderRadius: `${config.borderRadius}px ${config.borderRadius}px ${config.borderRadius}px 5px`,
                    fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                  }}
                >
                  {config.welcomeMessage || "Welcome to BioQuiz Chat! 🧬"}
                  <span
                    className="inline-flex items-center gap-0.5 float-right ml-2 mt-1.5 text-[9px]"
                    style={{ color: isGolden ? "rgba(244,227,199,.4)" : "rgba(255,255,255,.35)" }}
                  >
                    9:00 AM
                  </span>
                </div>
              </div>
            )}

            {/* User message */}
            <div className="flex items-end gap-1.5 max-w-[80%] self-end">
              <div
                className="px-3 py-2 text-xs text-white"
                style={{
                  background: themeBubbleMine,
                  borderRadius: `${config.borderRadius}px ${config.borderRadius}px 5px ${config.borderRadius}px`,
                  fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                }}
              >
                What is mitosis?
                <span
                  className="inline-flex items-center gap-0.5 float-right ml-2 mt-1.5 text-[9px]"
                  style={{ color: isGolden ? "rgba(26,13,4,.6)" : "rgba(255,255,255,.6)" }}
                >
                  9:01 AM ✓✓
                </span>
              </div>
            </div>

            {/* Bot reply */}
            <div className="flex items-end gap-1.5 max-w-[85%]">
              <div
                className="px-3 py-2 text-xs"
                style={{
                  background: themeBubbleTheirs,
                  border: `1px solid ${themeBubbleTheirsBorder}`,
                  color: themeText,
                  borderRadius: `${config.borderRadius}px ${config.borderRadius}px ${config.borderRadius}px 5px`,
                  fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                }}
              >
                Mitosis is cell division that produces two identical daughter cells 🧬
                <span
                  className="inline-flex items-center gap-0.5 float-right ml-2 mt-1.5 text-[9px]"
                  style={{ color: isGolden ? "rgba(244,227,199,.4)" : "rgba(255,255,255,.35)" }}
                >
                  9:01 AM
                </span>
              </div>
            </div>

            {/* Streak milestone message */}
            {config.streaksEnabled && (
              <div className="text-center py-1">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: themeAccent,
                    border: `1px solid rgba(255,255,255,0.08)`,
                  }}
                >
                  🔥 5-day streak!
                </span>
              </div>
            )}

            {/* Typing indicator */}
            {config.typingIndicator && (
              <div className="flex items-end gap-1.5">
                <div
                  className="flex items-center gap-1 px-3 py-2"
                  style={{
                    background: themeBubbleTheirs,
                    border: `1px solid ${themeBubbleTheirsBorder}`,
                    borderRadius: config.borderRadius,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {!config.maintenanceEnabled && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2 shrink-0">
              {templates.map((label) => (
                <button
                  key={label}
                  className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                  style={{
                    borderColor: `${themeAccent}30`,
                    color: themeAccent,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          {!config.maintenanceEnabled && (
            <div
              className="flex items-center gap-2 border-t px-3 py-2 shrink-0"
              style={{ borderColor: themeInputBorder, background: themeBgElevated }}
            >
              <Smile size={16} style={{ color: themeAccent, opacity: 0.6 }} />
              <div
                className="flex-1 rounded-full px-3 py-1.5 text-[10px]"
                style={{
                  background: isGolden ? "#1a0d04" : "rgba(255,255,255,0.05)",
                  color: isGolden ? "rgba(244,227,199,.3)" : "rgba(255,255,255,0.3)",
                  borderRadius: config.borderRadius / 2,
                  border: `1px solid ${themeInputBorder}`,
                }}
              >
                Type a message...
              </div>
              {config.imageUpload && (
                <ImageIcon size={16} style={{ color: themeAccent, opacity: 0.6 }} />
              )}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: themeAccent }}
              >
                <Send size={12} className="text-white" />
              </div>
            </div>
          )}

          {/* Bottom nav preview */}
          <div
            className="flex items-center justify-around py-1.5 px-2 shrink-0"
            style={{ background: themeBgElevated, borderTop: `1px solid ${themeInputBorder}` }}
          >
            {[
              { label: "Chat", Icon: MessageCircle, active: true },
              { label: "DMs", Icon: Send, active: false },
              { label: "Online", Icon: Circle, active: false },
              { label: "Settings", Icon: ChevronDown, active: false },
            ].map((tab) => (
              <div
                key={tab.label}
                className="flex flex-col items-center gap-0.5 px-2 py-0.5"
              >
                <tab.Icon
                  size={10}
                  style={{
                    color: tab.active ? themeAccent : "rgba(255,255,255,.15)",
                  }}
                />
                <span
                  className="text-[7px] font-bold"
                  style={{
                    color: tab.active ? themeAccent : "rgba(255,255,255,.25)",
                  }}
                >
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Config summary footer */}
      <div className="border-t border-white/[0.06] px-4 py-2 space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-white/20">Position</span>
          <span className="text-white/40 font-medium">{config.widgetPosition.replace("-", " ")}</span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-white/20">Panel Size</span>
          <span className="text-white/40 font-medium">{config.panelWidth}×{config.panelHeight}</span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-white/20">Bubble</span>
          <span className="text-white/40 font-medium">{config.bubbleSize}px</span>
        </div>
      </div>
    </div>
  );
}
