# Real-Time Chat System Setup Instructions

## Database Setup (Manual)

Since the automated script execution has limitations, please follow these steps to set up the database manually:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `/scripts/setup-chat-db.sql`
6. Paste it into the SQL editor
7. Click "Run" to execute all commands
8. Wait for completion (should see success messages)

## What Gets Created

- **chat_users**: User profiles with username, password, avatar, about, and status
- **conversations**: DM and group chat rooms
- **conversation_participants**: Links users to conversations with roles
- **messages**: All chat messages with file support
- **push_subscriptions**: Browser push notification subscriptions
- **unread_counts**: Tracks unread messages per user per conversation

All tables have Row Level Security (RLS) enabled and realtime subscriptions are configured.

## Environment Variables

Ensure these are set in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Next Steps

Once the database is set up, the chat system will automatically:
1. Initialize when you load any page with the chat widget
2. Handle user authentication with username registration
3. Support real-time messaging across all pages
4. Handle file uploads to Supabase Storage
5. Show browser push notifications
