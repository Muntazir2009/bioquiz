"use client";

import { useEffect, useRef } from "react";
import type { WidgetConfig } from "@/lib/defaults";
import { WIDGET_THEMES } from "@/lib/defaults";
import { STATUS_OPTIONS } from "@/lib/defaults";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

interface LivePreviewProps {
  config: WidgetConfig;
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400/60" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0a0a0f] p-3 sm:p-4">
        {/* Phone frame */}
        <div
          className="mx-auto h-full max-w-[340px] overflow-hidden border border-white/[0.06]"
          style={{
            borderRadius: config.borderRadius,
            background: bg,
          }}
        >
          {/* Widget header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: config.bgElevated,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: config.accentColor, borderRadius: config.borderRadius / 2 }}
              >
                {config.botInitials || "BQ"}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: config.textColor }}>
                  {config.botName}
                </p>
                <p className="text-[9px]" style={{ color: statusInfo?.color }}>
                  {statusInfo?.icon} {statusInfo?.label}
                </p>
              </div>
            </div>
            <ChevronDown size={14} style={{ color: config.textColor, opacity: 0.4 }} />
          </div>

          {/* Chat area */}
          <div className="flex flex-col gap-2 p-3" style={{ minHeight: 200 }}>
            {/* Bot message */}
            <div className="flex items-end gap-1.5 max-w-[80%]">
              <div
                className="px-3 py-2 text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: config.textColor,
                  borderRadius: config.borderRadius,
                  fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                }}
              >
                Hey there! 👋 Ask me anything about biology.
              </div>
            </div>

            {/* User message */}
            <div className="flex items-end gap-1.5 max-w-[80%] self-end">
              <div
                className="px-3 py-2 text-xs text-white"
                style={{
                  background: config.bubbleMine,
                  borderRadius: config.borderRadius,
                  fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                }}
              >
                What is mitosis?
              </div>
            </div>

            {/* Bot reply */}
            <div className="flex items-end gap-1.5 max-w-[85%]">
              <div
                className="px-3 py-2 text-xs"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: config.textColor,
                  borderRadius: config.borderRadius,
                  fontSize: config.fontSize === "sm" ? "12px" : config.fontSize === "lg" ? "16px" : "13.5px",
                }}
              >
                Mitosis is cell division that produces two identical daughter cells 🧬
              </div>
            </div>

            {config.typingIndicator && (
              <div className="flex items-end gap-1.5">
                <div
                  className="flex items-center gap-1 px-3 py-2"
                  style={{
                    background: "rgba(255,255,255,0.05)",
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
          {config.disappearingEnabled === false && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {["Cell Structure", "Mitosis vs Meiosis", "DNA"].map((label) => (
                <button
                  key={label}
                  className="rounded-full border px-2.5 py-1 text-[10px] transition-colors"
                  style={{
                    borderColor: `${config.accentColor}30`,
                    color: config.accentColor,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-center gap-2 border-t px-3 py-2"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: config.bgElevated }}
          >
            <div
              className="flex-1 rounded-full px-3 py-1.5 text-[10px]"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.3)",
                borderRadius: config.borderRadius / 2,
              }}
            >
              Type a message...
            </div>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: config.accentColor }}
            >
              <Send size={12} className="text-white" />
            </div>
          </div>

          {/* Widget bubble */}
          <div className="flex justify-end p-3">
            <div
              className="flex h-10 w-10 items-center justify-center shadow-lg"
              style={{
                backgroundColor: config.accentColor,
                borderRadius: config.borderRadius / 2,
              }}
            >
              <MessageCircle size={18} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
