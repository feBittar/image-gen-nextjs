import { z } from 'zod';
import { textStyleSchema } from '../types';

/**
 * Corner element type
 */
export const cornerTypeEnum = z.enum(['none', 'text', 'svg']);
export type CornerType = z.infer<typeof cornerTypeEnum>;

/**
 * Special position for corner placement
 */
export const cornerSpecialPositionEnum = z.enum([
  'none',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]);
export type CornerSpecialPosition = z.infer<typeof cornerSpecialPositionEnum>;

/**
 * Single corner configuration
 */
export const cornerSchema = z.object({
  /** Type of corner content */
  type: cornerTypeEnum.default('none'),

  /** Text content (when type = 'text') */
  text: z.string().default(''),

  /** Text styling (when type = 'text') */
  textStyle: textStyleSchema.default({
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    textDecoration: 'none',
  }),

  /** Background enabled for text */
  backgroundEnabled: z.boolean().default(false),

  /** SVG content inline (when type = 'svg') */
  svgContent: z.string().default(''),

  /** SVG URL (when type = 'svg') */
  svgUrl: z.string().default(''),

  /** SVG color override */
  svgColor: z.string().default('#ffffff'),

  /** SVG width */
  svgWidth: z.string().default('60px'),

  /** SVG height */
  svgHeight: z.string().default('60px'),

  /** Special position preset */
  specialPosition: cornerSpecialPositionEnum.default('none'),

  /** Padding from edge (X axis) in pixels */
  paddingX: z.number().min(0).max(300).default(40),

  /** Padding from edge (Y axis) in pixels */
  paddingY: z.number().min(0).max(300).default(40),
});

export type Corner = z.infer<typeof cornerSchema>;

/**
 * Corners Module Schema
 * Array of 4 corners (top-left, top-right, bottom-left, bottom-right)
 */
export const cornersSchema = z.object({
  /** Array of 4 corners */
  corners: z.array(cornerSchema).length(4).default([
    // Corner 1: Top Left
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'top-left',
      paddingX: 40,
      paddingY: 40,
    },
    // Corner 2: Top Right
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'top-right',
      paddingX: 40,
      paddingY: 40,
    },
    // Corner 3: Bottom Left
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'bottom-left',
      paddingX: 40,
      paddingY: 40,
    },
    // Corner 4: Bottom Right
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'bottom-right',
      paddingX: 40,
      paddingY: 40,
    },
  ]),
});

export type CornersData = z.infer<typeof cornersSchema>;

/**
 * Default values for Corners Module
 */
export const cornersDefaults: CornersData = {
  corners: [
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'top-left',
      paddingX: 40,
      paddingY: 40,
    },
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'top-right',
      paddingX: 40,
      paddingY: 40,
    },
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'bottom-left',
      paddingX: 40,
      paddingY: 40,
    },
    {
      type: 'none',
      text: '',
      textStyle: {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        fontWeight: '900',
        color: '#000000',
        textDecoration: 'none',
      },
      backgroundEnabled: false,
      svgContent: '',
      svgUrl: '',
      svgColor: '#ffffff',
      svgWidth: '60px',
      svgHeight: '60px',
      specialPosition: 'bottom-right',
      paddingX: 40,
      paddingY: 40,
    },
  ],
};
