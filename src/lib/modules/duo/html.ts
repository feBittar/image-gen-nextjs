import { DuoModuleConfig } from './schema';
import { getActiveModules } from '../registry';
import { ModuleData, RenderContext } from '../types';

/**
 * Helper to convert relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl?: string): string {
  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If no baseUrl provided, return as-is (fallback)
  if (!baseUrl) {
    return url;
  }

  // Ensure baseUrl doesn't end with / and url starts with /
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  return `${cleanBaseUrl}${cleanUrl}`;
}

/**
 * Check if duo is in independent mode
 */
function isDuoIndependentMode(config: DuoModuleConfig): boolean {
  return config.mode === 'independent';
}

/**
 * Generate HTML for a single slide by calling each module's getHtml
 */
function generateSlideHTML(
  slideModuleData: Record<string, ModuleData>,
  context: RenderContext,
  enabledModules: string[]
): string {
  console.log('[Duo Independent] Generating slide HTML with modules:', enabledModules);

  const activeModules = getActiveModules(enabledModules);

  // Filter out duo module itself to avoid recursion
  const filteredModules = activeModules.filter(m => m.id !== 'duo');

  const htmlParts: string[] = [];

  for (const module of filteredModules) {
    const moduleData = slideModuleData[module.id];
    if (moduleData && module.getHtml) {
      const html = module.getHtml(moduleData, context);
      if (html) {
        htmlParts.push(html);
      }
    }
  }

  return htmlParts.join('\n');
}

/**
 * Generate duo structure with independent content for each slide
 */
function independentContentDuo(
  html: string,
  config: DuoModuleConfig,
  context: RenderContext
): string {
  console.log('[Duo Independent] Generating independent content duo');

  // Extract slide data from config
  const slide1Data = (config.slides?.slide1 || {}) as Record<string, ModuleData>;
  const slide2Data = (config.slides?.slide2 || {}) as Record<string, ModuleData>;

  // If no slide data, fallback to mirror mode
  if (!config.slides || (Object.keys(slide1Data).length === 0 && Object.keys(slide2Data).length === 0)) {
    console.warn('[Duo Independent] No slide data found, falling back to mirror mode');
    return mirrorContentDuo(html, config);
  }

  // Generate HTML for each slide
  const slide1HTML = generateSlideHTML(slide1Data, context, context.enabledModules);
  const slide2HTML = generateSlideHTML(slide2Data, context, context.enabledModules);

  console.log('[Duo Independent] Slide 1 HTML length:', slide1HTML.length);
  console.log('[Duo Independent] Slide 2 HTML length:', slide2HTML.length);

  // Wrap with duo slides structure
  return wrapWithDuoSlides(slide1HTML, slide2HTML, config);
}

/**
 * Generate duo structure with mirrored content (current behavior)
 */
function mirrorContentDuo(html: string, config: DuoModuleConfig): string {
  console.log('[Duo Mirror] Generating mirrored content duo');

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    console.error('[Duo Mirror] Could not find <body> tag in HTML');
    return html;
  }

  const bodyContent = bodyMatch[1];

  // Wrap with duo slides structure (same content for both)
  return wrapWithDuoSlides(bodyContent, bodyContent, config);
}

/**
 * Wrap slide content with duo structure
 */
function wrapWithDuoSlides(
  slide1Content: string,
  slide2Content: string,
  config: DuoModuleConfig,
  baseUrl?: string
): string {
  const { centerImageUrl } = config;

  // Resolve center image URL to absolute
  const absoluteCenterImageUrl = centerImageUrl ? resolveUrl(centerImageUrl, baseUrl) : '';

  return `
  <div class="duo-wrapper">
    <!-- Slide 1 (left: 0-1080px) -->
    <div class="duo-slide duo-slide-1">
${slide1Content}
    </div>

    <!-- Slide 2 (right: 1080-2160px) -->
    <div class="duo-slide duo-slide-2">
${slide2Content}
    </div>

    <!-- Center image (spanning both slides) -->
    ${absoluteCenterImageUrl ? `<img class="duo-center-image" src="${absoluteCenterImageUrl}" alt="Center Image" />` : ''}
  </div>`;
}

