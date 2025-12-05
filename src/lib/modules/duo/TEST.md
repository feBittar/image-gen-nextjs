# Testes do Módulo Duo

Este documento descreve os testes que devem ser executados para validar o módulo Duo.

## 1. Teste de Schema Validation

```typescript
import { duoModuleSchema, duoModuleDefaults } from '@/lib/modules/duo';

// ✅ Teste 1: Defaults válidos
test('defaults should be valid', () => {
  const result = duoModuleSchema.safeParse(duoModuleDefaults);
  expect(result.success).toBe(true);
});

// ✅ Teste 2: Enabled true
test('enabled true should be valid', () => {
  const data = { ...duoModuleDefaults, enabled: true };
  const result = duoModuleSchema.safeParse(data);
  expect(result.success).toBe(true);
});

// ✅ Teste 3: Offset limits
test('offsetX should be clamped to -500 to +500', () => {
  const data = { ...duoModuleDefaults, centerImageOffsetX: -600 };
  const result = duoModuleSchema.safeParse(data);
  expect(result.success).toBe(false);
});

// ✅ Teste 4: Scale limits
test('scale should be clamped to 50 to 200', () => {
  const data = { ...duoModuleDefaults, centerImageScale: 300 };
  const result = duoModuleSchema.safeParse(data);
  expect(result.success).toBe(false);
});

// ✅ Teste 5: Rotation limits
test('rotation should be clamped to -180 to +180', () => {
  const data = { ...duoModuleDefaults, centerImageRotation: 200 };
  const result = duoModuleSchema.safeParse(data);
  expect(result.success).toBe(false);
});

// ✅ Teste 6: Outline effect
test('outline effect should be optional', () => {
  const data = {
    ...duoModuleDefaults,
    outlineEffect: { enabled: true, color: '#FF0000', size: 20 },
  };
  const result = duoModuleSchema.safeParse(data);
  expect(result.success).toBe(true);
});
```

## 2. Teste de CSS Generation

```typescript
import { generateDuoCSS } from '@/lib/modules/duo';

// ✅ Teste 1: CSS básico
test('should generate basic CSS', () => {
  const config = { ...duoModuleDefaults, enabled: true };
  const css = generateDuoCSS(config);

  expect(css).toContain('body');
  expect(css).toContain('width: 2160px !important');
  expect(css).toContain('.duo-wrapper');
  expect(css).toContain('.duo-slide');
  expect(css).toContain('.duo-center-image');
});

// ✅ Teste 2: Transform properties
test('should include transform properties', () => {
  const config = {
    ...duoModuleDefaults,
    enabled: true,
    centerImageOffsetX: 50,
    centerImageOffsetY: -30,
    centerImageScale: 120,
    centerImageRotation: 15,
  };
  const css = generateDuoCSS(config);

  expect(css).toContain('translate(50px, -30px)');
  expect(css).toContain('scale(1.2)');
  expect(css).toContain('rotate(15deg)');
});

// ✅ Teste 3: Outline effect
test('should generate outline filter when enabled', () => {
  const config = {
    ...duoModuleDefaults,
    enabled: true,
    outlineEffect: { enabled: true, color: '#FF0000', size: 10 },
  };
  const css = generateDuoCSS(config);

  expect(css).toContain('drop-shadow');
  expect(css).toContain('#FF0000');
});

// ✅ Teste 4: No CSS when disabled
test('should return empty CSS when disabled', () => {
  const config = { ...duoModuleDefaults, enabled: false };
  const css = generateDuoCSS(config);

  expect(css).toBe('');
});
```

## 3. Teste de HTML Wrapping

