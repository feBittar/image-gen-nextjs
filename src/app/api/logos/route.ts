import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const logosDir = path.join(process.cwd(), 'public', 'logos');

    // Check if logos directory exists
    if (!fs.existsSync(logosDir)) {
      return NextResponse.json({
        success: true,
        logos: []
      });
    }

    // Read logos directory
    const files = fs.readdirSync(logosDir);
    const logos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
      })
      .map(file => ({
        name: path.parse(file).name,
        filename: file,
        url: `/logos/${file}`,
        extension: path.extname(file)
      }));

    return NextResponse.json({
      success: true,
      logos
    });

  } catch (error) {
    console.error('Error listing logos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list logos'
      },
      { status: 500 }
    );
  }
}
