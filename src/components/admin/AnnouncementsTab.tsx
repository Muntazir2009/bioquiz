"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, MessageSquare, Flame, Hand } from "lucide-react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

// ─── Helpers ────────────────────────────────────────────────

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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-white/40">{label}</Label>
        {hint && <span className="text-[10px] text-white/20">{hint}</span>}
      </div>
      {children}
    </div>
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

// ─── Announcements Tab ──────────────────────────────────────

export function AnnouncementsTab({ config, updateConfig }: TabProps) {
  return (
    <div className="space-y-4">
      {/* Announcement Banner */}
      <Section title="Announcement Banner" icon={<Megaphone size={14} className="text-white/30" />}>
        <Toggle
          label="Enable Announcement"
          hint="Shows a banner at the top of the chat"
          checked={config.announcementEnabled}
          onChange={(v) => updateConfig({ announcementEnabled: v })}
        />
        {config.announcementEnabled && (
          <>
            <Field label="Announcement Text" hint={`${config.announcementText.length}/200`}>
              <Textarea
                value={config.announcementText}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    updateConfig({ announcementText: e.target.value });
                  }
                }}
                maxLength={200}
                className="min-h-[80px] text-xs"
                placeholder="Enter announcement text..."
              />
            </Field>
            <Field label="Banner Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.announcementColor}
                  onChange={(e) => updateConfig({ announcementColor: e.target.value })}
                  className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                <Input
                  value={config.announcementColor}
                  onChange={(e) => updateConfig({ announcementColor: e.target.value })}
                  className="flex-1 font-mono text-xs"
                />
              </div>
              <div
                className="mt-2 h-6 rounded-md"
                style={{ backgroundColor: config.announcementColor }}
              />
            </Field>
            <Toggle
              label="Allow Dismiss"
              hint="Users can close the banner"
              checked={config.announcementDismiss}
              onChange={(v) => updateConfig({ announcementDismiss: v })}
            />
          </>
        )}
      </Section>

      {/* Welcome Message */}
      <Section title="Welcome Message" icon={<MessageSquare size={14} className="text-white/30" />}>
        <Toggle
          label="Enable Welcome Message"
          hint="Shows a greeting to new users"
          checked={config.welcomeEnabled}
          onChange={(v) => updateConfig({ welcomeEnabled: v })}
        />
        {config.welcomeEnabled && (
          <>
            <Field label="Welcome Message">
              <Textarea
                value={config.welcomeMessage}
                onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                className="min-h-[80px] text-xs"
                placeholder="Welcome to BioQuiz Chat! 🧬"
              />
            </Field>
            <Field label={`Welcome Delay — ${(config.welcomeDelay / 1000).toFixed(1)}s`}>
              <Slider
                value={[config.welcomeDelay]}
                min={0}
                max={10000}
                step={500}
                onValueChange={([v]) => updateConfig({ welcomeDelay: v })}
              />
            </Field>
          </>
        )}
      </Section>

      {/* Streak Settings */}
      <Section title="Streak Settings" icon={<Flame size={14} className="text-white/30" />}>
        <Toggle
          label="Enable Streaks"
          hint="Track daily visit streaks"
          checked={config.streaksEnabled}
          onChange={(v) => updateConfig({ streaksEnabled: v })}
        />
        {config.streaksEnabled && (
          <>
            <Field label={`Freeze Days Per Month — ${config.streakFreezeDays}`}>
              <Slider
                value={[config.streakFreezeDays]}
                min={0}
                max={7}
                step={1}
                onValueChange={([v]) => updateConfig({ streakFreezeDays: v })}
              />
            </Field>
            <Field label={`Streak Multiplier — ${config.streakMultiplier}x`}>
              <Slider
                value={[config.streakMultiplier]}
                min={1}
                max={5}
                step={0.5}
                onValueChange={([v]) => updateConfig({ streakMultiplier: v })}
              />
            </Field>
            <Field label="Reward Message" hint="Use {days} as placeholder for streak count">
              <Input
                value={config.streakRewardMessage}
                onChange={(e) => updateConfig({ streakRewardMessage: e.target.value })}
                className="text-xs"
                placeholder="🔥 Amazing! You're on a {days}-day streak!"
              />
            </Field>
          </>
        )}
      </Section>
    </div>
  );
}
