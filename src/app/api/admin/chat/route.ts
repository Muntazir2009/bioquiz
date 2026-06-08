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

      // For each DM, fetch metadata
      const dmMeta = await Promise.all(
        dmIds.slice(0, 30).map(async (dmId) => {
          try {
            const metaRes = await fetch(`${FB}/bq_dms/${dmId}/meta.json`);
            const meta = await metaRes.json();
            const msgRes = await fetch(`${FB}/bq_dms/${dmId}/messages.json?orderBy="ts"&limitToLast=1`);
            const msgData = await msgRes.json();
            const lastMsg = msgData ? Object.values(msgData).pop() as any : null;
            return {
              dmId,
              participants: meta?.participants || [],
              lastMessage: lastMsg?.text || "",
              lastMessageTime: lastMsg?.ts || 0,
              messageCount: meta?.messageCount || 0,
            };
          } catch {
            return { dmId, participants: [], lastMessage: "", lastMessageTime: 0, messageCount: 0 };
          }
        })
      );

      dmMeta.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      return NextResponse.json({ conversations: dmMeta, total: dmIds.length });
    }

    if (type === "dm-messages") {
      const dmId = req.nextUrl.searchParams.get("dmId");
      if (!dmId) return NextResponse.json({ error: "dmId required" }, { status: 400 });

      const res = await fetch(`${FB}/bq_dms/${dmId}/messages.json?limitToLast=50`);
      const data = await res.json();
      const messages = data ? Object.entries(data).map(([key, val]: [string, any]) => ({
        key,
        text: val.text || "",
        uname: val.uname || "?",
        uid: val.uid || "",
        ts: val.ts || 0,
        type: val.type || "text",
      })).sort((a, b) => b.ts - a.ts) : [];

      return NextResponse.json({ messages, dmId });
    }

    return NextResponse.json({ error: "Invalid type. Use: global, dms, dm-messages" }, { status: 400 });
  } catch (err) {
    console.error("[admin/chat] Error:", err);
    return NextResponse.json({ error: "Failed to fetch chat data" }, { status: 500 });
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
