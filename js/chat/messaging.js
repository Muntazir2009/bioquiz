/**
 * Messaging Module
 * Handles real-time message operations
 */

export class MessagingManager {
  constructor(supabaseClient, authManager) {
    this.supabase = supabaseClient;
    this.auth = authManager;
    this.subscriptions = new Map();
  }

  // Send message
  async sendMessage(conversationId, content, fileData = null) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content,
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        file_size: fileData?.size || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('[Messaging] Error sending message:', err);
      throw err;
    }
  }

  // Get conversation messages
  async getMessages(conversationId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.reverse();
    } catch (err) {
      console.error('[Messaging] Error fetching messages:', err);
      throw err;
    }
  }

  // Subscribe to new messages in conversation
  subscribeToMessages(conversationId, callback) {
    try {
      const subscription = this.supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            callback(payload.new);
          }
        )
        .subscribe();

      this.subscriptions.set(`messages:${conversationId}`, subscription);
      return subscription;
    } catch (err) {
      console.error('[Messaging] Error subscribing to messages:', err);
      throw err;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Messaging] Error deleting message:', err);
      throw err;
    }
  }

  // Edit message
  async editMessage(messageId, newContent) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Messaging] Error editing message:', err);
      throw err;
    }
  }

  // Unsubscribe from messages
  unsubscribeFromMessages(conversationId) {
    const key = `messages:${conversationId}`;
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key).unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  // Unsubscribe all
  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }
}

export default MessagingManager;
