import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import puppeteer, { Browser, Page, ScreenshotOptions } from 'puppeteer';
import { versusDuoTemplateSchema, VersusDuoTemplateFormData } from '@/lib/schemas/versusDuoTemplate';
import { processTextField } from '@/lib/utils/textProcessor';
import {
  extractCustomFonts,
  mapFontNameToFile,
  generateFontFaceCSS,
  injectFontFaceIntoHTML,
  FontDefinition,
} from '@/lib/services/fontInjector';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

// Browser instance for reuse
let browserInstance: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      defaultViewport: null,
      protocolTimeout: 60000,
    });

    browserInstance.on('disconnected', () => {
      browserInstance = null;
    });
  }
  return browserInstance;
}

interface GenerationResult {
  success: boolean;
  slide1Url?: string;
  slide1Filename?: string;
  slide2Url?: string;
  slide2Filename?: string;
  htmlUrl?: string;
  durationMs?: number;
  error?: string;
}

// Load SVG inline for corner content
async function loadSvgContent(svgUrl: string): Promise<string | null> {
  try {
    let filePath: string;
    if (svgUrl.startsWith('/')) {
      filePath = path.join(process.cwd(), 'public', svgUrl);
    } else if (svgUrl.startsWith('http')) {
      // For local URLs, extract path
      const url = new URL(svgUrl);
      filePath = path.join(process.cwd(), 'public', url.pathname);
    } else {
      filePath = path.join(process.cwd(), 'public', 'logos', svgUrl);
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return content
      .replace(/<\?xml[^?]*\?>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .trim();
  } catch {
    return null;
  }
}

// Convert color to CSS filter for SVG coloring
function convertColorToFilter(color: string): string {
  if (!color || color === 'none') return 'none';

  const normalizedColor = color.toLowerCase().trim();

  const presetFilters: Record<string, string> = {
    'white': 'brightness(0) saturate(100%) invert(100%)',
    '#ffffff': 'brightness(0) saturate(100%) invert(100%)',
    '#fff': 'brightness(0) saturate(100%) invert(100%)',
    'black': 'brightness(0) saturate(100%)',
    '#000000': 'brightness(0) saturate(100%)',
    '#000': 'brightness(0) saturate(100%)',
  };

  if (presetFilters[normalizedColor]) {
    return presetFilters[normalizedColor];
  }

  // For other colors, use a basic filter approach
  let hex = normalizedColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return 'none';
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Convert to HSL
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
      case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
      case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
    }
  }

  const invert = l > 0.5 ? 1 : 0;
  const sepia = s > 0 ? 100 : 0;
  const saturate = s > 0 ? Math.round(s * 100 * 20) : 100;
  const hueRotate = Math.round(h * 360);
  const brightness = Math.round(l * 200);

  return `brightness(0) saturate(100%) invert(${invert * 100}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(100%)`;
}

// Apply color to inline SVG by modifying fill attributes
function applySvgColor(svgContent: string, color: string, width: string, height: string): string {
  if (!svgContent || !color) return svgContent;

  let svg = svgContent;

  // Add width and height to the root SVG element
  svg = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
    let newAttrs = attrs;
    // Remove existing width/height attributes
    newAttrs = newAttrs.replace(/\s*width="[^"]*"/gi, '');
    newAttrs = newAttrs.replace(/\s*height="[^"]*"/gi, '');
    // Add new width/height
    return `<svg${newAttrs} width="${width}" height="${height}">`;
  });

  // Replace ALL fill attributes (except "none") with the new color
  // This handles hex colors, named colors (black, white, red, etc.), rgb(), etc.
  // Pattern: fill="anything except none"
  svg = svg.replace(/\bfill\s*=\s*"(?!none")[^"]*"/gi, `fill="${color}"`);
  svg = svg.replace(/\bfill\s*=\s*'(?!none')[^']*'/gi, `fill='${color}'`);

  // Also handle style="...fill:..." inline styles
  svg = svg.replace(/(\bstyle\s*=\s*")([^"]*?)fill\s*:\s*(?!none)[^;]+;?/gi, `$1$2fill:${color};`);
  svg = svg.replace(/(\bstyle\s*=\s*')([^']*?)fill\s*:\s*(?!none)[^;]+;?/gi, `$1$2fill:${color};`);

  // Add fill to elements that don't have it (path, rect, circle, etc.)
  const elementsToFill = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'g'];
  for (const elem of elementsToFill) {
    // Add fill to elements that don't have a fill attribute
    const regex = new RegExp(`<${elem}((?![^>]*\\bfill\\s*=)[^>]*)(/?)>`, 'gi');
    svg = svg.replace(regex, `<${elem}$1 fill="${color}"$2>`);
  }

  return svg;
}

