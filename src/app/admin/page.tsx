"use client";

import { useState, useEffect, useCallback, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWidgetConfig } from "@/lib/useWidgetConfig";
import { Sidebar, MobileMenuButton, TABS } from "@/components/admin/Sidebar";
import { ConfigPanel } from "@/components/admin/ConfigPanel";
import { LivePreview } from "@/components/admin/LivePreview";
import { SyncBadge } from "@/components/admin/SyncBadge";
import { BackgroundBeams } from "@/components/admin/BackgroundBeams";
import { SpotlightCard } from "@/components/admin/SpotlightCard";
import { Shield, Eye, EyeOff, Bug, Lock, AlertTriangle, PanelRightClose, PanelRight } from "lucide-react";

// ─── Auth Config ────────────────────────────────────────────
const ADMIN_PASSWORD = "1306";
const SESSION_KEY = "bq_admin_auth";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > SESSION_DURATION) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return data.ok === true;
  } catch {
    return false;
  }
}

function setAuth() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
}

function clearAuth() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ═══════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════

function LoginPage({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuth();
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setAttempts((p) => p + 1);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#060608]">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#2EB9DF]/[0.03] blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-[#2EB9DF]/[0.02] blur-[120px]" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <BackgroundBeams />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <SpotlightCard className="p-6 sm:p-8" spotlightColor="rgba(46, 185, 223, 0.08)">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 animate-pulse rounded-full bg-[#2EB9DF]/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2EB9DF]/20 bg-[#2EB9DF]/10">
                <Shield size={28} className="text-[#2EB9DF]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bug size={16} className="text-[#2EB9DF]/60" />
              <h1 className="text-lg font-semibold tracking-tight text-white/90">BioQuiz Admin</h1>
            </div>
            <p className="mt-1.5 text-xs text-white/25">Widget Configuration Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-white/30">
                <Lock size={10} />
                Password
              </label>
              <div className="group relative">
                <input
                  ref={inputRef}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className={`w-full rounded-lg border bg-white/[0.03] px-4 py-3 pr-11 font-mono text-sm text-white/80 placeholder:text-white/15 outline-none transition-all focus:border-[#2EB9DF]/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#2EB9DF]/20 ${
                    error ? "border-red-500/50 ring-1 ring-red-500/30" : "border-white/[0.06]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white/40"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2"
                >
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span className="text-xs text-red-400/80">
                    Wrong password{attempts > 2 ? `. ${attempts} failed attempts.` : "."}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold transition-all ${
                shake
                  ? "animate-shake border border-red-500/30 bg-red-500/10 text-red-400"
                  : "bg-[#2EB9DF] text-[#060608] hover:bg-[#2EB9DF]/90"
              }`}
            >
              <span
                className="absolute inset-0 z-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Lock size={14} />
                Authenticate
              </span>
            </motion.button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-white/15">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <span className="uppercase tracking-widest">Secured Session</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════════════════════

function AdminPanel() {
  const { config, updateConfig, syncStatus, loaded } = useWidgetConfig();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

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
      <BackgroundBeams />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
      />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Config panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-white/[0.04] bg-[#060608]/60 px-4 py-3 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
              <MobileMenuButton onClick={() => setMobileNav(true)} />
              <h2 className="text-sm font-medium text-white/70">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <SyncBadge status={syncStatus} />
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className={`hidden sm:flex rounded-md px-3 py-1.5 text-xs transition-colors items-center gap-1.5 ${
                  previewOpen
                    ? "bg-[#2EB9DF]/15 text-[#2EB9DF]"
                    : "bg-white/[0.03] text-white/40 hover:text-white/60"
                }`}
              >
                {previewOpen ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
                Preview
              </button>
              <button
                onClick={() => { clearAuth(); window.location.reload(); }}
                className="rounded-md bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <span className="hidden sm:inline">Logout</span>
                <Lock size={14} className="sm:hidden" />
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

        {/* Live preview — desktop only */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:block shrink-0 overflow-hidden border-l border-white/[0.04]"
            >
              <LivePreview config={config} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE — login gate
// ═══════════════════════════════════════════════════════════

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isAuth = isAuthenticated();
    startTransition(() => {
      if (isAuth) setAuthed(true);
      setChecking(false);
    });
  }, []);

  const handleAuth = useCallback(() => {
    setAuthed(true);
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060608]">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2EB9DF]/30 border-t-[#2EB9DF]" />
      </div>
    );
  }

  if (!authed) {
    return <LoginPage onAuth={handleAuth} />;
  }

  return <AdminPanel />;
}
