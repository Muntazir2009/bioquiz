/* ═══════════════════════════════════════════════════════════════
   BioQuiz Chat — Service Worker for Push Notifications
   Handles push events when tab/browser is closed
   ═══════════════════════════════════════════════════════════════ */

const SW_VERSION = '1.0.0';

// Install event
self.addEventListener('install', (event) => {
  console.log('[bq-sw] Service Worker installed v' + SW_VERSION);
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[bq-sw] Service Worker activated');
  event.waitUntil(self.clients.claim());
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
  const options = {
    body: data.body || 'You have a new message',
    icon: data.icon || '/logo.svg',
    badge: '/logo.svg',
    tag: data.tag || 'bq-chat-' + Date.now(),
    data: {
      type: data.type || 'global',    // 'global' or 'dm'
      dmId: data.dmId || null,
      pUid: data.pUid || null,
      pName: data.pName || null,
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click — open app and navigate to conversation
self.addEventListener('notificationclick', (event) => {
  console.log('[bq-sw] Notification clicked', event.notification.data);
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          // Send navigation message to the focused client
          client.postMessage({
            type: 'bq-notif-click',
            notifType: data.type,
            dmId: data.dmId,
            pUid: data.pUid,
            pName: data.pName
          });
          return client.focus();
        }
      }
      // No existing window — open a new one
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Message from the main page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'bq-ping') {
    event.source.postMessage({ type: 'bq-pong', version: SW_VERSION });
  }
});
