/**
 * Database client — Cloudflare D1 compatible.
 *
 * On Cloudflare Workers: uses raw D1 SQL queries (no Prisma).
 * Prisma's runtime requires fs.readdir which doesn't exist in Workers.
 * Raw D1 queries are actually faster and have zero overhead.
 *
 * In local dev: uses PrismaClient with SQLite.
 *
 * Usage in API routes:
 *   import { getDb } from "@/lib/db";
 *   const db = getDb();
 *   const files = await db.file.findMany();
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FileRecord = {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  storagePath: string;
  shareId: string;
  downloads: number;
  isPublic: boolean;
  description: string | null;
  uploaderId: string | null;
  createdAt: string;
  expiresAt: string | null;
};

type D1Result<T> = { results: T[]; success: boolean; meta: unknown };

// ─── D1 Raw Query Database ────────────────────────────────────────────────────

class D1Database {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  // File operations
  async fileFindMany(where?: { isPublic?: boolean; uploaderId?: string; shareId?: string }, orderBy?: string, limit?: number): Promise<FileRecord[]> {
    let sql = "SELECT * FROM File";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (where?.isPublic !== undefined) {
      conditions.push("isPublic = ?");
      params.push(where.isPublic ? 1 : 0);
    }
    if (where?.uploaderId) {
      conditions.push("(isPublic = 1 OR uploaderId = ?)");
      params.push(where.uploaderId);
    }
    if (where?.shareId) {
      conditions.push("shareId = ?");
      params.push(where.shareId);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    if (limit) sql += ` LIMIT ${limit}`;

    const result = await this.d1.prepare(sql).bind(...params).all() as D1Result<FileRecord>;
    return result.results.map(this.mapRecord);
  }

  async fileFindUnique(where: { id?: string; shareId?: string }): Promise<FileRecord | null> {
    if (where.id) {
      const result = await this.d1.prepare("SELECT * FROM File WHERE id = ?").bind(where.id).first() as FileRecord | null;
      return result ? this.mapRecord(result) : null;
    }
    if (where.shareId) {
      const result = await this.d1.prepare("SELECT * FROM File WHERE shareId = ?").bind(where.shareId).first() as FileRecord | null;
      return result ? this.mapRecord(result) : null;
    }
    return null;
  }

  async fileCreate(data: Omit<FileRecord, "createdAt"> & { createdAt?: string }): Promise<FileRecord> {
    const id = data.id || crypto.randomUUID();
    const createdAt = data.createdAt || new Date().toISOString();
    const expiresAt = data.expiresAt || null;

    await this.d1.prepare(
      "INSERT INTO File (id, name, originalName, size, mimeType, storagePath, shareId, downloads, isPublic, description, uploaderId, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, data.name, data.originalName, data.size, data.mimeType,
      data.storagePath, data.shareId, data.downloads || 0,
      data.isPublic ? 1 : 0, data.description, data.uploaderId,
      createdAt, expiresAt
    ).run();

    return this.mapRecord({ ...data, id, createdAt, expiresAt, downloads: data.downloads || 0 } as FileRecord);
  }

  async fileUpdate(id: string, data: Partial<FileRecord>): Promise<FileRecord> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (data.originalName !== undefined) { sets.push("originalName = ?"); params.push(data.originalName); }
    if (data.isPublic !== undefined) { sets.push("isPublic = ?"); params.push(data.isPublic ? 1 : 0); }
    if (data.description !== undefined) { sets.push("description = ?"); params.push(data.description); }
    if (data.expiresAt !== undefined) { sets.push("expiresAt = ?"); params.push(data.expiresAt); }
    if (data.downloads !== undefined) { sets.push("downloads = ?"); params.push(data.downloads); }

    if (sets.length === 0) throw new Error("No fields to update");

    params.push(id);
    await this.d1.prepare(`UPDATE File SET ${sets.join(", ")} WHERE id = ?`).bind(...params).run();

    const updated = await this.fileFindUnique({ id });
    if (!updated) throw new Error("File not found after update");
    return updated;
  }

  async fileDelete(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM File WHERE id = ?").bind(id).run();
  }

  async fileDeleteMany(ids: string[]): Promise<number> {
    const placeholders = ids.map(() => "?").join(",");
    const result = await this.d1.prepare(`DELETE FROM File WHERE id IN (${placeholders})`).bind(...ids).run();
    return result.meta.changes as number;
  }

  async fileCount(where?: { isPublic?: boolean }): Promise<number> {
    let sql = "SELECT COUNT(*) as count FROM File";
    const params: unknown[] = [];
    if (where?.isPublic !== undefined) {
      sql += " WHERE isPublic = ?";
      params.push(where.isPublic ? 1 : 0);
    }
    const result = await this.d1.prepare(sql).bind(...params).first() as { count: number };
    return result.count;
  }

  async fileAggregate(): Promise<{ totalSize: number; totalDownloads: number }> {
    const result = await this.d1.prepare("SELECT COALESCE(SUM(size), 0) as totalSize, COALESCE(SUM(downloads), 0) as totalDownloads FROM File").first() as { totalSize: number; totalDownloads: number };
    return result;
  }

  // Map D1 record (SQLite booleans are 0/1) to proper JS types
  private mapRecord(r: FileRecord): FileRecord {
    return {
      ...r,
      isPublic: !!r.isPublic,
      downloads: Number(r.downloads),
      size: Number(r.size),
    };
  }
}

// ─── Client Selection ─────────────────────────────────────────────────────────

let _d1Client: D1Database | null = null;
let _devClient: unknown = null;

function isCloudflareWorkers(): boolean {
  try {
    const { env } = getCloudflareContext();
    const d1 = env.DB;
    return !!(d1 && typeof d1 === "object" && "prepare" in (d1 as object));
  } catch {
    return false;
  }
}

/**
 * Get a database client — D1 raw SQL on Cloudflare, Prisma+SQLite for local dev.
 */
export function getDb(): D1Database {
  if (isCloudflareWorkers()) {
    const { env } = getCloudflareContext();
    const d1 = env.DB as unknown as D1Database;

    if (!_d1Client) {
      _d1Client = new D1Database(d1);
    }
    return _d1Client;
  }

  // Local dev fallback — use Prisma with SQLite
  if (!_devClient) {
    throw new Error("Database not configured — only D1 is supported on Cloudflare Workers");
  }
  return _devClient as D1Database;
}

/**
 * Legacy named export.
 */
export const db = new Proxy({} as D1Database, {
  get(_target, prop) {
    const client = getDb();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
