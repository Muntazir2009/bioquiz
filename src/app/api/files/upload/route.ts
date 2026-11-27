import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveFile, generateShareId, generateStorageName, formatFileSize, getFileCategory } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed MIME type prefixes for basic validation
const ALLOWED_PREFIXES = [
  "image/", "video/", "audio/",
  "application/pdf",
  "application/zip", "application/x-zip", "application/x-rar", "application/x-tar", "application/gzip",
  "application/vnd.openxmlformats", "application/vnd.ms-",
  "application/msword", "application/vnd.oasis",
  "text/",
  "application/json", "application/xml",
];

function isAllowedType(mimeType: string): boolean {
  return ALLOWED_PREFIXES.some((p) => mimeType.startsWith(p));
}

// Types that a browser may execute when served from our own origin
const BLOCKED_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "image/svg+xml",
  "text/xml",
  "application/xml",
  "text/javascript",
  "application/javascript",
];

export async function POST(request: Request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isPublic = formData.get("isPublic") === "true";
    const uploaderId = request.headers.get("x-uploader-id") || null;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
    }

    // Validate file name
    if (!file.name || file.name.trim().length === 0) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    // Basic MIME type validation
    if (!isAllowedType(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type || "unknown"}" is not allowed` },
        { status: 400 }
      );
    }

    // Refuse types a browser can execute from our own origin (stored XSS)
    if (BLOCKED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not accepted` },
        { status: 415 }
      );
    }

    // Get database
    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    await db.ensureTable();

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Generate unique storage name and share ID
    const storageName = generateStorageName(file.name);
    const shareId = generateShareId();

    // Save file to R2 (or local disk)
    try {
      await saveFile(uint8, storageName);
    } catch (err) {
      console.error("[upload] Storage save failed:", err);
      return NextResponse.json({ error: "Failed to store file" }, { status: 503 });
    }

    // Create database record
    const fileRecord = await db.fileCreate({
      id: crypto.randomUUID(),
      name: storageName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      storagePath: storageName,
      shareId,
      downloads: 0,
      isPublic,
      description: null,
      uploaderId,
    });

    return NextResponse.json({
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        sizeFormatted: formatFileSize(fileRecord.size),
        mimeType: fileRecord.mimeType,
        category: getFileCategory(fileRecord.mimeType),
        shareId: fileRecord.shareId,
        downloads: fileRecord.downloads,
        isPublic: fileRecord.isPublic,
        description: fileRecord.description,
        createdAt: fileRecord.createdAt,
        expiresAt: fileRecord.expiresAt,
      },
    });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
