import puppeteer, { Browser, Page, ScreenshotOptions } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import {
  GenerateImageOptions,
  GenerateImageResult,
  PostData,
  GradientOverlay,
  ImageGenerationError,
} from '@/lib/types/image';
import { processStyledText, stylesToCss, TextStyle, containsHTML } from '@/lib/utils/textStyleProcessor';
import { processTextField } from '@/lib/utils/textProcessor';
import {
  extractCustomFonts,
  mapFontNameToFile,
  generateFontFaceCSS,
  injectFontFaceIntoHTML,
  FontDefinition
} from './fontInjector';

/**
 * Instância do browser reutilizável para melhor performance
 */
let browserInstance: Browser | null = null;

/**
 * Carrega o conteúdo de um arquivo SVG a partir de uma URL ou caminho local
 * e retorna o SVG inline com dimensões e classe aplicadas
 */
async function loadSvgInline(svgUrl: string, width: string, height: string, baseUrl: string): Promise<string | null> {
  try {
    let svgContent: string;

    // Se for URL absoluta externa, retorna null (não suportado para inline)
    if (svgUrl.startsWith('http://') || svgUrl.startsWith('https://')) {
      // Tenta fazer fetch apenas de URLs locais (localhost)
      if (!svgUrl.includes('localhost') && !svgUrl.includes('127.0.0.1')) {
        console.log('External SVG URL not supported for inline loading:', svgUrl);
        return null;
      }
      // URL local - extrai o path
      const url = new URL(svgUrl);
      const localPath = path.join(process.cwd(), 'public', url.pathname);
      svgContent = await fs.readFile(localPath, 'utf-8');
    } else {
      // Caminho relativo
      let filePath: string;
      if (svgUrl.startsWith('/')) {
        filePath = path.join(process.cwd(), 'public', svgUrl);
      } else {
        filePath = path.join(process.cwd(), 'public', 'logos', svgUrl);
      }
      svgContent = await fs.readFile(filePath, 'utf-8');
    }

    // Limpa o SVG de declarações XML e doctype
    svgContent = svgContent
      .replace(/<\?xml[^?]*\?>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .trim();

    // Adiciona/modifica os atributos width e height no SVG
    // Primeiro, remove atributos existentes de width/height para substituir
    svgContent = svgContent.replace(/<svg([^>]*)>/, (match, attrs) => {
      // Remove width e height existentes
      let newAttrs = attrs
        .replace(/\s*width\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*height\s*=\s*["'][^"']*["']/gi, '');

      // Adiciona novos width e height
      const widthAttr = width !== 'auto' ? ` width="${width}"` : '';
      const heightAttr = height !== 'auto' ? ` height="${height}"` : '';

      return `<svg${newAttrs}${widthAttr}${heightAttr} style="display: block;">`;
    });

    return svgContent;
  } catch (error) {
    console.error('Failed to load SVG inline:', svgUrl, error);
    return null;
  }
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
 * Obtém ou cria uma instância do browser Puppeteer
 * Reutiliza a mesma instância para múltiplas requisições
 */
async function getBrowserInstance(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    try {
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
        defaultViewport: null,
        protocolTimeout: 60000,
      });

      // Listener para limpar a instância se o browser fechar inesperadamente
      browserInstance.on('disconnected', () => {
        browserInstance = null;
      });
    } catch (error) {
      throw new ImageGenerationError(
        'Falha ao inicializar o browser Puppeteer',
        'BROWSER_INIT_ERROR',
        error
      );
    }
  }
  return browserInstance;
}

/**
 * Carrega o template HTML do arquivo
 * @param templatePath - Caminho absoluto ou relativo do template
 */
async function loadTemplateFile(templatePath: string): Promise<string> {
  try {
    // Verifica se o arquivo existe
    await fs.access(templatePath);

    // Lê o conteúdo do template
    const htmlContent = await fs.readFile(templatePath, 'utf-8');

    if (!htmlContent.trim()) {
      throw new ImageGenerationError(
        'Template HTML está vazio',
        'EMPTY_TEMPLATE',
        { templatePath }
      );
    }

    return htmlContent;
  } catch (error: any) {
    if (error instanceof ImageGenerationError) {
      throw error;
    }

    if (error.code === 'ENOENT') {
      throw new ImageGenerationError(
        `Template não encontrado: ${templatePath}`,
        'TEMPLATE_NOT_FOUND',
        { templatePath }
      );
    }

    throw new ImageGenerationError(
      'Erro ao ler template HTML',
      'TEMPLATE_READ_ERROR',
      { templatePath, originalError: error.message }
    );
  }
}

/**
 * Substitui placeholders {{variavel}} ou {{variavel|estilos}} no HTML pelos dados fornecidos
 * Suporta:
 * - Sintaxe simples: {{field}}
 * - Sintaxe com estilos: {{field|color:red;font-size:20px}}
 * - Triple braces para SVG (sem escape): {{{svgContent}}}
 * - HTML inline com sanitização: <b>texto</b>, <i>texto</i>, etc.
 * - CSS variables via {{styleVariables}}
 *
 * @param html - Conteúdo HTML com placeholders
 * @param data - Dados para substituição
 */
