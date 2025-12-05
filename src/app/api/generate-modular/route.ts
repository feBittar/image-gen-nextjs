import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import puppeteer, { Browser, Page } from 'puppeteer';
import { composeTemplate } from '@/lib/modules/compositer';
import { getPreset, applyPreset } from '@/lib/presets/index';
import { ModuleData } from '@/lib/modules/types';
import { processTextField } from '@/lib/utils/textProcessor';
import type { CompositionConfig } from '@/lib/layout/types';
import {
  wrapInCarousel,
  generateCarouselCSS,
  captureCarouselSlides,
  FreeImageConfig,
  validateFreeImageConfig
} from '@/lib/utils/carouselHelpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Slide definition for carousel mode
 */
interface SlideData {
  id: string;
  data: Record<string, ModuleData>;
  enabledModules: string[];
}

interface ModularGenerateRequest {
  presetId?: string;

  // NEW: Multi-slide carousel structure
  slides?: SlideData[];
  freeImage?: FreeImageConfig;

  // LEGACY: Single slide mode (backward compatibility)
  enabledModules?: string[];
  moduleData?: Record<string, ModuleData>;

  outputOptions?: {
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    filename?: string;
  };
  compositionConfig?: CompositionConfig;
}

interface ModularGenerateResponse {
  success: true;
  images: string[];
  filenames: string[];
  htmlUrl?: string;
  durationMs: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

// ============================================================================
// BROWSER MANAGEMENT
// ============================================================================

let browserInstance: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log('[Modular Generator] Launching new browser instance...');
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
      ],
    });
  }
  return browserInstance;
}

// ============================================================================
// TEXT PROCESSING
// ============================================================================

/**
 * Process text fields in module data recursively
 */
function processModuleTextFields(moduleData: Record<string, ModuleData>): Record<string, ModuleData> {
  const processed: Record<string, ModuleData> = {};

  for (const [moduleId, data] of Object.entries(moduleData)) {
    processed[moduleId] = processObjectTextFields(data);
  }

  return processed;
}

/**
 * Recursively process text fields in an object
 */
function processObjectTextFields(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // If it's a primitive, return as-is
  if (typeof obj !== 'object') {
    return obj;
  }

  // If it's an array, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => processObjectTextFields(item));
  }

  // If it's an object, process each value
  const processed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Check if this looks like a text field with styled chunks
    if (
      typeof value === 'object' &&
      value !== null &&
      'content' in value &&
      typeof value.content === 'string'
    ) {
      // This looks like a text field - process it
      const style = (value as any).style || {};
      const styledChunks = (value as any).styledChunks || [];

      const fieldData = {
        text: value.content,
        styledChunks: styledChunks.length > 0 ? styledChunks : undefined,
      };

      processed[key] = {
        ...value,
        processedContent: processTextField(fieldData, style),
      };
    } else {
      // Recursively process nested objects
      processed[key] = processObjectTextFields(value);
    }
  }

  return processed;
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

/**
 * Generate images using Puppeteer - handles both single slide and carousel modes
 */
