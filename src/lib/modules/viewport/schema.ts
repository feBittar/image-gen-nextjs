import { z } from 'zod';
import { gradientOverlaySchema } from '../types';

/**
 * Content Wrapper padding schema
 */
export const contentWrapperPaddingSchema = z.object({
  top: z.number().min(0).default(0),
  right: z.number().min(0).default(0),
  bottom: z.number().min(0).default(0),
  left: z.number().min(0).default(0),
});

/**
 * Content Wrapper configuration (used when card is inactive)
 */
export const contentWrapperSchema = z.object({
  // Padding
  padding: contentWrapperPaddingSchema.default({ top: 0, right: 0, bottom: 0, left: 0 }),

  // Gap between content modules
  gap: z.number().min(0).default(12),

  // Layout direction
  layoutDirection: z.enum(['column', 'row']).default('column'),

  // Content alignment (for row layout)
  contentAlign: z.enum(['flex-start', 'center', 'flex-end', 'stretch', 'space-between']).default('stretch'),

  // Justify content (for column layout)
  justifyContent: z.enum(['flex-start', 'center', 'flex-end', 'space-between', 'space-around']).default('flex-start'),
});

export type ContentWrapperConfig = z.infer<typeof contentWrapperSchema>;

/**
 * Schema Zod para o módulo Viewport
 * Define background (cor ou imagem), blur overlay, e gradient overlay
 */
export const viewportSchema = z.object({
  // Tipo de background: cor sólida ou imagem
  backgroundType: z.enum(['color', 'image']).default('color'),

  // Cor de fundo (quando backgroundType = 'color')
  backgroundColor: z.string().default('#ffffff'),

  // URL da imagem de fundo (quando backgroundType = 'image')
  backgroundImage: z.string().default(''),

  // Blur overlay (backdrop-filter)
  blurEnabled: z.boolean().default(false),
  blurAmount: z.number().min(0).max(50).default(10), // em px

  // Gradient overlay (sobre o background)
  gradientOverlay: gradientOverlaySchema,

  // Content wrapper configuration (used when card is inactive)
  contentWrapper: contentWrapperSchema.default({
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    gap: 12,
    layoutDirection: 'column',
    contentAlign: 'stretch',
    justifyContent: 'flex-start',
  }),
});

export type ViewportData = z.infer<typeof viewportSchema>;

/**
 * Valores padrão para o módulo Viewport
 */
export const viewportDefaults: ViewportData = {
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  backgroundImage: '',
  blurEnabled: false,
  blurAmount: 10,
  gradientOverlay: {
    enabled: false,
    color: '#000000',
    startOpacity: 0.7,
    midOpacity: 0.3,
    endOpacity: 0,
    height: 50,
    direction: 'to top',
    blendMode: 'normal',
  },
  contentWrapper: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    gap: 12,
    layoutDirection: 'column',
    contentAlign: 'stretch',
    justifyContent: 'flex-start',
  },
};
