# Layout Manager Design - Sistema de Controle Macro de Composição

## 1. Análise da Situação Atual

### Limitações Identificadas

**Ordem Fixa de Renderização:**
```typescript
// compositer.ts - ATUAL
const CONTENT_MODULES = ['textFields', 'contentImage', 'bullets', 'openLoop'];

// Sempre renderiza nesta ordem fixa:
// 1. textFields
// 2. contentImage
// 3. bullets
// 4. openLoop
```

**Z-Index Estático:**
```typescript
// Cada módulo tem z-index fixo definido no ModuleDefinition
viewport: z-index 0
card: z-index 1
textFields: z-index 10
contentImage: z-index 5
bullets: z-index 10
corners: z-index 99
```

**Falta de Flexibilidade Espacial:**
- Não é possível colocar imagem entre text1 e text2
- Não é possível reordenar bullets antes de textFields
- Não é possível controlar layers dinamicamente

---

## 2. Visão da Solução

### Conceito: Layout Manager

Um sistema de controle macro que permite ao usuário definir:

1. **Composition Order** - Ordem de renderização dos módulos
2. **Layer System** - Controle dinâmico de z-index
3. **Spatial Relationships** - Posicionamento relativo entre elementos

### Arquitetura Proposta

```
┌──────────────────────────────────────────────────┐
│  Layout Manager (Nova Camada)                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │ Composition    │  │ Layer Controller       │ │
│  │ Order Engine   │  │ (Z-Index Override)     │ │
│  └────────────────┘  └────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Spatial Rules Engine                       │ │
│  │ (Positioning Logic)                        │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
           ↓ Passa instruções para
┌──────────────────────────────────────────────────┐
│  Compositer (Modificado)                         │
│  - Usa ordem do Layout Manager                   │
│  - Aplica z-index overrides                      │
│  - Implementa spatial rules                      │
└──────────────────────────────────────────────────┘
```

---

## 3. Design Detalhado

### 3.1 Composition Order System

**Objetivo:** Permitir ordenação customizada dos módulos de conteúdo.

#### Estrutura de Dados

```typescript
interface CompositionConfig {
  // Ordem de renderização dos módulos
  renderOrder: RenderOrderItem[];

  // Overrides de z-index
  zIndexOverrides?: Record<string, number>;

  // Regras de posicionamento
  spatialRules?: SpatialRule[];

  // Layout preset (futuro)
  layoutPreset?: 'stack' | 'sandwich' | 'grid' | 'custom';
}

interface RenderOrderItem {
  moduleId: string;

  // Opções de posicionamento
  position?: {
    type: 'flex' | 'absolute';
    flexGrow?: number;
    flexShrink?: number;
    absoluteCoords?: { top?: string; left?: string; right?: string; bottom?: string };
  };

  // Controle de visibilidade condicional
  conditional?: {
    showIf?: string;  // Ex: "hasImage" ou "bulletCount > 0"
  };
}

interface SpatialRule {
  type: 'before' | 'after' | 'between' | 'wrap';
  target: string;      // Module ID alvo
  reference?: string;  // Module ID de referência (para 'between')
  reference2?: string; // Segundo módulo (para 'between')
}
```

#### Exemplo de Uso

```typescript
// Caso 1: Imagem ENTRE text1 e text2
const composition: CompositionConfig = {
  renderOrder: [
    { moduleId: 'textFields', submodule: 'field1' },  // Text 1
    { moduleId: 'contentImage' },                      // Imagem
    { moduleId: 'textFields', submodule: 'field2' },  // Text 2
    { moduleId: 'textFields', submodule: 'field3' },  // Text 3
  ]
};

// Caso 2: Bullets ANTES de textFields
const composition: CompositionConfig = {
  renderOrder: [
    { moduleId: 'bullets' },
    { moduleId: 'textFields' },
    { moduleId: 'contentImage' },
  ]
};

// Caso 3: Controle de z-index customizado
const composition: CompositionConfig = {
  renderOrder: [
    { moduleId: 'textFields' },
    { moduleId: 'contentImage' },
  ],
  zIndexOverrides: {
    'contentImage': 50,  // Normalmente é 5, agora fica acima de tudo
    'textFields': 10,
    'corners': 5,        // Inverte ordem com imagem
  }
};
```

---

### 3.2 Layer Controller System

**Objetivo:** Controle visual de z-index com interface intuitiva.

#### UI Concept

