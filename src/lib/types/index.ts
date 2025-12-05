// Common types for the image generation app

export interface TextStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;
  background?: string;
  WebkitBackgroundClip?: string;
  WebkitTextFillColor?: string;
}

export interface StyledChunk {
  text: string;
  styles?: TextStyle;
}

export interface ImageGenerationData {
  title?: string | { text: string; styledChunks?: StyledChunk[] };
  subtitle?: string | { text: string; styledChunks?: StyledChunk[] };
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  backgroundImage?: string;
  authorName?: string;
  template?: string;

  // Stack template fields
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  text1Style?: TextStyle;
  text2Style?: TextStyle;
  text3Style?: TextStyle;
  text4Style?: TextStyle;
  text5Style?: TextStyle;
  cardWidth?: number;
  cardHeight?: number;
  cardBorderRadius?: number;
  cardBackgroundColor?: string;
  cardBackgroundImage?: string;
  textGap?: number;
  contentImageUrl?: string;
  contentImageBorderRadius?: number;

  gradientOverlay?: {
    direction?: string;
    colors?: Array<{ color: string; position: number }>;
    opacity?: number;
    blendMode?: string;
  };
  customFonts?: Array<{
    fontFamily: string;
    url: string;
    fontWeight?: string;
    fontStyle?: string;
  }>;

  // Allow any additional fields for flexibility
  [key: string]: any;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface StylePreset {
  name: string;
  styles: TextStyle;
  description?: string;
  category?: string;
}
