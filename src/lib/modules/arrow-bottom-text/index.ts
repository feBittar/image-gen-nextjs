import { ModuleDefinition } from '../types';
import { arrowBottomTextSchema, arrowBottomTextDefaults } from './schema';
import { getArrowBottomTextCss, getArrowBottomTextStyleVariables } from './css';
import { getArrowBottomTextHtml } from './html';
import { ArrowBottomTextForm } from './ArrowBottomTextForm';
import { ArrowDownCircle } from 'lucide-react';

/**
 * Arrow Bottom Text Module Definition
 *
 * Combo of Arrow (SVG/image) + bottom text, commonly used in bottom corner for CTAs like "swipe up".
 *
 * z-index: 30 (same level as freeText, above most elements except Duo slides and corners)
 *
 * Features:
 * - Arrow SVG/image with color customization
 * - Bottom text with full typography control
 * - Flexible positioning with special position presets
 * - Layout options: vertical (arrow above text) or horizontal (arrow beside text)
 * - Gap control between arrow and text
 * - Typically positioned at bottom-right corner
 */
export const ArrowBottomTextModule: ModuleDefinition = {
  id: 'arrowBottomText',
  name: 'Arrow + Bottom Text',
  description: 'Arrow with text overlay for CTAs (e.g., swipe up)',
  icon: ArrowDownCircle,
  category: 'overlay',
  schema: arrowBottomTextSchema,
  defaults: arrowBottomTextDefaults,
  FormComponent: ArrowBottomTextForm as any, // Type cast to satisfy generic constraint
  getCss: getArrowBottomTextCss,
  getHtml: getArrowBottomTextHtml,
  getStyleVariables: getArrowBottomTextStyleVariables,
  zIndex: 30, // Same level as freeText
  dependencies: [],
  conflicts: [],
};

// Re-export types and utilities
export { arrowBottomTextSchema, arrowBottomTextDefaults } from './schema';
export type { ArrowBottomTextData, ArrowBottomTextLayout } from './schema';
export { getArrowBottomTextCss, getArrowBottomTextStyleVariables } from './css';
export { getArrowBottomTextHtml, getArrowBottomTextPlaceholders } from './html';
export { ArrowBottomTextForm } from './ArrowBottomTextForm';
