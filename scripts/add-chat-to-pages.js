#!/usr/bin/env node

/**
 * Helper script to add chat system to all HTML files
 * Run: node add-chat-to-pages.js
 */

const fs = require('fs');
const path = require('path');

const CHAT_INJECTION = `<!-- Chat System -->
<link rel="stylesheet" href="/css/chat.css">
<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';
  window.supabase = { createClient };
  
  // Import and initialize chat system
  import('./js/chat/init.js').catch(err => console.error('[Chat] Init error:', err));
</script>`;

function addChatToHTML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if already added
    if (content.includes('<!-- Chat System -->')) {
      console.log(`✓ ${filePath} - Already has chat system`);
      return;
    }
    
    // Check if has closing body tag
    if (!content.includes('</body>')) {
      console.log(`✗ ${filePath} - No </body> tag found`);
      return;
    }
    
    // Add chat before closing body
    const newContent = content.replace(
      '</body>',
      `${CHAT_INJECTION}
</body>`
    );
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ Added chat to ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip hidden directories and node_modules
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'js' && file !== 'css') {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.html')) {
      addChatToHTML(filePath);
    }
  });
}

console.log('🚀 Adding chat system to all HTML pages...\n');
processDirectory('.');
console.log('\n✅ Chat system injection complete!');
