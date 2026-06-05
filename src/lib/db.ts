/**
 * Database client — Cloudflare D1 + local SQLite fallback.
 *
 * On Cloudflare Workers: uses raw D1 SQL queries via getCloudflareContext().
 * In local dev: uses better-sqlite3 with the same SQL interface.
 *
 * IMPORTANT: better-sqlite3 is lazy-loaded to avoid crashes on Cloudflare Workers.
 *
 * Usage in API routes:
 *   import { getDb } from "@/lib/db";
 *   const db = getDb();
 *   const files = await db.fileFindMany();
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

// ─── D1-compatible interface ──────────────────────────────────────────────────

interface D1Compat {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  all(): Promise<D1Result>;
  first<T = unknown>(col?: string): Promise<T | null>;
  run(): Promise<D1RunResult>;
}

interface D1Result {
  results: Record<string, unknown>[];
  success: boolean;
  meta: unknown;
}

interface D1RunResult {
  meta: { changes: number };
}

// ─── Database implementation (shared for both D1 and local) ───────────────────

class DatabaseClient {
  private d1: D1Compat;
  private _tableReady = false;

  constructor(d1: D1Compat) {
    this.d1 = d1;
  }

  /** Create the File table if it doesn't exist (idempotent) */
  async ensureTable(): Promise<void> {
    if (this._tableReady) return;
    try {
      await this.d1.prepare(`
        CREATE TABLE IF NOT EXISTS File (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          originalName TEXT NOT NULL,
          size INTEGER NOT NULL,
          mimeType TEXT NOT NULL,
          storagePath TEXT NOT NULL,
          shareId TEXT NOT NULL UNIQUE,
          downloads INTEGER NOT NULL DEFAULT 0,
          isPublic INTEGER NOT NULL DEFAULT 0,
          description TEXT,
          uploaderId TEXT,
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          expiresAt TEXT
        )
      `).run();
      // Create index on shareId for fast lookups
      await this.d1.prepare(
        "CREATE INDEX IF NOT EXISTS idx_file_shareId ON File(shareId)"
      ).run();
      this._tableReady = true;
    } catch (err) {
      console.warn("[db] ensureTable warning:", err);
      // Table might already exist, mark as ready anyway
      this._tableReady = true;
    }
  }

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

    const result = await this.d1.prepare(sql).bind(...params).all();
    return result.results.map((r) => this.mapRecord(r as FileRecord));
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
    return result.meta.changes;
  }

  async fileCount(where?: { isPublic?: boolean }): Promise<number> {
    let sql = "SELECT COUNT(*) as count FROM File";
    const params: unknown[] = [];
    if (where?.isPublic !== undefined) {
      sql += " WHERE isPublic = ?";
      params.push(where.isPublic ? 1 : 0);
    }
    const result = await this.d1.prepare(sql).bind(...params).first() as { count: number } | null;
    return result?.count ?? 0;
  }

  async fileAggregate(): Promise<{ totalSize: number; totalDownloads: number }> {
    const result = await this.d1.prepare("SELECT COALESCE(SUM(size), 0) as totalSize, COALESCE(SUM(downloads), 0) as totalDownloads FROM File").first() as { totalSize: number; totalDownloads: number } | null;
    return result ?? { totalSize: 0, totalDownloads: 0 };
  }

  private mapRecord(r: FileRecord): FileRecord {
    return {
      ...r,
      isPublic: !!r.isPublic,
      downloads: Number(r.downloads),
      size: Number(r.size),
    };
  }
}

// ─── Local SQLite D1-compatible adapter (lazy-loaded) ─────────────────────────

// These are only instantiated in local dev, never on Cloudflare Workers

interface BetterSqlite3Database {
  prepare(sql: string): BetterSqlite3Statement;
  pragma(cmd: string): void;
}

interface BetterSqlite3Statement {
  all(...params: unknown[]): Record<string, unknown>[];
  get(...params: unknown[]): Record<string, unknown> | undefined;
  run(...params: unknown[]): { changes: number };
}

class LocalD1Compat implements D1Compat {
  private db: BetterSqlite3Database;

  constructor(db: BetterSqlite3Database) {
    this.db = db;
  }

  prepare(sql: string): D1PreparedStatement {
    return new LocalPreparedStatement(this.db, sql);
  }
}

class LocalPreparedStatement implements D1PreparedStatement {
  private db: BetterSqlite3Database;
  private sql: string;
  private params: unknown[] = [];

  constructor(db: BetterSqlite3Database, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  bind(...params: unknown[]): D1PreparedStatement {
    this.params = params;
    return this;
  }

  async all(): Promise<D1Result> {
    const stmt = this.db.prepare(this.sql);
    const rows = stmt.all(...this.params);
    return { results: rows, success: true, meta: {} };
  }

  async first<T = unknown>(_col?: string): Promise<T | null> {
    const stmt = this.db.prepare(this.sql);
    const row = stmt.get(...this.params);
    if (!row) return null;
    return row as T;
  }

  async run(): Promise<D1RunResult> {
    const stmt = this.db.prepare(this.sql);
    const info = stmt.run(...this.params);
    return { meta: { changes: info.changes } };
  }
}

// ─── Client Selection ─────────────────────────────────────────────────────────

let _client: DatabaseClient | null = null;

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
 * Get a database client — D1 on Cloudflare, better-sqlite3 for local dev.
 */
export function getDb(): DatabaseClient {
  if (_client) return _client;

  if (isCloudflareWorkers()) {
    const { env } = getCloudflareContext();
    const d1 = env.DB as unknown as D1Compat;
    _client = new DatabaseClient(d1);
    return _client;
  }

  // Local dev fallback — lazily require better-sqlite3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3") as { new (path: string): BetterSqlite3Database };
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./db/custom.db";
  const sqliteDb = new Database(dbPath);
  sqliteDb.pragma("journal_mode = WAL");
  console.log(`[db] Local SQLite connected: ${dbPath}`);

  const localD1 = new LocalD1Compat(sqliteDb);
  _client = new DatabaseClient(localD1);
  return _client;
}

/**
 * Legacy named export.
 */
export const db = new Proxy({} as DatabaseClient, {
  get(_target, prop) {
    const client = getDb();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
