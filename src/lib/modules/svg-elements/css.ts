import { ModuleData, RenderContext } from '../types';
import { SvgElementsData, SvgElement } from './schema';

/**
 * Helper to calculate position CSS based on special position or manual values
 */
function getPositionCSS(svg: SvgElement, viewportWidth: number, viewportHeight: number): string {
  const { specialPosition, specialPadding, position } = svg;

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
          transform: translateX(-50%) rotate(${svg.rotation}deg);
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
          transform: translateX(-50%) rotate(${svg.rotation}deg);
        `;
      case 'center-left':
        return `
          top: 50%;
          left: ${paddingX}px;
          transform: translateY(-50%) rotate(${svg.rotation}deg);
        `;
      case 'center-right':
        return `
          top: 50%;
          right: ${paddingX}px;
          transform: translateY(-50%) rotate(${svg.rotation}deg);
        `;
      case 'center':
        return `
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${svg.rotation}deg);
        `;
      default:
        break;
    }
  }

  // Use manual position values
  let css = '';
  if (position.top !== undefined) css += `top: ${position.top};\n      `;
  if (position.left !== undefined) css += `left: ${position.left};\n      `;
  if (position.right !== undefined) css += `right: ${position.right};\n      `;
  if (position.bottom !== undefined) css += `bottom: ${position.bottom};\n      `;
  if (position.width !== undefined) css += `width: ${position.width};\n      `;
  if (position.height !== undefined) css += `height: ${position.height};\n      `;

  // Add rotation if not using special position (special positions handle rotation in transform)
  if (svg.rotation !== 0) {
    css += `transform: rotate(${svg.rotation}deg);\n      `;
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
 * Generates CSS for the SVGElements Module
 */
export function getSvgElementsCss(data: ModuleData, context?: RenderContext): string {
  const svgData = data as SvgElementsData;
  const { svgElements } = svgData;

  // Get viewport dimensions from context or use defaults
  const viewportWidth = context?.viewportWidth || 1080;
  const viewportHeight = context?.viewportHeight || 1440;

  let css = `
    /* === SVG ELEMENTS OVERLAY === */
    .svg-elements-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: ${viewportWidth}px;
      height: ${viewportHeight}px;
      pointer-events: none;
      z-index: 20;
    }

    .svg-element {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .svg-element img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Hide disabled SVG elements */
    .svg-element.disabled {
      display: none;
    }
  `;

  // Generate CSS for each SVG element
  for (let i = 0; i < svgElements.length; i++) {
    const svg = svgElements[i];
    const svgNum = i + 1;

    // Skip if not enabled
    if (!svg.enabled || !svg.svgUrl) {
      css += `
    .svg-element-${svgNum} {
      display: none;
    }
      `;
      continue;
    }

    const colorFilter = svg.color ? convertColorToFilter(svg.color) : 'none';

    css += `
    .svg-element-${svgNum} {
      ${getPositionCSS(svg, viewportWidth, viewportHeight)}
      width: ${svg.width};
      height: ${svg.height};
      opacity: ${svg.opacity};
      ${svg.zIndexOverride !== undefined ? `z-index: ${svg.zIndexOverride};` : ''}
    }

    .svg-element-${svgNum} img {
      filter: ${colorFilter};
    }
    `;
  }

  return css;
}

/**
 * Generates CSS variables for the SVGElements Module (for compatibility with legacy templates)
 */
export function getSvgElementsStyleVariables(data: ModuleData): Record<string, string> {
  const svgData = data as SvgElementsData;
  const { svgElements } = svgData;
  const variables: Record<string, string> = {};

  // Generate variables for each SVG element
  for (let i = 0; i < svgElements.length; i++) {
    const svg = svgElements[i];
    const svgNum = i + 1;

    if (!svg.enabled || !svg.svgUrl) continue;

    // Position variables
    if (svg.specialPosition === 'none') {
      if (svg.position.top !== undefined) {
        variables[`--svg${svgNum}-top`] = String(svg.position.top);
      }
      if (svg.position.left !== undefined) {
        variables[`--svg${svgNum}-left`] = String(svg.position.left);
      }
      if (svg.position.right !== undefined) {
        variables[`--svg${svgNum}-right`] = String(svg.position.right);
      }
      if (svg.position.bottom !== undefined) {
        variables[`--svg${svgNum}-bottom`] = String(svg.position.bottom);
      }
    }

    // Size variables
    variables[`--svg${svgNum}-width`] = svg.width;
    variables[`--svg${svgNum}-height`] = svg.height;

    // Color variable
    if (svg.color) {
      variables[`--svg${svgNum}-color`] = svg.color;
    }

    // Rotation variable
    if (svg.rotation) {
      variables[`--svg${svgNum}-rotation`] = `${svg.rotation}deg`;
    }

    // Opacity variable
    variables[`--svg${svgNum}-opacity`] = String(svg.opacity);
  }

  return variables;
}
