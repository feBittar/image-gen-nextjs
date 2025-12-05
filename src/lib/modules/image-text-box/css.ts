import { ModuleData } from '../types';
import { ImageTextBoxData } from './schema';

/**
 * Helper to get left percentage from split ratio
 */
function getLeftPercent(data: ImageTextBoxData): number {
  if (data.splitRatio === 'custom') {
    return data.customLeftPercent;
  }

  const ratioMap: Record<string, number> = {
    '50-50': 50,
    '40-60': 40,
    '60-40': 60,
    '30-70': 30,
    '70-30': 70,
  };

  return ratioMap[data.splitRatio] || 50;
}

/**
 * Convert verticalAlign to CSS justify-content
 */
function getJustifyContent(align: 'top' | 'center' | 'bottom'): string {
  const map = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
  return map[align] || 'center';
}

/**
 * Generates CSS for the Image + Text Box module
 */
export function getImageTextBoxCss(data: ModuleData): string {
  const boxData = data as ImageTextBoxData;

  if (!boxData.enabled) {
    return `
      /* Image + Text Box Module - Disabled */
      .image-text-box {
        display: none;
      }
    `;
  }

  const leftPercent = getLeftPercent(boxData);
  const rightPercent = 100 - leftPercent;

  // Determine which side gets which percentage based on order
  const imagePercent = boxData.order === 'image-left' ? leftPercent : rightPercent;
  const textPercent = boxData.order === 'image-left' ? rightPercent : leftPercent;

  // Generate shadow CSS for image
  const shadowCss = boxData.imageConfig.shadow?.enabled
    ? `0 0 ${boxData.imageConfig.shadow.blur}px ${boxData.imageConfig.shadow.spread}px ${boxData.imageConfig.shadow.color}`
    : 'none';

  // Generate text field styles
  const textFieldStyles = boxData.textConfig.fields
    .slice(0, boxData.textConfig.count)
    .map((field, index) => {
      if (!field.content) return '';

      const style = field.style || {};

      return `
    .image-text-box-text-field-${index + 1} {
      font-family: ${style.fontFamily || 'Arial'};
      font-size: ${style.fontSize || '24px'};
      font-weight: ${style.fontWeight || '400'};
      color: ${style.color || '#000000'};
      text-align: ${style.textAlign || 'left'};
      line-height: ${style.lineHeight || '1.2'};
      letter-spacing: ${style.letterSpacing || '0'};
      text-transform: ${style.textTransform || 'none'};
      ${style.textShadow ? `text-shadow: ${style.textShadow};` : ''}
      ${style.backgroundColor ? `background-color: ${style.backgroundColor};` : ''}
      ${style.padding ? `padding: ${style.padding};` : ''}
    }

    .image-text-box-text-field-${index + 1}:empty {
      display: none;
    }
      `;
    })
    .filter(Boolean)
    .join('\n');

  return `
    /* ===== IMAGE + TEXT BOX MODULE (z-index: 7) ===== */
    .image-text-box {
      display: ${boxData.imageConfig.url ? 'flex' : 'none'};
      flex-direction: ${boxData.order === 'image-left' ? 'row' : 'row-reverse'};
      width: ${boxData.width};
      height: ${boxData.height};
      gap: ${boxData.gap}px;
      align-items: stretch;
      flex-basis: ${boxData.layoutWidth};
      align-self: ${boxData.alignSelf};
      min-width: 0;
      min-height: 0;
      z-index: 7;
      position: relative;
      box-sizing: border-box;
      flex-shrink: 1;
    }

    /* Image side - stretches to fill height, image uses object-fit */
    .image-text-box-image-side {
      flex: 0 0 calc(${imagePercent}% - ${boxData.gap / 2}px);
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      padding-top: ${boxData.imageConfig.paddingTop ?? 0}px;
      padding-right: ${boxData.imageConfig.paddingRight ?? 0}px;
      padding-bottom: ${boxData.imageConfig.paddingBottom ?? 0}px;
      padding-left: ${boxData.imageConfig.paddingLeft ?? 0}px;
      box-sizing: border-box;
      border-radius: ${boxData.imageConfig.borderRadius}px;
    }

    .image-text-box-image {
      width: 100%;
      height: 100%;
      object-fit: ${boxData.imageConfig.objectFit};
      border-radius: ${boxData.imageConfig.borderRadius}px;
      box-shadow: ${shadowCss};
      display: block;
    }

    .image-text-box-image[src=""] {
      display: none;
    }

    /* Text side - stretches to match module height, justify-content aligns text vertically */
    .image-text-box-text-side {
      flex: 0 0 calc(${textPercent}% - ${boxData.gap / 2}px);
      display: flex;
      flex-direction: column;
      gap: ${boxData.textConfig.gap}px;
      justify-content: ${getJustifyContent(boxData.textConfig.verticalAlign)};
      min-width: 0;
      min-height: 0;
      padding-top: ${boxData.textConfig.paddingTop ?? 0}px;
      padding-right: ${boxData.textConfig.paddingRight ?? 0}px;
      padding-bottom: ${boxData.textConfig.paddingBottom ?? 0}px;
      padding-left: ${boxData.textConfig.paddingLeft ?? 0}px;
      box-sizing: border-box;
    }

    /* Text field base styles */
    .image-text-box-text-field {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    ${textFieldStyles}

    /* Styled chunks with background colors */
    .image-text-box-text-field span[style*="background-color"] {
      padding: 2px 4px;
      border-radius: 2px;
    }
  `;
}
