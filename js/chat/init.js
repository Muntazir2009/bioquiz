/**
 * Chat System Initializer
 * This file initializes the entire chat system globally
 */

// Global configuration
window.SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
                      localStorage.getItem('supabase_url');

window.SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                           (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
                           localStorage.getItem('supabase_key');

// Import chat modules
import { chatManager } from './chat-manager.js';
import { chatUI } from './chat-ui.js';
import { notificationsManager } from './notifications.js';

/**
 * Initialize chat system
 */
function initializeChat() {
  // Validate Supabase credentials
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.error('[Chat Init] Missing Supabase credentials. Please set environment variables.');
    return;
  }

  console.log('[Chat Init] Initializing chat system...');

  // Initialize chat UI (creates floating button and panel)
  console.log('[Chat Init] Chat UI initialized');

  // Setup idle detection for online status
  setupIdleDetection();

  // Setup message event listener
  chatManager.onMessageChange((message) => {
    console.log('[Chat Init] New message:', message);
  });

  // Setup unread count updates
  updateUnreadCounts();

  console.log('[Chat Init] Chat system ready!');
}

/**
 * Setup idle detection for user status
 */
function setupIdleDetection() {
  let idleTimer = null;
  let idleTime = 0;
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTime = 0;

    if (chatManager.currentUser && chatManager.currentUser.status !== 'online') {
      chatManager.updateUserStatus('online');
    }

    idleTimer = setTimeout(() => {
      if (chatManager.currentUser) {
        chatManager.updateUserStatus('away');
      }
    }, IDLE_TIMEOUT);
  }

  // Track user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
  });

  // Check online status on page visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (chatManager.currentUser) {
        chatManager.updateUserStatus('away');
      }
    } else {
      if (chatManager.currentUser) {
        chatManager.updateUserStatus('online');
      }
    }
  });

  // Set initial timer
  resetIdleTimer();
}

/**
 * Update unread counts periodically
 */
async function updateUnreadCounts() {
  if (!chatManager.currentUser) return;

  try {
    const { data: conversations } = await chatManager.supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', chatManager.currentUser.id);

    if (!conversations) return;

    let totalUnread = 0;

    for (const conv of conversations) {
      const { data: unread } = await chatManager.supabase
        .from('unread_counts')
        .select('count')
        .eq('user_id', chatManager.currentUser.id)
        .eq('conversation_id', conv.conversation_id)
        .single();

      if (unread) {
        totalUnread += unread.count;
      }
    }

    chatUI.updateNotificationBadge(totalUnread);
  } catch (error) {
    console.error('[Chat Init] Error updating unread counts:', error);
  }

  // Update again in 30 seconds
  setTimeout(updateUnreadCounts, 30000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChat);
} else {
  initializeChat();
}

// Export for global access
window.chatManager = chatManager;
window.chatUI = chatUI;
window.notificationsManager = notificationsManager;

console.log('[Chat Init] Chat system loaded. Access via window.chatManager, window.chatUI, window.notificationsManager');
