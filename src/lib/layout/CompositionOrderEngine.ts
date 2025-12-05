/**
 * Composition Order Engine
 *
 * Gerencia a ordem de renderização dos módulos baseado na configuração.
 */

import { getModule } from '../modules/registry';
import type { ModuleData, RenderContext } from '../modules/types';
import type {
  RenderOrderItem,
  RenderNode,
  CompositionRenderContext,
} from './types';

export class CompositionOrderEngine {
  private renderOrder: RenderOrderItem[];

  constructor(renderOrder: RenderOrderItem[]) {
    this.renderOrder = renderOrder;
  }

  /**
   * Gera HTML baseado na ordem de renderização
   */
  generateHTML(context: CompositionRenderContext): string {
    const renderTree = this.buildRenderTree(context);
    return this.renderNode(renderTree, context);
  }

  /**
   * Constrói árvore de renderização a partir da ordem
   */
  private buildRenderTree(context: CompositionRenderContext): RenderNode {
    const children: RenderNode[] = [];

    for (let i = 0; i < this.renderOrder.length; i++) {
      const item = this.renderOrder[i];

      // Verifica condições de renderização
      if (item.conditional) {
        if (!this.evaluateCondition(item.conditional, context)) {
          continue;
        }
      }

      // Grupo horizontal/vertical
      if (item.moduleId === '__group__' && item.groupConfig) {
        const groupNode: RenderNode = {
          type: 'group',
          id: item.id ?? `group-${i}`,
          direction: item.groupConfig.direction,
          gap: item.groupConfig.gap,
          alignItems: item.groupConfig.alignItems,
          justifyContent: item.groupConfig.justifyContent,
          marginTop: item.marginTop,
          marginBottom: item.marginBottom,
          children: this.buildChildrenNodes(item.groupConfig.children, context),
        };
        children.push(groupNode);
        continue;
      }

      // Spacer
      if (item.moduleId === '__spacer__') {
        children.push({
          type: 'spacer',
          id: item.id ?? `spacer-${i}`,
          marginTop: item.marginTop,
        });
        continue;
      }

      // Cria nó do módulo
      const node: RenderNode = {
        type: 'module',
        id: item.id ?? `${item.moduleId}-${i}`,
        moduleId: item.moduleId,
        submoduleId: item.submoduleId,
        flex: item.position?.flex || item.flex,
        marginTop: item.marginTop,
        marginBottom: item.marginBottom,
      };

      children.push(node);

      // Adiciona spacer se houver margem
      if (item.marginBottom && i < this.renderOrder.length - 1) {
        children.push({
          type: 'spacer',
          id: `spacer-${i}`,
          marginTop: item.marginBottom,
        });
      }
    }

    // Retorna grupo raiz
    return {
      type: 'group',
      id: 'root',
      children,
      gap: '0',
    };
  }

  /**
   * Constrói nós filhos de um grupo
   */
  private buildChildrenNodes(
    children: RenderOrderItem[],
    context: CompositionRenderContext
  ): RenderNode[] {
    const nodes: RenderNode[] = [];

    for (let i = 0; i < children.length; i++) {
      const item = children[i];

      // Verifica condições
      if (item.conditional) {
        if (!this.evaluateCondition(item.conditional, context)) {
          continue;
        }
      }

      // Grupo aninhado
      if (item.moduleId === '__group__' && item.groupConfig) {
        nodes.push({
          type: 'group',
          id: item.id ?? `group-nested-${i}`,
          direction: item.groupConfig.direction,
          gap: item.groupConfig.gap,
          alignItems: item.groupConfig.alignItems,
          justifyContent: item.groupConfig.justifyContent,
          marginTop: item.marginTop,
          marginBottom: item.marginBottom,
          children: this.buildChildrenNodes(item.groupConfig.children, context),
        });
        continue;
      }

      // Spacer
      if (item.moduleId === '__spacer__') {
        nodes.push({
          type: 'spacer',
          id: item.id ?? `spacer-nested-${i}`,
          marginTop: item.marginTop,
        });
        continue;
      }

      // Módulo
      nodes.push({
        type: 'module',
        id: item.id ?? `${item.moduleId}-nested-${i}`,
        moduleId: item.moduleId,
        submoduleId: item.submoduleId,
        flex: item.position?.flex || item.flex,
        marginTop: item.marginTop,
        marginBottom: item.marginBottom,
      });
    }

    return nodes;
  }

  /**
   * Renderiza um nó da árvore
   */
  private renderNode(node: RenderNode, context: CompositionRenderContext): string {
    switch (node.type) {
      case 'module':
        return this.renderModule(node, context);

      case 'group':
        return this.renderGroup(node, context);

      case 'spacer':
        return this.renderSpacer(node);

      default:
        return '';
    }
  }

