import { ModuleData, RenderContext } from '../types';
import { FreeTextData } from './schema';

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = { textContent: text } as any;
  const element = Object.assign(document.createElement('div'), div);
  return element.innerHTML;
}

/**
 * Helper to generate HTML for a single free text element
 */
function getFreeTextElementHtml(content: string, textNum: number): string {
  if (!content || content.trim() === '') {
    return '';
  }

  // Note: In browser environment, escapeHtml works properly
  // For server-side rendering, we'll do basic escaping
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return `<div class="free-text free-text-${textNum}">${escaped}</div>`;
}

/**
 * Generates HTML for the FreeText Module
 */
export function getFreeTextHtml(data: ModuleData, context?: RenderContext): string {
  const freeTextData = data as FreeTextData;
  const { count, texts } = freeTextData;

  // Generate HTML for each active free text element
  let textElements = '';
  for (let i = 0; i < count && i < texts.length; i++) {
    const text = texts[i];
    const textNum = i + 1;
    textElements += getFreeTextElementHtml(text.content, textNum);
  }

  return `
  <div class="free-text-layer">
    ${textElements}
  </div>
  `;
}

/**
 * Helper to generate free text placeholders for template replacement
 * Used by legacy templates that inject free text via {{freeText1}} syntax
 */
export function getFreeTextPlaceholders(data: ModuleData): Record<string, string> {
  const freeTextData = data as FreeTextData;
  const { count, texts } = freeTextData;
  const placeholders: Record<string, string> = {};

  // Generate placeholders for all 5 possible free text elements
  for (let i = 0; i < 5; i++) {
    const textNum = i + 1;

    // If text is active and has content, include it
    if (i < count && i < texts.length && texts[i].content) {
      placeholders[`freeText${textNum}`] = texts[i].content;
    } else {
      // Otherwise, empty placeholder
      placeholders[`freeText${textNum}`] = '';
    }
  }

  return placeholders;
}
