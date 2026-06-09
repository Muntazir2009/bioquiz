# Task 3-6: Enhance BioQuiz Admin Panel

## Summary
Enhanced the BioQuiz admin panel at `/home/z/my-project/src/app/admin/page.tsx` with the following additions:

### 1. Widget Refresh Button in Header
- Added `RotateCcw` icon button next to the existing `RefreshCw` button
- On click: dispatches `bq-admin-refresh` custom event, removes `#bq-chat-script`, `#bqb`, `#bqp` elements, re-creates script tag with cache-bust timestamp
- Shows toast notification "Widget refreshed" for 2 seconds

### 2. New "Widget" Tab (icon: `MessageSquare`)
- **General section**: Widget Enabled, Disguise Mode, Auto Open (toggles), Auto Open Delay (slider 0-10s)
- **Appearance section**: Default Theme (select), Accent Color (color picker), Widget Position (select), Bubble Size (slider 40-72px), Panel Width (slider 300-500px), Panel Height (slider 400-800px)
- **Messages section**: Character Limit (slider 100-1000), Max Messages (slider 20-100), Font Size (select)
- **Features section**: Profanity Filter, Slow Mode, Rate Limiting, Link Filter (toggles), Slow Mode Interval (conditional slider 1-60s)
- **Announcements section**: Announcement Enabled (toggle), Announcement Color (color picker), Announcement Text (text input with 200 char limit and counter)

All controls read from `/api/admin/widget-config` and write with 300ms debounce, showing a sync indicator.

### 3. New "Activity" Tab (icon: `Activity`)
- **Stats Cards**: Online Now, Total Messages, Active Today (estimated)
- **Online Users section**: Fetches from `/api/admin/activity`, shows avatar initial, username, status dot (green/yellow/red), last seen time
- **Recent Messages section**: Last 20 messages from activity API, sender name, truncated text, timestamp, color-coded system messages
- Auto-refreshes every 10 seconds

### 4. New "Settings" Tab (icon: `Settings`)
- **Security**: Password change (two inputs + save), Session Timeout (select)
- **Data Management**: Export Config (JSON download), Import Config (file upload), Reset to Defaults (with confirmation dialog)
- **Notifications**: Push Notifications, Sound on Message, Haptic Feedback (toggles)
- **Maintenance**: Maintenance Mode toggle (writes to widget config), Maintenance Message text input

### Implementation Details
- Updated `Tab` type: `"overview" | "files" | "storage" | "widget" | "activity" | "settings"`
- Added reusable components: `ToggleSwitch`, `SyncIndicator`, `ConfigToggle`, `ConfigSlider`, `ConfigSelect`, `ConfigColorPicker`
- Widget config state with `defaultWidgetConfig` defaults
- Debounced writes using `useRef` for timeout management
- All existing functionality (overview, files, storage tabs) preserved exactly as before
- Lint passes clean
