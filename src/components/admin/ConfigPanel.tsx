"use client";

import { useCallback } from "react";
import type { WidgetConfig, NotifPrefs } from "@/lib/defaults";
import { WIDGET_THEMES, STATUS_OPTIONS } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { DashboardTab } from "./DashboardTab";
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
import { ModerationTab } from "./ModerationTab";
import { AnnouncementsTab } from "./AnnouncementsTab";
import { ReactionsTab } from "./ReactionsTab";
import { TemplatesTab } from "./TemplatesTab";
import { MaintenanceTab } from "./MaintenanceTab";
import { ActivityLogTab } from "./ActivityLogTab";
import { ExportTab } from "./ExportTab";
import {
  Circle,
  BookOpen,
  Clock,
  Minus,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpLeft,
} from "lucide-react";

interface ConfigPanelProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
  activeTab: string;
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

// ─── Status Icon Helper ─────────────────────────────────────

function StatusIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case "circle":
      return <Circle size={10} fill={color} stroke={color} />;
    case "book":
      return <BookOpen size={12} style={{ color }} />;
    case "clock":
      return <Clock size={12} style={{ color }} />;
    case "minus":
      return <Minus size={12} style={{ color }} />;
    default:
      return <Circle size={10} fill={color} stroke={color} />;
  }
}

// ─── Position Icon Helper ───────────────────────────────────

function PositionIcon({ pos }: { pos: string }) {
  const size = 12;
  const cls = "text-white/40";
  switch (pos) {
    case "bottom-right":
      return <ArrowDownRight size={size} className={cls} />;
    case "bottom-left":
      return <ArrowDownLeft size={size} className={cls} />;
    case "top-right":
      return <ArrowUpRight size={size} className={cls} />;
    case "top-left":
      return <ArrowUpLeft size={size} className={cls} />;
    default:
      return <ArrowDownRight size={size} className={cls} />;
  }
}

// ─── 1. APPEARANCE ──────────────────────────────────────────

function AppearanceTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Accent Colors">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Accent" hint="--bq-accent">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </Field>
          <Field label="Secondary Accent" hint="--bq-accent-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.accent2Color}
                onChange={(e) => updateConfig({ accent2Color: e.target.value })}
                className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={config.accent2Color}
                onChange={(e) => updateConfig({ accent2Color: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Background & Text">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Background" hint="--bq-bg">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.bgColor}
                onChange={(e) => updateConfig({ bgColor: e.target.value })}
                className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={config.bgColor}
                onChange={(e) => updateConfig({ bgColor: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </Field>
          <Field label="Elevated BG" hint="--bq-bg-elevated">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.bgElevated}
                onChange={(e) => updateConfig({ bgElevated: e.target.value })}
                className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={config.bgElevated}
                onChange={(e) => updateConfig({ bgElevated: e.target.value })}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </Field>
        </div>
        <Field label="Text Color" hint="--bq-text">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.textColor}
              onChange={(e) => updateConfig({ textColor: e.target.value })}
              className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <Input
              value={config.textColor}
              onChange={(e) => updateConfig({ textColor: e.target.value })}
              className="flex-1 font-mono text-xs"
            />
          </div>
        </Field>
      </Section>

      <Section title="Layout & Typography">
        <Field label={`Border Radius — ${config.borderRadius}px`} hint="--bq-radius">
          <Slider
            value={[config.borderRadius]}
            min={0}
            max={28}
            step={2}
            onValueChange={([v]) => updateConfig({ borderRadius: v })}
          />
        </Field>

        <Field label="Font Size">
          <Select
            value={config.fontSize}
            onValueChange={(v) => updateConfig({ fontSize: v as WidgetConfig["fontSize"] })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small (12px)</SelectItem>
              <SelectItem value="md">Medium (13.5px)</SelectItem>
              <SelectItem value="lg">Large (16px)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Bubble Style">
          <Select
            value={config.bubbleStyle}
            onValueChange={(v) => updateConfig({ bubbleStyle: v as WidgetConfig["bubbleStyle"] })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="My Bubble Gradient" hint="--bq-bubble-mine">
          <Input
            value={config.bubbleMine}
            onChange={(e) => updateConfig({ bubbleMine: e.target.value })}
            className="font-mono text-xs"
          />
          <div
            className="mt-2 h-6 rounded-md"
            style={{ background: config.bubbleMine }}
          />
        </Field>

        <Field label="Open Animation">
          <Select
            value={config.openAnimation}
            onValueChange={(v) => updateConfig({ openAnimation: v as WidgetConfig["openAnimation"] })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="scale">Scale</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Close Animation">
          <Select
            value={config.closeAnimation}
            onValueChange={(v) => updateConfig({ closeAnimation: v as WidgetConfig["closeAnimation"] })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="scale">Scale</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="Widget Position & Size">
        <Field label="Bubble Position">
          <div className="grid grid-cols-2 gap-2">
            {(["bottom-right", "bottom-left", "top-right", "top-left"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => updateConfig({ widgetPosition: pos })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                  config.widgetPosition === pos
                    ? "border-white/20 bg-white/[0.06] text-white/80"
                    : "border-white/[0.06] text-white/40 hover:border-white/[0.12]"
                }`}
              >
                <PositionIcon pos={pos} />
                <span className="capitalize">{pos.replace("-", " ")}</span>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`Offset X — ${config.widgetOffsetX}px`} hint="Horizontal distance from edge">
            <Slider
              value={[config.widgetOffsetX]}
              min={8}
              max={60}
              step={4}
              onValueChange={([v]) => updateConfig({ widgetOffsetX: v })}
            />
          </Field>
          <Field label={`Offset Y — ${config.widgetOffsetY}px`} hint="Vertical distance from edge">
            <Slider
              value={[config.widgetOffsetY]}
              min={8}
              max={60}
              step={4}
              onValueChange={([v]) => updateConfig({ widgetOffsetY: v })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label={`Bubble — ${config.bubbleSize}px`} hint="Chat bubble size">
            <Slider
              value={[config.bubbleSize]}
              min={40}
              max={72}
              step={4}
              onValueChange={([v]) => updateConfig({ bubbleSize: v })}
            />
          </Field>
          <Field label={`Width — ${config.panelWidth}px`} hint="Panel width">
            <Slider
              value={[config.panelWidth]}
              min={320}
              max={520}
              step={20}
              onValueChange={([v]) => updateConfig({ panelWidth: v })}
            />
          </Field>
          <Field label={`Height — ${config.panelHeight}px`} hint="Panel height">
            <Slider
              value={[config.panelHeight]}
              min={400}
              max={800}
              step={20}
              onValueChange={([v]) => updateConfig({ panelHeight: v })}
            />
          </Field>
        </div>
      </Section>

      <Section title="Sound & Haptics">
        <Field label="Message Sound">
          <Select
            value={config.messageSound}
            onValueChange={(v) => updateConfig({ messageSound: v })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="none">None (Silent)</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="chime">Chime</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Toggle label="Send Sound" hint="Play sound when sending a message" checked={config.sendSound} onChange={(v) => updateConfig({ sendSound: v })} />
        <Toggle label="Haptic Feedback" hint="Vibration on mobile interactions" checked={config.hapticFeedback} onChange={(v) => updateConfig({ hapticFeedback: v })} />
      </Section>
    </div>
  );
}

// ─── 2. THEMES ──────────────────────────────────────────────

function ThemesTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Default Theme for New Users">
        <p className="text-xs text-white/25 mb-3">
          Users can override this in their own settings. This sets the default when they first visit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WIDGET_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateConfig({ defaultTheme: theme.id })}
              className={`group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all ${
                config.defaultTheme === theme.id
                  ? "border-white/20 ring-1 ring-white/10 bg-white/[0.04]"
                  : "border-white/[0.06] hover:border-white/[0.12] bg-white/[0.01]"
              }`}
            >
              {/* Theme preview strip */}
              <div className="flex gap-1.5">
                <div
                  className="h-10 w-10 rounded-lg border border-white/10 shrink-0"
                  style={{ backgroundColor: theme.preview }}
                />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div
                    className="h-3 rounded-full w-3/4"
                    style={{ backgroundColor: theme.accent, opacity: 0.3 }}
                  />
                  <div className="h-2 rounded-full w-1/2 bg-white/10" />
                  <div className="h-2 rounded-full w-2/3 bg-white/5" />
                </div>
                <div
                  className="h-10 w-16 rounded-lg shrink-0 flex items-center justify-center text-[8px] font-bold"
                  style={{ background: theme.id === "golden" ? "linear-gradient(135deg,#d4a056,#8a5a1f)" : "linear-gradient(135deg,#fff,#888)", color: "#000" }}
                >
                  BQ
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white/80 truncate">{theme.name}</p>
                  {config.defaultTheme === theme.id && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/60 uppercase">Active</span>
                  )}
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Online Indicators">
        <Toggle
          label="Show Online Count"
          hint="Display number of online users in header"
          checked={config.showOnlineCount}
          onChange={(v) => updateConfig({ showOnlineCount: v })}
        />
        <Toggle
          label="Show Typing Indicator"
          hint="Show 'X is typing' for all users"
          checked={config.showTypingIndicator}
          onChange={(v) => updateConfig({ showTypingIndicator: v })}
        />
      </Section>
    </div>
  );
}

// ─── 3. BEHAVIOR ────────────────────────────────────────────

function BehaviorTab({ config, updateConfig }: ConfigPanelProps) {
  const updateNotif = useCallback(
    (key: keyof NotifPrefs, value: boolean) => {
      updateConfig({ notifPrefs: { ...config.notifPrefs, [key]: value } });
    },
    [config.notifPrefs, updateConfig],
  );

  return (
    <div className="space-y-4">
      <Section title="Auto Open">
        <Toggle
          label="Auto-open widget on page load"
          checked={config.autoOpen}
          onChange={(v) => updateConfig({ autoOpen: v })}
        />
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

      <Section title="Chat Behavior">
        <Toggle label="Typing Indicator" checked={config.typingIndicator} onChange={(v) => updateConfig({ typingIndicator: v })} />
        <Toggle label="Read Receipts" hint="Shows ✓✓ when message is read" checked={config.readReceipts} onChange={(v) => updateConfig({ readReceipts: v })} />
        <Separator className="bg-white/[0.04]" />
        <Field label={`Character Limit — ${config.charLimit}`} hint="Max chars per message">
          <Slider
            value={[config.charLimit]}
            min={100}
            max={2000}
            step={10}
            onValueChange={([v]) => updateConfig({ charLimit: v })}
          />
        </Field>
        <Field label={`Messages Per Chat — ${config.maxMessages}`} hint="Max messages fetched">
          <Slider
            value={[config.maxMessages]}
            min={10}
            max={200}
            step={10}
            onValueChange={([v]) => updateConfig({ maxMessages: v })}
          />
        </Field>
      </Section>

      <Section title="Chat Features">
        <Toggle label="Image Upload" hint="Allow users to send images" checked={config.imageUpload} onChange={(v) => updateConfig({ imageUpload: v })} />
        <Toggle label="Voice Messages" hint="Allow audio messages" checked={config.voiceMessages} onChange={(v) => updateConfig({ voiceMessages: v })} />
        <Toggle label="File Sharing" hint="Allow document sharing" checked={config.fileSharing} onChange={(v) => updateConfig({ fileSharing: v })} />
      </Section>

      <Section title="Notifications">
        <Toggle label="In-App Banners" checked={config.notifPrefs.inApp} onChange={(v) => updateNotif("inApp", v)} />
        <Toggle label="Push Notifications" hint="Browser native push" checked={config.notifPrefs.push} onChange={(v) => updateNotif("push", v)} />
        <Toggle label="Sound" checked={config.notifPrefs.sound} onChange={(v) => updateNotif("sound", v)} />
        <Separator className="bg-white/[0.04]" />
        <Toggle label="Global Chat Alerts" checked={config.notifPrefs.globalChat} onChange={(v) => updateNotif("globalChat", v)} />
        <Toggle label="DM Alerts" checked={config.notifPrefs.dms} onChange={(v) => updateNotif("dms", v)} />
        <Toggle label="Mention Alerts" hint="@username pings" checked={config.notifPrefs.mentions} onChange={(v) => updateNotif("mentions", v)} />
      </Section>

      <Section title="Privacy">
        <Toggle label="Show Read Receipts" hint="Let users see when messages are read" checked={config.showReadReceipts} onChange={(v) => updateConfig({ showReadReceipts: v })} />
        <Toggle label="Show Presence" hint="Show when users are online" checked={config.showPresence} onChange={(v) => updateConfig({ showPresence: v })} />
        <Toggle label="Allow Delete Messages" hint="Users can delete their own messages" checked={config.allowDeleteMessages} onChange={(v) => updateConfig({ allowDeleteMessages: v })} />
      </Section>

      <Section title="Disappearing Messages">
        <Toggle
          label="Enable Disappearing Messages"
          hint="Messages auto-delete after TTL"
          checked={config.disappearingEnabled}
          onChange={(v) => updateConfig({ disappearingEnabled: v })}
        />
        {config.disappearingEnabled && (
          <Field label={`Default TTL — ${(config.disappearDefaultTtl / 60000).toFixed(0)} min`}>
            <Slider
              value={[config.disappearDefaultTtl]}
              min={60000}
              max={86400000}
              step={300000}
              onValueChange={([v]) => updateConfig({ disappearDefaultTtl: v })}
            />
          </Field>
        )}
      </Section>
    </div>
  );
}

// ─── 4. PROFILE ─────────────────────────────────────────────

function ProfileTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Bot Identity">
        <div className="flex items-start gap-4">
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ backgroundColor: config.accentColor }}
            >
              {config.botInitials || "BQ"}
            </div>
            <span className="text-[10px] text-white/20">Avatar</span>
          </div>
          <div className="flex-1 space-y-4">
            <Field label="Display Name">
              <Input
                value={config.botName}
                onChange={(e) => updateConfig({ botName: e.target.value })}
                className="text-xs"
              />
            </Field>
            <Field label="Initials" hint="2-char avatar text">
              <Input
                value={config.botInitials}
                onChange={(e) => updateConfig({ botInitials: e.target.value })}
                maxLength={2}
                className="w-20 text-xs text-center"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Status & Bio">
        <Field label="Status">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => updateConfig({ botStatus: s.id as WidgetConfig["botStatus"] })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                  config.botStatus === s.id
                    ? "border-white/20 bg-white/[0.06] text-white/80"
                    : "border-white/[0.06] text-white/40 hover:border-white/[0.12]"
                }`}
              >
                <StatusIcon type={s.iconType} color={s.color} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Bio">
          <Textarea
            value={config.botBio}
            onChange={(e) => updateConfig({ botBio: e.target.value })}
            className="min-h-[80px] text-xs"
          />
        </Field>

        <Field label="Banner Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.botBannerColor}
              onChange={(e) => updateConfig({ botBannerColor: e.target.value })}
              className="h-9 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <Input
              value={config.botBannerColor}
              onChange={(e) => updateConfig({ botBannerColor: e.target.value })}
              className="flex-1 font-mono text-xs"
            />
          </div>
          <div
            className="mt-2 h-8 rounded-lg"
            style={{ background: `linear-gradient(135deg, ${config.botBannerColor}, ${config.accentColor})` }}
          />
        </Field>
      </Section>
    </div>
  );
}

// ─── 5. SECURITY ────────────────────────────────────────────

function SecurityTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Master Kill Switch">
        <Toggle
          label="Widget Enabled"
          hint="Disables widget globally when off — users see nothing"
          checked={config.widgetEnabled}
          onChange={(v) => updateConfig({ widgetEnabled: v })}
        />
        <div className={`mt-2 rounded-lg px-3 py-2 text-xs font-medium text-center ${
          config.widgetEnabled
            ? "bg-white/[0.04] text-white/50"
            : "bg-red-500/10 text-red-400"
        }`}>
          {config.widgetEnabled ? "WIDGET ACTIVE" : "WIDGET DISABLED"}
        </div>
      </Section>

      <Section title="Disguise Mode">
        <Toggle
          label="Calculator Disguise"
          hint="Shows a fake calculator until PIN is entered"
          checked={config.disguiseEnabled}
          onChange={(v) => updateConfig({ disguiseEnabled: v })}
        />
        {config.disguiseEnabled && (
          <Field label="Widget PIN" hint="PIN to unlock the disguise">
            <Input
              type="password"
              value={config.widgetPin}
              onChange={(e) => updateConfig({ widgetPin: e.target.value })}
              maxLength={6}
              className="w-32 font-mono text-sm tracking-[0.3em]"
            />
          </Field>
        )}
      </Section>

      <Section title="DM Lock">
        <Toggle
          label="DM PIN Lock"
          hint="Require a PIN to open DM conversations"
          checked={config.dmLockEnabled}
          onChange={(v) => updateConfig({ dmLockEnabled: v })}
        />
      </Section>

      <Section title="Allowed Domains">
        <Field
          label="Domain Whitelist"
          hint="One domain per line. Leave empty for all domains."
        >
          <Textarea
            value={config.allowedDomains}
            onChange={(e) => updateConfig({ allowedDomains: e.target.value })}
            placeholder={`bioquiz.app\nlocalhost:3000`}
            className="min-h-[100px] font-mono text-xs"
          />
        </Field>
      </Section>
    </div>
  );
}

// ─── 6. ADVANCED ────────────────────────────────────────────

function AdvancedTab({ config, updateConfig }: ConfigPanelProps) {
  return (
    <div className="space-y-4">
      <Section title="Worker & API">
        <Field label="Cloudflare Worker URL" hint="AI backend endpoint">
          <Input
            value={config.workerUrl}
            onChange={(e) => updateConfig({ workerUrl: e.target.value })}
            placeholder="ask-ai.killermunu.workers.dev"
            className="font-mono text-xs"
          />
        </Field>
        <Field label="Giphy API Key" hint="For GIF search in chat">
          <Input
            value={config.giphyApiKey}
            onChange={(e) => updateConfig({ giphyApiKey: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="Image Host URL" hint="Leave empty for default">
          <Input
            value={config.imageHost}
            onChange={(e) => updateConfig({ imageHost: e.target.value })}
            placeholder="https://img.example.com"
            className="font-mono text-xs"
          />
        </Field>
      </Section>

      <Section title="Custom CSS">
        <Field label="Inject custom styles" hint="Applied as CSS custom properties on #bqp">
          <Textarea
            value={config.customCSS}
            onChange={(e) => updateConfig({ customCSS: e.target.value })}
            placeholder={`/* e.g. --bq-accent: #ff6b6b; */\n/* or: .bqp { border: 1px solid red; } */`}
            className="min-h-[120px] font-mono text-xs"
          />
        </Field>
      </Section>

      <Section title="Emoji Settings">
        <Field label="Default Skin Tone">
          <Select
            value={config.emojiSkinTone}
            onValueChange={(v) => updateConfig({ emojiSkinTone: v as WidgetConfig["emojiSkinTone"] })}
          >
            <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="medium-light">Medium Light</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="medium-dark">Medium Dark</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Toggle label="Frequent Emoji Tracking" hint="Track and suggest frequently used emojis" checked={config.frequentEmojiTracking} onChange={(v) => updateConfig({ frequentEmojiTracking: v })} />
      </Section>

      <Section title="Debug">
        <Toggle
          label="Debug Mode"
          hint="Enables verbose console logging"
          checked={config.debugMode}
          onChange={(v) => updateConfig({ debugMode: v })}
        />
      </Section>
    </div>
  );
}

// ─── MAIN CONFIG PANEL ──────────────────────────────────────

export function ConfigPanel({ config, updateConfig, activeTab }: ConfigPanelProps) {
  const props: ConfigPanelProps = { config, updateConfig, activeTab };

  const tabMap: Record<string, React.ReactNode> = {
    dashboard: <DashboardTab config={config} updateConfig={updateConfig} />,
    appearance: <AppearanceTab {...props} />,
    themes: <ThemesTab {...props} />,
    behavior: <BehaviorTab {...props} />,
    profile: <ProfileTab {...props} />,
    security: <SecurityTab {...props} />,
    advanced: <AdvancedTab {...props} />,
    moderation: <ModerationTab config={config} updateConfig={updateConfig} />,
    announcements: <AnnouncementsTab config={config} updateConfig={updateConfig} />,
    reactions: <ReactionsTab config={config} updateConfig={updateConfig} />,
    templates: <TemplatesTab config={config} updateConfig={updateConfig} />,
    maintenance: <MaintenanceTab config={config} updateConfig={updateConfig} />,
    activity: <ActivityLogTab config={config} updateConfig={updateConfig} />,
    export: <ExportTab config={config} updateConfig={updateConfig} />,
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-5 sm:px-6 [&::-webkit-scrollbar]:w-1.5">
      {tabMap[activeTab] ?? <p className="text-white/30">Select a tab</p>}
    </div>
  );
}
