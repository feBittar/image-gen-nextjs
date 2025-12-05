/**
 * Layout Manager Types
 *
 * Sistema de controle macro de composição visual para templates modulares.
 */

/**
 * Tipo de posicionamento de um módulo
 */
export type PositionType = 'flex' | 'absolute' | 'relative';

/**
 * Configuração de posicionamento flexbox
 */
export interface FlexPosition {
  grow?: number;
  shrink?: number;
  basis?: string;
}

/**
 * Coordenadas para posicionamento absoluto
 */
export interface AbsoluteCoordinates {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

/**
 * Configuração de posição de um módulo
 */
export interface PositionConfig {
  type: PositionType;
  flex?: FlexPosition;
  absoluteCoords?: AbsoluteCoordinates;
}

/**
 * Condição para renderização condicional
 */
export interface RenderCondition {
  showIf?: string;  // Ex: "hasImage" ou "bulletCount > 0"
  hideIf?: string;
}

/**
 * Item da ordem de renderização
 */
export interface RenderOrderItem {
  /** ID do módulo (ex: 'textFields', 'contentImage', '__group__', '__spacer__') */
  moduleId: string;

  /** ID do submódulo opcional (ex: 'field1', 'field.0') */
  submoduleId?: string;

  /** Configuração de posicionamento */
  position?: PositionConfig;

  /** Condição de visibilidade */
  conditional?: RenderCondition;

  /** Espaçamento superior */
  marginTop?: string;

  /** Espaçamento inferior */
  marginBottom?: string;

  /** ID único para drag & drop */
  id?: string;

  /** Layout flex (para grupos horizontais) */
  flex?: {
    grow?: number;    // flex-grow (1, 2, 3...)
    shrink?: number;  // flex-shrink
    basis?: string;   // flex-basis (50%, 200px, auto)
  };

  /** Configuração de grupo (quando moduleId é '__group__') */
  groupConfig?: {
    /** Direção do grupo (row para horizontal, column para vertical) */
    direction: 'row' | 'column';

    /** Espaçamento entre filhos */
    gap?: string;

    /** Alinhamento dos itens */
    alignItems?: 'start' | 'center' | 'end' | 'stretch';

    /** Justificação do conteúdo */
    justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';

    /** Filhos do grupo */
    children: RenderOrderItem[];
  };
}

/**
 * Tipo de regra espacial
 */
export type SpatialRuleType = 'before' | 'after' | 'between' | 'wrap';

/**
 * Configuração de wrapper para rule 'wrap'
 */
export interface WrapperConfig {
  tag: string;
  className?: string;
  style?: string;
}

/**
 * Regra de posicionamento espacial entre módulos
 */
export interface SpatialRule {
  /** ID único da regra */
  id: string;

  /** Tipo de regra */
  type: SpatialRuleType;

  /** ID do módulo alvo */
  target: string;

  /** ID do módulo de referência (para 'before', 'after', 'between') */
  reference?: string;

  /** ID do segundo módulo de referência (apenas para 'between') */
  reference2?: string;

  /** Configuração de wrapper (apenas para 'wrap') */
  wrapper?: WrapperConfig;

  /** Descrição da regra (opcional, para UI) */
  description?: string;
}

/**
 * Configuração de layer (z-index)
 */
export interface LayerConfig {
  /** ID do módulo */
  moduleId: string;

  /** Z-index customizado */
  zIndex: number;

  /** Se o layer está visível */
  visible: boolean;

  /** Se o layer está travado (não pode ser reordenado) */
  locked?: boolean;

  /** Nome display do layer (opcional) */
  displayName?: string;
}

/**
 * Preset de layout
 */
export type LayoutPresetId =
  | 'stack'
  | 'image-first'
  | 'image-last'
  | 'sandwich'
  | 'bullets-grid'
  | 'floating'
  | 'bullets-first'
  | 'split-content'
  | 'custom';

/**
 * Configuração completa de composição
 */
export interface CompositionConfig {
  /** ID do preset usado (se aplicável) */
  presetId?: LayoutPresetId;

  /** Ordem de renderização dos módulos */
  renderOrder: RenderOrderItem[];

  /** Overrides de z-index por módulo */
  zIndexOverrides?: Record<string, number>;

  /** Regras de posicionamento espacial */
  spatialRules?: SpatialRule[];

  /** Configuração de layers */
  layers?: LayerConfig[];

  /** Se está usando configuração customizada */
  isCustom?: boolean;
}

/**
 * Definição de preset de layout
 */
export interface LayoutPresetDefinition {
  id: LayoutPresetId;
  name: string;
  description: string;
  icon?: string;
  config: Omit<CompositionConfig, 'presetId'>;
  thumbnail?: string;
}

/**
 * Tipo de nó na render tree
 */
export type RenderNodeType = 'module' | 'group' | 'spacer';

/**
 * Nó da árvore de renderização
 */
export interface RenderNode {
  /** Tipo do nó */
  type: RenderNodeType;

  /** ID único do nó */
  id: string;

  /** ID do módulo (para type: 'module') */
  moduleId?: string;

  /** ID do submódulo (opcional) */
  submoduleId?: string;

  /** Nós filhos (para type: 'group') */
  children?: RenderNode[];

  /** Configuração flex */
  flex?: FlexPosition;

  /** Espaçamento superior */
  marginTop?: string;

  /** Espaçamento inferior */
  marginBottom?: string;

  /** Gap entre filhos (para type: 'group') */
  gap?: string;

  /** Classes CSS adicionais */
  className?: string;

  /** Estilos inline adicionais */
  style?: Record<string, string>;

  /** Direction para grupos (flex-direction) */
  direction?: 'row' | 'column';

  /** Align items (alinhamento vertical em row, horizontal em column) */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';

  /** Justify content (distribuição no eixo principal) */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

/**
 * Contexto de renderização extendido com composition config
 */
export interface CompositionRenderContext {
  /** Módulos habilitados */
  enabledModules: string[];

  /** Dados de todos os módulos */
  allModulesData: Record<string, any>;

  /** Largura do viewport */
  viewportWidth: number;

  /** Altura do viewport */
  viewportHeight: number;

  /** Base URL para assets */
  baseUrl: string;

  /** Configuração de composição */
  compositionConfig?: CompositionConfig;
}

/**
 * Resultado da aplicação de uma spatial rule
 */
export interface SpatialRuleResult {
  success: boolean;
  error?: string;
  modifiedOrder?: RenderOrderItem[];
}

/**
 * Evento de drag & drop
 */
export interface DragDropEvent {
  sourceIndex: number;
  destinationIndex: number;
  sourceId: string;
  destinationId?: string;
}

/**
 * Estado do Layout Manager (para UI)
 */
export interface LayoutManagerState {
  /** Tab ativa */
  activeTab: 'order' | 'layers' | 'rules' | 'presets';

  /** Se está em modo de edição */
  isEditing: boolean;

  /** Item sendo arrastado */
  draggingItem?: RenderOrderItem | LayerConfig;

  /** Se houve mudanças não salvas */
  isDirty: boolean;
}
