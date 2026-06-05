import { NextRequest, NextResponse } from "next/server";
import { removeSubscription } from "@/lib/push-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid" },
        { status: 400 }
      );
    }

    const removed = removeSubscription(uid);

    return NextResponse.json({ success: true, removed });
  } catch (e: any) {
    console.error("[push] Unsubscribe error:", e);
    return NextResponse.json(
      { error: "Internal error", message: e?.message },
      { status: 500 }
    );
  }
}
