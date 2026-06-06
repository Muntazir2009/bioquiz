import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveFile, generateShareId, generateStorageName, formatFileSize, getFileCategory } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isPublic = formData.get("isPublic") === "true";
    const uploaderId = req.headers.get("x-uploader-id") || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
    }

    const db = getDb();
    await db.ensureTable();

    const shareId = generateShareId();
    const storageName = generateStorageName(file.name);

    // Read file as ArrayBuffer (works on both Workers and Node.js)
    const arrayBuffer = await file.arrayBuffer();

    // Save file to storage (R2 or local disk)
    await saveFile(arrayBuffer, storageName);

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
      expiresAt: null,
    });

    console.log(`[upload] File saved: ${file.name} (${formatFileSize(file.size)}) → ${shareId}`);

    return NextResponse.json({
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        sizeFormatted: formatFileSize(fileRecord.size),
        mimeType: fileRecord.mimeType,
        category: getFileCategory(fileRecord.mimeType),
        shareId: fileRecord.shareId,
        isPublic: fileRecord.isPublic,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (err: any) {
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { error: "Upload failed", message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
