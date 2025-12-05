import { z } from 'zod';
import { textStyleSchema, styledChunkSchema } from '../types';

// ============================================================================
// IMAGE SIDE CONFIGURATION
// ============================================================================

/**
 * Shadow configuration for image side
 */
export const imageTextBoxShadowSchema = z.object({
  enabled: z.boolean().default(false),
  blur: z.number().min(0).default(20),
  spread: z.number().default(0),
  color: z.string().default('rgba(0, 0, 0, 0.3)'),
});

export type ImageTextBoxShadow = z.infer<typeof imageTextBoxShadowSchema>;

/**
 * Image side configuration
 */
export const imageTextBoxImageConfigSchema = z.object({
  /** Image URL */
  url: z.string().default(''),

  /** Border radius in pixels */
  borderRadius: z.number().min(0).default(20),

  /** Maximum width within its section (percentage) */
  maxWidth: z.number().min(0).max(100).default(100),

  /** Maximum height within its section (percentage) */
  maxHeight: z.number().min(0).max(100).default(100),

  /** How the image fits in its container */
  objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),

  /** Individual padding (pixels) */
  paddingTop: z.number().min(0).default(0),
  paddingRight: z.number().min(0).default(0),
  paddingBottom: z.number().min(0).default(0),
  paddingLeft: z.number().min(0).default(0),

  /** Shadow configuration */
  shadow: imageTextBoxShadowSchema.default({
    enabled: false,
    blur: 20,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.3)',
  }),
});

export type ImageTextBoxImageConfig = z.infer<typeof imageTextBoxImageConfigSchema>;

// ============================================================================
// TEXT SIDE CONFIGURATION
// ============================================================================

/**
 * Individual text field schema
 */
export const imageTextBoxTextFieldSchema = z.object({
  /** Text content */
  content: z.string().default(''),

  /** Style configuration */
  style: textStyleSchema.default({
    fontFamily: 'Arial',
    fontSize: '24px',
    fontWeight: '400',
    color: '#000000',
    textAlign: 'left',
    textTransform: 'none',
  }),

  /** Styled chunks for partial formatting (rich text) */
  styledChunks: z.array(styledChunkSchema).default([]),
});

export type ImageTextBoxTextField = z.infer<typeof imageTextBoxTextFieldSchema>;

/**
 * Text side configuration
 */
export const imageTextBoxTextConfigSchema = z.object({
  /** Number of text fields (1-5) */
  count: z.number().min(1).max(5).default(3),

  /** Gap between text fields (pixels) */
  gap: z.number().min(0).max(100).default(16),

  /** Vertical alignment within text section */
  verticalAlign: z.enum(['top', 'center', 'bottom']).default('center'),

  /** Individual padding (pixels) */
  paddingTop: z.number().min(0).default(0),
  paddingRight: z.number().min(0).default(0),
  paddingBottom: z.number().min(0).default(0),
  paddingLeft: z.number().min(0).default(0),

  /** Text fields array */
  fields: z.array(imageTextBoxTextFieldSchema).default([
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '32px',
        fontWeight: '700',
        color: '#000000',
        textAlign: 'left',
        textTransform: 'none',
      },
      styledChunks: [],
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontWeight: '400',
        color: '#333333',
        textAlign: 'left',
        textTransform: 'none',
      },
      styledChunks: [],
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontWeight: '400',
        color: '#666666',
        textAlign: 'left',
        textTransform: 'none',
      },
      styledChunks: [],
    },
  ]),
});

export type ImageTextBoxTextConfig = z.infer<typeof imageTextBoxTextConfigSchema>;

// ============================================================================
// MAIN SCHEMA
// ============================================================================

/**
 * Predefined split ratios
 */
export const SPLIT_RATIO_OPTIONS = [
  { label: '50% / 50%', value: '50-50' },
  { label: '40% / 60%', value: '40-60' },
  { label: '60% / 40%', value: '60-40' },
  { label: '30% / 70%', value: '30-70' },
  { label: '70% / 30%', value: '70-30' },
  { label: 'Custom', value: 'custom' },
] as const;

/**
 * Order options
 */
export const ORDER_OPTIONS = [
  { label: 'Image Left / Text Right', value: 'image-left' },
  { label: 'Text Left / Image Right', value: 'text-left' },
] as const;

/**
 * Content alignment options
 */
export const CONTENT_ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Bottom' },
  { value: 'stretch', label: 'Stretch' },
] as const;

/**
 * Image + Text Box Module Schema
 */
export const imageTextBoxSchema = z.object({
  /** Enable/disable the module */
  enabled: z.boolean().default(true),

  // === BOX CONFIGURATION ===

  /** Width of the box (CSS value: %, px) */
  width: z.string().default('100%'),

  /** Height of the box (CSS value: %, px, auto) */
  height: z.string().default('100%'),

  /** Split ratio preset or 'custom' */
  splitRatio: z.enum(['50-50', '40-60', '60-40', '30-70', '70-30', 'custom']).default('50-50'),

  /** Custom left side percentage (used when splitRatio is 'custom') */
  customLeftPercent: z.number().min(10).max(90).default(50),

  /** Order of elements: image-left or text-left */
  order: z.enum(['image-left', 'text-left']).default('image-left'),

  /** Gap between the two sides (pixels) */
  gap: z.number().min(0).max(100).default(24),

  /** Vertical alignment of content within the box */
  contentAlign: z.enum(['flex-start', 'center', 'flex-end', 'stretch']).default('center'),

  // === LAYOUT IN PARENT CONTAINER ===

  /** Layout width when inside horizontal card layout (CSS value) */
  layoutWidth: z.string().default('100%'),

  /** Align-self in parent flex container */
  alignSelf: z.enum(['auto', 'flex-start', 'center', 'flex-end', 'stretch']).default('stretch'),

  // === SIDE CONFIGURATIONS ===

  /** Image side configuration */
  imageConfig: imageTextBoxImageConfigSchema.default({
    url: '',
    borderRadius: 20,
    maxWidth: 100,
    maxHeight: 100,
    objectFit: 'cover',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    shadow: {
      enabled: false,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    },
  }),

  /** Text side configuration */
  textConfig: imageTextBoxTextConfigSchema.default({
    count: 3,
    gap: 16,
    verticalAlign: 'center',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fields: [],
  }),
});

export type ImageTextBoxData = z.infer<typeof imageTextBoxSchema>;

/**
 * Default values for the module
 */
export const imageTextBoxDefaults: ImageTextBoxData = {
  enabled: true,
  width: '100%',
  height: '100%',
  splitRatio: '50-50',
  customLeftPercent: 50,
  order: 'image-left',
  gap: 24,
  contentAlign: 'center',
  layoutWidth: '100%',
  alignSelf: 'stretch',
  imageConfig: {
    url: '',
    borderRadius: 20,
    maxWidth: 100,
    maxHeight: 100,
    objectFit: 'cover',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    shadow: {
      enabled: false,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    },
  },
  textConfig: {
    count: 3,
    gap: 16,
    verticalAlign: 'center',
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fields: [
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '32px',
          fontWeight: '700',
          color: '#000000',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontWeight: '400',
          color: '#333333',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
      },
      {
        content: '',
        style: {
          fontFamily: 'Arial',
          fontSize: '18px',
          fontWeight: '400',
          color: '#666666',
          textAlign: 'left',
          textTransform: 'none',
        },
        styledChunks: [],
      },
    ],
  },
};
