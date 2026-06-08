"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Wrench, AlertTriangle, Clock } from "lucide-react";

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

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-xs text-white/40">{label}</Label>
        {hint && <p className="text-[10px] text-white/20 mt-0.5">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function MaintenanceTab({ config, updateConfig }: TabProps) {
  return (
    <div className="space-y-4">
      <Section title="Maintenance Mode" icon={<Wrench size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          When enabled, the widget shows a maintenance message instead of the chat interface. Useful during updates or migrations.
        </p>

        <Toggle
          label="Enable Maintenance Mode"
          hint="Shows maintenance banner instead of chat"
          checked={config.maintenanceEnabled}
          onChange={(v) => updateConfig({ maintenanceEnabled: v })}
        />

        {config.maintenanceEnabled && (
          <>
            <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400/70 shrink-0" />
              <span className="text-[11px] text-amber-400/70">
                Widget is currently in maintenance mode — users cannot access chat
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/40">Maintenance Message</Label>
              <Textarea
                value={config.maintenanceMessage}
                onChange={(e) => updateConfig({ maintenanceMessage: e.target.value })}
                placeholder="Under maintenance. Please check back soon."
                className="min-h-[80px] text-xs"
              />
            </div>
          </>
        )}
      </Section>

      {/* Preview of maintenance state */}
      {config.maintenanceEnabled && (
        <Section title="Maintenance Preview">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Wrench size={20} className="text-white/40" />
            </div>
            <p className="text-sm text-white/60 mb-1">Maintenance Mode</p>
            <p className="text-xs text-white/30 max-w-[240px] mx-auto">
              {config.maintenanceMessage || "Under maintenance. Please check back soon."}
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Clock size={10} className="text-white/15" />
              <span className="text-[10px] text-white/15">Estimated downtime unknown</span>
            </div>
          </div>
        </Section>
      )}

      {/* Status */}
      <Section title="System Status">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-white/30">Widget</span>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${config.widgetEnabled ? "bg-white/50" : "bg-red-400/70"}`} />
              <span className={`text-xs ${config.widgetEnabled ? "text-white/50" : "text-red-400/70"}`}>
                {config.widgetEnabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
            <span className="text-xs text-white/30">Maintenance</span>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${config.maintenanceEnabled ? "bg-amber-400/70" : "bg-white/30"}`} />
              <span className={`text-xs ${config.maintenanceEnabled ? "text-amber-400/70" : "text-white/30"}`}>
                {config.maintenanceEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
            <span className="text-xs text-white/30">Disguise Mode</span>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${config.disguiseEnabled ? "bg-amber-400/70" : "bg-white/30"}`} />
              <span className={`text-xs ${config.disguiseEnabled ? "text-amber-400/70" : "text-white/30"}`}>
                {config.disguiseEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
            <span className="text-xs text-white/30">Debug Mode</span>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${config.debugMode ? "bg-amber-400/70" : "bg-white/30"}`} />
              <span className={`text-xs ${config.debugMode ? "text-amber-400/70" : "text-white/30"}`}>
                {config.debugMode ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
