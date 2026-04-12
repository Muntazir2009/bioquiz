import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin with environment variables
let messaging: ReturnType<typeof getMessaging> | null = null;
let db: ReturnType<typeof getDatabase> | null = null;

function initFirebase() {
  if (getApps().length > 0) {
    messaging = getMessaging();
    db = getDatabase();
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
    'https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app';

  if (!serviceAccountKey) {
    console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY not set');
    return;
  }

  try {
    const creds = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(creds),
      databaseURL: databaseUrl,
    });
    messaging = getMessaging();
    db = getDatabase();
    console.log('[FCM] Firebase Admin initialized');
  } catch (e) {
    console.error('[FCM] Firebase Admin init error:', e);
  }
}

// Initialize on module load
initFirebase();

interface NotificationPayload {
  senderId: string;
  senderName: string;
  messageText: string;
  type: 'global' | 'dm';
  recipientId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Ensure Firebase is initialized
    if (!messaging || !db) {
      initFirebase();
      if (!messaging || !db) {
        return NextResponse.json(
          { error: 'Firebase not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY env var.' },
          { status: 500 }
        );
      }
    }

    const payload: NotificationPayload = await request.json();
    const { senderId, senderName, messageText, type, recipientId } = payload;

    if (!senderId || !senderName || !messageText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get FCM tokens from database - use correct path: bq_push_subs
    let tokensSnapshot;
    
    if (type === 'global') {
      // For global messages, get all tokens except sender's
      tokensSnapshot = await db.ref('bq_push_subs').once('value');
    } else if (type === 'dm' && recipientId) {
      // For DMs, get only recipient's tokens
      tokensSnapshot = await db.ref(`bq_push_subs/${recipientId}`).once('value');
    }

    if (!tokensSnapshot?.exists()) {
      return NextResponse.json({ success: true, sent: 0, message: 'No tokens found' });
    }

    // Collect tokens
    let tokens: string[] = [];
    
    if (type === 'global') {
      const allUsers = tokensSnapshot.val() || {};
      Object.entries(allUsers).forEach(([userId, userTokens]) => {
        if (userId !== senderId && userTokens && typeof userTokens === 'object') {
          tokens.push(...Object.values(userTokens as Record<string, string>));
        }
      });
    } else {
      const recipientTokens = tokensSnapshot.val() || {};
      if (typeof recipientTokens === 'object') {
        tokens = Object.values(recipientTokens);
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No tokens to send to' });
    }

    // Prepare notification
    const notificationTitle = type === 'global'
      ? `${senderName} in Global Chat`
      : `New DM from @${senderName}`;

    const notificationBody = messageText.length > 100
      ? messageText.substring(0, 97) + '...'
      : messageText;

    // Send to each token
    const results = await Promise.allSettled(
      tokens.map(token =>
        messaging!.send({
          token,
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
              icon: '/images/chat-icon.png',
              badge: '/images/chat-badge.png',
            },
          },
        })
      )
    );

    // Clean up invalid tokens
    const invalidTokens: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const error = result.reason;
        if (
          error?.code === 'messaging/invalid-registration-token' ||
          error?.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    // Remove invalid tokens from database
    if (invalidTokens.length > 0 && db) {
      const allTokensSnap = await db.ref('bq_push_subs').once('value');
      const allUsers = allTokensSnap.val() || {};
      
      for (const [userId, userTokens] of Object.entries(allUsers)) {
        if (userTokens && typeof userTokens === 'object') {
          for (const [tokenKey, tokenVal] of Object.entries(userTokens as Record<string, string>)) {
            if (invalidTokens.includes(tokenVal)) {
              await db.ref(`bq_push_subs/${userId}/${tokenKey}`).remove();
            }
          }
        }
      }
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      sent,
      total: tokens.length,
      invalidRemoved: invalidTokens.length,
    });
  } catch (error) {
    console.error('[FCM] Send notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    );
  }
}
