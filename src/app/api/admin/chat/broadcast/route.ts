import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "1306";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { message, action } = await req.json();

    if (action === "clear") {
      const { clearBroadcast } = await import("@/lib/firebase-rtdb");
      await clearBroadcast();
      return NextResponse.json({ success: true });
    }

    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

    const { broadcastMessage } = await import("@/lib/firebase-rtdb");
    await broadcastMessage(message);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { clearBroadcast } = await import("@/lib/firebase-rtdb");
    await clearBroadcast();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
