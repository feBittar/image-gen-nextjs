import { ModuleData } from '../types';
import { ViewportData } from './schema';

/**
 * Gera CSS para o módulo Viewport
 * Controla o background do body, blur overlay (::before), e gradient overlay (::after)
 */
export function getViewportCss(data: ModuleData): string {
  const viewport = data as ViewportData;

  // CSS para o body (background principal)
  const bodyStyles: string[] = [];

  // Background: cor ou imagem
  if (viewport.backgroundType === 'color') {
    bodyStyles.push(`background-color: ${viewport.backgroundColor};`);
  } else if (viewport.backgroundType === 'image' && viewport.backgroundImage) {
    bodyStyles.push(`background-image: url(${viewport.backgroundImage});`);
    bodyStyles.push('background-size: cover;');
    bodyStyles.push('background-position: center;');
    bodyStyles.push('background-repeat: no-repeat;');
  }

  const bodyCss = bodyStyles.length > 0
    ? `body {\n  ${bodyStyles.join('\n  ')}\n}`
    : '';

  // CSS para ::before (blur overlay)
  let beforeCss = '';
  if (viewport.blurEnabled && viewport.blurAmount > 0) {
    beforeCss = `
body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(${viewport.blurAmount}px);
  -webkit-backdrop-filter: blur(${viewport.blurAmount}px);
  pointer-events: none;
  z-index: 0;
}`;
  }

  // CSS para ::after (gradient overlay)
  let afterCss = '';
  const gradient = viewport.gradientOverlay;

  if (gradient?.enabled && gradient.color) {
    const startOpacity = gradient.startOpacity ?? 0.7;
    const midOpacity = gradient.midOpacity ?? 0.3;
    const endOpacity = gradient.endOpacity ?? 0;
    const height = gradient.height ?? 50;
    const direction = gradient.direction || 'to top';
    const blendMode = gradient.blendMode || 'normal';

    // Converter direção para valores de posição do gradient
    const gradientStops = `
      rgba(${hexToRgb(gradient.color)}, ${startOpacity}) 0%,
      rgba(${hexToRgb(gradient.color)}, ${midOpacity}) ${height}%,
      rgba(${hexToRgb(gradient.color)}, ${endOpacity}) 100%
    `.trim();

    afterCss = `
body::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(${direction}, ${gradientStops});
  mix-blend-mode: ${blendMode};
  pointer-events: none;
  z-index: 9999;
}`;
  }

  // CSS para content-wrapper (usado quando card está inativo)
  const cw = viewport.contentWrapper || {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    gap: 12,
    layoutDirection: 'column',
    contentAlign: 'stretch',
    justifyContent: 'flex-start',
  };

  const padding = cw.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  const contentWrapperCss = `
.content-wrapper {
  flex-direction: ${cw.layoutDirection || 'column'};
  gap: ${cw.gap ?? 12}px;
  padding: ${padding.top ?? 0}px ${padding.right ?? 0}px ${padding.bottom ?? 0}px ${padding.left ?? 0}px;
  align-items: ${cw.layoutDirection === 'row' ? (cw.contentAlign || 'stretch') : 'stretch'};
  justify-content: ${cw.justifyContent || 'flex-start'};
}`;

  // Combinar todos os CSS
  return [bodyCss, beforeCss, afterCss, contentWrapperCss].filter(Boolean).join('\n\n');
}

/**
 * Gera CSS variables para o módulo Viewport
 * Outros módulos podem usar essas variáveis
 */
export function getViewportStyleVariables(data: ModuleData): Record<string, string> {
  const viewport = data as ViewportData;

  return {
    '--viewport-bg-color': viewport.backgroundColor,
    '--viewport-blur': viewport.blurEnabled ? `${viewport.blurAmount}px` : '0px',
  };
}

/**
 * Helper: Converte hex para RGB (sem alpha)
 */
function hexToRgb(hex: string): string {
  // Remove # se presente
  const cleanHex = hex.replace('#', '');

  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}
