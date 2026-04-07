/**
 * Chat UI Module - Handles rendering and UI interactions
 */

export class ChatUI {
  constructor() {
    this.container = null;
    this.isOpen = false;
  }

  // Create chat panel HTML
  createChatPanel() {
    const html = `
      <div id="chat-panel" class="chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title-bar">
            <h2>Messages</h2>
            <div class="header-actions">
              <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
                <span>🌙</span>
              </button>
              <button class="close-btn" id="close-chat">✕</button>
            </div>
          </div>
        </div>

        <!-- Auth Panel -->
        <div id="auth-panel" class="chat-section auth-section">
          <div class="auth-forms">
            <!-- Login Form -->
            <form id="login-form" class="auth-form">
              <h3>Sign In</h3>
              <input type="text" id="login-username" placeholder="@username" required>
              <input type="password" id="login-password" placeholder="Password (optional)">
              <button type="submit" class="btn-primary">Sign In</button>
              <button type="button" id="switch-to-register" class="btn-link">Create Account</button>
            </form>

            <!-- Register Form -->
            <form id="register-form" class="auth-form" style="display: none;">
              <h3>Create Account</h3>
              <input type="text" id="register-username" placeholder="@username" required>
              <input type="text" id="register-display-name" placeholder="Display Name">
              <input type="password" id="register-password" placeholder="Password (optional)">
              <textarea id="register-about" placeholder="About you (max 200 chars)" maxlength="200"></textarea>
              <button type="submit" class="btn-primary">Create Account</button>
              <button type="button" id="switch-to-login" class="btn-link">Sign In Instead</button>
            </form>
          </div>
        </div>

        <!-- Chat Panel (after auth) -->
        <div id="chat-main" class="chat-section" style="display: none;">
          <!-- Tabs -->
          <div class="chat-tabs">
            <button class="tab-btn active" data-tab="dms">Direct Messages</button>
            <button class="tab-btn" data-tab="groups">Groups</button>
            <button class="tab-btn" data-tab="profile">Profile</button>
          </div>

          <!-- DMs Tab -->
          <div id="dms-tab" class="tab-content active">
            <div class="new-dm-button">
              <button id="new-dm-btn" class="btn-primary">+ New Message</button>
            </div>
            <div id="dm-list" class="conversation-list"></div>
          </div>

          <!-- Groups Tab -->
          <div id="groups-tab" class="tab-content">
            <div class="new-group-button">
              <button id="new-group-btn" class="btn-primary">+ Create Group</button>
            </div>
            <div id="group-list" class="conversation-list"></div>
          </div>

          <!-- Profile Tab -->
          <div id="profile-tab" class="tab-content">
            <div id="profile-view" class="profile-section"></div>
            <button id="logout-btn" class="btn-danger">Logout</button>
          </div>

          <!-- Conversation View -->
          <div id="conversation-view" class="conversation-container" style="display: none;">
            <div class="conversation-header">
              <button id="back-to-list" class="back-btn">← Back</button>
              <div id="conv-title" class="conv-title"></div>
            </div>
            <div id="messages-container" class="messages-container"></div>
            <div class="message-input-area">
              <input type="text" id="message-input" placeholder="Type a message..." class="message-input">
              <button id="send-btn" class="btn-send">Send</button>
              <button id="file-upload-btn" class="btn-attachment" title="Attach file">📎</button>
              <input type="file" id="file-input" style="display: none;">
            </div>
          </div>
        </div>
      </div>
    `;
    return html;
  }

  // Initialize UI
  init() {
    // Check if already initialized
    if (document.getElementById('chat-panel')) {
      return;
    }

    // Create and append panel
    const panel = document.createElement('div');
    panel.innerHTML = this.createChatPanel();
    document.body.appendChild(panel.firstElementChild);

    console.log('[ChatUI] UI initialized');
  }

  // Update notification badge
  updateNotificationBadge(count) {
    const badge = document.getElementById('chat-notification-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Show conversation
  showConversation(conversationName) {
    const mainView = document.getElementById('conversation-view');
    const listView = document.getElementById('chat-main').querySelector('.tab-content.active');
    if (mainView && listView) {
      listView.style.display = 'none';
      mainView.style.display = 'block';
      document.getElementById('conv-title').textContent = conversationName;
    }
  }

  // Go back to list
  backToList() {
    const mainView = document.getElementById('conversation-view');
    const tabs = document.querySelectorAll('#chat-main .tab-content');
    if (mainView) {
      mainView.style.display = 'none';
    }
    if (tabs.length > 0) {
      tabs[0].style.display = 'block';
    }
  }

  // Show auth panel
  showAuthPanel() {
    const authPanel = document.getElementById('auth-panel');
    const chatMain = document.getElementById('chat-main');
    if (authPanel) authPanel.style.display = 'block';
    if (chatMain) chatMain.style.display = 'none';
  }

  // Show chat main
  showChatMain() {
    const authPanel = document.getElementById('auth-panel');
    const chatMain = document.getElementById('chat-main');
    if (authPanel) authPanel.style.display = 'none';
    if (chatMain) chatMain.style.display = 'block';
  }

  // Add message to conversation
  addMessage(username, text, isOwn = false, fileData = null) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : 'other'}`;
    
    let fileHtml = '';
    if (fileData) {
      if (fileData.type.startsWith('image/')) {
        fileHtml = `<img src="${fileData.url}" class="message-image" alt="image">`;
      } else if (fileData.type.startsWith('video/')) {
        fileHtml = `<video class="message-video" controls><source src="${fileData.url}" type="${fileData.type}"></video>`;
      } else {
        fileHtml = `<a href="${fileData.url}" class="file-link" download>📥 ${fileData.name}</a>`;
      }
    }

    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-author">${username}</div>
        <div class="message-text">${text}</div>
        ${fileHtml}
      </div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
  }

  // Clear messages
  clearMessages() {
    const container = document.getElementById('messages-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  // Add conversation to list
  addConversationToList(id, name, lastMessage, unreadCount, tab = 'dms') {
    const list = document.getElementById(`${tab}-list`);
    if (!list) return;

    const convEl = document.createElement('div');
    convEl.className = 'conversation-item';
    convEl.dataset.conversationId = id;
    
    convEl.innerHTML = `
      <div class="conversation-info">
        <div class="conversation-name">${name}</div>
        <div class="conversation-preview">${lastMessage}</div>
      </div>
      ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
    `;

    list.appendChild(convEl);
  }

  // Clear conversation list
  clearConversationList(tab = 'dms') {
    const list = document.getElementById(`${tab}-list`);
    if (list) {
      list.innerHTML = '';
    }
  }
}

// Export singleton
export const chatUI = new ChatUI();
export default ChatUI;
