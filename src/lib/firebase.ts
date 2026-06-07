// ─── Firebase Realtime Database ──────────────────────────────
// Config path: bq_widget_config/settings
// When FIREBASE_CONFIG is empty {}, falls back to local-only mode

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
  off,
  type Database,
} from "firebase/database";
import type { WidgetConfig } from "./defaults";
import { DEFAULT_CONFIG } from "./defaults";

// ─── Firebase Config ────────────────────────────────────────
// Uses the existing bioquiz-chat project (same as chat-widget.js & FCM)
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain:        "bioquiz-chat.firebaseapp.com",
  databaseURL:       "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "bioquiz-chat",
  storageBucket:     "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId:             "1:616382882153:web:9c8a32401be847468d1df8",
};

const CONFIG_PATH = "bq_widget_config/settings";

/** True if Firebase has enough config to initialise */
const isFirebaseConfigured =
  !!FIREBASE_CONFIG.databaseURL || !!FIREBASE_CONFIG.projectId;

let app: FirebaseApp | null = null;
let db: Database | null = null;

function getFirebaseApp(): { app: FirebaseApp; db: Database } | null {
  if (!isFirebaseConfigured) return null;

  if (app && db) return { app, db };

  try {
    if (getApps().length === 0) {
      app = initializeApp(FIREBASE_CONFIG);
    } else {
      app = getApps()[0];
    }
    db = getDatabase(app);
    return { app, db };
  } catch {
    console.warn("[BQ Config] Firebase init failed — running in local-only mode");
    return null;
  }
}

// ─── Read config once ───────────────────────────────────────
export async function getConfig(): Promise<WidgetConfig> {
  const fb = getFirebaseApp();
  if (!fb) return { ...DEFAULT_CONFIG };

  try {
    const snapshot = await get(ref(fb.db, CONFIG_PATH));
    if (!snapshot.exists()) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...snapshot.val() };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

// ─── Write config ───────────────────────────────────────────
export async function setConfig(config: WidgetConfig): Promise<void> {
  const fb = getFirebaseApp();
  if (!fb) return; // Local-only — skip write

  await set(ref(fb.db, CONFIG_PATH), config);
}

// ─── Listen for real-time changes ───────────────────────────
export function onConfigChange(
  callback: (config: WidgetConfig) => void,
): () => void {
  const fb = getFirebaseApp();
  if (!fb) return () => {}; // Local-only — no listener

  const dbRef = ref(fb.db, CONFIG_PATH);

  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      const val = snapshot.exists() ? snapshot.val() : {};
      callback({ ...DEFAULT_CONFIG, ...val });
    },
    (error) => {
      console.warn("[BQ Config] onValue error:", error.message);
    },
  );

  return () => off(dbRef);
}
