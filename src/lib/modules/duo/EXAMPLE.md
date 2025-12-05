# Exemplo de Uso do Módulo Duo

Este documento mostra exemplos práticos de como usar o módulo Duo com o sistema de composição modular.

## Exemplo 1: Uso Básico

```typescript
import { composeTemplate } from '@/lib/modules/compositer';
import { duoModule } from '@/lib/modules/duo';

// Configurar módulos ativos
const moduleData = {
  viewport: {
    width: 1080,
    height: 1440,
  },
  textFields: {
    text1: 'Hello World',
    text1Style: {
      fontSize: '120px',
      color: '#FFFFFF',
    },
  },
  duo: {
    enabled: true,
    centerImageUrl: '/images/person.png',
    centerImageOffsetX: 0,
    centerImageOffsetY: 0,
    centerImageScale: 100,
    centerImageRotation: 0,
    mirrorContent: true,
    outlineEffect: {
      enabled: false,
      color: '#000000',
      size: 10,
    },
  },
};

const enabledModules = ['viewport', 'textFields', 'duo'];

// Compor template
const composed = composeTemplate(moduleData, enabledModules);

console.log('Viewport:', composed.viewportWidth, 'x', composed.viewportHeight);
// Output: Viewport: 2160 x 1440

console.log('CSS includes duo styles:', composed.modulesCSS.includes('.duo-wrapper'));
// Output: true
```

## Exemplo 2: Com Outline Effect

```typescript
const moduleData = {
  viewport: { width: 1080, height: 1440 },
  textFields: {
    text1: 'COMPARISON',
    text1Style: { fontSize: '100px', color: '#000', fontWeight: '900' },
  },
  duo: {
    enabled: true,
    centerImageUrl: '/images/vs-icon.png',
    centerImageOffsetX: 0,
    centerImageOffsetY: -100,
    centerImageScale: 150,
    centerImageRotation: -10,
    mirrorContent: false,
    outlineEffect: {
      enabled: true,
      color: '#FF0000',
      size: 15,
    },
  },
};

// O outline será aplicado como múltiplos drop-shadows
```

## Exemplo 3: Integração com Image Generator

```typescript
// src/lib/services/imageGenerator.ts
import { composeTemplate, hasSpecialModule } from '@/lib/modules/compositer';
import { duoModule } from '@/lib/modules/duo';

async function generateImage(moduleData: Record<string, any>, enabledModules: string[]) {
  // 1. Compor template
  const composed = composeTemplate(moduleData, enabledModules);

  // 2. Criar HTML final
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${composed.modulesCSS}
        </style>
      </head>
      <body style="${composed.styleVariables}">
        ${composed.modulesHTML}
      </body>
    </html>
  `;

  // 3. Criar página Puppeteer
  const page = await browser.newPage();
  await page.setViewport({
    width: composed.viewportWidth,
    height: composed.viewportHeight,
    deviceScaleFactor: 2,
  });

  await page.setContent(html);

  // 4. Verificar se Duo está ativo
  if (hasSpecialModule(enabledModules, 'duo')) {
    // Usar modifyGeneration do Duo
    const result = await duoModule.modifyGeneration(page, {
      viewportWidth: composed.viewportWidth,
      viewportHeight: composed.viewportHeight,
      deviceScaleFactor: 2,
      outputDir: './public/output',
      filePrefix: 'template',
    });

    return {
      success: true,
      images: result.images,
      filePaths: result.filePaths,
    };
  } else {
    // Screenshot normal
    const buffer = await page.screenshot({ type: 'png' });
    return {
      success: true,
      images: [buffer],
      filePaths: ['./public/output/template.png'],
    };
  }
}
```

## Exemplo 4: Duo + Corners + ContentImage

```typescript
// Combinação de múltiplos módulos com Duo
const moduleData = {
  viewport: {
    width: 1080,
    height: 1440,
  },
  contentImage: {
    imageUrl: '/images/product.jpg',
    position: { top: 200, left: 100, width: 880, height: 600 },
  },
  corners: {
    corner1: {
      type: 'svg',
      svgUrl: '/logos/brand.svg',
      svgColor: '#FFFFFF',
      specialPosition: 'top-left',
      paddingX: 40,
      paddingY: 40,
    },
  },
  duo: {
    enabled: true,
    centerImageUrl: '/images/divider.png',
    centerImageOffsetX: 0,
    centerImageOffsetY: 0,
    centerImageScale: 80,
    centerImageRotation: 0,
    mirrorContent: true,
    outlineEffect: { enabled: false },
  },
};

const enabledModules = ['viewport', 'contentImage', 'corners', 'duo'];

// Resultado:
// - Viewport: 2160x1440
// - 2 slides com imagem de produto
// - Logo em cada canto superior esquerdo (duplicado)
// - Imagem divisória no centro
```

## Exemplo 5: React Hook Form Integration

```typescript
// Em um componente React
import { useForm } from 'react-hook-form';
import { DuoForm } from '@/lib/modules/duo';

