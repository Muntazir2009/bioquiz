---
Task ID: 1
Agent: Main Agent
Task: Fix scroll jumping, reply chip targeting, highlight animation, remove /widget-config, build AI Bug Monitor, add admin panel section

Work Log:
- Fixed scroll jumping by reducing auto-scroll threshold from 100px to 40px in scrollD()
- Removed the 260ms setTimeout second-pass in scrollD() that fought with user scroll
- Fixed reply chip targeting by replacing CSS.escape + querySelector with direct document.getElementById() — avoids mangling Firebase push IDs that start with '-'
- Improved highlight animation: 3-pulse pattern (was 2-pulse), stronger glow (0 0 20px vs 0 0 16px), extended duration from 2s→2.8s, highlight class removal from 2200ms→3000ms
- Improved ghost message suppression by adding DOM existence check (prevents suppressing legitimate messages during deletion window)
- Removed /widget-config route directory
- Built v66 Bug Monitor system in chat-widget.js:
  - Global error catcher (window.onerror, unhandledrejection)
  - Firebase error detection via console.error interception
  - Scroll anomaly detector (flags unexpected jumps > 150px in < 100ms)
  - DOM consistency checker (duplicate IDs, missing data, excessive DOM size)
  - Render performance monitor (flags > 80 renders in 10s)
  - Self-healing system (removes duplicates, cleans separators, fixes orphans)
  - Firebase health check (latency, connection state, every 30s)
  - Performance optimizations (rAF batch queue, lazy image loading)
  - Stability improvements (Firebase retry logic, detached node cleanup)
  - Monitor status indicator badge in widget
  - Bug logs flushed to Firebase (bq_bug_logs) every 15s, pruned to 500
- Added "Monitor" category to admin sidebar with Bug Monitor + Firebase Health sections
- Added Bug Monitor section UI: stats cards, filter/search controls, category summary, scrollable bug log list, monitor system info
- Added real-time Firebase listener for bq_bug_logs in admin page
- Updated widget version to 70.0.0

Stage Summary:
- All 3 chat bugs fixed (scroll, reply, highlight)
- /widget-config route removed (returns 404)
- AI Bug Monitor system built and integrated
- Admin panel updated with Bug Monitor dashboard section
- All pages verified: Main (200), Admin (200), Widget-config (404)
