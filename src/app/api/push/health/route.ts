import { NextResponse } from "next/server";
import { getSubscriptionCount } from "@/lib/push-store";
import { VAPID_PUBLIC_KEY } from "@/lib/push-config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    subscriptions: getSubscriptionCount(),
    vapidKey: VAPID_PUBLIC_KEY.slice(0, 10) + "...",
    features: {
      inApp: true,
      sound: true,
      browserPush: true,
      serviceWorkerPush: true,
      webPushBackend: true,
    },
    message: "Push notification backend active. VAPID-based Web Push is configured and ready.",
  });
}
