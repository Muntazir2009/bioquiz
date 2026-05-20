-- Migration: Create File table for D1
-- Run with: wrangler d1 execute bioquiz-db --remote --file=migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS "File" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "shareId" TEXT NOT NULL UNIQUE,
  "downloads" INTEGER NOT NULL DEFAULT 0,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "uploaderId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" DATETIME
);

CREATE INDEX IF NOT EXISTS "File_shareId_idx" ON "File"("shareId");
CREATE INDEX IF NOT EXISTS "File_uploaderId_idx" ON "File"("uploaderId");
CREATE INDEX IF NOT EXISTS "File_isPublic_idx" ON "File"("isPublic");
CREATE INDEX IF NOT EXISTS "File_createdAt_idx" ON "File"("createdAt");
