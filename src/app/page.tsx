"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/site/Loader";
import { TopBar } from "@/components/site/TopBar";
import { Slideshow, type SlideshowRef } from "@/components/site/Slideshow";
import { ModuleCardSwiper } from "@/components/site/ModuleCardSwiper";
import { StudyHero } from "@/components/site/StudyHero";

const FilePanel = dynamic(
  () => import("@/components/site/FilePanel").then((mod) => ({ default: mod.FilePanel })),
  { ssr: false }
);
const SharedFileView = dynamic(
  () => import("@/components/site/SharedFileView").then((mod) => ({ default: mod.SharedFileView })),
  { ssr: false }
);

export default function Home() {
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const slideRef = useRef<SlideshowRef>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("share");
    if (sid) setShareId(sid);
  }, []);

  const closeShareView = useCallback(() => {
    setShareId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("share");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const openFiles = useCallback(() => setFilePanelOpen(true), []);
  const goToModules = useCallback(() => slideRef.current?.goToSlide(1), []);
  const goToHero = useCallback(() => slideRef.current?.goToSlide(0), []);

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col relative">
      {/* Fullscreen flower background */}
      <div
        aria-hidden="true"
        className="page-wallpaper fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/flower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.12)",
          isolation: 'isolate',
        }}
      />
      <div aria-hidden="true" className="page-wallpaper-tint fixed inset-0 -z-10" />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:border focus:border-border">
        Skip to content
      </a>

      <Loader />

      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar onFilePanelOpen={openFiles} />
      </div>

      <main id="main-content" className="flex-1 flex flex-col">
        <Slideshow ref={slideRef}>
          {/* ── SLIDE 1: Learning Notebook ── */}
          <StudyHero onBrowse={goToModules} />

          {/* ── SLIDE 2: Module Card Swiper ── */}
          <ModuleCardSwiper onBack={goToHero} />
        </Slideshow>
      </main>

      <FilePanel open={filePanelOpen} onClose={() => setFilePanelOpen(false)} />

      {shareId && (
        <SharedFileView shareId={shareId} onClose={closeShareView} />
      )}
    </div>
  );
}