// Process corner content (text or SVG) - matching imageGenerator.ts logic
async function processCornerContent(
  type: string | undefined,
  text: string | undefined,
  textStyle: any,
  backgroundEnabled: boolean | undefined,
  svgContent: string | undefined,
  svgUrl: string | undefined,
  svgColor: string | undefined,
  svgWidth: string | undefined,
  svgHeight: string | undefined
): Promise<string> {
  if (type === 'none' || !type) return '';

  if (type === 'svg') {
    // Parse width/height
    const widthRaw = svgWidth || 'auto';
    const heightRaw = svgHeight || 'auto';
    const width = widthRaw === 'auto' || isNaN(Number(widthRaw)) ? widthRaw : `${widthRaw}px`;
    const height = heightRaw === 'auto' || isNaN(Number(heightRaw)) ? heightRaw : `${heightRaw}px`;

    if (svgUrl && svgUrl !== 'none') {
      // Load SVG content inline and apply color directly
      console.log(`[Corner SVG] Loading SVG from URL: ${svgUrl}`);
      console.log(`[Corner SVG] Color to apply: ${svgColor}`);
      const loadedSvg = await loadSvgContent(svgUrl);
      console.log(`[Corner SVG] Loaded SVG: ${loadedSvg ? 'SUCCESS' : 'FAILED'}`);
      if (loadedSvg && svgColor) {
        const coloredSvg = applySvgColor(loadedSvg, svgColor, width, height);
        console.log(`[Corner SVG] Applied color. First 500 chars: ${coloredSvg.substring(0, 500)}`);
        return coloredSvg;
      } else if (loadedSvg) {
        // No color specified, just set dimensions
        return loadedSvg.replace(/<svg([^>]*)>/, (match, attrs) => {
          let newAttrs = attrs;
          newAttrs = newAttrs.replace(/\s*width="[^"]*"/g, '');
          newAttrs = newAttrs.replace(/\s*height="[^"]*"/g, '');
          return `<svg${newAttrs} width="${width}" height="${height}">`;
        });
      }
      // Fallback to img with filter if loading fails
      const colorFilter = convertColorToFilter(svgColor || '');
      const filterStyle = colorFilter !== 'none' ? `filter: ${colorFilter};` : '';
      return `<img src="${svgUrl}" style="width: ${width}; height: ${height}; object-fit: contain; ${filterStyle}" />`;
    } else if (svgContent) {
      // Inline SVG content - apply color if specified
      if (svgColor) {
        return applySvgColor(svgContent, svgColor, width, height);
      }
      return svgContent;
    }
    return '';
  }

  if (type === 'text' && text) {
    const style = textStyle || {};
    let styleCSS = '';

    if (style.fontFamily) styleCSS += `font-family: ${style.fontFamily}; `;
    if (style.fontSize) styleCSS += `font-size: ${style.fontSize}; `;
    if (style.fontWeight) styleCSS += `font-weight: ${style.fontWeight}; `;
    if (style.color) styleCSS += `color: ${style.color}; `;

    // Only apply background when enabled
    if (backgroundEnabled) {
      if (style.backgroundColor) styleCSS += `background-color: ${style.backgroundColor}; `;
      if (style.padding) styleCSS += `padding: ${style.padding}; `;
    }

    if (style.textAlign) styleCSS += `text-align: ${style.textAlign}; `;
    if (style.lineHeight) styleCSS += `line-height: ${style.lineHeight}; `;
    if (style.letterSpacing) styleCSS += `letter-spacing: ${style.letterSpacing}; `;
    if (style.textTransform) styleCSS += `text-transform: ${style.textTransform}; `;
    if (style.textDecoration && style.textDecoration !== 'none') styleCSS += `text-decoration: ${style.textDecoration}; `;
    if (style.textShadow) styleCSS += `text-shadow: ${style.textShadow}; `;

    return styleCSS ? `<span style="${styleCSS}">${text}</span>` : text;
  }

  return '';
}

