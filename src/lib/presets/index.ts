import { TemplatePreset } from '../modules/types';

/**
 * TEMPLATE PRESETS
 *
 * Presets are pre-configured combinations of modules that serve as starting points
 * for different types of social media graphics. Each preset defines:
 *
 * - defaultModules: Which modules are enabled by default
 * - moduleDefaults: Custom default values that override module defaults
 *
 * Users can then enable/disable modules and customize values as needed.
 */

// ============================================================================
// STACK PRESET - Classic Stacked Text Layout
// ============================================================================

export const stackPreset: TemplatePreset = {
  id: 'stack',
  name: 'Stack Layout',
  description: 'Classic stack layout with text fields, content image, and corner elements. Ideal for informative posts with multiple text levels.',
  thumbnail: '/thumbnails/stack.png',
  defaultModules: [
    'viewport',
    'card',
    'textFields',
    'contentImage',
    'corners',
    'logo',
  ],
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      blurEnabled: false,
      gradientOverlay: {
        enabled: false,
      },
    },
    card: {
      enabled: true,
      width: 85,
      height: 85,
      borderRadius: 20,
      backgroundType: 'color',
      backgroundColor: '#f5f5f5',
      padding: {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      },
      gradientOverlay: {
        enabled: false,
      },
      shadow: {
        enabled: false,
      },
    },
    textFields: {
      count: 5,
      gap: 20,
      verticalAlign: 'bottom',
      fields: [
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '68px',
            fontWeight: '700',
            color: '#000000',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontWeight: '600',
            color: '#000000',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontWeight: '500',
            color: '#000000',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontWeight: '400',
            color: '#000000',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontWeight: '400',
            color: '#000000',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
      ],
    },
    contentImage: {
      enabled: true,
      url: '',
      borderRadius: 20,
      maxWidth: 100,
      maxHeight: 100,
      mode: 'single',
    },
    corners: {
      corners: [
        {
          enabled: false,
          type: 'text',
          text: '',
          svgContent: '',
          svgUrl: '',
          specialPosition: 'top-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          svgContent: '',
          svgUrl: '',
          specialPosition: 'top-right',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          svgContent: '',
          svgUrl: '',
          specialPosition: 'bottom-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          svgContent: '',
          svgUrl: '',
          specialPosition: 'bottom-right',
          paddingX: 5,
          paddingY: 5,
        },
      ],
    },
    logo: {
      enabled: false,
      logoUrl: '',
      width: 'auto',
      height: 80,
      specialPosition: 'top-right',
      paddingX: 5,
      paddingY: 5,
      opacity: 1,
    },
  },
};

// ============================================================================
// VERSUS DUO PRESET - Split Comparison with Duo Slides
// ============================================================================

export const versusDuoPreset: TemplatePreset = {
  id: 'versus-duo',
  name: 'Versus Duo',
  description: 'Two-slide comparison with central image split. Perfect for before/after reveals and transformations.',
  thumbnail: '/thumbnails/versus-duo.png',
  defaultModules: [
    'viewport',
    'card',
    'textFields',
    'corners',
    'duo',
  ],
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#FFFFFF',
      blurEnabled: false,
      gradientOverlay: {
        enabled: false,
      },
    },
    card: {
      enabled: false, // Duo templates often don't use cards
    },
    textFields: {
      count: 4, // 2 per slide
      gap: 40,
      verticalAlign: 'center',
      fields: [
        // Slide 1 Text 1
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '60px',
            fontWeight: '900',
            color: '#333333',
            textAlign: 'center',
            textTransform: 'uppercase',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // Slide 1 Text 2
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '40px',
            fontWeight: '600',
            color: '#666666',
            textAlign: 'center',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // Slide 2 Text 1
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '60px',
            fontWeight: '900',
            color: '#333333',
            textAlign: 'center',
            textTransform: 'uppercase',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // Slide 2 Text 2
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '40px',
            fontWeight: '600',
            color: '#666666',
            textAlign: 'center',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
      ],
    },
    corners: {
      corners: [
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-right',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-right',
          paddingX: 5,
          paddingY: 5,
        },
      ],
    },
    duo: {
      enabled: true,
      centerImageUrl: '',
      centerImageOffsetX: 0,
      centerImageOffsetY: 0,
      centerImageScale: 100,
      centerImageRotation: 0,
      containerPadding: {
        top: 100,
        right: 80,
        bottom: 100,
        left: 80,
      },
    },
  },
};

