import { z } from 'zod';
import { specialPositionEnum } from '../types';

/**
 * CSS filter options for logo styling
 */
export const logoFilterEnum = z.enum([
  'none',
  'grayscale',
  'invert',
  'brightness',
  'contrast',
  'sepia',
]);
export type LogoFilter = z.infer<typeof logoFilterEnum>;

/**
 * Logo Module Schema
 * Displays a single logo image that can be positioned anywhere on the viewport
 */
export const logoSchema = z.object({
  /** Whether the logo is enabled */
  enabled: z.boolean().default(false),

  /** Logo image URL */
  logoUrl: z.string().default(''),

  /** Logo width (px, %, or 'auto') */
  width: z.string().default('120px'),

  /** Logo height (px, %, or 'auto') */
  height: z.string().default('auto'),

  /** Special position preset (or 'none' for manual positioning) */
  specialPosition: specialPositionEnum.default('top-left'),

  /** Manual position - top (only used when specialPosition is 'none') */
  top: z.union([z.string(), z.number()]).optional(),

  /** Manual position - left (only used when specialPosition is 'none') */
  left: z.union([z.string(), z.number()]).optional(),

  /** Manual position - right (only used when specialPosition is 'none') */
  right: z.union([z.string(), z.number()]).optional(),

  /** Manual position - bottom (only used when specialPosition is 'none') */
  bottom: z.union([z.string(), z.number()]).optional(),

  /** Padding from edge (X axis) in pixels (used with special positions) */
  paddingX: z.number().min(0).max(500).default(40),

  /** Padding from edge (Y axis) in pixels (used with special positions) */
  paddingY: z.number().min(0).max(500).default(40),

  /** Logo opacity (0-1) */
  opacity: z.number().min(0).max(1).default(1),

  /** CSS filter effect */
  filter: logoFilterEnum.default('none'),

  /** Filter intensity (0-100) - used for brightness, contrast, etc. */
  filterIntensity: z.number().min(0).max(200).default(100),
});

export type LogoData = z.infer<typeof logoSchema>;

/**
 * Default values for Logo Module
 */
export const logoDefaults: LogoData = {
  enabled: false,
  logoUrl: '',
  width: '120px',
  height: 'auto',
  specialPosition: 'top-left',
  top: undefined,
  left: undefined,
  right: undefined,
  bottom: undefined,
  paddingX: 40,
  paddingY: 40,
  opacity: 1,
  filter: 'none',
  filterIntensity: 100,
};
