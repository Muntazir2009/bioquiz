import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getFile, deleteFileFromDisk, formatFileSize, getFileCategory } from "@/lib/file-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const db = getDb();
    const file = await db.file.findUnique({ where: { shareId } });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if expired
    if (file.expiresAt && file.expiresAt < new Date()) {
      // Auto-delete expired files
      try {
        await deleteFileFromDisk(file.storagePath);
        await db.file.delete({ where: { id: file.id } });
      } catch {
        // ignore cleanup errors
      }
      return NextResponse.json({ error: "File has expired" }, { status: 410 });
    }

    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "true";

    if (isDownload) {
      // Increment download count
      await db.file.update({
        where: { id: file.id },
        data: { downloads: { increment: 1 } },
      });

      const buffer = await getFile(file.storagePath);
      return new Response(buffer, {
        headers: {
          "Content-Type": file.mimeType,
          "Content-Disposition": `attachment; filename="${file.originalName}"`,
          "Content-Length": String(buffer.byteLength),
        },
      });
    }

    // Return file info
    return NextResponse.json({
      file: {
        name: file.originalName,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        mimeType: file.mimeType,
        category: getFileCategory(file.mimeType),
        downloads: file.downloads,
        createdAt: file.createdAt.toISOString(),
        shareId: file.shareId,
        isPublic: file.isPublic,
        description: file.description,
      },
    });
  } catch (err) {
    console.error("Share error:", err);
    return NextResponse.json({ error: "Failed to get file" }, { status: 500 });
  }
}
