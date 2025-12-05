import path from 'path';

export interface FontDefinition {
  family: string;
  filename: string;
  weight?: string | number;
  style?: string;
}

/**
 * Lista de fontes do sistema que não precisam de @font-face
 */
const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New',
  'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond',
  'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Tahoma', 'Geneva',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
  'Droid Sans', 'Helvetica Neue'
];

/**
 * Verifica se uma fonte é uma fonte do sistema
 */
export function isSystemFont(fontName: string): boolean {
  const cleanName = fontName.trim().toLowerCase();
  return SYSTEM_FONTS.some(sf => cleanName.includes(sf.toLowerCase()));
}

/**
 * Extrai nomes de fontes de uma string font-family CSS
 * Ex: "'Gilroy Black', Arial, sans-serif" => ['Gilroy Black', 'Arial', 'sans-serif']
 */
export function parseFontFamily(fontFamily: string): string[] {
  return fontFamily
    .split(',')
    .map(font => font.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/**
 * Extrai fontes customizadas de um objeto de dados
 */
export function extractCustomFonts(data: any): Set<string> {
  const customFonts = new Set<string>();

  const processFontFamily = (fontFamily: string) => {
    const fonts = parseFontFamily(fontFamily);
    for (const font of fonts) {
      if (!isSystemFont(font)) {
        customFonts.add(font);
      }
    }
  };

  const processValue = (value: any) => {
    if (typeof value === 'string') {
      // Procurar por font-family em strings CSS
      const match = value.match(/font-family\s*:\s*([^;]+)/i);
      if (match) {
        processFontFamily(match[1]);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Procurar propriedade fontFamily em objetos
      if (value.fontFamily) {
        processFontFamily(value.fontFamily);
      }
      // Recursivamente processar objetos aninhados
      for (const key in value) {
        processValue(value[key]);
      }
    }
  };

  // Processar todos os campos
  for (const key in data) {
    processValue(data[key]);
  }

  return customFonts;
}

/**
 * Detecta o peso da fonte baseado no nome do arquivo
 */
function detectFontWeight(filename: string): number {
  const lower = filename.toLowerCase();
  if (lower.includes('thin')) return 100;
  if (lower.includes('extralight') || lower.includes('ultralight')) return 200;
  if (lower.includes('light')) return 300;
  if (lower.includes('regular') || lower.includes('normal')) return 400;
  if (lower.includes('medium')) return 500;
  if (lower.includes('semibold') || lower.includes('demibold')) return 600;
  if (lower.includes('bold')) return 700;
  if (lower.includes('extrabold') || lower.includes('ultrabold')) return 800;
  if (lower.includes('black') || lower.includes('heavy')) return 900;
  return 400; // default
}

/**
 * Detecta o estilo da fonte baseado no nome do arquivo
 */
function detectFontStyle(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('italic')) return 'italic';
  if (lower.includes('oblique')) return 'oblique';
  return 'normal';
}

/**
 * Normaliza nome da fonte removendo keywords de peso e estilo
 * "Product Sans Bold" -> { family: "Product Sans", weight: 700 }
 */
function normalizeFontName(fontName: string): { family: string; weight?: number; style?: string } {
  const weightKeywords = {
    'thin': 100,
    'extralight': 200,
    'ultralight': 200,
    'light': 300,
    'regular': 400,
    'normal': 400,
    'medium': 500,
    'semibold': 600,
    'demibold': 600,
    'bold': 700,
    'extrabold': 800,
    'ultrabold': 800,
    'black': 900,
    'heavy': 900
  };

  const styleKeywords = ['italic', 'oblique'];

  let normalizedFamily = fontName;
  let detectedWeight: number | undefined;
  let detectedStyle: string | undefined;

  // Remove weight keywords do nome
  for (const [keyword, weight] of Object.entries(weightKeywords)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalizedFamily)) {
      detectedWeight = weight;
      normalizedFamily = normalizedFamily.replace(regex, '').trim();
    }
  }

  // Remove style keywords do nome
  for (const keyword of styleKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalizedFamily)) {
      detectedStyle = keyword.toLowerCase();
      normalizedFamily = normalizedFamily.replace(regex, '').trim();
    }
  }

  // Remove espaços duplos e trim
  normalizedFamily = normalizedFamily.replace(/\s+/g, ' ').trim();

  return {
    family: normalizedFamily,
    weight: detectedWeight,
    style: detectedStyle
  };
}