// ============================================================================
// BULLET CARDS PRESET - Bullet Points with Icons
// ============================================================================

export const bulletCardsPreset: TemplatePreset = {
  id: 'bullet-cards',
  name: 'Bullet Cards',
  description: 'Header, footer, and bullet point cards with icons. Perfect for case studies and educational content.',
  thumbnail: '/thumbnails/bullet-cards.png',
  defaultModules: [
    'viewport',
    'card',
    'textFields',
    'bullets',
    'corners',
    'logo',
  ],
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#f7fafc',
      blurEnabled: false,
      gradientOverlay: {
        enabled: false,
      },
    },
    card: {
      enabled: false, // Bullets create their own card structure
    },
    textFields: {
      count: 2, // Header and footer
      gap: 30,
      verticalAlign: 'top',
      fields: [
        // Header text
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '52px',
            fontWeight: '700',
            color: '#1a365d',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // Footer text
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a365d',
            textAlign: 'left',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
      ],
    },
    bullets: {
      items: [
        {
          enabled: true,
          icon: '✓',
          iconType: 'emoji',
          text: '',
          styledChunks: [],
          backgroundColor: '#FFFFFF',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontWeight: '400',
            color: '#2d3748',
            textAlign: 'left',
          },
        },
        {
          enabled: true,
          icon: '✓',
          iconType: 'emoji',
          text: '',
          styledChunks: [],
          backgroundColor: '#FFFFFF',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontWeight: '400',
            color: '#2d3748',
            textAlign: 'left',
          },
        },
        {
          enabled: true,
          icon: '✓',
          iconType: 'emoji',
          text: '',
          styledChunks: [],
          backgroundColor: '#FFFFFF',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontWeight: '400',
            color: '#2d3748',
            textAlign: 'left',
          },
        },
        {
          enabled: true,
          icon: '✓',
          iconType: 'emoji',
          text: '',
          styledChunks: [],
          backgroundColor: '#FFFFFF',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontWeight: '400',
            color: '#2d3748',
            textAlign: 'left',
          },
        },
        {
          enabled: true,
          icon: '✓',
          iconType: 'emoji',
          text: '',
          styledChunks: [],
          backgroundColor: '#FFFFFF',
          textStyle: {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontWeight: '400',
            color: '#2d3748',
            textAlign: 'left',
          },
        },
      ],
      layout: 'vertical',
      gap: 20,
      itemPadding: '24px 28px',
      borderRadius: 16,
      iconSize: 48,
      iconBackgroundColor: '#fed7d7',
      iconColor: '#c53030',
      iconGap: 20,
      cardShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      cardMinHeight: 80,
    },
    corners: {
      corners: [
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-right',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-right',
          paddingX: 5,
          paddingY: 5,
        },
      ],
    },
    logo: {
      enabled: false,
      logoUrl: '',
      width: 'auto',
      height: 60,
      specialPosition: 'top-right',
      paddingX: 5,
      paddingY: 5,
      opacity: 1,
    },
  },
};

// ============================================================================
// FITFEED CAPA PRESET - FitFeed Cover Style
// ============================================================================

