import { z } from 'zod';

// Styled chunk schema
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
  background: z.string().optional(),
  WebkitBackgroundClip: z.string().optional(),
  WebkitTextFillColor: z.string().optional(),
});

// Bullets Cards template schema
export const bulletsCardsTemplateSchema = z.object({
  template: z.string(),

  // Global settings
  backgroundColor: z.string().optional(),

  // Header section
  headerText: z.string(),
  headerFontSize: z.number().optional(),
  headerFontWeight: z.number().optional(),
  headerColor: z.string().optional(),
  headerMarginBottom: z.number().optional(),
  headerTextStyle: textStyleSchema.optional(),
  headerStyledChunks: z.array(styledChunkSchema).optional(),

  // Bullet 1
  bullet1Text: z.string(),
  bullet1Icon: z.string().optional(),
  bullet1TextStyle: textStyleSchema.optional(),
  bullet1StyledChunks: z.array(styledChunkSchema).optional(),

  // Bullet 2
  bullet2Text: z.string(),
  bullet2Icon: z.string().optional(),
  bullet2TextStyle: textStyleSchema.optional(),
  bullet2StyledChunks: z.array(styledChunkSchema).optional(),

  // Bullet 3
  bullet3Text: z.string(),
  bullet3Icon: z.string().optional(),
  bullet3TextStyle: textStyleSchema.optional(),
  bullet3StyledChunks: z.array(styledChunkSchema).optional(),

  // Bullet 4
  bullet4Text: z.string().optional(),
  bullet4Icon: z.string().optional(),
  bullet4TextStyle: textStyleSchema.optional(),
  bullet4StyledChunks: z.array(styledChunkSchema).optional(),

  // Bullet 5
  bullet5Text: z.string().optional(),
  bullet5Icon: z.string().optional(),
  bullet5TextStyle: textStyleSchema.optional(),
  bullet5StyledChunks: z.array(styledChunkSchema).optional(),

  // Footer section
  footerText: z.string().optional(),
  footerFontSize: z.number().optional(),
  footerFontWeight: z.number().optional(),
  footerColor: z.string().optional(),
  footerMarginTop: z.number().optional(),
  footerTextStyle: textStyleSchema.optional(),
  footerStyledChunks: z.array(styledChunkSchema).optional(),

  // Card styling
  cardsGap: z.number(),
  cardsContainerWidth: z.number().optional(),
  cardBackgroundColor: z.string(),
  cardBorderRadius: z.number(),
  cardPaddingVertical: z.number().optional(),
  cardPaddingHorizontal: z.number().optional(),
  cardInnerGap: z.number().optional(),
  cardShadow: z.string().optional(),
  cardMinHeight: z.number().optional(),
  cardTextFontSize: z.number().optional(),
  cardTextFontWeight: z.number().optional(),
  cardTextColor: z.string().optional(),

  // Icon styling
  iconSize: z.number(),
  iconBackgroundColor: z.string(),
  iconColor: z.string(),
  iconFontSize: z.number().optional(),
  iconFontWeight: z.number().optional(),
  iconSvgSize: z.number().optional(),

  // Content image
  contentImageUrl: z.string().optional(),
  contentImageWidth: z.number().optional(),
  contentImageRight: z.number().optional(),
  contentImageBottom: z.number().optional(),
  hideContentImage: z.boolean().optional(),
  contentGap: z.number().optional(),

  // Logo
  logoImageUrl: z.string().optional(),

  // Free text elements
  freeText1: z.string().optional(),
  freeText1Position: z.object({
    top: z.string().optional(),
    left: z.string().optional(),
  }).optional(),
  freeText1Style: textStyleSchema.optional(),
  freeText1SpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  freeText1SpecialPadding: z.number().optional(),

  freeText2: z.string().optional(),
  freeText2Position: z.object({
    top: z.string().optional(),
    left: z.string().optional(),
  }).optional(),
  freeText2Style: textStyleSchema.optional(),
  freeText2SpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  freeText2SpecialPadding: z.number().optional(),

  freeText3: z.string().optional(),
  freeText3Position: z.object({
    top: z.string().optional(),
    left: z.string().optional(),
  }).optional(),
  freeText3Style: textStyleSchema.optional(),
  freeText3SpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  freeText3SpecialPadding: z.number().optional(),

  // SVG elements
  svg1Content: z.string().optional(),
  svg1Position: z.object({
    top: z.string().optional(),
    left: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  svg1Color: z.string().optional(),
  svg1SpecialPosition: z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']).optional(),
  svg1SpecialPadding: z.number().optional(),
});

export type BulletsCardsTemplateFormData = z.infer<typeof bulletsCardsTemplateSchema>;

// Default values
export const bulletsCardsTemplateDefaults: BulletsCardsTemplateFormData = {
  template: 'bullets-cards',

  // Global
  backgroundColor: '#f7fafc',

  // Header
  headerText: '',
  headerFontSize: 52,
  headerFontWeight: 700,
  headerColor: '#1a365d',
  headerMarginBottom: 15,
  headerTextStyle: {
    fontFamily: 'Arial',
    fontSize: '52px',
    fontWeight: '700',
    color: '#1a365d',
    textAlign: 'left',
  },

  // Bullets (1-3 are required, 4-5 are optional)
  bullet1Text: '',
  bullet1Icon: '',
  bullet1TextStyle: {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: '400',
    color: '#2d3748',
    textAlign: 'left',
  },

  bullet2Text: '',
  bullet2Icon: '',
  bullet2TextStyle: {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: '400',
    color: '#2d3748',
    textAlign: 'left',
  },

  bullet3Text: '',
  bullet3Icon: '',
  bullet3TextStyle: {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: '400',
    color: '#2d3748',
    textAlign: 'left',
  },

  bullet4Text: '',
  bullet4Icon: '',
  bullet4TextStyle: {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: '400',
    color: '#2d3748',
    textAlign: 'left',
  },

  bullet5Text: '',
  bullet5Icon: '',
  bullet5TextStyle: {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: '400',
    color: '#2d3748',
    textAlign: 'left',
  },

  // Footer
  footerText: '',
  footerFontSize: 28,
  footerFontWeight: 600,
  footerColor: '#1a365d',
  footerMarginTop: 20,
  footerTextStyle: {
    fontFamily: 'Arial',
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a365d',
    textAlign: 'left',
  },

  // Card styling
  cardsGap: 20,
  cardsContainerWidth: 85,
  cardBackgroundColor: '#ffffff',
  cardBorderRadius: 16,
  cardPaddingVertical: 24,
  cardPaddingHorizontal: 28,
  cardInnerGap: 20,
  cardShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  cardMinHeight: 80,
  cardTextFontSize: 22,
  cardTextFontWeight: 400,
  cardTextColor: '#2d3748',

  // Icon styling
  iconSize: 48,
  iconBackgroundColor: '#fed7d7',
  iconColor: '#c53030',
  iconFontSize: 20,
  iconFontWeight: 700,
  iconSvgSize: 24,

  // Content image
  contentImageWidth: 400,
  contentImageRight: 60,
  contentImageBottom: 200,
  hideContentImage: false,
  contentGap: 20,

  // Free text
  freeText1Style: {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#718096',
    backgroundColor: 'transparent',
  },
  freeText1SpecialPosition: 'none',
  freeText1SpecialPadding: 8,

  freeText2Style: {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#718096',
    backgroundColor: 'transparent',
  },
  freeText2SpecialPosition: 'none',
  freeText2SpecialPadding: 8,

  freeText3Style: {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#718096',
    backgroundColor: 'transparent',
  },
  freeText3SpecialPosition: 'none',
  freeText3SpecialPadding: 8,

  // SVG
  svg1SpecialPosition: 'none',
  svg1SpecialPadding: 8,
};
