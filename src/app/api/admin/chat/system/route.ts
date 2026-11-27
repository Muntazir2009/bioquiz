import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/admin-auth";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
    const { sendSystemMessage } = await import("@/lib/firebase-rtdb");
    await sendSystemMessage(text);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
