/**
 * Storage & File Management Module
 * Handles file uploads and storage operations
 */

export class StorageManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }

  // Upload file for message
  async uploadFile(file, messageId) {
    try {
      if (file.size > this.maxFileSize) {
        throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${messageId}-${Date.now()}.${fileExt}`;
      const filePath = `messages/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await this.supabase.storage
        .from('chat_files')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data } = this.supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      };
    } catch (err) {
      console.error('[Storage] Error uploading file:', err);
      throw err;
    }
  }

  // Delete file from storage
  async deleteFile(filePath) {
    try {
      const { error } = await this.supabase.storage
        .from('chat_files')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Storage] Error deleting file:', err);
      throw err;
    }
  }

  // Check if file is image
  isImage(file) {
    return file.type.startsWith('image/');
  }

  // Check if file is video
  isVideo(file) {
    return file.type.startsWith('video/');
  }

  // Get file type icon
  getFileTypeIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('archive') || mimeType.includes('zip')) return '📦';
    return '📎';
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default StorageManager;