```typescript
import { wrapTemplateWithDuo } from '@/lib/modules/duo';

// ✅ Teste 1: HTML wrapping
test('should wrap body content with duo structure', () => {
  const originalHTML = `
    <html>
      <head><title>Test</title></head>
      <body>
        <div class="content">Hello World</div>
      </body>
    </html>
  `;

  const config = {
    ...duoModuleDefaults,
    enabled: true,
    centerImageUrl: '/test.png',
  };

  const duoCSS = generateDuoCSS(config);
  const wrapped = wrapTemplateWithDuo(originalHTML, config, duoCSS);

  expect(wrapped).toContain('.duo-wrapper');
  expect(wrapped).toContain('.duo-slide-1');
  expect(wrapped).toContain('.duo-slide-2');
  expect(wrapped).toContain('<img class="duo-center-image"');
  expect(wrapped).toContain('src="/test.png"');
});

// ✅ Teste 2: Content duplication
test('should duplicate content in both slides', () => {
  const originalHTML = `
    <html>
      <body><div class="unique-content">Test</div></body>
    </html>
  `;

  const config = { ...duoModuleDefaults, enabled: true };
  const wrapped = wrapTemplateWithDuo(originalHTML, config, generateDuoCSS(config));

  const matches = wrapped.match(/class="unique-content"/g);
  expect(matches).toHaveLength(2); // Content should appear twice
});

// ✅ Teste 3: No center image when URL is empty
test('should not include center image when URL is empty', () => {
  const originalHTML = `<html><body>Test</body></html>`;
  const config = { ...duoModuleDefaults, enabled: true, centerImageUrl: '' };
  const wrapped = wrapTemplateWithDuo(originalHTML, config, generateDuoCSS(config));

  expect(wrapped).not.toContain('<img class="duo-center-image"');
});
```

## 4. Teste de Module Registration

```typescript
import { getModule, hasModule } from '@/lib/modules/registry';
import { duoModule } from '@/lib/modules/duo';

// ✅ Teste 1: Module registered
test('duo module should be registered', () => {
  expect(hasModule('duo')).toBe(true);
});

// ✅ Teste 2: Module definition
test('duo module should have correct definition', () => {
  const module = getModule('duo');

  expect(module).toBeDefined();
  expect(module?.id).toBe('duo');
  expect(module?.name).toBe('Duo Mode');
  expect(module?.category).toBe('special');
  expect(module?.zIndex).toBe(100);
});

// ✅ Teste 3: Module has all required methods
test('duo module should have all required methods', () => {
  expect(duoModule.getCss).toBeDefined();
  expect(duoModule.getHtml).toBeDefined();
  expect(duoModule.getStyleVariables).toBeDefined();
  expect(duoModule.modifyGeneration).toBeDefined();
});
```

## 5. Teste de Viewport Calculation

```typescript
import { composeTemplate } from '@/lib/modules/compositer';

// ✅ Teste 1: Normal viewport
test('viewport should be 1080x1440 without duo', () => {
  const moduleData = {
    viewport: { width: 1080, height: 1440 },
  };
  const composed = composeTemplate(['viewport'], moduleData);

  expect(composed.viewportWidth).toBe(1080);
  expect(composed.viewportHeight).toBe(1440);
});

// ✅ Teste 2: Duo viewport
test('viewport should be 2160x1440 with duo enabled', () => {
  const moduleData = {
    viewport: { width: 1080, height: 1440 },
    duo: { ...duoModuleDefaults, enabled: true },
  };
  const composed = composeTemplate(['viewport', 'duo'], moduleData);

  expect(composed.viewportWidth).toBe(2160);
  expect(composed.viewportHeight).toBe(1440);
});
```

## 6. Teste de CSS Variables

```typescript
import { duoModule } from '@/lib/modules/duo';

// ✅ Teste 1: Style variables
test('should generate correct style variables', () => {
  const data = {
    ...duoModuleDefaults,
    enabled: true,
    centerImageOffsetX: 100,
    centerImageOffsetY: -50,
    centerImageScale: 150,
    centerImageRotation: 45,
  };

  const vars = duoModule.getStyleVariables(data);

  expect(vars['--duo-offset-x']).toBe('100px');
  expect(vars['--duo-offset-y']).toBe('-50px');
  expect(vars['--duo-scale']).toBe('1.5');
  expect(vars['--duo-rotation']).toBe('45deg');
});

// ✅ Teste 2: Empty variables when disabled
test('should return empty variables when disabled', () => {
  const data = { ...duoModuleDefaults, enabled: false };
  const vars = duoModule.getStyleVariables(data);

  expect(Object.keys(vars)).toHaveLength(0);
});
```

## 7. Teste de Z-Index Hierarchy

