import { z } from 'zod';
import { specialPositionEnum, positionSchema } from '../types';

/**
 * Single SVG element configuration
 */
export const svgElementSchema = z.object({
  /** Enable/disable this SVG element */
  enabled: z.boolean().default(false),

  /** SVG URL or path */
  svgUrl: z.string().default(''),

  /** SVG color override (applied via CSS filter) */
  color: z.string().default('#ffffff'),

  /** SVG width */
  width: z.string().default('100px'),

  /** SVG height */
  height: z.string().default('100px'),

  /** Manual position (px or %) - used when specialPosition is 'none' */
  position: positionSchema.default({
    top: '50px',
    left: '50px',
  }),

  /** Special position preset */
  specialPosition: specialPositionEnum.default('none'),

  /** Padding from edge when using special position (percentage 0-20) */
  specialPadding: z.number().min(0).max(20).default(5),

  /** Rotation in degrees (0-360) */
  rotation: z.number().min(0).max(360).default(0),

  /** Opacity (0-1) */
  opacity: z.number().min(0).max(1).default(1),

  /** Z-index override (optional, defaults to module z-index) */
  zIndexOverride: z.number().optional(),
});

export type SvgElement = z.infer<typeof svgElementSchema>;

/**
 * SVGElements Module Schema
 * Manages positioned SVG elements (icons, decorations, logos)
 */
export const svgElementsSchema = z.object({
  /** Array of SVG element configurations (up to 3) */
  svgElements: z.array(svgElementSchema).max(3).default([
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '50px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '100px', left: '100px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '150px', left: '150px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
  ]),
});

export type SvgElementsData = z.infer<typeof svgElementsSchema>;

/**
 * Default values for SVGElements Module
 */
export const svgElementsDefaults: SvgElementsData = {
  svgElements: [
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '50px', left: '50px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '100px', left: '100px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
    {
      enabled: false,
      svgUrl: '',
      color: '#ffffff',
      width: '100px',
      height: '100px',
      position: { top: '150px', left: '150px' },
      specialPosition: 'none',
      specialPadding: 5,
      rotation: 0,
      opacity: 1,
    },
  ],
};
