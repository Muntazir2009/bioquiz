import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteFileFromDisk } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("x-admin-password");
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // Limit bulk operations
    if (ids.length > 100) {
      return NextResponse.json({ error: "Max 100 files at once" }, { status: 400 });
    }

    const db = getDb();

    const files = await db.file.findMany({
      where: { id: { in: ids } },
      select: { id: true, storagePath: true },
    });

    // Delete from R2
    await Promise.all(files.map((f) => deleteFileFromDisk(f.storagePath)));

    // Delete from DB
    const result = await db.file.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
  }
}