```
┌─────────────────────────────────────────────┐
│  Layer Manager                              │
├─────────────────────────────────────────────┤
│                                             │
│  Drag to reorder layers ↕                   │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 🔼 Corners           [z: 99] [👁]    │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🔼 Content Image     [z: 50] [👁]    │ │ ← Override aplicado
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🔼 Text Fields       [z: 10] [👁]    │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🔼 Card              [z: 1]  [👁]    │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🔼 Viewport          [z: 0]  [👁]    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Reset to Defaults]  [Auto-Calculate]      │
└─────────────────────────────────────────────┘
```

#### Implementação

```typescript
interface LayerConfig {
  moduleId: string;
  zIndex: number;
  visible: boolean;
  locked?: boolean;  // Previne reordenação
}

class LayerController {
  private layers: LayerConfig[];

  // Reordena layers via drag & drop
  reorderLayers(fromIndex: number, toIndex: number): void {
    // Move layer e recalcula z-index automaticamente
    const movedLayer = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, movedLayer);
    this.autoCalculateZIndex();
  }

  // Calcula z-index baseado na ordem visual
  autoCalculateZIndex(): void {
    this.layers.forEach((layer, index) => {
      layer.zIndex = index * 10;  // 0, 10, 20, 30...
    });
  }

  // Override manual de z-index
  setZIndex(moduleId: string, zIndex: number): void {
    const layer = this.layers.find(l => l.moduleId === moduleId);
    if (layer) layer.zIndex = zIndex;
  }

  // Obtém z-index final para um módulo
  getZIndex(moduleId: string): number {
    const layer = this.layers.find(l => l.moduleId === moduleId);
    return layer?.zIndex ?? this.getDefaultZIndex(moduleId);
  }
}
```

---

### 3.3 Composition Order Engine

**Objetivo:** Gerenciar a ordem de renderização dos módulos no card container.

#### Conceito: Render Tree

```typescript
interface RenderNode {
  type: 'module' | 'group' | 'spacer';
  moduleId?: string;
  submoduleId?: string;  // Ex: 'textFields.field1'
  children?: RenderNode[];

  // Flex layout options
  flex?: {
    grow?: number;
    shrink?: number;
    basis?: string;
  };

  // Spacing
  marginTop?: string;
  marginBottom?: string;
  gap?: string;
}

// Exemplo: Text → Image → Text
const renderTree: RenderNode = {
  type: 'group',
  children: [
    {
      type: 'module',
      moduleId: 'textFields',
      submoduleId: 'field1',
      flex: { grow: 0, shrink: 0 }
    },
    {
      type: 'spacer',
      marginTop: '40px',
      marginBottom: '40px'
    },
    {
      type: 'module',
      moduleId: 'contentImage',
      flex: { grow: 1, shrink: 1 }
    },
    {
      type: 'spacer',
      marginTop: '40px',
      marginBottom: '40px'
    },
    {
      type: 'module',
      moduleId: 'textFields',
      submoduleId: 'field2',
      flex: { grow: 0, shrink: 0 }
    }
  ]
};
```

#### Engine Implementation

```typescript
class CompositionOrderEngine {
  private renderTree: RenderNode;

  // Constrói HTML baseado na render tree
  generateHTML(context: RenderContext): string {
    return this.renderNode(this.renderTree, context);
  }

  private renderNode(node: RenderNode, context: RenderContext): string {
    switch (node.type) {
      case 'module':
        return this.renderModule(node, context);

      case 'group':
        return this.renderGroup(node, context);

      case 'spacer':
        return `<div class="spacer" style="margin-top: ${node.marginTop}; margin-bottom: ${node.marginBottom};"></div>`;

      default:
        return '';
    }
  }

  private renderModule(node: RenderNode, context: RenderContext): string {
    const module = getModule(node.moduleId);
    const moduleData = context.allModulesData[node.moduleId];

    // Se é um submódulo (ex: textFields.field1)
    if (node.submoduleId) {
      return this.renderSubmodule(module, moduleData, node.submoduleId, context);
    }

    // Renderização normal
    const html = module.getHtml(moduleData, context);

    // Aplica flex options
    if (node.flex) {
      return `<div style="flex: ${node.flex.grow} ${node.flex.shrink} ${node.flex.basis ?? 'auto'};">${html}</div>`;
    }

    return html;
  }

  private renderGroup(node: RenderNode, context: RenderContext): string {
    const childrenHtml = node.children
      ?.map(child => this.renderNode(child, context))
      .join('\n') ?? '';

    return `<div class="composition-group" style="display: flex; flex-direction: column; gap: ${node.gap ?? '0'};">${childrenHtml}</div>`;
  }
}
```