// Build CSS variables for the template
function buildStyleVariables(data: VersusDuoTemplateFormData): string {
  const vars: string[] = [];

  // Image positioning
  vars.push(`--image-offset-x: ${data.centerImageOffsetX || 0}px`);
  vars.push(`--image-offset-y: ${data.centerImageOffsetY || 0}px`);
  vars.push(`--image-scale: ${(data.centerImageScale || 100) / 100}`);

  // Image outline effect (multiple drop-shadows to create solid outline)
  if (data.centerImageOutlineEnabled) {
    const color = data.centerImageOutlineColor || '#000000';
    const size = data.centerImageOutlineSize || 10;
    // Create multiple drop-shadows in all directions for a solid outline effect
    const shadows = [
      `drop-shadow(${size}px 0 0 ${color})`,
      `drop-shadow(-${size}px 0 0 ${color})`,
      `drop-shadow(0 ${size}px 0 ${color})`,
      `drop-shadow(0 -${size}px 0 ${color})`,
      `drop-shadow(${size}px ${size}px 0 ${color})`,
      `drop-shadow(-${size}px ${size}px 0 ${color})`,
      `drop-shadow(${size}px -${size}px 0 ${color})`,
      `drop-shadow(-${size}px -${size}px 0 ${color})`,
    ];
    vars.push(`--center-image-outline: ${shadows.join(' ')}`);
  } else {
    vars.push(`--center-image-outline: none`);
  }

  // Container padding
  vars.push(`--container-padding-top: ${data.containerPaddingTop || 100}px`);
  vars.push(`--container-padding-right: ${data.containerPaddingRight || 80}px`);
  vars.push(`--container-padding-bottom: ${data.containerPaddingBottom || 100}px`);
  vars.push(`--container-padding-left: ${data.containerPaddingLeft || 80}px`);
  vars.push(`--content-gap: ${data.contentGap || 40}px`);

  // Comparison images
  vars.push(`--image-gap: ${data.imageGap || 40}px`);
  vars.push(`--image-border-radius: ${data.imageBorderRadius || 0}px`);

  // Corner positions
  for (let i = 1; i <= 4; i++) {
    const specialPos = data[`corner${i}SpecialPosition` as keyof VersusDuoTemplateFormData] as string;
    const paddingX = (data[`corner${i}PaddingX` as keyof VersusDuoTemplateFormData] as number) || 40;
    const paddingY = (data[`corner${i}PaddingY` as keyof VersusDuoTemplateFormData] as number) || 40;

    if (specialPos === 'top-left') {
      vars.push(`--corner${i}-top: ${paddingY}px`);
      vars.push(`--corner${i}-left: ${paddingX}px`);
    } else if (specialPos === 'top-right') {
      vars.push(`--corner${i}-top: ${paddingY}px`);
      vars.push(`--corner${i}-right: ${paddingX}px`);
    } else if (specialPos === 'bottom-left') {
      vars.push(`--corner${i}-bottom: ${paddingY}px`);
      vars.push(`--corner${i}-left: ${paddingX}px`);
    } else if (specialPos === 'bottom-right') {
      vars.push(`--corner${i}-bottom: ${paddingY}px`);
      vars.push(`--corner${i}-right: ${paddingX}px`);
    }

    // SVG color
    const svgColor = data[`corner${i}SvgColor` as keyof VersusDuoTemplateFormData] as string;
    if (svgColor) {
      vars.push(`--corner${i}-svg-color: ${svgColor}`);
    }
  }

  return vars.join('; ') + ';';
}

