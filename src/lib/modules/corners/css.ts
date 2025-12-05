import { ModuleData, RenderContext } from '../types';
import { CornersData, Corner } from './schema';

/**
 * Helper to ensure CSS value has a unit
 * If value is a pure number, adds 'px' suffix
 */
function ensureCssUnit(value: string | undefined, defaultValue: string = 'auto'): string {
  if (!value || value.trim() === '') {
    return defaultValue;
  }
  // If it's a pure number, add px
  if (/^\d+(\.\d+)?$/.test(value.trim())) {
    return `${value.trim()}px`;
  }
  return value;
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
 * Helper to convert corner position and padding to CSS positioning
 */
function getCornerPositionCSS(corner: Corner, cornerIndex: number): string {
  const { specialPosition, paddingX, paddingY } = corner;

  // Map corner index to default position
  const defaultPositions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  const position = specialPosition !== 'none' ? specialPosition : defaultPositions[cornerIndex];

  switch (position) {
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
    default:
      return '';
  }
}

/**
 * Helper to generate CSS for text styling
 */
function getTextStyleCSS(corner: Corner): string {
  const { textStyle, backgroundEnabled } = corner;

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
  if (textStyle.textDecoration) {
    css += `text-decoration: ${textStyle.textDecoration};\n      `;
  }
  if (textStyle.textTransform) {
    css += `text-transform: ${textStyle.textTransform};\n      `;
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

  // Background styling (only if enabled)
  if (backgroundEnabled) {
    if (textStyle.backgroundColor) {
      css += `background-color: ${textStyle.backgroundColor};\n      `;
    }
    if (textStyle.padding) {
      css += `padding: ${textStyle.padding};\n      `;
    }
  }

  return css;
}

/**
 * Helper to check if duo mode is active
 */
function isDuoModeActive(context?: RenderContext): boolean {
  return context?.enabledModules?.includes('duo') ?? false;
}

/**
 * Helper to generate CSS for a single corner in slide 1 (left half: 0-1080px)
 * Uses position mirroring for top-right and bottom-right corners
 */
function generateSlide1CSS(cornerNum: number, corner: Corner, position: string): string {
  const { paddingX, paddingY } = corner;

  switch (position) {
    case 'top-left':
      return `
    .corner-${cornerNum}-s1 {
      top: ${paddingY}px;
      left: ${paddingX}px;
    }
      `;
    case 'top-right':
      return `
    .corner-${cornerNum}-s1 {
      top: ${paddingY}px;
      left: calc(1080px - ${paddingX}px);
      transform: translateX(-100%);
    }
      `;
    case 'bottom-left':
      return `
    .corner-${cornerNum}-s1 {
      bottom: ${paddingY}px;
      left: ${paddingX}px;
    }
      `;
    case 'bottom-right':
      return `
    .corner-${cornerNum}-s1 {
      bottom: ${paddingY}px;
      left: calc(1080px - ${paddingX}px);
      transform: translateX(-100%);
    }
      `;
    default:
      return '';
  }
}

/**
 * Helper to generate CSS for a single corner in slide 2 (right half: 1080-2160px)
 * Uses position mirroring with offset for duo layout
 */
function generateSlide2CSS(cornerNum: number, corner: Corner, position: string): string {
  const { paddingX, paddingY } = corner;

  switch (position) {
    case 'top-left':
      return `
    .corner-${cornerNum}-s2 {
      top: ${paddingY}px;
      left: calc(1080px + ${paddingX}px);
    }
      `;
    case 'top-right':
      return `
    .corner-${cornerNum}-s2 {
      top: ${paddingY}px;
      right: ${paddingX}px;
    }
      `;
    case 'bottom-left':
      return `
    .corner-${cornerNum}-s2 {
      bottom: ${paddingY}px;
      left: calc(1080px + ${paddingX}px);
    }
      `;
    case 'bottom-right':
      return `
    .corner-${cornerNum}-s2 {
      bottom: ${paddingY}px;
      right: ${paddingX}px;
    }
      `;
    default:
      return '';
  }
}

/**
 * Helper to generate duo mode CSS for all 8 corners
 */
function generateDuoCornerCSS(corners: Corner[]): string {
  let css = '';

  corners.forEach((corner, index) => {
    const cornerNum = index + 1;

    // Map corner index to default position
    const defaultPositions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ];

    const position = corner.specialPosition !== 'none' ? corner.specialPosition : defaultPositions[index];

    // Skip if corner type is 'none'
    if (corner.type === 'none') {
      css += `
    .corner-${cornerNum}-s1,
    .corner-${cornerNum}-s2 {
      display: none;
    }
      `;
      return;
    }

    // Generate position CSS for both slides
    css += generateSlide1CSS(cornerNum, corner, position);
    css += generateSlide2CSS(cornerNum, corner, position);

    // Text-specific CSS
    if (corner.type === 'text') {
      css += `
    .corner-${cornerNum}-s1 .corner-${cornerNum}-text,
    .corner-${cornerNum}-s2 .corner-${cornerNum}-text {
      ${getTextStyleCSS(corner)}
      display: inline-block;
      white-space: nowrap;
    }
      `;
    }

    // SVG-specific CSS
    if (corner.type === 'svg') {
      const svgWidth = ensureCssUnit(corner.svgWidth, 'auto');
      const svgHeight = ensureCssUnit(corner.svgHeight, 'auto');
      const colorFilter = convertColorToFilter(corner.svgColor || '#ffffff');
      const filterStyle = colorFilter !== 'none' ? `filter: ${colorFilter};` : '';

      css += `
    .corner-${cornerNum}-s1 svg,
    .corner-${cornerNum}-s2 svg {
      width: ${svgWidth};
      height: ${svgHeight};
      display: block;
      ${filterStyle}
    }

    .corner-${cornerNum}-s1 svg *,
    .corner-${cornerNum}-s2 svg * {
      fill: currentColor !important;
    }

    .corner-${cornerNum}-s1 img,
    .corner-${cornerNum}-s2 img {
      width: ${svgWidth};
      height: ${svgHeight};
      object-fit: contain;
      ${filterStyle}
    }
      `;
    }
  });

  return css;
}

/**
 * Generates CSS for the Corners Module
 */
export function getCornersCss(data: ModuleData, context?: RenderContext): string {
  const cornersData = data as CornersData;
  const { corners } = cornersData;
  const isDuo = isDuoModeActive(context);

  // Adjust width based on duo mode
  const overlayWidth = isDuo ? '2160px' : '1080px';

  let css = `
    /* === CORNERS OVERLAY === */
    .overlay-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: ${overlayWidth};
      height: 1440px;
      pointer-events: none;
      z-index: 99;
    }

    .corner {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  if (isDuo) {
    // Duo mode: generate CSS for 8 corners with position mirroring
    css += generateDuoCornerCSS(corners);
  } else {
    // Single mode: generate CSS for 4 corners
    corners.forEach((corner, index) => {
      const cornerNum = index + 1;

      // Skip if corner type is 'none'
      if (corner.type === 'none') {
        css += `
    .corner-${cornerNum} {
      display: none;
    }
        `;
        return;
      }

      // Position CSS
      css += `
    .corner-${cornerNum} {
      ${getCornerPositionCSS(corner, index)}
    }
    `;

      // Text-specific CSS
      if (corner.type === 'text') {
        css += `
    .corner-${cornerNum}-text {
      ${getTextStyleCSS(corner)}
      display: inline-block;
      white-space: nowrap;
    }
        `;
      }

      // SVG-specific CSS
      if (corner.type === 'svg') {
        const svgWidth = ensureCssUnit(corner.svgWidth, 'auto');
        const svgHeight = ensureCssUnit(corner.svgHeight, 'auto');
        const colorFilter = convertColorToFilter(corner.svgColor || '#ffffff');
        const filterStyle = colorFilter !== 'none' ? `filter: ${colorFilter};` : '';

        css += `
    .corner-${cornerNum} svg {
      width: ${svgWidth};
      height: ${svgHeight};
      display: block;
      ${filterStyle}
    }

    .corner-${cornerNum} svg * {
      fill: currentColor !important;
    }

    .corner-${cornerNum} img {
      width: ${svgWidth};
      height: ${svgHeight};
      object-fit: contain;
      ${filterStyle}
    }
        `;
      }
    });
  }

  return css;
}

/**
 * Generates CSS variables for the Corners Module (for compatibility with legacy templates)
 */
export function getCornersStyleVariables(data: ModuleData): Record<string, string> {
  const cornersData = data as CornersData;
  const { corners } = cornersData;
  const variables: Record<string, string> = {};

  corners.forEach((corner, index) => {
    const cornerNum = index + 1;

    // Map corner index to default position
    const defaultPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const position = corner.specialPosition !== 'none'
      ? corner.specialPosition
      : defaultPositions[index];

    // Set position variables based on corner position
    switch (position) {
      case 'top-left':
        variables[`--corner${cornerNum}-top`] = `${corner.paddingY}px`;
        variables[`--corner${cornerNum}-left`] = `${corner.paddingX}px`;
        break;
      case 'top-right':
        variables[`--corner${cornerNum}-top`] = `${corner.paddingY}px`;
        variables[`--corner${cornerNum}-right`] = `${corner.paddingX}px`;
        break;
      case 'bottom-left':
        variables[`--corner${cornerNum}-bottom`] = `${corner.paddingY}px`;
        variables[`--corner${cornerNum}-left`] = `${corner.paddingX}px`;
        break;
      case 'bottom-right':
        variables[`--corner${cornerNum}-bottom`] = `${corner.paddingY}px`;
        variables[`--corner${cornerNum}-right`] = `${corner.paddingX}px`;
        break;
    }

    // SVG color variable
    if (corner.type === 'svg') {
      variables[`--corner${cornerNum}-svg-color`] = corner.svgColor;
    }

    // SVG dimensions
    variables[`--corner-svg-width`] = ensureCssUnit(corner.svgWidth, 'auto');
    variables[`--corner-svg-height`] = ensureCssUnit(corner.svgHeight, 'auto');
  });

  return variables;
}