---

### 3.4 Spatial Rules System

**Objetivo:** Definir regras de posicionamento relativo entre módulos.

#### Tipos de Regras

```typescript
// 1. BEFORE - Coloca módulo antes de outro
{
  type: 'before',
  target: 'contentImage',
  reference: 'textFields'
}
// Resultado: textFields → contentImage

// 2. AFTER - Coloca módulo depois de outro
{
  type: 'after',
  target: 'bullets',
  reference: 'contentImage'
}
// Resultado: contentImage → bullets

// 3. BETWEEN - Coloca módulo entre dois outros
{
  type: 'between',
  target: 'contentImage',
  reference: 'textFields.field1',
  reference2: 'textFields.field2'
}
// Resultado: field1 → contentImage → field2

// 4. WRAP - Envolve módulo com outro
{
  type: 'wrap',
  target: 'bullets',
  wrapper: {
    tag: 'div',
    className: 'bullets-wrapper',
    style: 'background: #f0f0f0; padding: 40px;'
  }
}
// Resultado: <div class="bullets-wrapper">...</div>
```

#### Engine Implementation

```typescript
class SpatialRulesEngine {
  applyRules(
    renderOrder: RenderOrderItem[],
    rules: SpatialRule[]
  ): RenderOrderItem[] {
    let order = [...renderOrder];

    for (const rule of rules) {
      order = this.applyRule(order, rule);
    }

    return order;
  }

  private applyRule(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): RenderOrderItem[] {
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
        return order;
    }
  }

  private applyBefore(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): RenderOrderItem[] {
    // Remove target da posição atual
    const targetIndex = order.findIndex(item => item.moduleId === rule.target);
    if (targetIndex === -1) return order;

    const [target] = order.splice(targetIndex, 1);

    // Insere antes do reference
    const refIndex = order.findIndex(item => item.moduleId === rule.reference);
    if (refIndex === -1) {
      order.push(target);  // Se reference não existe, adiciona no final
    } else {
      order.splice(refIndex, 0, target);
    }

    return order;
  }

  private applyBetween(
    order: RenderOrderItem[],
    rule: SpatialRule
  ): RenderOrderItem[] {
    // Remove target
    const targetIndex = order.findIndex(item => item.moduleId === rule.target);
    if (targetIndex === -1) return order;

    const [target] = order.splice(targetIndex, 1);

    // Encontra posições dos references
    const ref1Index = order.findIndex(item => item.moduleId === rule.reference);
    const ref2Index = order.findIndex(item => item.moduleId === rule.reference2);

    if (ref1Index === -1 || ref2Index === -1) {
      order.push(target);
      return order;
    }

    // Insere entre os dois
    const insertIndex = Math.max(ref1Index, ref2Index);
    order.splice(insertIndex, 0, target);

    return order;
  }
}
```

---

## 4. Integração com Sistema Existente

### 4.1 Modificações no ModularStore

```typescript
// Adicionar ao modularStore.ts
interface ModularState {
  // ... campos existentes ...

  // NOVO: Configuração de layout
  compositionConfig: CompositionConfig | null;

  // NOVO: Layer overrides
  layerOverrides: Record<string, number>;
}

interface ModularActions {
  // ... ações existentes ...

  // NOVAS AÇÕES
  setCompositionOrder: (order: RenderOrderItem[]) => void;
  setLayerOverride: (moduleId: string, zIndex: number) => void;
  resetLayerOverrides: () => void;
  applySpatialRule: (rule: SpatialRule) => void;
  setLayoutPreset: (preset: 'stack' | 'sandwich' | 'grid') => void;
}
```

### 4.2 Modificações no Compositer

