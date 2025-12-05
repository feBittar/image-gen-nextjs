import { z } from 'zod';

// Styled chunk schema
const styledChunkSchema = z.object({
  text: z.string(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
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
  textDecoration: z.string().optional(),
  textShadow: z.string().optional(),
  padding: z.string().optional(),
});

// Position schema
const positionSchema = z.object({
  top: z.union([z.string(), z.number()]).optional(),
  left: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
});

// Special position enum
const specialPositionEnum = z.enum(['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right']);

// Versus Duo template schema
export const versusDuoTemplateSchema = z.object({
  template: z.literal('versus-duo'),

  // === BACKGROUND ===
  backgroundColor: z.string().default('#FFFFFF'),

  // === CENTER IMAGE (PNG that spans both slides) ===
  centerImageUrl: z.string().optional(),
  centerImageOffsetX: z.number().default(0), // Horizontal offset in pixels (-500 to +500)
  centerImageScale: z.number().default(100), // Scale percentage (50-150)
  centerImageOffsetY: z.number().default(0), // Vertical offset in pixels

  // === CENTER IMAGE OUTLINE (solid color area behind PNG) ===
  centerImageOutlineEnabled: z.boolean().default(false),
  centerImageOutlineColor: z.string().default('#000000'),
  centerImageOutlineSize: z.number().default(10), // Size in pixels

  // === CONTAINER ===
  containerPaddingTop: z.number().optional(),
  containerPaddingRight: z.number().optional(),
  containerPaddingBottom: z.number().optional(),
  containerPaddingLeft: z.number().optional(),
  contentGap: z.number().optional(),

  // === COMPARISON IMAGES ===
  slide1ImageLeftUrl: z.string().optional(),
  slide1ImageRightUrl: z.string().optional(),
  slide2ImageLeftUrl: z.string().optional(),
  slide2ImageRightUrl: z.string().optional(),
  imageGap: z.number().optional(),
  imageBorderRadius: z.number().optional(),

  // === SLIDE 1 TEXTS ===
  slide1Text1: z.string().optional(),
  slide1Text1StyledChunks: z.array(styledChunkSchema).optional(),
  slide1Text1Style: textStyleSchema.optional(),

  slide1Text2: z.string().optional(),
  slide1Text2StyledChunks: z.array(styledChunkSchema).optional(),
  slide1Text2Style: textStyleSchema.optional(),

  // === SLIDE 2 TEXTS ===
  slide2Text1: z.string().optional(),
  slide2Text1StyledChunks: z.array(styledChunkSchema).optional(),
  slide2Text1Style: textStyleSchema.optional(),

  slide2Text2: z.string().optional(),
  slide2Text2StyledChunks: z.array(styledChunkSchema).optional(),
  slide2Text2Style: textStyleSchema.optional(),

  // === CORNER 1 (top-left) ===
  corner1Type: z.enum(['svg', 'text', 'none']).optional(),
  corner1Text: z.string().optional(),
  corner1TextStyle: textStyleSchema.optional(),
  corner1BackgroundEnabled: z.boolean().optional(),
  corner1SvgContent: z.string().optional(),
  corner1SvgUrl: z.string().optional(),
  corner1SvgColor: z.string().optional(),
  corner1SvgWidth: z.string().optional(),
  corner1SvgHeight: z.string().optional(),
  corner1Position: positionSchema.optional(),
  corner1SpecialPosition: specialPositionEnum.optional(),
  corner1PaddingX: z.number().optional(),
  corner1PaddingY: z.number().optional(),

  // === CORNER 2 (top-right) ===
  corner2Type: z.enum(['svg', 'text', 'none']).optional(),
  corner2Text: z.string().optional(),
  corner2TextStyle: textStyleSchema.optional(),
  corner2BackgroundEnabled: z.boolean().optional(),
  corner2SvgContent: z.string().optional(),
  corner2SvgUrl: z.string().optional(),
  corner2SvgColor: z.string().optional(),
  corner2SvgWidth: z.string().optional(),
  corner2SvgHeight: z.string().optional(),
  corner2Position: positionSchema.optional(),
  corner2SpecialPosition: specialPositionEnum.optional(),
  corner2PaddingX: z.number().optional(),
  corner2PaddingY: z.number().optional(),

  // === CORNER 3 (bottom-left) ===
  corner3Type: z.enum(['svg', 'text', 'none']).optional(),
  corner3Text: z.string().optional(),
  corner3TextStyle: textStyleSchema.optional(),
  corner3BackgroundEnabled: z.boolean().optional(),
  corner3SvgContent: z.string().optional(),
  corner3SvgUrl: z.string().optional(),
  corner3SvgColor: z.string().optional(),
  corner3SvgWidth: z.string().optional(),
  corner3SvgHeight: z.string().optional(),
  corner3Position: positionSchema.optional(),
  corner3SpecialPosition: specialPositionEnum.optional(),
  corner3PaddingX: z.number().optional(),
  corner3PaddingY: z.number().optional(),

  // === CORNER 4 (bottom-right) ===
  corner4Type: z.enum(['svg', 'text', 'none']).optional(),
  corner4Text: z.string().optional(),
  corner4TextStyle: textStyleSchema.optional(),
  corner4BackgroundEnabled: z.boolean().optional(),
  corner4SvgContent: z.string().optional(),
  corner4SvgUrl: z.string().optional(),
  corner4SvgColor: z.string().optional(),
  corner4SvgWidth: z.string().optional(),
  corner4SvgHeight: z.string().optional(),
  corner4Position: positionSchema.optional(),
  corner4SpecialPosition: specialPositionEnum.optional(),
  corner4PaddingX: z.number().optional(),
  corner4PaddingY: z.number().optional(),
});

export type VersusDuoTemplateFormData = z.infer<typeof versusDuoTemplateSchema>;

// Default values
export const versusDuoTemplateDefaults: VersusDuoTemplateFormData = {
  template: 'versus-duo',

  // Background
  backgroundColor: '#FFFFFF',

  // Center Image
  centerImageUrl: '',
  centerImageOffsetX: 0,
  centerImageScale: 100,
  centerImageOffsetY: 0,

  // Center Image Outline
  centerImageOutlineEnabled: false,
  centerImageOutlineColor: '#000000',
  centerImageOutlineSize: 10,

  // Container
  containerPaddingTop: 100,
  containerPaddingRight: 80,
  containerPaddingBottom: 100,
  containerPaddingLeft: 80,
  contentGap: 40,

  // Comparison Images
  slide1ImageLeftUrl: '',
  slide1ImageRightUrl: '',
  slide2ImageLeftUrl: '',
  slide2ImageRightUrl: '',
  imageGap: 40,
  imageBorderRadius: 0,

  // Slide 1 Text 1 (Title)
  slide1Text1: 'Slide 1',
  slide1Text1Style: {
    fontFamily: 'Arial Black',
    fontSize: '80px',
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    lineHeight: '1.1',
  },

  // Slide 1 Text 2 (Footer)
  slide1Text2: '',
  slide1Text2Style: {
    fontFamily: 'Arial Black',
    fontSize: '60px',
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    lineHeight: '1.2',
  },

  // Slide 2 Text 1 (Title)
  slide2Text1: 'Slide 2',
  slide2Text1Style: {
    fontFamily: 'Arial Black',
    fontSize: '80px',
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    lineHeight: '1.1',
  },

  // Slide 2 Text 2 (Footer)
  slide2Text2: '',
  slide2Text2Style: {
    fontFamily: 'Arial Black',
    fontSize: '60px',
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    lineHeight: '1.2',
  },

  // Corner 1 (top-left)
  corner1Type: 'none',
  corner1Text: '',
  corner1TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 15px',
  },
  corner1BackgroundEnabled: false,
  corner1SpecialPosition: 'top-left',
  corner1PaddingX: 40,
  corner1PaddingY: 40,

  // Corner 2 (top-right)
  corner2Type: 'none',
  corner2Text: '',
  corner2TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 15px',
  },
  corner2BackgroundEnabled: false,
  corner2SpecialPosition: 'top-right',
  corner2PaddingX: 40,
  corner2PaddingY: 40,

  // Corner 3 (bottom-left)
  corner3Type: 'none',
  corner3Text: '',
  corner3TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 15px',
  },
  corner3BackgroundEnabled: false,
  corner3SpecialPosition: 'bottom-left',
  corner3PaddingX: 40,
  corner3PaddingY: 40,

  // Corner 4 (bottom-right)
  corner4Type: 'none',
  corner4Text: '',
  corner4TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 15px',
  },
  corner4BackgroundEnabled: false,
  corner4SpecialPosition: 'bottom-right',
  corner4PaddingX: 40,
  corner4PaddingY: 40,
};
