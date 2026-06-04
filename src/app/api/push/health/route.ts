import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    features: {
      inApp: true,
      sound: true,
      browserPush: true,
      serviceWorkerPush: false,
    },
    message: 'In-app notifications active. Browser push via Notification API when tab in background. Service worker push requires external push server.',
  });
}
