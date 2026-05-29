import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { formatFileSize, getFileCategory } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("x-admin-password");
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get all files for aggregation
    const allFiles = await db.fileFindMany();

    let diskUsed = 0;
    const fileCount = allFiles.length;
    const typeMap: Record<string, { count: number; size: number; downloads: number }> = {};

    for (const f of allFiles) {
      diskUsed += f.size;
      const cat = getFileCategory(f.mimeType);
      if (!typeMap[cat]) typeMap[cat] = { count: 0, size: 0, downloads: 0 };
      typeMap[cat].count++;
      typeMap[cat].size += f.size;
      typeMap[cat].downloads += f.downloads;
    }

    // Top downloaded files
    const topDownloaded = await db.fileFindMany(undefined, "downloads DESC", 5);

    // Largest files
    const largest = await db.fileFindMany(undefined, "size DESC", 5);

    return NextResponse.json({
      disk: {
        used: diskUsed,
        usedFormatted: formatFileSize(diskUsed),
        filesOnDisk: fileCount,
      },
      typeBreakdown: Object.entries(typeMap).map(([type, data]) => ({
        type,
        count: data.count,
        size: data.size,
        sizeFormatted: formatFileSize(data.size),
        downloads: data.downloads,
      })),
      topDownloaded: topDownloaded.map((f) => ({
        id: f.id,
        name: f.originalName,
        downloads: f.downloads,
        sizeFormatted: formatFileSize(f.size),
      })),
      largest: largest.map((f) => ({
        id: f.id,
        name: f.originalName,
        size: f.size,
        sizeFormatted: formatFileSize(f.size),
        category: getFileCategory(f.mimeType),
      })),
    });
  } catch (err) {
    console.error("Storage stats error:", err);
    return NextResponse.json({ error: "Failed to get storage stats" }, { status: 500 });
  }
}
