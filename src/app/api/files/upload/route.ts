import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { formatFileSize, getFileCategory, generateShareId, generateStorageName, saveFile } from "@/lib/file-storage";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isPublicStr = formData.get("isPublic") as string | null;
    const uploaderId = request.headers.get("x-uploader-id");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await db.ensureTable();

    const shareId = generateShareId();
    const storageName = generateStorageName(file.name);
    const isPublic = isPublicStr === "true";

    // Read file into buffer
    const buffer = await file.arrayBuffer();

    // Save to disk / R2
    await saveFile(new Uint8Array(buffer), storageName);

    // Create DB record
    const record = await db.fileCreate({
      name: storageName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      storagePath: storageName,
      shareId,
      downloads: 0,
      isPublic,
      description: null,
      uploaderId: uploaderId || null,
    });

    return NextResponse.json({
      file: {
        id: record.id,
        name: record.originalName,
        size: record.size,
        sizeFormatted: formatFileSize(record.size),
        mimeType: record.mimeType,
        category: getFileCategory(record.mimeType),
        shareId: record.shareId,
        downloads: record.downloads,
        isPublic: record.isPublic,
        createdAt: record.createdAt,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
