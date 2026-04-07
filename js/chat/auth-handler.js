/**
 * Chat Authentication Handler
 * Manages login, registration, and profile interactions
 */

export class AuthHandler {
  constructor(authManager, profileManager, themeManager, chatUI) {
    this.auth = authManager;
    this.profile = profileManager;
    this.theme = themeManager;
    this.ui = chatUI;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Auth form switches
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToRegister) {
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }

    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.handleThemeToggle());
    }

    // Close button
    const closeBtn = document.getElementById('close-chat');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.handleCloseChat());
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTabSwitch(e));
    });
  }

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;

    if (!username) {
      this.showError('Please enter a username');
      return;
    }

    try {
      const user = await this.auth.login(username, password || null);
      console.log('[AuthHandler] Login successful:', user.username);
      
      this.showSuccessMessage('Welcome back!');
      await this.loadUserProfile(user);
      this.ui.showChatMain();
      
      // Clear form
      document.getElementById('login-form')?.reset();
    } catch (error) {
      console.error('[AuthHandler] Login error:', error);
      this.showError(error.message || 'Login failed');
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username')?.value;
    const displayName = document.getElementById('register-display-name')?.value;
    const password = document.getElementById('register-password')?.value;
    const about = document.getElementById('register-about')?.value;

    if (!username) {
      this.showError('Please enter a username');
      return;
    }

    try {
      const user = await this.auth.register(
        username,
        displayName || username,
        password || null,
        null,
        about || ''
      );

      console.log('[AuthHandler] Registration successful:', user.username);
      
      this.showSuccessMessage('Account created successfully!');
      await this.loadUserProfile(user);
      this.ui.showChatMain();
      
      // Clear form
      document.getElementById('register-form')?.reset();
    } catch (error) {
      console.error('[AuthHandler] Registration error:', error);
      this.showError(error.message || 'Registration failed');
    }
  }

  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      this.auth.logout();
      this.ui.showAuthPanel();
      
      // Clear forms
      document.getElementById('login-form')?.reset();
      document.getElementById('register-form')?.reset();
      
      this.showSuccessMessage('Logged out successfully');
    }
  }

  handleThemeToggle() {
    const newTheme = this.theme.toggleTheme();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  handleCloseChat() {
    const panel = document.getElementById('chat-panel');
    if (panel) {
      panel.classList.remove('open');
    }
  }

  handleTabSwitch(e) {
    const tabName = e.target.dataset.tab;
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
      tabContent.classList.add('active');
    }

    // Load profile if profile tab
    if (tabName === 'profile') {
      this.loadAndDisplayProfile();
    }
  }

  async loadAndDisplayProfile() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    try {
      const profile = await this.profile.getProfile(user.id);
      this.displayProfile(profile);
    } catch (error) {
      console.error('[AuthHandler] Error loading profile:', error);
    }
  }

  displayProfile(profile) {
    const profileView = document.getElementById('profile-view');
    if (!profileView) return;

    const avatar = this.profile.getUserAvatar(profile);
    
    profileView.innerHTML = `
      <div class="profile-card">
        <img src="${avatar}" alt="${profile.display_name}" class="profile-avatar">
        <div class="profile-name">${profile.display_name}</div>
        <div class="profile-username">@${profile.username}</div>
        ${profile.about ? `<div class="profile-about">${profile.about}</div>` : ''}
        <button id="edit-profile-btn" class="btn-primary" style="width: 100%;">Edit Profile</button>
      </div>
    `;

    // Setup edit profile button
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.showEditProfileForm(profile));
    }
  }

  showEditProfileForm(profile) {
    const profileView = document.getElementById('profile-view');
    if (!profileView) return;

    profileView.innerHTML = `
      <form id="edit-profile-form" class="auth-form">
        <h3>Edit Profile</h3>
        <input type="text" id="edit-display-name" value="${profile.display_name}" placeholder="Display Name" required>
        <textarea id="edit-about" placeholder="About you (max 200 chars)" maxlength="200">${profile.about || ''}</textarea>
        <div style="display: flex; gap: 8px;">
          <button type="submit" class="btn-primary" style="flex: 1;">Save Changes</button>
          <button type="button" id="cancel-edit-btn" class="btn-link" style="flex: 1;">Cancel</button>
        </div>
      </form>
    `;

    // Setup form submission
    const form = document.getElementById('edit-profile-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleProfileUpdate(e, profile));
    }

    // Setup cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.displayProfile(profile));
    }
  }

  async handleProfileUpdate(e, oldProfile) {
    e.preventDefault();

    const displayName = document.getElementById('edit-display-name')?.value;
    const about = document.getElementById('edit-about')?.value;

    try {
      await this.profile.updateDisplayName(displayName);
      await this.profile.updateAbout(about);

      this.showSuccessMessage('Profile updated successfully');
      const user = this.auth.getCurrentUser();
      const updatedProfile = await this.profile.getProfile(user.id);
      this.displayProfile(updatedProfile);
    } catch (error) {
      console.error('[AuthHandler] Error updating profile:', error);
      this.showError(error.message || 'Failed to update profile');
    }
  }

  async loadUserProfile(user) {
    try {
      const profile = await this.profile.getProfile(user.id);
      console.log('[AuthHandler] Profile loaded:', profile);
      return profile;
    } catch (error) {
      console.error('[AuthHandler] Error loading profile:', error);
      throw error;
    }
  }

  showLoginForm() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
  }

  showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
  }

  showError(message) {
    alert('❌ ' + message);
  }

  showSuccessMessage(message) {
    console.log('[AuthHandler] ✓ ' + message);
    // Could show a toast here instead of just logging
  }
}

export default AuthHandler;
