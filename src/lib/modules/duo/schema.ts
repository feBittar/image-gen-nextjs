import { z } from 'zod';

/**
 * Duo Module Schema
 *
 * This module transforms any template into a 2-slide version by:
 * 1. Doubling the viewport width (1080px -> 2160px)
 * 2. Duplicating the content side-by-side (mirror or independent)
 * 3. Adding a central image that connects both slides
 * 4. Generating 2 separate PNG files
 */
export const duoModuleSchema = z.object({
  // Enable/disable the duo module
  enabled: z.boolean().default(false),

  // Operation mode
  mode: z.enum(['mirror', 'independent']).default('mirror'),
  // 'mirror' = duplicate the same content on both slides (current behavior)
  // 'independent' = allow different content per slide (like versus-duo)

  // Central PNG image that spans both slides
  centerImageUrl: z.string().default(''),

  // Image positioning and transformations
  centerImageOffsetX: z.number().min(-500).max(500).default(0),
  centerImageOffsetY: z.number().min(-500).max(500).default(0),
  centerImageScale: z.number().min(50).max(200).default(100), // Percentage
  centerImageRotation: z.number().min(-180).max(180).default(0), // Degrees

  // Content mirroring (deprecated - use mode instead, kept for backward compatibility)
  mirrorContent: z.boolean().default(false),

  // Slide-specific data (only used when mode = 'independent')
  // Each slide can have its own module data (textFields, contentImage, etc)
  slides: z.object({
    slide1: z.record(z.string(), z.any()).optional(),
    slide2: z.record(z.string(), z.any()).optional(),
  }).optional(),

  // Outline effect for center image
  outlineEffect: z.object({
    enabled: z.boolean().default(false),
    color: z.string().default('#000000'),
    size: z.number().min(0).max(50).default(10), // Pixels
  }).default({
    enabled: false,
    color: '#000000',
    size: 10,
  }),
});

export type DuoModuleConfig = z.infer<typeof duoModuleSchema>;

export const duoModuleDefaults: DuoModuleConfig = {
  enabled: false,
  mode: 'mirror',
  centerImageUrl: '',
  centerImageOffsetX: 0,
  centerImageOffsetY: 0,
  centerImageScale: 100,
  centerImageRotation: 0,
  mirrorContent: false,
  slides: undefined,
  outlineEffect: {
    enabled: false,
    color: '#000000',
    size: 10,
  },
};
