"use client";

import { useEffect, useRef } from "react";
import type { WidgetConfig } from "@/lib/defaults";

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
      <div className="flex-1 bg-[#0a0a0f] p-4">
        <div
          className="mx-auto h-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.06]"
          style={{
            background: config.darkMode ? "#060608" : "#fafafa",
          }}
        >
          <iframe
            ref={iframeRef}
            src="/chat-widget.js"
            title="Widget Preview"
            className="h-full w-full border-0 opacity-0"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Placeholder content — simulates widget */}
          <div className="flex h-full flex-col items-end justify-end p-4">
            {/* Widget button */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all"
              style={{
                backgroundColor: config.primaryColor,
                borderRadius: config.borderRadius,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
