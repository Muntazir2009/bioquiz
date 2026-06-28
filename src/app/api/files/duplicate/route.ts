import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateShareId } from "@/lib/file-storage";

const ADMIN_PASSWORD = "0613";

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("x-admin-password");
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    const db = getDb();
    await db.ensureTable();

    const original = await db.fileFindUnique({ id });
    if (!original) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const shareId = generateShareId();
    const duplicate = await db.fileCreate({
      ...original,
      id: undefined as unknown as string,
      originalName: `${original.originalName} (copy)`,
      shareId,
      downloads: 0,
    });

    return NextResponse.json({
      file: {
        id: duplicate.id,
        name: duplicate.originalName,
        shareId: duplicate.shareId,
      },
    });
  } catch (err) {
    console.error("Duplicate error:", err);
    return NextResponse.json({ error: "Duplicate failed" }, { status: 500 });
  }
}
