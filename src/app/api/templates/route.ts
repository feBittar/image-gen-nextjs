import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const templatesDir = path.join(process.cwd(), 'templates');

    // Check if templates directory exists
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({
        success: true,
        templates: []
      });
    }

    // Read templates directory
    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const templatePath = path.join(templatesDir, file);
        try {
          const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
          return {
            id: file.replace('.json', ''),
            name: templateData.name || file.replace('.json', ''),
            description: templateData.description || '',
            preview: templateData.preview || null
          };
        } catch (error) {
          console.error(`Error reading template ${file}:`, error);
          return null;
        }
      })
      .filter(template => template !== null);

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error reading templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load templates'
      },
      { status: 500 }
    );
  }
}
