import { NextRequest, NextResponse } from "next/server";
import { sendWebPush } from "@/lib/web-push-compat";

/**
 * POST /api/push/notify
 *
 * Sends a web push notification to specific target users.
 * Looks up their subscriptions from Firebase RTDB.
 *
 * Body: { targetUids: string[], excludeUid?, title, body, type, dmId?, pUid?, pName? }
 *   - targetUids: array of recipient UIDs
 *   - excludeUid: sender UID to skip
 *   - title: notification title
 *   - body: notification body text
 *   - type: 'global' | 'dm'
 *   - dmId: DM conversation ID (for DMs)
 *   - pUid: partner UID (for DMs)
 *   - pName: partner name (for DMs)
 */

const FIREBASE_DB_URL =
  "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUids, excludeUid, title, body: msgBody, type, dmId, pUid, pName } = body;

    if (!targetUids || !Array.isArray(targetUids) || targetUids.length === 0) {
      return NextResponse.json(
        { error: "Missing targetUids" },
        { status: 400 }
      );
    }

    if (!title && !msgBody) {
      return NextResponse.json(
        { error: "Missing title or body" },
        { status: 400 }
      );
    }

    // Fetch subscriptions for target UIDs from Firebase RTDB
    const results = await Promise.allSettled(
      targetUids
        .filter((uid: string) => uid !== excludeUid)
        .map(async (uid: string) => {
          const res = await fetch(`${FIREBASE_DB_URL}/bq_push_subs/${uid}.json`);
          if (!res.ok) return { uid, status: "fetch_failed" };
          const data = await res.json();
          if (!data?.subscription?.endpoint) return { uid, status: "no_subscription" };
          return { uid, subscription: data.subscription };
        })
    );

    const validSubs = results
      .filter((r): r is PromiseFulfilledResult<{ uid: string; subscription: any; status?: string }> => r.status === "fulfilled" && !!r.value.subscription)
      .map((r) => r.value);

    if (validSubs.length === 0) {
      return NextResponse.json({ sent: 0, noSubscription: targetUids.length });
    }

    // Build push payload
    const payload = JSON.stringify({
      title: title || "BioQuiz Chat",
      body: (msgBody || "New message").slice(0, 200),
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: `bq-${type || "dm"}-${Date.now()}`,
      type: type || "dm",
      dmId: dmId || null,
      pUid: pUid || null,
      pName: pName || null,
      url: "/",
    });

    let sent = 0;
    let failed = 0;
    const expiredUids: string[] = [];

    // Send push to each target
    for (const { uid, subscription } of validSubs) {
      const result = await sendWebPush(subscription, payload);

      if (result.success) {
        sent++;
      } else {
        failed++;
        if (result.statusCode === 410 || result.statusCode === 404) {
          expiredUids.push(uid);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredUids.length > 0) {
      await Promise.allSettled(
        expiredUids.map((uid) =>
          fetch(`${FIREBASE_DB_URL}/bq_push_subs/${uid}.json`, {
            method: "DELETE",
          })
        )
      );
      console.log(`[push/notify] Cleaned up ${expiredUids.length} expired subscriptions`);
    }

    console.log(`[push/notify] Sent: ${sent}, Failed: ${failed}`);
    return NextResponse.json({ sent, failed });
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
    version: "2.0",
  });
}