async function generateImages(
  html: string,
  viewportWidth: number,
  viewportHeight: number,
  outputOptions: ModularGenerateRequest['outputOptions'],
  slideCount: number
): Promise<{
  images: string[];
  filenames: string[];
  htmlFilename: string;
}> {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 2, // Retina quality
    });

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Additional wait for SVGs and images to paint
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Prepare output directory
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), 'public', 'output');

    await fs.mkdir(outputDir, { recursive: true });

    // Save HTML for debugging
    const htmlFilename = slideCount > 1 ? `carousel-${timestamp}.html` : `modular-${timestamp}.html`;
    const htmlPath = path.join(outputDir, htmlFilename);
    await fs.writeFile(htmlPath, html, 'utf-8');

    // Handle carousel vs single slide mode
    if (slideCount >= 2) {
      console.log(`[Modular Generator] Capturing ${slideCount} carousel slides...`);

      const filenames = await captureCarouselSlides(page, slideCount, outputDir, timestamp);
      const images = filenames.map(filename => `/output/${filename}`);

      return { images, filenames, htmlFilename };
    } else {
      // Standard single image generation
      console.log('[Modular Generator] Generating single image...');

      const format = outputOptions?.format || 'png';
      const quality = outputOptions?.quality || 100;
      const baseFilename = outputOptions?.filename
        ? outputOptions.filename.replace(/\.[^.]+$/, '') // Remove extension if provided
        : `modular-${timestamp}`;
      const filename = `${baseFilename}.${format}` as const;
      const outputPath = path.join(outputDir, filename);

      await page.screenshot({
        path: outputPath as `${string}.png` | `${string}.jpeg` | `${string}.webp`,
        type: format,
        quality: format === 'jpeg' ? quality : undefined,
      });

      return {
        images: [`/output/${filename}`],
        filenames: [filename],
        htmlFilename,
      };
    }
  } finally {
    await page.close();
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: ModularGenerateRequest = await request.json();

    console.log('\n========== MODULAR GENERATE API ==========');
    console.log('Request type:', body.slides ? 'CAROUSEL' : 'SINGLE SLIDE');
    console.log('Preset ID:', body.presetId || 'none');

    // Detect carousel mode
    const isCarouselMode = body.slides && body.slides.length >= 2;

    // ========== CAROUSEL MODE ==========
    if (isCarouselMode) {
      console.log('[Modular Generator] CAROUSEL MODE');
      console.log(`  - Slide count: ${body.slides!.length}`);
      console.log(`  - Free image: ${body.freeImage?.enabled ? 'enabled' : 'disabled'}`);

      const slides = body.slides!;
      const slideCount = slides.length;
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      // Validate free image configuration
      const validatedFreeImage = validateFreeImageConfig(body.freeImage);

      // Process each slide and collect HTML
      const slideHTMLs: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        console.log(`\n[Carousel Slide ${i + 1}/${slideCount}]`);
        console.log(`  - ID: ${slide.id}`);
        console.log(`  - Enabled modules: ${slide.enabledModules.join(', ')}`);

        // Use slide data directly (no merging with shared data)
        const slideData = slide.data;

        // Process text fields for this slide
        console.log(`  - Processing text fields for slide ${i + 1}...`);
        const processedData = processModuleTextFields(slideData);

        // Compose template for this slide
        console.log(`  - Composing template for slide ${i + 1}...`);
        const composed = composeTemplate(
          slide.enabledModules,
          processedData,
          {
            baseUrl,
            compositionConfig: body.compositionConfig,
            slideCount: 1, // Each slide is composed as a single 1080x1440 unit
          }
        );

        console.log(`  - Slide ${i + 1} composed: ${composed.modulesHTML.length} chars HTML`);

        // Extract body content from finalHtml
        // The finalHtml has the complete HTML structure, we need just the body content
        const bodyMatch = composed.finalHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1].trim() : composed.modulesHTML;

        slideHTMLs.push(bodyContent);
      }

      // Wrap slides in carousel structure
      console.log('\n[Modular Generator] Wrapping slides in carousel...');
      const carouselBodyHTML = wrapInCarousel(slideHTMLs, validatedFreeImage);
      const carouselCSS = generateCarouselCSS(slideCount, validatedFreeImage);

      // Build final HTML with carousel structure
      const viewportWidth = slideCount * 1080;
      const viewportHeight = 1440;

      // Get CSS from first slide as base
      const firstSlideComposed = composeTemplate(
        slides[0].enabledModules,
        processModuleTextFields(slides[0].data),
        {
          baseUrl,
          compositionConfig: body.compositionConfig,
          slideCount: 1,
        }
      );

      const finalHTML = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${viewportWidth}, height=${viewportHeight}">
  <title>Generated Carousel</title>

  <!-- Base CSS -->
  <link rel="stylesheet" href="${baseUrl}/css/base/reset.css">
  <link rel="stylesheet" href="${baseUrl}/css/modules/fonts.css">

  <!-- Module CSS -->
  <style>
    /* CSS Variables */
    :root {
      ${firstSlideComposed.styleVariables}
    }

    /* Carousel Layout */
    ${carouselCSS}

    /* Module styles */
    ${firstSlideComposed.modulesCSS}
  </style>
