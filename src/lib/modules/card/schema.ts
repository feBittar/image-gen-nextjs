import { z } from 'zod';
import { gradientOverlaySchema } from '../types';

/**
 * Special position options for card
 */
export const SPECIAL_POSITIONS = [
  'none',
  'center',
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export type SpecialPosition = typeof SPECIAL_POSITIONS[number];

/**
 * Padding configuration for card
 */
export const cardPaddingSchema = z.object({
  top: z.number().default(60),
  right: z.number().default(60),
  bottom: z.number().default(60),
  left: z.number().default(60),
});

export type CardPadding = z.infer<typeof cardPaddingSchema>;

/**
 * Shadow configuration for card
 */
export const cardShadowSchema = z.object({
  enabled: z.boolean().default(false),
  x: z.number().default(0),
  y: z.number().default(10),
  blur: z.number().default(30),
  spread: z.number().default(0),
  color: z.string().default('rgba(0, 0, 0, 0.3)'),
});

export type CardShadow = z.infer<typeof cardShadowSchema>;

/**
 * Card Module Schema
 * Defines a centered container for content with customizable styling
 */
export const cardSchema = z.object({
  /** Enable/disable the card */
  enabled: z.boolean().default(true),

  /** Width as percentage of viewport (0-100) */
  width: z.number().min(0).max(100).default(90),

  /** Height as percentage of viewport (0-100) */
  height: z.number().min(0).max(100).default(90),

  /** Special position preset */
  specialPosition: z.enum(SPECIAL_POSITIONS).default('center'),

  /** Padding from edge when using special position (px) */
  positionPadding: z.number().min(0).default(40),

  /** Border radius in pixels */
  borderRadius: z.number().min(0).default(0),

  /** Background type: solid color or image */
  backgroundType: z.enum(['color', 'image']).default('color'),

  /** Background color (hex) */
  backgroundColor: z.string().default('#FFFFFF'),

  /** Background image URL */
  backgroundImage: z.string().default(''),

  /** Padding configuration */
  padding: cardPaddingSchema.default({
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  }),

  /** Gradient overlay configuration */
  gradientOverlay: gradientOverlaySchema.default({
    enabled: false,
    color: '#000000',
    startOpacity: 0.7,
    midOpacity: 0.3,
    endOpacity: 0,
    height: 50,
    direction: 'to top',
  }),

  /** Box shadow configuration */
  shadow: cardShadowSchema.default({
    enabled: false,
    x: 0,
    y: 10,
    blur: 30,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.3)',
  }),

  /** Layout direction for content modules (vertical or horizontal) */
  layoutDirection: z.enum(['column', 'row']).default('column'),

  /** Gap between content modules when horizontal */
  contentGap: z.string().default('12px'),

  /** Alignment of content modules when horizontal */
  contentAlign: z.enum(['flex-start', 'center', 'flex-end', 'stretch']).default('stretch'),
});

export type CardData = z.infer<typeof cardSchema>;
