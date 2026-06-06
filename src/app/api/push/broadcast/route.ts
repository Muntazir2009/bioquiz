import { NextRequest, NextResponse } from "next/server";
import { sendWebPush } from "@/lib/web-push-compat";

/**
 * POST /api/push/broadcast
 *
 * Sends a web push notification to ALL subscribed users except the sender.
 * Used for global chat messages.
 *
 * Body: { excludeUid, title, body, type }
 */

const FIREBASE_DB_URL =
  "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { excludeUid, title, body: msgBody, type } = body;

    if (!title || !msgBody) {
      return NextResponse.json(
        { error: "Missing title or body" },
        { status: 400 }
      );
    }

    // Fetch all push subscriptions from Firebase RTDB
    const subsResponse = await fetch(`${FIREBASE_DB_URL}/bq_push_subs.json`);
    if (!subsResponse.ok) {
      console.error("[push/broadcast] Failed to fetch subscriptions:", subsResponse.status);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    const subsData = await subsResponse.json();
    if (!subsData || typeof subsData !== "object") {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0 });
    }

    // Build push payload
    const payload = JSON.stringify({
      title: title || "BioQuiz Chat",
      body: (msgBody || "").slice(0, 200),
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: `bq-${type || "global"}-${Date.now()}`,
      type: type || "global",
      url: "/",
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const expiredUids: string[] = [];

    // Send push to each subscriber (except sender)
    for (const [uid, subData] of Object.entries(subsData)) {
      if (uid === excludeUid) {
        skipped++;
        continue;
      }

      const data = subData as { subscription?: { endpoint?: string; keys?: { p256dh: string; auth: string } } };
      if (!data.subscription?.endpoint || !data.subscription?.keys?.p256dh || !data.subscription?.keys?.auth) {
        skipped++;
        continue;
      }

      const result = await sendWebPush(data.subscription as any, payload);

      if (result.success) {
        sent++;
      } else {
        failed++;
        // Clean up expired subscriptions (410 Gone / 404 Not Found)
        if (result.statusCode === 410 || result.statusCode === 404) {
          expiredUids.push(uid);
        }
      }
    }

    // Clean up expired subscriptions in Firebase
    if (expiredUids.length > 0) {
      await Promise.allSettled(
        expiredUids.map((uid) =>
          fetch(`${FIREBASE_DB_URL}/bq_push_subs/${uid}.json`, {
            method: "DELETE",
          })
        )
      );
      console.log(`[push/broadcast] Cleaned up ${expiredUids.length} expired subscriptions`);
    }

    console.log(`[push/broadcast] Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
    return NextResponse.json({ sent, failed, skipped });
  } catch (err) {
    console.error("[push/broadcast] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
