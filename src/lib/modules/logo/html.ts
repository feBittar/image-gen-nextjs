import { ModuleData, RenderContext } from '../types';
import { LogoData } from './schema';

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
 * Generates HTML for the Logo Module
 */
export function getLogoHtml(data: ModuleData, context?: RenderContext): string {
  const logoData = data as LogoData;
  const { enabled, logoUrl } = logoData;

  // Don't render if disabled or no logo URL
  if (!enabled || !logoUrl || logoUrl.trim() === '' || logoUrl === 'none') {
    return '';
  }

  // Resolve to absolute URL
  const absoluteLogoUrl = resolveUrl(logoUrl, context?.baseUrl);

  return `
  <div class="logo-container">
    <img src="${absoluteLogoUrl}" alt="Logo" />
  </div>
  `;
}

/**
 * Helper to generate logo placeholder for template replacement
 * Used by legacy templates that inject logo via {{{logoContent}}} syntax
 */
export function getLogoPlaceholder(data: ModuleData, context?: RenderContext): string {
  const logoData = data as LogoData;
  const { enabled, logoUrl } = logoData;

  if (!enabled || !logoUrl || logoUrl.trim() === '' || logoUrl === 'none') {
    return '';
  }

  // Resolve to absolute URL
  const absoluteLogoUrl = resolveUrl(logoUrl, context?.baseUrl);

  return `<img src="${absoluteLogoUrl}" alt="Logo" class="logo-image" />`;
}
