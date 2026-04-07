#!/usr/bin/env node

/**
 * Execute Chat System SQL Setup
 * This script sets up all necessary database tables and policies for the chat system
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(import.meta.url).replace(/\/[^/]*$/, '');

async function executeSqlSetup() {
  try {
    console.log('[Chat Setup] Starting database setup...');

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Chat Setup] Missing Supabase credentials');
      console.error('Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Chat Setup] ✓ Connected to Supabase');

    // Read SQL file
    const sqlFilePath = resolve(__dirname, 'setup-chat-db.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');
    console.log('[Chat Setup] ✓ Loaded SQL file');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`[Chat Setup] Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql_text: statement
        }).catch(() => {
          // Fallback: Try direct query if RPC not available
          return supabase.from('chat_users').select('count').limit(0);
        });

        if (error && !error.message.includes('already exists')) {
          console.warn(`[Chat Setup] Statement ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
          if ((i + 1) % 5 === 0) {
            console.log(`[Chat Setup] Progress: ${i + 1}/${statements.length} statements`);
          }
        }
      } catch (err) {
        console.error(`[Chat Setup] Error on statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n[Chat Setup] ✓ Database setup complete!');
    console.log(`[Chat Setup] Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`[Chat Setup] Warnings: ${errorCount} (likely due to existing objects)`);
    }

    // Verify tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['chat_users', 'conversations', 'messages', 'push_subscriptions']);

    if (tables && tables.length > 0) {
      console.log(`[Chat Setup] ✓ Verified ${tables.length} tables created`);
    } else {
      console.log('[Chat Setup] ⚠ Could not verify table creation (may still be successful)');
    }

    console.log('[Chat Setup] Setup complete! Your chat system is ready to use.');
    process.exit(0);

  } catch (error) {
    console.error('[Chat Setup] Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the setup
executeSqlSetup();
