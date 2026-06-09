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
    const includeAll = searchParams.get("all") === "true";

    const { getOnlineUsers, getAllPresence, getWidgetConfig } = await import("@/lib/firebase-rtdb");
    const [users, config] = await Promise.all([
      includeAll ? getAllPresence() : getOnlineUsers(),
      getWidgetConfig(),
    ]);

    // Mark banned users
    const bannedSet = new Set(config.bannedUsers || []);
    // Attach active warnings
    const now = Date.now();
    const warnedUsers = config.warnedUsers || {};
    const enriched = users.map((u) => {
      const warning = warnedUsers[u.uid];
      const activeWarning = warning && warning.expiresAt > now ? warning : null;
      return {
        ...u,
        banned: bannedSet.has(u.uid),
        warning: activeWarning || null,
      };
    });

    return NextResponse.json({ users: enriched, bannedUsers: config.bannedUsers || [], warnedUsers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { uid, action } = await req.json();
    if (!uid || !action) return NextResponse.json({ error: "uid and action required" }, { status: 400 });

    if (action === "ban") {
      const { banUser } = await import("@/lib/firebase-rtdb");
      await banUser(uid);
    } else if (action === "unban") {
      const { unbanUser } = await import("@/lib/firebase-rtdb");
      await unbanUser(uid);
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'ban' or 'unban'" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
