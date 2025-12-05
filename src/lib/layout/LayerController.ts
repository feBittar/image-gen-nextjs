/**
 * Layer Controller
 *
 * Gerencia z-index e camadas de renderização dos módulos.
 */

import { getModule } from '../modules/registry';
import type { LayerConfig } from './types';

export class LayerController {
  private layers: LayerConfig[];
  private overrides: Record<string, number>;

  constructor(overrides: Record<string, number> = {}) {
    this.overrides = overrides;
    this.layers = [];
  }

  /**
   * Inicializa layers a partir dos módulos habilitados
   */
  initializeLayers(enabledModules: string[]): void {
    this.layers = enabledModules.map((moduleId) => {
      const module = getModule(moduleId);
      const defaultZIndex = module?.zIndex ?? 0;
      const overrideZIndex = this.overrides[moduleId];

      return {
        moduleId,
        zIndex: overrideZIndex !== undefined ? overrideZIndex : defaultZIndex,
        visible: true,
        locked: false,
        displayName: module?.name || moduleId,
      };
    });

    // Ordena por z-index (menor para maior)
    this.sortLayers();
  }

  /**
   * Ordena layers por z-index
   */
  private sortLayers(): void {
    this.layers.sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Obtém z-index de um módulo
   */
  getZIndex(moduleId: string): number {
    // Primeiro verifica override
    if (this.overrides[moduleId] !== undefined) {
      return this.overrides[moduleId];
    }

    // Depois verifica layer config
    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (layer) {
      return layer.zIndex;
    }

    // Fallback para z-index padrão do módulo
    const module = getModule(moduleId);
    return module?.zIndex ?? 0;
  }

  /**
   * Define z-index de um módulo
   */
  setZIndex(moduleId: string, zIndex: number): void {
    this.overrides[moduleId] = zIndex;

    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (layer) {
      layer.zIndex = zIndex;
      this.sortLayers();
    }
  }

  /**
   * Remove override de z-index
   */
  removeOverride(moduleId: string): void {
    delete this.overrides[moduleId];

    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (layer) {
      const module = getModule(moduleId);
      layer.zIndex = module?.zIndex ?? 0;
      this.sortLayers();
    }
  }

  /**
   * Reseta todos os overrides
   */
  resetOverrides(): void {
    this.overrides = {};
    this.layers.forEach((layer) => {
      const module = getModule(layer.moduleId);
      layer.zIndex = module?.zIndex ?? 0;
    });
    this.sortLayers();
  }

  /**
   * Reordena layers via drag & drop
   */
  reorderLayers(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.layers.length ||
      toIndex < 0 ||
      toIndex >= this.layers.length
    ) {
      return;
    }

    // Verifica se layer está travado
    if (this.layers[fromIndex].locked) {
      console.warn(`Layer ${this.layers[fromIndex].moduleId} is locked`);
      return;
    }

    // Move layer
    const [movedLayer] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, movedLayer);

