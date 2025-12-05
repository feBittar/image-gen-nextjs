import { ModuleData, RenderContext } from '../types';
import { BulletsData } from './schema';
import { applyStyledChunks } from '@/lib/utils/richTextConverter';

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
 * Generates HTML for the Bullets module
 */
export function getBulletsHtml(data: ModuleData, context?: RenderContext): string {
  const bullets = data as BulletsData;

  // Generate HTML for each bullet item
  const bulletItems = bullets.items
    .map((item, index) => {
      if (!item.enabled || !item.text) return '';

      // Process icon
      let iconHtml = '';
      if (item.icon) {
        if (item.iconType === 'url') {
          const absoluteIconUrl = resolveUrl(escapeHtml(item.icon), context?.baseUrl);
          iconHtml = `<img src="${absoluteIconUrl}" alt="Icon" />`;
        } else if (item.iconType === 'emoji') {
          iconHtml = escapeHtml(item.icon);
        } else if (item.iconType === 'number') {
          iconHtml = String(index + 1);
        }
      }

      // Process text with styled chunks
      let processedText = item.text;

      if (item.styledChunks && item.styledChunks.length > 0) {
        const parentStyles = {
          fontFamily: item.textStyle?.fontFamily,
          fontSize: item.textStyle?.fontSize,
          fontWeight: item.textStyle?.fontWeight,
          color: item.textStyle?.color,
          letterSpacing: item.textStyle?.letterSpacing,
          lineHeight: item.textStyle?.lineHeight,
          backgroundColor: item.textStyle?.backgroundColor,
          padding: item.textStyle?.padding,
          textAlign: item.textStyle?.textAlign,
        };

        processedText = applyStyledChunks(
          item.text,
          item.styledChunks,
          parentStyles
        );
      } else {
        processedText = escapeHtml(item.text);
      }

      return `
      <div class="bullet-card bullet-card-${index + 1}">
        ${iconHtml ? `<div class="bullet-icon">${iconHtml}</div>` : ''}
        <div class="bullet-text bullet-text-${index + 1}">${processedText}</div>
      </div>`.trim();
    })
    .filter(Boolean)
    .join('\n      ');

  if (!bulletItems) {
    return '<!-- No bullets to display -->';
  }

  return `
  <!-- ===== BULLETS SECTION ===== -->
  <div class="bullets-container">
      ${bulletItems}
  </div>
  `.trim();
}

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
