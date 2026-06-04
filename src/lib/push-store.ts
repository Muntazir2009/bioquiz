/**
 * Push Subscription Store
 *
 * Stores push subscriptions in a JSON file for local dev.
 * Uses in-memory Map with periodic file persistence.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface PushSubscriptionRecord {
  uid: string;
  uname: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  subscribedAt: number;
}

const DATA_DIR = join(process.cwd(), "data");
const SUBSCRIPTIONS_FILE = join(DATA_DIR, "push-subscriptions.json");

const subscriptions = new Map<string, PushSubscriptionRecord>();

export function loadSubscriptions() {
  try {
    if (existsSync(SUBSCRIPTIONS_FILE)) {
      const data = JSON.parse(readFileSync(SUBSCRIPTIONS_FILE, "utf-8"));
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
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = Array.from(subscriptions.values());
    writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2));
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

// Load on module import
loadSubscriptions();
