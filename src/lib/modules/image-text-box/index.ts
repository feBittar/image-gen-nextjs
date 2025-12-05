import { ModuleDefinition } from '../types';
import { imageTextBoxSchema, imageTextBoxDefaults } from './schema';
import { getImageTextBoxCss } from './css';
import { getImageTextBoxHtml } from './html';
import { ImageTextBoxForm } from './ImageTextBoxForm';
import { SplitSquareHorizontal } from 'lucide-react';

/**
 * ImageTextBoxModule - Creates a horizontal box combining image + text side by side
 *
 * Features:
 * - Configurable split ratios (50-50, 40-60, 30-70, etc.)
 * - Order control (image-left or text-left)
 * - Independent image and text styling
 * - Works inside Card Container or standalone on viewport
 * - Multiple text fields with styled chunks support
 * - Individual padding for each side
 *
 * z-index: 7 (between contentImage=5 and textFields=10)
 */
export const imageTextBoxModule: ModuleDefinition = {
  id: 'imageTextBox',
  name: 'Image + Text Box',
  description: 'Horizontal box with image and text side by side',
  icon: SplitSquareHorizontal,
  category: 'content',
  schema: imageTextBoxSchema,
  defaults: imageTextBoxDefaults,
  FormComponent: ImageTextBoxForm as any,
  getCss: getImageTextBoxCss,
  getHtml: getImageTextBoxHtml,
  getStyleVariables: () => ({}),
  zIndex: 7, // Between contentImage (5) and textFields (10)
  dependencies: [],
  conflicts: [],
};

// Export types and functions for use in other modules
export type { ImageTextBoxData } from './schema';
export { imageTextBoxSchema, imageTextBoxDefaults } from './schema';
export { getImageTextBoxCss } from './css';
export { getImageTextBoxHtml } from './html';
export { ImageTextBoxForm } from './ImageTextBoxForm';
