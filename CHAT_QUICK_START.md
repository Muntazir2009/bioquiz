# Real-Time Chat System - Quick Start Guide

## What's Been Built

A comprehensive, production-ready real-time chat system with:
- User authentication with usernames (@username format)
- User profiles with pictures and bios
- Direct messaging (DMs) between users
- Group chat rooms
- File sharing (images, videos, documents)
- Browser push notifications
- Dual themes (Dark & Light)
- Responsive design (mobile, tablet, desktop)
- Beautiful UI with gradients and smooth animations
- Real-time message synchronization via Supabase

## Quick Setup (3 Steps)

### Step 1: Set Supabase Credentials

Your Supabase credentials are already configured. The chat system will use:
- `NEXT_PUBLIC_SUPABASE_URL` from your environment
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your environment

These are stored in localStorage and retrieved automatically.

### Step 2: Create Database Tables

**Option A: Via Supabase Console (Recommended)**
1. Go to your Supabase project
2. Open SQL Editor
3. Copy all SQL from `/scripts/setup-chat-db.sql`
4. Paste into the editor and execute

**Option B: Via Script**
```bash
node /vercel/share/v0-project/scripts/setup-chat-db.js
```

### Step 3: Start Using!

The chat system is automatically loaded on all HTML pages:
1. Look for the floating blue chat button (bottom right)
2. Click it to open the chat panel
3. Create a new account with @username
4. Start chatting!

## File Locations

```
/js/chat/                          # All chat modules
├── auth.js                        # Authentication
├── profile.js                     # Profiles & avatars
├── messaging.js                   # Real-time messages
├── storage.js                     # File uploads
├── theme.js                       # Theme switching
├── chat-ui.js                     # UI components
├── auth-handler.js                # Login/Register handlers
├── messaging-handler.js           # Message handlers
├── notifications.js               # Push notifications
├── service-worker.js              # Background notifications
└── init.js                        # System initialization

/css/chat.css                      # Beautiful dual-theme styles
/scripts/setup-chat-db.js          # Database setup
/CHAT_SYSTEM_DOCUMENTATION.md      # Full documentation
```

## Key Features

### Authentication
- Register with unique @username (3-20 characters, alphanumeric + underscore)
- Optional password for multi-device login
- Local login for single-device access
- Real-time username availability check

### User Profiles
- Display name
- Profile picture (auto-generated if not provided)
- About/bio section (max 200 chars)
- Online/offline status
- Last seen timestamp

### Messaging
- Real-time message delivery
- Message history
- Typing indicators support
- Unread message counts
- Message read receipts (via backend)

### Media Sharing
- Upload images with inline preview
- Upload videos with player
- Share documents (PDFs, Word, Excel, etc.)
- File size limit: 50MB

### Notifications
- In-app badge on chat button
- Browser push notifications (when away)
- Toast notifications for new messages
- Notification sound support

### Themes
- Dark theme (cyan & pink accents) - default
- Light theme (blue accents)
- Toggle with sun/moon button in chat header
- Smooth transitions
- Persistent theme preference

## How It Works

### Frontend Architecture
1. **Initialization** - `init.js` loads all modules on page load
2. **Authentication** - User logs in/registers via `auth-handler.js`
3. **Messaging** - `messaging-handler.js` sends/receives messages in real-time
4. **Real-time Sync** - Supabase subscriptions update messages instantly
5. **Notifications** - Service Worker triggers push notifications
6. **Theming** - CSS custom properties enable smooth theme switching

### Real-Time Flow
```
User Types Message
    ↓
sendMessage() called
    ↓
Message stored in Supabase
    ↓
Supabase realtime subscription triggered
    ↓
Message received on all connected clients
    ↓
Message rendered in UI
    ↓
Unread count updated
    ↓
Push notification sent (if user away)
```

### Database Flow
```
chat_users (user profiles)
    ↓
conversations (DMs & groups)
    ↓
conversation_participants (who's in each chat)
    ↓
messages (actual chat messages)
    ↓
unread_counts (badge numbers)
    ↓
push_subscriptions (browser notifications)
```

## Customization Options

### Change Colors
Edit `/css/chat.css` root variables:
```css
:root {
  --theme-primary: #00d9ff;      /* Main accent color */
  --theme-accent: #ff006e;       /* Secondary color */
  --theme-background: #0f0f1e;   /* Dark background */
}
```

### Change Sizes
Adjust in `/css/chat.css`:
```css
#chat-panel {
  width: 420px;      /* Panel width */
  height: 680px;     /* Panel height */
}

.chat-floating-btn {
  width: 60px;       /* Button size */
  height: 60px;
}
```

### Add Custom Handlers
Extend handlers in `/js/chat/`:
```javascript
// In messaging-handler.js
async handleSendMessage() {
  // Add custom logic here
}
```

## Testing Checklist

- [ ] Chat button appears on all pages
- [ ] Can register new account
- [ ] Can login with username
- [ ] Profile picture uploads
- [ ] Messages send in real-time
- [ ] File upload works
- [ ] Theme toggle works
- [ ] Mobile view is responsive
- [ ] Push notifications show
- [ ] Unread badge updates
- [ ] Messages sync across tabs

## Troubleshooting

### Chat button not showing?
- Check browser console (F12) for errors
- Verify Supabase credentials in Settings → Vars
- Clear browser cache and reload

### Can't log in?
- Check username spelling and @ prefix
- Verify database tables were created
- Check Supabase database in project console

### Messages not sending?
- Verify user is logged in
- Check network tab in DevTools
- Ensure Supabase realtime is enabled
- Check Row Level Security policies

### Push notifications not working?
- Allow notifications in browser settings
- Service Worker must be registered (check DevTools)
- Need VAPID keys for production

## File Upload Limits

- Image: All formats supported, recommended <10MB
- Video: MP4, WebM, <50MB
- Document: PDF, Word, Excel, Zip, <50MB

## Browser Compatibility

Works on:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## API Reference (Global)

```javascript
// Access via window.chatSystem

// Authentication
chatSystem.auth.register(username, displayName, password, profilePic, about)
chatSystem.auth.login(username, password)
chatSystem.auth.logout()
chatSystem.auth.getCurrentUser()

// Messaging
chatSystem.messaging.sendMessage(conversationId, content, fileData)
chatSystem.messaging.getMessages(conversationId, limit)
chatSystem.messaging.subscribeToMessages(conversationId, callback)

// Profiles
chatSystem.profile.getProfile(userId)
chatSystem.profile.updateDisplayName(name)
chatSystem.profile.updateAbout(bio)
chatSystem.profile.uploadProfilePic(file)

// Storage
chatSystem.storage.uploadFile(file, messageId)
chatSystem.storage.deleteFile(filePath)

// Theme
chatSystem.theme.toggleTheme()
chatSystem.theme.setTheme('dark' | 'light')
chatSystem.theme.getTheme()

// UI
chatSystem.ui.showConversation(name)
chatSystem.ui.addMessage(username, text, isOwn, fileData)
```

## Next Steps

1. Deploy to production
2. Configure VAPID keys for push notifications
3. Set up email verification (optional)
4. Add user blocking/reporting (optional)
5. Implement message search (optional)
6. Add call/video features (optional)

## Support & Questions

- Read CHAT_SYSTEM_DOCUMENTATION.md for detailed info
- Check browser console for error messages
- Review Supabase docs: https://supabase.com/docs
- Check chat module comments for implementation details

---

**You're all set! Start the chat system and begin messaging!**
