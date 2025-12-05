import { z } from 'zod';
import { textStyleSchema, specialPositionEnum, positionSchema } from '../types';

/**
 * Single free text element configuration
 */
export const freeTextElementSchema = z.object({
  /** Text content */
  content: z.string().default(''),

  /** Text styling */
  style: textStyleSchema.default({
    fontFamily: 'Arial',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  }),

  /** Manual position (px or %) - used when specialPosition is 'none' */
  position: positionSchema.default({
    top: '50px',
    left: '50px',
  }),

  /** Special position preset */
  specialPosition: specialPositionEnum.default('none'),

  /** Padding from edge when using special position (percentage 0-20) */
  specialPadding: z.number().min(0).max(20).default(8),

  /** Background color for text highlight */
  backgroundColor: z.string().default('transparent'),

  /** Background padding */
  backgroundPadding: z.string().default('10px 20px'),

  /** Border radius for background */
  borderRadius: z.string().default('6px'),
});

export type FreeTextElement = z.infer<typeof freeTextElementSchema>;

/**
 * FreeText Module Schema
 * Manages freely positioned text elements (CTAs, labels, etc)
 */
export const freeTextSchema = z.object({
  /** Number of free text elements to display (1-5) */
  count: z.number().min(1).max(5).default(3),

  /** Array of free text element configurations */
  texts: z.array(freeTextElementSchema).default([
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '50px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '100px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '150px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '200px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '250px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
  ]),
});

export type FreeTextData = z.infer<typeof freeTextSchema>;

/**
 * Default values for FreeText Module
 */
export const freeTextDefaults: FreeTextData = {
  count: 3,
  texts: [
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '50px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '100px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '150px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '200px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
    {
      content: '',
      style: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
      },
      position: { top: '250px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 8,
      backgroundColor: 'transparent',
      backgroundPadding: '10px 20px',
      borderRadius: '6px',
    },
  ],
};
