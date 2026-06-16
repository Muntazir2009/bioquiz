"use client";

import { useEffect } from "react";

/**
 * ChatWidget — loads the BioQuiz chat widget script.
 * - Cache-busts via version from /chat-widget-version.json
 * - Auto-reloads the widget when a new version is detected (for open tabs)
 * - Polls every 12s so new versions appear quickly without a manual reload
 */
export function ChatWidget() {
  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | null = null;

    // Load the widget with cache-busting version query param
    function loadWidget(version?: string) {
      // Remove old script + DOM if present
      const oldScript = document.getElementById("bq-chat-script");
      if (oldScript) oldScript.remove();
      const bubble = document.getElementById("bqb");
      const panel = document.getElementById("bqp");
      if (bubble) bubble.remove();
      if (panel) panel.remove();

      const script = document.createElement("script");
      script.id = "bq-chat-script";
      // Cache-bust: append version so browsers fetch fresh copy on update
      script.src = version
        ? `/chat-widget.js?v=${version}`
        : "/chat-widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Fetch current version, then load widget with cache-bust
    fetch("/chat-widget-version.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const version = data?.version || Date.now().toString();
        loadWidget(version);

        // V77: Poll every 12s (was 60s) so new versions appear quickly
        const CURRENT_VERSION = version;
        poll = setInterval(() => {
          fetch("/chat-widget-version.json", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.version && d.version !== CURRENT_VERSION) {
                if (poll) clearInterval(poll);
                loadWidget(d.version);
              }
            })
            .catch(() => {});
        }, 12000);
      })
      .catch(() => {
        // Fallback: load without cache-bust
        loadWidget();
      });

    return () => {
      if (poll) clearInterval(poll);
      const el = document.getElementById("bq-chat-script");
      if (el) el.remove();
      const bubble = document.getElementById("bqb");
      const panel = document.getElementById("bqp");
      if (bubble) bubble.remove();
      if (panel) panel.remove();
    };
  }, []);

  return null;
}
