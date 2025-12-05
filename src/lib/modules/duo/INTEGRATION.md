# Integração do Módulo Duo

Este documento explica como integrar o módulo Duo no sistema de geração de imagens.

## 1. Adicionar ao Template Schema

Adicione o módulo Duo ao schema do template:

```typescript
// src/lib/schemas/stackTemplate.ts
import { z } from 'zod';
import { duoModuleSchema } from '@/lib/modules/duo';

export const stackTemplateSchema = z.object({
  template: z.literal('stack'),

  // Campos existentes do template
  backgroundColor: z.string().default('#FFFFFF'),
  text1: z.string().optional(),
  // ... outros campos

  // ADICIONAR: Módulo Duo
  duo: duoModuleSchema.optional(),
});

export type StackTemplateFormData = z.infer<typeof stackTemplateSchema>;
```

## 2. Adicionar ao Form Builder

Adicione o componente `DuoForm` ao formulário:

```typescript
// src/components/editor/StackFormFields.tsx
import { DuoForm } from '@/lib/modules/duo';

export function StackFormFields() {
  const { formData, updateField } = useEditorStore();

  return (
    <div className="space-y-6">
      {/* Campos existentes do template */}
      <BackgroundColorField />
      <TextField1 />
      {/* ... */}

      {/* ADICIONAR: Duo Module Section */}
      <DuoForm
        config={formData.duo || duoModuleDefaults}
        onChange={(duo) => updateField('duo', duo)}
      />
    </div>
  );
}
```

## 3. Modificar Image Generator

Integre o módulo no `imageGenerator.ts`:

```typescript
// src/lib/services/imageGenerator.ts
import { duoModule } from '@/lib/modules/duo';

export async function generateImage(data: any) {
  // ... código existente ...

  // 1. Processar HTML do template normalmente
  let html = await processTemplate(templatePath, data);

  // ADICIONAR: Aplicar módulo Duo
  if (data.duo?.enabled) {
    console.log('[Image Generator] Applying Duo module...');
    html = await duoModule.modifyHTML(html, data.duo);
  }

  // 2. Criar página do Puppeteer
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  // MODIFICAR: Ajustar viewport baseado no módulo Duo
  const viewport = data.duo?.enabled
    ? { width: 2160, height: 1440, deviceScaleFactor: 2 }
    : { width: 1080, height: 1440, deviceScaleFactor: 2 };

  await page.setViewport(viewport);

  // 3. Carregar HTML
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Esperar fontes, imagens, SVGs, etc.
  await page.evaluateHandle('document.fonts.ready');
  // ... outras esperas ...

  // 4. Preparar output
  const timestamp = Date.now();
  const outputDir = path.join(process.cwd(), 'public', 'output');

  // MODIFICAR: Capturar screenshots baseado no módulo Duo
  if (data.duo?.enabled) {
    console.log('[Image Generator] Generating 2 slides...');

    const result = await duoModule.modifyGeneration(
      page,
      outputDir,
      timestamp,
      data.template
    );

    // Salvar HTML para debug
    const htmlFilename = `${data.template}-duo-${timestamp}.html`;
    await fs.writeFile(
      path.join(outputDir, htmlFilename),
      html
    );

    await page.close();

    return {
      success: true,
      slide1Url: result.slide1Url,
      slide1Filename: result.slide1Filename,
      slide2Url: result.slide2Url,
      slide2Filename: result.slide2Filename,
      htmlUrl: `/output/${htmlFilename}`,
      durationMs: Date.now() - startTime,
    };
  } else {
    // Screenshot normal (single image)
    const filename = `${data.template}-${timestamp}.png`;
    await page.screenshot({
      path: path.join(outputDir, filename),
      type: 'png',
    });

    await page.close();

    return {
      success: true,
      imageUrl: `/output/${filename}`,
      filename,
      durationMs: Date.now() - startTime,
    };
  }
}
```

## 4. Atualizar API Route

Modifique a API route para lidar com respostas duplas:

```typescript
// src/app/api/generate/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await generateImage(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // MODIFICAR: Retornar estrutura apropriada
    if (body.duo?.enabled) {
      return NextResponse.json({
        success: true,
        slide1Url: result.slide1Url,
        slide1Filename: result.slide1Filename,
        slide2Url: result.slide2Url,
        slide2Filename: result.slide2Filename,
        htmlUrl: result.htmlUrl,
        durationMs: result.durationMs,
      });
    } else {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        filename: result.filename,
        htmlUrl: result.htmlUrl,
        durationMs: result.durationMs,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 5. Atualizar Gallery Store

Modifique o store para lidar com imagens duplas:

```typescript
// src/lib/store/galleryStore.ts
interface GalleryItem {
  id: string;
  templateId: string;
  timestamp: number;

