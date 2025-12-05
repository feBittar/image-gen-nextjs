import { ModuleDefinition } from '../types';
import { cornersSchema, cornersDefaults } from './schema';
import { getCornersCss, getCornersStyleVariables } from './css';
import { getCornersHtml } from './html';
import { CornersForm } from './CornersForm';
import { Square } from 'lucide-react';

/**
 * Corners Module Definition
 *
 * Provides 4 corner elements that can be text or SVG, positioned absolutely at:
 * - Corner 1: Top Left
 * - Corner 2: Top Right
 * - Corner 3: Bottom Left
 * - Corner 4: Bottom Right
 *
 * z-index: 99 (above everything except Duo slides)
 *
 * Features:
 * - Text corners with customizable styling and optional background
 * - SVG corners with color override and size control
 * - Flexible positioning with padding controls
 * - Compatible with Duo module (corners are duplicated for each slide)
 */
export const CornersModule: ModuleDefinition = {
  id: 'corners',
  name: 'Corner Elements',
  description: 'Add text or SVG elements to the 4 corners of the viewport',
  icon: Square,
  category: 'overlay',
  schema: cornersSchema,
  defaults: cornersDefaults,
  FormComponent: CornersForm as any, // Type cast to satisfy generic constraint
  getCss: getCornersCss,
  getHtml: getCornersHtml,
  getStyleVariables: getCornersStyleVariables,
  zIndex: 99, // Above everything except Duo slides (which are z-index 100+)
  dependencies: [],
  conflicts: [],
};

// Re-export types and utilities
export { cornersSchema, cornersDefaults } from './schema';
export type { CornersData, Corner, CornerType, CornerSpecialPosition } from './schema';
export { getCornersCss, getCornersStyleVariables } from './css';
export { getCornersHtml, getCornerPlaceholders } from './html';
export { CornersForm } from './CornersForm';
