import { ModuleDefinition } from '../types';
import { logoSchema, logoDefaults } from './schema';
import { getLogoCss, getLogoStyleVariables } from './css';
import { getLogoHtml } from './html';
import { LogoForm } from './LogoForm';
import { Image as ImageIcon } from 'lucide-react';

/**
 * Logo Module Definition
 *
 * Provides a single logo image overlay that can be positioned anywhere on the viewport.
 *
 * z-index: 30 (above content, below corners)
 *
 * Features:
 * - Select logo from available logos via API
 * - Customizable dimensions (width/height with auto support)
 * - Flexible positioning: special presets or manual coordinates
 * - Opacity control (0-1)
 * - CSS filters: grayscale, invert, brightness, contrast, sepia
 * - Filter intensity control for brightness/contrast
 * - Live preview of selected logo
 */
export const LogoModule: ModuleDefinition = {
  id: 'logo',
  name: 'Logo',
  description: 'Display a logo image with customizable position, opacity, and filters',
  icon: ImageIcon,
  category: 'overlay',
  schema: logoSchema,
  defaults: logoDefaults,
  FormComponent: LogoForm as any, // Type cast to satisfy generic constraint
  getCss: getLogoCss,
  getHtml: getLogoHtml,
  getStyleVariables: getLogoStyleVariables,
  zIndex: 30, // Above content, below corners
  dependencies: [],
  conflicts: [],
};

// Re-export types and utilities
export { logoSchema, logoDefaults } from './schema';
export type { LogoData, LogoFilter } from './schema';
export { getLogoCss, getLogoStyleVariables } from './css';
export { getLogoHtml, getLogoPlaceholder } from './html';
export { LogoForm } from './LogoForm';
