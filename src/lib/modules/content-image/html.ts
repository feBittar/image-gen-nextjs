import { ModuleData, RenderContext } from '../types';
import { ContentImageData } from './schema';

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
 * Generates HTML for the Content Image module
 */
export function getContentImageHtml(data: ModuleData, context?: RenderContext): string {
  const contentImage = data as ContentImageData;

  if (!contentImage.enabled) {
    return '';
  }

  // Hide section if no URLs provided
  if (!contentImage.url && !contentImage.url2) {
    return '';
  }

  // Resolve URLs to absolute
  const absoluteUrl = resolveUrl(contentImage.url, context?.baseUrl);
  const absoluteUrl2 = resolveUrl(contentImage.url2 || '', context?.baseUrl);

  // Single image mode
  if (contentImage.mode === 'single') {
    return `
      <!-- ===== CONTENT IMAGE SECTION ===== -->
      <div class="content-image-section">
        <img class="content-image" src="${absoluteUrl}" alt="Content" />
      </div>
    `;
  }

  // Comparison mode (2 images side by side)
  return `
    <!-- ===== CONTENT IMAGE SECTION - COMPARISON MODE ===== -->
    <div class="content-image-section">
      <div class="comparison-row">
        <div class="comparison-image">
          <img src="${absoluteUrl}" alt="Image 1" />
        </div>
        <div class="comparison-image">
          <img src="${absoluteUrl2}" alt="Image 2" />
        </div>
      </div>
    </div>
  `;
}
