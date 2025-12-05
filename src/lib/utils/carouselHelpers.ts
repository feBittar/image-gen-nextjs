import { Page } from 'puppeteer';
import path from 'path';

/**
 * Configuration for the free image overlay in carousel generation
 */
export interface FreeImageConfig {
  enabled: boolean;
  url: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  outlineEffect: {
    enabled: boolean;
    color: string;
    size: number;
  };
}

/**
 * Wraps slide HTML content in carousel layout structure
 *
 * @param slideHTMLs - Array of HTML content strings for each slide
 * @param freeImage - Optional free image configuration
 * @returns Complete body HTML content with carousel wrapper
 *
 * @example
 * ```typescript
 * const slides = ['<div>Slide 1</div>', '<div>Slide 2</div>'];
 * const html = wrapInCarousel(slides, {
 *   enabled: true,
 *   url: '/images/logo.png',
 *   offsetX: 50,
 *   offsetY: -20,
 *   scale: 1.2,
 *   rotation: -5,
 *   outlineEffect: { enabled: true, color: '#FFFFFF', size: 4 }
 * });
 * ```
 */
export function wrapInCarousel(slideHTMLs: string[], freeImage?: FreeImageConfig): string {
  // Handle empty array case
  if (slideHTMLs.length === 0) {
    return '<div class="carousel-wrapper"></div>';
  }

  // Wrap each slide in carousel-slide div with index-based class
  const slideElements = slideHTMLs.map((html, index) => {
    return `  <div class="carousel-slide carousel-slide-${index + 1}">
    ${html}
  </div>`;
  }).join('\n');

  // Build carousel wrapper
  let bodyContent = `<div class="carousel-wrapper">
${slideElements}
</div>`;

  // Add free image if enabled
  if (freeImage?.enabled && freeImage.url) {
    bodyContent += `\n<!-- Free image overlay -->
<img class="free-image" src="${freeImage.url}" alt="Free Image">`;
  }

  return bodyContent;
}

/**
 * Generates CSS styles for carousel layout
 *
 * @param slideCount - Number of slides in the carousel
 * @param freeImage - Optional free image configuration
 * @returns CSS string for carousel layout and optional free image positioning
 *
 * @example
 * ```typescript
 * const css = generateCarouselCSS(3, {
 *   enabled: true,
 *   url: '/logo.png',
 *   offsetX: 100,
 *   offsetY: -50,
 *   scale: 1.5,
 *   rotation: 10,
 *   outlineEffect: { enabled: true, color: '#000000', size: 3 }
 * });
 * ```
 */
export function generateCarouselCSS(slideCount: number, freeImage?: FreeImageConfig): string {
  // Handle edge case
  if (slideCount < 1) {
    slideCount = 1;
  }

  const totalWidth = slideCount * 1080;

  let css = `body {
  width: ${totalWidth}px;
  height: 1440px;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.carousel-wrapper {
  display: flex;
  flex-direction: row;
  width: ${totalWidth}px;
  height: 1440px;
}

.carousel-slide {
  width: 1080px;
  height: 1440px;
  position: relative;
  flex-shrink: 0;
}`;

  // Add free image styles if enabled
  if (freeImage?.enabled && freeImage.url) {
    const transforms = [
      'translate(-50%, -50%)',
      `translate(${freeImage.offsetX}px, ${freeImage.offsetY}px)`,
      `scale(${freeImage.scale})`,
      `rotate(${freeImage.rotation}deg)`
    ].join(' ');

    // Generate outline effect using drop-shadow filters in 8 directions
    let filterValue = '';
    if (freeImage.outlineEffect?.enabled) {
      const { color, size } = freeImage.outlineEffect;
      const shadows = [
        `drop-shadow(${size}px 0 0 ${color})`,      // right
        `drop-shadow(-${size}px 0 0 ${color})`,     // left
        `drop-shadow(0 ${size}px 0 ${color})`,      // bottom
        `drop-shadow(0 -${size}px 0 ${color})`,     // top
        `drop-shadow(${size}px ${size}px 0 ${color})`,   // bottom-right
        `drop-shadow(-${size}px ${size}px 0 ${color})`,  // bottom-left
        `drop-shadow(${size}px -${size}px 0 ${color})`,  // top-right
        `drop-shadow(-${size}px -${size}px 0 ${color})`  // top-left
      ];
      filterValue = `\n  filter: ${shadows.join(' ')};`;
    }

    css += `

.free-image {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: ${transforms};
  z-index: 100;
  pointer-events: none;${filterValue}
}`;
  }

  return css;
}

/**
 * Captures individual slides from a carousel page by clipping screenshots
 *
 * @param page - Puppeteer page instance with rendered carousel
 * @param slideCount - Number of slides to capture
 * @param outputDir - Directory to save screenshot files (e.g., 'public/output')
 * @param timestamp - Timestamp for unique file naming
 * @returns Array of file paths (relative to outputDir) for each captured slide
 *
 * @example
 * ```typescript
 * const page = await browser.newPage();
 * await page.setContent(carouselHTML);
 * const files = await captureCarouselSlides(page, 3, 'public/output', Date.now());
 * // Returns: ['carousel-1234567890-1.png', 'carousel-1234567890-2.png', 'carousel-1234567890-3.png']
 * ```
 */
export async function captureCarouselSlides(
  page: Page,
  slideCount: number,
  outputDir: string,
  timestamp: number
): Promise<string[]> {
  const filePaths: string[] = [];

  // Handle edge case
  if (slideCount < 1) {
    slideCount = 1;
  }

  // Capture each slide with clipped screenshot
  for (let i = 0; i < slideCount; i++) {
    const filename = `carousel-${timestamp}-${i + 1}.png`;
    const fullPath = path.join(outputDir, filename);

    // Clip coordinates for this slide
    const clip = {
      x: i * 1080,
      y: 0,
      width: 1080,
      height: 1440
    };

    // Capture screenshot with clip
    await page.screenshot({
      path: fullPath as `${string}.png`,
      clip,
      type: 'png'
    });

    // Store relative filename
    filePaths.push(filename);
  }

  return filePaths;
}

/**
 * Validates FreeImageConfig and returns a normalized version
 *
 * @param config - Free image configuration to validate
 * @returns Validated and normalized configuration, or undefined if invalid
 */
export function validateFreeImageConfig(config?: Partial<FreeImageConfig>): FreeImageConfig | undefined {
  if (!config || !config.enabled || !config.url) {
    return undefined;
  }

  return {
    enabled: true,
    url: config.url,
    offsetX: config.offsetX ?? 0,
    offsetY: config.offsetY ?? 0,
    scale: config.scale ?? 1,
    rotation: config.rotation ?? 0,
    outlineEffect: {
      enabled: config.outlineEffect?.enabled ?? false,
      color: config.outlineEffect?.color ?? '#FFFFFF',
      size: config.outlineEffect?.size ?? 2
    }
  };
}
