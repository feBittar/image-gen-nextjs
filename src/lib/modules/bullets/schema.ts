import { z } from 'zod';
import { textStyleSchema, styledChunkSchema } from '../types';

/**
 * Individual bullet item configuration
 */
export const bulletItemSchema = z.object({
  /** Whether this bullet is enabled/visible */
  enabled: z.boolean().default(true),

  /** Icon URL or emoji character */
  icon: z.string().default(''),

  /** Icon type: 'url' for image, 'emoji' for emoji, 'number' for auto-numbering */
  iconType: z.enum(['url', 'emoji', 'number']).default('emoji'),

  /** Text content */
  text: z.string().default(''),

  /** Styled chunks for partial formatting */
  styledChunks: z.array(styledChunkSchema).default([]),

  /** Background color for this bullet card */
  backgroundColor: z.string().default('#FFFFFF'),

  /** Text style configuration for this bullet */
  textStyle: textStyleSchema.default({
    fontFamily: 'Arial',
    fontSize: '18px',
    fontWeight: '400',
    color: '#000000',
    textAlign: 'left',
  }),
});

export type BulletItem = z.infer<typeof bulletItemSchema>;

/**
 * Bullets Module Schema
 * Displays bullet points/cards with icons and text
 */
export const bulletsSchema = z.object({
  /** Array of bullet items (3-5 items) */
  items: z.array(bulletItemSchema).min(3).max(5).default([
    {
      enabled: true,
      icon: '✓',
      iconType: 'emoji',
      text: '',
      styledChunks: [],
      backgroundColor: '#FFFFFF',
      textStyle: {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontWeight: '400',
        color: '#000000',
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
        fontSize: '18px',
        fontWeight: '400',
        color: '#000000',
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
        fontSize: '18px',
        fontWeight: '400',
        color: '#000000',
        textAlign: 'left',
      },
    },
  ]),

  /** Layout direction */
  layout: z.enum(['vertical', 'horizontal', 'grid']).default('vertical'),

  /** Gap between bullet cards (pixels) */
  gap: z.number().min(0).max(100).default(15),

  /** Padding inside each bullet card */
  itemPadding: z.string().default('16px 20px'),

  /** Border radius for bullet cards */
  borderRadius: z.number().min(0).max(50).default(8),

  /** Icon size (pixels) */
  iconSize: z.number().min(20).max(100).default(48),

  /** Icon background color */
  iconBackgroundColor: z.string().default('#000000'),

  /** Icon color (for SVG or text) */
  iconColor: z.string().default('#FFFFFF'),

  /** Gap between icon and text inside each card */
  iconGap: z.number().min(0).max(50).default(16),

  /** Card shadow */
  cardShadow: z.string().default('0 2px 8px rgba(0, 0, 0, 0.1)'),

  /** Minimum height for cards */
  cardMinHeight: z.number().min(0).max(200).default(0),
});

export type BulletsData = z.infer<typeof bulletsSchema>;