```typescript
// compositer.ts - MODIFICADO
export function composeTemplate(
  enabledModuleIds: string[],
  formData: Record<string, ModuleData>,
  options: ComposeOptions = {}
): ComposedTemplate {
  // ... código existente ...

  // NOVO: Usar composition config se disponível
  const compositionConfig = options.compositionConfig;

  // Se há config customizada, usa engine personalizada
  if (compositionConfig) {
    return composeWithCustomOrder(
      enabledModuleIds,
      formData,
      compositionConfig,
      options
    );
  }

  // Caso contrário, usa lógica padrão (backward compatibility)
  return composeWithDefaultOrder(enabledModuleIds, formData, options);
}

// NOVA FUNÇÃO
function composeWithCustomOrder(
  enabledModuleIds: string[],
  formData: Record<string, ModuleData>,
  config: CompositionConfig,
  options: ComposeOptions
): ComposedTemplate {
  const context = createRenderContext(
    enabledModuleIds,
    formData,
    options.baseUrl
  );

  // 1. Aplica spatial rules
  const spatialEngine = new SpatialRulesEngine();
  const finalOrder = spatialEngine.applyRules(
    config.renderOrder,
    config.spatialRules ?? []
  );

  // 2. Usa composition order engine
  const orderEngine = new CompositionOrderEngine(finalOrder);
  const modulesHTML = orderEngine.generateHTML(context);

  // 3. Aplica layer overrides
  const layerController = new LayerController(config.zIndexOverrides ?? {});
  const modulesCSS = collectCSSWithOverrides(
    enabledModuleIds,
    formData,
    context,
    layerController
  );

  // 4. Gera HTML final
  const finalHtml = generateFinalHtml(modulesCSS, modulesHTML, context);

  return {
    viewportWidth: context.viewportWidth,
    viewportHeight: context.viewportHeight,
    modulesCSS,
    modulesHTML,
    styleVariables: collectStyleVariables(enabledModuleIds, formData),
    finalHtml
  };
}
```

### 4.3 Nova Interface de UI

