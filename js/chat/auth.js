/**
 * Authentication Module
 * Handles user registration, login, and authentication logic
 */

export class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = this.loadLocalUser();
  }

  loadLocalUser() {
    const stored = localStorage.getItem('chat_user');
    return stored ? JSON.parse(stored) : null;
  }

  saveLocalUser(user) {
    localStorage.setItem('chat_user', JSON.stringify(user));
    this.currentUser = user;
  }

  clearLocalUser() {
    localStorage.removeItem('chat_user');
    localStorage.removeItem('chat_password_hash');
    this.currentUser = null;
  }

  // Check if username is available
  async checkUsernameAvailable(username) {
    try {
      const { data, error } = await this.supabase
        .from('chat_users')
        .select('id')
        .eq('username', username)
        .limit(1)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Not found - username is available
        return true;
      }
      
      return !data;
    } catch (err) {
      console.error('[Auth] Error checking username:', err);
      throw err;
    }
  }

  // Register new user with optional password
  async register(username, displayName = '', password = null, profilePic = null, about = '') {
    try {
      // Validate username format
      if (!username.match(/^@?[a-zA-Z0-9_]{3,20}$/)) {
        throw new Error('Username must be 3-20 characters, alphanumeric and underscores only');
      }

      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

      // Check if username exists
      const available = await this.checkUsernameAvailable(cleanUsername);
      if (!available) {
        throw new Error('Username already taken');
      }

      // Create password hash if password provided
      let passwordHash = null;
      if (password) {
        passwordHash = await this.hashPassword(password);
      }

      // Insert user into database
      const { data, error } = await this.supabase
        .from('chat_users')
        .insert([{
          username: cleanUsername,
          display_name: displayName || cleanUsername,
          password_hash: passwordHash,
          profile_pic: profilePic,
          about: about,
          last_seen: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Save to local storage
      const user = {
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        profile_pic: data.profile_pic,
        about: data.about,
        theme: 'dark'
      };

      this.saveLocalUser(user);

      // Save password hash locally if provided
      if (password) {
        localStorage.setItem('chat_password_hash', passwordHash);
      }

      return user;
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      throw err;
    }
  }

  // Login with username and optional password
  async login(username, password = null) {
    try {
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

      // Fetch user from database
      const { data, error } = await this.supabase
        .from('chat_users')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (error || !data) {
        throw new Error('User not found');
      }

      // Verify password if one is set
      if (data.password_hash) {
        if (!password) {
          throw new Error('Password required for this account');
        }
        const passwordHash = await this.hashPassword(password);
        if (passwordHash !== data.password_hash) {
          throw new Error('Invalid password');
        }
      }

      // Update last seen
      await this.supabase
        .from('chat_users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', data.id)
        .catch(e => console.warn('[Auth] Could not update last_seen:', e));

      // Save to local storage
      const user = {
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        profile_pic: data.profile_pic,
        about: data.about,
        theme: localStorage.getItem('chat_theme') || 'dark'
      };

      this.saveLocalUser(user);

      // Save password hash locally if provided
      if (password) {
        localStorage.setItem('chat_password_hash', await this.hashPassword(password));
      }

      return user;
    } catch (err) {
      console.error('[Auth] Login error:', err);
      throw err;
    }
  }

  // Simple password hash function (for demo - use proper bcrypt in production)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Logout
  logout() {
    this.clearLocalUser();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }
}

export default AuthManager;
