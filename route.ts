import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

/* ─────────────────────────────────────────
   REPLACE THIS WITH YOUR SERVICE ACCOUNT JSON
   Firebase Console → Project Settings → Service Accounts
   → Generate New Private Key → copy the JSON content here
   You can also set FIREBASE_SERVICE_ACCOUNT_KEY env var with
   the JSON as a single-line string instead of hardcoding it.
───────────────────────────────────────── */
const SERVICE_ACCOUNT: any = {
  {
  "type": "service_account",
  "project_id": "bioquiz-chat",
  "private_key_id": "ba1c6c3253a15fc49166cadc421c109e8cb4d800",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAEO9DNCVfFAqN\ni7fW1sl4qCissdyG3xNOSebwX3ks42Z46FIbRFtBEBQJM1x/dL67xUeQlq+Q0Xee\naxdx/AtHlii3st4PePxXZ+WFm3+y63P48+sSCd7Yiz8/5MUtWTL9wmHla1AgRMNR\n48uucczn0ynPPb1w369k2TuTB+76QOb90CXuOll8p9oY+JRhlsEg6SpdZAt4/zB8\nyLmG+vPu51Pm8MJVJGh2tqC6JQs0TLfv8EbVfzuKGBspp37dcq1cq4Y1Vt/loqUs\nGPy1jl3Hz5bTSYm626NxqVozvps9Iwz4m6MExDW9vn3vgZ3hYj+snsgJwbYRkfho\nBV0cQIqrAgMBAAECggEAC58asyDNIBco2k65dXzynOPj7ism8lw+IU8Uc7f7L42k\n7iz0huTYdrPf2nyqnKW2QstZnLSZc/RQvhuxw/phvlemKBNhH2ONNUa6mx6BGBTq\nJAayUxmYy9aFIbsYeTl7/eHMpaKcKw+uF97mPKxzHxXmYj1UoKdQSBRi5+8jdS3s\nH0a6yf4FymUQV1L+fNuWLBLh6+kPG6z9Tkl7AlGIxQCB5tScpTi/XbQlLqu/Bglf\n7Y+c2BbzIqdUHY+x+6h4i4kK2KxzNBQPrVsQzcO+b620oDRl+chcQOQUQTOXHYKK\neywxYiAeEYp/0dDjROXFr6bY+rPmxACVZaJkX8xqzQKBgQD7tnypzZ701hP45cAF\nn0ovR+EiilBWahyFX3UpqLZoVje0/fN12VUIfgEUM06i+hOg4c7y9ot+Kw8O1XGD\n71g3mMXhUOm4eLBu2GhfQ2LQ2yK6D0oNhJuEhXjtQJ4oU4Etg1DYxmw43EDq7khd\nuRsCIFbRPDVKZ5mlrJcVagIELQKBgQDDVmCeMvQLLigFttSix/mtRik+ztmKVrLV\nQJaVycSnECFoiA548RWbZjJgeoME/EFKgtikjckFWGusb9p30x8glQXuHjfGAe0Y\ngczQ6KD3YjlZwN2MiHlhXhxGQxch2uc9X+Fdeh+NelMKUVNC8nevVZEpvCh9GbpC\nIIIQ8JZZNwKBgCxZc8+LPhWPXod9G38iGLUJ6h3m1s7S9WF+dys24aSyhDAsimfa\nOgQ8Bz6i55kJjMnM32SpkdxSA94uN0jys81f6oWPdw6cnSF6mbEnM1LvOUglB3wo\nQCpyReMvfm5GgD0fpO/8zfaawAlkoHV69spCHmnRPOZ2KHkrVpdcTSylAoGAOU3r\nxj04btc5koOSWbbEvlpo2y4fj3/jsr/h7Utlz4Th6CKR7FT9e7s9aCRIr3u5Q7yj\nBZM6t8C6xbmCo8hhx1MwjCx9PC9weNILXfYA0tIT9QqpdALNaQ0MymgAL0RithSc\nrqmW/BA4sDwvauJqzhsSHOZAEoMrqx6SSZnq4X0CgYEA6z+5o3puHnY/neDblrBq\n1O1cHrOXBcrwKzHEx2EVtf2SahQma0t+IqvjXsKQbkGQAkgREdJMtA0r9nrsvUlh\n9y2GSxij0WeLVvy6OEebRHbgdwDA7DjON+t0SghMJwgkZEPAS3FkPpnnvq0h2MOa\nIQFqi83k0TTltoZetsfPMSw=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@bioquiz-chat.iam.gserviceaccount.com",
  "client_id": "105556124820197883978",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bioquiz-chat.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

const DATABASE_URL = 'YOUR_DATABASE_URL'; // e.g. https://your-project-default-rtdb.firebaseio.com

// Initialize Firebase Admin
let messaging: any;
try {
  if (!getApps().length) {
    // env var (set in Vercel / .env.local) takes priority over the
    // hardcoded placeholder above so you never have to touch this file
    // on the server — just set FIREBASE_SERVICE_ACCOUNT_KEY.
    const creds = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : SERVICE_ACCOUNT;

    const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || DATABASE_URL;

    initializeApp({
      credential: cert(creds),
      databaseURL: dbUrl,
    });
  }
  messaging = getMessaging();
} catch (e) {
  console.error('Firebase Admin init error:', e);
}

interface NotificationPayload {
  senderId: string;
  senderName: string;
  messageText: string;
  type: 'global' | 'dm';
  recipientId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: NotificationPayload = await request.json();

    if (!messaging) {
      return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
    }

    const { senderId, senderName, messageText, type, recipientId } = payload;

    if (!senderId || !senderName || !messageText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get FCM tokens from database
    const db = getDatabase();
    let tokensSnapshot: any = null;

    if (type === 'global') {
      // For global messages, send to all users except sender
      tokensSnapshot = await db.ref('fcm_tokens').once('value');
    } else if (type === 'dm' && recipientId) {
      // For DMs, send only to recipient
      tokensSnapshot = await db.ref(`fcm_tokens/${recipientId}`).once('value');
    }

    if (!tokensSnapshot?.exists()) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const tokens = type === 'global'
      ? Object.entries(tokensSnapshot.val() || {})
          .filter(([userId]) => userId !== senderId)
          .flatMap(([_, userTokens]: any) => Object.values(userTokens || {}))
      : Object.values(tokensSnapshot.val() || {});

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const notificationTitle = type === 'global'
      ? `${senderName} sent a message`
      : `New message from @${senderName}`;

    const notificationBody = messageText.length > 100
      ? messageText.substring(0, 97) + '...'
      : messageText;

    const fcmPayload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        click_action: '/',
        sender_name: senderName,
        sender_id: senderId,
        type: type,
      },
      webpush: {
        fcmOptions: { link: '/' },
        notification: {
          title: notificationTitle,
          body: notificationBody,
          badge: '/chat-badge.png',
          icon: '/chat-icon.png',
        },
      },
    };

    // Send to all tokens
    const results = await Promise.all(
      (tokens as string[]).map(token =>
        messaging
          .send({ ...fcmPayload, token })
          .catch((err: any) => {
            console.error(`Failed to send to token: ${err.message}`);
            // Optionally remove dead tokens from DB
            if (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered') {
              // Delete the token from DB
              if (type === 'global') {
                Object.entries(tokensSnapshot.val()).forEach(([userId, userTokens]: any) => {
                  Object.entries(userTokens).forEach(([tokenKey, tokenVal]: any) => {
                    if (tokenVal === token) {
                      db.ref(`fcm_tokens/${userId}/${tokenKey}`).remove();
                    }
                  });
                });
              }
            }
            return null;
          })
      )
    );

    const sent = results.filter(r => r).length;

    return NextResponse.json({
      success: true,
      sent,
      total: tokens.length,
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