```typescript
// Novo componente: LayoutManager.tsx
export function LayoutManager() {
  const { compositionConfig, setCompositionOrder } = useModularStore();

  return (
    <div className="layout-manager">
      {/* Header */}
      <div className="layout-header">
        <h3>Layout Manager</h3>
        <Button onClick={resetToDefault}>Reset</Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="order">
        <TabsList>
          <TabsTrigger value="order">Order</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* Composition Order Tab */}
        <TabsContent value="order">
          <CompositionOrderEditor
            order={compositionConfig?.renderOrder ?? []}
            onChange={setCompositionOrder}
          />
        </TabsContent>

        {/* Layers Tab */}
        <TabsContent value="layers">
          <LayerController
            overrides={compositionConfig?.zIndexOverrides ?? {}}
          />
        </TabsContent>

        {/* Spatial Rules Tab */}
        <TabsContent value="rules">
          <SpatialRulesEditor
            rules={compositionConfig?.spatialRules ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 5. Layout Presets

### Conceito: Templates de Layout Pré-definidos

```typescript
const LAYOUT_PRESETS = {
  // Layout padrão atual
  stack: {
    description: 'Vertical stack: Text → Image → Text',
    renderOrder: [
      { moduleId: 'textFields', submodule: 'fields.0-2' },
      { moduleId: 'contentImage' },
      { moduleId: 'textFields', submodule: 'fields.3-4' }
    ]
  },

  // Imagem no topo
  'image-first': {
    description: 'Image on top, then text',
    renderOrder: [
      { moduleId: 'contentImage', flex: { grow: 1, shrink: 1 } },
      { moduleId: 'textFields' }
    ]
  },

  // Imagem no fundo
  'image-last': {
    description: 'Text on top, image at bottom',
    renderOrder: [
      { moduleId: 'textFields' },
      { moduleId: 'contentImage', flex: { grow: 1, shrink: 1 } }
    ]
  },

  // Sanduíche
  sandwich: {
    description: 'Text → Image → Text (sandwich)',
    renderOrder: [
      { moduleId: 'textFields', submodule: 'field1' },
      { moduleId: 'contentImage', flex: { grow: 1, shrink: 1 } },
      { moduleId: 'textFields', submodule: 'field2-4' }
    ]
  },

  // Grid bullets
  'bullets-grid': {
    description: 'Header + Bullet grid + Footer',
    renderOrder: [
      { moduleId: 'textFields', submodule: 'field1' },
      { moduleId: 'bullets' },
      { moduleId: 'textFields', submodule: 'field2' }
    ]
  },

  // Floating
  floating: {
    description: 'Image floating, text absolute positioned',
    renderOrder: [
      { moduleId: 'contentImage' },
      { moduleId: 'textFields', position: { type: 'absolute', absoluteCoords: { top: '60px', left: '60px' } } }
    ],
    zIndexOverrides: {
      'textFields': 50,
      'contentImage': 5
    }
  }
};
```

---

## 6. Casos de Uso Resolvidos

### Caso 1: Imagem entre textos

**Problema:** Não é possível colocar imagem entre text1 e text2.

**Solução:**
```typescript
const config: CompositionConfig = {
  renderOrder: [
    { moduleId: 'textFields', submodule: 'field1' },  // Título
    { moduleId: 'contentImage' },                      // Imagem
    { moduleId: 'textFields', submodule: 'field2' },  // Descrição
    { moduleId: 'textFields', submodule: 'field3' }   // CTA
  ]
};
```

### Caso 2: Bullets antes de texto

**Problema:** Quero mostrar bullets primeiro, depois texto.

**Solução:**
```typescript
const config: CompositionConfig = {
  renderOrder: [
    { moduleId: 'bullets' },
    { moduleId: 'textFields' }
  ]
};
```

### Caso 3: Controlar z-index de overlay

**Problema:** Quero que contentImage fique acima de corners.

**Solução:**
```typescript
const config: CompositionConfig = {
  zIndexOverrides: {
    'contentImage': 100,  // Acima de tudo
    'corners': 50         // Abaixo da imagem
  }
};
```

### Caso 4: Layout sanduíche com espaçamento

**Problema:** Quero text1 → espaço → imagem → espaço → text2.

**Solução:**
```typescript
const renderTree: RenderNode = {
  type: 'group',
  gap: '40px',
  children: [
    { type: 'module', moduleId: 'textFields', submodule: 'field1' },
    { type: 'module', moduleId: 'contentImage', flex: { grow: 1 } },
    { type: 'module', moduleId: 'textFields', submodule: 'field2' }
  ]
};
```

---

## 7. Roadmap de Implementação

### Fase 1: Foundation (MVP)
- [ ] Criar tipos TypeScript (CompositionConfig, RenderOrderItem, etc)
- [ ] Implementar CompositionOrderEngine básica
- [ ] Modificar compositer.ts para suportar custom order
- [ ] Adicionar compositionConfig ao modularStore

### Fase 2: UI Básica
- [ ] Criar componente LayoutManager
- [ ] Implementar CompositionOrderEditor (drag & drop simples)
- [ ] Adicionar botões de preset (stack, sandwich, image-first)
- [ ] Integrar com page.tsx

### Fase 3: Layer System
- [ ] Implementar LayerController
- [ ] Criar UI de layers (visual z-index editor)
- [ ] Adicionar drag & drop para reordenar layers
- [ ] Aplicar overrides no compositer

### Fase 4: Advanced Features
- [ ] Implementar SpatialRulesEngine
- [ ] Criar editor de spatial rules (UI)
- [ ] Suporte a submódulos (textFields.field1)
- [ ] Preview em tempo real

### Fase 5: Polish
- [ ] Animações de transição
- [ ] Undo/Redo para mudanças de layout
- [ ] Export/Import de composition configs
- [ ] Documentação e exemplos

---

## 8. Considerações Técnicas

### Performance
- Renderização condicional: só renderiza módulos ativos
- Memoização de HTML/CSS gerados
- Virtual scroll para lista de layers (se muitos módulos)

### Backward Compatibility
- Compositer mantém lógica padrão se `compositionConfig` não fornecido
- Presets existentes continuam funcionando
- Migration automática: gerar compositionConfig a partir de preset antigo

### Validação
- Validar que todos moduleIds em renderOrder estão enabled
- Prevenir ordem circular em spatial rules
- Alertar sobre conflitos de z-index

### Edge Cases
- Módulo Duo: viewport width dobra, mas order permanece
- Card desativado: modules renderizam direto no body
- Submódulos: verificar se campo existe antes de renderizar

---

## 9. Alternativas Consideradas

### Opção A: CSS Grid System
**Pros:** Flexível, nativo, bem suportado
**Cons:** Menos controle sobre ordem de renderização, complexo para casos dinâmicos

### Opção B: Absolute Positioning Universal
**Pros:** Controle total sobre posição
**Cons:** Difícil de usar, não responsivo, quebra facilmente

### Opção C: Layout Manager (Escolhido)
**Pros:** Balance entre flexibilidade e usabilidade, extensível, compatível com sistema atual
**Cons:** Adiciona complexidade, requer UI dedicada

---

## 10. Próximos Passos

1. **Validar conceito** com protótipo simples
2. **Implementar MVP** (Fase 1 + Fase 2)
3. **Testar com usuários** (você!)
4. **Iterar** baseado em feedback
5. **Expandir** com features avançadas

---

## Conclusão

O **Layout Manager** adiciona uma camada de controle macro à arquitetura modular existente, permitindo:
- ✅ Controle de ordem de renderização
- ✅ Sistema de layers com z-index dinâmico
- ✅ Regras de posicionamento espacial
- ✅ Presets de layout para produtividade
- ✅ Backward compatibility com sistema atual

A implementação é progressiva e não quebra funcionalidade existente.
