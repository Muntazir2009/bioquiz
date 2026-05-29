"use client";

import { useEffect } from "react";

/**
 * ChatWidget — loads the BioQuiz chat widget script.
 * - Cache-busts via version from /chat-widget-version.json
 * - Auto-reloads the widget when a new version is detected (for open tabs)
 * - The rePaintPoll stub is defined in layout.tsx's synchronous <script>
 */
export function ChatWidget() {
  useEffect(() => {
    // Don't load twice
    if (document.getElementById("bq-chat-script")) return;

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

        // Poll for version changes every 60s — auto-reload if updated
        const CURRENT_VERSION = version;
        const poll = setInterval(() => {
          fetch("/chat-widget-version.json", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.version && d.version !== CURRENT_VERSION) {
                clearInterval(poll);
                loadWidget(d.version);
              }
            })
            .catch(() => {});
        }, 60000);

        return () => clearInterval(poll);
      })
      .catch(() => {
        // Fallback: load without cache-bust
        loadWidget();
      });

    return () => {
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
