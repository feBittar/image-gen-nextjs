import { ModuleData } from '../types';
import { ContentImageData } from './schema';

/**
 * Generates CSS for the Content Image module
 */
export function getContentImageCss(data: ModuleData): string {
  const contentImage = data as ContentImageData;

  if (!contentImage.enabled) {
    return `
      /* Content Image Module - Disabled */
      .content-image-section {
        display: none;
      }
    `;
  }

  // Generate shadow CSS if enabled
  const shadowCss = contentImage.shadow?.enabled
    ? `0 0 ${contentImage.shadow.blur}px ${contentImage.shadow.spread}px ${contentImage.shadow.color}`
    : 'none';

  // Single image mode CSS
  if (contentImage.mode === 'single') {
    return `
      /* ===== CONTENT IMAGE MODULE (z-index: 5) ===== */
      .content-image-section {
        flex: 1 1 auto;
        flex-basis: ${contentImage.layoutWidth || 'auto'};
        align-self: ${contentImage.alignSelf || 'stretch'};
        min-width: 0;
        flex-shrink: 1;
        z-index: 5;
        position: relative;
        display: ${contentImage.url ? 'flex' : 'none'};
        min-height: 0;
        align-items: ${getAlignItemsValue(contentImage.position)};
        justify-content: center;
      }

      .content-image {
        max-width: ${contentImage.maxWidth}%;
        max-height: ${contentImage.maxHeight}%;
        width: auto;
        height: auto;
        object-fit: ${contentImage.objectFit};
        object-position: ${contentImage.position};
        border-radius: ${contentImage.borderRadius}px;
        box-shadow: ${shadowCss};
        display: block;
      }

      /* Hide content image if src is empty */
      .content-image[src=""] {
        display: none;
      }
    `;
  }

  // Comparison mode CSS
  return `
    /* ===== CONTENT IMAGE MODULE - COMPARISON MODE (z-index: 5) ===== */
    .content-image-section {
      flex: 1 1 auto;
      flex-basis: ${contentImage.layoutWidth || 'auto'};
      align-self: ${contentImage.alignSelf || 'stretch'};
      min-width: 0;
      flex-shrink: 1;
      z-index: 5;
      position: relative;
      display: ${contentImage.url || contentImage.url2 ? 'flex' : 'none'};
      min-height: 0;
    }

    .comparison-row {
      width: 100%;
      height: 100%;
      display: flex;
      gap: ${contentImage.comparisonGap}px;
      align-items: ${getAlignItemsValue(contentImage.position)};
      justify-content: center;
    }

    .comparison-image {
      flex: 1;
      max-width: ${contentImage.maxWidth}%;
      max-height: ${contentImage.maxHeight}%;
      border-radius: ${contentImage.borderRadius}px;
      position: relative;
      display: flex;
      align-items: ${getAlignItemsValue(contentImage.position)};
      justify-content: center;
    }

    .comparison-image img {
      width: 100%;
      height: 100%;
      object-fit: ${contentImage.objectFit};
      object-position: ${contentImage.position};
      box-shadow: ${shadowCss};
      display: block;
    }

    /* Hide comparison images if src is empty */
    .comparison-image img[src=""] {
      display: none;
    }
  `;
}

/**
 * Convert position value to CSS align-items
 */
function getAlignItemsValue(position: 'top' | 'center' | 'bottom'): string {
  switch (position) {
    case 'top':
      return 'flex-start';
    case 'bottom':
      return 'flex-end';
    case 'center':
    default:
      return 'center';
  }
}
