/* ═══════════════════════════════════════════════════════════════
   BioQuiz Chat — Service Worker for Push Notifications
   Handles push events when tab/browser is closed
   v41: Updated for Web Push (VAPID) integration
   v69.2: Added action buttons (Reply, Mark Read), better click handling
   ═══════════════════════════════════════════════════════════════ */

const SW_VERSION = '2.1.0';

// Install event
self.addEventListener('install', (event) => {
  console.log('[bq-sw] Service Worker installed v' + SW_VERSION);
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[bq-sw] Service Worker activated v' + SW_VERSION);
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'bq-ping') {
    event.source.postMessage({ type: 'bq-pong', version: SW_VERSION });
  }
});

// Push event — receive push message and show notification
self.addEventListener('push', (event) => {
  console.log('[bq-sw] Push received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'BioQuiz Chat', body: event.data ? event.data.text() : 'New message' };
  }

  const title = data.title || 'BioQuiz Chat';
  const body = data.body || 'You have a new message';
  const options = {
    body: body,
    icon: data.icon || '/logo.svg',
    badge: '/logo.svg',
    tag: data.tag || 'bq-chat-' + Date.now(),
    renotify: true,
    data: {
      type: data.type || 'global',
      dmId: data.dmId || null,
      pUid: data.pUid || null,
      pName: data.pName || null,
      sender: data.sender || null,
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false,
    actions: [
      { action: 'reply', title: 'Reply', type: 'text' },
      { action: 'markRead', title: 'Mark Read' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click — open app and navigate to conversation
self.addEventListener('notificationclick', (event) => {
  console.log('[bq-sw] Notification clicked, action:', event.action, event.notification.data);
  event.notification.close();

  const data = event.notification.data || {};

  // Handle action buttons
  if (event.action === 'markRead') {
    // Just close — no navigation needed
    // Could post message to mark messages as read
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: 'bq-mark-read',
          notifType: data.type,
          dmId: data.dmId
        });
      }
    });
    return;
  }

  if (event.action === 'reply') {
    // event.reply contains the user's reply text (if type: 'text')
    const replyText = event.reply || '';
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: 'bq-notif-reply',
          notifType: data.type,
          dmId: data.dmId,
          pUid: data.pUid,
          pName: data.pName,
          reply: replyText
        });
        return client.focus();
      }
      // No existing window — open a new one
      if (clientList.length === 0) {
        self.clients.openWindow('/');
      }
    });
    return;
  }

  // Default click (no action button) — open/focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: {
              type: data.type,
              dmId: data.dmId,
              sender: data.sender
            }
          });
          return client.focus();
        }
      }
      return self.clients.openWindow('/');
    })
  );
});

// Notification close — optional analytics
self.addEventListener('notificationclose', (event) => {
  console.log('[bq-sw] Notification closed', event.notification.tag);
});
