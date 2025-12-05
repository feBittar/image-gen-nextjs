import { ModuleData, RenderContext } from '../types';
import { ImageTextBoxData, ImageTextBoxTextField } from './schema';
import { applyStyledChunks } from '@/lib/utils/richTextConverter';

/**
 * Helper to convert relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl?: string): string {
  if (!url) return '';

  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If no baseUrl, return as-is
  if (!baseUrl) {
    return url;
  }

  // Combine baseUrl + url to create absolute URL
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  return `${cleanBaseUrl}${cleanUrl}`;
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

/**
 * Generate HTML for a single text field
 */
function renderTextField(field: ImageTextBoxTextField, index: number): string {
  if (!field.content) return '';

  let processedContent = field.content;

  if (field.styledChunks && field.styledChunks.length > 0) {
    // Convert styled chunks to HTML with parent styles for inheritance
    const parentStyles = {
      fontFamily: field.style?.fontFamily,
      fontSize: field.style?.fontSize,
      fontWeight: field.style?.fontWeight,
      color: field.style?.color,
      letterSpacing: field.style?.letterSpacing,
      lineHeight: field.style?.lineHeight,
      backgroundColor: field.style?.backgroundColor,
      padding: field.style?.padding,
      textAlign: field.style?.textAlign,
    };

    processedContent = applyStyledChunks(
      field.content,
      field.styledChunks,
      parentStyles
    );
  } else {
    // Escape HTML for plain text
    processedContent = escapeHtml(field.content);
  }

  return `      <div class="image-text-box-text-field image-text-box-text-field-${index + 1}">${processedContent}</div>`;
}

/**
 * Generates HTML for the Image + Text Box module
 */
export function getImageTextBoxHtml(data: ModuleData, context?: RenderContext): string {
  const boxData = data as ImageTextBoxData;

  if (!boxData.enabled) {
    return '';
  }

  // Hide if no image URL
  if (!boxData.imageConfig.url) {
    return '';
  }

  const absoluteUrl = resolveUrl(boxData.imageConfig.url, context?.baseUrl);

  // Generate text fields HTML
  const textFieldsHtml = boxData.textConfig.fields
    .slice(0, boxData.textConfig.count)
    .map((field, index) => renderTextField(field, index))
    .filter(Boolean)
    .join('\n');

  // Image side HTML
  const imageSideHtml = `
    <div class="image-text-box-image-side">
      <img class="image-text-box-image" src="${absoluteUrl}" alt="Content" />
    </div>`;

  // Text side HTML
  const textSideHtml = `
    <div class="image-text-box-text-side">
${textFieldsHtml}
    </div>`;

  return `
  <!-- ===== IMAGE + TEXT BOX SECTION ===== -->
  <div class="image-text-box">
    ${imageSideHtml}
    ${textSideHtml}
  </div>
  `.trim();
}
