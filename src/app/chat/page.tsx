"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { TopBar } from "@/components/site/TopBar";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar />
      </div>

      {mounted && (
        <div className="pt-14 h-screen flex flex-col">
          <div className="flex-1 relative" id="chat-mount" />
          <Script
            src="/chat-widget.js"
            strategy="afterInteractive"
          />
        </div>
      )}
      {/* The chat panel is inert while the calculator cover is up; html itself must stay clickable */}
      <style>{`html.has-bq-disguise{pointer-events:auto !important;touch-action:auto !important;}`}</style>
    </div>
  );
}
