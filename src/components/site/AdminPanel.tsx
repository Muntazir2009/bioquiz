"use client";

import { useState, useCallback } from "react";
import {
  ShieldCheck,
  HardDrive,
  Files,
  Download,
  Trash2,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { formatFileSize } from "@/lib/file-storage";

type AdminStats = {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  totalDownloads: number;
};

type AdminFile = {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  shareId: string;
  downloads: number;
  createdAt: string;
};

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthed(true);
        // Fetch stats
        const statsRes = await fetch("/api/admin", {
          headers: { "x-admin-password": password },
        });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setFiles(data.recentFiles);
        }
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/files/${id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (stats) {
        setStats({
          ...stats,
          totalFiles: stats.totalFiles - 1,
        });
      }
    },
    [stats]
  );

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground/5">
          <ShieldCheck className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold">Admin Access</h3>
          <p className="mt-1 text-xs text-muted-foreground">Enter password to continue</p>
        </div>
        <div className="w-full max-w-xs">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin password"
            className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground/30"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="mt-3 h-9 w-full rounded-lg bg-foreground text-background text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Verifying..." : "Access Panel"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="text-sm font-semibold">Admin Panel</h3>
          <p className="text-[11px] text-muted-foreground">Manage files and view stats</p>
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5">
              <Files className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-semibold tabular-nums">{stats.totalFiles}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Files</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-semibold tabular-nums">{stats.totalSizeFormatted}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Storage</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5">
              <Download className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-semibold tabular-nums">{stats.totalDownloads}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Downloads</span>
          </div>
        </div>
      )}

      {/* File management */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Files</span>
        </div>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {f.sizeFormatted} · {f.downloads} dl · {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">No files yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
