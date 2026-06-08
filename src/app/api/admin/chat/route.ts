import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FB = "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";
const PWD = "0613";

function isAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === PWD;
}

/** GET /api/admin/chat?type=global|dms — fetch messages & metadata */
export async function GET(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") || "global";

  try {
    if (type === "global") {
      // Fetch global messages (no orderBy to avoid Firebase index requirements)
      const res = await fetch(`${FB}/bq_messages.json?limitToLast=50`);
      const data = await res.json();
      const messages = data && typeof data === "object" ? Object.entries(data).filter(([key]) => key !== "error").map(([key, val]: [string, any]) => ({
        key,
        text: val.text || "",
        uname: val.uname || "?",
        uid: val.uid || "",
        ts: val.ts || 0,
        type: val.type || "text",
        edited: val.edited || false,
        reactions: val.reactions ? Object.entries(val.reactions).map(([em, users]: [string, any]) => ({
          emoji: em,
          count: typeof users === "object" ? Object.keys(users).length : 0,
        })) : [],
      })).sort((a, b) => b.ts - a.ts) : [];

      return NextResponse.json({ messages, total: messages.length });
    }

    if (type === "dms") {
      // Fetch DM conversations metadata
      const res = await fetch(`${FB}/bq_dms.json?shallow=true`);
      const data = await res.json();
      const dmIds = data ? Object.keys(data) : [];

      // For each DM, fetch metadata and last message
      const dmMeta = await Promise.all(
        dmIds.slice(0, 30).map(async (dmId) => {
          try {
            const [metaRes, msgRes, msgCountRes] = await Promise.all([
              fetch(`${FB}/bq_dms/${dmId}/meta.json`),
              fetch(`${FB}/bq_dms/${dmId}/messages.json?limitToLast=1`),
              fetch(`${FB}/bq_dms/${dmId}/messages.json?shallow=true`),
            ]);
            const meta = await metaRes.json();
            const msgData = await msgRes.json();
            const lastMsg = msgData ? Object.values(msgData).pop() as any : null;

            // Count messages via shallow fetch
            let messageCount = 0;
            if (msgCountRes.ok) {
              const shallowData = await msgCountRes.json();
              if (shallowData && typeof shallowData === "object") {
                messageCount = Object.keys(shallowData).length;
              }
            }

            // Extract participant names from meta (n1/n2 are usernames, p1/p2 are UIDs)
            const participantNames: string[] = [];
            const participantUids: string[] = [];
            if (meta?.n1 && meta?.p1) {
              participantNames.push(meta.n1);
              participantUids.push(meta.p1);
            }
            if (meta?.n2 && meta?.p2) {
              participantNames.push(meta.n2);
              participantUids.push(meta.p2);
            }

            return {
              dmId,
              participants: participantUids,
              participantNames,
              lastMessage: meta?.lastMsg || lastMsg?.text || "",
              lastMessageTime: meta?.lastTs || lastMsg?.ts || 0,
              messageCount,
            };
          } catch {
            return { dmId, participants: [], participantNames: [], lastMessage: "", lastMessageTime: 0, messageCount: 0 };
          }
        })
      );

      dmMeta.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      return NextResponse.json({ conversations: dmMeta, total: dmIds.length });
    }

    if (type === "dm-messages") {
      const dmId = req.nextUrl.searchParams.get("dmId");
      if (!dmId) return NextResponse.json({ error: "dmId required" }, { status: 400 });

      // Fetch messages and meta in parallel
      const [msgRes, metaRes] = await Promise.all([
        fetch(`${FB}/bq_dms/${dmId}/messages.json?limitToLast=50`),
        fetch(`${FB}/bq_dms/${dmId}/meta.json`),
      ]);
      const msgData = await msgRes.json();
      const meta = await metaRes.json();

      const messages = msgData ? Object.entries(msgData).filter(([key]) => key !== "error").map(([key, val]: [string, any]) => ({
        key,
        text: val.text || "",
        uname: val.uname || "?",
        uid: val.uid || "",
        ts: val.ts || 0,
        type: val.type || "text",
        edited: val.edited || false,
      })).sort((a, b) => b.ts - a.ts) : [];

      // Return participant names for the header
      const participantNames: string[] = [];
      if (meta?.n1) participantNames.push(meta.n1);
      if (meta?.n2) participantNames.push(meta.n2);

      return NextResponse.json({ messages, dmId, participantNames });
    }

    return NextResponse.json({ error: "Invalid type. Use: global, dms, dm-messages" }, { status: 400 });
  } catch (err) {
    console.error("[admin/chat] Error:", err);
    return NextResponse.json({ error: "Failed to fetch chat data" }, { status: 500 });
  }
}

/** POST /api/admin/chat — send announcement / clear all messages */
export async function POST(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, text, context, dmId } = body as {
      action: "announce" | "clear-all";
      text?: string;
      context?: "global" | "dm";
      dmId?: string;
    };

    if (action === "announce" && text) {
      // Push a system message to global chat
      const msg = {
        text,
        uname: "Admin",
        uid: "admin",
        ts: Date.now(),
        type: "system",
      };
      const res = await fetch(`${FB}/bq_messages.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to send announcement" }, { status: 502 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "clear-all") {
      if (context === "dm" && dmId) {
        // Clear all messages in a DM conversation
        await fetch(`${FB}/bq_dms/${dmId}/messages.json`, { method: "DELETE" });
      } else {
        // Clear all global messages
        await fetch(`${FB}/bq_messages.json`, { method: "DELETE" });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action. Use: announce, clear-all" }, { status: 400 });
  } catch (err) {
    console.error("[admin/chat] POST error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

/** DELETE /api/admin/chat — delete a message */
export async function DELETE(req: NextRequest) {
  if (!isAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { messageKey, context, dmId } = body as { messageKey: string; context: "global" | "dm"; dmId?: string };

    if (!messageKey) return NextResponse.json({ error: "messageKey required" }, { status: 400 });

    const path = context === "dm" && dmId
      ? `bq_dms/${dmId}/messages/${messageKey}`
      : `bq_messages/${messageKey}`;

    await fetch(`${FB}/${path}.json`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/chat] Delete error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