    // Recalcula z-index automaticamente
    this.autoCalculateZIndex();
  }

  /**
   * Calcula z-index automaticamente baseado na ordem visual
   */
  autoCalculateZIndex(): void {
    this.layers.forEach((layer, index) => {
      const newZIndex = index * 10; // 0, 10, 20, 30...
      layer.zIndex = newZIndex;
      this.overrides[layer.moduleId] = newZIndex;
    });
  }

  /**
   * Define visibilidade de um layer
   */
  setVisibility(moduleId: string, visible: boolean): void {
    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (layer) {
      layer.visible = visible;
    }
  }

  /**
   * Trava/destrava um layer
   */
  setLocked(moduleId: string, locked: boolean): void {
    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (layer) {
      layer.locked = locked;
    }
  }

  /**
   * Obtém todos os layers
   */
  getLayers(): LayerConfig[] {
    return [...this.layers];
  }

  /**
   * Obtém layers ordenados por z-index (maior para menor - ordem visual)
   */
  getLayersVisualOrder(): LayerConfig[] {
    return [...this.layers].reverse();
  }

  /**
   * Obtém um layer específico
   */
  getLayer(moduleId: string): LayerConfig | undefined {
    return this.layers.find((l) => l.moduleId === moduleId);
  }

  /**
   * Obtém todos os overrides
   */
  getOverrides(): Record<string, number> {
    return { ...this.overrides };
  }

  /**
   * Define múltiplos overrides
   */
  setOverrides(overrides: Record<string, number>): void {
    this.overrides = { ...overrides };
    this.layers.forEach((layer) => {
      if (overrides[layer.moduleId] !== undefined) {
        layer.zIndex = overrides[layer.moduleId];
      }
    });
    this.sortLayers();
  }

  /**
   * Aplica z-index ao CSS de um módulo
   */
  applyCSSOverride(moduleId: string, css: string): string {
    const zIndex = this.getZIndex(moduleId);
    const module = getModule(moduleId);
    const defaultZIndex = module?.zIndex ?? 0;

    // Se não há override, retorna CSS original
    if (zIndex === defaultZIndex) {
      return css;
    }

    // Adiciona ou substitui z-index no CSS
    // Procura por padrões de z-index existentes e substitui
    const zIndexPattern = /z-index:\s*\d+/gi;

    if (zIndexPattern.test(css)) {
      // Substitui z-index existente
      return css.replace(zIndexPattern, `z-index: ${zIndex}`);
    } else {
      // Adiciona z-index em classes/seletores principais
      // Implementação simplificada: adiciona no início
      return `/* Z-Index Override for ${moduleId} */\n.${moduleId}-container,\n.${moduleId} {\n  z-index: ${zIndex} !important;\n}\n\n${css}`;
    }
  }

  /**
   * Verifica se um módulo tem override
   */
  hasOverride(moduleId: string): boolean {
    return this.overrides[moduleId] !== undefined;
  }

  /**
   * Obtém z-index padrão de um módulo
   */
  getDefaultZIndex(moduleId: string): number {
    const module = getModule(moduleId);
    return module?.zIndex ?? 0;
  }

  /**
   * Calcula próximo z-index disponível
   */
  getNextAvailableZIndex(): number {
    if (this.layers.length === 0) return 10;

    const maxZIndex = Math.max(...this.layers.map((l) => l.zIndex));
    return maxZIndex + 10;
  }

  /**
   * Move layer para o topo
   */
  moveToTop(moduleId: string): void {
    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (!layer || layer.locked) return;

    const nextZIndex = this.getNextAvailableZIndex();
    this.setZIndex(moduleId, nextZIndex);
  }

  /**
   * Move layer para o fundo
   */
  moveToBottom(moduleId: string): void {
    const layer = this.layers.find((l) => l.moduleId === moduleId);
    if (!layer || layer.locked) return;

    const minZIndex = Math.min(...this.layers.map((l) => l.zIndex));
    this.setZIndex(moduleId, minZIndex - 10);
  }

  /**
   * Move layer uma posição acima
   */
  moveUp(moduleId: string): void {
    const currentIndex = this.layers.findIndex((l) => l.moduleId === moduleId);
    if (currentIndex === -1 || currentIndex === this.layers.length - 1) return;

    this.reorderLayers(currentIndex, currentIndex + 1);
  }

  /**
   * Move layer uma posição abaixo
   */
  moveDown(moduleId: string): void {
    const currentIndex = this.layers.findIndex((l) => l.moduleId === moduleId);
    if (currentIndex === -1 || currentIndex === 0) return;

    this.reorderLayers(currentIndex, currentIndex - 1);
  }

  /**
   * Exporta configuração de layers
   */
  export(): {
    layers: LayerConfig[];
    overrides: Record<string, number>;
  } {
    return {
      layers: this.getLayers(),
      overrides: this.getOverrides(),
    };
  }

  /**
   * Importa configuração de layers
   */
  import(config: {
    layers?: LayerConfig[];
    overrides?: Record<string, number>;
  }): void {
    if (config.layers) {
      this.layers = config.layers.map((l) => ({ ...l }));
      this.sortLayers();
    }

    if (config.overrides) {
      this.setOverrides(config.overrides);
    }
  }
}
