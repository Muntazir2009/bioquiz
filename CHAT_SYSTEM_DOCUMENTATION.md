# Real-Time Chat System - Complete Documentation

## Overview
A comprehensive real-time chat and communication system with support for direct messages (DMs), group chat rooms, user authentication, profile management, file sharing, and browser push notifications.

## Architecture

### Core Components

#### 1. **Authentication System** (`auth.js`)
- Username-based registration with exclusive usernames
- Optional password-based multi-device login
- SHA-256 password hashing
- Local storage persistence for device-only login
- Session management

#### 2. **Profile Management** (`profile.js`)
- User profiles with display names and bios
- Profile picture uploads via Supabase Storage
- Automatic avatar generation with initials
- Profile viewing and editing

#### 3. **Messaging** (`messaging.js`)
- Real-time message sending and receiving
- Supabase realtime subscriptions for live updates
- Message history retrieval
- File attachment support

#### 4. **File Storage** (`storage.js`)
- File uploads to Supabase Storage
- Support for images, videos, and documents
- 50MB file size limit
- Public URL generation

#### 5. **Theme Management** (`theme.js`)
- Dark and Light themes
- Smooth theme transitions
- CSS custom property-based theming
- Theme persistence in localStorage

#### 6. **UI Components** (`chat-ui.js`)
- Floating chat button with notification badge
- Expandable chat panel
- Tabbed interface (DMs, Groups, Profile)
- Real-time message rendering
- File preview capabilities

#### 7. **Event Handlers**
- **AuthHandler** (`auth-handler.js`): Login, registration, profile updates
- **MessagingHandler** (`messaging-handler.js`): Message sending, file uploads, real-time sync

#### 8. **Notifications** (`notifications.js`)
- Service Worker registration
- Browser push notifications
- In-app toast notifications
- Notification badge on chat button

#### 9. **Service Worker** (`service-worker.js`)
- Background push notifications
- Notification click handling
- Page focus management

## Database Schema

### Tables

