// ============================================================================
// FORM OPTIONS - CONSTANTES COMPARTILHADAS PARA FORMULÁRIOS
// ============================================================================

/**
 * Opções de peso de fonte
 */
export const FONT_WEIGHT_OPTIONS = [
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi-Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra-Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
] as const;

export type FontWeight = typeof FONT_WEIGHT_OPTIONS[number]['value'];

/**
 * Opções de alinhamento de texto
 */
export const TEXT_ALIGN_OPTIONS = [
  { label: 'Esquerda', value: 'left' },
  { label: 'Centro', value: 'center' },
  { label: 'Direita', value: 'right' },
] as const;

export type TextAlign = typeof TEXT_ALIGN_OPTIONS[number]['value'];

/**
 * Opções de transformação de texto
 */
export const TEXT_TRANSFORM_OPTIONS = [
  { label: 'Normal', value: 'none' },
  { label: 'MAIÚSCULAS', value: 'uppercase' },
  { label: 'minúsculas', value: 'lowercase' },
  { label: 'Capitalizado', value: 'capitalize' },
] as const;

export type TextTransform = typeof TEXT_TRANSFORM_OPTIONS[number]['value'];

/**
 * Opções de posição especial
 */
export const SPECIAL_POSITION_OPTIONS = [
  { label: 'Manual', value: 'none' },
  { label: 'Superior Esquerdo', value: 'top-left' },
  { label: 'Superior Direito', value: 'top-right' },
  { label: 'Inferior Esquerdo', value: 'bottom-left' },
  { label: 'Inferior Direito', value: 'bottom-right' },
  { label: 'Superior Centro', value: 'top-center' },
  { label: 'Inferior Centro', value: 'bottom-center' },
  { label: 'Centro Esquerdo', value: 'center-left' },
  { label: 'Centro Direito', value: 'center-right' },
  { label: 'Centro', value: 'center' },
] as const;

export type SpecialPosition = typeof SPECIAL_POSITION_OPTIONS[number]['value'];

/**
 * Opções de tipo de background
 */
export const BACKGROUND_TYPE_OPTIONS = [
  { label: 'Cor Sólida', value: 'color' },
  { label: 'Imagem', value: 'image' },
] as const;

export type BackgroundType = typeof BACKGROUND_TYPE_OPTIONS[number]['value'];

/**
 * Opções de direção de gradiente
 */
export const GRADIENT_DIRECTION_OPTIONS = [
  { label: 'Para Cima', value: 'to top' },
  { label: 'Para Baixo', value: 'to bottom' },
  { label: 'Para Esquerda', value: 'to left' },
  { label: 'Para Direita', value: 'to right' },
] as const;

export type GradientDirection = typeof GRADIENT_DIRECTION_OPTIONS[number]['value'];

/**
 * Opções de blend mode
 */
export const BLEND_MODE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
] as const;

export type BlendMode = typeof BLEND_MODE_OPTIONS[number]['value'];

/**
 * Opções de tipo de corner element
 */
export const CORNER_TYPE_OPTIONS = [
  { label: 'Nenhum', value: 'none' },
  { label: 'Texto', value: 'text' },
  { label: 'SVG/Logo', value: 'svg' },
] as const;

export type CornerType = typeof CORNER_TYPE_OPTIONS[number]['value'];

/**
 * Opções de alinhamento vertical
 */
export const VERTICAL_ALIGN_OPTIONS = [
  { label: 'Topo', value: 'top' },
  { label: 'Centro', value: 'center' },
  { label: 'Baixo', value: 'bottom' },
] as const;

export type VerticalAlign = typeof VERTICAL_ALIGN_OPTIONS[number]['value'];

/**
 * Opções de align-self (flexbox)
 */
export const ALIGN_SELF_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Início (Flex Start)', value: 'flex-start' },
  { label: 'Centro (Center)', value: 'center' },
  { label: 'Fim (Flex End)', value: 'flex-end' },
  { label: 'Esticado (Stretch)', value: 'stretch' },
] as const;

export type AlignSelf = typeof ALIGN_SELF_OPTIONS[number]['value'];

/**
 * Fontes disponíveis no sistema
 */
export const FONT_FAMILY_OPTIONS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Product Sans', value: 'Product Sans' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'League Spartan', value: 'League Spartan' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Poppins', value: 'Poppins' },
] as const;

export type FontFamily = typeof FONT_FAMILY_OPTIONS[number]['value'];

/**
 * Tamanhos de fonte comuns
 */
export const FONT_SIZE_PRESETS = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '40px', value: '40px' },
  { label: '48px', value: '48px' },
  { label: '56px', value: '56px' },
  { label: '64px', value: '64px' },
  { label: '72px', value: '72px' },
  { label: '80px', value: '80px' },
  { label: '96px', value: '96px' },
] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Estilo de texto padrão
 */
export const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Arial',
  fontSize: '24px',
  fontWeight: '400',
  color: '#000000',
  textAlign: 'left' as const,
  textTransform: 'none' as const,
};

/**
 * Estilo de título padrão
 */
export const DEFAULT_TITLE_STYLE = {
  fontFamily: 'Bebas Neue',
  fontSize: '48px',
  fontWeight: '700',
  color: '#000000',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};

/**
 * Gradient overlay padrão
 */
export const DEFAULT_GRADIENT_OVERLAY = {
  enabled: false,
  color: '#000000',
  startOpacity: 0.7,
  midOpacity: 0.3,
  endOpacity: 0,
  height: 50,
  direction: 'to top' as const,
  blendMode: 'normal' as const,
};

/**
 * Corner element padrão
 */
export const DEFAULT_CORNER_ELEMENT = {
  type: 'none' as const,
  text: '',
  textStyle: {
    fontFamily: 'Arial Black',
    fontSize: '32px',
    fontWeight: '900',
    color: '#000000',
    backgroundColor: '',
    padding: '5px 15px',
  },
  svgContent: '',
  svgUrl: '',
  svgColor: '#000000',
  svgWidth: '60px',
  svgHeight: '60px',
  specialPosition: 'none' as const,
  paddingX: 40,
  paddingY: 40,
  backgroundEnabled: false,
};

// ============================================================================
// VIEWPORT CONSTANTS
// ============================================================================

/**
 * Dimensões padrão do viewport
 */
export const VIEWPORT = {
  WIDTH: 1080,
  HEIGHT: 1440,
  DUO_WIDTH: 2160, // Para modo Duo (2 slides)
} as const;

/**
 * Device scale factor para qualidade da imagem
 */
export const DEVICE_SCALE_FACTOR = 2;
