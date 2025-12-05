import { ModuleData, RenderContext } from '../types';
import { FreeTextData, FreeTextElement } from './schema';

/**
 * Helper to format a position value - adds 'px' unit if value is a number
 */
function formatPositionValue(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  // If it's a number, add 'px' unit
  if (typeof value === 'number') return `${value}px`;
  // If it's a string that's just a number (no unit), add 'px'
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue) && String(numericValue) === value.trim()) {
    return `${value}px`;
  }
  // Otherwise return as-is (already has unit like '50px' or '10%')
  return value;
}

/**
 * Helper to calculate position CSS based on special position or manual values
 */
function getPositionCSS(text: FreeTextElement, viewportWidth: number, viewportHeight: number): string {
  const { specialPosition, specialPadding, position } = text;

  // If using special position, calculate position based on corner/edge
  if (specialPosition && specialPosition !== 'none') {
    // Convert percentage padding to pixels
    const paddingX = (viewportWidth * specialPadding) / 100;
    const paddingY = (viewportHeight * specialPadding) / 100;

    switch (specialPosition) {
      case 'top-left':
        return `
          top: ${paddingY}px;
          left: ${paddingX}px;
        `;
      case 'top-right':
        return `
          top: ${paddingY}px;
          right: ${paddingX}px;
        `;
      case 'top-center':
        return `
          top: ${paddingY}px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-left':
        return `
          bottom: ${paddingY}px;
          left: ${paddingX}px;
        `;
      case 'bottom-right':
        return `
          bottom: ${paddingY}px;
          right: ${paddingX}px;
        `;
      case 'bottom-center':
        return `
          bottom: ${paddingY}px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'center-left':
        return `
          top: 50%;
          left: ${paddingX}px;
          transform: translateY(-50%);
        `;
      case 'center-right':
        return `
          top: 50%;
          right: ${paddingX}px;
          transform: translateY(-50%);
        `;
      case 'center':
        return `
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
      default:
        break;
    }
  }

  // Use manual position values - format each value to ensure it has a CSS unit
  let css = '';
  const top = formatPositionValue(position.top);
  const left = formatPositionValue(position.left);
  const right = formatPositionValue(position.right);
  const bottom = formatPositionValue(position.bottom);
  const width = formatPositionValue(position.width);
  const height = formatPositionValue(position.height);

  if (top) css += `top: ${top};\n      `;
  if (left) css += `left: ${left};\n      `;
  if (right) css += `right: ${right};\n      `;
  if (bottom) css += `bottom: ${bottom};\n      `;
  if (width) css += `width: ${width};\n      `;
  if (height) css += `height: ${height};\n      `;

  return css;
}

/**
 * Helper to generate text style CSS
 */
function getTextStyleCSS(text: FreeTextElement): string {
  const { style, backgroundColor, backgroundPadding, borderRadius } = text;
  let css = '';

  if (style.fontFamily) {
    css += `font-family: ${style.fontFamily};\n      `;
  }
  if (style.fontSize) {
    css += `font-size: ${style.fontSize};\n      `;
  }
  if (style.fontWeight) {
    css += `font-weight: ${style.fontWeight};\n      `;
  }
  if (style.color) {
    css += `color: ${style.color};\n      `;
  }
  if (style.textAlign) {
    css += `text-align: ${style.textAlign};\n      `;
  }
  if (style.lineHeight) {
    css += `line-height: ${style.lineHeight};\n      `;
  }
  if (style.letterSpacing) {
    css += `letter-spacing: ${style.letterSpacing};\n      `;
  }
  if (style.textTransform) {
    css += `text-transform: ${style.textTransform};\n      `;
  }
  if (style.textShadow) {
    css += `text-shadow: ${style.textShadow};\n      `;
  }
  if (style.textDecoration) {
    css += `text-decoration: ${style.textDecoration};\n      `;
  }

  // Background styling
  if (backgroundColor && backgroundColor !== 'transparent') {
    css += `background-color: ${backgroundColor};\n      `;
  }
  if (backgroundPadding) {
    css += `padding: ${backgroundPadding};\n      `;
  }
  if (borderRadius) {
    css += `border-radius: ${borderRadius};\n      `;
  }

  return css;
}

/**
 * Generates CSS for the FreeText Module
 */
export function getFreeTextCss(data: ModuleData, context?: RenderContext): string {
  const freeTextData = data as FreeTextData;
  const { count, texts } = freeTextData;

  // Get viewport dimensions from context or use defaults
  const viewportWidth = context?.viewportWidth || 1080;
  const viewportHeight = context?.viewportHeight || 1440;

  let css = `
    /* === FREE TEXT OVERLAY === */
    .free-text-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: ${viewportWidth}px;
      height: ${viewportHeight}px;
      pointer-events: none;
      z-index: 30;
    }

    .free-text {
      position: absolute;
      word-wrap: break-word;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }

    /* Hide empty free text elements */
    .free-text:empty {
      display: none;
    }
  `;

  // Generate CSS for each active free text element
  for (let i = 0; i < count && i < texts.length; i++) {
    const text = texts[i];
    const textNum = i + 1;

    // Skip if content is empty
    if (!text.content || text.content.trim() === '') {
      css += `
    .free-text-${textNum} {
      display: none;
    }
      `;
      continue;
    }

    css += `
    .free-text-${textNum} {
      ${getPositionCSS(text, viewportWidth, viewportHeight)}
      ${getTextStyleCSS(text)}
    }
    `;
  }

  // Hide unused text elements
  for (let i = count; i < 5; i++) {
    const textNum = i + 1;
    css += `
    .free-text-${textNum} {
      display: none;
    }
    `;
  }

  return css;
}

/**
 * Generates CSS variables for the FreeText Module (for compatibility with legacy templates)
 */
export function getFreeTextStyleVariables(data: ModuleData): Record<string, string> {
  const freeTextData = data as FreeTextData;
  const { count, texts } = freeTextData;
  const variables: Record<string, string> = {};

  // Generate variables for each active free text element
  for (let i = 0; i < count && i < texts.length; i++) {
    const text = texts[i];
    const textNum = i + 1;

    // Position variables - use formatPositionValue to ensure proper CSS units
    if (text.specialPosition === 'none') {
      // Manual positioning
      const top = formatPositionValue(text.position.top);
      const left = formatPositionValue(text.position.left);
      const right = formatPositionValue(text.position.right);
      const bottom = formatPositionValue(text.position.bottom);

      if (top) {
        variables[`--freeText${textNum}-top`] = top;
      }
      if (left) {
        variables[`--freeText${textNum}-left`] = left;
      }
      if (right) {
        variables[`--freeText${textNum}-right`] = right;
      }
      if (bottom) {
        variables[`--freeText${textNum}-bottom`] = bottom;
      }
    }

    // Style variables
    if (text.style.fontSize) {
      variables[`--freeText${textNum}-size`] = text.style.fontSize;
    }
    if (text.style.color) {
      variables[`--freeText${textNum}-color`] = text.style.color;
    }
    if (text.backgroundColor) {
      variables[`--freeText${textNum}-bgcolor`] = text.backgroundColor;
    }
  }

  return variables;
}
