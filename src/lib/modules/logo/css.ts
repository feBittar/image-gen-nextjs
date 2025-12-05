import { ModuleData, RenderContext } from '../types';
import { LogoData } from './schema';

/**
 * Helper to convert special position and padding to CSS positioning
 */
function getLogoPositionCSS(data: LogoData): string {
  const { specialPosition, paddingX, paddingY, top, left, right, bottom } = data;

  // If manual positioning (specialPosition is 'none'), use manual values
  if (specialPosition === 'none') {
    let css = '';
    if (top !== undefined) css += `top: ${typeof top === 'number' ? `${top}px` : top};\n      `;
    if (left !== undefined) css += `left: ${typeof left === 'number' ? `${left}px` : left};\n      `;
    if (right !== undefined) css += `right: ${typeof right === 'number' ? `${right}px` : right};\n      `;
    if (bottom !== undefined) css += `bottom: ${typeof bottom === 'number' ? `${bottom}px` : bottom};\n      `;
    return css;
  }

  // Use special position presets
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
    case 'top-center':
      return `
        top: ${paddingY}px;
        left: 50%;
        transform: translateX(-50%);
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
      return '';
  }
}

/**
 * Helper to generate CSS filter string
 */
function getLogoFilterCSS(data: LogoData): string {
  const { filter, filterIntensity } = data;

  switch (filter) {
    case 'none':
      return '';
    case 'grayscale':
      return `filter: grayscale(100%);`;
    case 'invert':
      return `filter: invert(100%);`;
    case 'brightness':
      return `filter: brightness(${filterIntensity}%);`;
    case 'contrast':
      return `filter: contrast(${filterIntensity}%);`;
    case 'sepia':
      return `filter: sepia(100%);`;
    default:
      return '';
  }
}

/**
 * Generates CSS for the Logo Module
 */
export function getLogoCss(data: ModuleData, context?: RenderContext): string {
  const logoData = data as LogoData;
  const { enabled, width, height, opacity } = logoData;

  if (!enabled) {
    return `
    /* === LOGO MODULE (DISABLED) === */
    .logo-container {
      display: none;
    }
    `;
  }

  const positionCSS = getLogoPositionCSS(logoData);
  const filterCSS = getLogoFilterCSS(logoData);

  return `
    /* === LOGO MODULE === */
    .logo-container {
      position: absolute;
      ${positionCSS}
      z-index: 30;
      pointer-events: none;
    }

    .logo-container img {
      display: block;
      width: ${width};
      height: ${height};
      object-fit: contain;
      opacity: ${opacity};
      ${filterCSS}
    }
  `;
}

/**
 * Generates CSS variables for the Logo Module (for compatibility with legacy templates)
 */
export function getLogoStyleVariables(data: ModuleData): Record<string, string> {
  const logoData = data as LogoData;
  const variables: Record<string, string> = {};

  if (!logoData.enabled) {
    return variables;
  }

  variables['--logo-width'] = logoData.width;
  variables['--logo-height'] = logoData.height;
  variables['--logo-opacity'] = logoData.opacity.toString();

  // Position variables based on special position
  if (logoData.specialPosition !== 'none') {
    variables['--logo-position'] = logoData.specialPosition;
    variables['--logo-padding-x'] = `${logoData.paddingX}px`;
    variables['--logo-padding-y'] = `${logoData.paddingY}px`;
  } else {
    // Manual positioning
    if (logoData.top !== undefined) {
      variables['--logo-top'] = typeof logoData.top === 'number' ? `${logoData.top}px` : logoData.top;
    }
    if (logoData.left !== undefined) {
      variables['--logo-left'] = typeof logoData.left === 'number' ? `${logoData.left}px` : logoData.left;
    }
    if (logoData.right !== undefined) {
      variables['--logo-right'] = typeof logoData.right === 'number' ? `${logoData.right}px` : logoData.right;
    }
    if (logoData.bottom !== undefined) {
      variables['--logo-bottom'] = typeof logoData.bottom === 'number' ? `${logoData.bottom}px` : logoData.bottom;
    }
  }

  return variables;
}