// Replace placeholders in template
async function processTemplate(
  template: string,
  data: VersusDuoTemplateFormData
): Promise<string> {
  let html = template;

  // Build and inject style variables
  const styleVars = buildStyleVariables(data);
  html = html.replace('{{styleVariables}}', styleVars);

  // Replace simple placeholders
  html = html.replace('{{backgroundColor}}', data.backgroundColor || '#FFFFFF');
  html = html.replace('{{centerImageUrl}}', data.centerImageUrl || '');

  // Replace comparison image placeholders
  html = html.replace('{{slide1ImageLeftUrl}}', data.slide1ImageLeftUrl || '');
  html = html.replace('{{slide1ImageRightUrl}}', data.slide1ImageRightUrl || '');
  html = html.replace('{{slide2ImageLeftUrl}}', data.slide2ImageLeftUrl || '');
  html = html.replace('{{slide2ImageRightUrl}}', data.slide2ImageRightUrl || '');

  // Process text fields
  const textFields = [
    { key: 'slide1Text1', chunksKey: 'slide1Text1StyledChunks', styleKey: 'slide1Text1Style' },
    { key: 'slide1Text2', chunksKey: 'slide1Text2StyledChunks', styleKey: 'slide1Text2Style' },
    { key: 'slide2Text1', chunksKey: 'slide2Text1StyledChunks', styleKey: 'slide2Text1Style' },
    { key: 'slide2Text2', chunksKey: 'slide2Text2StyledChunks', styleKey: 'slide2Text2Style' },
  ];

  for (const field of textFields) {
    const textValue = data[field.key as keyof VersusDuoTemplateFormData] as string;
    const chunks = data[field.chunksKey as keyof VersusDuoTemplateFormData] as any[];
    const style = data[field.styleKey as keyof VersusDuoTemplateFormData] as any;

    let processedText = '';
    if (textValue) {
      if (chunks && chunks.length > 0) {
        processedText = processTextField({ text: textValue, styledChunks: chunks }, style) || '';
      } else {
        processedText = processTextField(textValue, style) || '';
      }
    }
    html = html.replace(`{{${field.key}}}`, processedText);
  }

  // Process corners
  for (let i = 1; i <= 4; i++) {
    const type = data[`corner${i}Type` as keyof VersusDuoTemplateFormData] as string;
    const text = data[`corner${i}Text` as keyof VersusDuoTemplateFormData] as string;
    const textStyle = data[`corner${i}TextStyle` as keyof VersusDuoTemplateFormData] as any;
    const backgroundEnabled = data[`corner${i}BackgroundEnabled` as keyof VersusDuoTemplateFormData] as boolean;
    const svgContent = data[`corner${i}SvgContent` as keyof VersusDuoTemplateFormData] as string;
    const svgUrl = data[`corner${i}SvgUrl` as keyof VersusDuoTemplateFormData] as string;
    const svgColor = data[`corner${i}SvgColor` as keyof VersusDuoTemplateFormData] as string;
    const svgWidth = data[`corner${i}SvgWidth` as keyof VersusDuoTemplateFormData] as string;
    const svgHeight = data[`corner${i}SvgHeight` as keyof VersusDuoTemplateFormData] as string;

    const cornerContent = await processCornerContent(
      type,
      text,
      textStyle,
      backgroundEnabled,
      svgContent,
      svgUrl,
      svgColor,
      svgWidth,
      svgHeight
    );

    // Replace both instances (slide 1 and slide 2)
    html = html.replace(new RegExp(`\\{\\{\\{corner${i}Content\\}\\}\\}`, 'g'), cornerContent);
  }

  return html;
}

