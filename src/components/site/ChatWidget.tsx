"use client";

import { useEffect } from "react";

/**
 * ChatWidget — loads the BioQuiz chat widget script.
 * - Cache-busts via version from /chat-widget-version.json
 * - Auto-reloads the widget when a new version is detected (for open tabs)
 * - Polls every 8s so new versions appear quickly without a manual reload
 * - V78: adds a timestamp query to version.json fetch to defeat any
 *   stale service-worker / CDN / browser-HTTP cache that could pin an old version
 */
export function ChatWidget() {
  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | null = null;
    let currentVersion: string | null = null;

    /** Fetch the latest version, always bypassing every cache layer. */
    function fetchVersion(): Promise<string | null> {
      // `_t` defeats browser HTTP cache + any stale SW fetch handler.
      // `cache: "no-store"` defeats the fetch HTTP cache.
      return fetch(`/chat-widget-version.json?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d?.version ? String(d.version) : null))
        .catch(() => null);
    }

    /** Load (or reload) the widget script with a cache-busting version query. */
    function loadWidget(version: string) {
      // Remove old script + DOM if present
      const oldScript = document.getElementById("bq-chat-script");
      if (oldScript) oldScript.remove();
      const bubble = document.getElementById("bqb");
      const panel = document.getElementById("bqp");
      if (bubble) bubble.remove();
      if (panel) panel.remove();

      const script = document.createElement("script");
      script.id = "bq-chat-script";
      // Cache-bust: append version so browsers fetch a fresh copy on update
      script.src = `/chat-widget.js?v=${encodeURIComponent(version)}`;
      script.async = true;
      document.body.appendChild(script);
    }

    // Initial load
    fetchVersion().then((v) => {
      const version = v || Date.now().toString();
      currentVersion = version;
      loadWidget(version);

      // Poll every 8s so new versions appear quickly
      poll = setInterval(() => {
        fetchVersion().then((latest) => {
          if (latest && latest !== currentVersion) {
            currentVersion = latest;
            loadWidget(latest);
          }
        });
      }, 8000);
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
