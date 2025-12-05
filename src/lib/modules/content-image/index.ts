import { ModuleDefinition } from '../types';
import { contentImageSchema, ContentImageData } from './schema';
import { getContentImageCss } from './css';
import { getContentImageHtml } from './html';
import { ContentImageForm } from './ContentImageForm';
import { ImageIcon } from 'lucide-react';

/**
 * ContentImageModule - Manages content images with single or comparison mode
 *
 * Features:
 * - Single image display with customizable sizing and positioning
 * - Comparison mode (2 images side by side) for versus-style templates
 * - Border radius, shadows, object-fit controls
 * - Automatic hiding when no URL provided
 *
 * z-index: 5 (above card background, below text)
 */
export const contentImageModule: ModuleDefinition = {
  id: 'contentImage',
  name: 'Content Image',
  description: 'Display content images in single or comparison mode',
  icon: ImageIcon,
  category: 'content',
  schema: contentImageSchema,
  defaults: {
    enabled: true,
    url: '',
    borderRadius: 20,
    maxWidth: 100,
    maxHeight: 100,
    objectFit: 'cover',
    position: 'center',
    shadow: {
      enabled: false,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    },
    mode: 'single',
    comparisonGap: 40,
    url2: '',
    layoutWidth: '50%',
    alignSelf: 'stretch',
  } as ContentImageData,
  FormComponent: ContentImageForm as any,
  getCss: getContentImageCss,
  getHtml: getContentImageHtml,
  getStyleVariables: () => ({}),
  zIndex: 5, // Above card (1), below text (10)
  dependencies: [],
  conflicts: [],
};

// Export types for use in other modules
export type { ContentImageData } from './schema';
export { contentImageSchema } from './schema';
export { getContentImageCss } from './css';
export { getContentImageHtml } from './html';
export { ContentImageForm } from './ContentImageForm';
