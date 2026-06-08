/**
 * Firebase Realtime Database client for admin operations.
 * Uses the Firebase RTDB REST API for server-side access.
 * All operations are server-side only.
 */

// Firebase config for the bioquiz-chat project
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8",
};

// Uses Firebase RTDB REST API directly — no SDK needed on server side.
// The REST API with the database URL is sufficient for our use case.

const DATABASE_URL = FIREBASE_CONFIG.databaseURL;

/**
 * Read data from Firebase RTDB using REST API
 */
async function rtdbGet(path: string): Promise<any> {
  const url = `${DATABASE_URL}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Firebase RTDB GET failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Write data to Firebase RTDB using REST API (PUT)
 */
async function rtdbPut(path: string, data: any): Promise<void> {
  const url = `${DATABASE_URL}/${path}.json`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Firebase RTDB PUT failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Update specific fields at a path using PATCH
 */
async function rtdbPatch(path: string, data: Record<string, any>): Promise<void> {
  const url = `${DATABASE_URL}/${path}.json`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Firebase RTDB PATCH failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Delete data at a path using DELETE
 */
async function rtdbDelete(path: string): Promise<void> {
  const url = `${DATABASE_URL}/${path}.json`;
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 200) {
    throw new Error(`Firebase RTDB DELETE failed: ${res.status} ${res.statusText}`);
  }
}

// ─── Widget Config ──────────────────────────────────────────────────────────────

export interface WidgetConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  slowMode: boolean;
  slowModeInterval: number; // seconds
  chatEnabled: boolean;
  dmEnabled: boolean;
  maxMessages: number;
  charLimit: number;
  bannedUsers: string[];
  broadcastMessage: string | null;
  broadcastActive: boolean;
  accent: string;
  accent2: string;
  bgColor: string;
  bgElevated: string;
  textColor: string;
  radius: string;
  bubbleMine: string;
  theme: string;
}

const DEFAULT_CONFIG: WidgetConfig = {
  maintenanceMode: false,
  maintenanceMessage: "Under maintenance. We'll be back soon!",
  slowMode: false,
  slowModeInterval: 5,
  chatEnabled: true,
  dmEnabled: true,
  maxMessages: 50,
  charLimit: 320,
  bannedUsers: [],
  broadcastMessage: null,
  broadcastActive: false,
  accent: "#60a5fa",
  accent2: "#a78bfa",
  bgColor: "#080808",
  bgElevated: "#111113",
  textColor: "#f0f0f0",
  radius: "16px",
  bubbleMine: "linear-gradient(145deg,#3b82f6,#6366f1)",
  theme: "default",
};

export async function getWidgetConfig(): Promise<WidgetConfig> {
  const data = await rtdbGet("bq_widget_config/settings");
  if (!data) return { ...DEFAULT_CONFIG };
  return { ...DEFAULT_CONFIG, ...data };
}

export async function setWidgetConfig(config: Partial<WidgetConfig>): Promise<WidgetConfig> {
  const current = await getWidgetConfig();
  const updated = { ...current, ...config };
  await rtdbPut("bq_widget_config/settings", updated);
  return updated;
}

// ─── Messages ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  uname: string;
  uid: string;
  text: string;
  ts: number;
  type?: string;
  replyTo?: string;
  replyName?: string;
  replyText?: string;
  reactions?: Record<string, string[]>;
}

export async function getGlobalMessages(limit = 50, beforeTs?: number): Promise<ChatMessage[]> {
  // Fetch all messages (they're already limited by MAX_MSG in the widget), then sort/filter client-side
  const data = await rtdbGet("bq_messages");
  if (!data) return [];
  let messages = Object.entries(data).map(([id, msg]: [string, any]) => ({
    id,
    uname: msg.uname || "Unknown",
    uid: msg.uid || "",
    text: msg.text || "",
    ts: msg.ts || 0,
    type: msg.type || "msg",
    replyTo: msg.replyTo || undefined,
    replyName: msg.replyName || undefined,
    replyText: msg.replyText || undefined,
    reactions: msg.reactions || undefined,
  }));
  // Sort newest first
  messages.sort((a, b) => b.ts - a.ts);
  // If beforeTs provided, filter to older messages
  if (beforeTs) {
    messages = messages.filter((m) => m.ts < beforeTs);
  }
  return messages.slice(0, limit);
}

export async function deleteGlobalMessage(id: string): Promise<void> {
  await rtdbDelete(`bq_messages/${id}`);
}

export async function getGlobalMessageCount(): Promise<number> {
  const data = await rtdbGet("bq_messages");
  if (!data) return 0;
  return Object.keys(data).length;
}

// ─── DMs ────────────────────────────────────────────────────────────────────────

export interface DmConversation {
  id: string;
  p1: string;
  p2: string;
  n1: string;
  n2: string;
  lastMsg: string;
  lastTs: number;
  unread?: Record<string, number>;
  messageCount?: number;
}

export async function getDmConversations(limit = 30): Promise<DmConversation[]> {
  const data = await rtdbGet("bq_dms");
  if (!data) return [];
  const convos: DmConversation[] = [];
  for (const [id, dm] of Object.entries(data) as [string, any][]) {
    const meta = dm.meta || {};
    const msgs = dm.messages || {};
    convos.push({
      id,
      p1: meta.p1 || "",
      p2: meta.p2 || "",
      n1: meta.n1 || "User",
      n2: meta.n2 || "User",
      lastMsg: meta.lastMsg || "",
      lastTs: meta.lastTs || 0,
      unread: meta.unread || {},
      messageCount: Object.keys(msgs).length,
    });
  }
  return convos.sort((a, b) => b.lastTs - a.lastTs).slice(0, limit);
}

export async function getDmMessages(dmId: string, limit = 50): Promise<ChatMessage[]> {
  const data = await rtdbGet(`bq_dms/${dmId}/messages`);
  if (!data) return [];
  return Object.entries(data).map(([id, msg]: [string, any]) => ({
    id,
    uname: msg.uname || "Unknown",
    uid: msg.uid || "",
    text: msg.text || "",
    ts: msg.ts || 0,
    type: msg.type || "msg",
  })).sort((a, b) => b.ts - a.ts).slice(0, limit);
}

export async function deleteDmMessage(dmId: string, msgId: string): Promise<void> {
  await rtdbDelete(`bq_dms/${dmId}/messages/${msgId}`);
}

export async function deleteDmConversation(dmId: string): Promise<void> {
  await rtdbDelete(`bq_dms/${dmId}`);
}

// ─── Presence / Online Users ────────────────────────────────────────────────────

export interface OnlineUser {
  uid: string;
  uname: string;
  status: string;
  activity: string;
  ts: number;
  color: string;
  initials: string;
  displayName: string;
  activeDmId?: string;
}

export async function getOnlineUsers(): Promise<OnlineUser[]> {
  const data = await rtdbGet("bq_presence");
  if (!data) return [];
  const now = Date.now();
  const PRESENCE_TTL = 9000; // 9 seconds
  return Object.entries(data)
    .filter(([, d]: [string, any]) => d && d.ts && (now - d.ts) < PRESENCE_TTL * 2) // generous window
    .map(([uid, d]: [string, any]) => ({
      uid,
      uname: d.uname || "Unknown",
      status: d.status || "online",
      activity: d.activity || "",
      ts: d.ts || 0,
      color: d.color || "",
      initials: d.initials || "",
      displayName: d.displayName || d.uname || "Unknown",
      activeDmId: d.activeDmId || undefined,
    }))
    .sort((a, b) => b.ts - a.ts);
}

export async function getAllPresence(): Promise<OnlineUser[]> {
  const data = await rtdbGet("bq_presence");
  if (!data) return [];
  return Object.entries(data)
    .map(([uid, d]: [string, any]) => ({
      uid,
      uname: d.uname || "Unknown",
      status: d.status || "online",
      activity: d.activity || "",
      ts: d.ts || 0,
      color: d.color || "",
      initials: d.initials || "",
      displayName: d.displayName || d.uname || "Unknown",
      activeDmId: d.activeDmId || undefined,
    }))
    .sort((a, b) => b.ts - a.ts);
}

// ─── Usernames ──────────────────────────────────────────────────────────────────

export async function getUsernames(): Promise<Record<string, string>> {
  const data = await rtdbGet("bq_usernames");
  return data || {};
}

// ─── Moderation ─────────────────────────────────────────────────────────────────

export async function banUser(uid: string): Promise<void> {
  const config = await getWidgetConfig();
  const banned = [...(config.bannedUsers || [])];
  if (!banned.includes(uid)) {
    banned.push(uid);
    await setWidgetConfig({ bannedUsers: banned });
  }
}

export async function unbanUser(uid: string): Promise<void> {
  const config = await getWidgetConfig();
  const banned = (config.bannedUsers || []).filter((u) => u !== uid);
  await setWidgetConfig({ bannedUsers: banned });
}

export async function broadcastMessage(message: string): Promise<void> {
  await setWidgetConfig({
    broadcastMessage: message,
    broadcastActive: true,
  });
}

export async function clearBroadcast(): Promise<void> {
  await setWidgetConfig({
    broadcastMessage: null,
    broadcastActive: false,
  });
}

export async function sendSystemMessage(text: string): Promise<void> {
  // Post a system message to global chat
  const msg = {
    uname: "System",
    uid: "system",
    text,
    ts: Date.now(),
    type: "sys",
  };
  await rtdbPost("bq_messages", msg);
}

/**
 * Push new data using POST (generates auto ID)
 */
async function rtdbPost(path: string, data: any): Promise<string> {
  const url = `${DATABASE_URL}/${path}.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Firebase RTDB POST failed: ${res.status} ${res.statusText}`);
  }
  const result = await res.json();
  return result.name; // Firebase returns the generated key as "name"
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export interface ChatStats {
  totalMessages: number;
  totalDms: number;
  onlineUsers: number;
  totalUsers: number;
  bannedUsers: number;
}

export async function getChatStats(): Promise<ChatStats> {
  const [msgs, dms, online, allPresence, config] = await Promise.all([
    getGlobalMessageCount(),
    rtdbGet("bq_dms"),
    getOnlineUsers(),
    rtdbGet("bq_presence"),
    getWidgetConfig(),
  ]);

  const dmCount = dms ? Object.keys(dms).length : 0;
  const totalUsers = allPresence ? Object.keys(allPresence).length : 0;

  return {
    totalMessages: msgs,
    totalDms: dmCount,
    onlineUsers: online.length,
    totalUsers,
    bannedUsers: (config.bannedUsers || []).length,
  };
}
