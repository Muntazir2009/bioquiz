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
    const limit = parseInt(searchParams.get("limit") || "50");
    const beforeTs = searchParams.get("beforeTs") ? parseInt(searchParams.get("beforeTs")!) : undefined;
    const { getGlobalMessages } = await import("@/lib/firebase-rtdb");
    const messages = await getGlobalMessages(limit, beforeTs);
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { messageId } = await req.json();
    if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });
    const { deleteGlobalMessage } = await import("@/lib/firebase-rtdb");
    await deleteGlobalMessage(messageId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
