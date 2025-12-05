import { Copy } from 'lucide-react';
import {
  ModuleDefinition,
  ModuleData,
  RenderContext,
} from '../types';
import { duoModuleSchema, duoModuleDefaults, DuoModuleConfig } from './schema';
import { generateDuoCSS } from './css';
import { DuoForm } from './DuoForm';
import { modifyFinalHTMLForDuo } from './html';

/**
 * Duo Module Definition
 *
 * This module transforms any template into a 2-slide version by:
 * 1. Doubling the viewport width (1080px -> 2160px)
 * 2. Wrapping content in .duo-wrapper with 2 .duo-slide divs
 * 3. Adding a central image at z-index 100
 * 4. Modifying generation to create 2 separate PNG files
 *
 * Note: The modifyGeneration function is in generation.server.ts
 * and should be imported directly by API routes.
 */

/**
 * Generate CSS for the Duo module
 */
function getCss(data: ModuleData): string {
  const config = data as DuoModuleConfig;
  if (!config.enabled) return '';

  return generateDuoCSS(config);
}

/**
 * Generate HTML for the Duo module
 *
 * Note: Duo module wraps ALL content, so this returns empty string.
 * The actual wrapping happens in the compositer when duo is enabled.
 */
function getHtml(): string {
  // Duo module doesn't inject HTML directly - it wraps existing content
  return '';
}

/**
 * Generate CSS variables for the Duo module
 */
function getStyleVariables(data: ModuleData): Record<string, string> {
  const config = data as DuoModuleConfig;
  if (!config.enabled) return {};

  return {
    '--duo-offset-x': `${config.centerImageOffsetX}px`,
    '--duo-offset-y': `${config.centerImageOffsetY}px`,
    '--duo-scale': `${config.centerImageScale / 100}`,
    '--duo-rotation': `${config.centerImageRotation}deg`,
  };
}

/**
 * Modify final HTML to wrap content with Duo structure
 */
function modifyFinalHTML(html: string, data: ModuleData, context: RenderContext): string {
  const config = data as DuoModuleConfig;
  return modifyFinalHTMLForDuo(html, config, context);
}

/**
 * Duo Module Export
 */
export const duoModule: ModuleDefinition = {
  id: 'duo',
  name: 'Duo Mode',
  description: 'Transform template into 2-slide version with central image',
  icon: Copy,
  category: 'special',
  schema: duoModuleSchema,
  defaults: duoModuleDefaults,
  FormComponent: DuoForm as any,
  getCss,
  getHtml,
  getStyleVariables,
  zIndex: 100, // Above everything including corners
  conflicts: [], // Can work with any module
  // modifyGeneration is added server-side only (see index.server.ts)
  modifyFinalHTML, // Wraps body content with .duo-wrapper and .duo-slide containers
};

// Re-export types and components
export type { DuoModuleConfig } from './schema';
export { duoModuleSchema, duoModuleDefaults } from './schema';
export { generateDuoCSS } from './css';
export { generateDuoHTML, wrapTemplateWithDuo, modifyFinalHTMLForDuo } from './html';
export type { ModuleFormProps } from '../types';

// Export server-side generation function path for documentation
// Import from './duo/generation.server' in API routes
