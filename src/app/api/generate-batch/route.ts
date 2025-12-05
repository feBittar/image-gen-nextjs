import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { generateImage } from '@/lib/services/imageGenerator';
import { processTextField } from '@/lib/utils/textProcessor';
import { stackTemplateSchema, StackTemplateFormData } from '@/lib/schemas/stackTemplate';
import { fitfeedCapaTemplateSchema, FitFeedCapaTemplateFormData } from '@/lib/schemas/fitfeedCapaTemplate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for batch processing

/**
 * Result of a single image generation
 */
interface GenerationResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  slideNumber?: number;
}

/**
 * Request body for batch generation
 */
interface BatchGenerationRequest {
  layouts: (StackTemplateFormData | FitFeedCapaTemplateFormData)[];
  highlightColor?: string;
}

/**
 * Processes text fields with styled chunks support
 * Helper function to handle text1-text5 fields consistently
 */
function processTextFieldWithChunks(
  fieldName: string,
  textValue: string | undefined,
  styledChunks: any[] | undefined,
  styleValue: any
): string {
  if (!textValue || !textValue.trim()) {
    return textValue || '';
  }

  console.log(`[processTextFieldWithChunks] Processing ${fieldName}:`, textValue.substring(0, 50));

  // If styledChunks exist, create rich text object
  if (styledChunks && Array.isArray(styledChunks) && styledChunks.length > 0) {
    const richTextField = {
      text: textValue,
      styledChunks: styledChunks
    };
    const processed = processTextField(richTextField, styleValue);
    console.log(`[processTextFieldWithChunks] Processed ${fieldName} with ${styledChunks.length} chunks`);
    return processed;
  }

  // No chunks, process as simple string
  return processTextField(textValue, styleValue);
}

/**
 * Generates a single image from layout data
 * @param layoutData - Layout configuration
 * @param index - Index in batch (for logging and filename)
 * @returns Generation result
 */
async function generateSingleImage(
  layoutData: StackTemplateFormData,
  index: number
): Promise<GenerationResult> {
  try {
    console.log(`\n========== Processing Layout #${index + 1} ==========`);

    // Validate layout data against schema
    const validatedData = stackTemplateSchema.parse(layoutData);

    // Process text fields with styled chunks
    const processedData = { ...validatedData };

    // Process text1-text5 with their styled chunks
    processedData.text1 = processTextFieldWithChunks(
      'text1',
      validatedData.text1,
      validatedData.text1StyledChunks,
      validatedData.text1Style
    );

    processedData.text2 = processTextFieldWithChunks(
      'text2',
      validatedData.text2,
      validatedData.text2StyledChunks,
      validatedData.text2Style
    );

    processedData.text3 = processTextFieldWithChunks(
      'text3',
      validatedData.text3,
      validatedData.text3StyledChunks,
      validatedData.text3Style
    );

    processedData.text4 = processTextFieldWithChunks(
      'text4',
      validatedData.text4,
      validatedData.text4StyledChunks,
      validatedData.text4Style
    );

    processedData.text5 = processTextFieldWithChunks(
      'text5',
      validatedData.text5,
      validatedData.text5StyledChunks,
      validatedData.text5Style
    );

    // Validate at least one text field has content
    const hasText = processedData.text1?.trim() || processedData.text2?.trim() ||
                    processedData.text3?.trim() || processedData.text4?.trim() ||
                    processedData.text5?.trim();

    if (!hasText) {
      throw new Error('At least one text field must have content');
    }

    // Determine template
    const templateName = validatedData.template || 'stack';
    const templatesDir = path.join(process.cwd(), 'templates');
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${templateName}" not found`);
    }

    // Generate output path
    const timestamp = Date.now();
    const filename = `batch-${timestamp}-${index + 1}.png`;
    const outputDir = path.join(process.cwd(), 'public', 'output');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);

    console.log(`[generateSingleImage] Template: ${templateName}`);
    console.log(`[generateSingleImage] Output: ${filename}`);

    // Generate image
    // Cast to any to allow StackTemplateFormData (which doesn't have 'title')
    const result = await generateImage({
      templatePath,
      data: processedData as any,
      width: 1080,
      height: 1440,
      outputPath,
      format: 'png',
      quality: 100
    });

    if (!result.success) {
      throw new Error(result.error || 'Image generation failed');
    }

    console.log(`[generateSingleImage] Success: ${filename}`);

    return {
      success: true,
      filename,
      url: `/output/${filename}`,
      slideNumber: index + 1
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[generateSingleImage] Error for layout #${index + 1}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
      slideNumber: index + 1
    };
  }
}

/**
 * Generates a single image from FitFeed Capa layout data
 * @param layoutData - FitFeed Capa layout configuration
 * @param index - Index in batch (for logging and filename)
 * @returns Generation result
 */
