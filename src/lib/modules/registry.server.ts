/**
 * Server-side Module Registry
 *
 * This registry extends the client-side registry with server-side only functionality
 * (like modifyGeneration hooks that use Node.js APIs).
 *
 * Import this in API routes instead of './registry'.
 */

import { ModuleDefinition } from './types';
import { duoModuleServer } from './duo/index.server';

// Import client registry
import { moduleRegistry as clientRegistry } from './registry';

/**
 * Server-side module registry
 * Replaces duo module with server-side version
 */
export const moduleRegistry: Record<string, ModuleDefinition> = {
  ...clientRegistry,
  duo: duoModuleServer, // Server-side version with modifyGeneration
};

/**
 * Get a module by ID (server-side version)
 */
export function getModule(id: string): ModuleDefinition | undefined {
  return moduleRegistry[id];
}

/**
 * Get multiple modules by IDs
 */
export function getModules(ids: string[]): ModuleDefinition[] {
  return ids
    .map(id => moduleRegistry[id])
    .filter((m): m is ModuleDefinition => m !== undefined);
}

/**
 * Get active modules by IDs (server-side)
 */
export function getActiveModules(moduleIds: string[]): ModuleDefinition[] {
  return getModules(moduleIds);
}

/**
 * Sort modules by z-index (ascending)
 */
export function sortModulesByZIndex(modules: ModuleDefinition[]): ModuleDefinition[] {
  return [...modules].sort((a, b) => a.zIndex - b.zIndex);
}

// Re-export all other functions from client registry
export * from './registry';
