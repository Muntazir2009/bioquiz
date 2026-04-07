/**
 * Simplified Chat Manager - Legacy compatibility layer
 * This file is kept for backward compatibility with existing code
 * New code should import managers directly from their modules
 */

export class ChatManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.conversations = [];
    this.currentConversation = null;
  }

  // Placeholder methods for backward compatibility
  async initializeFromStorage() {
    const storedUser = localStorage.getItem('chat_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('[ChatManager] Loaded user from storage:', this.currentUser.username);
      } catch (e) {
        console.error('[ChatManager] Error loading user:', e);
      }
    }
  }

  async registerUser(username, displayName, password = null) {
    console.log('[ChatManager] registerUser called - use AuthManager instead');
    throw new Error('Use AuthManager.register() instead');
  }

  async loginUser(username, password = null) {
    console.log('[ChatManager] loginUser called - use AuthManager instead');
    throw new Error('Use AuthManager.login() instead');
  }

  logoutUser() {
    this.currentUser = null;
    localStorage.removeItem('chat_user');
  }
}

// Export singleton for backward compatibility
export const chatManager = new ChatManager(null);
