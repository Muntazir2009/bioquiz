"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Palette,
  SwatchBook,
  Settings2,
  UserCircle,
  ShieldCheck,
  Cog,
  Bug,
  Menu,
  X,
  Shield,
  Megaphone,
} from "lucide-react";
import { MovingBorder } from "./MovingBorder";

export interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const TABS: TabDef[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
  { id: "themes", label: "Themes", icon: <SwatchBook size={18} /> },
  { id: "behavior", label: "Behavior", icon: <Settings2 size={18} /> },
  { id: "profile", label: "Profile", icon: <UserCircle size={18} /> },
  { id: "security", label: "Security", icon: <ShieldCheck size={18} /> },
  { id: "moderation", label: "Moderation", icon: <Shield size={18} /> },
  { id: "announcements", label: "Announcements", icon: <Megaphone size={18} /> },
  { id: "advanced", label: "Advanced", icon: <Cog size={18} /> },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }: SidebarProps) {
  const handleTabChange = (id: string) => {
    onTabChange(id);
    onMobileClose();
  };

  const navContent = (
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
              onClick={() => handleTabChange(tab.id)}
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
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-56 shrink-0 flex-col border-r border-white/[0.04] bg-[#060608]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-5 py-4">
          <Bug size={20} className="text-[#2EB9DF]" />
          <div>
            <h1 className="text-sm font-semibold text-white/90">BioQuiz</h1>
            <p className="text-[10px] tracking-wider text-white/30 uppercase">Widget Config</p>
          </div>
        </div>
        {navContent}
        <div className="border-t border-white/[0.04] px-5 py-3">
          <p className="text-[10px] text-white/20">Real-time via Firebase RTDB</p>
        </div>
      </aside>

      {/* Mobile overlay drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.04] bg-[#060608] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Bug size={20} className="text-[#2EB9DF]" />
                  <h1 className="text-sm font-semibold text-white/90">BioQuiz</h1>
                </div>
                <button onClick={onMobileClose} className="text-white/40 hover:text-white/70">
                  <X size={18} />
                </button>
              </div>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile menu button for top bar
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-2 text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/70 md:hidden"
    >
      <Menu size={20} />
    </button>
  );
}
