import { ModuleData } from '../types';
import { TextFieldsData } from './schema';
import { applyStyledChunks } from '@/lib/utils/richTextConverter';

/**
 * Generates HTML for the TextFields module
 */
export function getTextFieldsHtml(data: ModuleData): string {
  const textFields = data as TextFieldsData;

  // Generate HTML for each active text field
  const textItems = textFields.fields
    .slice(0, textFields.count)
    .map((field, index) => {
      if (!field.content) return ''; // Skip empty fields

      // Process styled chunks if available
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

      return `    <div class="text-item text-item-${index + 1}">${processedContent}</div>`;
    })
    .filter(Boolean)
    .join('\n');

  return `
  <!-- ===== TEXT FIELDS SECTION ===== -->
  <div class="text-section">
${textItems}
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
