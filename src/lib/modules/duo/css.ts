import { DuoModuleConfig } from './schema';

/**
 * Generate CSS for the Duo module
 *
 * This CSS creates:
 * - Double-width body (2160px)
 * - Flex container for 2 slides
 * - Individual slide containers (1080px each)
 * - Centered image with transformations and outline effect
 */
export function generateDuoCSS(config: DuoModuleConfig): string {
  const {
    centerImageOffsetX,
    centerImageOffsetY,
    centerImageScale,
    centerImageRotation,
    outlineEffect,
  } = config;

  // Calculate scale as decimal
  const scale = centerImageScale / 100;

  // Generate outline effect using multiple drop-shadows
  let outlineFilterCSS = 'none';
  if (outlineEffect.enabled && outlineEffect.size > 0) {
    const color = outlineEffect.color;
    const size = outlineEffect.size;

    // Create 8-directional drop-shadows for solid outline
    const shadows = [
      `drop-shadow(${size}px 0 0 ${color})`,
      `drop-shadow(-${size}px 0 0 ${color})`,
      `drop-shadow(0 ${size}px 0 ${color})`,
      `drop-shadow(0 -${size}px 0 ${color})`,
      `drop-shadow(${size}px ${size}px 0 ${color})`,
      `drop-shadow(-${size}px ${size}px 0 ${color})`,
      `drop-shadow(${size}px -${size}px 0 ${color})`,
      `drop-shadow(-${size}px -${size}px 0 ${color})`,
    ];
    outlineFilterCSS = shadows.join(' ');
  }

  return `
    /* === DUO MODULE STYLES === */

    /* Force body to double width */
    body {
      width: 2160px !important;
      overflow: hidden;
    }

    /* Main wrapper containing both slides */
    .duo-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 2160px;
      height: 1440px;
      display: flex;
      flex-direction: row;
      z-index: 0;
    }

    /* Individual slide containers */
    .duo-slide {
      position: relative;
      width: 1080px;
      height: 1440px;
      flex-shrink: 0;
      overflow: hidden;
    }

    .duo-slide-1 {
      left: 0;
    }

    .duo-slide-2 {
      left: 1080px;
    }

    /* Center image layer (positioned absolutely at 50%) */
    .duo-center-image {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%)
                 translate(${centerImageOffsetX}px, ${centerImageOffsetY}px)
                 scale(${scale})
                 rotate(${centerImageRotation}deg);
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      z-index: 5;
      pointer-events: none;
      filter: ${outlineFilterCSS};
    }

    /* Ensure all other content is wrapped inside .duo-slide */
    .duo-wrapper > *:not(.duo-slide):not(.duo-center-image) {
      display: none;
    }
  `;
}
