/**
 * Trecho de texto estilizado
 */
export interface StyledChunk {
  /** Texto do trecho */
  text: string;

  /** Cor do texto (hex, rgb, nome CSS) */
  color?: string;

  /** Família da fonte */
  font?: string;

  /** Tamanho da fonte */
  size?: string;

  /** Negrito */
  bold?: boolean;

  /** Itálico */
  italic?: boolean;

  /** Espaçamento entre letras */
  letterSpacing?: string;
}

/**
 * Configurações de gradiente overlay
 */
export interface GradientOverlay {
  /** Se o gradiente está ativado */
  enabled: boolean;

  /** Cor do gradiente em hexadecimal */
  color?: string;

  /** Opacidade inicial (na parte inferior) */
  startOpacity?: number;

  /** Opacidade intermediária */
  midOpacity?: number;

  /** Altura do gradiente em porcentagem */
  height?: number;

  /** Direção do gradiente: 'to top', 'to bottom', 'to right', 'to left' (padrão: 'to top') */
  direction?: string;

  /** Posição do ponto intermediário em porcentagem (0-100, padrão: 50) */
  midPosition?: number;

  /** Modo de mesclagem CSS: 'normal', 'multiply', 'overlay', 'darken', 'screen', etc. (padrão: 'normal') */
  blendMode?: string;

  /** Configurações de blur/desfoque */
  blur?: {
    /** Se o blur está ativado */
    enabled: boolean;
    /** Intensidade do blur em pixels (padrão: 10) */
    amount: number;
  };
}

/**
 * Configurações de posição do logo
 */
export interface LogoPosition {
  /** Posição horizontal: 'left', 'center', 'right', ou valor em pixels */
  x: string | number;

  /** Posição vertical: 'top', 'center', 'bottom', ou valor em pixels */
  y: string | number;
}

/**
 * Configurações de tamanho do logo
 */
export interface LogoSize {
  /** Largura do logo em pixels */
  width?: number;

  /** Altura do logo em pixels */
  height?: number;
}

/**
 * Dados do post para geração de imagem
 */
export interface PostData {
  /** Título principal do post - string simples */
  title: string;

  /** Subtítulo ou descrição - string simples */
  subtitle?: string;

  /** Trechos estilizados do título */
  titleStyledChunks?: StyledChunk[];

  /** Trechos estilizados do subtítulo */
  subtitleStyledChunks?: StyledChunk[];

  /** URL ou caminho da imagem de fundo */
  backgroundImage?: string;

  /** Nome do autor do post */
  authorName?: string;

  /** Configurações de gradiente sobre o fundo */
  gradientOverlay?: GradientOverlay | string;

  /** Logo como texto (legado) */
  logo?: string;

  /** Caminho para arquivo de imagem do logo */
  logoImage?: string;

  /** Posição do logo na imagem */
  logoPosition?: LogoPosition;

  /** Tamanho do logo */
  logoSize?: LogoSize;

  /** Cor para aplicar ao logo SVG (ex: 'white', 'black', '#FF0000') */
  logoColor?: string;

  /** Caminho para arquivo de imagem da seta decorativa */
  arrowImage?: string;

  /** Posição da seta na imagem */
  arrowPosition?: LogoPosition;

  /** Tamanho da seta */
  arrowSize?: LogoSize;

  /** Cor para aplicar à seta SVG (ex: 'white', 'black', '#FF0000') */
  arrowColor?: string;

  /** Texto de chamada para ação no rodapé */
  bottomText?: string;

  /** Estilos para o texto de chamada para ação */
  bottomTextStyle?: TextStyleOptions;

  /** Posição do texto de chamada para ação (padrão: bottom-right) */
  bottomTextPosition?: LogoPosition;

  /** Padding do texto de chamada para ação */
  bottomTextPadding?: string | number;

  /** Stack template: usar card container (true) ou imagem direto no background (false) */
  useCard?: boolean;

  /** Dados adicionais customizados */
  [key: string]: any;
}

/**
 * Opções para geração de imagem
 */
export interface GenerateImageOptions {
  /** Caminho do template HTML */
  templatePath: string;

  /** Dados para preencher o template */
  data: PostData;

  /** Caminho de saída da imagem (opcional, gera automaticamente se não fornecido) */
  outputPath?: string;

  /** Largura da imagem em pixels (padrão: 1080) */
  width?: number;

  /** Altura da imagem em pixels (padrão: 1080) */
  height?: number;

  /** Qualidade da imagem de 0 a 100 (padrão: 100) */
  quality?: number;

  /** Formato da imagem (padrão: 'png') */
  format?: 'png' | 'jpeg' | 'webp';
}

/**
 * Resultado da geração de imagem
 */
export interface GenerateImageResult {
  /** Indica se a geração foi bem-sucedida */
  success: boolean;

  /** Caminho completo da imagem gerada */
  imagePath?: string;

  /** Nome do arquivo da imagem */
  filename?: string;

  /** Mensagem de erro, se houver */
  error?: string;

  /** Tempo de execução em milissegundos */
  executionTime?: number;
}

/**
 * Erro customizado para geração de imagem
 */
export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImageGenerationError';
    Object.setPrototypeOf(this, ImageGenerationError.prototype);
  }
}

// Interfaces para API HTTP (compatibilidade)
export interface ImageGenerationRequest {
  template: string;
  data: Record<string, any>;
}

export interface ImageGenerationResponse {
  success: boolean;
  imagePath: string;
  url: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * Opções de estilo de texto
 */
export interface TextStyleOptions {
  /** Cor do texto (hex, rgb, nome CSS) */
  color?: string;

  /** Cor de fundo */
  backgroundColor?: string;

  /** Tamanho da fonte */
  fontSize?: string | number;

  /** Peso da fonte (normal, bold, 100-900) */
  fontWeight?: string | number;

  /** Família da fonte */
  fontFamily?: string;

  /** Sombra do texto */
  textShadow?: string;

  /** Transformação do texto */
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';

  /** Decoração do texto (underline, line-through, etc) */
  textDecoration?: string;

  /** Espaçamento entre letras */
  letterSpacing?: string;

  /** Altura da linha */
  lineHeight?: string | number;
}

/**
 * Preset de estilo predefinido
 */
export interface StylePreset {
  /** Nome do preset */
  name: string;

  /** Estilos aplicados */
  styles: TextStyleOptions;

  /** Descrição do preset */
  description?: string;
}

// ============================================
// Authentication Types
// ============================================

/**
 * Authenticated user attached to request
 */
export interface AuthUser {
  /** User ID from Supabase Auth */
  id: string;

  /** User email address */
  email: string;

  /** Whether email has been verified */
  emailVerified?: boolean;

  /** Full name */
  fullName?: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Additional metadata */
  [key: string]: any;
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  /** Subject (user ID) */
  sub: string;

  /** Email */
  email: string;

  /** Role */
  role?: string;

  /** Issued at timestamp */
  iat: number;

  /** Expiration timestamp */
  exp: number;

  /** Additional claims */
  [key: string]: any;
}

/**
 * Auth error response
 */
export interface AuthErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
