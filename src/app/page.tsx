"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Hero } from "@/components/site/Hero";
import { ModulesGrid } from "@/components/site/ModulesGrid";
import { Footer } from "@/components/site/Footer";
import { FilePanel } from "@/components/site/FilePanel";
import { SharedFileView } from "@/components/site/SharedFileView";
import { ChatWidget } from "@/components/site/ChatWidget";

export default function Home() {
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("share");
    if (sid) {
      queueMicrotask(() => setShareId(sid));
    }
  }, []);

  const closeShareView = useCallback(() => {
    setShareId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("share");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const openFiles = useCallback(() => setFilePanelOpen(true), []);

  return (
    <div className="min-h-screen flex flex-col">
      <Loader />
      <TopBar onFilePanelOpen={openFiles} />
      <main className="flex-1">
        <Hero onOpenFiles={openFiles} />
        <ModulesGrid />
      </main>
      <Footer />

      <FilePanel open={filePanelOpen} onClose={() => setFilePanelOpen(false)} />

      {shareId && (
        <SharedFileView shareId={shareId} onClose={closeShareView} />
      )}

      <ChatWidget />
    </div>
  );
}
