# Task 1 - Main Agent: Fix file visibility bug + add uploaderId session system

## Summary
Fixed the file visibility bug where `fetchFiles` always sent `x-admin-password: 0613`, causing ALL files (including private ones) to show up for every user. Replaced the admin-auth-based visibility with a session-based uploaderId system.

## Changes Made

### 1. Created `/src/lib/session.ts`
- New utility with `getUploaderId()` function
- Generates a random `user_{timestamp}_{random}` ID on first call
- Persists the ID in localStorage under `bioquiz-uploader-id` key

### 2. Updated `prisma/schema.prisma`
- Added `uploaderId String?` field to the File model (optional for backward compatibility)

### 3. Ran `bun run db:push` 
- Schema synced successfully

### 4. Updated `/api/files/upload/route.ts`
- Accepts `x-uploader-id` header
- If no admin auth AND no uploaderId, generates a random one server-side
- Stores `uploaderId` on the file record
- Returns `uploaderId` in the response (both inside file object and at top level)
- Non-admin uploads now default to `isPublic: true` (changed from admin-only default)

### 5. Updated `/api/files/route.ts`
- Accepts `x-uploader-id` header
- Non-admin users with uploaderId: see files where `isPublic: true OR uploaderId matches`
- Non-admin users without uploaderId: see only public files
- Admin users: see all files as before (unchanged)
- Added `uploaderId` to the response mapping

### 6. Updated `FilePanel.tsx`
- Removed `x-admin-password: 0613` header from `fetchFiles`
- Now sends `x-uploader-id` header using `getUploaderId()` from session utility
- Passes `uploaderId` prop to `FileUploadZone`
- Kept admin password in `handleDelete` (admin-only operation)

### 7. Updated `FileUploadZone.tsx`
- Added `uploaderId` optional prop
- Sends `x-uploader-id` header when uploading files via XHR
- No admin password header used for uploads

## What Was NOT Modified (as requested)
- Admin panel and admin API routes — continue using admin password auth
- Loader, Hero, and other non-file-related components
- Delete endpoint still requires admin auth

## Verification
- Lint: Zero errors on all modified files
- Dev log: No errors, successful compilation
- Database: Schema pushed successfully with new `uploaderId` column
