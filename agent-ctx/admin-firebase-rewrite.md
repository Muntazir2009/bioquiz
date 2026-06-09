# Task: Rewrite Admin Panel with Real-Time Firebase Chat Controls

## Summary
Completely rewrote `src/app/admin/page.tsx` (from ~2130 lines to 1632 lines) replacing all polling-based data fetching with Firebase Realtime Database `onValue()` listeners.

## Key Changes

### 1. Firebase Real-Time Listeners (Replaces Polling)
- Added direct Firebase SDK imports: `initializeApp, getApps, getDatabase, ref, onValue, off, set, remove, push, get`
- Created `getFirebaseDb()` singleton for database access
- Set up 8 real-time listeners on auth:
  - `bq_messages` - Global chat messages
  - `bq_dms` - DM conversations list
  - `bq_presence` - Online users
  - `bq_widget_config/settings` - Widget config (real-time sync)
  - `bq_banned` - Banned users
  - `bq_muted` - Muted users
  - `bq_warnings` - Warnings
  - `bq_pinned` - Pinned messages
- Dynamic DM messages listener when a DM is selected
- All listeners properly cleaned up on unmount with `off()`
- Status indicator changed from "Polling" to "Real-time" (green dot)

### 2. Enhanced Global Chat Section
- Live message feed with real-time updates
- Per-message actions: delete, pin/unpin, warn user, mute user
- Pinned messages display at top with amber highlight
- User status badges (BANNED, MUTED) shown on messages
- Bulk select and delete
- Chat export as JSON
- Message statistics: Total, Today, Active Chatters, Peak Hour, Most Active User
- Search/filter preserved

### 3. Enhanced DM Section
- Real-time DM conversation list
- Click DM to view messages in real-time (dedicated Firebase listener)
- Per-message actions: delete, warn user
- DM export as JSON
- Back button to return to list

### 4. User Management with Real-Time Controls
- Live online users list with BANNED/MUTED badges
- Per-user actions: Warn (with dialog), Mute (with dialog), Ban, Kick
- Banned users list with unban capability
- Muted users list with unmute capability and reason display
- Recent warnings list

### 5. Announcements Section
- Toggle announcement enabled/disabled (writes to Firebase immediately)
- Set announcement text and color
- Live preview when enabled
- All changes real-time via Firebase

### 6. Maintenance Mode (Real-Time)
- Toggle maintenance mode on/off (writes to Firebase immediately)
- Set maintenance message
- Visual indicator in header when maintenance is active
- Warning banner in maintenance section when enabled

### 7. New Features
- **Message Statistics**: Total messages, messages today, peak hour, most active user
- **Chat Export**: Export global chat or DM as JSON
- **User Activity Log**: Recent warnings displayed
- **Pin Messages**: Pin/unpin important messages (writes to `bq_pinned`)
- **Mute Users**: Temporarily mute a user with reason (writes to `bq_muted`)
- **Warn Users**: Send a warning to a user with reason (writes to `bq_warnings`)
- **Warn/Mute Dialogs**: Modal dialogs for entering reasons

### 8. Widget Config (Immediate Write)
- Removed 300ms debounce
- All config changes write immediately via API (which does Firebase PATCH)
- Real-time listener reads back and clears syncing indicator

## What Was Preserved
- Login screen (identical)
- Sidebar structure (identical categories/items)
- File management section (identical)
- Disk usage section (identical)
- All helper components (StatCard, ConfigToggle, ConfigSlider, ConfigSelect, ConfigColorPicker, ToggleSwitch, SyncIndicator)
- Visual style (monochrome, clean, minimal)
- All widget config sections (themes, layout, messages-appearance, content-filter, rate-limiting, general, security, notifications, data)

## Dev Log
- No errors in compilation
- Page loads successfully with 200 status
- Lint check passes
- File size: 1632 lines (well under 3000 limit)
