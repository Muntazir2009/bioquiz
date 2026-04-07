/**
 * Profile Management Module
 * Handles user profile updates, avatar uploads, and profile viewing
 */

export class ProfileManager {
  constructor(supabaseClient, authManager) {
    this.supabase = supabaseClient;
    this.auth = authManager;
  }

  // Get user profile by ID or username
  async getProfile(userIdentifier) {
    try {
      let query = this.supabase.from('chat_users').select('*');
      
      if (userIdentifier.startsWith('@')) {
        query = query.eq('username', userIdentifier.substring(1));
      } else if (!isNaN(userIdentifier)) {
        query = query.eq('id', userIdentifier);
      } else {
        query = query.eq('username', userIdentifier);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[Profile] Error fetching profile:', err);
      throw err;
    }
  }

  // Update profile
  async updateProfile(updates) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await this.supabase
        .from('chat_users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local storage
      const updated = { ...user, ...updates };
      this.auth.saveLocalUser(updated);

      return data;
    } catch (err) {
      console.error('[Profile] Error updating profile:', err);
      throw err;
    }
  }

  // Upload profile picture
  async uploadProfilePic(file) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('chat_files')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = this.supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      const profilePicUrl = data.publicUrl;

      // Update user profile
      await this.updateProfile({ profile_pic: profilePicUrl });

      return profilePicUrl;
    } catch (err) {
      console.error('[Profile] Error uploading profile pic:', err);
      throw err;
    }
  }

  // Delete profile picture
  async deleteProfilePic() {
    try {
      await this.updateProfile({ profile_pic: null });
      return null;
    } catch (err) {
      console.error('[Profile] Error deleting profile pic:', err);
      throw err;
    }
  }

  // Update about section
  async updateAbout(about) {
    if (about.length > 200) {
      throw new Error('About section must be 200 characters or less');
    }
    return this.updateProfile({ about });
  }

  // Update display name
  async updateDisplayName(displayName) {
    if (!displayName || displayName.length < 1 || displayName.length > 50) {
      throw new Error('Display name must be 1-50 characters');
    }
    return this.updateProfile({ display_name: displayName });
  }

  // Get user avatar or generate initials
  getUserAvatar(user) {
    if (user.profile_pic) {
      return user.profile_pic;
    }
    
    // Generate initials avatar
    const initials = (user.display_name || user.username)
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return this.generateInitialsAvatar(initials);
  }

  // Generate SVG avatar with initials
  generateInitialsAvatar(initials) {
    const colors = ['#00d9ff', '#ff00d9', '#00ff00', '#ff6600', '#0066ff'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="${color}"/>
        <text x="50" y="65" font-size="40" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">
          ${initials}
        </text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
}

export default ProfileManager;
