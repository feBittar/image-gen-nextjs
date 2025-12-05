import { ModuleDefinition } from '../types';
import { freeTextSchema, freeTextDefaults } from './schema';
import { getFreeTextCss, getFreeTextStyleVariables } from './css';
import { getFreeTextHtml } from './html';
import { FreeTextForm } from './FreeTextForm';
import { Type } from 'lucide-react';

/**
 * FreeText Module Definition
 *
 * Provides freely positioned text elements (CTAs, labels, badges, etc.) that can be placed
 * anywhere on the viewport using either manual coordinates or special position presets.
 *
 * z-index: 30 (above text fields and content, below corners)
 *
 * Features:
 * - Up to 5 free text elements
 * - Manual positioning (px or %) or special position presets (corners, edges, center)
 * - Full text styling (font, size, weight, color, etc.)
 * - Optional background highlight with customizable padding and border radius
 * - Percentage-based padding when using special positions (scales with viewport)
 * - Compatible with Duo module (free texts are duplicated for each slide)
 */
export const FreeTextModule: ModuleDefinition = {
  id: 'freeText',
  name: 'Free Text',
  description: 'Add freely positioned text elements (CTAs, labels, etc.)',
  icon: Type,
  category: 'overlay',
  schema: freeTextSchema,
  defaults: freeTextDefaults,
  FormComponent: FreeTextForm as any, // Type cast to satisfy generic constraint
  getCss: getFreeTextCss,
  getHtml: getFreeTextHtml,
  getStyleVariables: getFreeTextStyleVariables,
  zIndex: 30, // Above text fields (20) and content (10), below corners (99)
  dependencies: [],
  conflicts: [],
};

// Re-export types and utilities
export { freeTextSchema, freeTextDefaults } from './schema';
export type { FreeTextData, FreeTextElement } from './schema';
export { getFreeTextCss, getFreeTextStyleVariables } from './css';
export { getFreeTextHtml, getFreeTextPlaceholders } from './html';
export { FreeTextForm } from './FreeTextForm';
