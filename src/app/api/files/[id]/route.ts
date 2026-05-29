import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteFileFromDisk, formatFileSize, getFileCategory } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

function isAdmin(request: Request): boolean {
  const auth = request.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

function getUploaderId(request: Request): string | null {
  return request.headers.get("x-uploader-id");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const file = await db.fileFindUnique({ id });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Allow admin or file owner to modify
    const admin = isAdmin(request);
    const uploaderId = getUploaderId(request);
    const isOwner = uploaderId && file.uploaderId === uploaderId;

    if (!admin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { originalName, isPublic, description, expiresAt } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof originalName === "string" && originalName.trim()) {
      updateData.originalName = originalName.trim();
    }
    if (typeof isPublic === "boolean") {
      updateData.isPublic = isPublic;
    }
    if (typeof description === "string") {
      updateData.description = description.trim() || null;
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updated = await db.fileUpdate(id, updateData);

    return NextResponse.json({
      file: {
        id: updated.id,
        name: updated.originalName,
        size: updated.size,
        sizeFormatted: formatFileSize(updated.size),
        mimeType: updated.mimeType,
        category: getFileCategory(updated.mimeType),
        shareId: updated.shareId,
        downloads: updated.downloads,
        isPublic: updated.isPublic,
        description: updated.description,
        createdAt: updated.createdAt,
        expiresAt: updated.expiresAt,
      },
    });
  } catch (err) {
    console.error("Patch error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const file = await db.fileFindUnique({ id });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Allow admin or file owner to delete
    const admin = isAdmin(request);
    const uploaderId = getUploaderId(request);
    const isOwner = uploaderId && file.uploaderId === uploaderId;

    if (!admin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized — admin or owner only" }, { status: 401 });
    }

    await deleteFileFromDisk(file.storagePath);
    await db.fileDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