```typescript
import { sortModulesByZIndex, getModules } from '@/lib/modules/registry';

// ✅ Teste 1: Duo should be on top
test('duo module should have highest z-index', () => {
  const modules = getModules(['viewport', 'textFields', 'corners', 'duo']);
  const sorted = sortModulesByZIndex(modules);

  const duoModule = sorted.find(m => m.id === 'duo');
  const cornersModule = sorted.find(m => m.id === 'corners');

  expect(duoModule?.zIndex).toBeGreaterThan(cornersModule?.zIndex || 0);
});
```

## 8. Teste de Integration com Compositer

```typescript
// ✅ Teste 1: Full composition
test('should compose template with duo module', () => {
  const moduleData = {
    viewport: { width: 1080, height: 1440 },
    textFields: {
      text1: 'Hello',
      text1Style: { fontSize: '100px' },
    },
    duo: {
      ...duoModuleDefaults,
      enabled: true,
      centerImageUrl: '/test.png',
    },
  };

  const composed = composeTemplate(
    ['viewport', 'textFields', 'duo'],
    moduleData
  );

  expect(composed.viewportWidth).toBe(2160);
  expect(composed.modulesCSS).toContain('.duo-wrapper');
  expect(composed.finalHtml).toContain('<!DOCTYPE html>');
});
```

## 9. Teste Manual no Browser

Execute os seguintes testes manuais:

### Teste 1: Ativar Duo Mode
1. Abrir editor de template
2. Ativar toggle "Duo Module"
3. ✅ Verificar que form fields aparecem
4. ✅ Verificar que viewport preview muda para 2160px

### Teste 2: Upload de Imagem Central
1. Inserir URL de imagem no campo "Center Image URL"
2. Gerar imagem
3. ✅ Verificar que 2 PNGs são gerados
4. ✅ Verificar que imagem central aparece no meio

### Teste 3: Ajustar Offset
1. Mover slider "Horizontal Offset" para +100
2. Mover slider "Vertical Offset" para -50
3. Gerar imagem
4. ✅ Verificar que imagem central está deslocada

### Teste 4: Ajustar Scale
1. Mover slider "Scale" para 150%
2. Gerar imagem
3. ✅ Verificar que imagem central está maior

### Teste 5: Ajustar Rotation
1. Mover slider "Rotation" para 45°
2. Gerar imagem
3. ✅ Verificar que imagem central está rotacionada

### Teste 6: Outline Effect
1. Ativar toggle "Outline Effect"
2. Escolher cor vermelha
3. Ajustar size para 15px
4. Gerar imagem
5. ✅ Verificar que outline vermelho aparece ao redor da imagem

### Teste 7: Mirror Content
1. Desativar "Mirror Content"
2. Modificar conteúdo do slide 1
3. Gerar imagem
4. ✅ Verificar que slides são diferentes

### Teste 8: Compatibilidade com Outros Módulos
1. Ativar Duo + TextFields + Corners + ContentImage
2. Gerar imagem
3. ✅ Verificar que todos os elementos aparecem corretamente
4. ✅ Verificar que corners estão duplicados em ambos os slides
5. ✅ Verificar que z-index está correto (imagem central no topo)

## 10. Teste de Performance

```bash
# Medir tempo de geração
time curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "viewport": { "width": 1080, "height": 1440 },
    "duo": {
      "enabled": true,
      "centerImageUrl": "/images/test.png"
    }
  }'

# ✅ Deve completar em < 5 segundos
# ✅ Deve retornar 2 URLs de imagem
```

## Critérios de Sucesso

- [ ] Todos os testes unitários passam
- [ ] Schema validation funciona corretamente
- [ ] CSS é gerado com propriedades corretas
- [ ] HTML wrapping duplica conteúdo
- [ ] Viewport é dobrado quando Duo está ativo
- [ ] 2 PNGs são gerados corretamente
- [ ] Imagem central aparece entre os slides
- [ ] Transformações (offset, scale, rotation) funcionam
- [ ] Outline effect funciona
- [ ] Z-index está correto (100, acima de tudo)
- [ ] Compatível com todos os outros módulos
- [ ] Performance aceitável (< 5s por geração)
- [ ] Form component renderiza corretamente
- [ ] React Hook Form integration funciona
