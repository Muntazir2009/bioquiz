# Task 1-2: BioQuiz Admin API Routes for Firebase RTDB

## Summary
Created two API route files that interact with Firebase Realtime Database using native `fetch` to the REST API.

## Files Created

### 1. `/src/app/api/admin/widget-config/route.ts`
- **GET**: Reads current widget config from `bq_widget_config/settings.json`
- **PUT**: Updates widget config using PATCH (merge behavior) to `bq_widget_config/settings.json`
- Both endpoints require `x-admin-password` header = "0613"
- Returns `{ config: ... }` on success

### 2. `/src/app/api/admin/activity/route.ts`
- **GET**: Fetches three data sources in parallel:
  - Online users from `bq_presence.json` (filtered by `ts` within last 30 seconds)
  - Recent messages from `bq_messages.json?orderBy="ts"&limitToLast=20`
  - Total message count via `bq_messages.json?shallow=true` (keys only)
- Requires `x-admin-password` header = "0613"
- Returns `{ onlineUsers, onlineCount, recentMessages, totalMessages }`

## Key Design Decisions
- Used `export const dynamic = "force-dynamic"` to prevent caching
- Used Firebase RTDB REST API PATCH method for merge behavior on widget config
- Used `shallow=true` parameter for efficient message counting (only returns keys)
- Followed existing auth pattern from `/src/app/api/admin/route.ts`
- All three Firebase fetches in activity route run in parallel via `Promise.all`
- TypeScript interfaces defined for `PresenceEntry` and `MessageEntry`

## Lint Status
✅ ESLint passes with no errors
