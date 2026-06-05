/**
 * Push Subscription Store
 *
 * Stores push subscriptions in a JSON file for local dev.
 * On Cloudflare Workers, uses in-memory Map only (non-persistent across deploys).
 *
 * IMPORTANT: fs/path imports are lazy to avoid crashes on Cloudflare Workers.
 */

export interface PushSubscriptionRecord {
  uid: string;
  uname: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  subscribedAt: number;
}

const subscriptions = new Map<string, PushSubscriptionRecord>();

// Lazy-loaded fs/path modules — only imported in local dev
let _fs: typeof import("fs") | null = null;
let _path: typeof import("path") | null = null;

function isCloudflare(): boolean {
  try {
    // Check if we're on Cloudflare Workers by testing for the global
    return typeof (globalThis as any).__OPENNEXT_KV !== "undefined" || 
           typeof process === "undefined" || 
           !process.versions?.node;
  } catch {
    return false;
  }
}

function getFs() {
  if (!_fs) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _fs = require("fs") as typeof import("fs");
  }
  return _fs;
}

function getPath() {
  if (!_path) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _path = require("path") as typeof import("path");
  }
  return _path;
}

function getDataDir(): string {
  const path = getPath();
  return path.join(process.cwd(), "data");
}

function getSubscriptionsFile(): string {
  const path = getPath();
  return path.join(getDataDir(), "push-subscriptions.json");
}

export function loadSubscriptions() {
  if (isCloudflare()) return; // Skip file I/O on Workers
  
  try {
    const fs = getFs();
    const filePath = getSubscriptionsFile();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (Array.isArray(data)) {
        for (const sub of data) {
          subscriptions.set(sub.uid, sub);
        }
      }
      console.log(`[push-store] Loaded ${subscriptions.size} subscriptions`);
    }
  } catch (e) {
    console.warn("[push-store] Failed to load subscriptions:", e);
  }
}

export function saveSubscriptions() {
  if (isCloudflare()) return; // Skip file I/O on Workers
  
  try {
    const fs = getFs();
    const dataDir = getDataDir();
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const data = Array.from(subscriptions.values());
    fs.writeFileSync(getSubscriptionsFile(), JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn("[push-store] Failed to save subscriptions:", e);
  }
}

export function addSubscription(sub: PushSubscriptionRecord) {
  subscriptions.set(sub.uid, sub);
  saveSubscriptions();
}

export function removeSubscription(uid: string): boolean {
  const removed = subscriptions.delete(uid);
  if (removed) saveSubscriptions();
  return removed;
}

export function getSubscription(uid: string): PushSubscriptionRecord | undefined {
  return subscriptions.get(uid);
}

export function getAllSubscriptions(): PushSubscriptionRecord[] {
  return Array.from(subscriptions.values());
}

export function getSubscriptionCount(): number {
  return subscriptions.size;
}

// Load on module import (in local dev only)
loadSubscriptions();
