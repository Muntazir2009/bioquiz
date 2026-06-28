// Cloudflare Workers environment bindings — global type declarations

declare global {
  // ─── R2 Types ──────────────────────────────────────────────────────
  interface R2Bucket {
    put(key: string, value: ArrayBuffer | ReadableStream | Uint8Array | Buffer, options?: R2PutOptions): Promise<R2Object>;
    get(key: string): Promise<R2Object | null>;
    delete(keys: string | string[]): Promise<void>;
    head(key: string): Promise<R2Object | null>;
    list(options?: R2ListOptions): Promise<R2Objects>;
  }

  interface R2Object {
    key: string;
    size: number;
    etag: string;
    httpEtag: string;
    version: string;
    uploaded: Date;
    writeHttpMetadata: R2HTTPMetadata;
    customMetadata: Record<string, string>;
    body: ReadableStream<Uint8Array>;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T>(): Promise<T>;
  }

  interface R2PutOptions {
    httpMetadata?: R2HTTPMetadata;
    customMetadata?: Record<string, string>;
    multipart?: { partSize: number };
  }

  interface R2HTTPMetadata {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  }

  interface R2Objects {
    objects: R2Object[];
    delimitedPrefixes: string[];
    truncated: boolean;
    cursor?: string;
  }

  interface R2ListOptions {
    prefix?: string;
    delimiter?: string;
    limit?: number;
    cursor?: string;
    include?: Array<"httpMetadata" | "customMetadata">;
  }

  // ─── D1 Types ──────────────────────────────────────────────────────
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
    exec(query: string): D1ExecResult;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1ExecResult>;
    all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
    raw<T = unknown[]>(): Promise<T[]>;
  }

  interface D1Result<T = Record<string, unknown>> {
    results: T[];
    success: boolean;
    error?: string;
    meta?: { changed_db: boolean; changes: number; duration: number; last_row_id: number; rows_read: number; rows_written: number; size_after: number };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  // ─── Extend CloudflareEnv ──────────────────────────────────────────
  interface CloudflareEnv {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

export {};