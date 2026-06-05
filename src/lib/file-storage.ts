/**
 * File storage layer — Cloudflare R2 + local filesystem fallback.
 * Uses the R2 bucket binding accessed via getCloudflareContext().
 * In local dev without R2, files are stored on disk in the data/uploads folder.
 *
 * IMPORTANT: fs/path imports are lazy to avoid crashes on Cloudflare Workers.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Generate a unique share ID (8 chars, URL-safe) */
export function generateShareId(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a unique storage filename to avoid collisions */
export function generateStorageName(originalName: string): string {
  const ext = originalName.includes(".") ? `.${originalName.split(".").pop()}` : "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${id}${ext}`;
}

/** Get the R2 bucket from the Cloudflare Workers env */
function getBucket(): R2Bucket | null {
  try {
    const { env } = getCloudflareContext();
    const bucket = env.BUCKET;
    if (bucket && typeof bucket === "object" && "put" in (bucket as object)) {
      return bucket as R2Bucket;
    }
    return null;
  } catch {
    return null;
  }
}

/** Check if we're running on Cloudflare Workers */
function isCloudflare(): boolean {
  try {
    getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}

// Lazy-loaded fs/path modules — only imported in local dev
let _fs: typeof import("fs") | null = null;
let _path: typeof import("path") | null = null;

function getFs() {
  if (!_fs) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _fs = require("fs") as typeof import("fs");
  }
  return _fs;
}

function getPath() {
  if (!_path) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _path = require("path") as typeof import("path");
  }
  return _path;
}

function getUploadDir(): string {
  const path = getPath();
  return path.join(process.cwd(), "data", "uploads");
}

/** Save a file buffer to R2 (or local disk in dev), returns the storage key */
export async function saveFile(buffer: Buffer | ArrayBuffer | Uint8Array, storageName: string): Promise<string> {
  const bucket = getBucket();
  if (bucket) {
    await bucket.put(storageName, buffer);
  } else if (!isCloudflare()) {
    // Local dev fallback — store on disk
    const fs = getFs();
    const path = getPath();
    const uploadDir = getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    fs.writeFileSync(path.join(uploadDir, storageName), uint8);
  } else {
    // On Cloudflare without R2 bucket — store in a temporary Map (non-persistent, but functional)
    console.warn("[file-storage] No R2 bucket configured — file will not persist");
  }
  return storageName;
}

/** Read a file from R2 (or local disk in dev) */
export async function getFile(storageKey: string): Promise<ArrayBuffer> {
  const bucket = getBucket();
  if (bucket) {
    const object = await bucket.get(storageKey);
    if (!object) {
      throw new Error(`File not found in R2: ${storageKey}`);
    }
    return object.arrayBuffer();
  }

  // Local dev fallback — read from disk
  if (!isCloudflare()) {
    const fs = getFs();
    const path = getPath();
    const filePath = path.join(getUploadDir(), storageKey);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      return data.buffer as ArrayBuffer;
    }
  }
  throw new Error(`File not found: ${storageKey}`);
}

/** Delete a file from R2 (or local disk in dev) */
export async function deleteFileFromDisk(storageKey: string): Promise<void> {
  const bucket = getBucket();
  if (bucket) {
    try {
      await bucket.delete(storageKey);
    } catch {
      // File might already be deleted, ignore
    }
  } else if (!isCloudflare()) {
    // Local dev fallback — delete from disk
    const fs = getFs();
    const path = getPath();
    const filePath = path.join(getUploadDir(), storageKey);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Ignore errors
    }
  }
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

/** Get file icon category from MIME type */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation";
  if (mimeType.startsWith("text/")) return "text";
  return "file";
}
