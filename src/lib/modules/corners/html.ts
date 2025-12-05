import { ModuleData, RenderContext } from '../types';
import { CornersData, Corner } from './schema';

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
 * Helper to fetch SVG content from URL
 * Note: In actual implementation, this would be async and cached
 */
function getSvgContent(corner: Corner, baseUrl: string = ''): string {
  // If svgContent is provided inline, use it
  if (corner.svgContent && corner.svgContent.trim()) {
    return corner.svgContent;
  }

  // If svgUrl is provided, return an img tag (SVG will be loaded by browser)
  if (corner.svgUrl && corner.svgUrl.trim() && corner.svgUrl !== 'none') {
    // Convert relative URLs to absolute URLs for Puppeteer
    const absoluteUrl = resolveUrl(corner.svgUrl, baseUrl);
    return `<img src="${absoluteUrl}" alt="Corner SVG" />`;
  }

  return '';
}

/**
 * Helper to generate HTML for a single corner
 */
function getCornerHtml(corner: Corner, cornerNum: number, baseUrl: string = ''): string {
  if (corner.type === 'none') {
    return '';
  }

  if (corner.type === 'text') {
    const text = corner.text || '';
    return `<span class="corner-${cornerNum}-text">${text}</span>`;
  }

  if (corner.type === 'svg') {
    return getSvgContent(corner, baseUrl);
  }

  return '';
}

/**
 * Helper to check if duo mode is active
 */
function isDuoModeActive(context?: RenderContext): boolean {
  return context?.enabledModules?.includes('duo') ?? false;
}

/**
 * Generates HTML for the Corners Module
 */
export function getCornersHtml(data: ModuleData, context?: RenderContext): string {
  const cornersData = data as CornersData;
  const { corners } = cornersData;
  const baseUrl = context?.baseUrl || '';
  const isDuo = isDuoModeActive(context);

  // Generate HTML for each corner
  const corner1Content = getCornerHtml(corners[0], 1, baseUrl);
  const corner2Content = getCornerHtml(corners[1], 2, baseUrl);
  const corner3Content = getCornerHtml(corners[2], 3, baseUrl);
  const corner4Content = getCornerHtml(corners[3], 4, baseUrl);

  if (isDuo) {
    // Duo mode: 8 corners (4 per slide) with -s1 and -s2 classes
    return `
  <div class="overlay-layer">
    <div class="corner corner-1-s1">${corner1Content}</div>
    <div class="corner corner-2-s1">${corner2Content}</div>
    <div class="corner corner-3-s1">${corner3Content}</div>
    <div class="corner corner-4-s1">${corner4Content}</div>
    <div class="corner corner-1-s2">${corner1Content}</div>
    <div class="corner corner-2-s2">${corner2Content}</div>
    <div class="corner corner-3-s2">${corner3Content}</div>
    <div class="corner corner-4-s2">${corner4Content}</div>
  </div>
  `;
  }

  // Single mode: 4 corners
  return `
  <div class="overlay-layer">
    <div class="corner corner-1">${corner1Content}</div>
    <div class="corner corner-2">${corner2Content}</div>
    <div class="corner corner-3">${corner3Content}</div>
    <div class="corner corner-4">${corner4Content}</div>
  </div>
  `;
}

/**
 * Helper to generate corner content placeholders for template replacement
 * Used by legacy templates that inject corners via {{{corner1Content}}} syntax
 */
export function getCornerPlaceholders(data: ModuleData, baseUrl: string = ''): Record<string, string> {
  const cornersData = data as CornersData;
  const { corners } = cornersData;

  return {
    corner1Content: getCornerHtml(corners[0], 1, baseUrl),
    corner2Content: getCornerHtml(corners[1], 2, baseUrl),
    corner3Content: getCornerHtml(corners[2], 3, baseUrl),
    corner4Content: getCornerHtml(corners[3], 4, baseUrl),
  };
}
