import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');

    // Check if fonts directory exists
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({
        success: true,
        fonts: []
      });
    }

    // Read fonts directory
    const files = fs.readdirSync(fontsDir);
    const fonts = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
      })
      .map(file => ({
        name: path.parse(file).name,
        filename: file,
        url: `/fonts/${file}`,
        extension: path.extname(file)
      }));

    return NextResponse.json({
      success: true,
      fonts
    });

  } catch (error) {
    console.error('Error listing fonts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list fonts'
      },
      { status: 500 }
    );
  }
}
