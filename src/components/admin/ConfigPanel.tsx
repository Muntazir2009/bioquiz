"use client";

import { useCallback } from "react";
import type { WidgetConfig, QuickReply } from "@/lib/defaults";
import { GRADIENT_PRESETS } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { ShimmerButton } from "./ShimmerButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ConfigPanelProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
  activeTab: string;
}

// ─── Section wrapper ────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SpotlightCard className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white/70">{title}</h3>
      <div className="space-y-5">{children}</div>
    </SpotlightCard>
  );
}

// ─── Field row ──────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

// ─── Tab Content ────────────────────────────────────────────

function AppearanceTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Colors & Typography">
        <Field label="Primary Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <Input
              value={config.primaryColor}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="flex-1 font-mono text-xs"
            />
          </div>
        </Field>

        <Field label="Font Family">
          <Input
            value={config.fontFamily}
            onChange={(e) => updateConfig({ fontFamily: e.target.value })}
            className="text-xs"
          />
        </Field>

        <Field label={`Border Radius — ${config.borderRadius}px`}>
          <Slider
            value={[config.borderRadius]}
            min={0}
            max={32}
            step={2}
            onValueChange={([v]) => updateConfig({ borderRadius: v })}
          />
        </Field>
      </Section>

      <Section title="Layout">
        <Field label="Position">
          <Select
            value={config.position}
            onValueChange={(v) =>
              updateConfig({ position: v as WidgetConfig["position"] })
            }
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="top-left">Top Left</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Widget Size">
          <Select
            value={config.widgetSize}
            onValueChange={(v) =>
              updateConfig({ widgetSize: v as WidgetConfig["widgetSize"] })
            }
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Dark Mode">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.darkMode}
              onCheckedChange={(v) => updateConfig({ darkMode: v })}
            />
            <span className="text-xs text-white/40">
              {config.darkMode ? "On" : "Off"}
            </span>
          </div>
        </Field>
      </Section>

      <Section title="Custom CSS">
        <Field label="Inject custom styles" hint="Applied after all other styles">
          <Textarea
            value={config.customCSS}
            onChange={(e) => updateConfig({ customCSS: e.target.value })}
            placeholder="/* e.g. .bqp { border: 1px solid red; } */"
            className="min-h-[100px] font-mono text-xs"
          />
        </Field>
      </Section>
    </div>
  );
}

function BehaviorTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Auto Open">
        <Field label="Auto-open widget on page load">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.autoOpen}
              onCheckedChange={(v) => updateConfig({ autoOpen: v })}
            />
            <span className="text-xs text-white/40">
              {config.autoOpen ? "Enabled" : "Disabled"}
            </span>
          </div>
        </Field>

        {config.autoOpen && (
          <Field label={`Delay — ${(config.autoOpenDelay / 1000).toFixed(1)}s`}>
            <Slider
              value={[config.autoOpenDelay]}
              min={500}
              max={10000}
              step={500}
              onValueChange={([v]) => updateConfig({ autoOpenDelay: v })}
            />
          </Field>
        )}
      </Section>

      <Section title="Interaction">
        <Field label="Typing Indicator">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.typingIndicator}
              onCheckedChange={(v) => updateConfig({ typingIndicator: v })}
            />
            <span className="text-xs text-white/40">
              {config.typingIndicator ? "Show" : "Hide"}
            </span>
          </div>
        </Field>

        <Field label="Sound Effects">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.soundEnabled}
              onCheckedChange={(v) => updateConfig({ soundEnabled: v })}
            />
            <span className="text-xs text-white/40">
              {config.soundEnabled ? "On" : "Off"}
            </span>
          </div>
        </Field>

        <Field label="Persist Chat History">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.persistHistory}
              onCheckedChange={(v) => updateConfig({ persistHistory: v })}
            />
            <span className="text-xs text-white/40">
              {config.persistHistory ? "Yes" : "No"}
            </span>
          </div>
        </Field>

        <Separator className="bg-white/[0.04]" />

        <Field label={`Rate Limit — ${config.rateLimit} msg/min`} hint="0 = unlimited">
          <Slider
            value={[config.rateLimit]}
            min={0}
            max={60}
            step={5}
            onValueChange={([v]) => updateConfig({ rateLimit: v })}
          />
        </Field>
      </Section>
    </div>
  );
}

function WelcomeTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Bot Identity">
        <Field label="Bot Name">
          <Input
            value={config.botName}
            onChange={(e) => updateConfig({ botName: e.target.value })}
            className="text-xs"
          />
        </Field>

        <Field label="Avatar URL" hint="Leave empty for default">
          <Input
            value={config.avatarUrl}
            onChange={(e) => updateConfig({ avatarUrl: e.target.value })}
            placeholder="https://example.com/avatar.png"
            className="text-xs"
          />
        </Field>
      </Section>

      <Section title="Welcome Message">
        <Field label="Title">
          <Input
            value={config.welcomeTitle}
            onChange={(e) => updateConfig({ welcomeTitle: e.target.value })}
            className="text-xs"
          />
        </Field>

        <Field label="Subtitle">
          <Input
            value={config.welcomeSubtitle}
            onChange={(e) => updateConfig({ welcomeSubtitle: e.target.value })}
            className="text-xs"
          />
        </Field>
      </Section>

      <Section title="Background Gradient">
        <Field label="Gradient Preset">
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => updateConfig({ bgGradientPreset: preset.value })}
                className={`group relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all ${
                  config.bgGradientPreset === preset.value
                    ? "border-[#2EB9DF]/50 ring-1 ring-[#2EB9DF]/30"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <div
                  className="h-8 w-full rounded-md"
                  style={{ background: preset.css }}
                />
                <span className="text-[10px] text-white/40 group-hover:text-white/60">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </Field>
      </Section>
    </div>
  );
}

function QuickRepliesTab({ config, updateConfig }: ConfigPanelProps) {
  const addReply = useCallback(() => {
    const id = Date.now().toString(36);
    updateConfig({
      quickReplies: [...config.quickReplies, { id, label: "", message: "" }],
    });
  }, [config.quickReplies, updateConfig]);

  const removeReply = useCallback(
    (id: string) => {
      updateConfig({
        quickReplies: config.quickReplies.filter((r) => r.id !== id),
      });
    },
    [config.quickReplies, updateConfig],
  );

  const updateReply = useCallback(
    (id: string, field: keyof QuickReply, value: string) => {
      updateConfig({
        quickReplies: config.quickReplies.map((r) =>
          r.id === id ? { ...r, [field]: value } : r,
        ),
      });
    },
    [config.quickReplies, updateConfig],
  );

  return (
    <div className="space-y-4">
      <Section title="Quick Reply Buttons">
        <div className="space-y-3">
          {config.quickReplies.map((reply, i) => (
            <div
              key={reply.id}
              className="flex items-start gap-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3"
            >
              <span className="mt-1.5 text-[10px] text-white/20">#{i + 1}</span>
              <div className="flex-1 space-y-2">
                <Input
                  value={reply.label}
                  onChange={(e) => updateReply(reply.id, "label", e.target.value)}
                  placeholder="Button label"
                  className="text-xs"
                />
                <Input
                  value={reply.message}
                  onChange={(e) => updateReply(reply.id, "message", e.target.value)}
                  placeholder="Message sent on click"
                  className="text-xs"
                />
              </div>
              <button
                onClick={() => removeReply(reply.id)}
                className="mt-1.5 rounded-md p-1 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <ShimmerButton onClick={addReply}>
          <span className="flex items-center gap-1.5">
            <Plus size={14} /> Add Reply
          </span>
        </ShimmerButton>
      </Section>
    </div>
  );
}

function AIPersonaTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="System Prompt">
        <Field label="Instructions" hint="Defines the AI's behavior and personality">
          <Textarea
            value={config.systemPrompt}
            onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
            className="min-h-[140px] font-mono text-xs"
          />
        </Field>
      </Section>

      <Section title="Parameters">
        <Field label={`Temperature — ${config.temperature.toFixed(2)}`} hint="0 = precise, 1 = creative">
          <Slider
            value={[config.temperature * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => updateConfig({ temperature: v / 100 })}
          />
        </Field>

        <Field label="Fallback Message" hint="Shown when AI fails to respond">
          <Input
            value={config.fallbackMessage}
            onChange={(e) => updateConfig({ fallbackMessage: e.target.value })}
            className="text-xs"
          />
        </Field>
      </Section>

      <Section title="Worker Endpoint">
        <Field label="Cloudflare Worker URL">
          <Input
            value={config.workerUrl}
            onChange={(e) => updateConfig({ workerUrl: e.target.value })}
            placeholder="ask-ai.killermunu.workers.dev"
            className="font-mono text-xs"
          />
        </Field>
      </Section>
    </div>
  );
}

function AccessTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Master Kill Switch">
        <Field label="Widget Enabled" hint="Disables widget globally when off">
          <div className="flex items-center gap-3">
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => updateConfig({ enabled: v })}
            />
            <span
              className={`text-xs font-medium ${
                config.enabled ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {config.enabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
        </Field>
      </Section>

      <Section title="Allowed Domains">
        <Field
          label="Domain Whitelist"
          hint="One domain per line. Leave empty for all."
        >
          <Textarea
            value={config.allowedDomains}
            onChange={(e) => updateConfig({ allowedDomains: e.target.value })}
            placeholder={`example.com\nbioquiz.app\nlocalhost:3000`}
            className="min-h-[120px] font-mono text-xs"
          />
        </Field>
      </Section>
    </div>
  );
}

// ─── Main ConfigPanel ───────────────────────────────────────

export function ConfigPanel({ config, updateConfig, activeTab }: ConfigPanelProps) {
  const props: ConfigPanelProps = { config, updateConfig, activeTab };

  const tabMap: Record<string, React.ReactNode> = {
    appearance: <AppearanceTab {...props} />,
    behavior: <BehaviorTab {...props} />,
    welcome: <WelcomeTab {...props} />,
    "quick-replies": <QuickRepliesTab {...props} />,
    "ai-persona": <AIPersonaTab {...props} />,
    access: <AccessTab {...props} />,
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1.5">
      {tabMap[activeTab] ?? <p className="text-white/30">Select a tab</p>}
    </div>
  );
}
