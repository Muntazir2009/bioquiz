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

    // Fetch files to get their storage paths for R2 cleanup
    const allFiles = await db.fileFindMany();
    const filesToDelete = allFiles.filter((f) => ids.includes(f.id));

    // Delete from R2
    await Promise.all(filesToDelete.map((f) => deleteFileFromDisk(f.storagePath)));

    // Delete from DB
    const deletedCount = await db.fileDeleteMany(ids);

    return NextResponse.json({ deleted: deletedCount });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
  }
}
