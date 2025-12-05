import { z } from 'zod';

// Styled chunk schema (reused from stack)
const styledChunkSchema = z.object({
  text: z.string(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  letterSpacing: z.string().optional(),
  backgroundColor: z.string().optional(),
  padding: z.string().optional(),
});

// Card gradient overlay schema (reused from stack)
const cardGradientOverlaySchema = z.object({
  enabled: z.boolean().optional(),
  color: z.string().optional(),
  startOpacity: z.number().optional(),
  midOpacity: z.number().optional(),
  height: z.number().optional(),
  direction: z.enum(['to top', 'to bottom', 'to right', 'to left']).optional(),
}).optional();

// Text style schema
const textStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  textShadow: z.string().optional(),
});

// Line style schema (for special styling per line)
const lineStyleSchema = z.object({
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  letterSpacing: z.string().optional(),
  backgroundColor: z.string().optional(),
  padding: z.string().optional(),
  textShadow: z.string().optional(),
});

// Special styling configuration for title
const titleSpecialStylingSchema = z.object({
  enabled: z.boolean().default(false),
  lineStyles: z.array(lineStyleSchema).optional(), // Array of styles, one per line
});

// FitFeed Capa template schema
export const fitfeedCapaTemplateSchema = z.object({
  template: z.string(),

  // Viewport background settings
  viewportBackgroundType: z.enum(['color', 'image']).default('color'),
  viewportBackgroundColor: z.string().optional(),
  viewportBackgroundImage: z.string().optional(),
  gradientBackground: z.string().optional(),

  // Blur overlay
  gradientBlur: z.string().optional(),
  gradientBlurDisplay: z.string().optional(),

  // Viewport gradient overlay (same controls as card gradient)
  viewportGradientOverlay: cardGradientOverlaySchema,

  // Title
  title: z.string(),
  titleStyledChunks: z.array(styledChunkSchema).optional(),
  titleStyle: textStyleSchema.optional(),
  titleSpecialStyling: titleSpecialStylingSchema.optional(),

  // Logo Image (global-elements)
  logoImageUrl: z.string().optional(),
  logoColor: z.string().optional(),
  logoImageSpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  logoImageSpecialPadding: z.number().optional(),
  logoImagePosition: z.object({
    top: z.union([z.string(), z.number()]).optional(),
    left: z.union([z.string(), z.number()]).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
  }).optional(),

  // Arrow Image (global-elements)
  arrowImageUrl: z.string().optional(),
  arrowColor: z.string().optional(),
  arrowImageSpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  arrowImageSpecialPadding: z.number().optional(),
  arrowImagePosition: z.object({
    top: z.union([z.string(), z.number()]).optional(),
    left: z.union([z.string(), z.number()]).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
  }).optional(),

  // Bottom Text (global-elements)
  bottomText: z.string().optional(),
  bottomTextSpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  bottomTextSpecialPadding: z.number().optional(),
  bottomTextPosition: z.object({
    top: z.union([z.string(), z.number()]).optional(),
    left: z.union([z.string(), z.number()]).optional(),
  }).optional(),
  bottomTextStyle: textStyleSchema.optional(),
  bottomTextGapFromArrow: z.number().optional(), // Gap between arrow and text (px)
  bottomTextPaddingRight: z.number().optional(), // Padding-right offset from arrow edge (px)
});

export type FitFeedCapaTemplateFormData = z.infer<typeof fitfeedCapaTemplateSchema>;

// Default values
export const fitfeedCapaTemplateDefaults: FitFeedCapaTemplateFormData = {
  template: 'fitfeed-capa',
  viewportBackgroundType: 'color',
  viewportBackgroundColor: '#000000',
  gradientBlurDisplay: 'none',
  title: '',
  titleStyle: {
    fontFamily: 'Bebas Neue',
    fontSize: '72px',
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    lineHeight: '1.2',
  },
  logoImageUrl: '',
  logoColor: '#ffffff',
  logoImageSpecialPosition: 'top-left',
  logoImageSpecialPadding: 5,
  arrowImageUrl: '',
  arrowColor: '#ffffff',
  arrowImageSpecialPosition: 'bottom-right',
  arrowImageSpecialPadding: 6,
  bottomText: '',
  bottomTextSpecialPosition: 'bottom-right',
  bottomTextSpecialPadding: 3,
  bottomTextStyle: {
    fontFamily: 'Montserrat',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  bottomTextGapFromArrow: 15, // 15px gap between arrow and text
  bottomTextPaddingRight: 0, // No additional padding by default
};
