"use client";

import type { WidgetConfig } from "@/lib/defaults";
import { SpotlightCard } from "./SpotlightCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Smile, Plus, X, Shuffle } from "lucide-react";
import { useState } from "react";

interface TabProps {
  config: WidgetConfig;
  updateConfig: (partial: Partial<WidgetConfig>) => void;
}

const DEFAULT_REACTIONS = "❤️,😂,👍,😮,🎉,🤔,👏,💯";

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

export function ReactionsTab({ config, updateConfig }: TabProps) {
  const reactions = config.customReactions || DEFAULT_REACTIONS;
  const emojiList = reactions.split(",").map((e) => e.trim()).filter(Boolean);
  const [newEmoji, setNewEmoji] = useState("");

  const addEmoji = (emoji: string) => {
    const trimmed = emoji.trim();
    if (!trimmed || emojiList.includes(trimmed)) return;
    const updated = [...emojiList, trimmed].join(",");
    updateConfig({ customReactions: updated });
    setNewEmoji("");
  };

  const removeEmoji = (index: number) => {
    const updated = emojiList.filter((_, i) => i !== index).join(",");
    updateConfig({ customReactions: updated });
  };

  const moveEmoji = (from: number, to: number) => {
    if (to < 0 || to >= emojiList.length) return;
    const arr = [...emojiList];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    updateConfig({ customReactions: arr.join(",") });
  };

  const resetToDefault = () => {
    updateConfig({ customReactions: DEFAULT_REACTIONS });
  };

  return (
    <div className="space-y-4">
      <Section title="Reaction Picker" icon={<Smile size={14} className="text-white/30" />}>
        <p className="text-xs text-white/25 mb-4">
          Configure which emojis appear in the message reaction picker. Drag to reorder. These replace the default set in chat-widget.js.
        </p>

        {/* Current reactions */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Active Reactions ({emojiList.length})</Label>
          <div className="flex flex-wrap gap-2">
            {emojiList.map((emoji, i) => (
              <div
                key={`${emoji}-${i}`}
                className="group relative flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-lg transition-colors hover:border-white/[0.12]"
              >
                <span>{emoji}</span>
                <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveEmoji(i, i - 1)}
                    className="text-white/20 hover:text-white/50 text-[10px] disabled:opacity-20"
                    disabled={i === 0}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveEmoji(i, i + 1)}
                    className="text-white/20 hover:text-white/50 text-[10px] disabled:opacity-20"
                    disabled={i === emojiList.length - 1}
                  >
                    →
                  </button>
                  <button
                    onClick={() => removeEmoji(i)}
                    className="text-white/20 hover:text-red-400 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add new emoji */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Add Reaction</Label>
          <div className="flex items-center gap-2">
            <Input
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="Type or paste an emoji"
              className="flex-1 text-lg text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmoji(newEmoji);
                }
              }}
            />
            <button
              onClick={() => addEmoji(newEmoji)}
              disabled={!newEmoji.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Quick add suggestions */}
        <div className="space-y-2">
          <Label className="text-xs text-white/40">Quick Add</Label>
          <div className="flex flex-wrap gap-1.5">
            {["🔥", "❤️‍🔥", "😍", "🥺", "😭", "💀", "✨", "🫡", "🤝", "🥳", "💯", "🙏", "👀", "🙌", "💖", "🎉", "😤", "🤣"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                disabled={emojiList.includes(emoji)}
                className="rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 text-sm transition-colors hover:bg-white/[0.06] disabled:opacity-20"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-[11px] text-white/25 transition-colors hover:text-white/50"
          >
            <Shuffle size={12} />
            Reset to defaults
          </button>
        </div>
      </Section>

      {/* Preview */}
      <Section title="Preview">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] text-white/20 mb-3 uppercase tracking-wider">Reaction Picker</p>
          <div className="flex flex-wrap gap-2">
            {emojiList.map((emoji, i) => (
              <button
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-lg transition-all hover:bg-white/[0.08] hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
