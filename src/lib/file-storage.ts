/**
 * File storage layer — Cloudflare R2 compatible.
 * Uses the R2 bucket binding available in Cloudflare Workers/Pages.
 * Falls back to no-ops on local dev without R2 (for preview mode).
 */

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
    // In Cloudflare Workers, the env is available via process.env or globalThis
    // @ts-expect-error — CF Workers runtime injects env
    const env = process.env || globalThis.__env__ || {};
    return env.BUCKET || null;
  } catch {
    return null;
  }
}

/** Save a file buffer to R2, returns the storage key */
export async function saveFile(buffer: Buffer | ArrayBuffer | Uint8Array, storageName: string): Promise<string> {
  const bucket = getBucket();
  if (bucket) {
    await bucket.put(storageName, buffer);
  }
  return storageName; // In R2, the key IS the path
}

/** Read a file from R2 */
export async function getFile(storageKey: string): Promise<ArrayBuffer> {
  const bucket = getBucket();
  if (!bucket) {
    throw new Error("R2 bucket not available");
  }
  const object = await bucket.get(storageKey);
  if (!object) {
    throw new Error(`File not found in R2: ${storageKey}`);
  }
  return object.arrayBuffer();
}

/** Delete a file from R2 */
export async function deleteFileFromDisk(storageKey: string): Promise<void> {
  const bucket = getBucket();
  if (bucket) {
    try {
      await bucket.delete(storageKey);
    } catch {
      // File might already be deleted, ignore
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
