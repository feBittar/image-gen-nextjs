import { ModuleDefinition } from '../types';
import { viewportSchema, viewportDefaults } from './schema';
import { getViewportCss, getViewportStyleVariables } from './css';
import { getViewportHtml } from './html';
import { ViewportForm } from './ViewportForm';
import { Monitor } from 'lucide-react';

/**
 * ViewportModule - Controla o background, blur e gradient overlay do viewport
 *
 * Funcionalidades:
 * - Background color ou image
 * - Blur overlay (backdrop-filter via ::before)
 * - Gradient overlay (linear-gradient via ::after)
 *
 * z-index: 0 (background layer)
 */
export const ViewportModule: ModuleDefinition = {
  id: 'viewport',
  name: 'Viewport',
  description: 'Controla o background, blur e gradient overlay do viewport',
  icon: Monitor,
  category: 'layout',
  schema: viewportSchema,
  defaults: viewportDefaults,
  FormComponent: ViewportForm as any, // Type cast to satisfy generic constraint
  getCss: getViewportCss,
  getHtml: getViewportHtml,
  getStyleVariables: getViewportStyleVariables,
  zIndex: 0, // Background layer
};

// Re-export tipos e utilidades
export { viewportSchema, viewportDefaults } from './schema';
export type { ViewportData } from './schema';
export { getViewportCss, getViewportStyleVariables } from './css';
export { getViewportHtml } from './html';
export { ViewportForm } from './ViewportForm';
