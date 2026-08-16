import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  generateShareId,
  generateStorageName,
  saveFile,
  getFileCategory,
} from "@/lib/file-storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isPublic = formData.get("isPublic") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 413 }
      );
    }

    const uploaderId = request.headers.get("x-uploader-id") || null;

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Ensure table exists
    await db.ensureTable();

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Generate unique names
    const storageName = generateStorageName(file.name);
    const shareId = generateShareId();
    const id = crypto.randomUUID();

    // Save file to R2 / local disk
    await saveFile(uint8, storageName);

    // Save record to database
    const record = await db.fileCreate({
      id,
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
        id: record.id,
        name: record.originalName,
        size: record.size,
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
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