async function generateFitFeedCapaImage(
  layoutData: FitFeedCapaTemplateFormData,
  index: number
): Promise<GenerationResult> {
  try {
    console.log(`\n========== Processing FitFeed Capa Layout #${index + 1} ==========`);

    // Validate layout data against fitfeed-capa schema
    const validatedData = fitfeedCapaTemplateSchema.parse(layoutData);

    // Process title with styled chunks if they exist
    const processedData: any = { ...validatedData };

    if (validatedData.title) {
      if (validatedData.titleStyledChunks && Array.isArray(validatedData.titleStyledChunks) && validatedData.titleStyledChunks.length > 0) {
        const richTextField = {
          text: validatedData.title,
          styledChunks: validatedData.titleStyledChunks
        };
        processedData.title = processTextField(richTextField, validatedData.titleStyle);
        console.log(`[generateFitFeedCapaImage] Processed title with ${validatedData.titleStyledChunks.length} chunks`);
      } else {
        processedData.title = processTextField(validatedData.title, validatedData.titleStyle);
      }
    }

    // Validate title has content
    if (!processedData.title?.trim()) {
      throw new Error('Title field must have content for fitfeed-capa template');
    }

    // Template is always fitfeed-capa
    const templatesDir = path.join(process.cwd(), 'templates');
    const templatePath = path.join(templatesDir, 'fitfeed-capa.html');

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template "fitfeed-capa" not found');
    }

    // Generate output path
    const timestamp = Date.now();
    const filename = `batch-${timestamp}-${index + 1}.png`;
    const outputDir = path.join(process.cwd(), 'public', 'output');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, filename);

    console.log(`[generateFitFeedCapaImage] Template: fitfeed-capa`);
    console.log(`[generateFitFeedCapaImage] Output: ${filename}`);

    // Generate image
    const result = await generateImage({
      templatePath,
      data: processedData,
      width: 1080,
      height: 1440,
      outputPath,
      format: 'png',
      quality: 100
    });

    if (!result.success) {
      throw new Error(result.error || 'Image generation failed');
    }

    console.log(`[generateFitFeedCapaImage] Success: ${filename}`);

    return {
      success: true,
      filename,
      url: `/output/${filename}`,
      slideNumber: index + 1
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[generateFitFeedCapaImage] Error for layout #${index + 1}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
      slideNumber: index + 1
    };
  }
}

/**
 * POST /api/generate-batch
 * Generates multiple images from an array of layout configurations
 *
 * Request body:
 * {
 *   "layouts": LayoutData[],
 *   "highlightColor": string (optional)
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "results": GenerationResult[],
 *   "summary": {
 *     "total": number,
 *     "successful": number,
 *     "failed": number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('\n========== POST /api/generate-batch ==========');

    // Parse request body
    const body: BatchGenerationRequest = await request.json();

    // Validate request
    if (!body.layouts || !Array.isArray(body.layouts)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: "layouts" must be an array'
        },
        { status: 400 }
      );
    }

    if (body.layouts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: "layouts" array cannot be empty'
        },
        { status: 400 }
      );
    }

    console.log(`[generate-batch] Processing ${body.layouts.length} layouts`);
    if (body.highlightColor) {
      console.log(`[generate-batch] Highlight color: ${body.highlightColor}`);
    }

    // Process each layout sequentially to avoid overwhelming the system
    // In production, consider using a queue or limiting concurrency
    const results: GenerationResult[] = [];

    for (let i = 0; i < body.layouts.length; i++) {
      const layout = body.layouts[i];
      const templateType = (layout as any).template;

      let result: GenerationResult;

      // Route to appropriate generator based on template type
      if (templateType === 'fitfeed-capa') {
        result = await generateFitFeedCapaImage(layout as FitFeedCapaTemplateFormData, i);
      } else {
        result = await generateSingleImage(layout as StackTemplateFormData, i);
      }

      results.push(result);

      // Continue processing even if one fails
      if (!result.success) {
        console.warn(`[generate-batch] Layout #${i + 1} failed, continuing...`);
      }
    }

    // Calculate summary statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const duration = Date.now() - startTime;
    console.log(`\n[generate-batch] Completed in ${duration}ms`);
    console.log(`[generate-batch] Summary: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: body.layouts.length,
        successful,
        failed,
        durationMs: duration
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[generate-batch] Fatal error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        durationMs: duration
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-batch
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/generate-batch',
    method: 'POST',
    description: 'Generates multiple images from an array of layout configurations',
    request: {
      layouts: 'LayoutData[] (required) - Array of layout configurations',
      highlightColor: 'string (optional) - Color for text highlights (default: inherited from layout)'
    },
    response: {
      success: 'boolean - Overall success status',
      results: 'GenerationResult[] - Individual results for each layout',
      summary: {
        total: 'number - Total layouts processed',
        successful: 'number - Successfully generated images',
        failed: 'number - Failed generations',
        durationMs: 'number - Total processing time in milliseconds'
      }
    },
    example: {
      request: {
        layouts: [
          {
            template: 'stack',
            text1: 'Hello World',
            text1Style: { fontSize: '48px', color: '#000000' },
            text2: 'Example text',
            // ... other required fields
          }
        ],
        highlightColor: '#ff0000'
      },
      response: {
        success: true,
        results: [
          {
            success: true,
            filename: 'batch-1234567890-1.png',
            url: '/output/batch-1234567890-1.png',
            slideNumber: 1
          }
        ],
        summary: {
          total: 1,
          successful: 1,
          failed: 0,
          durationMs: 1234
        }
      }
    }
  });
}
