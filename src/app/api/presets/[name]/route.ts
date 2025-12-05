import { NextRequest, NextResponse } from 'next/server';
import { getPreset } from '@/lib/services/stylePresets';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const preset = getPreset(name);

    if (!preset) {
      return NextResponse.json(
        {
          success: false,
          error: `Preset "${name}" not found`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preset: {
        id: name,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        styles: preset.styles
      }
    });

  } catch (error) {
    console.error('Error getting preset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get preset'
      },
      { status: 500 }
    );
  }
}
