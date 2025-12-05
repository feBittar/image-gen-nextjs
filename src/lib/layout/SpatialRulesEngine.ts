/**
 * Spatial Rules Engine
 *
 * Aplica regras de posicionamento espacial entre módulos.
 */

import type { RenderOrderItem, SpatialRule, SpatialRuleResult } from './types';

export class SpatialRulesEngine {
  private rules: SpatialRule[];

  constructor(rules: SpatialRule[] = []) {
    this.rules = rules;
  }

  /**
   * Aplica todas as regras à ordem de renderização
   */
  applyRules(renderOrder: RenderOrderItem[]): RenderOrderItem[] {
    let order = [...renderOrder];

    for (const rule of this.rules) {
      const result = this.applyRule(order, rule);
      if (result.success && result.modifiedOrder) {
        order = result.modifiedOrder;
      } else if (!result.success) {
        console.warn(`Failed to apply rule ${rule.id}:`, result.error);
      }
    }

    return order;
  }

  /**
   * Aplica uma regra específica
   */
  applyRule(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): SpatialRuleResult {
    switch (rule.type) {
      case 'before':
        return this.applyBefore(order, rule);

      case 'after':
        return this.applyAfter(order, rule);

      case 'between':
        return this.applyBetween(order, rule);

      case 'wrap':
        return this.applyWrap(order, rule);

      default:
        return {
          success: false,
          error: `Unknown rule type: ${(rule as any).type}`,
        };
    }
  }

  /**
   * Regra BEFORE: coloca target antes de reference
   */
  private applyBefore(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): SpatialRuleResult {
    if (!rule.reference) {
      return {
        success: false,
        error: 'BEFORE rule requires reference',
      };
    }

    const targetIndex = this.findModuleIndex(order, rule.target);
    if (targetIndex === -1) {
      return {
        success: false,
        error: `Target module not found: ${rule.target}`,
      };
    }

    const refIndex = this.findModuleIndex(order, rule.reference);
    if (refIndex === -1) {
      return {
        success: false,
        error: `Reference module not found: ${rule.reference}`,
      };
    }

    const newOrder = [...order];
    const [target] = newOrder.splice(targetIndex, 1);

    // Recalcula índice de referência após remoção
    const newRefIndex = this.findModuleIndex(newOrder, rule.reference);
    newOrder.splice(newRefIndex, 0, target);

    return {
      success: true,
      modifiedOrder: newOrder,
    };
  }

  /**
   * Regra AFTER: coloca target depois de reference
   */
  private applyAfter(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): SpatialRuleResult {
    if (!rule.reference) {
      return {
        success: false,
        error: 'AFTER rule requires reference',
      };
    }

    const targetIndex = this.findModuleIndex(order, rule.target);
    if (targetIndex === -1) {
      return {
        success: false,
        error: `Target module not found: ${rule.target}`,
      };
    }

    const refIndex = this.findModuleIndex(order, rule.reference);
    if (refIndex === -1) {
      return {
        success: false,
        error: `Reference module not found: ${rule.reference}`,
      };
    }

    const newOrder = [...order];
    const [target] = newOrder.splice(targetIndex, 1);

    // Recalcula índice de referência e insere depois
    const newRefIndex = this.findModuleIndex(newOrder, rule.reference);
    newOrder.splice(newRefIndex + 1, 0, target);

    return {
      success: true,
      modifiedOrder: newOrder,
    };
  }

  /**
   * Regra BETWEEN: coloca target entre reference e reference2
   */
  private applyBetween(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): SpatialRuleResult {
    if (!rule.reference || !rule.reference2) {
      return {
        success: false,
        error: 'BETWEEN rule requires reference and reference2',
      };
    }

    const targetIndex = this.findModuleIndex(order, rule.target);
    if (targetIndex === -1) {
      return {
        success: false,
        error: `Target module not found: ${rule.target}`,
      };
    }

    const ref1Index = this.findModuleIndex(order, rule.reference);
    const ref2Index = this.findModuleIndex(order, rule.reference2);

    if (ref1Index === -1) {
      return {
        success: false,
        error: `Reference module not found: ${rule.reference}`,
      };
    }

    if (ref2Index === -1) {
      return {
        success: false,
        error: `Reference2 module not found: ${rule.reference2}`,
      };
    }

    // Verifica se referencias estão adjacentes ou separadas
    const minIndex = Math.min(ref1Index, ref2Index);
    const maxIndex = Math.max(ref1Index, ref2Index);

    const newOrder = [...order];
    const [target] = newOrder.splice(targetIndex, 1);

    // Recalcula índices após remoção
    let insertIndex: number;
    if (targetIndex < minIndex) {
      // Target estava antes dos dois
      insertIndex = maxIndex;
    } else if (targetIndex > maxIndex) {
      // Target estava depois dos dois
      insertIndex = minIndex + 1;
    } else {
      // Target estava entre os dois (já está na posição correta)
      insertIndex = minIndex + 1;
    }

    newOrder.splice(insertIndex, 0, target);

    return {
      success: true,
      modifiedOrder: newOrder,
    };
  }