export const fitfeedCapaPreset: TemplatePreset = {
  id: 'fitfeed-capa',
  name: 'FitFeed Capa',
  description: 'Cover-style template with bold title, subtitle, and logo. Perfect for fitness/wellness content with background images.',
  thumbnail: '/thumbnails/fitfeed-capa.png',
  defaultModules: [
    'viewport',
    'textFields',
    'freeText',
    'corners',
    'logo',
  ],
  moduleDefaults: {
    viewport: {
      backgroundType: 'image',
      backgroundColor: '#000000',
      backgroundImage: '',
      blurEnabled: false,
      gradientOverlay: {
        enabled: true,
        color: '#000000',
        startOpacity: 0.7,
        midOpacity: 0.4,
        endOpacity: 0.1,
        height: 60,
        direction: 'to top',
        blendMode: 'normal',
      },
    },
    textFields: {
      count: 2,
      gap: 20,
      verticalAlign: 'bottom',
      fields: [
        // Title
        {
          content: '',
          style: {
            fontFamily: 'Bebas Neue',
            fontSize: '72px',
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'left',
            textTransform: 'uppercase',
            padding: '10px 20px',
            backgroundColor: '#000000',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // Subtitle
        {
          content: '',
          style: {
            fontFamily: 'Montserrat',
            fontSize: '24px',
            fontWeight: '500',
            color: '#ffffff',
            textAlign: 'left',
            textTransform: 'none',
            backgroundColor: 'transparent',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
      ],
    },
    freeText: {
      elements: [
        // CTA or label text
        {
          enabled: false,
          content: '',
          style: {
            fontFamily: 'Montserrat',
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 16px',
            borderRadius: '4px',
          },
          specialPosition: 'bottom-right',
          paddingX: 5,
          paddingY: 5,
        },
      ],
    },
    corners: {
      corners: [
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'top-right',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-left',
          paddingX: 5,
          paddingY: 5,
        },
        {
          enabled: false,
          type: 'text',
          text: '',
          specialPosition: 'bottom-right',
          paddingX: 5,
          paddingY: 5,
        },
      ],
    },
    logo: {
      enabled: false,
      logoUrl: '',
      width: 'auto',
      height: 100,
      specialPosition: 'top-left',
      paddingX: 5,
      paddingY: 5,
      opacity: 0.9,
    },
  },
};

// ============================================================================
// MINIMAL PRESET - Clean Starting Point
// ============================================================================

export const minimalPreset: TemplatePreset = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, minimal starting point with just the basics. Perfect for building custom layouts from scratch.',
  thumbnail: '/thumbnails/minimal.png',
  defaultModules: [
    'viewport',
    'card',
    'textFields',
  ],
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      blurEnabled: false,
      gradientOverlay: {
        enabled: false,
      },
    },
    card: {
      enabled: true,
      width: 90,
      height: 90,
      borderRadius: 0,
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      padding: {
        top: 80,
        right: 80,
        bottom: 80,
        left: 80,
      },
      gradientOverlay: {
        enabled: false,
      },
      shadow: {
        enabled: false,
      },
    },
    textFields: {
      count: 3,
      gap: 30,
      verticalAlign: 'center',
      fields: [
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontWeight: '700',
            color: '#000000',
            textAlign: 'center',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontWeight: '400',
            color: '#666666',
            textAlign: 'center',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontWeight: '400',
            color: '#999999',
            textAlign: 'center',
            textTransform: 'none',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
      ],
    },
  },
};

// ============================================================================
// PRESET REGISTRY
// ============================================================================

/**
 * Registry of all available presets
 */
export const presetRegistry: Record<string, TemplatePreset> = {
  stack: stackPreset,
  'versus-duo': versusDuoPreset,
  'bullet-cards': bulletCardsPreset,
  'fitfeed-capa': fitfeedCapaPreset,
  minimal: minimalPreset,
};

/**
 * Get a preset by ID
 */
export function getPreset(id: string): TemplatePreset | undefined {
  return presetRegistry[id];
}

/**
 * List all available presets
 */
export function listPresets(): TemplatePreset[] {
  return Object.values(presetRegistry);
}

/**
 * Get preset IDs
 */
export function getPresetIds(): string[] {
  return Object.keys(presetRegistry);
}

/**
 * Check if a preset exists
 */
export function hasPreset(id: string): boolean {
  return id in presetRegistry;
}

/**
 * Get default modules for a preset
 */
export function getPresetModules(presetId: string): string[] {
  const preset = getPreset(presetId);
  return preset?.defaultModules || [];
}

/**
 * Get module defaults for a preset
 */
export function getPresetModuleDefaults(
  presetId: string,
  moduleId: string
): Record<string, unknown> | undefined {
  const preset = getPreset(presetId);
  return preset?.moduleDefaults[moduleId];
}

/**
 * Apply preset to module editor state
 * Returns enabled modules and their data
 */
export function applyPreset(presetId: string): {
  enabledModules: string[];
  moduleData: Record<string, Record<string, unknown>>;
} | null {
  const preset = getPreset(presetId);
  if (!preset) return null;

  return {
    enabledModules: preset.defaultModules,
    moduleData: preset.moduleDefaults,
  };
}

/**
 * Register a new preset dynamically
 */
export function registerPreset(preset: TemplatePreset): void {
  if (presetRegistry[preset.id]) {
    console.warn(`Preset "${preset.id}" already registered. Overwriting.`);
  }
  presetRegistry[preset.id] = preset;
}

/**
 * Remove a preset from registry
 */
export function unregisterPreset(id: string): boolean {
  if (presetRegistry[id]) {
    delete presetRegistry[id];
    return true;
  }
  return false;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Note: Presets are already exported via 'export const' declarations above

// Export types
export type { TemplatePreset } from '../modules/types';
