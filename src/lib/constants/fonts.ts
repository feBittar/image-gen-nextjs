// Font Registry - Central registry of all available custom fonts

export interface FontDefinition {
  name: string;
  family: string;
  filename: string;
  weight?: number;
  style?: 'normal' | 'italic' | 'oblique';
  category?: 'display' | 'sans-serif' | 'serif' | 'monospace';
}

export const CUSTOM_FONTS: FontDefinition[] = [
  // Use apenas o nome base da família (sem variantes de peso)
  // O peso será selecionado separadamente no dropdown de Font Weight
  { name: 'Bebas Neue', family: 'Bebas Neue', filename: 'BebasNeue-Regular.ttf', weight: 400, style: 'normal', category: 'display' },
  { name: 'Montserrat', family: 'Montserrat', filename: 'Montserrat-Regular.ttf', weight: 400, style: 'normal', category: 'sans-serif' },
  { name: 'Product Sans', family: 'Product Sans', filename: 'ProductSans-Regular.ttf', weight: 400, style: 'normal', category: 'sans-serif' },
  { name: 'Gilroy', family: 'Gilroy', filename: 'Gilroy-Black.ttf', weight: 900, style: 'normal', category: 'sans-serif' },
  { name: 'Akkordeon Ten', family: 'Akkordeon Ten', filename: 'akkordeon-ten.otf', weight: 400, style: 'normal', category: 'display' },
  { name: 'Europa Grotesk SH', family: 'Europa Grotesk SH', filename: 'europa-grotesk-sh-bold.otf', weight: 700, style: 'normal', category: 'sans-serif' },
  { name: 'Helvetica Now Text', family: 'Helvetica Now Text', filename: 'helveticanowtext-bold-demo.ttf', weight: 700, style: 'normal', category: 'sans-serif' },
  { name: 'Neue Kaine', family: 'Neue Kaine', filename: 'neue-kaine-variable.ttf', weight: 400, style: 'normal', category: 'sans-serif' }
];

export const SYSTEM_FONTS: FontDefinition[] = [
  { name: 'Arial', family: 'Arial, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'Times New Roman', family: "'Times New Roman', serif", filename: '', category: 'serif' },
  { name: 'Georgia', family: 'Georgia, serif', filename: '', category: 'serif' },
  { name: 'PT Serif', family: "'PT Serif', serif", filename: '', category: 'serif' },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', serif", filename: '', category: 'serif' },
  { name: 'Courier New', family: "'Courier New', monospace", filename: '', category: 'monospace' },
  { name: 'Verdana', family: 'Verdana, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'Open Sans', family: "'Open Sans', sans-serif", filename: '', category: 'sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'League Spartan', family: "'League Spartan', sans-serif", filename: '', category: 'sans-serif' },
  { name: 'Inter', family: 'Inter, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif', filename: '', category: 'sans-serif' },
  { name: 'System UI', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", filename: '', category: 'sans-serif' }
];

export const ALL_FONTS = [...SYSTEM_FONTS, ...CUSTOM_FONTS];

export function getFontOptions() {
  return ALL_FONTS.map(font => ({ value: font.family, label: font.name }));
}

export function getCustomFontOptions() {
  return CUSTOM_FONTS.map(font => ({ value: font.family, label: font.name }));
}

export function getFontByFamily(family: string): FontDefinition | undefined {
  return ALL_FONTS.find(f => f.family === family);
}
