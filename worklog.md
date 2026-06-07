---
Task ID: 1
Agent: main
Task: Fix theme flashing, comprehensive theme CSS, emoji cleanup, streak persistence

Work Log:
- Analyzed root cause of theme flashing: 4+ competing theme systems (FIX 8, v28, v30, v70) fighting each other with intervals and CSS overrides
- Fixed subscribeWidgetConfig to call applyGlobalTheme instead of undefined applyTheme
- Cleaned HTML template: replaced 14-chip theme rows with only pure-black & golden
- Gutted FIX 8's injectThemeOverrideCss that was forcing all chips visible with !important
- Neutralized v28's chip injection intervals and old theme restoration intervals
- Removed v30's competing applyTwoTheme and setInterval
- Added v71 definitive patch with MutationObserver on #bqp to reject invalid theme classes
- Removed v19/v20 chip injection code (noir/aurora/peach/carbon)
- Added comprehensive theme CSS for both themes covering entire widget (panels, headers, inputs, lists, bubbles, buttons, etc.)
- Removed inappropriate emojis: 👅, 💋, 👄, 🤮, 🥴, 🍑, 💉, 🦠, 🚽
- Added Firebase sync for streaks (bq_streaks/{uid}) in StreakBadge.tsx
- Added getStreak/setStreak functions to firebase.ts
- StreakBadge now merges local + remote streak data, tracks bestStreak
- Committed as 5f8d405, pushed to origin/main

Stage Summary:
- Theme flashing fixed with MutationObserver + centralized theme application
- Both themes now comprehensively style the entire widget
- Inappropriate emojis removed from reaction picker
- Streaks are now account-persistent via Firebase RTDB
