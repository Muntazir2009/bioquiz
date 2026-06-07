"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Filter, Clock, Zap, Users, Ban } from "lucide-react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

// ─── Helpers ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SpotlightCard className="p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-white/70">{title}</h3>
      <div className="space-y-5">{children}</div>
    </SpotlightCard>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-white/50">{label}</Label>
        {hint && <span className="text-[10px] text-white/25">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-xs text-white/50">{label}</Label>
        {hint && <p className="text-[10px] text-white/25 mt-0.5">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Moderation Tab ─────────────────────────────────────────

export function ModerationTab({ config, updateConfig }: TabProps) {
  return (
    <div className="space-y-4">
      {/* Content Filtering */}
      <Section title="Content Filtering">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-white/30" />
          <span className="text-[10px] text-white/25 uppercase tracking-wider">Message filters</span>
        </div>
        <Toggle
          label="Profanity Filter"
          hint="Blocks offensive language in messages"
          checked={config.profanityFilter}
          onChange={(v) => updateConfig({ profanityFilter: v })}
        />
        <Toggle
          label="Link Filter"
          hint="Prevents users from sharing URLs"
          checked={config.linkFilter}
          onChange={(v) => updateConfig({ linkFilter: v })}
        />
        <Toggle
          label="Spam Protection"
          hint="Blocks duplicate messages"
          checked={config.spamProtection}
          onChange={(v) => updateConfig({ spamProtection: v })}
        />
      </Section>

      {/* Slow Mode */}
      <Section title="Slow Mode">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-white/30" />
          <span className="text-[10px] text-white/25 uppercase tracking-wider">Message throttling</span>
        </div>
        <Toggle
          label="Enable Slow Mode"
          hint="Limits how fast users can send messages"
          checked={config.slowMode}
          onChange={(v) => updateConfig({ slowMode: v })}
        />
        {config.slowMode && (
          <Field label={`Slow Mode Interval — ${config.slowModeInterval}s`}>
            <Slider
              value={[config.slowModeInterval]}
              min={1}
              max={60}
              step={1}
              onValueChange={([v]) => updateConfig({ slowModeInterval: v })}
            />
          </Field>
        )}
      </Section>

      {/* Rate Limiting */}
      <Section title="Rate Limiting">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-white/30" />
          <span className="text-[10px] text-white/25 uppercase tracking-wider">Request limits</span>
        </div>
        <Toggle
          label="Enable Rate Limiting"
          hint="Limits messages per time window"
          checked={config.rateLimitEnabled}
          onChange={(v) => updateConfig({ rateLimitEnabled: v })}
        />
        {config.rateLimitEnabled && (
          <>
            <Field label={`Max Messages — ${config.rateLimitMessages}`}>
              <Slider
                value={[config.rateLimitMessages]}
                min={1}
                max={50}
                step={1}
                onValueChange={([v]) => updateConfig({ rateLimitMessages: v })}
              />
            </Field>
            <Field label={`Interval — ${config.rateLimitInterval}s`}>
              <Slider
                value={[config.rateLimitInterval]}
                min={5}
                max={120}
                step={1}
                onValueChange={([v]) => updateConfig({ rateLimitInterval: v })}
              />
            </Field>
          </>
        )}
      </Section>

      {/* Account Limits */}
      <Section title="Account Limits">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-white/30" />
          <span className="text-[10px] text-white/25 uppercase tracking-wider">Device restrictions</span>
        </div>
        <Field
          label="Max Accounts Per Device"
          hint="Prevents users from creating too many accounts on one device"
        >
          <Input
            type="number"
            min={1}
            max={10}
            value={config.maxAccounts}
            onChange={(e) => {
              const v = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
              updateConfig({ maxAccounts: v });
            }}
            className="w-24 text-xs"
          />
        </Field>
      </Section>
    </div>
  );
}
