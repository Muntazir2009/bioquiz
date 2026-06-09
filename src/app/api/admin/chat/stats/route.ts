import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "1306";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { getChatStats } = await import("@/lib/firebase-rtdb");
    const stats = await getChatStats();
    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