  // MODIFICAR: Suportar single ou dual images
  imageUrl?: string;
  filename?: string;

  slide1Url?: string;
  slide1Filename?: string;
  slide2Url?: string;
  slide2Filename?: string;

  htmlUrl?: string;
  isDuo: boolean;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  items: [],

  addItem: (item: GalleryItem) => {
    set((state) => ({
      items: [item, ...state.items],
    }));
  },
}));
```

## 6. Atualizar Preview Component

Modifique o preview para mostrar ambos os slides:

```typescript
// src/components/editor/Preview.tsx
export function Preview() {
  const { generatedImages } = useEditorStore();
  const latest = generatedImages[0];

  if (!latest) {
    return <div>No preview available</div>;
  }

  // ADICIONAR: Renderizar dual slides se isDuo
  if (latest.isDuo) {
    return (
      <div className="flex gap-4">
        <div className="flex-1">
          <h3>Slide 1</h3>
          <img src={latest.slide1Url} alt="Slide 1" />
          <a href={latest.slide1Url} download>
            Download Slide 1
          </a>
        </div>
        <div className="flex-1">
          <h3>Slide 2</h3>
          <img src={latest.slide2Url} alt="Slide 2" />
          <a href={latest.slide2Url} download>
            Download Slide 2
          </a>
        </div>
      </div>
    );
  }

  // Single image preview
  return (
    <div>
      <img src={latest.imageUrl} alt="Preview" />
      <a href={latest.imageUrl} download>
        Download
      </a>
    </div>
  );
}
```

## 7. Defaults no Template Registry

Adicione defaults para o módulo Duo:

```typescript
// src/lib/schemas/templateRegistry.ts
import { duoModuleDefaults } from '@/lib/modules/duo';

export const templateRegistry = {
  stack: {
    schema: stackTemplateSchema,
    defaults: {
      template: 'stack',
      backgroundColor: '#FFFFFF',
      // ... outros defaults

      // ADICIONAR: Duo module defaults
      duo: duoModuleDefaults,
    },
  },
  // ... outros templates
};
```

## 8. Exemplo Completo de Uso

```typescript
// Gerar imagem com módulo Duo ativo
const formData = {
  template: 'stack',
  backgroundColor: '#000000',
  text1: 'Hello World',
  text1Style: {
    fontSize: '120px',
    color: '#FFFFFF',
  },

  // Ativar módulo Duo
  duo: {
    enabled: true,
    centerImageUrl: '/images/person.png',
    centerImageOffsetX: 0,
    centerImageOffsetY: -50,
    centerImageScale: 110,
    centerImageRotation: 0,
    mirrorContent: true,
    outlineEffect: {
      enabled: true,
      color: '#FF0000',
      size: 12,
    },
  },
};

const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

const result = await response.json();

if (result.success) {
  console.log('Slide 1:', result.slide1Url);
  console.log('Slide 2:', result.slide2Url);
  console.log('HTML:', result.htmlUrl);
}
```

## Checklist de Integração

- [ ] Adicionar `duoModuleSchema` ao template schema
- [ ] Adicionar `DuoForm` ao form builder
- [ ] Modificar `imageGenerator.ts` para aplicar `modifyHTML`
- [ ] Modificar `imageGenerator.ts` para ajustar viewport
- [ ] Modificar `imageGenerator.ts` para usar `modifyGeneration`
- [ ] Atualizar API route para retornar dual responses
- [ ] Atualizar gallery store para suportar dual images
- [ ] Atualizar preview component para mostrar ambos slides
- [ ] Adicionar defaults ao template registry
- [ ] Testar com template existente
- [ ] Verificar z-index hierarchy (center image = 100)
- [ ] Confirmar que corners ficam dentro de `.duo-slide`

## Troubleshooting

### Módulo não aparece no form
- Verifique se `DuoForm` foi importado corretamente
- Confirme que `duo` está no schema do template

### Viewport não muda
- Verifique se `data.duo?.enabled` está sendo checado
- Confirme que viewport é definido ANTES de `page.setContent()`

### Screenshots errados
- Verifique se `clip` regions estão corretas: `{x: 0, y: 0, width: 1080}` e `{x: 1080, y: 0, width: 1080}`
- Confirme que viewport é `2160x1440`

### Imagem central não centralizada
- Verifique se `.duo-center-image` tem `left: 50%` e `transform: translate(-50%, -50%)`
- Confirme que z-index é 100
