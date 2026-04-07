/**
 * Chat Manager - Core chat system handler
 * Manages connections, conversations, messages, and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js';

class ChatManager {
  constructor() {
    this.supabase = createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
    
    this.currentUser = null;
    this.conversations = [];
    this.currentConversation = null;
    this.subscriptions = [];
    this.messageListeners = [];
    this.userListeners = [];
    this.conversationListeners = [];
    
    this.initializeFromStorage();
  }

  /**
   * Initialize user from localStorage if available
   */
  initializeFromStorage() {
    const storedUser = localStorage.getItem('chat_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('[Chat] Loaded user from storage:', this.currentUser.username);
      } catch (e) {
        console.error('[Chat] Error loading user from storage:', e);
        localStorage.removeItem('chat_user');
      }
    }
  }

  /**
   * Register a new user with username and optional password
   */
  async registerUser(username, displayName, password = null) {
    try {
      console.log('[Chat] Registering user:', username);

      // Check if username already exists
      const { data: existing } = await this.supabase
        .from('chat_users')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        throw new Error('Username already taken');
      }

      // Hash password if provided (simple client-side hash - for production use bcrypt)
      let passwordHash = null;
      if (password) {
        passwordHash = await this.hashPassword(password);
      }

      // Create user
      const { data: user, error } = await this.supabase
        .from('chat_users')
        .insert([
          {
            username,
            display_name: displayName || username,
            password_hash: passwordHash,
            avatar_url: this.generateAvatarUrl(username),
            status: 'online',
            theme: 'dark'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      this.currentUser = user;
      localStorage.setItem('chat_user', JSON.stringify(user));
      
      // Update online status
      await this.updateUserStatus('online');

      this.notifyUserListeners(this.currentUser);
      return user;
    } catch (error) {
      console.error('[Chat] Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with username and password
   */
  async loginUser(username, password = null) {
    try {
      console.log('[Chat] Logging in user:', username);

      const { data: user, error } = await this.supabase
        .from('chat_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Verify password if set
      if (user.password_hash && password) {
        const matches = await this.verifyPassword(password, user.password_hash);
        if (!matches) {
          throw new Error('Invalid password');
        }
      }

      this.currentUser = user;
      localStorage.setItem('chat_user', JSON.stringify(user));
      
      // Update online status
      await this.updateUserStatus('online');

      this.notifyUserListeners(this.currentUser);
      return user;
    } catch (error) {
      console.error('[Chat] Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logoutUser() {
    try {
      if (this.currentUser) {
        await this.updateUserStatus('offline');
      }

      this.currentUser = null;
      localStorage.removeItem('chat_user');
      this.unsubscribeAll();
      this.notifyUserListeners(null);
    } catch (error) {
      console.error('[Chat] Logout error:', error);
    }
  }

  /**
   * Get or create DM conversation
   */
  async getOrCreateDM(otherUserId) {
    try {
      const { data: participants, error: pError } = await this.supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.currentUser.id);

      if (pError) throw pError;

      // Find existing DM
      for (const p of participants) {
        const { data: conv } = await this.supabase
          .from('conversations')
          .select('*')
          .eq('id', p.conversation_id)
          .eq('type', 'dm')
          .single();

        if (conv) {
          const { data: otherP } = await this.supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', p.conversation_id);

          if (otherP && otherP.length === 2 && otherP.some(x => x.user_id === otherUserId)) {
            return conv;
          }
        }
      }

      // Create new DM
      const { data: conv, error: cError } = await this.supabase
        .from('conversations')
        .insert([
          {
            type: 'dm',
            created_by: this.currentUser.id
          }
        ])
        .select()
        .single();

      if (cError) throw cError;

      // Add participants
      await this.supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conv.id, user_id: this.currentUser.id },
          { conversation_id: conv.id, user_id: otherUserId }
        ]);

      return conv;
    } catch (error) {
      console.error('[Chat] Error getting/creating DM:', error);
      throw error;
    }
  }

  /**
   * Get or create group conversation
   */
  async getOrCreateGroup(name, description = '', members = []) {
    try {
      const { data: conv, error } = await this.supabase
        .from('conversations')
        .insert([
          {
            type: 'group',
            name,
            description,
            created_by: this.currentUser.id,
            avatar_url: this.generateGroupAvatarUrl(name)
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add current user as admin
      await this.supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conv.id, user_id: this.currentUser.id, role: 'admin' }
        ]);

      // Add other members
      if (members.length > 0) {
        const memberRecords = members.map(userId => ({
          conversation_id: conv.id,
          user_id: userId,
          role: 'member'
        }));
        await this.supabase
          .from('conversation_participants')
          .insert(memberRecords);
      }

      return conv;
    } catch (error) {
      console.error('[Chat] Error creating group:', error);
      throw error;
    }
  }

  /**
   * Load conversations for current user
   */
  async loadConversations() {
    try {
      if (!this.currentUser) return [];

      const { data: participants, error: pError } = await this.supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.currentUser.id);

      if (pError) throw pError;

      const conversationIds = participants.map(p => p.conversation_id);

      if (conversationIds.length === 0) {
        this.conversations = [];
        return [];
      }

      const { data: convs, error: cError } = await this.supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (cError) throw cError;

      // Enrich with participant info and unread counts
      for (const conv of convs) {
        const { data: parts } = await this.supabase
          .from('conversation_participants')
          .select('user_id, chat_users(username, display_name, avatar_url, status)')
          .eq('conversation_id', conv.id);

        const { data: unread } = await this.supabase
          .from('unread_counts')
          .select('count')
          .eq('conversation_id', conv.id)
          .eq('user_id', this.currentUser.id)
          .single();

        conv.participants = parts || [];
        conv.unreadCount = unread?.count || 0;
      }

      this.conversations = convs;
      this.notifyConversationListeners(this.conversations);
      return convs;
    } catch (error) {
      console.error('[Chat] Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Load messages for a conversation
   */
  async loadMessages(conversationId, limit = 50) {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*, chat_users(username, display_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .is('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Mark as read
      await this.supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', this.currentUser.id);

      // Reset unread count
      await this.supabase
        .from('unread_counts')
        .upsert({
          user_id: this.currentUser.id,
          conversation_id: conversationId,
          count: 0
        });

      return messages || [];
    } catch (error) {
      console.error('[Chat] Error loading messages:', error);
      return [];
    }
  }

  /**
   * Send a message
   */
  async sendMessage(conversationId, content, type = 'text', fileData = null) {
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      // Upload file if provided
      if (fileData && type !== 'text') {
        const result = await this.uploadFile(conversationId, fileData);
        fileUrl = result.url;
        fileName = result.name;
        fileSize = result.size;
        fileType = result.type;
      }

      const { data: message, error } = await this.supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: this.currentUser.id,
            content,
            message_type: type,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType
          }
        ])
        .select('*, chat_users(username, display_name, avatar_url)')
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await this.supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Increment unread count for other participants
      await this.incrementUnreadCounts(conversationId);

      return message;
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time messages
   */
  subscribeToMessages(conversationId, callback) {
    const subscription = this.supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('[Chat] Message update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Subscribe to user status changes
   */
  subscribeToUserStatus(userId, callback) {
    const subscription = this.supabase
      .channel(`user:${userId}:status`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('[Chat] User status update:', payload);
          callback(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Update user online status
   */
  async updateUserStatus(status) {
    try {
      if (!this.currentUser) return;

      const { error } = await this.supabase
        .from('chat_users')
        .update({
          status,
          last_seen: new Date().toISOString()
        })
        .eq('id', this.currentUser.id);

      if (error) throw error;

      this.currentUser.status = status;
      this.notifyUserListeners(this.currentUser);
    } catch (error) {
      console.error('[Chat] Error updating status:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(displayName, aboutText, avatarFile = null) {
    try {
      if (!this.currentUser) return;

      let avatarUrl = this.currentUser.avatar_url;

      if (avatarFile) {
        const result = await this.uploadProfilePicture(avatarFile);
        avatarUrl = result.url;
      }

      const { data: user, error } = await this.supabase
        .from('chat_users')
        .update({
          display_name: displayName,
          about: aboutText,
          avatar_url: avatarUrl
        })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.currentUser = user;
      localStorage.setItem('chat_user', JSON.stringify(user));
      this.notifyUserListeners(this.currentUser);

      return user;
    } catch (error) {
      console.error('[Chat] Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(conversationId, fileData) {
    try {
      const fileName = `${Date.now()}_${fileData.name}`;
      const filePath = `chat/${conversationId}/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('chat-files')
        .upload(filePath, fileData);

      if (uploadError) throw uploadError;

      const { data } = this.supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type
      };
    } catch (error) {
      console.error('[Chat] Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file) {
    try {
      const fileName = `${this.currentUser.id}_${Date.now()}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = this.supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return { url: data.publicUrl };
    } catch (error) {
      console.error('[Chat] Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Increment unread counts for other participants
   */
  async incrementUnreadCounts(conversationId) {
    try {
      const { data: participants } = await this.supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', this.currentUser.id);

      if (!participants) return;

      for (const p of participants) {
        await this.supabase
          .from('unread_counts')
          .upsert({
            user_id: p.user_id,
            conversation_id: conversationId,
            count: (await this.supabase
              .from('unread_counts')
              .select('count')
              .eq('user_id', p.user_id)
              .eq('conversation_id', conversationId)
              .single()).data?.count || 0 + 1
          });
      }
    } catch (error) {
      console.error('[Chat] Error incrementing unread:', error);
    }
  }

  /**
   * Hash password (client-side - use bcrypt for production)
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Verify password
   */
  async verifyPassword(password, hash) {
    const newHash = await this.hashPassword(password);
    return newHash === hash;
  }

  /**
   * Generate avatar URL from username
   */
  generateAvatarUrl(username) {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'];
    const colorIndex = username.charCodeAt(0) % colors.length;
    const initials = username.substring(0, 2).toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=128&font-size=0.4&rounded=true`;
  }

  /**
   * Generate group avatar
   */
  generateGroupAvatarUrl(groupName) {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1'];
    const colorIndex = groupName.charCodeAt(0) % colors.length;
    const initials = groupName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=128&font-size=0.4&rounded=true`;
  }

  /**
   * Add message listener
   */
  onMessageChange(callback) {
    this.messageListeners.push(callback);
  }

  /**
   * Add user listener
   */
  onUserChange(callback) {
    this.userListeners.push(callback);
  }

  /**
   * Add conversation listener
   */
  onConversationChange(callback) {
    this.conversationListeners.push(callback);
  }

  /**
   * Notify message listeners
   */
  notifyMessageListeners(message) {
    this.messageListeners.forEach(cb => cb(message));
  }

  /**
   * Notify user listeners
   */
  notifyUserListeners(user) {
    this.userListeners.forEach(cb => cb(user));
  }

  /**
   * Notify conversation listeners
   */
  notifyConversationListeners(conversations) {
    this.conversationListeners.forEach(cb => cb(conversations));
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach(sub => {
      this.supabase.removeChannel(sub);
    });
    this.subscriptions = [];
  }
}

// Export singleton instance
export const chatManager = new ChatManager();
export default ChatManager;