  /**
   * Renderiza um módulo
   */
  private renderModule(
    node: RenderNode,
    context: CompositionRenderContext
  ): string {
    if (!node.moduleId) return '';

    // Verifica se módulo está habilitado
    if (!context.enabledModules.includes(node.moduleId)) {
      return '';
    }

    const module = getModule(node.moduleId);
    if (!module) {
      console.warn(`Module not found: ${node.moduleId}`);
      return '';
    }

    const moduleData = context.allModulesData[node.moduleId] as ModuleData;
    if (!moduleData) {
      console.warn(`Module data not found for: ${node.moduleId}`);
      return '';
    }

    // Cria contexto de renderização para o módulo
    const moduleContext: RenderContext = {
      enabledModules: context.enabledModules,
      allModulesData: context.allModulesData,
      viewportWidth: context.viewportWidth,
      viewportHeight: context.viewportHeight,
      baseUrl: context.baseUrl,
    };

    // Renderiza submódulo se especificado
    if (node.submoduleId) {
      return this.renderSubmodule(module, moduleData, node, moduleContext);
    }

    // Renderização normal do módulo
    let html = module.getHtml(moduleData, moduleContext);

    // Aplica wrapper com flex/margens/estilos se necessário
    const styles: string[] = [];

    if (node.flex) {
      const flexStr = this.buildFlexStyle(node.flex);
      if (flexStr) styles.push(flexStr);
    }

    if (node.style) {
      Object.entries(node.style).forEach(([key, value]) => {
        // Converte camelCase para kebab-case se necessário
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        styles.push(`${cssKey}: ${value}`);
      });
    }

    if (node.marginTop) styles.push(`margin-top: ${node.marginTop}`);
    if (node.marginBottom) styles.push(`margin-bottom: ${node.marginBottom}`);

    if (styles.length > 0) {
      const styleAttr = styles.join('; ');
      const className = node.className ? ` class="${node.className}"` : '';
      html = `<div${className} style="${styleAttr}">${html}</div>`;
    }

    return html;
  }

  /**
   * Renderiza um submódulo (ex: textFields.field1)
   */
  private renderSubmodule(
    module: ReturnType<typeof getModule>,
    moduleData: ModuleData,
    node: RenderNode,
    context: RenderContext
  ): string {
    if (!node.submoduleId || !module) return '';

    // Casos especiais por módulo
    if (module.id === 'textFields') {
      return this.renderTextFieldSubmodule(moduleData, node, context);
    }

    if (module.id === 'bullets') {
      return this.renderBulletSubmodule(moduleData, node, context);
    }

    // Fallback: renderiza módulo completo
    return module.getHtml(moduleData, context);
  }

  /**
   * Renderiza um campo de texto específico
   */
  private renderTextFieldSubmodule(
    moduleData: ModuleData,
    node: RenderNode,
    context: RenderContext
  ): string {
    const data = moduleData as any;
    const fields = data.fields || [];

    // Extrai índice do submoduleId (ex: 'field1' → 1, 'field.0' → 0)
    const match = node.submoduleId?.match(/field[.\s]*(\d+)/i);
    if (!match) return '';

    const fieldIndex = parseInt(match[1], 10);
    const field = fields[fieldIndex];

    if (!field) return '';

    // Renderiza o campo individual
    const fieldClass = `text-item text-item-${fieldIndex + 1}`;
    const content = field.processedContent || field.content || '';

    // Estilos do campo
    const styles: string[] = [];
    if (field.fontSize) styles.push(`font-size: ${field.fontSize}px`);
    if (field.fontFamily) styles.push(`font-family: ${field.fontFamily}`);
    if (field.fontWeight) styles.push(`font-weight: ${field.fontWeight}`);
    if (field.color) styles.push(`color: ${field.color}`);
    if (field.textAlign) styles.push(`text-align: ${field.textAlign}`);
    if (field.lineHeight) styles.push(`line-height: ${field.lineHeight}`);

    const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

    return `<div class="${fieldClass}"${styleAttr}>${content}</div>`;
  }

  /**
   * Renderiza um bullet específico
   */
  private renderBulletSubmodule(
    moduleData: ModuleData,
    node: RenderNode,
    context: RenderContext
  ): string {
    const data = moduleData as any;
    const items = data.items || [];

    // Extrai índice do submoduleId
    const match = node.submoduleId?.match(/item[.\s]*(\d+)/i);
    if (!match) return '';

    const itemIndex = parseInt(match[1], 10);
    const item = items[itemIndex];

    if (!item) return '';

    // Renderiza o bullet individual
    // (Implementação simplificada - pode ser expandida)
    return `<div class="bullet-item">${item.text || ''}</div>`;
  }

