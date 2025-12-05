import {
  ModuleDefinition,
  ModuleData,
  ComposedTemplate,
  RenderContext
} from './types';
import { getActiveModules, sortModulesByZIndex, getModule } from './registry';
import {
  CompositionConfig,
  CompositionOrderEngine,
  LayerController,
  SpatialRulesEngine,
  CompositionRenderContext,
} from '../layout';
import { getBaseModuleId } from './moduleInstanceUtils';

// ============================================================================
// TEMPLATE COMPOSITER
// ============================================================================

/**
 * Base URL para assets (fonts, images, etc)
 */
const DEFAULT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Dimensões padrão do viewport
 */
const DEFAULT_VIEWPORT = {
  width: 1080,
  height: 1440,
};

/**
 * Compõe um template final a partir dos módulos ativos
 */
export function composeTemplate(
  enabledModuleIds: string[],
  formData: Record<string, ModuleData>,
  options: ComposeOptions = {}
): ComposedTemplate {
  const {
    baseUrl = DEFAULT_BASE_URL,
    compositionConfig,
    slideCount = 1,
  } = options;

  // If composition config is provided, use custom order engine
  if (compositionConfig && compositionConfig.renderOrder && compositionConfig.renderOrder.length > 0) {
    return composeWithCustomOrder(
      enabledModuleIds,
      formData,
      compositionConfig,
      baseUrl,
      slideCount
    );
  }

  // Otherwise, use default composition logic (backward compatibility)
  return composeWithDefaultOrder(enabledModuleIds, formData, baseUrl, slideCount);
}

/**
 * Compõe template usando ordem padrão (backward compatibility)
 */
function composeWithDefaultOrder(
  enabledModuleIds: string[],
  formData: Record<string, ModuleData>,
  baseUrl: string,
  slideCount: number = 1
): ComposedTemplate {
  // Get active modules
  const modules = getActiveModules(enabledModuleIds);

  // Determine viewport dimensions based on slide count
  const { viewportWidth, viewportHeight } = calculateViewport(slideCount);

  // Create render context
  const context: RenderContext = {
    enabledModules: enabledModuleIds,
    allModulesData: formData,
    viewportWidth,
    viewportHeight,
    baseUrl,
  };

  // Sort modules by z-index
  const sortedModules = sortModulesByZIndex(modules);

  // Collect CSS from all modules
  const modulesCSS = collectCSS(sortedModules, formData, context);

  // Collect HTML from all modules
  const modulesHTML = collectHTML(sortedModules, formData, context);

  // Collect style variables
  const styleVariables = collectStyleVariables(sortedModules, formData);

  // Generate final HTML
  let finalHtml = generateFinalHtml({
    viewportWidth,
    viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables,
    baseUrl,
    formData,
  });

  // Apply HTML modifications from special modules (e.g., Duo wrapping)
  for (const module of sortedModules) {
    if (module.modifyFinalHTML) {
      const data = formData[module.id] || module.defaults;
      finalHtml = module.modifyFinalHTML(finalHtml, data, context);
    }
  }

  return {
    viewportWidth,
    viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables,
    finalHtml,
  };
}

/**
 * Compõe template usando configuração customizada de layout
 */
function composeWithCustomOrder(
  enabledModuleIds: string[],
  formData: Record<string, ModuleData>,
  config: CompositionConfig,
  baseUrl: string,
  slideCount: number = 1
): ComposedTemplate {
  // Get active modules
  const modules = getActiveModules(enabledModuleIds);

  // Determine viewport dimensions based on slide count
  const { viewportWidth, viewportHeight } = calculateViewport(slideCount);

  // Create extended render context
  const context: CompositionRenderContext = {
    enabledModules: enabledModuleIds,
    allModulesData: formData,
    viewportWidth,
    viewportHeight,
    baseUrl,
    compositionConfig: config,
  };

  // Apply spatial rules to render order
  let finalRenderOrder = config.renderOrder;
  if (config.spatialRules && config.spatialRules.length > 0) {
    const spatialEngine = new SpatialRulesEngine(config.spatialRules);
    finalRenderOrder = spatialEngine.applyRules(config.renderOrder);
  }

  // Initialize layer controller
  const layerController = new LayerController(config.zIndexOverrides || {});
  layerController.initializeLayers(enabledModuleIds);

  // Collect CSS with layer overrides
  const modulesCSS = collectCSSWithOverrides(
    modules,
    formData,
    context,
    layerController
  );

  // Use composition order engine for HTML
  const orderEngine = new CompositionOrderEngine(finalRenderOrder);
  let modulesHTML = orderEngine.generateHTML(context);

  // Check if card is enabled and wrap content with card container
  const cardData = formData['card'] as { enabled?: boolean } | undefined;
  const isCardActive = enabledModuleIds.includes('card') && cardData?.enabled !== false;

  if (isCardActive) {
    // Wrap the engine-generated HTML with card container
    modulesHTML = `
  <!-- Card Container -->
${generateCardWrapperOpen(cardData as ModuleData)}
${modulesHTML}
${generateCardWrapperClose()}`;
  } else {
    // Wrap content in content-wrapper when card is inactive
    modulesHTML = `
  <!-- Content Wrapper (no card) -->
  <div class="content-wrapper">
${modulesHTML}
  </div>`;
  }

  // Collect style variables
  const styleVariables = collectStyleVariables(modules, formData);

  // Generate final HTML
  let finalHtml = generateFinalHtml({
    viewportWidth,
    viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables,
    baseUrl,
    formData,
  });

  // Apply HTML modifications from special modules
  for (const module of modules) {
    if (module.modifyFinalHTML) {
      const data = formData[module.id] || module.defaults;
      finalHtml = module.modifyFinalHTML(finalHtml, data, context);
    }
  }

  return {
    viewportWidth,
    viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables,
    finalHtml,
  };
}

