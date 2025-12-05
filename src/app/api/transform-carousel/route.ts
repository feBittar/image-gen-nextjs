import { NextRequest, NextResponse } from 'next/server';
import { processCarouselData } from '@/lib/utils/carouselTransformer';
import { safeValidateCarouselData } from '@/lib/schemas/carouselSchema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/transform-carousel
 * Transforms AI-generated carousel JSON into layout objects
 *
 * This endpoint only transforms the data - it does not generate images.
 * Use /api/generate-batch to generate images from the transformed layouts.
 *
 * Request body:
 * {
 *   "carrossel": {
 *     "slides": [
 *       {
 *         "numero": 1,
 *         "estilo": "stack-img",
 *         "texto_1": "text",
 *         "destaques": { "texto_1": ["text"] }
 *       }
 *     ]
 *   },
 *   "highlightColor": "#ff0000" (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "layouts": [...],
 *   "count": number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n========== POST /api/transform-carousel ==========');

    // Parse request body
    const body = await request.json();

    // Validate carousel structure
    const validation = safeValidateCarouselData(body);

    if (!validation.success) {
      console.error('[transform-carousel] Validation failed:', validation.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid carousel data structure',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    // Get slides count (now always in carousel.copy.slides format after validation)
    const slidesCount = validation.data.carousel.copy.slides.length;
    console.log(`[transform-carousel] Validated ${slidesCount} slides`);

    // Extract highlight colors from request or use defaults
    const highlightColor = body.highlightColor || '#ff0000';
    const highlightColorSecondary = body.highlightColorSecondary || '#ffffff';
    console.log(`[transform-carousel] Using highlight color: ${highlightColor}`);
    console.log(`[transform-carousel] Using highlight color secondary: ${highlightColorSecondary}`);

    // Extract card gradient configuration if provided
    const cardGradient = body.cardGradient ? {
      color: body.cardGradient.color,
      startOpacity: body.cardGradient.startOpacity,
      midOpacity: body.cardGradient.midOpacity,
      height: body.cardGradient.height,
      direction: body.cardGradient.direction || 'to top'
    } : undefined;

    if (cardGradient) {
      console.log(`[transform-carousel] Using custom card gradient:`, cardGradient);
    }

    // Transform carousel data
    const result = processCarouselData(body, highlightColor, highlightColorSecondary, cardGradient);

    if (!result.success) {
      console.error('[transform-carousel] Transformation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 500 }
      );
    }

    console.log(`[transform-carousel] Successfully transformed ${result.layouts.length} layouts`);

    return NextResponse.json({
      success: true,
      layouts: result.layouts,
      count: result.layouts.length,
      highlightColor,
      highlightColorSecondary
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[transform-carousel] Error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transform-carousel
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/transform-carousel',
    method: 'POST',
    description: 'Transforms AI-generated carousel JSON into layout objects for image generation',
    request: {
      carrossel: {
        slides: [
          {
            numero: 'number - Slide number',
            estilo: '"stack-img" | "stack-img-bg" | "ff_stack1" | "ff_stack2" | "ff_capa" - Layout style',
            texto_1: 'string (optional) - Text for field 1',
            texto_2: 'string (optional) - Text for field 2',
            texto_3: 'string (optional) - Text for field 3',
            texto_4: 'string (optional) - Text for field 4',
            texto_5: 'string (optional) - Text for field 5',
            titulo: 'string (optional) - Title for ff_capa template',
            titleSpecialStyling: '{ enabled: boolean, lineStyles: [] } (optional) - Per-line styling for ff_capa',
            destaques: {
              texto_1: 'string[] (optional) - Text to highlight in field 1',
              texto_2: 'string[] (optional) - Text to highlight in field 2',
              texto_3: 'string[] (optional) - Text to highlight in field 3',
              texto_4: 'string[] (optional) - Text to highlight in field 4',
              texto_5: 'string[] (optional) - Text to highlight in field 5',
              titulo: 'string[] (optional) - Text to highlight in titulo (ff_capa)',
            }
          }
        ]
      },
      highlightColor: 'string (optional) - Color for highlighted text on light themes (default: #ff0000)',
      highlightColorSecondary: 'string (optional) - Color for highlighted text on dark themes/-b variants (default: #ffffff)'
    },
    response: {
      success: 'boolean - Transformation success status',
      layouts: 'LayoutData[] - Array of complete layout objects ready for image generation',
      count: 'number - Number of layouts generated',
      highlightColor: 'string - Color used for highlights on light themes',
      highlightColorSecondary: 'string - Color used for highlights on dark themes'
    },
    example: {
      request: {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img',
              texto_1: 'Welcome to our platform',
              texto_2: 'Build amazing things',
              destaques: {
                texto_1: ['Welcome'],
                texto_2: ['amazing']
              }
            }
          ]
        },
        highlightColor: '#ff0000'
      },
      response: {
        success: true,
        layouts: [
          {
            template: 'stack',
            text1: 'Welcome to our platform',
            text2: 'Build amazing things',
            text1StyledChunks: [{ text: 'Welcome', color: '#ff0000' }],
            text2StyledChunks: [{ text: 'amazing', color: '#ff0000' }],
            // ... other layout properties
          }
        ],
        count: 1,
        highlightColor: '#ff0000'
      }
    },
    workflow: [
      '1. Send carousel JSON to /api/transform-carousel',
      '2. Receive transformed layouts array',
      '3. Send layouts to /api/generate-batch to generate images',
      'OR: Use processCarouselData() utility directly in server-side code'
    ],
    notes: [
      'This endpoint only transforms data - no images are generated',
      'Use /api/generate-batch to generate images from the transformed layouts',
      'Layout templates are loaded from templates/layouts/ directory',
      'All text inputs are sanitized to prevent XSS attacks',
      'Highlight color must be a valid CSS color value'
    ]
  });
}