function TemplateEditor() {
  const { watch, setValue, register } = useForm({
    defaultValues: {
      duo: {
        enabled: false,
        centerImageUrl: '',
        centerImageOffsetX: 0,
        centerImageOffsetY: 0,
        centerImageScale: 100,
        centerImageRotation: 0,
        mirrorContent: false,
        outlineEffect: {
          enabled: false,
          color: '#000000',
          size: 10,
        },
      },
    },
  });

  return (
    <div>
      <DuoForm
        watch={watch}
        setValue={setValue}
        register={register}
        fieldPrefix="duo"
      />
    </div>
  );
}
```

## Exemplo 6: Validação com Zod

```typescript
import { z } from 'zod';
import { duoModuleSchema } from '@/lib/modules/duo';

// Schema do formulário completo
const formSchema = z.object({
  viewport: z.object({ width: z.number(), height: z.number() }),
  textFields: z.object({ text1: z.string() }),
  duo: duoModuleSchema,
});

type FormData = z.infer<typeof formSchema>;

// Validar dados
const data: FormData = {
  viewport: { width: 1080, height: 1440 },
  textFields: { text1: 'Test' },
  duo: {
    enabled: true,
    centerImageUrl: '/images/test.png',
    centerImageOffsetX: 50,
    centerImageOffsetY: -20,
    centerImageScale: 110,
    centerImageRotation: 5,
    mirrorContent: false,
    outlineEffect: { enabled: true, color: '#FF0000', size: 12 },
  },
};

const validated = formSchema.parse(data); // Throws if invalid
```

## Exemplo 7: Dynamic Module Toggle

```typescript
import { useState } from 'react';

function TemplateEditor() {
  const [enabledModules, setEnabledModules] = useState(['viewport', 'textFields']);
  const [moduleData, setModuleData] = useState({
    viewport: { width: 1080, height: 1440 },
    textFields: { text1: 'Hello' },
    duo: duoModuleDefaults,
  });

  const toggleDuo = () => {
    if (enabledModules.includes('duo')) {
      // Desativar Duo
      setEnabledModules(enabledModules.filter(id => id !== 'duo'));
      setModuleData({
        ...moduleData,
        duo: { ...moduleData.duo, enabled: false },
      });
    } else {
      // Ativar Duo
      setEnabledModules([...enabledModules, 'duo']);
      setModuleData({
        ...moduleData,
        duo: { ...moduleData.duo, enabled: true },
      });
    }
  };

  return (
    <button onClick={toggleDuo}>
      {enabledModules.includes('duo') ? 'Disable' : 'Enable'} Duo Mode
    </button>
  );
}
```

## Exemplo 8: Custom Viewport Adjustment

```typescript
// O módulo Duo automaticamente ajusta o viewport para 2160px
import { composeTemplate } from '@/lib/modules/compositer';

const moduleData = {
  viewport: { width: 1080, height: 1440 },
  duo: { enabled: true, centerImageUrl: '/images/test.png' },
};

const composed = composeTemplate(moduleData, ['viewport', 'duo']);

console.log(composed.viewportWidth); // 2160 (dobrado automaticamente)
console.log(composed.viewportHeight); // 1440 (mantém)
```

## Exemplo 9: Error Handling

```typescript
try {
  const result = await generateImage(moduleData, enabledModules);

  if (hasSpecialModule(enabledModules, 'duo')) {
    console.log('Generated 2 slides:');
    console.log('Slide 1:', result.filePaths[0]);
    console.log('Slide 2:', result.filePaths[1]);
  } else {
    console.log('Generated 1 image:', result.filePaths[0]);
  }
} catch (error) {
  console.error('Generation failed:', error.message);

  // Check if it's a Duo-specific error
  if (error.message.includes('clip')) {
    console.error('Duo screenshot clipping failed');
  }
}
```

## Exemplo 10: Preset com Duo

```typescript
// Criar um preset de template com Duo ativado
const versusDuoPreset: TemplatePreset = {
  id: 'versus-duo',
  name: 'Versus Duo',
  description: 'Comparison template with 2 slides',
  thumbnail: '/presets/versus-duo.png',
  defaultModules: ['viewport', 'textFields', 'contentImage', 'corners', 'duo'],
  moduleDefaults: {
    viewport: { width: 1080, height: 1440 },
    textFields: {
      text1: 'VERSUS',
      text1Style: { fontSize: '120px', fontWeight: '900', color: '#000' },
    },
    duo: {
      enabled: true,
      centerImageUrl: '/images/vs-icon.png',
      centerImageScale: 120,
      outlineEffect: { enabled: true, color: '#FF0000', size: 10 },
    },
  },
};
```

## Notas Importantes

1. **Viewport**: Quando `duo.enabled = true`, o viewport é automaticamente dobrado para 2160px
2. **Z-Index**: O módulo Duo tem z-index 100, acima de tudo incluindo corners (99)
3. **Screenshots**: `modifyGeneration` retorna 2 buffers e 2 file paths
4. **CSS Variables**: Use `--duo-offset-x`, `--duo-offset-y`, `--duo-scale`, `--duo-rotation`
5. **Wrapping**: Todo conteúdo é automaticamente wrapped em `.duo-slide` divs
6. **Conflicts**: Não há conflitos - Duo pode trabalhar com qualquer módulo
7. **Dependencies**: Duo não tem dependências obrigatórias
