"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { DEFAULT_CONFIG } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, Copy, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <SpotlightCard className="p-4 sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/60">
        {icon}
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </SpotlightCard>
  );
}

export function ExportTab({ config, updateConfig }: TabProps) {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const configJson = JSON.stringify(config, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = configJson;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bioquiz-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError("");
    setImportSuccess(false);

    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed !== "object" || parsed === null) {
        setImportError("Invalid config: must be a JSON object");
        return;
      }
      // Merge with defaults to ensure all fields exist
      const merged = { ...DEFAULT_CONFIG, ...parsed };
      if (parsed.notifPrefs && typeof parsed.notifPrefs === "object") {
        merged.notifPrefs = { ...DEFAULT_CONFIG.notifPrefs, ...parsed.notifPrefs };
      }
      updateConfig(merged);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (e) {
      setImportError("Invalid JSON: " + (e instanceof Error ? e.message : "Parse error"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Reset all settings to default values? This cannot be undone.")) {
      updateConfig(DEFAULT_CONFIG);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export */}
      <Section title="Export Configuration" icon={<Download size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Download or copy the current widget configuration as JSON. Use this to backup your settings or transfer between environments.
        </p>

        {/* Config preview */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Current Config</Label>
          <div className="relative">
            <Textarea
              value={configJson}
              readOnly
              className="min-h-[200px] font-mono text-[11px] text-white/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          >
            <Download size={14} />
            Download .json
          </button>
        </div>
      </Section>

      {/* Import */}
      <Section title="Import Configuration" icon={<Upload size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Paste JSON config or upload a .json file to replace current settings. Imported config will be merged with defaults.
        </p>

        <div className="space-y-2">
          <Label className="text-xs text-white/40">Paste Config JSON</Label>
          <Textarea
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setImportError(""); setImportSuccess(false); }}
            placeholder='{"accentColor": "#60a5fa", "defaultTheme": "pure-black", ...}'
            className="min-h-[160px] font-mono text-[11px]"
          />
        </div>

        {importError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2">
            <AlertTriangle size={14} className="text-red-400/70 shrink-0" />
            <span className="text-xs text-red-400/70">{importError}</span>
          </div>
        )}

        {importSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <Check size={14} className="text-white/50 shrink-0" />
            <span className="text-xs text-white/50">Configuration imported successfully!</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-30"
          >
            <Upload size={14} />
            Apply Config
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          >
            <Upload size={14} />
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </Section>

      {/* Reset */}
      <Section title="Reset" icon={<RotateCcw size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Reset all widget configuration to default values. This action cannot be undone.
        </p>
        <button
          onClick={handleResetToDefaults}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </Section>

      {/* Config summary */}
      <Section title="Config Summary">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Widget", value: config.widgetEnabled ? "Active" : "Disabled" },
            { label: "Theme", value: config.defaultTheme },
            { label: "Accent", value: config.accentColor },
            { label: "Char Limit", value: `${config.charLimit}` },
            { label: "Max Messages", value: `${config.maxMessages}` },
            { label: "Auto Open", value: config.autoOpen ? "Yes" : "No" },
            { label: "Profanity Filter", value: config.profanityFilter ? "On" : "Off" },
            { label: "Streaks", value: config.streaksEnabled ? "On" : "Off" },
            { label: "Maintenance", value: config.maintenanceEnabled ? "On" : "Off" },
            { label: "Disguise", value: config.disguiseEnabled ? "On" : "Off" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2">
              <span className="text-[11px] text-white/25">{item.label}</span>
              <span className="text-[11px] text-white/50 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
