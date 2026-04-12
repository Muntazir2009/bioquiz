import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uid = formData.get('uid') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'No uid provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `chat_images/${uid}/${timestamp}.${ext}`;

    // Upload to Vercel Blob (public access)
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Return the public URL
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[Upload] Error:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: String(err) },
      { status: 500 }
    );
  }
}
