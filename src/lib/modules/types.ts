import { z, ZodSchema } from 'zod';
import { LucideIcon } from 'lucide-react';
import { UseFormWatch, UseFormSetValue, UseFormRegister, FieldValues } from 'react-hook-form';

// ============================================================================
// MODULE SYSTEM TYPES
// ============================================================================

/**
 * Form props passadas para o componente de formulário de cada módulo
 */
export interface ModuleFormProps<T extends FieldValues = Record<string, unknown>> {
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  register?: UseFormRegister<T>;
  fieldPrefix?: string;
}

/**
 * Dados do módulo após processamento (para geração de CSS/HTML)
 */
export type ModuleData = Record<string, unknown>;

/**
 * Definição completa de um módulo
 */
export interface ModuleDefinition<TSchema extends ZodSchema = ZodSchema> {
  /** ID único do módulo (ex: 'corners', 'viewport', 'duo') */
  id: string;

  /** Nome exibido na UI (ex: 'Corner Elements') */
  name: string;

  /** Descrição curta do módulo */
  description: string;

  /** Ícone Lucide para exibir na sidebar */
  icon: LucideIcon;

  /** Categoria do módulo para agrupamento na UI */
  category: ModuleCategory;

  /** Schema Zod para validação dos dados do módulo */
  schema: TSchema;

  /** Valores default para todos os campos do módulo */
  defaults: z.infer<TSchema>;

  /** Componente React para o formulário do módulo */
  FormComponent: React.ComponentType<ModuleFormProps>;

  /**
   * Gera CSS para o módulo baseado nos dados
   * @param data Dados do módulo
   * @param context Contexto de renderização (outros módulos ativos, etc)
   */
  getCss: (data: ModuleData, context?: RenderContext) => string;

  /**
   * Gera HTML para o módulo baseado nos dados
   * @param data Dados do módulo
   * @param context Contexto de renderização
   */
  getHtml: (data: ModuleData, context?: RenderContext) => string;

  /**
   * Gera CSS variables para o módulo
   * @param data Dados do módulo
   */
  getStyleVariables: (data: ModuleData) => Record<string, string>;

  /** Ordem de z-index para renderização (maior = mais acima) */
  zIndex: number;

  /** IDs de módulos que este módulo depende */
  dependencies?: string[];

  /** IDs de módulos que conflitam com este (não podem ser ativados juntos) */
  conflicts?: string[];

  /** Permite múltiplas instâncias deste módulo (ex: textFields-1, textFields-2) */
  allowMultipleInstances?: boolean;

  /**
   * Hook opcional para modificar o processo de geração de imagem
   * Usado por módulos especiais como Duo que alteram o viewport/output
   */
  modifyGeneration?: (
    page: unknown, // Puppeteer Page
    options: GenerationOptions
  ) => Promise<GenerationResult>;

  /**
   * Hook opcional para modificar o HTML final após composição
   * Usado por módulos especiais como Duo que precisam envolver todo o conteúdo
   */
  modifyFinalHTML?: (
    html: string,
    data: ModuleData,
    context: RenderContext
  ) => string;
}

/**
 * Categorias de módulos para organização na UI
 */
export type ModuleCategory =
  | 'layout'      // Viewport, Card, Duo
  | 'content'     // TextFields, ContentImage, Bullets, OpenLoop
  | 'overlay'     // Corners, SVG, FreeText, ArrowBottomText, Logo
  | 'special';    // Módulos especiais

/**
 * Contexto passado para funções de renderização
 */
export interface RenderContext {
  /** Lista de IDs de módulos ativos */
  enabledModules: string[];

  /** Dados de todos os módulos ativos */
  allModulesData: Record<string, ModuleData>;

  /** Dimensões do viewport */
  viewportWidth: number;
  viewportHeight: number;

  /** URL base para assets */
  baseUrl: string;
}

/**
 * Opções para geração de imagem
 */
export interface GenerationOptions {
  /** Dimensões do viewport */
  viewportWidth: number;
  viewportHeight: number;

  /** Scale factor para qualidade */
  deviceScaleFactor: number;

  /** Diretório de output */
  outputDir: string;