/**
 * Generate HTML structure for the Duo module
 *
 * This creates:
 * - .duo-wrapper container with 2 .duo-slide divs
 * - Central image positioned between slides
 * - Placeholders for slide content
 */
export function generateDuoHTML(config: DuoModuleConfig, slideContent: string, baseUrl?: string): string {
  const { centerImageUrl, mirrorContent } = config;

  // For mirrored content, use same content for both slides
  const slide1Content = slideContent;
  const slide2Content = mirrorContent ? slideContent : slideContent;

  // Resolve center image URL to absolute
  const absoluteCenterImageUrl = centerImageUrl ? resolveUrl(centerImageUrl, baseUrl) : '';

  return `
    <div class="duo-wrapper">
      <!-- Slide 1 (left: 0-1080px) -->
      <div class="duo-slide duo-slide-1">
        ${slide1Content}
      </div>

      <!-- Slide 2 (right: 1080-2160px) -->
      <div class="duo-slide duo-slide-2">
        ${slide2Content}
      </div>

      <!-- Center image (spanning both slides, z-index: 100) -->
      ${absoluteCenterImageUrl ? `<img class="duo-center-image" src="${absoluteCenterImageUrl}" alt="Center Image" />` : ''}
    </div>
  `;
}

/**
 * Wrap existing template HTML with Duo structure
 *
 * This function:
 * 1. Extracts the body content from the original template
 * 2. Wraps it in .duo-wrapper with 2 .duo-slide containers
 * 3. Adds the center image
 * 4. Injects Duo CSS
 */
export function wrapTemplateWithDuo(
  originalHTML: string,
  config: DuoModuleConfig,
  duoCSS: string,
  baseUrl?: string
): string {
  // Extract body content (everything between <body> and </body>)
  const bodyMatch = originalHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error('Could not find <body> tag in template HTML');
  }

  const bodyContent = bodyMatch[1];
  const { centerImageUrl } = config;

  // Resolve center image URL to absolute
  const absoluteCenterImageUrl = centerImageUrl ? resolveUrl(centerImageUrl, baseUrl) : '';

  // Create the duo wrapper structure
  const duoStructure = `
    <div class="duo-wrapper">
      <!-- Slide 1 (left: 0-1080px) -->
      <div class="duo-slide duo-slide-1">
        ${bodyContent}
      </div>

      <!-- Slide 2 (right: 1080-2160px) -->
      <div class="duo-slide duo-slide-2">
        ${bodyContent}
      </div>
    </div>

    <!-- Center image (spanning both slides, z-index: 100) -->
    ${absoluteCenterImageUrl ? `<img class="duo-center-image" src="${absoluteCenterImageUrl}" alt="Center Image" />` : ''}
  `;

  // Replace body content with duo structure
  let modifiedHTML = originalHTML.replace(
    /<body[^>]*>([\s\S]*?)<\/body>/i,
    `<body>${duoStructure}</body>`
  );

  // Inject Duo CSS before </head>
  const duoCSSTag = `<style id="duo-module-styles">${duoCSS}</style>`;
  modifiedHTML = modifiedHTML.replace('</head>', `${duoCSSTag}</head>`);

  return modifiedHTML;
}

/**
 * Modify final HTML to wrap content with Duo structure
 * This is called by the compositer after all modules have generated their HTML
 */
export function modifyFinalHTMLForDuo(
  html: string,
  config: DuoModuleConfig,
  context: RenderContext
): string {
  // Only apply if duo is enabled
  if (!config.enabled) {
    return html;
  }

  console.log('[Duo] Mode:', config.mode);
  console.log('[Duo] Has slides data:', !!config.slides);

  // Branch between mirror and independent modes
  let duoStructure: string;

  if (isDuoIndependentMode(config)) {
    // Independent mode: different content per slide
    duoStructure = independentContentDuo(html, config, context);
  } else {
    // Mirror mode: same content on both slides (default/legacy behavior)
    duoStructure = mirrorContentDuo(html, config);
  }

  // Replace body content with duo structure
  const modifiedHTML = html.replace(
    /<body[^>]*>([\s\S]*?)<\/body>/i,
    `<body>${duoStructure}\n</body>`
  );

  console.log('[Duo] HTML wrapping applied successfully');

  return modifiedHTML;
}
