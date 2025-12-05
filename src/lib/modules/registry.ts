import { ModuleDefinition, ModuleCategory } from './types';
import { getBaseModuleId } from './moduleInstanceUtils';

// Import modules
import { ViewportModule } from './viewport';
import { cardModule } from './card';
import { textFieldsModule } from './text-fields';
import { contentImageModule } from './content-image';
import { imageTextBoxModule } from './image-text-box';
import { CornersModule } from './corners';
import { duoModule } from './duo';
import { FreeTextModule } from './free-text';
import { ArrowBottomTextModule } from './arrow-bottom-text';
import { svgElementsModule } from './svg-elements';
import { bulletsModule } from './bullets';

// ============================================================================
// MODULE REGISTRY
// ============================================================================

/**
 * Registro central de todos os módulos disponíveis
 * Módulos serão adicionados aqui conforme implementados
 */
export const moduleRegistry: Record<string, ModuleDefinition> = {
  // Fase 1: Layout modules
  viewport: ViewportModule,
  card: cardModule,

  // Fase 2: Content modules
  textFields: textFieldsModule,
  contentImage: contentImageModule,
  imageTextBox: imageTextBoxModule,
  bullets: bulletsModule,

  // Fase 3: Overlay modules
  corners: CornersModule,
  freeText: FreeTextModule,
  arrowBottomText: ArrowBottomTextModule,
  svgElements: svgElementsModule,

  // Fase 4: Special modules
  duo: duoModule,
  // openLoop: openLoopModule,
};

/**
 * Tipo para IDs de módulos registrados
 */
export type RegisteredModuleId = keyof typeof moduleRegistry;

/**
 * Obtém um módulo pelo ID
 * Suporta IDs de instância (e.g., 'textFields-1' -> retorna 'textFields')
 */
export function getModule(id: string): ModuleDefinition | undefined {
  const baseId = getBaseModuleId(id);
  return moduleRegistry[baseId];
}

/**
 * Obtém múltiplos módulos pelos IDs
 * Suporta IDs de instância (e.g., ['textFields-1', 'textFields-2'] -> retorna [textFields, textFields])
 */
export function getModules(ids: string[]): ModuleDefinition[] {
  return ids
    .map(id => {
      const baseId = getBaseModuleId(id);
      return moduleRegistry[baseId];
    })
    .filter((m): m is ModuleDefinition => m !== undefined);
}

/**
 * Obtém todos os módulos ativos (com dados válidos)
 */
export function getActiveModules(enabledModuleIds: string[]): ModuleDefinition[] {
  return getModules(enabledModuleIds);
}

/**
 * Obtém módulos por categoria
 */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return Object.values(moduleRegistry).filter(m => m.category === category);
}

/**
 * Lista todos os IDs de módulos disponíveis
 */
export function listModuleIds(): string[] {
  return Object.keys(moduleRegistry);
}

/**
 * Lista todos os módulos disponíveis
 */
export function listModules(): ModuleDefinition[] {
  return Object.values(moduleRegistry);
}

/**
 * Verifica se um módulo existe
 */
export function hasModule(id: string): boolean {
  return id in moduleRegistry;
}

/**
 * Verifica dependências de um módulo
 * Retorna array de IDs de dependências faltantes
 */
export function checkDependencies(
  moduleId: string,
  enabledModules: string[]
): string[] {
  const module = getModule(moduleId);
  if (!module?.dependencies) return [];

  return module.dependencies.filter(dep => !enabledModules.includes(dep));
}

/**
 * Verifica conflitos de um módulo
 * Retorna array de IDs de módulos em conflito
 */
export function checkConflicts(
  moduleId: string,
  enabledModules: string[]
): string[] {
  const module = getModule(moduleId);
  if (!module?.conflicts) return [];

  return module.conflicts.filter(conflict => enabledModules.includes(conflict));
}

/**
 * Valida se uma combinação de módulos é válida
 * Retorna erros encontrados
 */
export function validateModuleCombination(
  enabledModules: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const moduleId of enabledModules) {
    // Check dependencies
    const missingDeps = checkDependencies(moduleId, enabledModules);
    if (missingDeps.length > 0) {
      const module = getModule(moduleId);
      errors.push(
        `Módulo "${module?.name || moduleId}" requer: ${missingDeps.join(', ')}`
      );
    }

    // Check conflicts
    const conflicts = checkConflicts(moduleId, enabledModules);
    if (conflicts.length > 0) {
      const module = getModule(moduleId);
      errors.push(
        `Módulo "${module?.name || moduleId}" conflita com: ${conflicts.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ordena módulos por z-index para renderização
 */
export function sortModulesByZIndex(modules: ModuleDefinition[]): ModuleDefinition[] {
  return [...modules].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Registra um novo módulo (para uso dinâmico)
 */
export function registerModule(module: ModuleDefinition): void {
  if (moduleRegistry[module.id]) {
    console.warn(`Module "${module.id}" already registered. Overwriting.`);
  }
  moduleRegistry[module.id] = module;
}

/**
 * Remove um módulo do registry (para uso dinâmico)
 */
export function unregisterModule(id: string): boolean {
  if (moduleRegistry[id]) {
    delete moduleRegistry[id];
    return true;
  }
  return false;
}

// ============================================================================
// Z-INDEX CONSTANTS
// ============================================================================

/**
 * Z-index padrão por categoria de módulo
 */
export const MODULE_Z_INDEX = {
  // Layout (background)
  viewport: 0,
  card: 1,

  // Content
  contentImage: 5,
  imageTextBox: 7,
  textFields: 10,
  bullets: 10,
  openLoop: 10,

  // Overlays
  svgElements: 20,
  freeText: 30,
  arrowBottomText: 30,

  // Top layer
  corners: 99,

  // Special (above everything)
  duo: 100,
} as const;
