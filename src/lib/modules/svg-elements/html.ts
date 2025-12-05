import { ModuleData, RenderContext } from '../types';
import { SvgElementsData } from './schema';

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
 * Helper to generate HTML for a single SVG element
 */
function getSvgElementHtml(svgUrl: string, svgNum: number, enabled: boolean, baseUrl?: string): string {
  if (!enabled || !svgUrl) {
    return '';
  }

  // Sanitize URL to prevent XSS
  const sanitizedUrl = svgUrl.replace(/[<>"']/g, '');

  // Resolve to absolute URL
  const absoluteUrl = resolveUrl(sanitizedUrl, baseUrl);

  return `<div class="svg-element svg-element-${svgNum}">
      <img src="${absoluteUrl}" alt="SVG ${svgNum}" />
    </div>`;
}

/**
 * Generates HTML for the SVGElements Module
 */
export function getSvgElementsHtml(data: ModuleData, context?: RenderContext): string {
  const svgData = data as SvgElementsData;
  const { svgElements } = svgData;

  // Generate HTML for each enabled SVG element
  let svgElementsHtml = '';
  for (let i = 0; i < svgElements.length; i++) {
    const svg = svgElements[i];
    const svgNum = i + 1;
    svgElementsHtml += getSvgElementHtml(svg.svgUrl, svgNum, svg.enabled, context?.baseUrl);
  }

  // Only render the layer if there are enabled SVG elements
  if (!svgElementsHtml.trim()) {
    return '';
  }

  return `
  <div class="svg-elements-layer">
    ${svgElementsHtml}
  </div>
  `;
}

/**
 * Helper to generate SVG placeholders for template replacement
 * Used by legacy templates that inject SVGs via {{svg1Content}} syntax
 */
export function getSvgElementsPlaceholders(data: ModuleData, context?: RenderContext): Record<string, string> {
  const svgData = data as SvgElementsData;
  const { svgElements } = svgData;
  const placeholders: Record<string, string> = {};

  // Generate placeholders for all SVG elements
  for (let i = 0; i < svgElements.length; i++) {
    const svg = svgElements[i];
    const svgNum = i + 1;

    // If SVG is enabled and has URL, create img tag
    if (svg.enabled && svg.svgUrl) {
      const sanitizedUrl = svg.svgUrl.replace(/[<>"']/g, '');
      const absoluteUrl = resolveUrl(sanitizedUrl, context?.baseUrl);
      placeholders[`svg${svgNum}Content`] = `<img src="${absoluteUrl}" alt="SVG ${svgNum}" />`;
      placeholders[`svg${svgNum}Url`] = absoluteUrl;
    } else {
      // Otherwise, empty placeholder
      placeholders[`svg${svgNum}Content`] = '';
      placeholders[`svg${svgNum}Url`] = '';
    }
  }

  return placeholders;
}
