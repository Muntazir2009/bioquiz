"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WidgetConfig } from "./defaults";
import { DEFAULT_CONFIG } from "./defaults";
import { getConfig, setConfig, onConfigChange } from "./firebase";

export type SyncStatus = "synced" | "syncing" | "offline";

export function useWidgetConfig() {
  const [config, setConfigState] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial config + subscribe
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const initial = await getConfig();
        if (!mounted) return;
        setConfigState(initial);
        setSyncStatus("synced");
        setLoaded(true);
      } catch {
        if (!mounted) return;
        setSyncStatus("offline");
        setLoaded(true);
      }
    }

    init();

    const unsubscribe = onConfigChange((remote) => {
      if (!mounted) return;
      setConfigState((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(remote)) return prev;
        return remote;
      });
      setSyncStatus("synced");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Debounced write to Firebase
  const updateConfig = useCallback((partial: Partial<WidgetConfig>) => {
    const next = { ...DEFAULT_CONFIG, ...partial } as WidgetConfig;

    setConfigState((prev) => {
      const merged = { ...prev, ...partial };

      // Debounce Firebase write
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSyncStatus("syncing");

      debounceRef.current = setTimeout(async () => {
        try {
          await setConfig(merged);
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      }, 300);

      return merged;
    });
  }, []);

  return { config, updateConfig, syncStatus, loaded };
}
