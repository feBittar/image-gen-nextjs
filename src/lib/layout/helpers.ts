/**
 * Layout Helpers
 *
 * Funções auxiliares para criar layouts horizontais comuns.
 */

import type { RenderOrderItem, RenderNode } from './types';

/**
 * Tipos de split disponíveis
 */
export const SPLIT_TYPES = {
  '50-50': '50% / 50%',
  '30-70': '30% / 70%',
  '70-30': '70% / 30%',
  '40-60': '40% / 60%',
  '60-40': '60% / 40%',
} as const;

export type SplitType = keyof typeof SPLIT_TYPES;

/**
 * Options para criação de splits
 */
export interface SplitOptions {
  gap?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

/**
 * Converte RenderNode para RenderOrderItem com groupConfig
 */
export function renderNodeToOrderItem(node: RenderNode): RenderOrderItem {
  if (node.type === 'module') {
    return {
      moduleId: node.moduleId!,
      submoduleId: node.submoduleId,
      id: node.id,
      flex: node.flex,
      marginTop: node.marginTop,
      marginBottom: node.marginBottom,
    };
  }

  if (node.type === 'group') {
    return {
      moduleId: '__group__',
      id: node.id,
      marginTop: node.marginTop,
      marginBottom: node.marginBottom,
      groupConfig: {
        direction: node.direction || 'column',
        gap: node.gap,
        alignItems: node.alignItems,
        justifyContent: node.justifyContent,
        children: (node.children || []).map(renderNodeToOrderItem),
      },
    };
  }

  // Spacer
  return {
    moduleId: '__spacer__',
    id: node.id,
    marginTop: node.marginTop,
  };
}

/**
 * Cria um layout split 50/50 horizontal e retorna como RenderOrderItem
 */
export function createSplit5050(
  leftModule: { moduleId: string; submoduleId?: string },
  rightModule: { moduleId: string; submoduleId?: string },
  options?: SplitOptions
): RenderOrderItem {
  return {
    moduleId: '__group__',
    id: `horizontal-group-${Date.now()}`,
    groupConfig: {
      direction: 'row',
      gap: options?.gap || '30px',
      alignItems: options?.alignItems || 'stretch',
      justifyContent: options?.justifyContent,
      children: [
        {
          moduleId: leftModule.moduleId,
          submoduleId: leftModule.submoduleId,
          id: `${leftModule.moduleId}-${leftModule.submoduleId || 'main'}-left`,
          flex: { basis: '50%', grow: 1, shrink: 1 },
        },
        {
          moduleId: rightModule.moduleId,
          submoduleId: rightModule.submoduleId,
          id: `${rightModule.moduleId}-${rightModule.submoduleId || 'main'}-right`,
          flex: { basis: '50%', grow: 1, shrink: 1 },
        },
      ],
    },
  };
}

/**
 * Cria um layout split 30/70 horizontal (left smaller)
 */
export function createSplit3070(
  leftModule: { moduleId: string; submoduleId?: string },
  rightModule: { moduleId: string; submoduleId?: string },
  options?: SplitOptions
): RenderOrderItem {
  return {
    moduleId: '__group__',
    id: `horizontal-group-${Date.now()}`,
    groupConfig: {
      direction: 'row',
      gap: options?.gap || '30px',
      alignItems: options?.alignItems || 'stretch',
      justifyContent: options?.justifyContent,
      children: [
        {
          moduleId: leftModule.moduleId,
          submoduleId: leftModule.submoduleId,
          id: `${leftModule.moduleId}-${leftModule.submoduleId || 'main'}-left`,
          flex: { basis: '30%', grow: 0, shrink: 1 },
        },
        {
          moduleId: rightModule.moduleId,
          submoduleId: rightModule.submoduleId,
          id: `${rightModule.moduleId}-${rightModule.submoduleId || 'main'}-right`,
          flex: { basis: '70%', grow: 1, shrink: 1 },
        },
      ],
    },
  };
}

/**
 * Cria um layout split 70/30 horizontal (right smaller)
 */
export function createSplit7030(
  leftModule: { moduleId: string; submoduleId?: string },
  rightModule: { moduleId: string; submoduleId?: string },
  options?: SplitOptions
): RenderOrderItem {
  return {
    moduleId: '__group__',
    id: `horizontal-group-${Date.now()}`,
    groupConfig: {
      direction: 'row',
      gap: options?.gap || '30px',
      alignItems: options?.alignItems || 'stretch',
      justifyContent: options?.justifyContent,
      children: [
        {
          moduleId: leftModule.moduleId,
          submoduleId: leftModule.submoduleId,
          id: `${leftModule.moduleId}-${leftModule.submoduleId || 'main'}-left`,
          flex: { basis: '70%', grow: 1, shrink: 1 },
        },
        {
          moduleId: rightModule.moduleId,
          submoduleId: rightModule.submoduleId,
          id: `${rightModule.moduleId}-${rightModule.submoduleId || 'main'}-right`,
          flex: { basis: '30%', grow: 0, shrink: 1 },
        },
      ],
    },
  };
}

/**
 * Cria um split horizontal com proporções customizadas
 */
export function createCustomSplit(
  leftModule: { moduleId: string; submoduleId?: string },
  rightModule: { moduleId: string; submoduleId?: string },
  splitType: SplitType,
  options?: SplitOptions
): RenderOrderItem {
  const [leftPercent, rightPercent] = splitType.split('-').map(p => parseInt(p));

  return {
    moduleId: '__group__',
    id: `horizontal-group-${Date.now()}`,
    groupConfig: {
      direction: 'row',
      gap: options?.gap || '30px',
      alignItems: options?.alignItems || 'stretch',
      justifyContent: options?.justifyContent,
      children: [
        {
          moduleId: leftModule.moduleId,
          submoduleId: leftModule.submoduleId,
          id: `${leftModule.moduleId}-${leftModule.submoduleId || 'main'}-left`,
          flex: {
            basis: `${leftPercent}%`,
            grow: leftPercent > 50 ? 1 : 0,
            shrink: 1
          },
        },
        {
          moduleId: rightModule.moduleId,
          submoduleId: rightModule.submoduleId,
          id: `${rightModule.moduleId}-${rightModule.submoduleId || 'main'}-right`,
          flex: {
            basis: `${rightPercent}%`,
            grow: rightPercent > 50 ? 1 : 0,
            shrink: 1
          },
        },
      ],
    },
  };
}

/**
 * Verifica se um RenderOrderItem é um grupo
 */
export function isGroupItem(item: RenderOrderItem): boolean {
  return item.moduleId === '__group__' && !!item.groupConfig;
}

/**
 * Verifica se um RenderOrderItem é um spacer
 */
export function isSpacerItem(item: RenderOrderItem): boolean {
  return item.moduleId === '__spacer__';
}
