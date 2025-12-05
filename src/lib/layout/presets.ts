/**
 * Layout Presets
 *
 * Definições de presets de layout pré-configurados.
 */

import type { LayoutPresetDefinition, CompositionConfig } from './types';

/**
 * Stack Layout (Padrão atual)
 * Text fields → Content Image → Text fields
 */
export const STACK_PRESET: LayoutPresetDefinition = {
  id: 'stack',
  name: 'Stack Layout',
  description: 'Vertical stack: Text fields above and below image',
  icon: 'layers',
  config: {
    renderOrder: [
      {
        moduleId: 'textFields',
        submoduleId: 'field.0',
        id: 'text-field-0',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.1',
        id: 'text-field-1',
      },
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
        marginTop: '30px',
        marginBottom: '30px',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.2',
        id: 'text-field-2',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.3',
        id: 'text-field-3',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.4',
        id: 'text-field-4',
      },
    ],
  },
};

/**
 * Image First Layout
 * Image → Text fields
 */
export const IMAGE_FIRST_PRESET: LayoutPresetDefinition = {
  id: 'image-first',
  name: 'Image First',
  description: 'Image on top, text below',
  icon: 'image',
  config: {
    renderOrder: [
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
        marginBottom: '30px',
      },
      {
        moduleId: 'textFields',
        id: 'text-fields',
      },
    ],
  },
};

/**
 * Image Last Layout
 * Text fields → Image
 */
export const IMAGE_LAST_PRESET: LayoutPresetDefinition = {
  id: 'image-last',
  name: 'Image Last',
  description: 'Text on top, image at bottom',
  icon: 'image',
  config: {
    renderOrder: [
      {
        moduleId: 'textFields',
        id: 'text-fields',
        marginBottom: '30px',
      },
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
      },
    ],
  },
};

/**
 * Sandwich Layout
 * Text 1 → Image (flex-grow) → Text 2-4
 */
export const SANDWICH_PRESET: LayoutPresetDefinition = {
  id: 'sandwich',
  name: 'Sandwich',
  description: 'Title, image in middle, description below',
  icon: 'sandwich',
  config: {
    renderOrder: [
      {
        moduleId: 'textFields',
        submoduleId: 'field.0',
        id: 'text-field-0',
        marginBottom: '40px',
      },
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.1',
        id: 'text-field-1',
        marginTop: '40px',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.2',
        id: 'text-field-2',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.3',
        id: 'text-field-3',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.4',
        id: 'text-field-4',
      },
    ],
  },
};

/**
 * Bullets Grid Layout
 * Header text → Bullets → Footer text
 */
export const BULLETS_GRID_PRESET: LayoutPresetDefinition = {
  id: 'bullets-grid',
  name: 'Bullets Grid',
  description: 'Header, bullet grid, footer',
  icon: 'list',
  config: {
    renderOrder: [
      {
        moduleId: 'textFields',
        submoduleId: 'field.0',
        id: 'header-text',
        marginBottom: '40px',
      },
      {
        moduleId: 'bullets',
        id: 'bullets',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.1',
        id: 'footer-text',
        marginTop: '40px',
      },
    ],
  },
};

/**
 * Floating Layout
 * Image with text overlayed (absolute positioning)
 */
export const FLOATING_PRESET: LayoutPresetDefinition = {
  id: 'floating',
  name: 'Floating',
  description: 'Image with floating text overlay',
  icon: 'maximize',
  config: {
    renderOrder: [
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
      },
      {
        moduleId: 'textFields',
        id: 'text-fields',
        position: {
          type: 'absolute',
          absoluteCoords: {
            top: '60px',
            left: '60px',
          },
        },
      },
    ],
    zIndexOverrides: {
      textFields: 50,
      contentImage: 5,
    },
  },
};

/**
 * Bullets First Layout
 * Bullets → Text fields
 */
export const BULLETS_FIRST_PRESET: LayoutPresetDefinition = {
  id: 'bullets-first',
  name: 'Bullets First',
  description: 'Bullet points before text',
  icon: 'list',
  config: {
    renderOrder: [
      {
        moduleId: 'bullets',
        id: 'bullets',
        marginBottom: '30px',
      },
      {
        moduleId: 'textFields',
        id: 'text-fields',
      },
    ],
  },
};

/**
 * Split Content Layout
 * Text 1-2 → Image → Text 3-5
 */
export const SPLIT_CONTENT_PRESET: LayoutPresetDefinition = {
  id: 'split-content',
  name: 'Split Content',
  description: 'Content split by image in middle',
  icon: 'split',
  config: {
    renderOrder: [
      {
        moduleId: 'textFields',
        submoduleId: 'field.0',
        id: 'text-field-0',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.1',
        id: 'text-field-1',
        marginBottom: '30px',
      },
      {
        moduleId: 'contentImage',
        id: 'content-image',
        position: {
          type: 'flex',
          flex: { grow: 1, shrink: 1 },
        },
        marginTop: '30px',
        marginBottom: '30px',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.2',
        id: 'text-field-2',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.3',
        id: 'text-field-3',
      },
      {
        moduleId: 'textFields',
        submoduleId: 'field.4',
        id: 'text-field-4',
      },
    ],
  },
};

/**
 * Registro de todos os presets
 */
export const LAYOUT_PRESETS: Record<string, LayoutPresetDefinition> = {
  stack: STACK_PRESET,
  'image-first': IMAGE_FIRST_PRESET,
  'image-last': IMAGE_LAST_PRESET,
  sandwich: SANDWICH_PRESET,
  'bullets-grid': BULLETS_GRID_PRESET,
  floating: FLOATING_PRESET,
  'bullets-first': BULLETS_FIRST_PRESET,
  'split-content': SPLIT_CONTENT_PRESET,
};

/**
 * Obtém um preset por ID
 */
export function getLayoutPreset(id: string): LayoutPresetDefinition | undefined {
  return LAYOUT_PRESETS[id];
}

/**
 * Lista todos os presets disponíveis
 */
export function listLayoutPresets(): LayoutPresetDefinition[] {
  return Object.values(LAYOUT_PRESETS);
}

/**
 * Cria composition config a partir de um preset
 */
export function createConfigFromPreset(
  presetId: string
): CompositionConfig | null {
  const preset = getLayoutPreset(presetId);
  if (!preset) return null;

  return {
    presetId: preset.id,
    ...preset.config,
    isCustom: false,
  };
}

/**
 * Preset padrão (stack)
 */
export const DEFAULT_LAYOUT_PRESET = STACK_PRESET;
