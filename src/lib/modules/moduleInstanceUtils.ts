/**
 * Utilities for handling module instances
 * Supports multiple instances of the same module (e.g., textFields-1, textFields-2)
 */

/**
 * Parsed module ID with base and instance number
 */
export interface ParsedModuleId {
  /** Base module ID (e.g., 'textFields') */
  base: string;

  /** Instance number (1, 2, 3...) or null if not an instance */
  instance: number | null;

  /** Full ID (e.g., 'textFields-2' or 'viewport') */
  fullId: string;
}

/**
 * Parse a module ID into base and instance number
 * Examples:
 * - 'textFields' -> { base: 'textFields', instance: null, fullId: 'textFields' }
 * - 'textFields-1' -> { base: 'textFields', instance: 1, fullId: 'textFields-1' }
 * - 'textFields-2' -> { base: 'textFields', instance: 2, fullId: 'textFields-2' }
 */
export function parseModuleId(moduleId: string): ParsedModuleId {
  const match = moduleId.match(/^(.+)-(\d+)$/);

  if (match) {
    return {
      base: match[1],
      instance: parseInt(match[2], 10),
      fullId: moduleId,
    };
  }

  return {
    base: moduleId,
    instance: null,
    fullId: moduleId,
  };
}

/**
 * Create an instance ID
 * Example: createInstanceId('textFields', 2) -> 'textFields-2'
 */
export function createInstanceId(baseModuleId: string, instanceNumber: number): string {
  return `${baseModuleId}-${instanceNumber}`;
}

/**
 * Get all instances of a module from enabled modules list
 * Includes the base module ID (without number) as the first instance if enabled
 * Example: getModuleInstances('textFields', ['viewport', 'textFields', 'textFields-2', 'card'])
 * Returns: ['textFields', 'textFields-2']
 */
export function getModuleInstances(baseModuleId: string, enabledModules: string[]): string[] {
  const instances: string[] = [];

  for (const id of enabledModules) {
    const parsed = parseModuleId(id);

    // Include base module (e.g., 'textFields') and numbered instances (e.g., 'textFields-2')
    if (parsed.base === baseModuleId) {
      instances.push(id);
    }
  }

  return instances;
}

/**
 * Get the next available instance number for a module
 * Treats base module ID (without number) as instance #1
 * Example: getNextInstanceNumber('textFields', ['textFields', 'textFields-3'])
 * Returns: 4 (base=1, max numbered=3, so next=4)
 */
export function getNextInstanceNumber(baseModuleId: string, enabledModules: string[]): number {
  const instances = getModuleInstances(baseModuleId, enabledModules);

  if (instances.length === 0) {
    return 1; // First instance
  }

  const instanceNumbers = instances.map((id) => {
    const parsed = parseModuleId(id);
    // Base module (without number) is treated as instance #1
    return parsed.instance ?? 1;
  });

  const maxInstance = Math.max(...instanceNumbers);

  return maxInstance + 1;
}

/**
 * Check if a module has any instances enabled
 * Example: hasAnyInstance('textFields', ['viewport', 'textFields-1', 'card']) -> true
 */
export function hasAnyInstance(baseModuleId: string, enabledModules: string[]): boolean {
  return getModuleInstances(baseModuleId, enabledModules).length > 0;
}

/**
 * Get the count of instances for a module
 * Example: getInstanceCount('textFields', ['textFields-1', 'textFields-2']) -> 2
 */
export function getInstanceCount(baseModuleId: string, enabledModules: string[]): number {
  return getModuleInstances(baseModuleId, enabledModules).length;
}

/**
 * Check if a module ID is an instance ID
 * Example: isInstanceId('textFields-1') -> true
 * Example: isInstanceId('textFields') -> false
 */
export function isInstanceId(moduleId: string): boolean {
  return parseModuleId(moduleId).instance !== null;
}

/**
 * Get base module ID from any module ID
 * Example: getBaseModuleId('textFields-2') -> 'textFields'
 * Example: getBaseModuleId('viewport') -> 'viewport'
 */
export function getBaseModuleId(moduleId: string): string {
  return parseModuleId(moduleId).base;
}

/**
 * Get the display instance number for a module ID
 * Base module (without number) is displayed as #1
 * Example: getInstanceDisplayNumber('textFields') -> 1
 * Example: getInstanceDisplayNumber('textFields-2') -> 2
 */
export function getInstanceDisplayNumber(moduleId: string): number {
  const parsed = parseModuleId(moduleId);
  return parsed.instance ?? 1;
}
