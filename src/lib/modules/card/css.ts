import { ModuleData } from '../types';
import { CardData, SpecialPosition } from './schema';

/**
 * Get CSS positioning based on special position
 */
function getPositionCSS(position: SpecialPosition, padding: number): string {
  const paddingPx = `${padding}px`;

  switch (position) {
    case 'center':
      return `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);`;
    case 'top-left':
      return `
      position: absolute;
      top: ${paddingPx};
      left: ${paddingPx};`;
    case 'top-center':
      return `
      position: absolute;
      top: ${paddingPx};
      left: 50%;
      transform: translateX(-50%);`;
    case 'top-right':
      return `
      position: absolute;
      top: ${paddingPx};
      right: ${paddingPx};`;
    case 'center-left':
      return `
      position: absolute;
      top: 50%;
      left: ${paddingPx};
      transform: translateY(-50%);`;
    case 'center-right':
      return `
      position: absolute;
      top: 50%;
      right: ${paddingPx};
      transform: translateY(-50%);`;
    case 'bottom-left':
      return `
      position: absolute;
      bottom: ${paddingPx};
      left: ${paddingPx};`;
    case 'bottom-center':
      return `
      position: absolute;
      bottom: ${paddingPx};
      left: 50%;
      transform: translateX(-50%);`;
    case 'bottom-right':
      return `
      position: absolute;
      bottom: ${paddingPx};
      right: ${paddingPx};`;
    case 'none':
    default:
      return `
      position: relative;`;
  }
}

/**
 * Generates CSS for the Card module
 */
export function getCardCss(data: ModuleData): string {
  const card = data as CardData;

  if (!card.enabled) {
    return '';
  }

  // Generate gradient CSS if enabled
  const gradientCss = card.gradientOverlay?.enabled
    ? generateGradientCss(card.gradientOverlay)
    : 'none';

  // Generate shadow CSS if enabled
  const shadowCss = card.shadow?.enabled
    ? generateShadowCss(card.shadow)
    : 'none';

  // Get position CSS
  const specialPosition = card.specialPosition || 'center';
  const positionPadding = card.positionPadding ?? 40;
  const positionCss = getPositionCSS(specialPosition, positionPadding);

  return `
    /* ===== CARD CONTAINER (z-index: 1) ===== */
    .card-container {
      width: ${card.width}%;
      height: ${card.height}%;
      background-color: ${card.backgroundType === 'color' ? card.backgroundColor : 'transparent'};
      background-image: ${card.backgroundType === 'image' && card.backgroundImage ? `url(${card.backgroundImage})` : 'none'};
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: ${card.borderRadius}px;
      ${positionCss}
      z-index: 1;
      display: flex;
      flex-direction: ${card.layoutDirection || 'column'};
      gap: ${card.contentGap || '12px'};
      align-items: ${card.layoutDirection === 'row' ? (card.contentAlign || 'stretch') : 'stretch'};
      padding: ${card.padding.top}px ${card.padding.right}px ${card.padding.bottom}px ${card.padding.left}px;
      box-sizing: border-box;
      overflow: hidden;
      box-shadow: ${shadowCss};
    }

    /* Card gradient overlay pseudo-element */
    .card-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-image: ${gradientCss};
      pointer-events: none;
      z-index: 0;
      display: ${card.gradientOverlay?.enabled ? 'block' : 'none'};
      border-radius: ${card.borderRadius}px;
    }
  `;
}

/**
 * Generate gradient CSS from overlay configuration
 */
function generateGradientCss(overlay: any): string {
  if (!overlay.enabled) return 'none';

  const { color, startOpacity, midOpacity, endOpacity, height, direction } = overlay;

  const start = startOpacity ?? 0.7;
  const mid = midOpacity ?? 0.3;
  const end = endOpacity ?? 0;
  const gradientHeight = height ?? 50;

  // Convert hex to rgba
  const rgbaColor = hexToRgba(color || '#000000', 1);
  const startColor = rgbaColor.replace(/[\d.]+\)$/g, `${start})`);
  const midColor = rgbaColor.replace(/[\d.]+\)$/g, `${mid})`);
  const endColor = rgbaColor.replace(/[\d.]+\)$/g, `${end})`);

  return `linear-gradient(${direction || 'to top'}, ${startColor} 0%, ${midColor} ${gradientHeight}%, ${endColor} 100%)`;
}

/**
 * Generate box shadow CSS
 */
function generateShadowCss(shadow: any): string {
  if (!shadow.enabled) return 'none';

  const x = shadow.x ?? 0;
  const y = shadow.y ?? 10;
  const blur = shadow.blur ?? 30;
  const spread = shadow.spread ?? 0;
  const color = shadow.color ?? 'rgba(0, 0, 0, 0.3)';

  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;

  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}
