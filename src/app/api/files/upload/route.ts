import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveFile, generateShareId, generateStorageName } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const db = getDb();
    await db.ensureTable();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const isPublicStr = formData.get("isPublic") as string | null;
    const uploaderId = request.headers.get("x-uploader-id") || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate storage name and save
    const storageName = generateStorageName(file.name);
    await saveFile(uint8Array, storageName);

    // Generate share ID
    const shareId = generateShareId();

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
      isPublic: isPublicStr === "true",
      description: null,
      uploaderId,
    });

    return NextResponse.json({
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        shareId: fileRecord.shareId,
        isPublic: fileRecord.isPublic,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}