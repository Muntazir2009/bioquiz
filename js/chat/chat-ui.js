/**
 * Chat UI - Handles the floating chat widget and interface
 */

import { chatManager } from './chat-manager.js';

class ChatUI {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.currentTheme = localStorage.getItem('chat_theme') || 'dark';
    this.notificationBadge = null;
    
    this.initializeGlobally();
  }

  /**
   * Initialize chat widget globally on every page
   */
  initializeGlobally() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'chat-widget-container';
    document.body.appendChild(this.container);

    // Create floating button
    this.createFloatingButton();
    
    // Create main chat interface
    this.createChatInterface();

    // Load theme
    this.applyTheme(this.currentTheme);

    // Listen for user changes
    chatManager.onUserChange((user) => {
      this.updateUIForUser(user);
    });

    // Listen for conversation changes
    chatManager.onConversationChange((conversations) => {
      this.updateConversationList(conversations);
    });
  }

  /**
   * Create floating chat button
   */
  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'chat-float-button';
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span id="chat-badge" class="chat-badge hidden">0</span>
    `;
    button.className = 'chat-float-button';
    button.onclick = () => this.toggleChat();
    
    this.container.appendChild(button);
    this.notificationBadge = button.querySelector('#chat-badge');
  }

  /**
   * Create main chat interface
   */
  createChatInterface() {
    const chatPanel = document.createElement('div');
    chatPanel.id = 'chat-panel';
    chatPanel.className = 'chat-panel hidden';
    chatPanel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-title">
          <h2>Messages</h2>
          <button class="chat-theme-toggle" id="theme-toggle" title="Toggle theme">
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
        <button class="chat-close-btn" id="close-chat">×</button>
      </div>

      <div class="chat-tabs">
        <button class="chat-tab active" data-tab="conversations">Chats</button>
        <button class="chat-tab" data-tab="users">Users</button>
        <button class="chat-tab" data-tab="profile">Profile</button>
      </div>

      <div class="chat-content">
        <!-- Conversations Tab -->
        <div class="chat-tab-panel active" id="tab-conversations">
          <div class="chat-auth-area" id="auth-area">
            <div class="chat-welcome">
              <h3>Welcome to Chat</h3>
              <p>Sign in to start messaging</p>
            </div>
            <div class="chat-auth-form">
              <input type="text" id="auth-username" placeholder="Username (3-20 chars)" maxlength="20">
              <input type="text" id="auth-display" placeholder="Display Name (optional)">
              <input type="password" id="auth-password" placeholder="Password (optional)">
              <button id="auth-register" class="chat-btn primary">Register</button>
              <button id="auth-login" class="chat-btn secondary">Login</button>
            </div>
          </div>
          <div class="chat-conversations-area hidden" id="conversations-area">
            <button class="chat-btn primary" id="new-dm-btn" style="width: 100%; margin-bottom: 10px;">+ New DM</button>
            <button class="chat-btn secondary" id="new-group-btn" style="width: 100%; margin-bottom: 10px;">+ New Group</button>
            <div class="chat-list" id="conversations-list"></div>
          </div>
        </div>

        <!-- Users Tab -->
        <div class="chat-tab-panel" id="tab-users">
          <div class="chat-users-area">
            <input type="text" id="users-search" placeholder="Search users..." class="chat-search">
            <div class="chat-list" id="users-list"></div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div class="chat-tab-panel" id="tab-profile">
          <div class="chat-profile-area" id="profile-area">
            <div class="chat-profile-header">
              <img id="profile-avatar" src="" alt="Avatar" class="chat-profile-avatar">
              <input type="file" id="profile-avatar-upload" accept="image/*" style="display: none;">
              <button class="chat-btn small" id="upload-avatar-btn">Change Avatar</button>
            </div>
            <div class="chat-profile-form">
              <input type="text" id="profile-display" placeholder="Display Name">
              <textarea id="profile-about" placeholder="About (max 200 chars)" maxlength="200"></textarea>
              <button class="chat-btn primary" id="save-profile-btn">Save Profile</button>
            </div>
            <button class="chat-btn danger" id="logout-btn">Logout</button>
          </div>
        </div>

        <!-- Message View -->
        <div id="message-view" class="chat-message-view hidden">
          <div class="chat-message-header">
            <button class="chat-back-btn">← Back</button>
            <h3 id="message-title">Chat</h3>
            <div class="chat-message-status" id="message-status"></div>
          </div>
          <div class="chat-messages" id="messages-container"></div>
          <div class="chat-message-input">
            <input type="text" id="message-input" placeholder="Type a message...">
            <button id="file-upload-btn" title="Upload file">📎</button>
            <button id="send-btn" title="Send message">📤</button>
            <input type="file" id="file-input" style="display: none;">
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(chatPanel);
    this.attachEventListeners();
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Auth
    document.getElementById('auth-register').addEventListener('click', () => this.handleRegister());
    document.getElementById('auth-login').addEventListener('click', () => this.handleLogin());

    // Chat actions
    document.getElementById('new-dm-btn').addEventListener('click', () => this.showUserSelector('dm'));
    document.getElementById('new-group-btn').addEventListener('click', () => this.showUserSelector('group'));

    // Profile
    document.getElementById('upload-avatar-btn').addEventListener('click', () => {
      document.getElementById('profile-avatar-upload').click();
    });
    document.getElementById('profile-avatar-upload').addEventListener('change', (e) => this.handleAvatarUpload(e));
    document.getElementById('save-profile-btn').addEventListener('click', () => this.handleSaveProfile());
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

    // Messages
    document.getElementById('send-btn').addEventListener('click', () => this.handleSendMessage());
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        this.handleSendMessage();
      }
    });
    document.getElementById('file-upload-btn').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

    // Close chat
    document.getElementById('close-chat').addEventListener('click', () => this.toggleChat());

    // Tab switching
    document.querySelectorAll('.chat-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Back button in message view
    document.querySelector('.chat-back-btn').addEventListener('click', () => this.closeMessageView());
  }

  /**
   * Toggle chat panel
   */
  toggleChat() {
    this.isOpen = !this.isOpen;
    document.getElementById('chat-panel').classList.toggle('hidden', !this.isOpen);
    
    if (this.isOpen && chatManager.currentUser) {
      chatManager.loadConversations();
    }
  }

  /**
   * Switch tabs
   */
  switchTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.chat-tab-panel').forEach(p => {
      p.classList.add('hidden');
    });

    // Deactivate all tabs
    document.querySelectorAll('.chat-tab').forEach(t => {
      t.classList.remove('active');
    });

    // Show selected panel
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'users') {
      this.loadUsers();
    }
  }

  /**
   * Handle user registration
   */
  async handleRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const displayName = document.getElementById('auth-display').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!username || username.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    try {
      await chatManager.registerUser(username, displayName || username, password);
      this.updateUIForUser(chatManager.currentUser);
      alert('Registration successful!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  /**
   * Handle user login
   */
  async handleLogin() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!username) {
      alert('Please enter a username');
      return;
    }

    try {
      await chatManager.loginUser(username, password);
      this.updateUIForUser(chatManager.currentUser);
      alert('Login successful!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      await chatManager.logoutUser();
      this.updateUIForUser(null);
    }
  }

  /**
   * Update UI based on user state
   */
  updateUIForUser(user) {
    const authArea = document.getElementById('auth-area');
    const conversationsArea = document.getElementById('conversations-area');
    const profileArea = document.getElementById('profile-area');

    if (user) {
      authArea.classList.add('hidden');
      conversationsArea.classList.remove('hidden');
      
      // Update profile
      document.getElementById('profile-avatar').src = user.avatar_url;
      document.getElementById('profile-display').value = user.display_name;
      document.getElementById('profile-about').value = user.about || '';

      chatManager.loadConversations();
    } else {
      authArea.classList.remove('hidden');
      conversationsArea.classList.add('hidden');
    }
  }

  /**
   * Update conversation list
   */
  updateConversationList(conversations) {
    const list = document.getElementById('conversations-list');
    list.innerHTML = '';

    conversations.forEach(conv => {
      const item = document.createElement('div');
      item.className = 'chat-conversation-item';
      if (conv.unreadCount > 0) {
        item.classList.add('unread');
      }

      let title = conv.name || 'Direct Message';
      let subtitle = '';
      let avatar = conv.avatar_url || '';

      if (conv.type === 'dm' && conv.participants.length > 0) {
        const otherUser = conv.participants.find(p => p.user_id !== chatManager.currentUser.id);
        if (otherUser) {
          title = otherUser.chat_users?.display_name || 'User';
          avatar = otherUser.chat_users?.avatar_url || '';
          subtitle = otherUser.chat_users?.status || 'offline';
        }
      }

      item.innerHTML = `
        <img src="${avatar}" alt="${title}" class="chat-conv-avatar">
        <div class="chat-conv-info">
          <div class="chat-conv-title">${title}</div>
          <div class="chat-conv-subtitle">${subtitle}</div>
        </div>
        ${conv.unreadCount > 0 ? `<span class="chat-conv-badge">${conv.unreadCount}</span>` : ''}
      `;

      item.addEventListener('click', () => this.openConversation(conv));
      list.appendChild(item);
    });
  }

  /**
   * Open conversation
   */
  async openConversation(conversation) {
    chatManager.currentConversation = conversation;
    
    // Hide conversations, show messages
    document.getElementById('conversations-area').classList.add('hidden');
    document.getElementById('message-view').classList.remove('hidden');

    // Update title
    let title = conversation.name || 'Direct Message';
    if (conversation.type === 'dm' && conversation.participants.length > 0) {
      const otherUser = conversation.participants.find(p => p.user_id !== chatManager.currentUser.id);
      if (otherUser) {
        title = otherUser.chat_users?.display_name || 'User';
      }
    }
    document.getElementById('message-title').textContent = title;

    // Load messages
    const messages = await chatManager.loadMessages(conversation.id);
    this.displayMessages(messages);

    // Subscribe to new messages
    chatManager.subscribeToMessages(conversation.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        this.addMessage(payload.new);
      }
    });
  }

  /**
   * Display messages
   */
  displayMessages(messages) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    messages.forEach(msg => {
      this.addMessage(msg);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Add message to view
   */
  addMessage(msg) {
    const container = document.getElementById('messages-container');
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message';
    
    if (msg.sender_id === chatManager.currentUser.id) {
      msgEl.classList.add('own');
    }

    let content = msg.content;
    if (msg.message_type === 'image') {
      content = `<img src="${msg.file_url}" alt="Image" class="chat-message-image">`;
    } else if (msg.message_type === 'video') {
      content = `<video src="${msg.file_url}" controls class="chat-message-video"></video>`;
    } else if (msg.message_type === 'file') {
      content = `<a href="${msg.file_url}" target="_blank" class="chat-message-file">📥 ${msg.file_name}</a>`;
    }

    const senderName = msg.chat_users?.display_name || 'Unknown';
    const senderAvatar = msg.chat_users?.avatar_url || '';

    msgEl.innerHTML = `
      <img src="${senderAvatar}" alt="${senderName}" class="chat-message-avatar">
      <div class="chat-message-content">
        <div class="chat-message-sender">${senderName}</div>
        <div class="chat-message-text">${content}</div>
        <div class="chat-message-time">${new Date(msg.created_at).toLocaleTimeString()}</div>
      </div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Handle send message
   */
  async handleSendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content || !chatManager.currentConversation) return;

    input.value = '';
    input.focus();

    try {
      await chatManager.sendMessage(chatManager.currentConversation.id, content, 'text');
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
  }

  /**
   * Handle file upload
   */
  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || !chatManager.currentConversation) return;

    const messageType = file.type.startsWith('image') ? 'image' :
                       file.type.startsWith('video') ? 'video' : 'file';

    try {
      await chatManager.sendMessage(
        chatManager.currentConversation.id,
        `Sent a ${messageType}`,
        messageType,
        file
      );
    } catch (error) {
      alert('Error uploading file: ' + error.message);
    }

    e.target.value = '';
  }

  /**
   * Load users
   */
  async loadUsers() {
    const { data: users } = await chatManager.supabase
      .from('chat_users')
      .select('*')
      .neq('id', chatManager.currentUser.id);

    const list = document.getElementById('users-list');
    list.innerHTML = '';

    (users || []).forEach(user => {
      const item = document.createElement('div');
      item.className = 'chat-user-item';
      item.innerHTML = `
        <img src="${user.avatar_url}" alt="${user.display_name}" class="chat-user-avatar">
        <div class="chat-user-info">
          <div class="chat-user-name">${user.display_name}</div>
          <div class="chat-user-status ${user.status}">${user.status}</div>
        </div>
      `;
      item.addEventListener('click', () => this.startDM(user));
      list.appendChild(item);
    });
  }

  /**
   * Start DM with user
   */
  async startDM(user) {
    try {
      const conv = await chatManager.getOrCreateDM(user.id);
      this.openConversation(conv);
    } catch (error) {
      alert('Error starting chat: ' + error.message);
    }
  }

  /**
   * Show user selector for DM or group
   */
  showUserSelector(type) {
    // TODO: Implement user selector modal
  }

  /**
   * Handle avatar upload
   */
  async handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await chatManager.updateProfile(
        document.getElementById('profile-display').value,
        document.getElementById('profile-about').value,
        file
      );
      document.getElementById('profile-avatar').src = chatManager.currentUser.avatar_url;
      alert('Avatar updated!');
    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    }

    e.target.value = '';
  }

  /**
   * Handle save profile
   */
  async handleSaveProfile() {
    try {
      await chatManager.updateProfile(
        document.getElementById('profile-display').value,
        document.getElementById('profile-about').value
      );
      alert('Profile updated!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  }

  /**
   * Close message view
   */
  closeMessageView() {
    document.getElementById('message-view').classList.add('hidden');
    document.getElementById('conversations-area').classList.remove('hidden');
    chatManager.unsubscribeAll();
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('chat_theme', this.currentTheme);
    this.applyTheme(this.currentTheme);

    if (chatManager.currentUser) {
      chatManager.updateProfile(
        chatManager.currentUser.display_name,
        chatManager.currentUser.about
      );
    }
  }

  /**
   * Apply theme
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--chat-bg', '#1a1a2e');
      root.style.setProperty('--chat-bg-secondary', '#16213e');
      root.style.setProperty('--chat-text', '#e0e0e0');
      root.style.setProperty('--chat-text-secondary', '#a0a0a0');
      root.style.setProperty('--chat-border', '#2d3561');
      root.style.setProperty('--chat-accent', '#00d4ff');
      document.body.classList.remove('chat-light-theme');
      document.body.classList.add('chat-dark-theme');
    } else {
      root.style.setProperty('--chat-bg', '#f5f5f5');
      root.style.setProperty('--chat-bg-secondary', '#ffffff');
      root.style.setProperty('--chat-text', '#333333');
      root.style.setProperty('--chat-text-secondary', '#666666');
      root.style.setProperty('--chat-border', '#e0e0e0');
      root.style.setProperty('--chat-accent', '#0099ff');
      document.body.classList.remove('chat-dark-theme');
      document.body.classList.add('chat-light-theme');
    }
  }

  /**
   * Update notification badge
   */
  updateNotificationBadge(count) {
    if (count > 0) {
      this.notificationBadge.textContent = count;
      this.notificationBadge.classList.remove('hidden');
    } else {
      this.notificationBadge.classList.add('hidden');
    }
  }
}

// Export singleton instance
export const chatUI = new ChatUI();
export default ChatUI;