// Inject fonts into HTML
async function injectFonts(html: string, data: VersusDuoTemplateFormData): Promise<string> {
  const fontSources: any[] = [];

  // Collect all text styles
  const styleKeys = [
    'slide1Text1Style', 'slide1Text2Style',
    'slide2Text1Style', 'slide2Text2Style',
    'corner1TextStyle', 'corner2TextStyle',
    'corner3TextStyle', 'corner4TextStyle',
  ];

  for (const key of styleKeys) {
    const style = data[key as keyof VersusDuoTemplateFormData] as any;
    if (style) fontSources.push(style);
  }

  // Extract custom fonts
  const customFonts = extractCustomFonts(fontSources);

  if (customFonts.size === 0) return html;

  // Get available font files
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const availableFontFiles = await fs.readdir(fontsDir).catch(() => []);

  if (availableFontFiles.length === 0) return html;

  // Map fonts to files
  const fontDefinitions: FontDefinition[] = [];
  for (const fontName of Array.from(customFonts)) {
    const fontDef = mapFontNameToFile(fontName, availableFontFiles);
    if (fontDef) {
      fontDefinitions.push(fontDef);
    }
  }

  if (fontDefinitions.length === 0) return html;

  // Generate and inject font CSS
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const fontFaceCSS = generateFontFaceCSS(fontDefinitions, baseUrl);

  return injectFontFaceIntoHTML(html, fontFaceCSS);
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerationResult>> {
  const startTime = Date.now();
  let page: Page | null = null;

  try {
    const body = await request.json();

    console.log('\n========== DEBUG /api/generate-versus-duo ==========');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate with schema
    const validatedData = versusDuoTemplateSchema.parse(body);

    // Load template
    const templatePath = path.join(process.cwd(), 'templates', 'versus-duo.html');
    let html = await fs.readFile(templatePath, 'utf-8');

    // Process template with data
    html = await processTemplate(html, validatedData);

    // Inject fonts
    html = await injectFonts(html, validatedData);

    console.log('Template processed, creating browser page...');

    // Create Puppeteer page with double-width viewport
    const browser = await getBrowserInstance();
    page = await browser.newPage();

    // Set viewport to 2160x1440 (2 slides side by side)
    await page.setViewport({
      width: 2160,
      height: 1440,
      deviceScaleFactor: 2, // Retina quality
    });

    await page.setDefaultNavigationTimeout(30000);

    // Load HTML
    const navigationPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {
      console.log('Navigation promise resolved');
    });

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    await navigationPromise;

    // Wait for fonts
    console.log('Waiting for fonts...');
    await page.evaluateHandle('document.fonts.ready').catch(() => {
      console.warn('Timeout waiting for fonts');
    });

    // Wait for images to load
    await page.evaluate(() => {
      const doc = document as any;
      return Promise.all(
        Array.from(doc.images)
          .filter((img: any) => !img.complete)
          .map((img: any) => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });

    // Extra wait for SVG rendering
    const hasSVGElements = await page.evaluate(() => {
      return document.querySelectorAll('svg').length > 0;
    });

    if (hasSVGElements) {
      console.log('SVG elements detected, adding extra wait...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final rendering delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Prepare output directory
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), 'public', 'output');

    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }

    const slide1Filename = `versus-duo-${timestamp}-1.png`;
    const slide2Filename = `versus-duo-${timestamp}-2.png`;
    const htmlFilename = `versus-duo-${timestamp}.html`;

    const slide1Path = path.join(outputDir, slide1Filename);
    const slide2Path = path.join(outputDir, slide2Filename);
    const htmlPath = path.join(outputDir, htmlFilename);

    // Capture Slide 1 (left half: 0-1080px)
    console.log('Capturing slide 1...');
    await page.screenshot({
      path: slide1Path,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1440 },
    } as ScreenshotOptions);

    // Capture Slide 2 (right half: 1080-2160px)
    console.log('Capturing slide 2...');
    await page.screenshot({
      path: slide2Path,
      type: 'png',
      clip: { x: 1080, y: 0, width: 1080, height: 1440 },
    } as ScreenshotOptions);

    // Save HTML for debugging
    await fs.writeFile(htmlPath, html);

    const duration = Date.now() - startTime;
    console.log(`Generation completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      slide1Url: `/output/${slide1Filename}`,
      slide1Filename,
      slide2Url: `/output/${slide2Filename}`,
      slide2Filename,
      htmlUrl: `/output/${htmlFilename}`,
      durationMs: duration,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-versus-duo] Error:', errorMessage);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}
