"use client";

import { useEffect } from "react";

/**
 * ChatWidget — loads the BioQuiz chat widget script.
 * The script is a self-contained IIFE that creates its own DOM
 * (floating bubble + panel). We just need to inject the script tag.
 *
 * The rePaintPoll stub is defined in layout.tsx's synchronous <script>
 * tag to ensure it's available before any script runs.
 */
export function ChatWidget() {
  useEffect(() => {
    // Don't load twice
    if (document.getElementById("bq-chat-script")) return;

    const script = document.createElement("script");
    script.id = "bq-chat-script";
    script.src = "/chat-widget_v30.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount (rare, but safe)
      const el = document.getElementById("bq-chat-script");
      if (el) el.remove();
      // Also remove widget DOM if present
      const bubble = document.getElementById("bqb");
      const panel = document.getElementById("bqp");
      if (bubble) bubble.remove();
      if (panel) panel.remove();
    };
  }, []);

  return null;
}
