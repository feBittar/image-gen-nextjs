# Duo Module

O módulo Duo é um wrapper universal que transforma qualquer template em uma versão de 2 slides lado a lado.

## Características

- **Viewport duplo**: Expande de 1080px para 2160px de largura
- **Duplicação automática**: Cria 2 slides lado a lado com o mesmo conteúdo
- **Imagem central**: PNG centralizado conectando ambos os slides (z-index: 100)
- **Output duplo**: Gera 2 arquivos PNG separados
- **Espelhamento opcional**: Slide 2 pode espelhar o conteúdo do slide 1
- **Transformações**: Offset, escala e rotação da imagem central
- **Efeito outline**: Contorno sólido ao redor da imagem central

## Estrutura de Arquivos

```
src/lib/modules/duo/
├── schema.ts       # Zod schema e tipos TypeScript
├── css.ts          # Geração de CSS para viewport duplo
├── html.ts         # Funções para wrapping de HTML
├── DuoForm.tsx     # Componente React para UI
├── index.ts        # Module definition e exports
└── README.md       # Documentação
```

## Como Funciona

### 1. Schema (`schema.ts`)

Define a configuração do módulo:

```typescript
{
  enabled: boolean,
  centerImageUrl: string,
  centerImageOffsetX: number,    // -500 a +500px
  centerImageOffsetY: number,    // -500 a +500px
  centerImageScale: number,      // 50% a 200%
  centerImageRotation: number,   // -180° a +180°
  mirrorContent: boolean,
  outlineEffect: {
    enabled: boolean,
    color: string,
    size: number               // 0 a 50px
  }
}
```

### 2. CSS Generation (`css.ts`)

Gera CSS que:
- Força `body` para 2160px de largura
- Cria container `.duo-wrapper` com flexbox
- Define `.duo-slide` containers de 1080px cada
- Posiciona `.duo-center-image` absolutamente no centro
- Aplica transformações (offset, scale, rotation)
- Cria efeito outline usando múltiplos drop-shadows

### 3. HTML Wrapping (`html.ts`)

Transforma o HTML original:

**Antes:**
```html
<body>
  <div class="content">...</div>
</body>
```

**Depois:**
```html
<body>
  <div class="duo-wrapper">
    <div class="duo-slide duo-slide-1">
      <div class="content">...</div>
    </div>
    <div class="duo-slide duo-slide-2">
      <div class="content">...</div>
    </div>
  </div>
  <img class="duo-center-image" src="..." />
</body>
```

### 4. Generation Hook (`index.ts`)

Modifica o processo de screenshot para:
1. Capturar slide 1: clip region `{ x: 0, y: 0, width: 1080, height: 1440 }`
2. Capturar slide 2: clip region `{ x: 1080, y: 0, width: 1080, height: 1440 }`
3. Retornar URLs de ambos os arquivos PNG

### 5. Form Component (`DuoForm.tsx`)

Fornece UI para:
- Toggle enable/disable
- Input de URL da imagem central
- Sliders para offset X/Y, scale, rotation
- Toggle e controles para outline effect
- Toggle para mirror content
- Info box com status do módulo

## Integração com Image Generator

O módulo se integra via hooks no `imageGenerator.ts`:

```typescript
// 1. Após processar o HTML do template
if (duoConfig?.enabled) {
  html = await duoModule.modifyHTML(html, duoConfig);
}

// 2. Ajustar viewport
const viewport = duoConfig?.enabled
  ? { width: 2160, height: 1440, deviceScaleFactor: 2 }
  : { width: 1080, height: 1440, deviceScaleFactor: 2 };

// 3. Após renderizar página
if (duoConfig?.enabled) {
  const result = await duoModule.modifyGeneration(
    page,
    outputDir,
    timestamp,
    templateName
  );
  return {
    slide1Url: result.slide1Url,
    slide2Url: result.slide2Url,
    ...
  };
}
```

## Z-Index Hierarchy

Quando o módulo Duo está ativo:

- `.duo-wrapper`: z-index 0 (base)
- `.duo-slide`: z-index 0 (relative)
- Conteúdo do template: z-index padrão (1-99)
- `.duo-center-image`: **z-index 100** (acima de tudo, incluindo corners)

## Compatibilidade

O módulo Duo é compatível com TODOS os templates existentes:
- `stack.html`
- `bullets-cards.html`
- `fitfeed-capa.html`
- `dual-text.html`
- `sandwich.html`
- E qualquer novo template futuro

## Efeito Outline

O outline é criado usando múltiplos `drop-shadow` em CSS:

```css
filter:
  drop-shadow(10px 0 0 #000)
  drop-shadow(-10px 0 0 #000)
  drop-shadow(0 10px 0 #000)
  drop-shadow(0 -10px 0 #000)
  drop-shadow(10px 10px 0 #000)
  drop-shadow(-10px 10px 0 #000)
  drop-shadow(10px -10px 0 #000)
  drop-shadow(-10px -10px 0 #000);
```

Isso cria um contorno sólido de 8 direções ao redor da imagem PNG.

## Exemplo de Uso

```typescript
import { duoModule } from '@/lib/modules/duo';

const config = {
  enabled: true,
  centerImageUrl: '/images/person.png',
  centerImageOffsetX: 50,
  centerImageOffsetY: -20,
  centerImageScale: 120,
  centerImageRotation: -5,
  mirrorContent: false,
  outlineEffect: {
    enabled: true,
    color: '#FF0000',
    size: 15,
  },
};

// Em um componente React
<DuoForm config={config} onChange={setConfig} />
```

## Notas Técnicas

1. **Viewport**: O módulo força `width: 2160px` no body via CSS
2. **Screenshots**: Usa `clip` do Puppeteer para capturar regiões específicas
3. **Flexbox**: Usa flexbox para layout dos slides (não position absolute)
4. **Performance**: Não há overhead quando `enabled: false`
5. **Reutilização**: O módulo NÃO cria nova instância do browser, reutiliza a existente

## Troubleshooting

### Imagem central não aparece
- Verifique se `centerImageUrl` está correto
- Confirme que o arquivo existe em `public/`
- Check z-index (deve ser 100)

### Outline não aparece
- Verifique se `outlineEffect.enabled` é `true`
- Confirme que `size > 0`
- Teste com cor contrastante

### Slides desalinhados
- Verifique se viewport é exatamente 2160x1440
- Confirme que `.duo-slide` tem `width: 1080px`
- Check flexbox no `.duo-wrapper`

### Corners duplicados
- Certifique-se que corners estão dentro de `.duo-slide`
- Não use position absolute no wrapper
- Use relative positioning dentro dos slides
