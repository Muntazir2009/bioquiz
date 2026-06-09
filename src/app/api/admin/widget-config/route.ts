import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = "0613";
const FIREBASE_BASE = "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";

function isAdmin(request: Request): boolean {
  const auth = request.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

/** GET /api/admin/widget-config — read current widget config */
export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${FIREBASE_BASE}/bq_widget_config/settings.json`);

    if (!res.ok) {
      const text = await res.text();
      console.error("Firebase GET widget-config error:", text);
      return NextResponse.json(
        { error: "Failed to fetch widget config from Firebase" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ config: data ?? {} });
  } catch (err) {
    console.error("Widget config GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PUT /api/admin/widget-config — update widget config (merge/overwrite) */
export async function PUT(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Use PATCH for merge behavior so existing fields are preserved
    const res = await fetch(`${FIREBASE_BASE}/bq_widget_config/settings.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Firebase PATCH widget-config error:", text);
      return NextResponse.json(
        { error: "Failed to update widget config in Firebase" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ config: data });
  } catch (err) {
    console.error("Widget config PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
