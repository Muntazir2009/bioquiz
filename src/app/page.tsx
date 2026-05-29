"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Hero } from "@/components/site/Hero";
import { ModulesGrid } from "@/components/site/ModulesGrid";
import { Footer } from "@/components/site/Footer";

// Dynamic imports for heavy / rarely-used components — reduces initial JS bundle
const FilePanel = dynamic(
  () => import("@/components/site/FilePanel").then((mod) => ({ default: mod.FilePanel })),
  { ssr: false }
);
const SharedFileView = dynamic(
  () => import("@/components/site/SharedFileView").then((mod) => ({ default: mod.SharedFileView })),
  { ssr: false }
);
const ChatWidget = dynamic(
  () => import("@/components/site/ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false }
);

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
