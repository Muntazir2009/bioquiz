import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/admin-auth";

function auth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { getWidgetConfig } = await import("@/lib/firebase-rtdb");
    const config = await getWidgetConfig();
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { setWidgetConfig } = await import("@/lib/firebase-rtdb");
    const updated = await setWidgetConfig(body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
