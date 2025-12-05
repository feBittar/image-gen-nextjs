import { NextRequest, NextResponse } from 'next/server';
import { listPresets, getPresetsByCategory, getCategories } from '@/lib/services/stylePresets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      // Filter by category
      const presets = getPresetsByCategory(category).map(preset => ({
        id: preset.name.toLowerCase().replace(/\s+/g, '-'),
        name: preset.name,
        description: preset.description,
        category: preset.category,
        styles: preset.styles
      }));

      return NextResponse.json({
        success: true,
        category,
        presets
      });
    }

    // Return all presets
    const presets = listPresets();
    const categories = getCategories();

    return NextResponse.json({
      success: true,
      presets,
      categories,
      total: presets.length
    });

  } catch (error) {
    console.error('Error listing presets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load style presets'
      },
      { status: 500 }
    );
  }
}
