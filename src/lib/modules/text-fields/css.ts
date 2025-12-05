import { ModuleData, RenderContext } from '../types';
import { TextFieldsData, TextField } from './schema';

/**
 * Helper to calculate position CSS based on special position or manual values
 */
function getPositionCSS(field: TextField, viewportWidth: number, viewportHeight: number): string {
  const { specialPosition, specialPadding, position } = field;

  // If using special position, calculate position based on corner/edge
  if (specialPosition && specialPosition !== 'none') {
    // Convert percentage padding to pixels
    const paddingX = (viewportWidth * (specialPadding || 8)) / 100;
    const paddingY = (viewportHeight * (specialPadding || 8)) / 100;

    switch (specialPosition) {
      case 'top-left':
        return `top: ${paddingY}px; left: ${paddingX}px;`;
      case 'top-right':
        return `top: ${paddingY}px; right: ${paddingX}px;`;
      case 'top-center':
        return `top: ${paddingY}px; left: 50%; transform: translateX(-50%);`;
      case 'bottom-left':
        return `bottom: ${paddingY}px; left: ${paddingX}px;`;
      case 'bottom-right':
        return `bottom: ${paddingY}px; right: ${paddingX}px;`;
      case 'bottom-center':
        return `bottom: ${paddingY}px; left: 50%; transform: translateX(-50%);`;
      case 'center-left':
        return `top: 50%; left: ${paddingX}px; transform: translateY(-50%);`;
      case 'center-right':
        return `top: 50%; right: ${paddingX}px; transform: translateY(-50%);`;
      case 'center':
        return `top: 50%; left: 50%; transform: translate(-50%, -50%);`;
      default:
        break;
    }
  }

  // Use manual position values
  let css = '';
  if (position?.top !== undefined && position.top !== '') css += `top: ${position.top}; `;
  if (position?.left !== undefined && position.left !== '') css += `left: ${position.left}; `;
  if (position?.right !== undefined && position.right !== '') css += `right: ${position.right}; `;
  if (position?.bottom !== undefined && position.bottom !== '') css += `bottom: ${position.bottom}; `;
  if (position?.width !== undefined && position.width !== '') css += `width: ${position.width}; `;
  if (position?.height !== undefined && position.height !== '') css += `height: ${position.height}; `;

  return css;
}

/**
 * Generates CSS for the TextFields module
 */
export function getTextFieldsCss(data: ModuleData, context?: RenderContext): string {
  const textFields = data as TextFieldsData;

  // Get viewport dimensions from context or use defaults
  const viewportWidth = context?.viewportWidth || 1080;
  const viewportHeight = context?.viewportHeight || 1440;

  // CSS variables for styled chunks (background-color spans)
  const styledChunksCss = `
    /* Styled chunks with background colors */
    .text-item span[style*="background-color"] {
      padding: 2px 4px;
      border-radius: 2px;
    }
  `;

  // Generate CSS for vertical alignment
  const alignmentMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  };

  const justifyContent = alignmentMap[textFields.verticalAlign] || 'flex-end';

  // Check if auto-sizing is enabled
  const autoSizeEnabled = textFields.autoSizeMode === 'proportional-3-1';

  // Generate individual text item styles
  const textItemStyles = textFields.fields
    .slice(0, textFields.count)
    .map((field, index) => {
      if (!field.content) return ''; // Skip empty fields

      const style = field.style || {};
      const isFreePosition = field.freePosition || false;

      // Base text styles
      // Don't set fontSize if auto-sizing is enabled (script will handle all)
      const textStyles = `
      font-family: ${style.fontFamily || 'Arial'};
      ${!autoSizeEnabled ? `font-size: ${style.fontSize || '24px'};` : '/* font-size controlled by auto-size.js */'}
      font-weight: ${style.fontWeight || '400'};
      color: ${style.color || '#000000'};
      text-align: ${style.textAlign || 'left'};
      line-height: ${style.lineHeight || '1.2'};
      letter-spacing: ${style.letterSpacing || '0'};
      text-transform: ${style.textTransform || 'none'};
      ${style.textShadow ? `text-shadow: ${style.textShadow};` : ''}
      ${style.textDecoration ? `text-decoration: ${style.textDecoration};` : ''}
      ${style.backgroundColor ? `background-color: ${style.backgroundColor};` : ''}
      ${style.padding ? `padding: ${style.padding};` : ''}`.trim();

      // Position styles (only for free positioned items)
      const positionStyles = isFreePosition
        ? `position: absolute; ${getPositionCSS(field, viewportWidth, viewportHeight)}`
        : '';

      return `
    .text-item-${index + 1} {
      ${textStyles}
      ${positionStyles}
    }

    /* Hide if empty */
    .text-item-${index + 1}:empty {
      display: none;
    }
      `.trim();
    })
    .filter(Boolean)
    .join('\n\n');

  return `
    /* ===== TEXT FIELDS MODULE (z-index: 10) ===== */
    .text-section {
      display: flex;
      flex-direction: column;
      gap: ${textFields.gap}px;
      justify-content: ${justifyContent};
      align-items: stretch;
      width: 100%;
      flex: 1;
      flex-basis: ${textFields.layoutWidth || 'auto'};
      align-self: ${textFields.alignSelf || 'stretch'};
      min-width: 0;
      min-height: 0;
      flex-shrink: 1;
      position: relative;
      z-index: 10;
      box-sizing: border-box;
    }

    /* Base text item styles */
    .text-item {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Non-free-positioned items take full width */
    .text-item:not([style*="position: absolute"]) {
      width: 100%;
    }

    ${textItemStyles}

    ${styledChunksCss}
  `.trim();
}
