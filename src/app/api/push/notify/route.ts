import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/notify
 * 
 * Sends a web push notification to a target user.
 * The chat widget calls this when sending a message to trigger
 * a push notification for the recipient (who may have the tab closed).
 * 
 * Body: { targetUid, subscription, sender, message, type, dmId, pUid, pName }
 *   - targetUid: recipient's UID (for logging/cleanup)
 *   - subscription: PushSubscriptionJSON (fetched by sender from Firebase RTDB)
 *   - sender: display name of sender
 *   - message: message text preview
 *   - type: 'global' | 'dm'
 *   - dmId: DM conversation ID (for DMs)
 *   - pUid: partner UID (for DMs)
 *   - pName: partner name (for DMs)
 */

// VAPID configuration
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:bioquiz.chat@gmail.com";

// Lazy-load web-push to avoid issues on CF Workers
let webpush: typeof import("web-push") | null = null;

async function getWebPush() {
  if (webpush) return webpush;
  try {
    const wp = await import("web-push");
    webpush = wp;
    wp.default.setVapidDetails(
      VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY || "",
      VAPID_PRIVATE_KEY
    );
    return wp;
  } catch (err) {
    console.error("[push/notify] Failed to load web-push:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, subscription, sender, message, type, dmId, pUid, pName } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Missing push subscription" },
        { status: 400 }
      );
    }

    if (!VAPID_PRIVATE_KEY) {
      console.warn("[push/notify] VAPID_PRIVATE_KEY not configured — skipping push");
      return NextResponse.json({ success: false, reason: "no_vapid_key" });
    }

    // Load web-push library
    const wp = await getWebPush();
    if (!wp) {
      console.warn("[push/notify] web-push library not available — skipping push");
      return NextResponse.json({ success: false, reason: "no_webpush" });
    }

    // Build push payload
    const payload = JSON.stringify({
      title: "BioQuiz Chat",
      body: `${sender}: ${message}`.slice(0, 200),
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: `bq-${type}-${Date.now()}`,
      type: type || "global",
      dmId: dmId || null,
      pUid: pUid || null,
      pName: pName || null,
      url: "/",
    });

    // Send the push notification
    try {
      await wp.default.sendNotification(subscription, payload);
      console.log(`[push/notify] Push sent to ${targetUid}`);
      return NextResponse.json({ success: true });
    } catch (pushErr: unknown) {
      const err = pushErr as { statusCode?: number; body?: string };
      console.error(`[push/notify] Push failed (${err.statusCode}):`, err.body || pushErr);
      
      // If subscription is expired/gone (410), clean it up
      if (err.statusCode === 410 || err.statusCode === 404) {
        try {
          const firebaseUrl = `https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app/bq_push_subs/${targetUid}.json`;
          await fetch(firebaseUrl, { method: "DELETE" });
          console.log(`[push/notify] Cleaned up expired subscription for ${targetUid}`);
        } catch (_) {
          // Ignore cleanup errors
        }
        return NextResponse.json({ success: false, reason: "subscription_expired" });
      }

      return NextResponse.json(
        { error: "Push delivery failed", details: String(pushErr) },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[push/notify] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push/notify — health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    vapidConfigured: !!VAPID_PRIVATE_KEY,
  });
}
