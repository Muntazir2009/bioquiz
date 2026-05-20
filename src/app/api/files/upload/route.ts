import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveFile, generateShareId, generateStorageName } from "@/lib/file-storage";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploaderId = formData.get("uploaderId") as string | null;
    const isPublic = formData.get("isPublic") === "true";
    const description = formData.get("description") as string | null;
    const expiresAt = formData.get("expiresAt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate storage name and share ID
    const storageName = generateStorageName(file.name);
    const shareId = generateShareId();

    // Save to R2
    await saveFile(buffer, storageName);

    // Save metadata to D1
    const db = getDb();
    const fileRecord = await db.file.create({
      data: {
        id: uuidv4(),
        name: storageName,
        originalName: file.name,
        size: buffer.byteLength,
        mimeType: file.type || "application/octet-stream",
        storagePath: storageName,
        shareId,
        isPublic,
        description: description?.trim() || null,
        uploaderId: uploaderId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        shareId: fileRecord.shareId,
        isPublic: fileRecord.isPublic,
        description: fileRecord.description,
        createdAt: fileRecord.createdAt.toISOString(),
        expiresAt: fileRecord.expiresAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
