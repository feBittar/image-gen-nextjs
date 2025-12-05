import { ModuleData, RenderContext } from '../types';
import { ArrowBottomTextData } from './schema';

/**
 * Helper to convert special position to CSS positioning
 */
function getPositionCSS(position: string, padding: number): string {
  const paddingPercent = `${padding}%`;

  switch (position) {
    case 'top-left':
      return `
        top: ${paddingPercent};
        left: ${paddingPercent};
      `;
    case 'top-right':
      return `
        top: ${paddingPercent};
        right: ${paddingPercent};
      `;
    case 'bottom-left':
      return `
        bottom: ${paddingPercent};
        left: ${paddingPercent};
      `;
    case 'bottom-right':
      return `
        bottom: ${paddingPercent};
        right: ${paddingPercent};
      `;
    case 'top-center':
      return `
        top: ${paddingPercent};
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'bottom-center':
      return `
        bottom: ${paddingPercent};
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'center-left':
      return `
        top: 50%;
        left: ${paddingPercent};
        transform: translateY(-50%);
      `;
    case 'center-right':
      return `
        top: 50%;
        right: ${paddingPercent};
        transform: translateY(-50%);
      `;
    case 'center':
      return `
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
    default:
      return `
        bottom: ${paddingPercent};
        right: ${paddingPercent};
      `;
  }
}

/**
 * Helper to generate text style CSS
 */
function getTextStyleCSS(textStyle: Record<string, any>): string {
  let css = '';

  if (textStyle.fontFamily) {
    css += `font-family: ${textStyle.fontFamily};\n      `;
  }
  if (textStyle.fontSize) {
    css += `font-size: ${textStyle.fontSize};\n      `;
  }
  if (textStyle.fontWeight) {
    css += `font-weight: ${textStyle.fontWeight};\n      `;
  }
  if (textStyle.color) {
    css += `color: ${textStyle.color};\n      `;
  }
  if (textStyle.textTransform) {
    css += `text-transform: ${textStyle.textTransform};\n      `;
  }
  if (textStyle.textAlign) {
    css += `text-align: ${textStyle.textAlign};\n      `;
  }
  if (textStyle.lineHeight) {
    css += `line-height: ${textStyle.lineHeight};\n      `;
  }
  if (textStyle.letterSpacing) {
    css += `letter-spacing: ${textStyle.letterSpacing};\n      `;
  }
  if (textStyle.textShadow) {
    css += `text-shadow: ${textStyle.textShadow};\n      `;
  }
  if (textStyle.textDecoration) {
    css += `text-decoration: ${textStyle.textDecoration};\n      `;
  }
  if (textStyle.backgroundColor) {
    css += `background-color: ${textStyle.backgroundColor};\n      `;
  }
  if (textStyle.padding) {
    css += `padding: ${textStyle.padding};\n      `;
  }

  return css;
}

/**
 * Converte RGB para HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

/**
 * Converte uma cor hex para CSS filter que coloriza SVG
 * Usa algoritmo baseado em https://codepen.io/sosuke/pen/Pjoqqp
 */
function convertColorToFilter(color: string): string {
  if (!color || color === 'none') return 'none';

  const normalizedColor = color.toLowerCase().trim();

  // Cores predefinidas para casos comuns (mais precisas)
  const presetFilters: Record<string, string> = {
    'white': 'brightness(0) saturate(100%) invert(100%)',
    '#ffffff': 'brightness(0) saturate(100%) invert(100%)',
    '#fff': 'brightness(0) saturate(100%) invert(100%)',
    'black': 'brightness(0) saturate(100%)',
    '#000000': 'brightness(0) saturate(100%)',
    '#000': 'brightness(0) saturate(100%)',
  };

  if (presetFilters[normalizedColor]) {
    return presetFilters[normalizedColor];
  }

  // Converter hex para RGB
  let hex = normalizedColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return 'none';
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Converter para HSL para calcular filtros
  const [h, s, l] = rgbToHsl(r, g, b);

  // Calcular valores do filtro
  // Primeiro tornamos preto, depois aplicamos transformações
  const invert = l > 50 ? 1 : 0;
  const sepia = s > 0 ? 100 : 0;
  const saturate = s > 0 ? Math.round(s * 20) : 100;
  const hueRotate = Math.round(h);
  const brightness = Math.round(l * 2);
  const contrast = 100;

  return `brightness(0) saturate(100%) invert(${invert * 100}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(${contrast}%)`;
}

/**
 * Generates CSS for the Arrow Bottom Text Module
 */
export function getArrowBottomTextCss(data: ModuleData, context?: RenderContext): string {
  const arrowData = data as ArrowBottomTextData;

  if (!arrowData.enabled || !arrowData.arrowImageUrl) {
    return `
    /* === ARROW BOTTOM TEXT MODULE (DISABLED) === */
    .arrow-bottom-text-container {
      display: none;
    }
    `;
  }

  const { specialPosition, padding, gapBetween, layout, arrowWidth, arrowHeight, bottomTextStyle, arrowColor } = arrowData;

  // Get alignment based on layout
  const alignItems = layout === 'vertical' ? 'center' : 'center';
  const flexDirection = layout === 'vertical' ? 'column' : 'row';

  return `
    /* === ARROW BOTTOM TEXT MODULE === */
    .arrow-bottom-text-container {
      position: absolute;
      z-index: 30;
      display: flex;
      flex-direction: ${flexDirection};
      align-items: ${alignItems};
      justify-content: center;
      gap: ${gapBetween}px;
      width: ${arrowWidth};
      ${getPositionCSS(specialPosition, padding)}
    }

    /* Hide container if arrow has no src */
    .arrow-bottom-text-container:has(.arrow-image[src=""]) {
      display: none;
    }

    /* Arrow image styling */
    .arrow-image {
      display: block;
      width: 100%;
      height: ${arrowHeight};
      object-fit: contain;
      ${arrowColor ? `filter: ${convertColorToFilter(arrowColor)};` : ''}
    }

    /* Hide arrow when src is empty */
    .arrow-image[src=""] {
      display: none;
    }

    /* Bottom text styling */
    .arrow-bottom-text {
      ${getTextStyleCSS(bottomTextStyle)}
      display: block;
      white-space: nowrap;
      align-self: flex-end;
      padding-right: 12px;
    }

    /* Hide text when empty */
    .arrow-bottom-text:empty {
      display: none;
    }
  `;
}

/**
 * Generates CSS variables for the Arrow Bottom Text Module
 */
export function getArrowBottomTextStyleVariables(data: ModuleData): Record<string, string> {
  const arrowData = data as ArrowBottomTextData;
  const variables: Record<string, string> = {};

  if (!arrowData.enabled) {
    return variables;
  }

  // Add CSS variables for dynamic positioning
  variables['--arrow-bottom-text-gap'] = `${arrowData.gapBetween}px`;
  variables['--arrow-width'] = arrowData.arrowWidth;
  variables['--arrow-height'] = arrowData.arrowHeight;

  return variables;
}