/**
 * Mapeia nome da fonte para o arquivo correspondente
 * Tenta várias variações comuns de nomenclatura
 * Retorna um FontDefinition com weight e style detectados automaticamente
 */
export function mapFontNameToFile(fontName: string, availableFonts: string[]): FontDefinition | null {
  // Normaliza o nome da fonte primeiro
  const normalized = normalizeFontName(fontName);

  const cleanName = fontName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let matchedFile: string | null = null;

  // 1. Procurar correspondência exata
  for (const file of availableFonts) {
    const fileName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (fileName === cleanName) {
      matchedFile = file;
      break;
    }
  }

  // 2. Se não encontrou exata, priorizar variante Regular quando não há especificação de weight
  if (!matchedFile) {
    const regularPattern = new RegExp(`^${cleanName}.*regular`, 'i');
    for (const file of availableFonts) {
      const fileName = path.parse(file).name;
      // Pular arquivos italic ao procurar por Regular
      if (regularPattern.test(fileName) && !/italic/i.test(fileName)) {
        matchedFile = file;
        break;
      }
    }
  }

  // 3. Procurar correspondência parcial (fallback)
  if (!matchedFile) {
    for (const file of availableFonts) {
      const fileName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (fileName.includes(cleanName) || cleanName.includes(fileName)) {
        matchedFile = file;
        break;
      }
    }
  }

  // Se encontrou um arquivo, retorna com weight e style detectados
  if (matchedFile) {
    // Preferir weight detectado do nome da fonte, se houver; caso contrário, usar do filename
    const weightFromFile = detectFontWeight(matchedFile);
    const styleFromFile = detectFontStyle(matchedFile);

    return {
      family: normalized.family,  // Usa nome normalizado sem "Bold", "Light", etc
      filename: matchedFile,
      weight: normalized.weight || weightFromFile,  // Prioriza weight do nome
      style: normalized.style || styleFromFile      // Prioriza style do nome
    };
  }

  return null;
}

/**
 * Gera CSS @font-face para uma lista de fontes
 */
export function generateFontFaceCSS(fonts: FontDefinition[], baseUrl: string): string {
  return fonts.map(font => {
    const ext = path.extname(font.filename).toLowerCase();
    let format = 'truetype';

    switch (ext) {
      case '.woff':
        format = 'woff';
        break;
      case '.woff2':
        format = 'woff2';
        break;
      case '.otf':
        format = 'opentype';
        break;
      case '.ttf':
      default:
        format = 'truetype';
        break;
    }

    return `
@font-face {
  font-family: '${font.family}';
  src: url('${baseUrl}/fonts/${encodeURIComponent(font.filename)}') format('${format}');
  font-weight: ${font.weight || 'normal'};
  font-style: ${font.style || 'normal'};
  font-display: swap;
}`.trim();
  }).join('\n\n');
}

/**
 * Injeta CSS @font-face no HTML
 */
export function injectFontFaceIntoHTML(html: string, fontFaceCSS: string): string {
  // Procurar por </head> para injetar antes
  if (html.includes('</head>')) {
    const styleTag = `\n<style>\n${fontFaceCSS}\n</style>\n`;
    return html.replace('</head>', `${styleTag}</head>`);
  }

  // Se não tem </head>, procurar por <style> existente
  if (html.includes('<style>')) {
    return html.replace(/<style>/, `<style>\n${fontFaceCSS}\n`);
  }

  // Se não tem nenhum, adicionar no início do HTML
  const styleTag = `<style>\n${fontFaceCSS}\n</style>\n`;
  return styleTag + html;
}
