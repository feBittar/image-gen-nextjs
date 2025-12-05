import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('font') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No font file provided'
        },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only .ttf, .otf, .woff, .woff2 are allowed'
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large. Maximum size is 10MB'
        },
        { status: 400 }
      );
    }

    // Create fonts directory if it doesn't exist
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(fontsDir, file.name);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      url: `/fonts/${file.name}`
    });

  } catch (error) {
    console.error('Error uploading font:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload font'
      },
      { status: 500 }
    );
  }
}
