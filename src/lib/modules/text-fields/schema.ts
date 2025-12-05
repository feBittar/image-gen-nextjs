import { z } from 'zod';
import { textStyleSchema, styledChunkSchema, positionSchema, specialPositionEnum } from '../types';

/**
 * Text field configuration
 */
export const textFieldSchema = z.object({
  /** Text content */
  content: z.string().default(''),

  /** Style configuration for the text field */
  style: textStyleSchema.default({
    fontFamily: 'Arial',
    fontSize: '24px',
    fontWeight: '400',
    color: '#000000',
    textAlign: 'left',
    textTransform: 'none',
  }),

  /** Styled chunks for partial formatting */
  styledChunks: z.array(styledChunkSchema).default([]),

  /** Enable free positioning (absolute) instead of normal flow */
  freePosition: z.boolean().default(false),

  /** Manual position (px or %) - used when freePosition is true and specialPosition is 'none' */
  position: positionSchema.default({
    top: '50px',
    left: '50px',
  }),

  /** Special position preset - used when freePosition is true */
  specialPosition: specialPositionEnum.default('none'),

  /** Padding from edge when using special position (percentage 0-20) */
  specialPadding: z.number().min(0).max(20).default(8),
});

export type TextField = z.infer<typeof textFieldSchema>;

/**
 * TextFields Module Schema
 * Manages multiple text fields with individual styling and spacing control
 */
export const textFieldsSchema = z.object({
  /** Number of text fields to display (1-10) */
  count: z.number().min(1).max(10).default(5),

  /** Gap between text fields (pixels) */
  gap: z.number().min(0).max(200).default(20),

  /** Vertical alignment of text fields */
  verticalAlign: z.enum(['top', 'center', 'bottom']).default('bottom'),

  /** Layout width in horizontal card layouts (percentage or CSS value) */
  layoutWidth: z.string().default('50%'),

  /** Align-self in horizontal card layouts */
  alignSelf: z.enum(['auto', 'flex-start', 'center', 'flex-end', 'stretch']).default('stretch'),

  /** Auto-sizing mode for horizontal layouts with content image */
  autoSizeMode: z.enum(['off', 'proportional-3-1']).default('off'),

  /** Index of the larger text field (3x size). All other texts will be 1x (0-based) */
  autoSizeLargerIndex: z.number().min(0).max(9).default(0),

  /** Array of text field configurations */
  fields: z.array(textFieldSchema).default([
    { content: '', style: {}, styledChunks: [], freePosition: false, position: { top: '50px', left: '50px' }, specialPosition: 'none', specialPadding: 8 },
    { content: '', style: {}, styledChunks: [], freePosition: false, position: { top: '100px', left: '50px' }, specialPosition: 'none', specialPadding: 8 },
    { content: '', style: {}, styledChunks: [], freePosition: false, position: { top: '150px', left: '50px' }, specialPosition: 'none', specialPadding: 8 },
    { content: '', style: {}, styledChunks: [], freePosition: false, position: { top: '200px', left: '50px' }, specialPosition: 'none', specialPadding: 8 },
    { content: '', style: {}, styledChunks: [], freePosition: false, position: { top: '250px', left: '50px' }, specialPosition: 'none', specialPadding: 8 },
  ]),
});

export type TextFieldsData = z.infer<typeof textFieldsSchema>;
