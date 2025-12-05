import { parseInlineStyles, applyStyledChunks, StyledChunk, ParentStyles } from './richTextConverter';

/**
 * Interface for rich text field (can be string or object with chunks)
 */
interface RichTextField {
  text?: string;
  title?: string;
  styledChunks?: StyledChunk[];
  plainText?: string;
  titleText?: string;
  subtitleText?: string;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Processes text field with multiple supported formats:
 * 1. Simple string: "Hello world"
 * 2. Inline syntax: "[Hello|color:#ff0000] world"
 * 3. Object with styledChunks (rich text editor format with style inheritance)
 *
 * @param field - Text field (string or object)
 * @param parentStyles - Parent field styles for inheritance (optional)
 * @returns Processed HTML with styles applied
 */
export function processTextField(field: string | any, parentStyles?: ParentStyles): string {
  console.log('\n--- processTextField called ---');
  console.log('Field type:', typeof field);
  console.log('Field:', field);
  console.log('parentStyles:', parentStyles);

  // Case 1: Simple string or with inline syntax
  if (typeof field === 'string') {
    console.log('Case 1: Simple string detected');
    const parsedText = parseInlineStyles(field);

    // If there are parentStyles, apply as wrapper for style inheritance (including textAlign)
    if (parentStyles && Object.keys(parentStyles).length > 0) {
      console.log('Applying parentStyles to simple text');
      const wrapperStyles: string[] = [];

      if (parentStyles.textAlign) {
        const validAlignments = ['left', 'center', 'right', 'justify'];
        if (validAlignments.includes(parentStyles.textAlign.trim())) {
          wrapperStyles.push(`text-align:${parentStyles.textAlign.trim()}`);
          wrapperStyles.push('display:block'); // text-align needs block element
        }
      }

      if (parentStyles.color) wrapperStyles.push(`color:${parentStyles.color}`);
      if (parentStyles.fontSize) wrapperStyles.push(`font-size:${parentStyles.fontSize}`);
      if (parentStyles.fontFamily) wrapperStyles.push(`font-family:${parentStyles.fontFamily}`);
      if (parentStyles.fontWeight) wrapperStyles.push(`font-weight:${parentStyles.fontWeight}`);
      if (parentStyles.fontStyle) wrapperStyles.push(`font-style:${parentStyles.fontStyle}`);
      if (parentStyles.letterSpacing) wrapperStyles.push(`letter-spacing:${parentStyles.letterSpacing}`);
      if (parentStyles.lineHeight) wrapperStyles.push(`line-height:${parentStyles.lineHeight}`);
      if (parentStyles.backgroundColor) wrapperStyles.push(`background-color:${parentStyles.backgroundColor}`);
      if (parentStyles.padding) wrapperStyles.push(`padding:${parentStyles.padding}`);

      if (wrapperStyles.length > 0) {
        return `<span style="${wrapperStyles.join(';')}">${parsedText}</span>`;
      }
    }

    return parsedText;
  }

  // Case 2: Object with new format (styledChunks)
  if (field && typeof field === 'object') {
    console.log('Case 2: Object detected');
    console.log('field.styledChunks exists?', !!field.styledChunks);
    console.log('field.styledChunks is array?', Array.isArray(field.styledChunks));

    // Priority 1: New format with styledChunks
    if (field.styledChunks && Array.isArray(field.styledChunks)) {
      console.log('Processing with styledChunks');
      // Extract base text (can be 'text' or 'title' field)
      const baseText = field.text || field.title || '';
      console.log('baseText extracted:', baseText);

      if (typeof baseText === 'string' && baseText.length > 0) {
        // Validate and sanitize chunks
        const validChunks: StyledChunk[] = field.styledChunks
          .filter((chunk: any) => chunk && typeof chunk.text === 'string')
          .map((chunk: any) => ({
            text: chunk.text,
            color: chunk.color,
            font: chunk.font,
            fontFamily: chunk.fontFamily,
            size: chunk.size,
            fontSize: chunk.fontSize,
            bold: chunk.bold === true,
            italic: chunk.italic === true,
            underline: chunk.underline === true,
            letterSpacing: chunk.letterSpacing,
            backgroundColor: chunk.backgroundColor,
            backgroundBlur: chunk.backgroundBlur,
            blurColor: chunk.blurColor,
            blurOpacity: chunk.blurOpacity,
            blurFadeDirection: chunk.blurFadeDirection,
            blurFadeAmount: chunk.blurFadeAmount,
            padding: chunk.padding,
            lineBreak: chunk.lineBreak === true
          }));

        console.log('validChunks created:', validChunks);

        // Apply styledChunks with parent style inheritance
        const result = applyStyledChunks(baseText, validChunks, parentStyles);
        console.log('Result from applyStyledChunks:', result);
        return result;
      } else {
        console.log('baseText empty or invalid');
      }
    }

    // Priority 2: Inline syntax in plainText field
    if (field.plainText && typeof field.plainText === 'string') {
      return parseInlineStyles(field.plainText);
    }

    // Priority 3: Legacy format (titleText/subtitleText)
    if (field.titleText && typeof field.titleText === 'string') {
      return parseInlineStyles(field.titleText);
    }
    if (field.subtitleText && typeof field.subtitleText === 'string') {
      return parseInlineStyles(field.subtitleText);
    }

    // Priority 4: Generic 'text' or 'title' field
    if (field.text && typeof field.text === 'string') {
      return parseInlineStyles(field.text);
    }
    if (field.title && typeof field.title === 'string') {
      return parseInlineStyles(field.title);
    }
  }

  // Fallback: return empty
  return '';
}
