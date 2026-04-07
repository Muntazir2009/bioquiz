/**
 * Messaging Handler
 * Manages sending messages, file uploads, and real-time updates
 */

export class MessagingHandler {
  constructor(messagingManager, storageManager, authManager, chatUI) {
    this.messaging = messagingManager;
    this.storage = storageManager;
    this.auth = authManager;
    this.ui = chatUI;
    this.currentConversationId = null;
    this.messageSubscription = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Message send button
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    // Message input - send on Enter
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // File upload button
    const fileUploadBtn = document.getElementById('file-upload-btn');
    const fileInput = document.getElementById('file-input');
    
    if (fileUploadBtn) {
      fileUploadBtn.addEventListener('click', () => {
        fileInput?.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Back to list button
    const backBtn = document.getElementById('back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBackToList());
    }
  }

  async handleSendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput?.value.trim();

    if (!content || !this.currentConversationId) {
      return;
    }

    try {
      const message = await this.messaging.sendMessage(
        this.currentConversationId,
        content
      );

      console.log('[MessagingHandler] Message sent:', message);
      
      // Add to UI
      const user = this.auth.getCurrentUser();
      this.ui.addMessage(user.display_name, content, true);

      // Clear input
      messageInput.value = '';
    } catch (error) {
      console.error('[MessagingHandler] Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  }

  async handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !this.currentConversationId) {
      return;
    }

    try {
      // Show uploading state
      const sendBtn = document.getElementById('send-btn');
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Uploading...';
      }

      // Upload file
      const fileData = await this.storage.uploadFile(
        file,
        `msg-${Date.now()}`
      );

      // Send message with file
      const messageInput = document.getElementById('message-input');
      const content = messageInput?.value.trim() || `Shared ${this.storage.getFileTypeIcon(file.type)}`;

      const message = await this.messaging.sendMessage(
        this.currentConversationId,
        content,
        fileData
      );

      console.log('[MessagingHandler] Message with file sent:', message);

      // Add to UI
      const user = this.auth.getCurrentUser();
      this.ui.addMessage(user.display_name, content, true, fileData);

      // Clear input and file selection
      messageInput.value = '';
      document.getElementById('file-input').value = '';

      // Restore button
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      }
    } catch (error) {
      console.error('[MessagingHandler] Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
      
      const sendBtn = document.getElementById('send-btn');
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      }
    }
  }

  async loadConversation(conversationId) {
    this.currentConversationId = conversationId;

    try {
      // Unsubscribe from previous conversation
      if (this.messageSubscription) {
        this.messaging.unsubscribeFromMessages(conversationId);
      }

      // Load messages
      const messages = await this.messaging.getMessages(conversationId);
      console.log('[MessagingHandler] Loaded messages:', messages.length);

      // Clear and display messages
      this.ui.clearMessages();
      messages.forEach(msg => {
        this.ui.addMessage(
          msg.sender?.display_name || 'Unknown',
          msg.content,
          msg.sender_id === this.auth.getCurrentUser().id,
          msg.file_url ? {
            url: msg.file_url,
            name: msg.file_name,
            type: msg.file_type,
            size: msg.file_size
          } : null
        );
      });

      // Subscribe to new messages
      this.subscribeToNewMessages(conversationId);

      // Show conversation view
      this.ui.showConversation('Conversation');
    } catch (error) {
      console.error('[MessagingHandler] Error loading conversation:', error);
      alert('Failed to load conversation');
    }
  }

  subscribeToNewMessages(conversationId) {
    try {
      this.messageSubscription = this.messaging.subscribeToMessages(
        conversationId,
        (newMessage) => {
          console.log('[MessagingHandler] New message received:', newMessage);

          const user = this.auth.getCurrentUser();
          const isOwn = newMessage.sender_id === user.id;

          this.ui.addMessage(
            newMessage.sender?.display_name || 'Unknown',
            newMessage.content,
            isOwn,
            newMessage.file_url ? {
              url: newMessage.file_url,
              name: newMessage.file_name,
              type: newMessage.file_type,
              size: newMessage.file_size
            } : null
          );
        }
      );
    } catch (error) {
      console.error('[MessagingHandler] Error subscribing to messages:', error);
    }
  }

  handleBackToList() {
    if (this.messageSubscription) {
      this.messaging.unsubscribeFromMessages(this.currentConversationId);
      this.messageSubscription = null;
    }
    this.currentConversationId = null;
    this.ui.backToList();
  }
}

export default MessagingHandler;
