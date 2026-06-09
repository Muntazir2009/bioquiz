import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = "0613";
const FIREBASE_BASE = "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";

function isAdmin(request: Request): boolean {
  const auth = request.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

interface PresenceEntry {
  ts?: number;
  [key: string]: unknown;
}

interface MessageEntry {
  ts?: number;
  [key: string]: unknown;
}

/** GET /api/admin/activity — fetch online users, recent messages, and total message count */
export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const thirtySecondsAgo = now - 30_000;

    // Fetch all three data sources in parallel
    const [presenceRes, messagesRes, messageCountRes] = await Promise.all([
      fetch(`${FIREBASE_BASE}/bq_presence.json`),
      fetch(`${FIREBASE_BASE}/bq_messages.json?orderBy="ts"&limitToLast=20`),
      fetch(`${FIREBASE_BASE}/bq_messages.json?shallow=true`),
    ]);

    // Process presence data — filter by ts within last 30 seconds
    let onlineUsers: PresenceEntry[] = [];
    if (presenceRes.ok) {
      const presenceData: Record<string, PresenceEntry> | null = await presenceRes.json();
      if (presenceData && typeof presenceData === "object") {
        onlineUsers = Object.entries(presenceData)
          .filter(([, entry]) => {
            if (!entry || typeof entry !== "object") return false;
            const ts = entry.ts;
            return typeof ts === "number" && ts >= thirtySecondsAgo;
          })
          .map(([uid, entry]) => ({ uid, ...entry }));
      }
    } else {
      console.error("Firebase GET presence error:", await presenceRes.text());
    }

    // Process recent messages
    let recentMessages: MessageEntry[] = [];
    if (messagesRes.ok) {
      const messagesData: Record<string, MessageEntry> | null = await messagesRes.json();
      if (messagesData && typeof messagesData === "object") {
        recentMessages = Object.values(messagesData).sort(
          (a, b) => (a.ts ?? 0) - (b.ts ?? 0)
        );
      }
    } else {
      console.error("Firebase GET messages error:", await messagesRes.text());
    }

    // Process total message count using shallow fetch (returns keys only)
    let totalMessages = 0;
    if (messageCountRes.ok) {
      const shallowData: Record<string, unknown> | null = await messageCountRes.json();
      if (shallowData && typeof shallowData === "object") {
        totalMessages = Object.keys(shallowData).length;
      }
    } else {
      console.error("Firebase GET message count error:", await messageCountRes.text());
    }

    return NextResponse.json({
      onlineUsers,
      onlineCount: onlineUsers.length,
      recentMessages,
      totalMessages,
    });
  } catch (err) {
    console.error("Activity GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