  /**
   * Renderiza um grupo
   */
  private renderGroup(node: RenderNode, context: CompositionRenderContext): string {
    if (!node.children || node.children.length === 0) {
      return '';
    }

    const childrenHtml = node.children
      .map((child) => this.renderNode(child, context))
      .filter((html) => html.length > 0)
      .join('\n');

    if (!childrenHtml) return '';

    // Estilos do grupo
    const direction = node.direction || 'column'; // Default column

    const styles: string[] = [
      'display: flex',
      `flex-direction: ${direction}`,
    ];

    if (node.gap) styles.push(`gap: ${node.gap}`);
    if (node.marginTop) styles.push(`margin-top: ${node.marginTop}`);
    if (node.marginBottom) styles.push(`margin-bottom: ${node.marginBottom}`);

    // Alinhamento e justificação
    if (node.alignItems) styles.push(`align-items: ${node.alignItems}`);
    if (node.justifyContent) styles.push(`justify-content: ${node.justifyContent}`);

    // Estilos inline adicionais
    if (node.style) {
      Object.entries(node.style).forEach(([key, value]) => {
        styles.push(`${key}: ${value}`);
      });
    }

    const className = node.className ? ` class="${node.className}"` : '';
    const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

    return `<div${className}${styleAttr}>${childrenHtml}</div>`;
  }

  /**
   * Renderiza um spacer
   */
  private renderSpacer(node: RenderNode): string {
    const height = node.marginTop || '20px';
    return `<div class="composition-spacer" style="height: ${height};"></div>`;
  }

  /**
   * Constrói estilo flex
   */
  private buildFlexStyle(flex: RenderNode['flex']): string {
    if (!flex) return '';

    const grow = flex.grow ?? 0;
    const shrink = flex.shrink ?? 1;
    const basis = flex.basis ?? 'auto';

    return `flex: ${grow} ${shrink} ${basis};`;
  }

  /**
   * Constrói estilo de margem
   */
  private buildMarginStyle(node: RenderNode): string {
    const styles: string[] = [];

    if (node.marginTop) styles.push(`margin-top: ${node.marginTop}`);
    if (node.marginBottom) styles.push(`margin-bottom: ${node.marginBottom}`);

    return styles.join('; ');
  }

  /**
   * Avalia condição de renderização
   */
  private evaluateCondition(
    condition: RenderOrderItem['conditional'],
    context: CompositionRenderContext
  ): boolean {
    if (!condition) return true;

    // Implementação simplificada
    // TODO: Expandir com avaliador de expressões mais robusto

    if (condition.showIf) {
      // Ex: "hasImage" → verifica se contentImage está habilitado e tem URL
      if (condition.showIf === 'hasImage') {
        const imageData = context.allModulesData.contentImage as any;
        return (
          context.enabledModules.includes('contentImage') &&
          imageData?.imageUrl
        );
      }

      // Ex: "bulletCount > 0"
      if (condition.showIf.includes('bulletCount')) {
        const bulletsData = context.allModulesData.bullets as any;
        const count = bulletsData?.items?.length || 0;
        const match = condition.showIf.match(/bulletCount\s*([><=]+)\s*(\d+)/);
        if (match) {
          const [, operator, value] = match;
          const threshold = parseInt(value, 10);
          switch (operator) {
            case '>':
              return count > threshold;
            case '>=':
              return count >= threshold;
            case '<':
              return count < threshold;
            case '<=':
              return count <= threshold;
            case '==':
            case '===':
              return count === threshold;
            default:
              return false;
          }
        }
      }
    }

    if (condition.hideIf) {
      // Inverte lógica do showIf
      return !this.evaluateCondition({ showIf: condition.hideIf }, context);
    }

    return true;
  }

  /**
   * Atualiza ordem de renderização
   */
  setRenderOrder(order: RenderOrderItem[]): void {
    this.renderOrder = order;
  }

  /**
   * Obtém ordem atual
   */
  getRenderOrder(): RenderOrderItem[] {
    return [...this.renderOrder];
  }

  /**
   * Move item na ordem
   */
  moveItem(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.renderOrder.length ||
      toIndex < 0 ||
      toIndex >= this.renderOrder.length
    ) {
      return;
    }

    const [item] = this.renderOrder.splice(fromIndex, 1);
    this.renderOrder.splice(toIndex, 0, item);
  }

  /**
   * Remove item da ordem
   */
  removeItem(index: number): void {
    if (index >= 0 && index < this.renderOrder.length) {
      this.renderOrder.splice(index, 1);
    }
  }

  /**
   * Adiciona item à ordem
   */
  addItem(item: RenderOrderItem, index?: number): void {
    if (index !== undefined && index >= 0 && index <= this.renderOrder.length) {
      this.renderOrder.splice(index, 0, item);
    } else {
      this.renderOrder.push(item);
    }
  }

  /**
   * Cria um grupo horizontal de módulos
   */
  static createHorizontalGroup(
    items: RenderOrderItem[],
    options?: {
      gap?: string;
      alignItems?: 'start' | 'center' | 'end' | 'stretch';
      justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
    }
  ): RenderNode {
    return {
      type: 'group',
      id: `horizontal-group-${Date.now()}`,
      direction: 'row',
      gap: options?.gap || '20px',
      alignItems: options?.alignItems || 'stretch',
      justifyContent: options?.justifyContent,
      children: items.map((item, i) => ({
        type: 'module',
        id: item.id || `${item.moduleId}-${i}`,
        moduleId: item.moduleId,
        submoduleId: item.submoduleId,
        flex: item.flex,
      })),
    };
  }
}
