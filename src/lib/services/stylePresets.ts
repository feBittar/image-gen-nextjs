/**
 * Style Presets Service
 *
 * Provides predefined style presets for text styling in image generation.
 * Presets can be applied to titles, subtitles, and other text elements.
 */

export interface StylePreset {
  name: string;
  description: string;
  styles: {
    color?: string;
    textShadow?: string;
    fontWeight?: string | number;
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
    fontSize?: string;
    fontFamily?: string;
    letterSpacing?: string;
    lineHeight?: string | number;
    textDecoration?: string;
    background?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    opacity?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    [key: string]: any;
  };
  category?: string;
}

/**
 * Predefined style presets
 */
export const STYLE_PRESETS: Record<string, StylePreset> = {
  // NEON STYLES
  neon: {
    name: 'Neon',
    description: 'Cores vibrantes com sombras fortes - estilo neon futurista',
    category: 'vibrant',
    styles: {
      color: '#FF00FF',
      textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  },

  neonBlue: {
    name: 'Neon Blue',
    description: 'Neon azul eletrico com brilho intenso',
    category: 'vibrant',
    styles: {
      color: '#00F0FF',
      textShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 30px #00F0FF, 0 0 40px #0080FF',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px'
    }
  },

  neonGreen: {
    name: 'Neon Green',
    description: 'Verde neon vibrante com efeito radioativo',
    category: 'vibrant',
    styles: {
      color: '#39FF14',
      textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  },

  // MINIMAL STYLES
  minimal: {
    name: 'Minimal',
    description: 'Design limpo e minimalista com tipografia elegante',
    category: 'clean',
    styles: {
      color: '#2C3E50',
      fontWeight: '300',
      textTransform: 'none',
      letterSpacing: '1px',
      lineHeight: 1.6
    }
  },

  minimalLight: {
    name: 'Minimal Light',
    description: 'Minimalismo com cores claras e delicadas',
    category: 'clean',
    styles: {
      color: '#FFFFFF',
      fontWeight: '200',
      textTransform: 'none',
      letterSpacing: '2px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
      lineHeight: 1.8
    }
  },

  // BOLD STYLES
  bold: {
    name: 'Bold',
    description: 'Texto pesado e impactante com forte presenca visual',
    category: 'impact',
    styles: {
      color: '#000000',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '-1px',
      textShadow: '3px 3px 0px #FFD700',
      lineHeight: 1.2
    }
  },

  boldOutline: {
    name: 'Bold Outline',
    description: 'Texto pesado com contorno definido',
    category: 'impact',
    styles: {
      color: '#FFFFFF',
      fontWeight: '900',
      textTransform: 'uppercase',
      textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
      letterSpacing: '1px'
    }
  },

  // PASTEL STYLES
  pastel: {
    name: 'Pastel',
    description: 'Cores suaves e pasteis para design delicado',
    category: 'soft',
    styles: {
      color: '#FFB6C1',
      fontWeight: '400',
      textTransform: 'none',
      textShadow: '2px 2px 4px rgba(255,182,193,0.3)',
      letterSpacing: '1px'
    }
  },

  pastelBlue: {
    name: 'Pastel Blue',
    description: 'Azul pastel suave e relaxante',
    category: 'soft',
    styles: {
      color: '#AEC6CF',
      fontWeight: '400',
      textTransform: 'none',
      textShadow: '2px 2px 4px rgba(174,198,207,0.3)',
      letterSpacing: '1px'
    }
  },

  // GRADIENT STYLES
  gradient: {
    name: 'Gradient',
    description: 'Texto com gradiente vibrante',
    category: 'modern',
    styles: {
      background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
      color: 'transparent',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  },

  gradientGold: {
    name: 'Gradient Gold',
    description: 'Gradiente dourado luxuoso',
    category: 'modern',
    styles: {
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      color: 'transparent',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      letterSpacing: '3px'
    }
  },

  // RETRO STYLES
  retro: {
    name: 'Retro',
    description: 'Estilo retro vintage dos anos 80',
    category: 'vintage',
    styles: {
      color: '#FF6B9D',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '3px 3px 0px #C44569, 6px 6px 0px #FFA07A',
      letterSpacing: '2px'
    }
  },

  retroWave: {
    name: 'Retro Wave',
    description: 'Synthwave retro futurista',
    category: 'vintage',
    styles: {
      color: '#FF00FF',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '0 0 10px #FF00FF, 3px 3px 0px #00FFFF, 6px 6px 0px #FFD700',
      letterSpacing: '3px'
    }
  },

  // ELEGANT STYLES
  elegant: {
    name: 'Elegant',
    description: 'Tipografia elegante e sofisticada',
    category: 'luxury',
    styles: {
      color: '#2C3E50',
      fontWeight: '300',
      textTransform: 'capitalize',
      letterSpacing: '4px',
      fontFamily: 'serif',
      lineHeight: 1.8
    }
  },

  elegantGold: {
    name: 'Elegant Gold',
    description: 'Elegancia dourada premium',
    category: 'luxury',
    styles: {
      color: '#D4AF37',
      fontWeight: '400',
      textTransform: 'capitalize',
      letterSpacing: '5px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
      fontFamily: 'serif'
    }
  },

  // COMIC STYLES
  comic: {
    name: 'Comic',
    description: 'Estilo de quadrinhos com contorno forte',
    category: 'fun',
    styles: {
      color: '#FFD700',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
      letterSpacing: '1px'
    }
  },

  // GLASS MORPHISM
  glass: {
    name: 'Glass',
    description: 'Efeito vidro fosco moderno',
    category: 'modern',
    styles: {
      color: '#FFFFFF',
      fontWeight: '500',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '20px 40px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  },

  // SHADOW STYLES
  shadowDeep: {
    name: 'Shadow Deep',
    description: 'Sombra profunda e dramatica',
    category: 'dramatic',
    styles: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textShadow: '0 5px 10px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.4), 0 15px 30px rgba(0,0,0,0.3)',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  },

  // FIRE STYLE
  fire: {
    name: 'Fire',
    description: 'Efeito de fogo ardente',
    category: 'dramatic',
    styles: {
      color: '#FF4500',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '0 0 5px #FF4500, 0 0 10px #FF4500, 0 0 15px #FF8C00, 0 0 20px #FFD700',
      letterSpacing: '2px'
    }
  },

  // ICE STYLE
  ice: {
    name: 'Ice',
    description: 'Efeito gelado crystallino',
    category: 'cool',
    styles: {
      color: '#B0E0E6',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textShadow: '0 0 5px #B0E0E6, 0 0 10px #87CEEB, 0 0 15px #4682B4, 2px 2px 2px rgba(255,255,255,0.5)',
      letterSpacing: '3px'
    }
  }
};

/**
 * Get a specific preset by name
 * @param name - Preset name
 * @returns StylePreset object or null if not found
 */
export function getPreset(name: string): StylePreset | null {
  return STYLE_PRESETS[name] || null;
}

/**
 * List all available presets
 * @returns Array of all preset names and descriptions
 */
export function listPresets(): Array<{ id: string; name: string; description: string; category?: string }> {
  return Object.keys(STYLE_PRESETS).map(id => ({
    id,
    name: STYLE_PRESETS[id].name,
    description: STYLE_PRESETS[id].description,
    category: STYLE_PRESETS[id].category
  }));
}

/**
 * Get presets by category
 * @param category - Category name
 * @returns Array of presets in that category
 */
export function getPresetsByCategory(category: string): StylePreset[] {
  return Object.values(STYLE_PRESETS).filter(preset => preset.category === category);
}

/**
 * Get all categories
 * @returns Array of unique category names
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  Object.values(STYLE_PRESETS).forEach(preset => {
    if (preset.category) {
      categories.add(preset.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Apply preset styles to a CSS style object
 * @param preset - Preset name or StylePreset object
 * @param baseStyles - Base styles to merge with preset
 * @returns Merged style object
 */
export function applyPreset(
  preset: string | StylePreset,
  baseStyles: Record<string, any> = {}
): Record<string, any> {
  const presetObj = typeof preset === 'string' ? getPreset(preset) : preset;

  if (!presetObj) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    ...presetObj.styles
  };
}

/**
 * Convert style object to CSS string
 * @param styles - Style object
 * @returns CSS string
 */
export function styleToCss(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}
