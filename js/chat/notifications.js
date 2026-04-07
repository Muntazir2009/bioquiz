/**
 * Notifications Manager - Handles push notifications and browser alerts
 */

class NotificationsManager {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.initializeServiceWorker();
  }

  /**
   * Initialize service worker and request notification permission
   */
  async initializeServiceWorker() {
    if (!this.isSupported) {
      console.log('[Notifications] Push notifications not supported');
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(
        '/js/chat/service-worker.js'
      );
      console.log('[Notifications] Service worker registered');

      // Request notification permission
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('[Notifications] Permission:', permission);
      }

      // Subscribe to push notifications
      if (Notification.permission === 'granted') {
        await this.subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('[Notifications] Service worker registration failed:', error);
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications() {
    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('[Notifications] Subscribing to push...');
        // In a production app, you would have a VAPID public key from your server
        // For now, we'll just use the endpoint
      } else {
        console.log('[Notifications] Already subscribed');
      }
    } catch (error) {
      console.error('[Notifications] Subscription error:', error);
    }
  }

  /**
   * Show notification
   */
  showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.log('[Notifications] Notification not allowed');
      return;
    }

    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.showNotification(title, {
        icon: '/images/logo.png',
        badge: '/images/badge.png',
        ...options
      });
    }
  }

  /**
   * Show in-app notification (toast)
   */
  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'chat-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Show new message notification
   */
  showMessageNotification(senderName, message) {
    this.showNotification(`New message from ${senderName}`, {
      body: message,
      tag: 'new-message',
      requireInteraction: false
    });

    this.showToast(`📬 ${senderName}: ${message.substring(0, 50)}...`);
  }

  /**
   * Show typing indicator
   */
  showTypingNotification(userName) {
    this.showToast(`✍️ ${userName} is typing...`, 2000);
  }
}

// Export singleton
export const notificationsManager = new NotificationsManager();
export default NotificationsManager;