  /**
   * Regra WRAP: envolve target com um wrapper
   * (Implementação conceitual - requer suporte na render tree)
   */
  private applyWrap(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): SpatialRuleResult {
    if (!rule.wrapper) {
      return {
        success: false,
        error: 'WRAP rule requires wrapper config',
      };
    }

    // Para WRAP, precisaríamos modificar a estrutura RenderNode
    // em vez de apenas reordenar items
    // Por enquanto, retorna sucesso sem modificar (será implementado no engine)

    return {
      success: true,
      modifiedOrder: order,
    };
  }

  /**
   * Encontra índice de um módulo na ordem
   */
  private findModuleIndex(
    order: RenderOrderItem[],
    moduleId: string
  ): number {
    return order.findIndex((item) => {
      // Suporta busca com ou sem submoduleId
      if (moduleId.includes('.')) {
        const [modId, subId] = moduleId.split('.');
        return item.moduleId === modId && item.submoduleId === subId;
      }
      return item.moduleId === moduleId;
    });
  }

  /**
   * Adiciona uma regra
   */
  addRule(rule: SpatialRule): void {
    // Gera ID se não fornecido
    if (!rule.id) {
      rule.id = this.generateRuleId();
    }

    this.rules.push(rule);
  }

  /**
   * Remove uma regra
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * Atualiza uma regra
   */
  updateRule(ruleId: string, updates: Partial<SpatialRule>): void {
    const ruleIndex = this.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = {
        ...this.rules[ruleIndex],
        ...updates,
      };
    }
  }

  /**
   * Obtém todas as regras
   */
  getRules(): SpatialRule[] {
    return [...this.rules];
  }

  /**
   * Obtém uma regra específica
   */
  getRule(ruleId: string): SpatialRule | undefined {
    return this.rules.find((r) => r.id === ruleId);
  }

  /**
   * Define todas as regras
   */
  setRules(rules: SpatialRule[]): void {
    this.rules = rules.map((r) => ({
      ...r,
      id: r.id || this.generateRuleId(),
    }));
  }

  /**
   * Limpa todas as regras
   */
  clearRules(): void {
    this.rules = [];
  }

  /**
   * Valida uma regra
   */
  validateRule(rule: SpatialRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.type) {
      errors.push('Rule type is required');
    }

    if (!rule.target) {
      errors.push('Target module is required');
    }

    switch (rule.type) {
      case 'before':
      case 'after':
        if (!rule.reference) {
          errors.push(`${rule.type.toUpperCase()} rule requires reference`);
        }
        break;

      case 'between':
        if (!rule.reference || !rule.reference2) {
          errors.push('BETWEEN rule requires reference and reference2');
        }
        break;

      case 'wrap':
        if (!rule.wrapper) {
          errors.push('WRAP rule requires wrapper config');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida todas as regras
   */
  validateAllRules(): {
    valid: boolean;
    ruleErrors: Record<string, string[]>;
  } {
    const ruleErrors: Record<string, string[]> = {};
    let allValid = true;

    for (const rule of this.rules) {
      const validation = this.validateRule(rule);
      if (!validation.valid) {
        ruleErrors[rule.id] = validation.errors;
        allValid = false;
      }
    }

    return {
      valid: allValid,
      ruleErrors,
    };
  }

  /**
   * Detecta regras conflitantes
   */
  detectConflicts(): {
    conflicts: Array<{ rule1: string; rule2: string; reason: string }>;
  } {
    const conflicts: Array<{ rule1: string; rule2: string; reason: string }> =
      [];

    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        const rule1 = this.rules[i];
        const rule2 = this.rules[j];

        // Detecta se ambas as regras afetam o mesmo target
        if (rule1.target === rule2.target) {
          conflicts.push({
            rule1: rule1.id,
            rule2: rule2.id,
            reason: `Both rules target the same module: ${rule1.target}`,
          });
        }

        // Detecta ciclos (A before B, B before A)
        if (
          rule1.type === 'before' &&
          rule2.type === 'before' &&
          rule1.target === rule2.reference &&
          rule1.reference === rule2.target
        ) {
          conflicts.push({
            rule1: rule1.id,
            rule2: rule2.id,
            reason: 'Circular dependency detected',
          });
        }
      }
    }

    return { conflicts };
  }

  /**
   * Gera ID único para regra
   */
  private generateRuleId(): string {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Exporta regras
   */
  export(): SpatialRule[] {
    return this.getRules();
  }

  /**
   * Importa regras
   */
  import(rules: SpatialRule[]): void {
    this.setRules(rules);
  }
}
