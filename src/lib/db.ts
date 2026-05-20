/**
 * Database client — Cloudflare D1 compatible.
 *
 * Uses @prisma/adapter-d1 to connect Prisma to Cloudflare D1.
 * The D1 binding is injected via the request context in API routes.
 *
 * Usage in API routes:
 *   import { getDb } from "@/lib/db";
 *   const db = getDb();
 *   const files = await db.file.findMany();
 */
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Singleton for local dev (SQLite)
let _devClient: PrismaClient | null = null;

/**
 * Get a PrismaClient connected to D1 (on Cloudflare) or SQLite (local dev).
 */
export function getDb(): PrismaClient {
  // Try to get D1 binding from Cloudflare Workers env
  try {
    // @ts-expect-error — CF Workers runtime injects env into process.env
    const d1 = process.env?.DB;
    if (d1 && typeof d1 === "object" && "prepare" in d1) {
      const adapter = new PrismaD1(d1 as unknown as D1Database);
      return new PrismaClient({ adapter });
    }
  } catch {
    // Not on CF Workers, fall through to local dev
  }

  // Local dev fallback — singleton SQLite PrismaClient
  if (!_devClient) {
    _devClient = new PrismaClient();
  }
  return _devClient;
}

/**
 * Legacy named export for backward compatibility with existing imports.
 * Delegates to getDb() so it works in both CF and local environments.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