</head>
<body>
  ${carouselBodyHTML}

  <!-- Global scripts -->
  <script src="${baseUrl}/js/global-elements.js"></script>
  <script>
    // Wait for fonts to load
    document.fonts.ready.then(function() {
      document.body.classList.add('fonts-loaded');
    });
  </script>
</body>
</html>`;

      // Generate images
      console.log('[Modular Generator] Generating carousel screenshots...');
      const { images, filenames, htmlFilename } = await generateImages(
        finalHTML,
        viewportWidth,
        viewportHeight,
        body.outputOptions,
        slideCount
      );

      const durationMs = Date.now() - startTime;

      console.log('[Modular Generator] Carousel generation success!');
      console.log('  - Images generated:', filenames);
      console.log('  - Duration:', `${durationMs}ms`);

      return NextResponse.json({
        success: true,
        images,
        filenames,
        htmlUrl: `/output/${htmlFilename}`,
        durationMs,
      } as ModularGenerateResponse);
    }

    // ========== SINGLE SLIDE MODE (Backward Compatibility) ==========
    console.log('[Modular Generator] SINGLE SLIDE MODE');

    // Validate required fields for single slide mode
    if (!body.enabledModules || !Array.isArray(body.enabledModules)) {
      return NextResponse.json(
        {
          success: false,
          error: 'enabledModules array is required for single slide mode',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (body.enabledModules.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one module must be enabled',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    console.log('  - Enabled modules:', body.enabledModules);

    // Use only the modules the user explicitly enabled
    const enabledModules = [...body.enabledModules];
    let moduleData = { ...body.moduleData };

    // Apply preset defaults if provided (preset data does NOT override user data)
    if (body.presetId) {
      console.log(`[Modular Generator] Using preset "${body.presetId}" for defaults only`);
      const presetData = applyPreset(body.presetId);

      if (presetData) {
        // Only merge module DATA from preset (for defaults)
        // User's moduleData takes precedence over preset defaults
        moduleData = {
          ...presetData.moduleData,
          ...moduleData,
        };
      } else {
        console.warn(`[Modular Generator] Preset "${body.presetId}" not found, ignoring`);
      }
    }

    console.log('[Modular Generator] Final enabled modules:', enabledModules);

    // Process text fields in module data
    console.log('[Modular Generator] Processing text fields...');
    const processedModuleData = processModuleTextFields(moduleData);

    // Compose template from modules
    console.log('[Modular Generator] Composing template...');
    const composed = composeTemplate(enabledModules, processedModuleData, {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      compositionConfig: body.compositionConfig,
      slideCount: 1,
    });

    console.log('[Modular Generator] Composed template:');
    console.log('  - Viewport:', `${composed.viewportWidth}x${composed.viewportHeight}`);
    console.log('  - CSS length:', composed.modulesCSS.length);
    console.log('  - HTML length:', composed.modulesHTML.length);

    // Generate images
    console.log('[Modular Generator] Generating images...');
    const { images, filenames, htmlFilename } = await generateImages(
      composed.finalHtml,
      composed.viewportWidth,
      composed.viewportHeight,
      body.outputOptions,
      1 // Single slide
    );

    const durationMs = Date.now() - startTime;

    console.log('[Modular Generator] Success!');
    console.log('  - Images generated:', filenames);
    console.log('  - Duration:', `${durationMs}ms`);

    return NextResponse.json({
      success: true,
      images,
      filenames,
      htmlUrl: `/output/${htmlFilename}`,
      durationMs,
    } as ModularGenerateResponse);

  } catch (error) {
    console.error('[Modular Generator] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? { stack: error.stack } : undefined;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
