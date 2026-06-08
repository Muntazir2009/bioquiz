"use client";

import { motion } from "framer-motion";
import type { SyncStatus } from "@/lib/useWidgetConfig";
import { Cloud, CloudOff, Loader } from "lucide-react";

interface SyncBadgeProps {
  status: SyncStatus;
}

const STATUS_CONFIG: Record<SyncStatus, { label: string; icon: React.ReactNode; color: string }> = {
  synced: { label: "Synced", icon: <Cloud size={12} />, color: "text-white/50" },
  syncing: { label: "Syncing", icon: <Loader size={12} className="animate-spin" />, color: "text-white/60" },
  offline: { label: "Offline", icon: <CloudOff size={12} />, color: "text-red-400/70" },
};

export function SyncBadge({ status }: SyncBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-1.5">
      <span className={cfg.color}>{cfg.icon}</span>
      <span className="text-[11px] text-white/40">{cfg.label}</span>
    </div>
  );
}
