import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { formatFileSize, getFileCategory } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("x-admin-password");
    const isAdminUser = auth === ADMIN_PASSWORD;
    const uploaderId = request.headers.get("x-uploader-id");

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const sort = url.searchParams.get("sort") || "newest";

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json({ files: [], isAdmin: isAdminUser, error: "Database not configured" }, { status: 503 });
    }

    // Build where clause for the new D1 client
    const where: { isPublic?: boolean; uploaderId?: string } = {};

    // Non-admin users see public files OR their own uploads
    if (!isAdminUser) {
      if (uploaderId) {
        where.uploaderId = uploaderId;
      } else {
        where.isPublic = true;
      }
    }

    // Build order by SQL clause
    let orderBy = "createdAt DESC";
    if (sort === "newest") orderBy = "createdAt DESC";
    else if (sort === "oldest") orderBy = "createdAt ASC";
    else if (sort === "name") orderBy = "originalName ASC";
    else if (sort === "size") orderBy = "size DESC";
    else if (sort === "downloads") orderBy = "downloads DESC";

    let files = await db.fileFindMany(where, orderBy);

    // Filter by search term and category in JS (D1 client doesn't support LIKE queries)
    if (search) {
      const searchLower = search.toLowerCase();
      files = files.filter((f) => f.originalName.toLowerCase().includes(searchLower));
    }
    if (category) {
      files = files.filter((f) => f.mimeType.toLowerCase().includes(category.toLowerCase()));
    }

    const mapped = files.map((f) => ({
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
      uploaderId: f.uploaderId,
      createdAt: f.createdAt,
      expiresAt: f.expiresAt,
    }));

    return NextResponse.json({ files: mapped, isAdmin: isAdminUser });
  } catch (err) {
    console.error("List files error:", err);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