/**
 * Opções para composição de template
 */
interface ComposeOptions {
  baseUrl?: string;
  compositionConfig?: CompositionConfig;
  slideCount?: number;
}

/**
 * Calcula as dimensões do viewport baseado no número de slides
 * @param slideCount - Número de slides (padrão: 1)
 * @returns Dimensões do viewport (largura = slideCount * 1080, altura = 1440)
 */
function calculateViewport(slideCount: number = 1): {
  viewportWidth: number;
  viewportHeight: number;
} {
  return {
    viewportWidth: slideCount * DEFAULT_VIEWPORT.width,
    viewportHeight: DEFAULT_VIEWPORT.height,
  };
}

/**
 * Coleta CSS de todos os módulos
 * Suporta múltiplas instâncias do mesmo módulo
 */
function collectCSS(
  modules: ModuleDefinition[],
  formData: Record<string, ModuleData>,
  context: RenderContext
): string {
  // Group module IDs by base module to handle instances
  const modulesWithInstances: Array<{ module: ModuleDefinition; instanceId: string }> = [];

  for (const instanceId of context.enabledModules) {
    const module = getModule(instanceId);
    if (module) {
      modulesWithInstances.push({ module, instanceId });
    }
  }

  // Sort by z-index
  modulesWithInstances.sort((a, b) => a.module.zIndex - b.module.zIndex);

  return modulesWithInstances
    .map(({ module, instanceId }) => {
      const data = formData[instanceId] || module.defaults;
      try {
        const css = module.getCss(data, context);
        const label = instanceId !== module.id ? `${module.name} (${instanceId})` : module.name;
        return css ? `/* === ${label} === */\n${css}` : '';
      } catch (error) {
        console.error(`Error generating CSS for module "${instanceId}":`, error);
        return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Coleta CSS com overrides de z-index do LayerController
 * Suporta múltiplas instâncias do mesmo módulo
 */
function collectCSSWithOverrides(
  modules: ModuleDefinition[],
  formData: Record<string, ModuleData>,
  context: RenderContext,
  layerController: LayerController
): string {
  // Group module IDs by base module to handle instances
  const modulesWithInstances: Array<{ module: ModuleDefinition; instanceId: string }> = [];

  for (const instanceId of context.enabledModules) {
    const module = getModule(instanceId);
    if (module) {
      modulesWithInstances.push({ module, instanceId });
    }
  }

  // Sort by z-index
  modulesWithInstances.sort((a, b) => a.module.zIndex - b.module.zIndex);

  return modulesWithInstances
    .map(({ module, instanceId }) => {
      const data = formData[instanceId] || module.defaults;
      try {
        let css = module.getCss(data, context);

        if (css) {
          // Aplica override de z-index se houver
          css = layerController.applyCSSOverride(instanceId, css);
          const label = instanceId !== module.id ? `${module.name} (${instanceId})` : module.name;
          return `/* === ${label} === */\n${css}`;
        }

        return '';
      } catch (error) {
        console.error(`Error generating CSS for module "${instanceId}":`, error);
        return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * IDs de módulos que devem renderizar DENTRO do card container
 */
const CONTENT_MODULES = ['textFields', 'contentImage', 'imageTextBox', 'bullets', 'openLoop'];

/**
 * Coleta HTML de todos os módulos
 * Quando o card está ativo, módulos de content são renderizados dentro dele
 * Suporta múltiplas instâncias do mesmo módulo
 */
function collectHTML(
  modules: ModuleDefinition[],
  formData: Record<string, ModuleData>,
  context: RenderContext
): string {
  // Check if card is enabled
  const cardData = formData['card'] as { enabled?: boolean } | undefined;
  const isCardActive = context.enabledModules.includes('card') && cardData?.enabled !== false;

  // Separate instances into groups
  interface ModuleInstance {
    module: ModuleDefinition;
    instanceId: string;
  }

  const backgroundModules: ModuleInstance[] = [];
  let cardModule: ModuleInstance | undefined;
  const contentModules: ModuleInstance[] = [];
  const overlayModules: ModuleInstance[] = [];

  for (const instanceId of context.enabledModules) {
    const module = getModule(instanceId);
    if (!module) continue;

    const instance: ModuleInstance = { module, instanceId };
    const baseId = getBaseModuleId(instanceId);

    if (baseId === 'card') {
      cardModule = instance;
    } else if (baseId === 'viewport') {
      backgroundModules.push(instance);
    } else if (CONTENT_MODULES.includes(baseId)) {
      contentModules.push(instance);
    } else {
      overlayModules.push(instance);
    }
  }

  // Helper to render module HTML
  const renderModule = (instance: ModuleInstance): string => {
    const { module, instanceId } = instance;
    const data = formData[instanceId] || module.defaults;
    try {
      const html = module.getHtml(data, context);
      const label = instanceId !== module.id ? `${module.name} (${instanceId})` : module.name;
      return html ? `<!-- ${label} -->\n${html}` : '';
    } catch (error) {
      console.error(`Error generating HTML for module "${instanceId}":`, error);
      return '';
    }
  };

  // Build HTML parts
  const parts: string[] = [];

  // 1. Background modules (viewport)
  for (const instance of backgroundModules) {
    const html = renderModule(instance);
    if (html) parts.push(html);
  }

  // 2. Card with content inside (if active) or just content
  if (isCardActive && cardModule) {
    const cardData = formData[cardModule.instanceId] || cardModule.module.defaults;

    // Generate card wrapper open
    parts.push(`<!-- ${cardModule.module.name} -->`);
    parts.push(generateCardWrapperOpen(cardData));

    // Content modules inside card
    for (const instance of contentModules) {
      const html = renderModule(instance);
      if (html) parts.push(html);
    }

    // Close card wrapper
    parts.push(generateCardWrapperClose());
  } else {
    // No card - wrap content modules in a content wrapper for proper height inheritance
    if (contentModules.length > 0) {
      parts.push(`<!-- Content Wrapper (no card) -->`);
      parts.push(`<div class="content-wrapper">`);

      for (const instance of contentModules) {
        const html = renderModule(instance);
        if (html) parts.push(html);
      }

      parts.push(`</div>`);
    }
  }

  // 3. Overlay modules (on top, outside card)
  for (const instance of overlayModules) {
    const html = renderModule(instance);
    if (html) parts.push(html);
  }

  return parts.filter(Boolean).join('\n\n');
}

/**
 * Generate opening tag for card wrapper
 */
function generateCardWrapperOpen(cardData: ModuleData): string {
  return `
  <!-- ===== CARD CONTAINER ===== -->
  <div class="card-container">`;
}

/**
 * Generate closing tag for card wrapper
 */
function generateCardWrapperClose(): string {
  return `  </div>
  <!-- ===== END CARD CONTAINER ===== -->`;
}

/**
 * Coleta CSS variables de todos os módulos
 */
function collectStyleVariables(
  modules: ModuleDefinition[],
  formData: Record<string, ModuleData>
): string {
  const allVariables: Record<string, string> = {};

  for (const module of modules) {
    const data = formData[module.id] || module.defaults;
    try {
      const variables = module.getStyleVariables(data);
      Object.assign(allVariables, variables);
    } catch (error) {
      console.error(`Error generating style variables for module "${module.id}":`, error);
    }
  }

  return Object.entries(allVariables)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n      ');
}

/**
 * Gera configuração para auto-sizing se necessário
 */
function generateAutoSizeConfig(formData: Record<string, ModuleData>): string {
  const textFieldsData = formData.textFields as any;

  if (!textFieldsData || textFieldsData.autoSizeMode !== 'proportional-3-1') {
    return '';
  }

  const largerIndex = textFieldsData.autoSizeLargerIndex ?? 0;
  const smallerIndex = textFieldsData.autoSizeSmallerIndex ?? 1;

  return `
  <script>
    // Auto-size configuration for text fields
    window.autoSizeConfig = {
      enabled: true,
      mode: 'proportional-3-1',
      largerIndex: ${textFieldsData.autoSizeLargerIndex ?? 0},
      referenceSelector: '.content-image'
    };
    console.log('[Auto-Size] Configuration injected:', window.autoSizeConfig);
  </script>`;
}

/**
 * Gera o HTML final completo
 */
function generateFinalHtml(params: {
  viewportWidth: number;
  viewportHeight: number;
  modulesCSS: string;
  modulesHTML: string;
  styleVariables: string;
  baseUrl: string;
  formData?: Record<string, ModuleData>;
}): string {
  const {
    viewportWidth,
    viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables,
    baseUrl,
    formData = {},
  } = params;

  const autoSizeScript = generateAutoSizeConfig(formData);

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${viewportWidth}, height=${viewportHeight}">
  <title>Generated Image</title>

  <!-- Base CSS -->
  <link rel="stylesheet" href="${baseUrl}/css/base/reset.css">
  <link rel="stylesheet" href="${baseUrl}/css/modules/fonts.css">

  <!-- Module CSS -->
  <style>
    /* CSS Variables */
    :root {
      ${styleVariables}
    }

    /* Base body styles */
    body {
      width: ${viewportWidth}px;
      height: ${viewportHeight}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Content wrapper (used when card is inactive) - styles injected dynamically */
    .content-wrapper {
      flex: 1;
      display: flex;
      width: 100%;
      min-height: 0;
      position: relative;
      box-sizing: border-box;
    }

    /* Module styles */
    ${modulesCSS}
  </style>
</head>
<body>
  ${modulesHTML}

  <!-- Global scripts -->
  <script src="${baseUrl}/js/global-elements.js"></script>
  ${autoSizeScript}
  <script src="${baseUrl}/js/text-auto-size.js"></script>
  <script>
    // Wait for fonts to load, then show body
    document.fonts.ready.then(function() {
      document.body.classList.add('fonts-loaded');
    });
  </script>
</body>
</html>`;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Processa um valor de posição (string ou number) para CSS
 */
export function processPosition(value: string | number | undefined): string {
  if (value === undefined) return 'auto';
  if (typeof value === 'number') return `${value}px`;
  return value;
}

/**
 * Gera CSS de posicionamento a partir de um objeto Position
 */
export function generatePositionCSS(position: {
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  width?: string | number;
  height?: string | number;
}): string {
  const rules: string[] = [];

  if (position.top !== undefined) rules.push(`top: ${processPosition(position.top)}`);
  if (position.left !== undefined) rules.push(`left: ${processPosition(position.left)}`);
  if (position.right !== undefined) rules.push(`right: ${processPosition(position.right)}`);
  if (position.bottom !== undefined) rules.push(`bottom: ${processPosition(position.bottom)}`);
  if (position.width !== undefined) rules.push(`width: ${processPosition(position.width)}`);
  if (position.height !== undefined) rules.push(`height: ${processPosition(position.height)}`);

  return rules.join('; ');
}

/**
 * Converte posição especial para CSS
 */
export function specialPositionToCSS(
  position: string,
  padding: number = 40
): { top?: string; left?: string; right?: string; bottom?: string } {
  const paddingPx = `${padding}px`;

  switch (position) {
    case 'top-left':
      return { top: paddingPx, left: paddingPx };
    case 'top-right':
      return { top: paddingPx, right: paddingPx };
    case 'bottom-left':
      return { bottom: paddingPx, left: paddingPx };
    case 'bottom-right':
      return { bottom: paddingPx, right: paddingPx };
    case 'top-center':
      return { top: paddingPx, left: '50%' };
    case 'bottom-center':
      return { bottom: paddingPx, left: '50%' };
    case 'center-left':
      return { top: '50%', left: paddingPx };
    case 'center-right':
      return { top: '50%', right: paddingPx };
    case 'center':
      return { top: '50%', left: '50%' };
    default:
      return {};
  }
}

/**
 * Sanitiza texto para HTML (previne XSS)
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converte objeto de estilo para string CSS inline
 */
export function styleObjectToString(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Mescla múltiplos objetos de estilo
 */
export function mergeStyles(
  ...styles: (Record<string, string | number | undefined> | undefined)[]
): Record<string, string | number | undefined> {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Verifica se um módulo especial está ativo (Duo, etc)
 */
export function hasSpecialModule(
  enabledModules: string[],
  moduleId: string
): boolean {
  return enabledModules.includes(moduleId);
}
