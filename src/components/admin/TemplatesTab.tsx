"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquareText, Plus, X, GripVertical } from "lucide-react";
import { useState } from "react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

const DEFAULT_TEMPLATES = "Help\nWhat is mitosis?\nExplain DNA replication\nCell division";

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

export function TemplatesTab({ config, updateConfig }: TabProps) {
  const templates = config.messageTemplates || DEFAULT_TEMPLATES;
  const templateList = templates.split("\n").filter((t) => t.trim());
  const [newTemplate, setNewTemplate] = useState("");

  const addTemplate = () => {
    const trimmed = newTemplate.trim();
    if (!trimmed) return;
    const updated = [...templateList, trimmed].join("\n");
    updateConfig({ messageTemplates: updated });
    setNewTemplate("");
  };

  const removeTemplate = (index: number) => {
    const updated = templateList.filter((_, i) => i !== index).join("\n");
    updateConfig({ messageTemplates: updated });
  };

  return (
    <div className="space-y-4">
      <Section title="Quick Reply Templates" icon={<MessageSquareText size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Configure quick reply suggestions shown in the chat. These appear as tappable chips above the input field.
        </p>

        {/* Current templates */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Active Templates ({templateList.length})</Label>
          <div className="space-y-1.5">
            {templateList.map((template, i) => (
              <div
                key={`${template}-${i}`}
                className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/[0.12]"
              >
                <GripVertical size={14} className="text-white/10 shrink-0" />
                <span className="flex-1 text-xs text-white/60 truncate">{template}</span>
                <button
                  onClick={() => removeTemplate(i)}
                  className="shrink-0 text-white/15 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add new template */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Add Template</Label>
          <div className="flex items-center gap-2">
            <Input
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Type a quick reply template"
              className="flex-1 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTemplate();
                }
              }}
            />
            <button
              onClick={addTemplate}
              disabled={!newTemplate.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Bulk edit */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Bulk Edit (one per line)</Label>
          <Textarea
            value={templates}
            onChange={(e) => updateConfig({ messageTemplates: e.target.value })}
            placeholder="One template per line"
            className="min-h-[120px] font-mono text-xs"
          />
        </div>
      </Section>

      {/* Preview */}
      <Section title="Preview">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] text-white/20 mb-3 uppercase tracking-wider">Quick Replies</p>
          <div className="flex flex-wrap gap-1.5">
            {templateList.map((template, i) => (
              <button
                key={i}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