#### `chat_users`
```sql
- id (UUID, Primary Key)
- username (TEXT, Unique)
- display_name (TEXT)
- password_hash (TEXT, nullable)
- profile_pic (TEXT, nullable)
- about (TEXT)
- status (TEXT: 'online', 'away', 'offline')
- last_seen (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `conversations`
```sql
- id (UUID, Primary Key)
- type (TEXT: 'dm', 'group')
- name (TEXT, nullable)
- description (TEXT, nullable)
- created_by (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `conversation_participants`
```sql
- id (UUID, Primary Key)
- conversation_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- role (TEXT: 'member', 'admin')
- joined_at (TIMESTAMP)
- last_read_at (TIMESTAMP, nullable)
```

#### `messages`
```sql
- id (UUID, Primary Key)
- conversation_id (UUID, Foreign Key)
- sender_id (UUID, Foreign Key)
- content (TEXT)
- file_url (TEXT, nullable)
- file_name (TEXT, nullable)
- file_type (TEXT, nullable)
- file_size (BIGINT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP, nullable)
```

#### `push_subscriptions`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- endpoint (TEXT)
- p256dh (TEXT)
- auth (TEXT)
- created_at (TIMESTAMP)
```

#### `unread_counts`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- conversation_id (UUID, Foreign Key)
- count (INTEGER)
```

### Row Level Security (RLS)

All tables have RLS policies enabling:
- Users can only view their own data
- Users can only see conversations they're part of
- Messages are readable by conversation participants
- Write access is controlled by user ID

### Realtime Subscriptions

Enabled on:
- `messages` table for real-time message delivery
- `chat_users` table for status updates
- `unread_counts` table for badge updates

## File Structure

```
/vercel/share/v0-project/
├── js/chat/
│   ├── auth.js                 # Authentication manager
│   ├── profile.js              # Profile manager
│   ├── messaging.js            # Messaging manager
│   ├── storage.js              # File storage manager
│   ├── theme.js                # Theme manager
│   ├── chat-ui.js              # UI component
│   ├── chat-manager.js         # Legacy compatibility layer
│   ├── auth-handler.js         # Auth event handler
│   ├── messaging-handler.js    # Messaging event handler
│   ├── notifications.js        # Notifications manager
│   ├── service-worker.js       # Service worker
│   └── init.js                 # System initializer
├── css/
│   └── chat.css                # Dual-theme styles
├── scripts/
│   ├── setup-chat-db.sql       # Database setup SQL
│   ├── setup-chat-db.js        # Database setup script
│   └── add-chat-to-pages.js    # HTML injection script
└── CHAT_SETUP_INSTRUCTIONS.md  # Setup guide
```

## Configuration

### Environment Variables

Required in `.env` or Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are automatically used by the chat system via localStorage or Supabase global.

### Database Setup

1. Copy SQL from `/scripts/setup-chat-db.sql`
2. Paste into Supabase SQL Editor
3. Execute to create tables and policies
4. Or run: `node scripts/setup-chat-db.js`

## Usage

### User Registration

```javascript
const user = await chatSystem.auth.register(
  '@username',           // Username with @ prefix
  'Display Name',        // Optional
  'password123',         // Optional
  profileImageFile,      // Optional File object
  'My bio text'         // Optional
);
```

### User Login

```javascript
const user = await chatSystem.auth.login('@username', 'password');
```

### Sending Messages

```javascript
const message = await chatSystem.messaging.sendMessage(
  conversationId,
  'Hello, world!'
);
```

### Uploading Files

```javascript
const fileData = await chatSystem.storage.uploadFile(fileObject, messageId);
const messageWithFile = await chatSystem.messaging.sendMessage(
  conversationId,
  'Check this out',
  fileData
);
```

### Profile Management

```javascript
// Update profile
await chatSystem.profile.updateDisplayName('New Name');
await chatSystem.profile.updateAbout('New bio');

// Upload profile picture
const url = await chatSystem.profile.uploadProfilePic(fileObject);
```

### Theme Switching

```javascript
// Toggle between dark and light
const newTheme = chatSystem.theme.toggleTheme();

// Set specific theme
chatSystem.theme.setTheme('light');

// Get current theme
const currentTheme = chatSystem.theme.getTheme();
```

## Features

### Authentication
- Username-based registration
- Optional password protection
- Device-based and multi-device login
- Automatic username availability checking
- Session persistence

### Direct Messages (DMs)
- One-to-one private conversations
- Real-time message delivery
- Message history
- Unread message tracking

### Group Chats
- Create and manage group conversations
- Add/remove members
- Admin roles
- Group descriptions

### Media Sharing
- Image uploads with inline preview
- Video uploads with player
- Document downloads
- 50MB file size limit

### Notifications
- In-app badge on chat icon
- Browser push notifications (with Service Worker)
- Toast notifications for new messages
- Typing indicators

### User Profiles
- Custom display names
- Profile pictures with auto-generated avatars
- Bio/about section (max 200 characters)
- Online status tracking
- Last seen tracking

### Themes
- Dark theme (default, cyan accents)
- Light theme (blue accents)
- Smooth transitions
- Persistent theme preference

### User Experience
- Responsive design (mobile, tablet, desktop)
- Floating chat button on all pages
- Smooth animations
- Glowing gradients
- Frosted glass effect panels
- Real-time synchronization

## Security Features

### Authentication
- SHA-256 password hashing (client-side demo, use bcrypt in production)
- Optional password-based access control
- Session storage in localStorage

### Data Protection
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Message access restricted to conversation participants

### File Handling
- Supabase Storage with file access control
- File size validation
- File type checking

## Styling

### Color System (3-5 colors)
**Dark Theme:**
- Primary: #00d9ff (cyan)
- Accent: #ff006e (pink)
- Background: #0f0f1e
- Surface: #16213e
- Text: #ffffff

**Light Theme:**
- Primary: #0099cc
- Accent: #d4006e
- Background: #ffffff
- Surface: #f9f9f9
- Text: #1a1a1a

### Design Elements
- Frosted glass panels (backdrop-filter)
- Gradient buttons with glow effects
- Animated message bubbles
- Smooth micro-interactions
- Responsive flexbox layouts

## Responsive Breakpoints

- Mobile (<480px): Full-screen overlay
- Tablet (480-768px): Full-width panel
- Desktop (>768px): Anchored panel (420x680px)

## Performance Optimizations

- Lazy loading of modules via ES6 imports
- Efficient DOM manipulation
- Real-time subscription optimization
- Service Worker caching
- CSS custom properties for theming

## Browser Compatibility

- Modern browsers with ES6 support
- Service Workers (for notifications)
- Web Crypto API (for password hashing)
- LocalStorage
- Supabase JavaScript client

## Testing Checklist

- [ ] Database tables created successfully
- [ ] User can register with unique username
- [ ] User can login with username/password
- [ ] Profile picture can be uploaded
- [ ] Messages send and receive in real-time
- [ ] Files can be uploaded and previewed
- [ ] Theme toggle works smoothly
- [ ] Chat appears on all HTML pages
- [ ] Floating button has notification badge
- [ ] Push notifications work (with VAPID keys)
- [ ] Responsive design works on mobile
- [ ] Unread message count updates
- [ ] Messages sync across browser tabs

## Future Enhancements

- [ ] Message search functionality
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Call/video integration
- [ ] Message editing/deletion
- [ ] User blocking
- [ ] Message pinning
- [ ] Conversation muting
- [ ] Read receipts
- [ ] User mentions (@)
- [ ] Message threads
- [ ] Scheduled messages
- [ ] Message export

## Troubleshooting

### Chat not appearing
- Check browser console for errors
- Verify Supabase credentials in localStorage
- Ensure chat.css is loaded
- Check that init.js is imported in all HTML files

### Messages not sending
- Verify user is logged in
- Check Supabase database permissions
- Ensure conversation participant record exists
- Check network tab for API errors

### File upload fails
- Check file size (max 50MB)
- Verify Supabase Storage bucket exists
- Check bucket permissions
- Ensure storage access is enabled

### Push notifications not working
- Allow notifications in browser settings
- Service Worker must be registered
- VAPID keys needed for production
- Check Service Worker in DevTools

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Chat system source code comments
- Browser Developer Console for error messages
