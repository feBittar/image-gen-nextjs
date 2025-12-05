import { ModuleData, RenderContext } from '../types';
import { ArrowBottomTextData } from './schema';

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
 * Generates HTML for the Arrow Bottom Text Module
 */
export function getArrowBottomTextHtml(data: ModuleData, context?: RenderContext): string {
  const arrowData = data as ArrowBottomTextData;

  if (!arrowData.enabled || !arrowData.arrowImageUrl) {
    return '';
  }

  const { arrowImageUrl, bottomText } = arrowData;

  // Resolve arrow image URL to absolute
  const absoluteArrowUrl = resolveUrl(arrowImageUrl, context?.baseUrl);

  // Escape HTML in text to prevent XSS
  const escapedText = bottomText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return `
  <div class="arrow-bottom-text-container">
    <img class="arrow-image" src="${absoluteArrowUrl}" alt="Arrow" />
    <div class="arrow-bottom-text">${escapedText}</div>
  </div>
  `;
}

/**
 * Generates placeholder values for legacy template replacement
 * Used by templates that inject arrow-bottom-text via {{arrowBottomTextContent}} syntax
 */
export function getArrowBottomTextPlaceholders(data: ModuleData, context?: RenderContext): Record<string, string> {
  const arrowData = data as ArrowBottomTextData;

  if (!arrowData.enabled || !arrowData.arrowImageUrl) {
    return {
      arrowBottomTextContent: '',
      arrowImageUrl: '',
      bottomText: '',
    };
  }

  const escapedText = arrowData.bottomText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Resolve arrow image URL to absolute
  const absoluteArrowUrl = resolveUrl(arrowData.arrowImageUrl, context?.baseUrl);

  return {
    arrowBottomTextContent: getArrowBottomTextHtml(data, context),
    arrowImageUrl: absoluteArrowUrl,
    bottomText: escapedText,
  };
}
