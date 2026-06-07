"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Settings2,
  MessageSquareHeart,
  Zap,
  Brain,
  Shield,
  Bug,
} from "lucide-react";
import { MovingBorder } from "./MovingBorder";

export interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const TABS: TabDef[] = [
  { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
  { id: "behavior", label: "Behavior", icon: <Settings2 size={18} /> },
  { id: "welcome", label: "Welcome", icon: <MessageSquareHeart size={18} /> },
  { id: "quick-replies", label: "Quick Replies", icon: <Zap size={18} /> },
  { id: "ai-persona", label: "AI Persona", icon: <Brain size={18} /> },
  { id: "access", label: "Access", icon: <Shield size={18} /> },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-white/[0.04] bg-[#060608]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-5 py-4">
        <Bug size={20} className="text-[#2EB9DF]" />
        <div>
          <h1 className="text-sm font-semibold text-white/90">BioQuiz</h1>
          <p className="text-[10px] tracking-wider text-white/30 uppercase">
            Widget Config
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <MovingBorder
              key={tab.id}
              active={isActive}
              duration={4}
              borderColor="rgba(46, 185, 223, 0.35)"
            >
              <button
                onClick={() => onTabChange(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-[#2EB9DF]/10 text-[#2EB9DF]"
                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/70"
                }`}
              >
                {tab.icon}
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2EB9DF]"
                  />
                )}
              </button>
            </MovingBorder>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.04] px-5 py-3">
        <p className="text-[10px] text-white/20">
          Real-time via Firebase RTDB
        </p>
      </div>
    </aside>
  );
}
