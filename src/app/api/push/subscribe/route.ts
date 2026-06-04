import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/subscribe
 * 
 * Stores a push subscription in Firebase RTDB.
 * The chat widget calls this when the user grants notification permission.
 * 
 * Body: { uid, subscription: PushSubscriptionJSON }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, subscription } = body;

    if (!uid || !subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Missing uid or subscription" },
        { status: 400 }
      );
    }

    // Store in Firebase RTDB via REST API
    const firebaseUrl = `https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app/bq_push_subs/${uid}.json`;

    const response = await fetch(firebaseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription,
        updatedAt: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error("[push/subscribe] Firebase write failed:", response.status);
      return NextResponse.json(
        { error: "Failed to store subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