  /** Prefixo do nome do arquivo */
  filePrefix: string;
}

/**
 * Resultado da geração de imagem
 */
export interface GenerationResult {
  /** Array de buffers de imagem (1 para normal, 2+ para Duo) */
  images: Buffer[];

  /** Caminhos dos arquivos salvos */
  filePaths: string[];

  /** HTML usado para renderização (para debug) */
  html?: string;
}

/**
 * Template composto após processamento de todos os módulos
 */
export interface ComposedTemplate {
  /** Largura do viewport (1080 ou 2160 para Duo) */
  viewportWidth: number;

  /** Altura do viewport (sempre 1440) */
  viewportHeight: number;

  /** CSS combinado de todos os módulos */
  modulesCSS: string;

  /** HTML combinado de todos os módulos */
  modulesHTML: string;

  /** CSS variables combinadas */
  styleVariables: string;

  /** HTML final completo */
  finalHtml: string;
}

// ============================================================================
// TEMPLATE PRESET TYPES
// ============================================================================

/**
 * Preset de template (configuração pré-definida de módulos)
 */
export interface TemplatePreset {
  /** ID único do preset (ex: 'stack', 'versus') */
  id: string;

  /** Nome exibido na UI */
  name: string;

  /** Descrição do preset */
  description: string;

  /** URL da thumbnail de preview (opcional) */
  thumbnail?: string;

  /** IDs dos módulos ativados por padrão */
  defaultModules: string[];

  /** Valores default customizados por módulo (override dos defaults do módulo) */
  moduleDefaults: Record<string, Record<string, unknown>>;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Estado do editor de módulos
 */
export interface ModuleEditorState {
  /** IDs dos módulos atualmente ativados */
  enabledModules: string[];

  /** ID do preset selecionado (ou null para custom) */
  selectedPreset: string | null;

  /** Dados do formulário por módulo */
  moduleData: Record<string, ModuleData>;
}

// ============================================================================
// SHARED SCHEMA TYPES (para uso em módulos)
// ============================================================================

/**
 * Estilo de texto compartilhado
 */
export const textStyleSchema = z.object({
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
  textDecoration: z.string().optional(),
  padding: z.string().optional(),
});

export type TextStyle = z.infer<typeof textStyleSchema>;

/**
 * Posição de elemento
 */
export const positionSchema = z.object({
  top: z.union([z.string(), z.number()]).optional(),
  left: z.union([z.string(), z.number()]).optional(),
  right: z.union([z.string(), z.number()]).optional(),
  bottom: z.union([z.string(), z.number()]).optional(),
  width: z.union([z.string(), z.number()]).optional(),
  height: z.union([z.string(), z.number()]).optional(),
});

export type Position = z.infer<typeof positionSchema>;

/**
 * Posições especiais predefinidas
 */
export const specialPositionEnum = z.enum([
  'none',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top-center',
  'bottom-center',
  'center-left',
  'center-right',
  'center',
]);

export type SpecialPosition = z.infer<typeof specialPositionEnum>;

/**
 * Chunk de texto estilizado
 */
export const styledChunkSchema = z.object({
  text: z.string(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  letterSpacing: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundBlur: z.string().optional(),
  blurColor: z.string().optional(),
  blurOpacity: z.number().optional(),
  blurFadeDirection: z.enum(['horizontal', 'vertical', 'both']).optional(),
  blurFadeAmount: z.number().optional(),
  padding: z.string().optional(),
});

export type StyledChunk = z.infer<typeof styledChunkSchema>;

/**
 * Gradient overlay
 */
export const gradientOverlaySchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().optional(),
  startOpacity: z.number().optional(),
  midOpacity: z.number().optional(),
  endOpacity: z.number().optional(),
  height: z.number().optional(),
  direction: z.enum(['to top', 'to bottom', 'to left', 'to right']).optional(),
  blendMode: z.string().optional(),
});

export type GradientOverlay = z.infer<typeof gradientOverlaySchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper para extrair o tipo de dados de um ModuleDefinition
 */
export type ModuleDataType<T extends ModuleDefinition> = z.infer<T['schema']>;

/**
 * ID de módulo válido (será preenchido pelo registry)
 */
export type ModuleId = string;
