/**
 * Server-side extension for Duo Module
 *
 * This file adds server-side only functionality (modifyGeneration)
 * to the duo module. Import this in API routes instead of './index'.
 */

import { duoModule } from './index';
import { duoModifyGeneration } from './generation.server';
import { ModuleDefinition } from '../types';

/**
 * Duo Module with server-side generation support
 * Use this in API routes
 */
export const duoModuleServer: ModuleDefinition = {
  ...duoModule,
  modifyGeneration: duoModifyGeneration,
};

// Re-export everything from index
export * from './index';
