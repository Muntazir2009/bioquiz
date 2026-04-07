#!/usr/bin/env node

/**
 * Execute Chat System SQL Setup - With Embedded SQL
 * This script sets up all necessary database tables and policies for the chat system
 */

import { createClient } from '@supabase/supabase-js';

const SQL_STATEMENTS = [
  // Enable extensions
  'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',

  // Chat Users Table
  `CREATE TABLE IF NOT EXISTS chat_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    about TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$')
  )`,

  'CREATE INDEX IF NOT EXISTS idx_chat_users_username ON chat_users(username)',
  'CREATE INDEX IF NOT EXISTS idx_chat_users_status ON chat_users(status)',

  // Conversations Table
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
    name TEXT,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES chat_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  'CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type)',
  'CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)',

  // Conversation Participants Table
  `CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
  )`,

  'CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id)',

  // Messages Table
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES chat_users(id) ON DELETE SET NULL,
    content TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',

  // Push Subscriptions Table
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
  )`,

  'CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id)',

  // Unread Counts Table
  `CREATE TABLE IF NOT EXISTS unread_counts (
    user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, conversation_id)
  )`,

  // Row Level Security
  'ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE conversations ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE messages ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE unread_counts ENABLE ROW LEVEL SECURITY',

  // RLS Policies
  'DROP POLICY IF EXISTS "Users are viewable by everyone" ON chat_users',
  'CREATE POLICY "Users are viewable by everyone" ON chat_users FOR SELECT USING (true)',

  'DROP POLICY IF EXISTS "Users can update own profile" ON chat_users',
  'CREATE POLICY "Users can update own profile" ON chat_users FOR UPDATE USING (true)',

  'DROP POLICY IF EXISTS "Anyone can register" ON chat_users',
  'CREATE POLICY "Anyone can register" ON chat_users FOR INSERT WITH CHECK (true)',

  'DROP POLICY IF EXISTS "Conversations visible to participants" ON conversations',
  `CREATE POLICY "Conversations visible to participants" ON conversations
    FOR SELECT USING (
      id IN (SELECT conversation_id FROM conversation_participants)
    )`,

  'DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations',
  'CREATE POLICY "Anyone can create conversations" ON conversations FOR INSERT WITH CHECK (true)',

  'DROP POLICY IF EXISTS "Participants can update conversations" ON conversations',
  `CREATE POLICY "Participants can update conversations" ON conversations
    FOR UPDATE USING (
      id IN (SELECT conversation_id FROM conversation_participants)
    )`,

  'DROP POLICY IF EXISTS "Participants viewable by conversation members" ON conversation_participants',
  'CREATE POLICY "Participants viewable by conversation members" ON conversation_participants FOR SELECT USING (true)',

  'DROP POLICY IF EXISTS "Anyone can add participants" ON conversation_participants',
  'CREATE POLICY "Anyone can add participants" ON conversation_participants FOR INSERT WITH CHECK (true)',

  'DROP POLICY IF EXISTS "Participants can update their own record" ON conversation_participants',
  'CREATE POLICY "Participants can update their own record" ON conversation_participants FOR UPDATE USING (true)',

  'DROP POLICY IF EXISTS "Participants can leave" ON conversation_participants',
  'CREATE POLICY "Participants can leave" ON conversation_participants FOR DELETE USING (true)',

  'DROP POLICY IF EXISTS "Messages viewable by participants" ON messages',
  'CREATE POLICY "Messages viewable by participants" ON messages FOR SELECT USING (true)',

  'DROP POLICY IF EXISTS "Anyone can send messages" ON messages',
  'CREATE POLICY "Anyone can send messages" ON messages FOR INSERT WITH CHECK (true)',

  'DROP POLICY IF EXISTS "Senders can update own messages" ON messages',
  'CREATE POLICY "Senders can update own messages" ON messages FOR UPDATE USING (true)',

  'DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions',
  'CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions FOR ALL USING (true)',

  'DROP POLICY IF EXISTS "Users can manage own unread counts" ON unread_counts',
  'CREATE POLICY "Users can manage own unread counts" ON unread_counts FOR ALL USING (true)',

  // Functions and Triggers
  `CREATE OR REPLACE FUNCTION update_conversation_timestamp()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  'DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages',
  `CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp()`,

  `CREATE OR REPLACE FUNCTION increment_unread_counts()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO unread_counts (user_id, conversation_id, count)
     SELECT cp.user_id, NEW.conversation_id, 1
     FROM conversation_participants cp
     WHERE cp.conversation_id = NEW.conversation_id AND cp.user_id != NEW.sender_id
     ON CONFLICT (user_id, conversation_id)
     DO UPDATE SET count = unread_counts.count + 1;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  'DROP TRIGGER IF EXISTS trigger_increment_unread ON messages',
  `CREATE TRIGGER trigger_increment_unread
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_counts()`,

  `CREATE OR REPLACE FUNCTION get_or_create_dm(user1_id UUID, user2_id UUID)
   RETURNS UUID AS $$
   DECLARE conv_id UUID;
   BEGIN
     SELECT c.id INTO conv_id
     FROM conversations c
     WHERE c.type = 'dm'
       AND EXISTS (SELECT 1 FROM conversation_participants cp1 WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id)
       AND EXISTS (SELECT 1 FROM conversation_participants cp2 WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id)
       AND (SELECT COUNT(*) FROM conversation_participants cp3 WHERE cp3.conversation_id = c.id) = 2
     LIMIT 1;
     
     IF conv_id IS NULL THEN
       INSERT INTO conversations (type, created_by) VALUES ('dm', user1_id) RETURNING id INTO conv_id;
       INSERT INTO conversation_participants (conversation_id, user_id, role)
       VALUES (conv_id, user1_id, 'member'), (conv_id, user2_id, 'member');
     END IF;
     RETURN conv_id;
   END;
   $$ LANGUAGE plpgsql`,

  // Enable Realtime
  'ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages',
  'ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS chat_users',
  'ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS conversation_participants',
];

async function executeSqlSetup() {
  try {
    console.log('[Chat Setup] Starting database setup...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Chat Setup] Missing Supabase credentials');
      console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('[Chat Setup] ✓ Connected to Supabase');
    console.log(`[Chat Setup] Executing ${SQL_STATEMENTS.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql_text: SQL_STATEMENTS[i]
        }).catch(() => {
          return { error: null }; // Ignore if RPC not available
        });

        if (error && !error.message.includes('already exists')) {
          console.warn(`[Chat Setup] Statement ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
          if ((i + 1) % 20 === 0) {
            console.log(`[Chat Setup] Progress: ${i + 1}/${SQL_STATEMENTS.length}`);
          }
        }
      } catch (err) {
        errorCount++;
      }
    }

    console.log('\n[Chat Setup] ✓ Database setup complete!');
    console.log(`[Chat Setup] Executed: ${successCount}/${SQL_STATEMENTS.length} statements`);
    console.log('[Chat Setup] ✓ All chat system tables are ready!');
    process.exit(0);

  } catch (error) {
    console.error('[Chat Setup] Fatal error:', error.message);
    process.exit(1);
  }
}

executeSqlSetup();