function replacePlaceholders(html: string, data: PostData): string {
  let processedHtml = html;

  // ===== STEP 0: Set BASE_URL for all font and asset URLs =====
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  data.baseUrl = baseUrl;

  // ===== STEP 1: Build CSS Variables for Stack Template =====
  // Build CSS variable string for SVG and free text positioning
  const cssVariables: string[] = [];

  // Helper function to process position values (handles numbers and numeric strings)
  const processPositionValue = (value: string | number | undefined): string | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === 'number') {
      return `${value}px`;
    } else if (typeof value === 'string') {
      // Check if it's a numeric string (e.g., '100')
      if (/^\d+$/.test(value)) {
        return `${value}px`;
      }
      // Otherwise, return as-is (could be '50%', '100px', etc.)
      return value;
    }
    return undefined;
  };

  // Helper function to calculate special position based on corner and padding
  const calculateSpecialPosition = (specialPosition: string | undefined, padding: number = 8) => {
    if (!specialPosition || specialPosition === 'none') return null;

    const paddingStr = `${padding}%`;

    switch (specialPosition) {
      case 'top-left':
        return { top: paddingStr, left: paddingStr, right: undefined, bottom: undefined };
      case 'top-right':
        return { top: paddingStr, right: paddingStr, left: undefined, bottom: undefined };
      case 'bottom-left':
        return { bottom: paddingStr, left: paddingStr, top: undefined, right: undefined };
      case 'bottom-right':
        return { bottom: paddingStr, right: paddingStr, top: undefined, left: undefined };
      default:
        return null;
    }
  };

  // SVG positioning variables (svg1)
  // Check for special position first
  const svg1SpecialPos = calculateSpecialPosition(
    (data as any).svg1SpecialPosition,
    (data as any).svg1SpecialPadding || 8
  );

  if (svg1SpecialPos) {
    // Use special position for top/left/right/bottom
    data.svg1Top = svg1SpecialPos.top || '';
    data.svg1Left = svg1SpecialPos.left || '';
    data.svg1Right = svg1SpecialPos.right || '';
    data.svg1Bottom = svg1SpecialPos.bottom || '';

    // Set CSS variables for position
    if (svg1SpecialPos.top) cssVariables.push(`--svg1-top: ${svg1SpecialPos.top}`);
    if (svg1SpecialPos.left) cssVariables.push(`--svg1-left: ${svg1SpecialPos.left}`);
    if (svg1SpecialPos.right) cssVariables.push(`--svg1-right: ${svg1SpecialPos.right}`);
    if (svg1SpecialPos.bottom) cssVariables.push(`--svg1-bottom: ${svg1SpecialPos.bottom}`);

    // Still allow manual width/height from svg1Position
    if (data.svg1Position) {
      const pos = data.svg1Position as any;
      const width = processPositionValue(pos.width);
      const height = processPositionValue(pos.height);

      data.svg1Width = width || '';
      data.svg1Height = height || '';

      if (width !== undefined) cssVariables.push(`--svg1-width: ${width}`);
      if (height !== undefined) cssVariables.push(`--svg1-height: ${height}`);
    } else {
      data.svg1Width = '';
      data.svg1Height = '';
    }
  } else if (data.svg1Position) {
    // Use manual position
    const pos = data.svg1Position as any;
    const top = processPositionValue(pos.top);
    const left = processPositionValue(pos.left);
    const width = processPositionValue(pos.width);
    const height = processPositionValue(pos.height);

    // Set as direct data properties for placeholder replacement
    data.svg1Top = top || '';
    data.svg1Left = left || '';
    data.svg1Right = '';
    data.svg1Bottom = '';
    data.svg1Width = width || '';
    data.svg1Height = height || '';

    // Also keep CSS variables for compatibility
    if (top !== undefined) cssVariables.push(`--svg1-top: ${top}`);
    if (left !== undefined) cssVariables.push(`--svg1-left: ${left}`);
    if (width !== undefined) cssVariables.push(`--svg1-width: ${width}`);
    if (height !== undefined) cssVariables.push(`--svg1-height: ${height}`);
  } else {
    // Set defaults if no position provided
    data.svg1Top = '';
    data.svg1Left = '';
    data.svg1Right = '';
    data.svg1Bottom = '';
    data.svg1Width = '';
    data.svg1Height = '';
  }

  // SVG color - set as direct property and CSS variable
  if (data.svg1Color) {
    cssVariables.push(`--svg1-color: ${data.svg1Color}`);
  } else {
    data.svg1Color = '';
  }

  if (data.svg2Position) {
    const pos = data.svg2Position as any;
    const top = processPositionValue(pos.top);
    const left = processPositionValue(pos.left);
    const width = processPositionValue(pos.width);
    const height = processPositionValue(pos.height);

    // Set as direct data properties for placeholder replacement
    data.svg2Top = top || '';
    data.svg2Left = left || '';
    data.svg2Width = width || '';
    data.svg2Height = height || '';

    // Also keep CSS variables for compatibility
    if (top !== undefined) cssVariables.push(`--svg2-top: ${top}`);
    if (left !== undefined) cssVariables.push(`--svg2-left: ${left}`);
    if (width !== undefined) cssVariables.push(`--svg2-width: ${width}`);
    if (height !== undefined) cssVariables.push(`--svg2-height: ${height}`);
  } else {
    // Set defaults if no position provided
    data.svg2Top = '';
    data.svg2Left = '';
    data.svg2Width = '';
    data.svg2Height = '';
  }

  // SVG color - set as direct property and CSS variable
  if (data.svg2Color) {
    cssVariables.push(`--svg2-color: ${data.svg2Color}`);
  } else {
    data.svg2Color = '';
  }

  // Free text positioning variables
  // FreeText1 - Check for special position first
  const freeText1SpecialPos = calculateSpecialPosition(
    (data as any).freeText1SpecialPosition,
    (data as any).freeText1SpecialPadding || 8
  );

  if (freeText1SpecialPos) {
    // Use special position
    if (freeText1SpecialPos.top) cssVariables.push(`--freeText1-top: ${freeText1SpecialPos.top}`);
    if (freeText1SpecialPos.left) cssVariables.push(`--freeText1-left: ${freeText1SpecialPos.left}`);
    if (freeText1SpecialPos.right) cssVariables.push(`--freeText1-right: ${freeText1SpecialPos.right}`);
    if (freeText1SpecialPos.bottom) cssVariables.push(`--freeText1-bottom: ${freeText1SpecialPos.bottom}`);
  } else if (data.freeText1Position) {
    // Use manual position
    const pos = data.freeText1Position as any;
    const top = processPositionValue(pos.top);
    const left = processPositionValue(pos.left);

    if (top !== undefined) cssVariables.push(`--freeText1-top: ${top}`);
    if (left !== undefined) cssVariables.push(`--freeText1-left: ${left}`);
  }
  if (data.freeText1Style) {
    const style = data.freeText1Style as any;
    if (style.fontSize) cssVariables.push(`--freeText1-size: ${typeof style.fontSize === 'number' ? style.fontSize + 'px' : style.fontSize}`);
    if (style.color) cssVariables.push(`--freeText1-color: ${style.color}`);
    if (style.backgroundColor) cssVariables.push(`--freeText1-bgcolor: ${style.backgroundColor}`);
  }

  // FreeText2 - Check for special position first
  const freeText2SpecialPos = calculateSpecialPosition(
    (data as any).freeText2SpecialPosition,
    (data as any).freeText2SpecialPadding || 8
  );

  if (freeText2SpecialPos) {
    // Use special position
    if (freeText2SpecialPos.top) cssVariables.push(`--freeText2-top: ${freeText2SpecialPos.top}`);
    if (freeText2SpecialPos.left) cssVariables.push(`--freeText2-left: ${freeText2SpecialPos.left}`);
    if (freeText2SpecialPos.right) cssVariables.push(`--freeText2-right: ${freeText2SpecialPos.right}`);
    if (freeText2SpecialPos.bottom) cssVariables.push(`--freeText2-bottom: ${freeText2SpecialPos.bottom}`);
  } else if (data.freeText2Position) {
    // Use manual position
    const pos = data.freeText2Position as any;
    const top = processPositionValue(pos.top);
    const left = processPositionValue(pos.left);

    if (top !== undefined) cssVariables.push(`--freeText2-top: ${top}`);
    if (left !== undefined) cssVariables.push(`--freeText2-left: ${left}`);
  }
  if (data.freeText2Style) {
    const style = data.freeText2Style as any;
    if (style.fontSize) cssVariables.push(`--freeText2-size: ${typeof style.fontSize === 'number' ? style.fontSize + 'px' : style.fontSize}`);
    if (style.color) cssVariables.push(`--freeText2-color: ${style.color}`);
    if (style.backgroundColor) cssVariables.push(`--freeText2-bgcolor: ${style.backgroundColor}`);
  }

  // FreeText3 - Check for special position first
  const freeText3SpecialPos = calculateSpecialPosition(
    (data as any).freeText3SpecialPosition,
    (data as any).freeText3SpecialPadding || 8
  );

  if (freeText3SpecialPos) {
    // Use special position
    if (freeText3SpecialPos.top) cssVariables.push(`--freeText3-top: ${freeText3SpecialPos.top}`);
    if (freeText3SpecialPos.left) cssVariables.push(`--freeText3-left: ${freeText3SpecialPos.left}`);
    if (freeText3SpecialPos.right) cssVariables.push(`--freeText3-right: ${freeText3SpecialPos.right}`);
    if (freeText3SpecialPos.bottom) cssVariables.push(`--freeText3-bottom: ${freeText3SpecialPos.bottom}`);
  } else if (data.freeText3Position) {
    // Use manual position
    const pos = data.freeText3Position as any;
    const top = processPositionValue(pos.top);
    const left = processPositionValue(pos.left);

    if (top !== undefined) cssVariables.push(`--freeText3-top: ${top}`);
    if (left !== undefined) cssVariables.push(`--freeText3-left: ${left}`);
  }
  if (data.freeText3Style) {
    const style = data.freeText3Style as any;
    if (style.fontSize) cssVariables.push(`--freeText3-size: ${typeof style.fontSize === 'number' ? style.fontSize + 'px' : style.fontSize}`);
    if (style.color) cssVariables.push(`--freeText3-color: ${style.color}`);
    if (style.backgroundColor) cssVariables.push(`--freeText3-bgcolor: ${style.backgroundColor}`);
  }

  // Text area padding (margins)
  if (data.textPaddingTop !== undefined) cssVariables.push(`--text-padding-top: ${data.textPaddingTop}px`);
  if (data.textPaddingBottom !== undefined) cssVariables.push(`--text-padding-bottom: ${data.textPaddingBottom}px`);
  if (data.textPaddingLeft !== undefined) cssVariables.push(`--text-padding-left: ${data.textPaddingLeft}px`);
  if (data.textPaddingRight !== undefined) cssVariables.push(`--text-padding-right: ${data.textPaddingRight}px`);

  // ===== VERSUS TEMPLATE: Container and layout CSS variables =====
  if (data.containerPaddingTop !== undefined) cssVariables.push(`--container-padding-top: ${data.containerPaddingTop}px`);
  if (data.containerPaddingRight !== undefined) cssVariables.push(`--container-padding-right: ${data.containerPaddingRight}px`);
  if (data.containerPaddingBottom !== undefined) cssVariables.push(`--container-padding-bottom: ${data.containerPaddingBottom}px`);
  if (data.containerPaddingLeft !== undefined) cssVariables.push(`--container-padding-left: ${data.containerPaddingLeft}px`);
  if (data.contentGap !== undefined) cssVariables.push(`--content-gap: ${data.contentGap}px`);
  if (data.imageGap !== undefined) cssVariables.push(`--image-gap: ${data.imageGap}px`);
  if (data.imageBorderRadius !== undefined) cssVariables.push(`--image-border-radius: ${data.imageBorderRadius}px`);

  // ===== VERSUS TEMPLATE: Process 4 corner elements =====
  for (let i = 1; i <= 4; i++) {
    const cornerType = (data as any)[`corner${i}Type`];
    const cornerText = (data as any)[`corner${i}Text`];
    const cornerTextStyle = (data as any)[`corner${i}TextStyle`];
    const cornerBackgroundEnabled = (data as any)[`corner${i}BackgroundEnabled`];
    const cornerSvgContent = (data as any)[`corner${i}SvgContent`];
    const cornerSvgUrl = (data as any)[`corner${i}SvgUrl`];
    const cornerSvgColor = (data as any)[`corner${i}SvgColor`];
    const cornerSvgWidthRaw = (data as any)[`corner${i}SvgWidth`] || 'auto';
    const cornerSvgHeightRaw = (data as any)[`corner${i}SvgHeight`] || 'auto';
    // Parse width/height - if number only, add px; if "auto" or has unit, use as-is
    const cornerSvgWidth = cornerSvgWidthRaw === 'auto' || isNaN(Number(cornerSvgWidthRaw)) ? cornerSvgWidthRaw : `${cornerSvgWidthRaw}px`;
    const cornerSvgHeight = cornerSvgHeightRaw === 'auto' || isNaN(Number(cornerSvgHeightRaw)) ? cornerSvgHeightRaw : `${cornerSvgHeightRaw}px`;
    const cornerSpecialPosition = (data as any)[`corner${i}SpecialPosition`];
    const cornerPaddingX = (data as any)[`corner${i}PaddingX`] ?? 40; // Horizontal padding in pixels
    const cornerPaddingY = (data as any)[`corner${i}PaddingY`] ?? 40; // Vertical padding in pixels

    // Calculate position using pixels
    if (cornerSpecialPosition && cornerSpecialPosition !== 'none') {
      switch (cornerSpecialPosition) {
        case 'top-left':
          cssVariables.push(`--corner${i}-top: ${cornerPaddingY}px`);
          cssVariables.push(`--corner${i}-left: ${cornerPaddingX}px`);
          break;
        case 'top-right':
          cssVariables.push(`--corner${i}-top: ${cornerPaddingY}px`);
          cssVariables.push(`--corner${i}-right: ${cornerPaddingX}px`);
          break;
        case 'bottom-left':
          cssVariables.push(`--corner${i}-bottom: ${cornerPaddingY}px`);
          cssVariables.push(`--corner${i}-left: ${cornerPaddingX}px`);
          break;
        case 'bottom-right':
          cssVariables.push(`--corner${i}-bottom: ${cornerPaddingY}px`);
          cssVariables.push(`--corner${i}-right: ${cornerPaddingX}px`);
          break;
      }
    }

    // Generate content based on type
    if (cornerType === 'none' || !cornerType) {
      (data as any)[`corner${i}Content`] = '';
    } else if (cornerType === 'svg') {
      // SVG - use URL or content
      if (cornerSvgUrl && cornerSvgUrl !== 'none' && !cornerSvgContent) {
        let svgUrl = cornerSvgUrl;
        // Convert relative URLs to absolute
        if (!svgUrl.startsWith('http://') && !svgUrl.startsWith('https://')) {
          if (svgUrl.startsWith('/')) {
            svgUrl = `${baseUrl}${svgUrl}`;
          } else {
            svgUrl = `${baseUrl}/logos/${svgUrl}`;
          }
        }
        const colorFilter = convertColorToFilter(cornerSvgColor || '');
        const filterStyle = colorFilter !== 'none' ? `filter: ${colorFilter};` : '';
        (data as any)[`corner${i}Content`] = `<img src="${svgUrl}" style="width: ${cornerSvgWidth}; height: ${cornerSvgHeight}; object-fit: contain; ${filterStyle}" />`;
      } else {
        (data as any)[`corner${i}Content`] = cornerSvgContent || '';
      }
      if (cornerSvgColor) cssVariables.push(`--corner${i}-svg-color: ${cornerSvgColor}`);
    } else {
      // Text - apply style
      let styleCSS = '';
      if (cornerTextStyle && typeof cornerTextStyle === 'object') {
        const styleObj = cornerTextStyle as any;
        if (styleObj.fontFamily) styleCSS += `font-family: ${styleObj.fontFamily}; `;
        if (styleObj.fontSize) styleCSS += `font-size: ${styleObj.fontSize}; `;
        if (styleObj.fontWeight) styleCSS += `font-weight: ${styleObj.fontWeight}; `;
        if (styleObj.color) styleCSS += `color: ${styleObj.color}; `;
        // Only apply background when enabled
        if (cornerBackgroundEnabled) {
          if (styleObj.backgroundColor) styleCSS += `background-color: ${styleObj.backgroundColor}; `;
          if (styleObj.padding) styleCSS += `padding: ${styleObj.padding}; `;
        }
        if (styleObj.textAlign) styleCSS += `text-align: ${styleObj.textAlign}; `;
        if (styleObj.lineHeight) styleCSS += `line-height: ${styleObj.lineHeight}; `;
        if (styleObj.letterSpacing) styleCSS += `letter-spacing: ${styleObj.letterSpacing}; `;
        if (styleObj.textTransform) styleCSS += `text-transform: ${styleObj.textTransform}; `;
        if (styleObj.textDecoration && styleObj.textDecoration !== 'none') styleCSS += `text-decoration: ${styleObj.textDecoration}; `;
        if (styleObj.textShadow) styleCSS += `text-shadow: ${styleObj.textShadow}; `;
      }
      (data as any)[`corner${i}Content`] = styleCSS ? `<span style="${styleCSS}">${cornerText || ''}</span>` : (cornerText || '');
    }
  }

  // ===== OPENLOOP TEMPLATE: Text box styling =====
  // Text 1 box (open loop - top)
  if ((data as any).text1BoxHeight !== undefined) cssVariables.push(`--text1-box-height: ${(data as any).text1BoxHeight}px`);
  if ((data as any).text1BoxBackgroundColor) cssVariables.push(`--text1-bg-color: ${(data as any).text1BoxBackgroundColor}`);
  if ((data as any).text1Style) {
    const style = (data as any).text1Style;
    if (style.fontFamily) cssVariables.push(`--text1-font-family: ${style.fontFamily}`);
    if (style.fontSize) cssVariables.push(`--text1-font-size: ${style.fontSize}`);
    if (style.fontWeight) cssVariables.push(`--text1-font-weight: ${style.fontWeight}`);
    if (style.color) cssVariables.push(`--text1-color: ${style.color}`);
    if (style.textAlign) cssVariables.push(`--text1-text-align: ${style.textAlign}`);
    if (style.textTransform) cssVariables.push(`--text1-text-transform: ${style.textTransform}`);
    if (style.lineHeight) cssVariables.push(`--text1-line-height: ${style.lineHeight}`);
    if (style.padding) cssVariables.push(`--text1-padding: ${style.padding}`);
  }

  // Text 2 box (resto do titulo - bottom)
  if ((data as any).text2BoxHeight !== undefined) cssVariables.push(`--text2-box-height: ${(data as any).text2BoxHeight}px`);
  if ((data as any).text2BoxBackgroundColor) cssVariables.push(`--text2-bg-color: ${(data as any).text2BoxBackgroundColor}`);
  if ((data as any).text2Style) {
    const style = (data as any).text2Style;
    if (style.fontFamily) cssVariables.push(`--text2-font-family: ${style.fontFamily}`);
    if (style.fontSize) cssVariables.push(`--text2-font-size: ${style.fontSize}`);
    if (style.fontWeight) cssVariables.push(`--text2-font-weight: ${style.fontWeight}`);
    if (style.color) cssVariables.push(`--text2-color: ${style.color}`);
    if (style.textAlign) cssVariables.push(`--text2-text-align: ${style.textAlign}`);
    if (style.textTransform) cssVariables.push(`--text2-text-transform: ${style.textTransform}`);
    if (style.lineHeight) cssVariables.push(`--text2-line-height: ${style.lineHeight}`);
    if (style.padding) cssVariables.push(`--text2-padding: ${style.padding}`);
  }

  // Store CSS variables string in data (with trailing semicolon)
  data.styleVariables = cssVariables.length > 0 ? cssVariables.join('; ') + ';' : '';
  console.log('Built CSS variables:', data.styleVariables);

  // ===== STEP 2: Default Values for Stack Template =====
  // Set default values for optional card properties
  if (data.cardWidth === undefined) data.cardWidth = 90;
  if (data.cardHeight === undefined) data.cardHeight = 90;
  if (data.cardBorderRadius === undefined) data.cardBorderRadius = 20;
  if (data.textGap === undefined) data.textGap = 20;
  if (data.contentImageBorderRadius === undefined) data.contentImageBorderRadius = 12;

  // Set default for text vertical alignment
  if (!data.textVerticalAlign) data.textVerticalAlign = 'bottom';

  // Map textVerticalAlign to CSS justify-content value
  const alignmentMap = {
    'top': 'flex-start',
    'center': 'center',
    'bottom': 'flex-end'
  };
  data.textVerticalJustify = alignmentMap[data.textVerticalAlign as 'top' | 'center' | 'bottom'] || 'flex-end';

  // Ensure cardBackgroundColor has a default
  if (!data.cardBackgroundColor) data.cardBackgroundColor = 'rgba(255, 255, 255, 0.1)';

  // Apply card background type switch (color vs image)
  if (!data.cardBackgroundType) data.cardBackgroundType = 'color';

  if (data.cardBackgroundType === 'color') {
    // Use color, clear image
    data.cardBackgroundImage = '';
  } else if (data.cardBackgroundType === 'image') {
    // Use image, set color to transparent (if image is provided)
    if (data.cardBackgroundImage) {
      data.cardBackgroundColor = 'transparent';
    }
  }

  // Apply viewport background type switch (color vs image)
  // This controls whether the viewport uses a solid color or background image
  // Auto-detect: if viewportBackgroundImage exists but type not set, default to 'image'
  if (!data.viewportBackgroundType) {
    data.viewportBackgroundType = data.viewportBackgroundImage ? 'image' : 'color';
  }

  if (data.viewportBackgroundType === 'color') {
    // Use color, clear image
    data.viewportBackgroundImage = '';
    // Use viewportBackgroundColor if provided, otherwise fallback to backgroundColor
    if (!data.viewportBackgroundColor) {
      data.viewportBackgroundColor = data.backgroundColor || '#FF5722';
    }
  } else if (data.viewportBackgroundType === 'image') {
    // Use image, can set color to transparent
    if (data.viewportBackgroundImage) {
      data.viewportBackgroundColor = 'transparent';
    } else {
      // If no image provided, fallback to color mode
      data.viewportBackgroundColor = data.backgroundColor || '#FF5722';
    }
  }

  // Set default for customCardContainerStyles (empty if not provided)
  if (!data.customCardContainerStyles) data.customCardContainerStyles = '';

  // Set default for customContentImageSectionStyles (empty if not provided)
  if (!data.customContentImageSectionStyles) data.customContentImageSectionStyles = '';

  // Set contentImageUrl (for content-image in stack template)
  // Check if contentImageUrl is already provided (from form)
  if (!data.contentImageUrl || data.contentImageUrl === '') {
    // If not, try to get from contentImage field
    if (data.contentImage) {
      if (data.contentImage.startsWith('http://') || data.contentImage.startsWith('https://') || data.contentImage.startsWith('/')) {
        data.contentImageUrl = data.contentImage;
      } else {
        const sanitizedFilename = path.basename(data.contentImage);
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        data.contentImageUrl = `${baseUrl}/images/${sanitizedFilename}`;
      }
    } else {
      data.contentImageUrl = '';
    }
  }

  console.log('[Content Image] contentImageUrl:', data.contentImageUrl);
  console.log('[Content Image] hideContentImage:', data.hideContentImage);

  // Control content-image-section display (hide when empty or hideContentImage flag is true)
  if (data.hideContentImage || !data.contentImageUrl || data.contentImageUrl === '') {
    data.contentImageDisplay = 'none';
    console.log('[Content Image] Display: NONE (hidden or empty)');
  } else {
    data.contentImageDisplay = 'block';
    console.log('[Content Image] Display: BLOCK');
  }

  // ===== STEP 3: Process Card Gradient Overlay =====
  console.log('\n========== DEBUG CARD GRADIENT ==========');
  console.log('data.cardGradientOverlay:', data.cardGradientOverlay);
  console.log('Type:', typeof data.cardGradientOverlay);

  if (data.cardGradientOverlay && typeof data.cardGradientOverlay === 'object' && data.cardGradientOverlay.enabled) {
    console.log('✓ Card gradient ENABLED!');
    const gradient = data.cardGradientOverlay;
    const {
      color = '#000000',
      startOpacity = 0.7,
      midOpacity = 0.4,
      height = 60,
      direction = 'to top'
    } = gradient;

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(color);
    const midPoint = Math.round(height / 2);

    // Generate CSS linear-gradient
    const gradientCSS = `linear-gradient(${direction}, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${startOpacity}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${midOpacity}) ${midPoint}%, transparent ${height}%)`;

    data.cardGradientCSS = gradientCSS;
    data.cardGradientDisplay = 'block';

    console.log('Card gradient CSS:', gradientCSS);
  } else {
    data.cardGradientCSS = 'none';
    data.cardGradientDisplay = 'none';
  }

  // ===== STEP 3.5: Process Viewport Gradient Overlay (fitfeed-capa) =====
  console.log('\n========== DEBUG VIEWPORT GRADIENT ==========');
  console.log('data.viewportGradientOverlay:', data.viewportGradientOverlay);
  console.log('Type:', typeof data.viewportGradientOverlay);

  if (data.viewportGradientOverlay && typeof data.viewportGradientOverlay === 'object' && data.viewportGradientOverlay.enabled) {
    console.log('✓ Viewport gradient ENABLED!');
    const gradient = data.viewportGradientOverlay;
    const {
      color = '#000000',
      startOpacity = 0.7,
      midOpacity = 0.4,
      height = 60,
      direction = 'to top'
    } = gradient;

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(color);
    const midPoint = Math.round(height / 2);

    // Generate CSS linear-gradient
    const gradientCSS = `linear-gradient(${direction}, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${startOpacity}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${midOpacity}) ${midPoint}%, transparent ${height}%)`;

    data.viewportGradientCSS = gradientCSS;
    data.viewportGradientDisplay = 'block';

    console.log('Viewport gradient CSS:', gradientCSS);
  } else {
    data.viewportGradientCSS = 'none';
    data.viewportGradientDisplay = 'none';
  }

  // ===== STEP 4: Process "No Card" Mode =====
  // When useCard is false, transform the layout to display image as viewport background
  if (data.useCard === false) {
    console.log('\n========== NO CARD MODE ACTIVATED ==========');

    // Note: contentImageUrl stays separate - NOT moved to viewport background
    // The three image variables are independent: viewportBackgroundImage, cardBackgroundImage, contentImageUrl

    // Make card "invisible" - 100% size, transparent, no border
    console.log('✓ Making card transparent and fullscreen');
    data.cardWidth = 100;
    data.cardHeight = 100;
    data.cardBackgroundColor = 'transparent';
    data.cardBackgroundImage = '';
    data.cardBorderRadius = 0;

    // Keep padding for text readability but remove card styling
    data.customCardContainerStyles = 'padding: 60px; background: none;';

    // Content image visibility is already determined in STEP 2 (lines 496-502)
    // based on hideContentImage flag and contentImageUrl presence
    // We no longer force hide it in no-card mode since images are independent
    console.log('[No Card Mode] Content image display:', data.contentImageDisplay);

    // Move card gradient to viewport if enabled
    if (data.cardGradientOverlay && typeof data.cardGradientOverlay === 'object' && data.cardGradientOverlay.enabled) {
      console.log('✓ Moving card gradient to viewport');
      const cardGradCSS = data.cardGradientCSS;

      // Add card gradient to viewport gradientBackground
      if (data.gradientBackground && data.gradientBackground !== 'none') {
        // Combine with existing gradient
        data.gradientBackground = `${cardGradCSS}, ${data.gradientBackground}`;
      } else {
        // Use card gradient as viewport gradient
        data.gradientBackground = cardGradCSS;
      }

      // Disable card gradient display
      data.cardGradientDisplay = 'none';
      console.log('Viewport gradient:', data.gradientBackground);
    }

    console.log('========== NO CARD MODE SETUP COMPLETE ==========\n');
  }

  // Processa background (cor ou imagem)
  // Use viewportBackgroundColor if set, otherwise fallback to backgroundColor
  if (data.viewportBackgroundColor) {
    data.backgroundColor = data.viewportBackgroundColor;
  } else if (!data.backgroundColor) {
    data.backgroundColor = '#FF5722'; // cor padrão
  }

  // Process viewportBackgroundImage for CSS (new variable, separate from contentImageUrl)
  if (data.viewportBackgroundImage) {
    data.backgroundImageUrl = `url('${data.viewportBackgroundImage}')`;
  } else {
    data.backgroundImageUrl = 'none';
  }

  // Legacy support: if old backgroundImage is used but viewportBackgroundImage is not set
  if (!data.viewportBackgroundImage && data.backgroundImage) {
    data.backgroundImageUrl = `url('${data.backgroundImage}')`;
    console.warn('⚠ Using legacy backgroundImage - consider migrating to viewportBackgroundImage');
  }

  // Logo image URL processing (simple approach like backgroundImage)
  if (data.logoImage) {
    // Check if it's already a full URL
    if (data.logoImage.startsWith('http://') || data.logoImage.startsWith('https://')) {
      // Use URL directly - no modification
      data.logoImageUrl = data.logoImage;
    } else if (data.logoImage.startsWith('/')) {
      // Absolute path - use as-is
      data.logoImageUrl = data.logoImage;
    } else {
      // Relative filename - assume it's in /logos/ directory
      // Use basename for security (prevent path traversal)
      const sanitizedFilename = path.basename(data.logoImage);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      data.logoImageUrl = `${baseUrl}/logos/${sanitizedFilename}`;
    }

    // Clear text logo when image logo is provided
    if (!data.logo) {
      data.logo = '';
    }

    // Processar posição do logo - consolidar em string única de estilos
    const logoPositionStyles: string[] = [];

    if (data.logoPosition) {
      const { x, y } = data.logoPosition;

      // Processar posição X
      if (typeof x === 'string') {
        const validPositions = ['left', 'center', 'right'];
        if (validPositions.includes(x)) {
          if (x === 'right') {
            logoPositionStyles.push('right: 60px');
          } else if (x === 'left') {
            logoPositionStyles.push('left: 60px');
          } else { // center
            logoPositionStyles.push('left: 50%');
            logoPositionStyles.push('transform: translateX(-50%)');
          }
        } else if (/^\d+$/.test(x)) {
          // Handle numeric strings like '100'
          logoPositionStyles.push(`left: ${x}px`);
        } else {
          logoPositionStyles.push('left: 50%');
          logoPositionStyles.push('transform: translateX(-50%)');
        }
      } else if (typeof x === 'number') {
        // Handle numeric values like 100
        logoPositionStyles.push(`left: ${x}px`);
      } else {
        logoPositionStyles.push('left: 50%');
        logoPositionStyles.push('transform: translateX(-50%)');
      }

      // Processar posição Y
      if (typeof y === 'string') {
        const validPositions = ['top', 'center', 'bottom'];
        if (validPositions.includes(y)) {
          if (y === 'bottom') {
            logoPositionStyles.push('bottom: 40px');
          } else if (y === 'top') {
            logoPositionStyles.push('top: 40px');
          } else { // center
            logoPositionStyles.push('top: 50%');
            // Se já tem translateX, combinar transforms
            const hasTranslateX = logoPositionStyles.some(s => s.includes('translateX'));
            if (hasTranslateX) {
              // Substituir transform anterior
              const index = logoPositionStyles.findIndex(s => s.startsWith('transform:'));
              logoPositionStyles[index] = 'transform: translate(-50%, -50%)';
            } else {
              logoPositionStyles.push('transform: translateY(-50%)');
            }
          }
        } else if (/^\d+$/.test(y)) {
          // Handle numeric strings like '100'
          logoPositionStyles.push(`top: ${y}px`);
        } else {
          logoPositionStyles.push('top: 40px');
        }
      } else if (typeof y === 'number') {
        // Handle numeric values like 100
        logoPositionStyles.push(`top: ${y}px`);
      } else {
        logoPositionStyles.push('top: 40px');
      }
    } else {
      // Posições padrão
      logoPositionStyles.push('left: 50%');
      logoPositionStyles.push('top: 40px');
      logoPositionStyles.push('transform: translateX(-50%)');
    }

    // Processar tamanho do logo
    if (data.logoSize) {
      if (data.logoSize.width) logoPositionStyles.push(`width: ${data.logoSize.width}px`);
      if (data.logoSize.height) logoPositionStyles.push(`height: ${data.logoSize.height}px`);
    }

    // Processar cor do logo (CSS filter para SVGs)
    if (data.logoColor) {
      const logoFilter = convertColorToFilter(data.logoColor);
      if (logoFilter !== 'none') {
        logoPositionStyles.push(`filter: ${logoFilter}`);
      }
    }

    // Consolidar tudo em uma única string
    data.logoPositionStyles = logoPositionStyles.join('; ');

    console.log('Final processed logo styles:', {
      logoImageUrl: data.logoImageUrl,
      logoPositionStyles: data.logoPositionStyles
    });
  } else if (data.logoImageUrl) {
    // FitFeed-capa style: logoImageUrl provided directly
    // Convert to absolute URL if needed
    if (!data.logoImageUrl.startsWith('http://') && !data.logoImageUrl.startsWith('https://')) {
      if (data.logoImageUrl.startsWith('/')) {
        // Absolute path - convert to full URL
        data.logoImageUrl = `${baseUrl}${data.logoImageUrl}`;
      } else {
        // Relative filename - assume it's in /logos/ directory
        const sanitizedFilename = path.basename(data.logoImageUrl);
        data.logoImageUrl = `${baseUrl}/logos/${sanitizedFilename}`;
      }
    }

    // Process using special position system (like freeTexts/SVGs)
    const logoPositionStyles: string[] = [];
    const dataAny = data as any;

    // Check for special position first
    const logoSpecialPos = calculateSpecialPosition(
      dataAny.logoImageSpecialPosition,
      dataAny.logoImageSpecialPadding || 5
    );

    if (logoSpecialPos) {
      // Use special position
      if (logoSpecialPos.top) logoPositionStyles.push(`top: ${logoSpecialPos.top}`);
      if (logoSpecialPos.left) logoPositionStyles.push(`left: ${logoSpecialPos.left}`);
      if (logoSpecialPos.right) logoPositionStyles.push(`right: ${logoSpecialPos.right}`);
      if (logoSpecialPos.bottom) logoPositionStyles.push(`bottom: ${logoSpecialPos.bottom}`);
    } else if (dataAny.logoImagePosition) {
      // Use manual position
      const pos = dataAny.logoImagePosition;
      const top = processPositionValue(pos.top);
      const left = processPositionValue(pos.left);
      if (top) logoPositionStyles.push(`top: ${top}`);
      if (left) logoPositionStyles.push(`left: ${left}`);
    }

    // Process size
    if (dataAny.logoImagePosition) {
      const pos = dataAny.logoImagePosition;
      const width = processPositionValue(pos.width);
      const height = processPositionValue(pos.height);
      if (width) logoPositionStyles.push(`width: ${width}`);
      if (height) logoPositionStyles.push(`height: ${height}`);
    }

    // Process logo color (CSS filter for SVGs)
    if (dataAny.logoColor) {
      const logoFilter = convertColorToFilter(dataAny.logoColor);
      if (logoFilter !== 'none') {
        logoPositionStyles.push(`filter: ${logoFilter}`);
      }
    }

    // Consolidate everything into a single string
    data.logoPositionStyles = logoPositionStyles.join('; ');
    // Set empty classes (not used with special position system)
    data.logoPositionXClass = '';
    data.logoPositionYClass = '';

    console.log('Final processed logo styles (fitfeed-capa):', {
      logoImageUrl: data.logoImageUrl,
      logoPositionStyles: data.logoPositionStyles
    });
  } else {
    // Sem logo - usar valores vazios
    data.logoImageUrl = '';
    data.logoPositionStyles = '';
    data.logoPositionXClass = '';
    data.logoPositionYClass = '';
  }

  // Arrow image URL processing (same logic as logo)
  if (data.arrowImage) {
    // Check if it's already a full URL
    if (data.arrowImage.startsWith('http://') || data.arrowImage.startsWith('https://')) {
      // Use URL directly - no modification
      data.arrowImageUrl = data.arrowImage;
    } else if (data.arrowImage.startsWith('/')) {
      // Absolute path - use as-is
      data.arrowImageUrl = data.arrowImage;
    } else {
      // Relative filename - assume it's in /logos/ directory (same as logo images)
      // Use basename for security (prevent path traversal)
      const sanitizedFilename = path.basename(data.arrowImage);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      data.arrowImageUrl = `${baseUrl}/logos/${sanitizedFilename}`;
    }

    // Processar posição da seta - consolidar em string única de estilos
    const arrowPositionStyles: string[] = [];

    if (data.arrowPosition) {
      const { x, y } = data.arrowPosition;

      // Processar posição X
      if (typeof x === 'string') {
        const validPositions = ['left', 'center', 'right'];
        if (validPositions.includes(x)) {
          if (x === 'right') {
            arrowPositionStyles.push('right: 60px');
          } else if (x === 'left') {
            arrowPositionStyles.push('left: 60px');
          } else { // center
            arrowPositionStyles.push('left: 50%');
            arrowPositionStyles.push('transform: translateX(-50%)');
          }
        } else if (/^\d+$/.test(x)) {
          // Handle numeric strings like '100'
          arrowPositionStyles.push(`left: ${x}px`);
        } else {
          arrowPositionStyles.push('left: 50%');
          arrowPositionStyles.push('transform: translateX(-50%)');
        }
      } else if (typeof x === 'number') {
        // Handle numeric values like 100
        arrowPositionStyles.push(`left: ${x}px`);
      } else {
        arrowPositionStyles.push('left: 50%');
        arrowPositionStyles.push('transform: translateX(-50%)');
      }

      // Processar posição Y
      if (typeof y === 'string') {
        const validPositions = ['top', 'center', 'bottom'];
        if (validPositions.includes(y)) {
          if (y === 'bottom') {
            arrowPositionStyles.push('bottom: 50px');
          } else if (y === 'top') {
            arrowPositionStyles.push('top: 40px');
          } else { // center
            arrowPositionStyles.push('top: 50%');
            // Se já tem translateX, combinar transforms
            const hasTranslateX = arrowPositionStyles.some(s => s.includes('translateX'));
            if (hasTranslateX) {
              // Substituir transform anterior
              const index = arrowPositionStyles.findIndex(s => s.startsWith('transform:'));
              arrowPositionStyles[index] = 'transform: translate(-50%, -50%)';
            } else {
              arrowPositionStyles.push('transform: translateY(-50%)');
            }
          }
        } else if (/^\d+$/.test(y)) {
          // Handle numeric strings like '100'
          arrowPositionStyles.push(`top: ${y}px`);
        } else {
          arrowPositionStyles.push('top: 50%');
          arrowPositionStyles.push('transform: translateY(-50%)');
        }
      } else if (typeof y === 'number') {
        // Handle numeric values like 100
        arrowPositionStyles.push(`top: ${y}px`);
      } else {
        arrowPositionStyles.push('top: 50%');
        arrowPositionStyles.push('transform: translateY(-50%)');
      }
    } else {
      // Posições padrão (bottom-left para não colidir com bottomText)
      arrowPositionStyles.push('left: 60px');
      arrowPositionStyles.push('bottom: 50px');
    }

    // Processar tamanho da seta
    if (data.arrowSize) {
      if (data.arrowSize.width) arrowPositionStyles.push(`width: ${data.arrowSize.width}px`);
      if (data.arrowSize.height) arrowPositionStyles.push(`height: ${data.arrowSize.height}px`);
    }

    // Processar cor da seta (CSS filter para SVGs)
    if (data.arrowColor) {
      const arrowFilter = convertColorToFilter(data.arrowColor);
      if (arrowFilter !== 'none') {
        arrowPositionStyles.push(`filter: ${arrowFilter}`);
      }
    }

    // Consolidar tudo em uma única string
    data.arrowPositionStyles = arrowPositionStyles.join('; ');

    console.log('Final processed arrow styles:', {
      arrowImageUrl: data.arrowImageUrl,
      arrowPositionStyles: data.arrowPositionStyles
    });
  } else if (data.arrowImageUrl) {
    // FitFeed-capa style: arrowImageUrl provided directly
    // Convert to absolute URL if needed
    if (!data.arrowImageUrl.startsWith('http://') && !data.arrowImageUrl.startsWith('https://')) {
      if (data.arrowImageUrl.startsWith('/')) {
        // Absolute path - convert to full URL
        data.arrowImageUrl = `${baseUrl}${data.arrowImageUrl}`;
      } else {
        // Relative filename - assume it's in /logos/ directory
        const sanitizedFilename = path.basename(data.arrowImageUrl);
        data.arrowImageUrl = `${baseUrl}/logos/${sanitizedFilename}`;
      }
    }

    // Process using WRAPPER approach: arrow + bottomText in same container
    const dataAny = data as any;

    // ===== 1. WRAPPER STYLES (position of the whole group) =====
    const wrapperStyles: string[] = [];

    // Check for special position first
    const arrowSpecialPos = calculateSpecialPosition(
      dataAny.arrowImageSpecialPosition,
      dataAny.arrowImageSpecialPadding || 6
    );

    if (arrowSpecialPos) {
      // Use special position for wrapper
      if (arrowSpecialPos.top) wrapperStyles.push(`top: ${arrowSpecialPos.top}`);
      if (arrowSpecialPos.left) wrapperStyles.push(`left: ${arrowSpecialPos.left}`);
      if (arrowSpecialPos.right) wrapperStyles.push(`right: ${arrowSpecialPos.right}`);
      if (arrowSpecialPos.bottom) wrapperStyles.push(`bottom: ${arrowSpecialPos.bottom}`);
    } else if (dataAny.arrowImagePosition) {
      // Use manual position for wrapper
      const pos = dataAny.arrowImagePosition;
      const top = processPositionValue(pos.top);
      const left = processPositionValue(pos.left);
      if (top) wrapperStyles.push(`top: ${top}`);
      if (left) wrapperStyles.push(`left: ${left}`);
    } else {
      // Default: bottom-right
      wrapperStyles.push('right: 6%');
      wrapperStyles.push('bottom: 6%');
    }

    // Width goes on wrapper (arrow fills 100% of wrapper)
    if (dataAny.arrowImagePosition) {
      const pos = dataAny.arrowImagePosition;
      const width = processPositionValue(pos.width);
      if (width) wrapperStyles.push(`width: ${width}`);
    }

    data.arrowWrapperStyles = wrapperStyles.join('; ');

    // ===== 2. ARROW IMAGE STYLES (color only - size is 100% of wrapper) =====
    const arrowImageStyles: string[] = [];

    // Process arrow color (CSS filter for SVGs)
    if (dataAny.arrowColor) {
      const arrowFilter = convertColorToFilter(dataAny.arrowColor);
      if (arrowFilter !== 'none') {
        arrowImageStyles.push(`filter: ${arrowFilter}`);
      }
    }

    data.arrowImageStyles = arrowImageStyles.join('; ');

    // Keep legacy fields for backwards compatibility
    data.arrowPositionStyles = wrapperStyles.join('; ');
    data.arrowPositionXClass = '';
    data.arrowPositionYClass = '';

    console.log('Final processed arrow styles (fitfeed-capa):', {
      arrowImageUrl: data.arrowImageUrl,
      arrowPositionStyles: data.arrowPositionStyles
    });

    // Calculate title padding-bottom based on arrow position
    // Title should be 20px above the arrow when it's present
    console.log('\n========== DEBUG TITLE PADDING CALCULATION ==========');
    console.log('Arrow data available:', {
      hasArrowSpecialPos: !!arrowSpecialPos,
      arrowSpecialPos: arrowSpecialPos,
      hasArrowImagePosition: !!dataAny.arrowImagePosition,
      arrowImagePosition: dataAny.arrowImagePosition
    });

    let titlePaddingBottom = '60px'; // Default padding

    try {
      let arrowBottom: number | null = null;
      let arrowHeight: number | null = null;

      // Extract bottom position from arrow styles
      console.log('Step 1: Extracting arrow bottom position...');
      if (arrowSpecialPos && arrowSpecialPos.bottom) {
        console.log('  → Using arrowSpecialPos.bottom:', arrowSpecialPos.bottom);
        // Parse percentage or pixel value
        const bottomMatch = arrowSpecialPos.bottom.match(/^(\d+(?:\.\d+)?)(px|%)?$/);
        console.log('  → Bottom match:', bottomMatch);
        if (bottomMatch) {
          arrowBottom = parseFloat(bottomMatch[1]);
          console.log('  → Parsed bottom value:', arrowBottom, 'unit:', bottomMatch[2] || 'none');
          // Convert percentage to pixels (card height is 90% of 1440px by default = 1296px)
          if (bottomMatch[2] === '%') {
            arrowBottom = (arrowBottom / 100) * 1296; // Approximate card height
            console.log('  → Converted to pixels:', arrowBottom);
          }
        }
      } else if (dataAny.arrowImagePosition && dataAny.arrowImagePosition.bottom !== undefined) {
        console.log('  → Using arrowImagePosition.bottom:', dataAny.arrowImagePosition.bottom);
        const bottomValue = processPositionValue(dataAny.arrowImagePosition.bottom);
        console.log('  → Processed bottom value:', bottomValue);
        if (bottomValue) {
          const bottomMatch = bottomValue.match(/^(\d+(?:\.\d+)?)(px|%)?$/);
          console.log('  → Bottom match:', bottomMatch);
          if (bottomMatch) {
            arrowBottom = parseFloat(bottomMatch[1]);
            if (bottomMatch[2] === '%') {
              arrowBottom = (arrowBottom / 100) * 1296;
            }
            console.log('  → Final bottom value:', arrowBottom);
          }
        }
      } else {
        console.log('  → No bottom position found');
      }

      // Extract height from arrow styles
      console.log('Step 2: Extracting arrow height...');
      if (dataAny.arrowImagePosition && dataAny.arrowImagePosition.height !== undefined) {
        console.log('  → Using arrowImagePosition.height:', dataAny.arrowImagePosition.height);
        const heightValue = processPositionValue(dataAny.arrowImagePosition.height);
        console.log('  → Processed height value:', heightValue);
        if (heightValue) {
          const heightMatch = heightValue.match(/^(\d+(?:\.\d+)?)(px|%)?$/);
          console.log('  → Height match:', heightMatch);
          if (heightMatch) {
            arrowHeight = parseFloat(heightMatch[1]);
            if (heightMatch[2] === '%') {
              arrowHeight = (arrowHeight / 100) * 1296;
            }
            console.log('  → Final height value:', arrowHeight);
          }
        }
      } else {
        console.log('  → No height found in arrowImagePosition');
      }

      // Calculate final padding: arrow bottom + arrow height + 20px gap
      console.log('Step 3: Calculating final padding...');
      console.log('  → arrowBottom:', arrowBottom);
      console.log('  → arrowHeight:', arrowHeight);
      if (arrowBottom !== null && arrowHeight !== null) {
        const totalPadding = arrowBottom + arrowHeight + 20;
        titlePaddingBottom = `${totalPadding}px`;
        console.log('  ✓ SUCCESS: Calculated title padding-bottom:', {
          arrowBottom,
          arrowHeight,
          gap: 20,
          totalPadding: titlePaddingBottom
        });
      } else {
        console.log('  ✗ FAILED: Missing values, using default padding');
      }
    } catch (error) {
      console.error('  ✗ ERROR calculating title padding-bottom:', error);
    }

    data.titleContainerPaddingBottom = titlePaddingBottom;
    console.log('Final titleContainerPaddingBottom:', data.titleContainerPaddingBottom);
    console.log('========================================================\n');
  } else {
    // Sem seta - usar valores vazios
    data.arrowImageUrl = '';
    data.arrowPositionStyles = '';
    data.arrowPositionXClass = '';
    data.arrowPositionYClass = '';
    data.titleContainerPaddingBottom = '60px'; // Default padding when no arrow
  }

  // Bottom text processing (CTA text in red box)
  if (data.bottomText && data.bottomText.trim()) {
    // Processar estilos do texto - consolidar tudo em string única
    const styles: string[] = [];

    // Processar posição do texto
    if (data.bottomTextPosition) {
      const { x, y } = data.bottomTextPosition;

      // Processar posição X
      if (typeof x === 'string') {
        const validPositions = ['left', 'center', 'right'];
        if (validPositions.includes(x)) {
          if (x === 'right') {
            styles.push('right: 20px');
          } else if (x === 'left') {
            styles.push('left: 20px');
          } else { // center
            styles.push('left: 50%');
            styles.push('transform: translateX(-50%)');
          }
        } else if (/^\d+$/.test(x)) {
          // Handle numeric strings like '100'
          styles.push(`left: ${x}px`);
        } else {
          styles.push('right: 20px');
        }
      } else if (typeof x === 'number') {
        // Handle numeric values like 100
        styles.push(`left: ${x}px`);
      } else {
        styles.push('right: 20px');
      }

      // Processar posição Y
      if (typeof y === 'string') {
        const validPositions = ['top', 'center', 'bottom'];
        if (validPositions.includes(y)) {
          if (y === 'bottom') {
            styles.push('bottom: 20px');
          } else if (y === 'top') {
            styles.push('top: 20px');
          } else { // center
            styles.push('top: 50%');
            // Se já tem translateX, combinar transforms
            const hasTranslateX = styles.some(s => s.includes('translateX'));
            if (hasTranslateX) {
              // Substituir transform anterior
              const index = styles.findIndex(s => s.startsWith('transform:'));
              styles[index] = 'transform: translate(-50%, -50%)';
            } else {
              styles.push('transform: translateY(-50%)');
            }
          }
        } else if (/^\d+$/.test(y)) {
          // Handle numeric strings like '100'
          styles.push(`top: ${y}px`);
        } else {
          styles.push('bottom: 20px');
        }
      } else if (typeof y === 'number') {
        // Handle numeric values like 100
        styles.push(`top: ${y}px`);
      } else {
        styles.push('bottom: 20px');
      }
    } else {
      // Posição padrão (bottom-right)
      styles.push('right: 20px');
      styles.push('bottom: 20px');
    }

    // Processar estilos de texto (todos opcionais)
    if (data.bottomTextStyle) {
      const style = data.bottomTextStyle;

      // Background color é opcional
      if (style.backgroundColor) styles.push(`background-color: ${style.backgroundColor}`);
      if (style.color) styles.push(`color: ${style.color}`);
      if (style.fontSize) {
        const fontSize = typeof style.fontSize === 'number' ? `${style.fontSize}px` : style.fontSize;
        styles.push(`font-size: ${fontSize}`);
      }
      if (style.fontFamily) styles.push(`font-family: ${style.fontFamily}`);
      if (style.fontWeight) styles.push(`font-weight: ${style.fontWeight}`);
      if (style.letterSpacing) styles.push(`letter-spacing: ${style.letterSpacing}`);
      if (style.textShadow) styles.push(`text-shadow: ${style.textShadow}`);
    }

    // Adicionar padding e border-radius apenas se backgroundColor fornecido
    if (data.bottomTextPadding) {
      const padding = typeof data.bottomTextPadding === 'number' ? `${data.bottomTextPadding}px` : data.bottomTextPadding;
      styles.push(`padding: ${padding}`);
    } else if (data.bottomTextStyle?.backgroundColor) {
      // Se tem backgroundColor mas não tem padding, adiciona padding padrão
      styles.push(`padding: 12px 24px`);
    }

    // Adicionar border-radius apenas se tem backgroundColor
    if (data.bottomTextStyle?.backgroundColor) {
      styles.push(`border-radius: 4px`);
    }

    data.bottomTextStyles = styles.length > 0 ? styles.join('; ') : '';
    // Set empty classes
    data.bottomTextPositionXClass = '';
    data.bottomTextPositionYClass = '';
  } else if (data.bottomText) {
    // FitFeed-capa/Stack style: bottomText can be in wrapper (flexbox) or absolute positioned
    const styles: string[] = [];
    const dataAny = data as any;

    // Check for special positioning (absolute, outside wrapper behavior)
    const bottomTextSpecialPos = calculateSpecialPosition(
      dataAny.bottomTextSpecialPosition,
      dataAny.bottomTextSpecialPadding || 6
    );

    if (bottomTextSpecialPos) {
      // Use absolute positioning (overrides wrapper flexbox)
      styles.push('position: absolute');
      if (bottomTextSpecialPos.top) styles.push(`top: ${bottomTextSpecialPos.top}`);
      if (bottomTextSpecialPos.left) styles.push(`left: ${bottomTextSpecialPos.left}`);
      if (bottomTextSpecialPos.right) styles.push(`right: ${bottomTextSpecialPos.right}`);
      if (bottomTextSpecialPos.bottom) styles.push(`bottom: ${bottomTextSpecialPos.bottom}`);
      console.log('Bottom text using special position:', bottomTextSpecialPos);
    } else {
      // Use wrapper approach (flexbox child)
      // Padding right (horizontal offset from right edge)
      const paddingRight = dataAny.bottomTextPaddingRight ?? 0;
      if (paddingRight !== 0) {
        styles.push(`padding-right: ${paddingRight}px`);
      }
    }

    // Process text styles
    if (dataAny.bottomTextStyle) {
      const style = dataAny.bottomTextStyle;
      if (style.fontFamily) styles.push(`font-family: ${style.fontFamily}`);
      if (style.fontSize) styles.push(`font-size: ${style.fontSize}`);
      if (style.fontWeight) styles.push(`font-weight: ${style.fontWeight}`);
      if (style.color) styles.push(`color: ${style.color}`);
      if (style.textTransform) styles.push(`text-transform: ${style.textTransform}`);
      if (style.backgroundColor) {
        styles.push(`background-color: ${style.backgroundColor}`);
        styles.push(`padding: 12px 24px`);
        styles.push(`border-radius: 4px`);
      }
    }

    data.bottomTextStyles = styles.length > 0 ? styles.join('; ') : '';
    // Set empty classes (not used with wrapper approach)
    data.bottomTextPositionXClass = '';
    data.bottomTextPositionYClass = '';

    console.log('Final processed bottomText styles:', {
      bottomText: data.bottomText,
      bottomTextStyles: data.bottomTextStyles,
      hasSpecialPosition: !!bottomTextSpecialPos
    });
  } else {
    // Sem texto - usar valores vazios
    data.bottomText = '';
    data.bottomTextStyles = '';
    data.bottomTextPositionXClass = '';
    data.bottomTextPositionYClass = '';
  }

  // ===== STEP 3.6: Generate titleStyleCSS for fitfeed-capa template =====
  // Convert titleStyle object to CSS string that can be used inline
  if (data.titleStyle && typeof data.titleStyle === 'object') {
    console.log('\n========== DEBUG TITLE STYLE CSS ==========');
    console.log('data.titleStyle:', data.titleStyle);

    const titleStyleCSS = stylesToCss(data.titleStyle as TextStyle);
    data.titleStyleCSS = titleStyleCSS;

    console.log('Generated titleStyleCSS:', titleStyleCSS);
  } else {
    data.titleStyleCSS = '';
    console.log('No titleStyle found, titleStyleCSS set to empty string');
  }

  // Processa gradientOverlay
  console.log('\n========== DEBUG GRADIENT OVERLAY ==========');
  console.log('data.gradientOverlay recebido:', data.gradientOverlay);
  console.log('Tipo:', typeof data.gradientOverlay);

  // Detecta se é estrutura nova (com colors array) ou antiga (com enabled)
  const isNewGradientStructure = data.gradientOverlay && typeof data.gradientOverlay === 'object' && 'colors' in data.gradientOverlay;
  const isOldGradientStructure = data.gradientOverlay && typeof data.gradientOverlay === 'object' && 'enabled' in data.gradientOverlay && data.gradientOverlay.enabled;

  if (isNewGradientStructure) {
    console.log('✓ Gradiente ATIVADO (estrutura nova com colors array)!');
    const gradient = data.gradientOverlay as any;
    const {
      direction = 'to top',
      colors = [],
      opacity = 0.5,
      blendMode = 'normal'
    } = gradient;

    console.log('Parâmetros do gradiente (nova estrutura):');
    console.log('  direction:', direction);
    console.log('  colors:', colors);
    console.log('  opacity:', opacity);
    console.log('  blendMode:', blendMode);

    // Converte cor hex para rgb
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Se temos colors array, usa para criar gradiente multi-stop
    if (colors.length >= 2) {
      // Verifica se todas as cores são iguais (gradiente sem transição = overlay sólido)
      const allColorsEqual = colors.every((c: any) => c.color === colors[0].color);

      if (allColorsEqual) {
        // Gradiente de cor única = apenas overlay sólido - ignorar para manter backgroundColor visível
        console.log('⚠ Gradiente com cor única detectado (#' + colors[0].color + ') - ignorando para preservar backgroundColor');
        if (data.viewportBackgroundImage) {
          data.gradientBackground = `url('${data.viewportBackgroundImage}')`;
        } else {
          data.gradientBackground = 'none';
        }
      } else {
        const colorStops = colors.map((c: any) => {
          const rgb = hexToRgb(c.color);
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}) ${c.position}%`;
        }).join(', ');

        const gradientCSS = `linear-gradient(${direction}, ${colorStops})`;
        console.log('Gradiente CSS gerado (multi-stop):', gradientCSS);

        // Combina gradiente + background image
        if (data.viewportBackgroundImage) {
          data.gradientBackground = `${gradientCSS}, url('${data.viewportBackgroundImage}')`;
          console.log('✓ Gradiente COMBINADO com imagem de fundo');
        } else {
          data.gradientBackground = gradientCSS;
          console.log('✓ Apenas gradiente (sem imagem de fundo)');
        }
      }
    } else {
      // Fallback: sem cores suficientes
      console.warn('⚠ Colors array vazio ou insuficiente');
      if (data.viewportBackgroundImage) {
        data.gradientBackground = `url('${data.viewportBackgroundImage}')`;
      } else {
        data.gradientBackground = 'none';
      }
    }

    data.gradientBlur = 'none';
    data.gradientBlurDisplay = 'none';

  } else if (isOldGradientStructure) {
    console.log('✓ Gradiente ATIVADO (estrutura antiga com enabled)!');
    const gradient = data.gradientOverlay as GradientOverlay;
    const {
      color,
      startOpacity,
      midOpacity,
      height,
      direction,
      midPosition,
      blendMode,
      blur
    } = gradient;

    console.log('Parâmetros do gradiente:');
    console.log('  color:', color);
    console.log('  startOpacity:', startOpacity);
    console.log('  midOpacity:', midOpacity);
    console.log('  height:', height);
    console.log('  direction:', direction);

    // Converte cor hex para rgb
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(color || '#000000');
    const gradientHeight = height || 60;

    // Usa midPosition customizado ou calcula baseado na altura
    const midPoint = midPosition !== undefined ? midPosition : Math.round(gradientHeight / 2);

    // Direção do gradiente (padrão: 'to top')
    const gradientDirection = direction || 'to top';

    // Gera CSS do gradiente com direção customizada
    const gradientCSS = `linear-gradient(${gradientDirection}, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${startOpacity || 0.7}) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${midOpacity || 0.4}) ${midPoint}%, transparent ${gradientHeight}%)`;

    console.log('Gradiente CSS gerado:', gradientCSS);

    // Combina gradiente + background image em uma única propriedade
    if (data.viewportBackgroundImage) {
      data.gradientBackground = `${gradientCSS}, url('${data.viewportBackgroundImage}')`;
      console.log('✓ Gradiente COMBINADO com imagem de fundo');
    } else {
      data.gradientBackground = gradientCSS;
      console.log('✓ Apenas gradiente (sem imagem de fundo)');
    }

    // Blur/backdrop-filter (padrão: desabilitado)
    if (blur && blur.enabled) {
      const blurAmount = blur.amount || 10;
      data.gradientBlur = `blur(${blurAmount}px)`;
      data.gradientBlurDisplay = 'block';
      console.log('  blur:', data.gradientBlur);
    } else {
      data.gradientBlur = 'none';
      data.gradientBlurDisplay = 'none';
    }
  } else {
    console.log('✗ Gradiente DESABILITADO ou dados inválidos');
    // Sem gradiente, apenas background image
    if (data.viewportBackgroundImage) {
      data.gradientBackground = `url('${data.viewportBackgroundImage}')`;
    } else {
      data.gradientBackground = 'none';
    }
    data.gradientBlur = 'none';
    data.gradientBlurDisplay = 'none';
  }

  console.log('Valores finais:');
  console.log('  gradientBackground:', data.gradientBackground);
  console.log('  gradientBlur:', data.gradientBlur);
  console.log('============================================\n');

  // ===== STEP 2.9: Generate JSON configurations for JS scripts (MUST be before triple braces processing) =====
  // These configs are used by {{{...}}} placeholders in templates
  const dataAnyEarly = data as any;

  // Bottom Text Positioning Configuration
  const bottomTextConfigEarly = {
    gapFromArrow: dataAnyEarly.bottomTextGapFromArrow ?? 15,
    paddingRight: dataAnyEarly.bottomTextPaddingRight ?? 0
  };
  data.bottomTextPositioningConfig = JSON.stringify(bottomTextConfigEarly);
  console.log('[STEP 2.9] Bottom text positioning config:', bottomTextConfigEarly);

  // Arrow-Content Positioning Configuration (for stack template)
  const arrowContentConfigEarly = {
    gapFromArrow: dataAnyEarly.arrowContentGap ?? 20
  };
  data.arrowContentPositioningConfig = JSON.stringify(arrowContentConfigEarly);
  console.log('[STEP 2.9] Arrow-content positioning config:', arrowContentConfigEarly);

  // Text Fit Configuration (for auto-sizing text to single line)
  if (dataAnyEarly.textFitConfig) {
    data.textFitConfig = JSON.stringify(dataAnyEarly.textFitConfig);
    console.log('[STEP 2.9] Text fit config:', dataAnyEarly.textFitConfig);
  } else {
    // Default: disabled
    data.textFitConfig = JSON.stringify({ enabled: false });
  }

  // ===== STEP 2.95: Process SVG URL to Content (svg1Url -> svg1Content) =====
  // If svg1Url is provided but svg1Content is not, create an img element
  if (data.svg1Url && !data.svg1Content) {
    let svgUrl = data.svg1Url;

    // Convert relative URLs to absolute
    if (!svgUrl.startsWith('http://') && !svgUrl.startsWith('https://')) {
      if (svgUrl.startsWith('/')) {
        svgUrl = `${baseUrl}${svgUrl}`;
      } else {
        const sanitizedFilename = path.basename(svgUrl);
        svgUrl = `${baseUrl}/logos/${sanitizedFilename}`;
      }
    }

    // Create an img element that will be rendered in place of svg1Content
    // The img inherits the color from svg1Color using CSS filter
    const svgColor = data.svg1Color || '#000000';
    const colorFilter = convertColorToFilter(svgColor);
    const filterStyle = colorFilter !== 'none' ? `filter: ${colorFilter};` : '';

    data.svg1Content = `<img src="${svgUrl}" alt="SVG" style="width: 100%; height: 100%; object-fit: contain; ${filterStyle}" />`;
    console.log('[STEP 2.95] Converted svg1Url to svg1Content img element:', svgUrl);
  }

  // ===== STEP 3: Handle Triple Braces for SVG Content (NO HTML ESCAPING) =====
  // Process {{{variable}}} placeholders FIRST (before regular placeholders)
  // These are used for raw SVG/HTML content that should not be escaped
  const tripleBracesRegex = /\{\{\{(\w+)\}\}\}/g;
  processedHtml = processedHtml.replace(tripleBracesRegex, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      console.log(`Triple braces placeholder {{{${key}}}} not found in data, replacing with empty string`);
      return '';
    }
    console.log(`Triple braces placeholder {{{${key}}}} found, injecting RAW content (no escaping)`);
    // Return raw value without any HTML escaping
    return String(value);
  });

  // ===== STEP 4: Process Multiple Text Fields (text1-text5) =====
  // These text fields support rich text with styledChunks
  // We need to process them before the general placeholder replacement
  const textFieldKeys = ['text1', 'text2', 'text3', 'text4', 'text5'];
  textFieldKeys.forEach(textKey => {
    const textValue = data[textKey];
    const styleKey = `${textKey}Style`;
    const chunksKey = `${textKey}StyledChunks`;
    const textStyle = data[styleKey];
    const styledChunks = data[chunksKey];

    if (textValue !== undefined && textValue !== null) {
      // Text field can be:
      // 1. Simple string
      // 2. Object with styledChunks (rich text)
      // 3. String with inline syntax [text|styles]
      // 4. String with separate styledChunks field
      // 5. Already processed HTML from route.ts (should NOT re-process)

      let processedText = '';

      // IMPORTANT: Check if text already contains HTML (was processed by route.ts)
      // If so, use it as-is to prevent double processing and HTML escaping issues
      if (typeof textValue === 'string' && containsHTML(textValue)) {
        console.log(`${textKey} already contains HTML (processed by route.ts), using as-is`);
        processedText = textValue;
      } else if (typeof textValue === 'string' && styledChunks && Array.isArray(styledChunks) && styledChunks.length > 0) {
        // Check if there are styled chunks in a separate field
        // Combine text with styled chunks and process using processTextField
        const combinedField = {
          text: textValue,
          styledChunks: styledChunks
        };
        // Convert textStyle to ParentStyles format
        const parentStyles = textStyle && typeof textStyle === 'object' ? {
          color: (textStyle as any).color,
          fontSize: (textStyle as any).fontSize,
          fontFamily: (textStyle as any).fontFamily,
          fontWeight: (textStyle as any).fontWeight,
          textAlign: (textStyle as any).textAlign,
          lineHeight: (textStyle as any).lineHeight,
          letterSpacing: (textStyle as any).letterSpacing,
        } : undefined;
        processedText = processTextField(combinedField, parentStyles);
      } else if (typeof textValue === 'string') {
        // Simple string - apply processStyledText with optional style
        const styleString = textStyle && typeof textStyle === 'object' ? stylesToCss(textStyle as TextStyle) : undefined;
        processedText = processStyledText(textValue, styleString);
      } else if (typeof textValue === 'object' && textValue.styledChunks && Array.isArray(textValue.styledChunks)) {
        // Rich text with styledChunks as object property
        const parentStyles = textStyle && typeof textStyle === 'object' ? {
          color: (textStyle as any).color,
          fontSize: (textStyle as any).fontSize,
          fontFamily: (textStyle as any).fontFamily,
          fontWeight: (textStyle as any).fontWeight,
          textAlign: (textStyle as any).textAlign,
          lineHeight: (textStyle as any).lineHeight,
          letterSpacing: (textStyle as any).letterSpacing,
        } : undefined;
        processedText = processTextField(textValue, parentStyles);
      } else {
        processedText = String(textValue);
      }

      // Replace the placeholder in HTML
      // IMPORTANT: Use callback function to avoid $ special character issues in replacement string
      const placeholder = `{{${textKey}}}`;
      processedHtml = processedHtml.replace(
        new RegExp(placeholder, 'g'),
        () => processedText  // Callback prevents $ from being treated specially
      );

      // Update data with processed HTML to prevent double processing
      (data as any)[textKey] = processedText;

      console.log(`Processed ${textKey}: "${processedText.substring(0, 50)}..."`);
    } else {
      // Replace with empty string if field is not provided
      processedHtml = processedHtml.replace(new RegExp(`\\{\\{${textKey}\\}\\}`, 'g'), '');
    }
  });

  // ===== STEP 4.4: Process FitFeed Capa Special Styling Configuration =====
  // Generate JSON configuration for line-based styling
  if (data.titleSpecialStyling && typeof data.titleSpecialStyling === 'object') {
    console.log('\n========== DEBUG TITLE SPECIAL STYLING ==========');
    console.log('titleSpecialStyling:', data.titleSpecialStyling);

    const config = data.titleSpecialStyling as any;
    const stylingConfig = {
      enabled: config.enabled || false,
      lineStyles: config.lineStyles || []
    };

    console.log('Generated special styling config:', stylingConfig);

    // Convert to JSON string for injection into HTML
    data.titleSpecialStylingConfig = JSON.stringify(stylingConfig);
  } else {
    // Default disabled configuration
    data.titleSpecialStylingConfig = JSON.stringify({ enabled: false, lineStyles: [] });
  }

  // NOTE: STEP 4.4b and 4.4c moved to STEP 2.9 (before triple braces processing)

  // ===== STEP 4.5: Replace FitFeed Capa Template Fields (title, subtitle) =====
  // These fields are already processed in route.ts, just need to replace placeholders
  const fitfeedTextFields = ['title'];
  fitfeedTextFields.forEach(textKey => {
    const textValue = data[textKey];

    if (textValue !== undefined && textValue !== null) {
      // textValue is already processed HTML from route.ts
      const processedText = String(textValue);

      // Replace the placeholder in HTML (double braces)
      // IMPORTANT: Use callback function to avoid $ special character issues in replacement string
      const placeholder = `{{${textKey}}}`;
      processedHtml = processedHtml.replace(
        new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
        () => processedText  // Callback prevents $ from being treated specially
      );
      console.log(`Replaced {{${textKey}}} with value (already processed in route.ts): "${processedText.substring(0, 100)}..."`);
    } else {
      // Replace with empty string if field is not provided
      processedHtml = processedHtml.replace(new RegExp(`\\{\\{${textKey}\\}\\}`, 'g'), '');
    }
  });

  // ===== STEP 5: Process Simple Text Fields (freeText1, freeText2) =====
  // These are simpler text fields without rich text support
  const simpleTextFields = ['freeText1', 'freeText2'];
  simpleTextFields.forEach(textKey => {
    const textValue = data[textKey];
    if (textValue !== undefined && textValue !== null) {
      const processedText = String(textValue);
      processedHtml = processedHtml.replace(new RegExp(`\\{\\{${textKey}\\}\\}`, 'g'), processedText);
    } else {
      processedHtml = processedHtml.replace(new RegExp(`\\{\\{${textKey}\\}\\}`, 'g'), '');
    }
  });

  // Itera sobre todas as propriedades do objeto data
  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Regex para detectar {{key}} ou {{key|styles}}
    const placeholderRegex = new RegExp(`\\{\\{\\s*${key}(?:\\|([^}]+))?\\s*\\}\\}`, 'g');

    processedHtml = processedHtml.replace(placeholderRegex, (match, styleString) => {
      // Se o campo termina com "Style" (ex: titleStyle), ignora
      // Esses campos são usados como metadata para outros campos
      if (key.endsWith('Style')) {
        return match;
      }

      // Skip fields already processed in STEP 4 and 4.5
      const fieldsAlreadyProcessed = ['title', 'text1', 'text2', 'text3', 'text4', 'text5'];
      if (fieldsAlreadyProcessed.includes(key)) {
        console.log(`Skipping ${key} - already processed in STEP 4/4.5`);
        return match; // Return placeholder unchanged (though it should already be replaced)
      }

      // Campos CSS puros não devem ser sanitizados (backgroundImageUrl, backgroundColor, etc)
      const cssFields = [
        'backgroundColor',
        'backgroundImageUrl',
        'gradientOverlay',
        'gradientDisplay',
        'gradientBlendMode',
        'gradientBlur',
        'gradientBackground',
        'gradientBlurDisplay',
        'cardGradientCSS',       // Card gradient overlay CSS
        'cardGradientDisplay',   // Card gradient overlay display
        'viewportGradientCSS',   // Viewport gradient overlay CSS (fitfeed-capa)
        'viewportGradientDisplay', // Viewport gradient overlay display (fitfeed-capa)
        'titleSpecialStylingConfig', // Special styling configuration for fitfeed-capa
        'bottomTextPositioningConfig', // Bottom text positioning configuration for fitfeed-capa
        'arrowContentPositioningConfig', // Arrow-content positioning configuration for stack template
        'textFitConfig',         // Text fit configuration for auto-sizing text to single line
        'titleStyleCSS',         // Title inline CSS for fitfeed-capa
        'logoImageUrl',
        'logoPositionStyles',
        'arrowImageUrl',
        'arrowPositionStyles',
        'arrowWrapperStyles',    // Position styles for arrow+bottomText wrapper
        'arrowImageStyles',      // Size and filter styles for arrow image only
        'bottomTextStyles',
        'styleVariables',        // CSS variables for stack template
        'cardWidth',             // Card dimensions
        'cardHeight',
        'cardBorderRadius',
        'cardBackgroundColor',
        'cardBackgroundImage',
        'customCardContainerStyles',  // Custom styles for card container (e.g., reverse layout)
        'customContentImageSectionStyles',  // Custom styles for content-image-section (e.g., reverse layout spacing)
        'textGap',               // Spacing between text fields
        'contentImageUrl',       // Content image URL
        'contentImageBorderRadius',
        'svg1Url',               // SVG URL for logo selection dropdown
        'text1VerticalOffset',   // Individual vertical offsets for each text field
        'text2VerticalOffset',
        'text3VerticalOffset',
        'text4VerticalOffset',
        'text5VerticalOffset',
        // Versus template fields
        'imageLeftUrl',          // Left comparison image URL
        'imageRightUrl',         // Right comparison image URL
        'imageGap',              // Gap between comparison images
        'imageBorderRadius',     // Border radius for comparison images
        'containerPaddingTop',   // Container padding values
        'containerPaddingRight',
        'containerPaddingBottom',
        'containerPaddingLeft',
        'contentGap',            // Gap between content sections
      ];
      if (cssFields.includes(key)) {
        return String(value || '');
      }

      // Converte valor para string
      const valueStr = String(value);

      // CORREÇÃO: Se o valor já contém HTML processado (gerado por applyStyledChunks)
      // e não há estilo inline no placeholder, retorna diretamente sem re-processar
      if (containsHTML(valueStr) && !styleString) {
        console.log(`Campo "${key}" já contém HTML, não re-processando`);
        return valueStr;
      }

      // Verifica se existe um campo de estilo correspondente (ex: titleStyle para title)
      const styleKey = `${key}Style`;
      const styleFromData = data[styleKey];

      // Prioridade: estilo inline no placeholder > estilo do campo separado
      let finalStyleString: string | undefined;

      if (styleString) {
        // Se tem estilo inline no placeholder, usa ele
        finalStyleString = styleString;
      } else if (styleFromData) {
        // Se tem estilo no campo separado, converte para string se necessário
        if (typeof styleFromData === 'string') {
          finalStyleString = styleFromData;
        } else if (typeof styleFromData === 'object') {
          // Converte objeto de estilos para string CSS
          finalStyleString = stylesToCss(styleFromData as TextStyle);
        } else {
          console.warn(`Style for ${key} is neither string nor object:`, styleFromData);
        }
      }

      // Processa o texto com estilos (apenas se for texto puro ou com estilos adicionais)
      return processStyledText(valueStr, finalStyleString);
    });
  });

  // Remove placeholders de campos *Style que não foram substituídos
  processedHtml = processedHtml.replace(/\{\{\s*\w+Style\s*\}\}/g, '');

  // Verifica se ainda existem placeholders não substituídos
  const remainingPlaceholders = processedHtml.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.warn('Placeholders não substituídos encontrados:', remainingPlaceholders);
  }

  // DEBUG: Log HTML snippet showing logo element
  console.log('\n========== DEBUG HTML OUTPUT (LOGO SECTION) ==========');
  const logoElementMatch = processedHtml.match(/<img[^>]*id=["']?logoImage["']?[^>]*>/);
  if (logoElementMatch) {
    console.log('Logo <img> element found in HTML:');
    console.log(logoElementMatch[0]);

    // Extract and show a larger snippet around the logo element
    const logoIndex = processedHtml.indexOf(logoElementMatch[0]);
    const snippetStart = Math.max(0, logoIndex - 200);
    const snippetEnd = Math.min(processedHtml.length, logoIndex + logoElementMatch[0].length + 200);
    const snippet = processedHtml.substring(snippetStart, snippetEnd);
    console.log('\nContext around logo element (±200 chars):');
    console.log(snippet);
  } else {
    console.log('✗ NO logo <img> element found in HTML!');
    console.log('Searching for any logo-related placeholders or elements...');
    const logoMatches = processedHtml.match(/logo[^>\s]*/gi);
    if (logoMatches) {
      console.log('Found logo-related text:', logoMatches.slice(0, 10));
    }
  }
  console.log('======================================================\n');

  return processedHtml;
}

/**
 * Gera um caminho de saída único para a imagem
 * @param outputPath - Caminho customizado (opcional)
 * @param format - Formato da imagem
 */
function generateOutputPath(outputPath?: string, format: string = 'png'): string {
  if (outputPath) {
    // Garante que a extensão está correta
    const ext = path.extname(outputPath);
    if (ext && ext !== `.${format}`) {
      return outputPath.replace(ext, `.${format}`);
    }
    if (!ext) {
      return `${outputPath}.${format}`;
    }
    return outputPath;
  }

  // Gera nome de arquivo único com timestamp
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filename = `image-${timestamp}-${randomSuffix}.${format}`;

  // Usa diretório output na raiz do projeto
  const projectRoot = path.resolve(__dirname, '../..');
  return path.join(projectRoot, 'output', filename);
}

/**
 * Cria uma página do Puppeteer configurada para captura de screenshot
 * @param browser - Instância do browser
 * @param width - Largura do viewport
 * @param height - Altura do viewport
 */
async function createConfiguredPage(
  browser: Browser,
  width: number,
  height: number
): Promise<Page> {
  const page = await browser.newPage();

  try {
    // Configura viewport para dimensões exatas
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 2, // Retina display para maior qualidade
    });

    // Desabilita timeout para carregamento de recursos
    await page.setDefaultNavigationTimeout(30000);

    // DEBUG: Capturar erros de carregamento de recursos (fontes, imagens, etc.)
    page.on('requestfailed', (request) => {
      console.error(`[Puppeteer] Falha ao carregar recurso: ${request.url()}`);
      console.error(`[Puppeteer] Motivo: ${request.failure()?.errorText}`);
    });

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        console.log(`[Puppeteer Console ${type}]:`, msg.text());
      }
    });

    return page;
  } catch (error) {
    await page.close();
    throw error;
  }
}

/**
 * Renderiza HTML e captura screenshot
 * @param page - Página do Puppeteer
 * @param html - Conteúdo HTML processado
 * @param outputPath - Caminho de saída
 * @param options - Opções de screenshot
 */
async function captureScreenshot(
  page: Page,
  html: string,
  outputPath: string,
  options: { format: 'png' | 'jpeg' | 'webp'; quality?: number }
): Promise<void> {
  try {
    // DEBUG: Log HTML before loading
    if (html.includes('logoImageUrl')) {
      const logoUrlMatch = html.match(/src="([^"]*logoImage[^"]*)"/);
      console.log('DEBUG: Logo URL in HTML:', logoUrlMatch ? logoUrlMatch[1] : 'not found');
    }

    // Add console listener to capture browser logs
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Logo') || text.includes('logo') || text.includes('failed')) {
        console.log(`[Puppeteer Console ${msg.type()}]:`, text);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error: unknown) => {
      const err = error as Error;
      console.error('[Puppeteer Page Error]:', err.message);
    });

    // CRITICAL: SVG Rendering Wait Strategy
    // According to Puppeteer issue #791, SVGs need waitForNavigation + timeout
    // This ensures SVG content (both <img src="*.svg"> and inline <svg>) is fully rendered
    const navigationPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {
      // Navigation might not trigger for setContent, that's ok
      console.log('Navigation promise resolved (no actual navigation occurred)');
    });

    // Carrega o HTML na página
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Wait for navigation promise (critical for SVG rendering)
    await navigationPromise;

    // CRITICAL: Wait for custom fonts to load
    console.log('Aguardando carregamento de fontes customizadas...');
    await page.evaluateHandle('document.fonts.ready').catch(() => {
      console.warn('Timeout ao aguardar document.fonts.ready');
    });

    // DEBUG: List all loaded fonts
    const loadedFonts = await page.evaluate(() => {
      const fonts: string[] = [];
      // @ts-ignore - document.fonts exists
      document.fonts.forEach((font: any) => {
        fonts.push(`${font.family} (${font.weight}, ${font.style})`);
      });
      return fonts;
    });
    console.log('DEBUG: Fontes carregadas no Puppeteer:', loadedFonts);

    // Additional safety wait for SVG rendering (from Puppeteer issue #791)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // DEBUG: Check logo image status after page load
    const logoStatus = await page.evaluate(() => {
      const logoImg = document.getElementById('logoImage') as HTMLImageElement;
      if (!logoImg) return { exists: false };
      return {
        exists: true,
        src: logoImg.src,
        complete: logoImg.complete,
        naturalWidth: logoImg.naturalWidth,
        naturalHeight: logoImg.naturalHeight,
        display: window.getComputedStyle(logoImg).display,
        position: window.getComputedStyle(logoImg).position,
        left: window.getComputedStyle(logoImg).left,
        top: window.getComputedStyle(logoImg).top,
        width: window.getComputedStyle(logoImg).width,
        height: window.getComputedStyle(logoImg).height,
        zIndex: window.getComputedStyle(logoImg).zIndex,
        transform: window.getComputedStyle(logoImg).transform,
      };
    });
    console.log('\n========== LOGO STATUS IN BROWSER ==========');
    console.log(JSON.stringify(logoStatus, null, 2));
    console.log('============================================\n');

    // Aguarda fontes carregarem
    await page.evaluateHandle('document.fonts.ready');

    // Aguarda imagens (incluindo backgrounds CSS) carregarem
    await page.evaluate(() => {
      const doc = document as any;
      return Promise.all(
        Array.from(doc.images)
          .filter((img: any) => !img.complete)
          .map((img: any) => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });

    // SPECIAL WAIT FOR INLINE SVG ELEMENTS (from stack template)
    // Check if page contains inline SVG elements and wait for them to render
    const hasSVGElements = await page.evaluate(() => {
      const svgElements = document.querySelectorAll('svg');
      return svgElements.length > 0;
    });

    if (hasSVGElements) {
      console.log('Inline SVG elements detected - adding extra wait time for rendering');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // SPECIAL WAIT FOR SVG LOGO - SVGs need extra time to render in Puppeteer
    const logoImage = await page.$('#logoImage');
    if (logoImage) {
      try {
        // Wait for logo to be visible (not display:none)
        await page.waitForSelector('#logoImage:not([style*="display: none"])', {
          timeout: 3000
        });

        // Check if it's an SVG
        const isSVG = await page.evaluate(() => {
          const img = document.getElementById('logoImage') as HTMLImageElement;
          return img?.src?.endsWith('.svg') || img?.src?.includes('.svg');
        });

        if (isSVG) {
          console.log('SVG logo image detected - adding extra wait time');
          // SVGs need extra rendering time - known Puppeteer issue #5261
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        // Logo might be hidden or not present - that's ok
        console.log('Logo not visible or timed out waiting');
      }
    }

    // Delay para imagens e renderização completa
    await new Promise(resolve => setTimeout(resolve, 2000));

    // DEBUG: Check bottom text positioning after scripts have run
    const bottomTextStatus = await page.evaluate(() => {
      const bottomText = document.querySelector('.bottom-text') as HTMLElement;
      const arrow = document.getElementById('arrowImage') as HTMLImageElement;
      if (!bottomText) return { exists: false, hasArrow: !!arrow };
      return {
        exists: true,
        hasArrow: !!arrow,
        arrowSrc: arrow?.src || 'N/A',
        content: bottomText.textContent,
        computedRight: window.getComputedStyle(bottomText).right,
        computedBottom: window.getComputedStyle(bottomText).bottom,
        inlineStyle: bottomText.getAttribute('style'),
        bottomTextPositioning: (window as any).bottomTextPositioning
      };
    });
    console.log('\n========== BOTTOM TEXT STATUS ==========');
    console.log(JSON.stringify(bottomTextStatus, null, 2));
    console.log('=========================================\n');

    // Garante que o diretório de saída existe
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Obter dimensões do viewport
    const viewport = page.viewport();

    // Configurações do screenshot
    const screenshotOptions: ScreenshotOptions = {
      path: outputPath as `${string}.png` | `${string}.jpeg` | `${string}.webp`,
      type: options.format,
      fullPage: false,
      clip: viewport ? {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      } : undefined,
    };

    // Qualidade só se aplica a JPEG e WebP
    if ((options.format === 'jpeg' || options.format === 'webp') && options.quality) {
      screenshotOptions.quality = options.quality;
    }

    // Captura o screenshot
    await page.screenshot(screenshotOptions);
  } catch (error: any) {
    throw new ImageGenerationError(
      'Erro ao capturar screenshot',
      'SCREENSHOT_ERROR',
      { originalError: error.message, outputPath }
    );
  }
}

/**
 * Gera uma imagem a partir de um template HTML e dados JSON
 *
 * @param options - Opções de geração de imagem
 * @returns Resultado da geração com caminho da imagem
 *
 * @example
 * ```typescript
 * const result = await generateImage({
 *   templatePath: './templates/post.html',
 *   data: {
 *     title: 'Meu Post',
 *     subtitle: 'Descrição do post',
 *     authorName: 'João Silva'
 *   },
 *   width: 1080,
 *   height: 1080
 * });
 *
 * if (result.success) {
 *   console.log('Imagem gerada:', result.imagePath);
 * }
 * ```
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const startTime = Date.now();
  let page: Page | null = null;

  try {
    // Validação de parâmetros obrigatórios
    if (!options.templatePath) {
      throw new ImageGenerationError(
        'templatePath é obrigatório',
        'MISSING_TEMPLATE_PATH',
        { options }
      );
    }

    if (!options.data) {
      throw new ImageGenerationError(
        'data é obrigatório',
        'MISSING_DATA',
        { options }
      );
    }

    // Configurações padrão
    const width = options.width || 1080;
    const height = options.height || 1080;
    const quality = options.quality || 100;
    const format = options.format || 'png';

    // Validações
    if (width <= 0 || height <= 0) {
      throw new ImageGenerationError(
        'Dimensões devem ser maiores que zero',
        'INVALID_DIMENSIONS',
        { width, height }
      );
    }

    if (quality < 0 || quality > 100) {
      throw new ImageGenerationError(
        'Qualidade deve estar entre 0 e 100',
        'INVALID_QUALITY',
        { quality }
      );
    }

    // 1. Carrega o template HTML
    const templateHtml = await loadTemplateFile(options.templatePath);

    // 1.5. Pré-carrega SVGs inline para os corners (para que CSS fill funcione)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    for (let i = 1; i <= 4; i++) {
      const cornerType = (options.data as any)[`corner${i}Type`];
      const cornerSvgUrl = (options.data as any)[`corner${i}SvgUrl`];
      const cornerSvgContent = (options.data as any)[`corner${i}SvgContent`];
      const cornerSvgWidthRaw = (options.data as any)[`corner${i}SvgWidth`] || 'auto';
      const cornerSvgHeightRaw = (options.data as any)[`corner${i}SvgHeight`] || 'auto';

      // Parse width/height
      const cornerSvgWidth = cornerSvgWidthRaw === 'auto' || isNaN(Number(cornerSvgWidthRaw)) ? cornerSvgWidthRaw : `${cornerSvgWidthRaw}px`;
      const cornerSvgHeight = cornerSvgHeightRaw === 'auto' || isNaN(Number(cornerSvgHeightRaw)) ? cornerSvgHeightRaw : `${cornerSvgHeightRaw}px`;

      // Se for SVG com URL e sem conteúdo pré-definido, carrega inline
      if (cornerType === 'svg' && cornerSvgUrl && cornerSvgUrl !== 'none' && !cornerSvgContent) {
        const inlineSvg = await loadSvgInline(cornerSvgUrl, cornerSvgWidth, cornerSvgHeight, baseUrl);
        if (inlineSvg) {
          (options.data as any)[`corner${i}SvgContent`] = inlineSvg;
          console.log(`Corner ${i}: SVG carregado inline com sucesso`);
        } else {
          console.log(`Corner ${i}: Falha ao carregar SVG inline, usando fallback <img>`);
        }
      }
    }

    // 2. Substitui placeholders pelos dados
    let processedHtml = replacePlaceholders(templateHtml, options.data);

    // 3. Injeta fontes customizadas
    const customFontNames = extractCustomFonts(options.data);
    console.log('Fontes customizadas extraídas:', Array.from(customFontNames));

    if (customFontNames.size > 0) {
      try {
        // Obter lista de fontes disponíveis
        // Usar process.cwd() ao invés de __dirname para funcionar com Next.js bundling
        const fontsDir = path.join(process.cwd(), 'public/fonts');
        console.log('DEBUG: Diretório de fontes:', fontsDir);
        const availableFontFiles = await fs.readdir(fontsDir).catch((err) => {
          console.error('DEBUG: Erro ao ler diretório de fontes:', err);
          return [];
        });
        console.log('DEBUG: Arquivos de fontes encontrados:', availableFontFiles.length, availableFontFiles);

        // Mapear nomes de fontes para arquivos
        const fontDefinitions: FontDefinition[] = [];
        for (const fontName of customFontNames) {
          const fontDef = mapFontNameToFile(fontName, availableFontFiles);
          if (fontDef) {
            fontDefinitions.push(fontDef);
          } else {
            console.warn(`Fonte customizada não encontrada: ${fontName}`);
          }
        }

        // Gerar e injetar CSS @font-face
        if (fontDefinitions.length > 0) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          const fontFaceCSS = generateFontFaceCSS(fontDefinitions, baseUrl);
          processedHtml = injectFontFaceIntoHTML(processedHtml, fontFaceCSS);

          console.log(`✓ Injetadas ${fontDefinitions.length} fonte(s) customizada(s):`);
          fontDefinitions.forEach(f => {
            console.log(`  - ${f.family}: ${f.filename} (weight: ${f.weight}, style: ${f.style})`);
          });
          console.log('CSS @font-face gerado:');
          console.log(fontFaceCSS);
        }
      } catch (fontError) {
        console.error('Erro ao processar fontes customizadas:', fontError);
        // Continua sem fontes customizadas em caso de erro
      }
    }

    // 4. Gera caminho de saída
    const outputPath = generateOutputPath(options.outputPath, format);

    // 5. Obtém instância do browser
    const browser = await getBrowserInstance();

    // 6. Cria e configura página
    page = await createConfiguredPage(browser, width, height);

    // 7. Save processed HTML for debugging
    const htmlDebugPath = outputPath.replace(`.${format}`, '.html');
    await fs.writeFile(htmlDebugPath, processedHtml, 'utf-8');
    console.log('DEBUG: Saved processed HTML to:', htmlDebugPath);

    // 8. Captura screenshot
    await captureScreenshot(page, processedHtml, outputPath, { format, quality });

    // 9. Calcula tempo de execução
    const executionTime = Date.now() - startTime;

    // 10. Retorna resultado
    return {
      success: true,
      imagePath: path.resolve(outputPath),
      filename: path.basename(outputPath),
      executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    // Se for um erro customizado, preserva
    if (error instanceof ImageGenerationError) {
      return {
        success: false,
        error: error.message,
        executionTime,
      };
    }

    // Caso contrário, cria um erro genérico
    return {
      success: false,
      error: `Erro ao gerar imagem: ${error.message}`,
      executionTime,
    };
  } finally {
    // Sempre fecha a página
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('Erro ao fechar página:', closeError);
      }
    }
  }
}

// ============================================================================
// MODULAR SYSTEM SUPPORT
// ============================================================================

/**
 * Resultado da geração de imagem modular
 */
export interface GenerationResult {
  success: boolean;
  imagePaths: string[];
  htmlPath?: string;
  error?: string;
}

/**
 * Gera imagem usando o sistema modular
 *
 * Este é o novo ponto de entrada para o sistema modular que usa
 * compositer.ts para construir templates dinamicamente.
 *
 * @param enabledModules - Array de IDs dos módulos ativos
 * @param moduleData - Dados de configuração por módulo
 * @param options - Opções de geração (caminho, formato, qualidade)
 *
 * @example
 * ```typescript
 * const result = await generateModularImage(
 *   ['viewport', 'card', 'textFields', 'duo'],
 *   {
 *     viewport: { backgroundColor: '#000' },
 *     card: { backgroundImageUrl: '/bg.jpg' },
 *     textFields: { text1: { text: 'Hello', styledChunks: [...] } },
 *     duo: { enabled: true, centerImageUrl: '/product.png' }
 *   },
 *   {
 *     outputPath: 'custom-name',
 *     format: 'png',
 *     quality: 100
 *   }
 * );
 * ```
 */
export async function generateModularImage(
  enabledModules: string[],
  moduleData: Record<string, any>,
  options?: {
    outputPath?: string;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
): Promise<GenerationResult> {
  const startTime = Date.now();
  let page: Page | null = null;

  try {
    // Import compositer function
    const { composeTemplate } = await import('@/lib/modules/compositer');
    const { getModule } = await import('@/lib/modules/registry');

    // Default options
    const format = options?.format || 'png';
    const quality = options?.quality || 100;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    console.log('[Modular Generation] Starting with modules:', enabledModules);

    // 1. Compose template from modules
    const composedTemplate = composeTemplate(enabledModules, moduleData, { baseUrl });

    console.log('[Modular Generation] Template composed:', {
      viewportWidth: composedTemplate.viewportWidth,
      viewportHeight: composedTemplate.viewportHeight,
      modulesCount: enabledModules.length,
    });

    // 2. Get final HTML (already includes all placeholders replaced)
    const finalHtml = composedTemplate.finalHtml;

    // 3. Generate output path
    const timestamp = Date.now();
    const filePrefix = options?.outputPath || 'modular';
    const outputDir = path.join(process.cwd(), 'public', 'output');

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // 4. Save HTML for debugging
    const htmlPath = path.join(outputDir, `${filePrefix}-${timestamp}.html`);
    await fs.writeFile(htmlPath, finalHtml, 'utf-8');
    console.log('[Modular Generation] Saved HTML to:', htmlPath);

    // 5. Get browser instance
    const browser = await getBrowserInstance();

    // 6. Create and configure page with viewport from composed template
    page = await createConfiguredPage(
      browser,
      composedTemplate.viewportWidth,
      composedTemplate.viewportHeight
    );

    // 7. Check if Duo module is enabled and has modifyGeneration hook
    const hasDuo = enabledModules.includes('duo');
    const duoModule = hasDuo ? getModule('duo') : null;

    if (duoModule && duoModule.modifyGeneration) {
      console.log('[Modular Generation] Duo mode detected - using custom generation');

      // Load HTML into page first
      await page.setContent(finalHtml, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for fonts
      console.log('[Modular Generation] Waiting for fonts to load...');
      await page.evaluateHandle('document.fonts.ready').catch(() => {
        console.warn('Timeout waiting for document.fonts.ready');
      });

      // Add extra delay for rendering
      console.log('[Modular Generation] Waiting for render to settle...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call Duo's custom generation logic
      const generationOptions = {
        viewportWidth: composedTemplate.viewportWidth,
        viewportHeight: composedTemplate.viewportHeight,
        deviceScaleFactor: 2,
        outputDir,
        filePrefix,
      };

      const duoResult = await duoModule.modifyGeneration(page, generationOptions);

      console.log('[Modular Generation] Duo generation completed');
      console.log('Execution time:', Date.now() - startTime, 'ms');

      return {
        success: true,
        imagePaths: duoResult.filePaths,
        htmlPath,
      };
    } else {
      // Standard single-image generation
      console.log('[Modular Generation] Standard mode - single image');

      const imagePath = path.join(outputDir, `${filePrefix}-${timestamp}.${format}`);

      // Capture screenshot using existing logic
      await captureScreenshot(page, finalHtml, imagePath, { format, quality });

      console.log('[Modular Generation] Image saved to:', imagePath);
      console.log('Execution time:', Date.now() - startTime, 'ms');

      return {
        success: true,
        imagePaths: [imagePath],
        htmlPath,
      };
    }
  } catch (error) {
    console.error('[Modular Generation] Error:', error);

    return {
      success: false,
      imagePaths: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    // Clean up page
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('[Modular Generation] Error closing page:', closeError);
      }
    }
  }
}

/**
 * Fecha a instância do browser
 * Útil para limpeza ao encerrar a aplicação
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    try {
      await browserInstance.close();
      browserInstance = null;
    } catch (error) {
      console.error('Erro ao fechar browser:', error);
    }
  }
}

/**
 * Verifica se o browser está ativo
 */
export function isBrowserActive(): boolean {
  return browserInstance !== null && browserInstance.isConnected();
}

/**
 * Cleanup automático ao encerrar o processo
 */
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});
