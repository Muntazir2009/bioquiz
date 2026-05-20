import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { formatFileSize, getFileCategory } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

function isAdmin(request: Request): boolean {
  const auth = request.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

/** POST /api/admin — authenticate */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/** GET /api/admin — dashboard data */
export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    const totalFiles = await db.file.count();
    const totalSizeResult = await db.file.aggregate({ _sum: { size: true } });
    const totalSize = totalSizeResult._sum.size ?? 0;
    const totalDownloadsResult = await db.file.aggregate({ _sum: { downloads: true } });
    const totalDownloads = totalDownloadsResult._sum.downloads ?? 0;
    const publicFiles = await db.file.count({ where: { isPublic: true } });
    const privateFiles = await db.file.count({ where: { isPublic: false } });

    // Category distribution
    const allFiles = await db.file.findMany({ select: { mimeType: true, size: true } });
    const categoryMap: Record<string, { count: number; size: number }> = {};
    for (const f of allFiles) {
      const cat = getFileCategory(f.mimeType);
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, size: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].size += f.size;
    }
    const categoryDistribution = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      size: data.size,
      sizeFormatted: formatFileSize(data.size),
    }));

    // Recent files
    const recentFiles = await db.file.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Files by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUploads = await db.file.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, size: true },
    });
    const byDay: Record<string, { count: number; size: number }> = {};
    for (const f of recentUploads) {
      const day = f.createdAt.toISOString().split("T")[0];
      if (!byDay[day]) byDay[day] = { count: 0, size: 0 };
      byDay[day].count++;
      byDay[day].size += f.size;
    }
    const uploadsByDay = Object.entries(byDay)
      .map(([date, data]) => ({ date, count: data.count, size: data.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      stats: {
        totalFiles,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        totalDownloads,
        publicFiles,
        privateFiles,
      },
      categoryDistribution,
      uploadsByDay,
      recentFiles: recentFiles.map((f) => ({
        id: f.id,
        name: f.originalName,
        size: f.size,
        sizeFormatted: formatFileSize(f.size),
        mimeType: f.mimeType,
        category: getFileCategory(f.mimeType),
        shareId: f.shareId,
        downloads: f.downloads,
        isPublic: f.isPublic,
        description: f.description,
        createdAt: f.createdAt.toISOString(),
        expiresAt: f.expiresAt?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
