import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { formatFileSize, getFileCategory } from "@/lib/file-storage";
import { Prisma } from "@prisma/client";

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

    const db = getDb();

    // Build where clause with proper Prisma typing
    const conditions: Prisma.FileWhereInput[] = [];

    // Non-admin users see public files OR their own uploads
    if (!isAdminUser) {
      if (uploaderId) {
        conditions.push({
          OR: [
            { isPublic: true },
            { uploaderId },
          ],
        });
      } else {
        conditions.push({ isPublic: true });
      }
    }

    if (search) {
      conditions.push({ originalName: { contains: search } });
    }
    if (category) {
      conditions.push({ mimeType: { contains: category } });
    }

    const where: Prisma.FileWhereInput =
      conditions.length > 1
        ? { AND: conditions }
        : conditions.length === 1
          ? conditions[0]
          : {};

    // Build order by
    const orderBy: Prisma.FileOrderByWithRelationInput = {};
    if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "oldest") orderBy.createdAt = "asc";
    else if (sort === "name") orderBy.originalName = "asc";
    else if (sort === "size") orderBy.size = "desc";
    else if (sort === "downloads") orderBy.downloads = "desc";

    const files = await db.file.findMany({ where, orderBy });

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
      createdAt: f.createdAt.toISOString(),
      expiresAt: f.expiresAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ files: mapped, isAdmin: isAdminUser });
  } catch (err) {
    console.error("List files error:", err);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
