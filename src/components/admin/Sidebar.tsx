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
  History,
  Download,
  Smile,
  MessageSquareText,
  Wrench,
  Eye,
} from "lucide-react";

export interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const TABS: TabDef[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={17} /> },
  { id: "themes", label: "Themes", icon: <SwatchBook size={17} /> },
  { id: "behavior", label: "Behavior", icon: <Settings2 size={17} /> },
  { id: "profile", label: "Profile", icon: <UserCircle size={17} /> },
  { id: "security", label: "Security", icon: <ShieldCheck size={17} /> },
  { id: "moderation", label: "Moderation", icon: <Shield size={17} /> },
  { id: "announcements", label: "Announcements", icon: <Megaphone size={17} /> },
  { id: "reactions", label: "Reactions", icon: <Smile size={17} /> },
  { id: "templates", label: "Templates", icon: <MessageSquareText size={17} /> },
  { id: "maintenance", label: "Maintenance", icon: <Wrench size={17} /> },
  { id: "activity", label: "Activity Log", icon: <History size={17} /> },
  { id: "export", label: "Export / Import", icon: <Download size={17} /> },
  { id: "advanced", label: "Advanced", icon: <Cog size={17} /> },
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
    <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-150 ${
              isActive
                ? "bg-white/[0.07] text-white"
                : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-white"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`transition-colors ${isActive ? "text-white" : "text-white/30 group-hover:text-white/60"}`}>
              {tab.icon}
            </span>
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0c]">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08]">
            <Bug size={16} className="text-white/70" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90 tracking-tight">BioQuiz</h1>
            <p className="text-[10px] tracking-wider text-white/25 uppercase">Admin Panel</p>
          </div>
        </div>
        {navContent}
        <div className="border-t border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <p className="text-[10px] text-white/20">Real-time Firebase RTDB</p>
          </div>
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
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-[#0a0a0c] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08]">
                    <Bug size={16} className="text-white/70" />
                  </div>
                  <h1 className="text-sm font-semibold text-white/90">BioQuiz</h1>
                </div>
                <button onClick={onMobileClose} className="text-white/30 hover:text-white/60">
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
      className="rounded-md p-2 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70 md:hidden"
    >
      <Menu size={18} />
    </button>
  );
}
