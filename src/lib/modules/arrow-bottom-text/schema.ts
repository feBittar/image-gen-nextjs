import { z } from 'zod';
import { textStyleSchema, specialPositionEnum } from '../types';

/**
 * Layout direction for arrow and text
 */
export const arrowBottomTextLayoutEnum = z.enum(['vertical', 'horizontal']);
export type ArrowBottomTextLayout = z.infer<typeof arrowBottomTextLayoutEnum>;

/**
 * Arrow Bottom Text Module Schema
 *
 * Combo of Arrow (SVG/image) + bottom text, commonly used in bottom corner for CTAs like "swipe up"
 */
export const arrowBottomTextSchema = z.object({
  /** Enable/disable the entire module */
  enabled: z.boolean().default(false),

  /** Arrow image URL (SVG or PNG) */
  arrowImageUrl: z.string().default(''),

  /** Arrow color override (for SVG) */
  arrowColor: z.string().default('#ffffff'),

  /** Arrow width (px or %) */
  arrowWidth: z.string().default('80px'),

  /** Arrow height (px or %) */
  arrowHeight: z.string().default('auto'),

  /** Bottom text content */
  bottomText: z.string().default(''),

  /** Text style configuration */
  bottomTextStyle: textStyleSchema.default({
    fontFamily: 'Arial',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  }),

  /** Special position preset */
  specialPosition: specialPositionEnum.default('bottom-right'),

  /** Padding from edge (%) */
  padding: z.number().min(0).max(20).default(5),

  /** Gap between arrow and text (px) */
  gapBetween: z.number().min(0).max(100).default(15),

  /** Layout direction: arrow above text (vertical) or beside text (horizontal) */
  layout: arrowBottomTextLayoutEnum.default('vertical'),
});

export type ArrowBottomTextData = z.infer<typeof arrowBottomTextSchema>;

/**
 * Default values for Arrow Bottom Text Module
 */
export const arrowBottomTextDefaults: ArrowBottomTextData = {
  enabled: false,
  arrowImageUrl: '',
  arrowColor: '#ffffff',
  arrowWidth: '80px',
  arrowHeight: 'auto',
  bottomText: '',
  bottomTextStyle: {
    fontFamily: 'Arial',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  specialPosition: 'bottom-right',
  padding: 5,
  gapBetween: 15,
  layout: 'vertical',
};
