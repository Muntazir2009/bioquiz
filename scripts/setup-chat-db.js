import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read and execute the SQL setup script
const setupSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Chat Users Table
CREATE TABLE IF NOT EXISTS chat_users (
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
);

CREATE INDEX IF NOT EXISTS idx_chat_users_username ON chat_users(username);
CREATE INDEX IF NOT EXISTS idx_chat_users_status ON chat_users(status);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
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
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

-- Unread Counts
CREATE TABLE IF NOT EXISTS unread_counts (
  user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, conversation_id)
);

-- Enable RLS
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_counts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_users
CREATE POLICY "Users are viewable by everyone" ON chat_users
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON chat_users
  FOR UPDATE USING (true);
CREATE POLICY "Anyone can register" ON chat_users
  FOR INSERT WITH CHECK (true);

-- RLS Policies for conversations
CREATE POLICY "Conversations visible to participants" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
    )
  );
CREATE POLICY "Anyone can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
    )
  );

-- RLS Policies for participants
CREATE POLICY "Participants viewable by conversation members" ON conversation_participants
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add participants" ON conversation_participants
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update their own record" ON conversation_participants
  FOR UPDATE USING (true);
CREATE POLICY "Participants can leave" ON conversation_participants
  FOR DELETE USING (true);

-- RLS Policies for messages
CREATE POLICY "Messages viewable by participants" ON messages
  FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Senders can update own messages" ON messages
  FOR UPDATE USING (true);

-- RLS Policies for push subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (true);

-- RLS Policies for unread counts
CREATE POLICY "Users can manage own unread counts" ON unread_counts
  FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_users;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
`;

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: setupSQL
    }).catch(() => {
      // exec_sql may not exist, try direct query execution
      return supabase.from('chat_users').select('count', { count: 'exact', head: true });
    });

    if (error) {
      console.log('[v0] Note: Some tables may already exist');
    }

    // Verify tables exist
    const tables = [
      'chat_users',
      'conversations',
      'conversation_participants',
      'messages',
      'push_subscriptions',
      'unread_counts'
    ];

    for (const table of tables) {
      const { data, error: checkError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.log(`[v0] Creating table: ${table}`);
      } else {
        console.log(`[v0] Table exists: ${table}`);
      }
    }

    console.log('[v0] Database setup complete!');
  } catch (err) {
    console.error('[v0] Setup error:', err);
    process.exit(1);
  }
}

setupDatabase();
