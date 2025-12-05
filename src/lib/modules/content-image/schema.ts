import { z } from 'zod';

/**
 * Shadow configuration for content image
 */
export const contentImageShadowSchema = z.object({
  enabled: z.boolean().default(false),
  blur: z.number().min(0).default(20),
  spread: z.number().default(0),
  color: z.string().default('rgba(0, 0, 0, 0.3)'),
});

export type ContentImageShadow = z.infer<typeof contentImageShadowSchema>;

/**
 * Content Image Module Schema
 * Supports both single image and comparison mode (2 images side by side)
 */
export const contentImageSchema = z.object({
  /** Enable/disable the content image section */
  enabled: z.boolean().default(true),

  /** Image URL for single mode */
  url: z.string().default(''),

  /** Border radius in pixels */
  borderRadius: z.number().min(0).default(20),

  /** Maximum width as percentage of container (0-100) */
  maxWidth: z.number().min(0).max(100).default(100),

  /** Maximum height as percentage of container (0-100) */
  maxHeight: z.number().min(0).max(100).default(100),

  /** How the image fits in its container */
  objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),

  /** Vertical positioning of image within container */
  position: z.enum(['top', 'center', 'bottom']).default('center'),

  /** Shadow configuration */
  shadow: contentImageShadowSchema.default({
    enabled: false,
    blur: 20,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.3)',
  }),

  /** Display mode: single image or comparison (2 images side by side) */
  mode: z.enum(['single', 'comparison']).default('single'),

  /** Gap between images in comparison mode (px) */
  comparisonGap: z.number().min(0).default(40),

  /** Second image URL for comparison mode */
  url2: z.string().default(''),

  /** Layout width in horizontal card layouts (percentage or CSS value) */
  layoutWidth: z.string().default('50%'),

  /** Align-self in horizontal card layouts */
  alignSelf: z.enum(['auto', 'flex-start', 'center', 'flex-end', 'stretch']).default('stretch'),
});

export type ContentImageData = z.infer<typeof contentImageSchema>;
