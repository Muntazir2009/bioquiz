import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "1306";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const dmId = searchParams.get("dmId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (dmId) {
      const { getDmMessages } = await import("@/lib/firebase-rtdb");
      const messages = await getDmMessages(dmId, limit);
      return NextResponse.json({ messages });
    }

    const { getDmConversations } = await import("@/lib/firebase-rtdb");
    const conversations = await getDmConversations(limit);
    return NextResponse.json({ conversations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { dmId, messageId } = await req.json();
    if (!dmId) return NextResponse.json({ error: "dmId required" }, { status: 400 });

    if (messageId) {
      const { deleteDmMessage } = await import("@/lib/firebase-rtdb");
      await deleteDmMessage(dmId, messageId);
    } else {
      const { deleteDmConversation } = await import("@/lib/firebase-rtdb");
      await deleteDmConversation(dmId);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
