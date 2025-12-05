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

// Gradient overlay schema
const gradientOverlaySchema = z.object({
  enabled: z.boolean().optional(),
  color: z.string().optional(),
  startOpacity: z.number().optional(),
  midOpacity: z.number().optional(),
  height: z.number().optional(),
  direction: z.enum(['to top', 'to bottom', 'to right', 'to left']).optional(),
}).optional();

// OpenLoop template schema
export const openloopTemplateSchema = z.object({
  template: z.string(),

  // === VIEWPORT/BACKGROUND ===
  viewportBackgroundType: z.enum(['color', 'image']).default('color'),
  viewportBackgroundColor: z.string().optional(),
  viewportBackgroundImage: z.string().optional(),
  viewportGradientOverlay: gradientOverlaySchema,

  // === CONTAINER ===
  containerPaddingTop: z.number().optional(),
  containerPaddingRight: z.number().optional(),
  containerPaddingBottom: z.number().optional(),
  containerPaddingLeft: z.number().optional(),
  contentGap: z.number().optional(),

  // === TEXT 1 (Open Loop - Top) ===
  text1: z.string().optional(),
  text1StyledChunks: z.array(styledChunkSchema).optional(),
  text1Style: textStyleSchema.optional(),

  // === TEXT 2 (Resto do Titulo - Bottom) ===
  text2: z.string().optional(),
  text2StyledChunks: z.array(styledChunkSchema).optional(),
  text2Style: textStyleSchema.optional(),

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
  corner1PaddingX: z.number().optional(), // Horizontal padding in pixels (left/right)
  corner1PaddingY: z.number().optional(), // Vertical padding in pixels (top/bottom)

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
  corner2PaddingX: z.number().optional(), // Horizontal padding in pixels (left/right)
  corner2PaddingY: z.number().optional(), // Vertical padding in pixels (top/bottom)

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
  corner3PaddingX: z.number().optional(), // Horizontal padding in pixels (left/right)
  corner3PaddingY: z.number().optional(), // Vertical padding in pixels (top/bottom)

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
  corner4PaddingX: z.number().optional(), // Horizontal padding in pixels (left/right)
  corner4PaddingY: z.number().optional(), // Vertical padding in pixels (top/bottom)
});

export type OpenLoopTemplateFormData = z.infer<typeof openloopTemplateSchema>;

// Default values
export const openloopTemplateDefaults: OpenLoopTemplateFormData = {
  template: 'openloop',

  // Viewport
  viewportBackgroundType: 'color',
  viewportBackgroundColor: '#FFFFFF',
  viewportGradientOverlay: {
    enabled: false,
    color: '#000000',
    startOpacity: 0.7,
    midOpacity: 0.3,
    height: 60,
    direction: 'to top',
  },

  // Container
  containerPaddingTop: 60,
  containerPaddingRight: 80,
  containerPaddingBottom: 60,
  containerPaddingLeft: 80,
  contentGap: 0,

  // Text 1 (Open Loop)
  text1: 'open loop',
  text1Style: {
    fontFamily: 'Arial Black',
    fontSize: '80px',
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    textTransform: 'lowercase',
  },

  // Text 2 (Resto do titulo)
  text2: 'resto do titulo',
  text2Style: {
    fontFamily: 'Arial Black',
    fontSize: '80px',
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    textTransform: 'lowercase',
  },

  // Corner 1 (top-left)
  corner1Type: 'text',
  corner1Text: 'tag',
  corner1TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '30px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 10px',
  },
  corner1BackgroundEnabled: true,
  corner1SpecialPosition: 'top-left',
  corner1PaddingX: 40, // Horizontal padding (left) in pixels
  corner1PaddingY: 40, // Vertical padding (top) in pixels

  // Corner 2 (top-right)
  corner2Type: 'text',
  corner2Text: 'tag',
  corner2TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '30px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 10px',
  },
  corner2BackgroundEnabled: true,
  corner2SpecialPosition: 'top-right',
  corner2PaddingX: 40, // Horizontal padding (right) in pixels
  corner2PaddingY: 40, // Vertical padding (top) in pixels

  // Corner 3 (bottom-left)
  corner3Type: 'text',
  corner3Text: 'tag',
  corner3TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '30px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 10px',
  },
  corner3BackgroundEnabled: true,
  corner3SpecialPosition: 'bottom-left',
  corner3PaddingX: 40, // Horizontal padding (left) in pixels
  corner3PaddingY: 40, // Vertical padding (bottom) in pixels

  // Corner 4 (bottom-right)
  corner4Type: 'text',
  corner4Text: 'tag',
  corner4TextStyle: {
    fontFamily: 'Arial Black',
    fontSize: '30px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '#ff00cc',
    padding: '5px 10px',
  },
  corner4BackgroundEnabled: true,
  corner4SpecialPosition: 'bottom-right',
  corner4PaddingX: 40, // Horizontal padding (right) in pixels
  corner4PaddingY: 40, // Vertical padding (bottom) in pixels
};
