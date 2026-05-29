/**
 * File storage layer — Cloudflare R2 compatible.
 * Uses the R2 bucket binding accessed via getCloudflareContext().
 * In local dev without R2, files are stored in memory (non-persistent).
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

// In-memory fallback for local dev (non-persistent)
const memoryStore = new Map<string, Uint8Array>();

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

/** Save a file buffer to R2 (or memory in dev), returns the storage key */
export async function saveFile(buffer: Buffer | ArrayBuffer | Uint8Array, storageName: string): Promise<string> {
  const bucket = getBucket();
  if (bucket) {
    await bucket.put(storageName, buffer);
  } else {
    // Local dev fallback — store in memory
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    memoryStore.set(storageName, uint8);
  }
  return storageName; // In R2, the key IS the path
}

/** Read a file from R2 (or memory in dev) */
export async function getFile(storageKey: string): Promise<ArrayBuffer> {
  const bucket = getBucket();
  if (bucket) {
    const object = await bucket.get(storageKey);
    if (!object) {
      throw new Error(`File not found in R2: ${storageKey}`);
    }
    return object.arrayBuffer();
  }

  // Local dev fallback
  const data = memoryStore.get(storageKey);
  if (data) {
    return data.buffer as ArrayBuffer;
  }
  throw new Error("R2 bucket not available and file not in memory store");
}

/** Delete a file from R2 (or memory in dev) */
export async function deleteFileFromDisk(storageKey: string): Promise<void> {
  const bucket = getBucket();
  if (bucket) {
    try {
      await bucket.delete(storageKey);
    } catch {
      // File might already be deleted, ignore
    }
  } else {
    memoryStore.delete(storageKey);
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
