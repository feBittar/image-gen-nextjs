import { ModuleData } from '../types';
import { BulletsData } from './schema';

/**
 * Generates CSS for the Bullets module
 */
export function getBulletsCss(data: ModuleData): string {
  const bullets = data as BulletsData;

  // Layout configuration
  const layoutConfig = {
    vertical: {
      flexDirection: 'column',
      width: '100%',
    },
    horizontal: {
      flexDirection: 'row',
      width: 'auto',
    },
    grid: {
      flexDirection: 'row',
      width: '100%',
      flexWrap: 'wrap' as const,
    },
  };

  const layout = layoutConfig[bullets.layout] || layoutConfig.vertical;
  const layoutWithWrap = layout as { flexDirection: string; width: string; flexWrap?: string };

  // Generate individual bullet styles
  const bulletItemStyles = bullets.items
    .map((item, index) => {
      if (!item.enabled || !item.text) return '';

      const style = item.textStyle || {};

      return `
    .bullet-card-${index + 1} {
      background-color: ${item.backgroundColor};
      display: ${item.enabled ? 'flex' : 'none'};
    }

    .bullet-text-${index + 1} {
      font-family: ${style.fontFamily || 'Arial'};
      font-size: ${style.fontSize || '18px'};
      font-weight: ${style.fontWeight || '400'};
      color: ${style.color || '#000000'};
      text-align: ${style.textAlign || 'left'};
      line-height: ${style.lineHeight || '1.4'};
      letter-spacing: ${style.letterSpacing || '0'};
      text-transform: ${style.textTransform || 'none'};
      ${style.textShadow ? `text-shadow: ${style.textShadow};` : ''}
      ${style.textDecoration ? `text-decoration: ${style.textDecoration};` : ''}
      ${style.backgroundColor ? `background-color: ${style.backgroundColor};` : ''}
      ${style.padding ? `padding: ${style.padding};` : ''}
    }
      `.trim();
    })
    .filter(Boolean)
    .join('\n\n');

  return `
    /* ===== BULLETS MODULE (z-index: 10) ===== */
    .bullets-container {
      display: flex;
      flex-direction: ${layoutWithWrap.flexDirection};
      ${layoutWithWrap.flexWrap ? `flex-wrap: ${layoutWithWrap.flexWrap};` : ''}
      gap: ${bullets.gap}px;
      width: ${layoutWithWrap.width};
      position: relative;
      z-index: 10;
      box-sizing: border-box;
    }

    /* Individual bullet card */
    .bullet-card {
      display: flex;
      align-items: center;
      gap: ${bullets.iconGap}px;
      padding: ${bullets.itemPadding};
      border-radius: ${bullets.borderRadius}px;
      box-shadow: ${bullets.cardShadow};
      ${bullets.cardMinHeight > 0 ? `min-height: ${bullets.cardMinHeight}px;` : ''}
      transition: transform 0.2s ease;
      box-sizing: border-box;
      ${bullets.layout === 'grid' ? 'flex: 1 1 calc(50% - 8px);' : ''}
      ${bullets.layout === 'horizontal' ? 'flex: 1;' : ''}
    }

    /* Hide bullet cards when disabled or empty */
    .bullet-card:empty {
      display: none;
    }

    /* Icon container */
    .bullet-icon {
      flex-shrink: 0;
      width: ${bullets.iconSize}px;
      height: ${bullets.iconSize}px;
      border-radius: 50%;
      background-color: ${bullets.iconBackgroundColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.round(bullets.iconSize * 0.5)}px;
      font-weight: 700;
      color: ${bullets.iconColor};
    }

    .bullet-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }

    .bullet-icon svg {
      width: ${Math.round(bullets.iconSize * 0.6)}px;
      height: ${Math.round(bullets.iconSize * 0.6)}px;
      fill: ${bullets.iconColor};
    }

    .bullet-icon:empty {
      display: none;
    }

    /* Text content */
    .bullet-text {
      flex: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .bullet-text:empty {
      display: none;
    }

    /* Styled chunks support */
    .bullet-text span[style*="background-color"] {
      padding: 2px 4px;
      border-radius: 2px;
    }

    ${bulletItemStyles}
  `.trim();
}

/**
 * Generates CSS variables for the Bullets module
 */
export function getBulletsStyleVariables(data: ModuleData): Record<string, string> {
  const bullets = data as BulletsData;

  return {
    '--bullets-gap': `${bullets.gap}px`,
    '--bullets-border-radius': `${bullets.borderRadius}px`,
    '--bullets-icon-size': `${bullets.iconSize}px`,
    '--bullets-icon-gap': `${bullets.iconGap}px`,
  };
}
