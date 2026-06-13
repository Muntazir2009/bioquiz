"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWidgetConfig } from "@/lib/useWidgetConfig";
import { Sidebar, TABS } from "@/components/admin/Sidebar";
import { ConfigPanel } from "@/components/admin/ConfigPanel";
import { LivePreview } from "@/components/admin/LivePreview";
import { SyncBadge } from "@/components/admin/SyncBadge";
import { BackgroundBeams } from "@/components/admin/BackgroundBeams";

export default function WidgetConfigPage() {
  const { config, updateConfig, syncStatus, loaded } = useWidgetConfig();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [previewOpen, setPreviewOpen] = useState(true);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060608]">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#2EB9DF]/30 border-t-[#2EB9DF]" />
          <p className="text-sm text-white/30">Loading config…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#060608]">
      {/* Background effects */}
      <BackgroundBeams />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Config panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-white/[0.04] bg-[#060608]/60 px-6 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-white/70">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <SyncBadge status={syncStatus} />
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  previewOpen
                    ? "bg-[#2EB9DF]/15 text-[#2EB9DF]"
                    : "bg-white/[0.03] text-white/40 hover:text-white/60"
                }`}
              >
                Preview
              </button>
            </div>
          </header>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-hidden"
            >
              <ConfigPanel
                config={config}
                updateConfig={updateConfig}
                activeTab={activeTab}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview panel */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="shrink-0 overflow-hidden border-l border-white/[0.04]"
            >
              <LivePreview config={config} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
