"use client";

import { useEffect } from "react";

/**
 * ChatWidget — loads the BioQuiz chat widget script.
 *
 * - Cache-busts via version from /chat-widget-version.json
 * - Auto-reloads the widget when a new version is detected (for open tabs)
 * - Polls every 12s when the tab is VISIBLE, pauses entirely when hidden
 *   (Page Visibility API) so background tabs don't burn bandwidth/CPU
 * - V78: timestamp query on version.json defeats stale SW / CDN / browser cache
 */
export function ChatWidget() {
  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | null = null;
    let currentVersion: string | null = null;
    let stopped = false;

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
      // Cache-bust: append version + timestamp so browsers AND CDNs fetch fresh
      script.src = `/chat-widget.js?v=${encodeURIComponent(version)}&_t=${Date.now()}`;
      script.async = true;
      document.body.appendChild(script);
    }

    function startPolling() {
      if (poll) return; // already running
      poll = setInterval(() => {
        // Double-check visibility inside the interval — if the tab was hidden
        // between the visibilitychange event firing and the next tick, skip.
        if (document.visibilityState !== "visible") return;
        fetchVersion().then((latest) => {
          if (stopped) return;
          if (latest && latest !== currentVersion) {
            currentVersion = latest;
            loadWidget(latest);
          }
        });
      }, 12_000);
    }

    function stopPolling() {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        // Tab became visible again — immediately check for a new version,
        // then resume polling. This catches updates that shipped while hidden.
        fetchVersion().then((latest) => {
          if (stopped) return;
          if (latest && latest !== currentVersion) {
            currentVersion = latest;
            loadWidget(latest);
          }
        });
        startPolling();
      } else {
        stopPolling();
      }
    }

    // Initial load
    fetchVersion().then((v) => {
      if (stopped) return;
      const version = v || Date.now().toString();
      currentVersion = version;
      loadWidget(version);

      // Only start polling if the tab is currently visible
      if (document.visibilityState === "visible") {
        startPolling();
      }
    });

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopped = true;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
