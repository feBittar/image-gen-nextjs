// ============================================================================
// MODULE SYSTEM - PUBLIC API
// ============================================================================

// Types
export * from './types';

// Registry
export {
  moduleRegistry,
  getModule,
  getModules,
  getActiveModules,
  getModulesByCategory,
  listModuleIds,
  listModules,
  hasModule,
  checkDependencies,
  checkConflicts,
  validateModuleCombination,
  sortModulesByZIndex,
  registerModule,
  unregisterModule,
  MODULE_Z_INDEX,
  type RegisteredModuleId,
} from './registry';

// Compositer
export {
  composeTemplate,
  processPosition,
  generatePositionCSS,
  specialPositionToCSS,
  sanitizeHtml,
  styleObjectToString,
  mergeStyles,
  hasSpecialModule,
} from './compositer';
