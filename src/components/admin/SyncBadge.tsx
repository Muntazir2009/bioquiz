"use client";

import { motion } from "framer-motion";
import type { SyncStatus } from "@/lib/useWidgetConfig";

interface SyncBadgeProps {
  status: SyncStatus;
}

const STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; pulse: boolean }> = {
  synced: { label: "Synced", color: "bg-emerald-400", pulse: false },
  syncing: { label: "Syncing", color: "bg-[#2EB9DF]", pulse: true },
  offline: { label: "Offline", color: "bg-red-400", pulse: false },
};

export function SyncBadge({ status }: SyncBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/[0.03] px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <motion.span
            className={`absolute inset-0 rounded-full ${cfg.color} opacity-75`}
            animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.color}`} />
      </span>
      <span className="text-xs text-white/50">{cfg.label}</span>
    </div>
  );
}
