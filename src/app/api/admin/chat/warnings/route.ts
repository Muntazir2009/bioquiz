import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "1306";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { getActiveWarnings } = await import("@/lib/firebase-rtdb");
    const warnings = await getActiveWarnings();
    return NextResponse.json({ warnings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { uid, action, reason, durationMs } = await req.json();
    if (!uid || !action) return NextResponse.json({ error: "uid and action required" }, { status: 400 });

    if (action === "warn") {
      if (!durationMs || durationMs <= 0) return NextResponse.json({ error: "durationMs must be positive" }, { status: 400 });
      const { warnUser } = await import("@/lib/firebase-rtdb");
      await warnUser(uid, reason || "Admin warning", durationMs);
    } else if (action === "unwarn") {
      const { unwarnUser } = await import("@/lib/firebase-rtdb");
      await unwarnUser(uid);
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'warn' or 'unwarn'" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
