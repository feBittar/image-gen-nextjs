# Auto-Size Feature para Text Fields

## Visão Geral

Feature que ajusta automaticamente o tamanho de fonte de text fields para preencher exatamente a mesma altura vertical que uma content image está ocupando, em layouts horizontais.

## Como Funciona

Quando você está usando:
1. Layout horizontal (`card.layoutDirection = 'row'`)
2. Content Image habilitada
3. Text Fields com auto-sizing ativado

O sistema automaticamente:
- Detecta a altura vertical que a content image está ocupando
- Escolhe um texto para ficar maior (3x) e outro para ficar menor (1x)
- Ajusta os tamanhos de fonte para que os dois textos juntos preencham exatamente a mesma altura da imagem

## Arquitetura Técnica

### 1. Schema (`src/lib/modules/text-fields/schema.ts`)

Novos campos adicionados:

```typescript
{
  autoSizeMode: z.enum(['off', 'proportional-3-1']).default('off'),
  autoSizeLargerIndex: z.number().min(0).max(9).default(0),
  autoSizeSmallerIndex: z.number().min(0).max(9).default(1),
  autoSizeMinFontSize: z.number().min(10).max(200).default(24),
  autoSizeMaxFontSize: z.number().min(10).max(500).default(200),
}
```

### 2. Formulário UI (`src/lib/modules/text-fields/TextFieldsForm.tsx`)

Nova seção "Auto-Sizing" na área de Layout Horizontal com:
- Seletor de modo (Desativado / Proporcional 3:1)
- Seletor de texto maior (3x)
- Seletor de texto menor (1x)
- Controles de tamanho mínimo e máximo

### 3. Script JavaScript (`public/js/text-auto-size.js`)

Implementa o algoritmo de binary search para encontrar o tamanho ótimo:

**Algoritmo:**
1. Obtém a altura da content image de referência
2. Calcula a altura proporcional para cada texto (3:1)
3. Usa binary search para encontrar o tamanho de fonte ideal
4. Ajusta ambos os textos mantendo a proporção 3:1

**Performance:**
- Complexidade: O(log n) por elemento
- ~20 iterações máximas por texto
- Total: ~40 iterações para ambos os textos

### 4. CSS (`src/lib/modules/text-fields/css.ts`)

Modificado para:
- Não definir `font-size` quando auto-sizing está ativo
- Permitir que o JavaScript controle o tamanho dinamicamente

### 5. HTML (`src/lib/modules/text-fields/html.ts`)

Adiciona data attributes para identificação:
- `data-auto-size="larger"` - Texto maior (3x)
- `data-auto-size="smaller"` - Texto menor (1x)

### 6. Compositor (`src/lib/modules/compositer.ts`)

- Função `generateAutoSizeConfig()` injeta configuração no HTML
- Script `text-auto-size.js` é carregado quando necessário
- Configuração global em `window.autoSizeConfig`

## Como Usar

### No Editor Modular

1. Configure um layout horizontal:
   - Card Module → Layout Direction: Row

2. Adicione Content Image:
   - Content Image Module → Enabled
   - Configure a URL da imagem

3. Configure Text Fields:
   - Text Fields Module → Layout Horizontal → Auto-Sizing
   - Modo: Proporcional 3:1
   - Selecione qual texto será maior (3x)
   - Selecione qual texto será menor (1x)
   - Ajuste limites de tamanho se necessário

4. Preencha os textos e gere a imagem

### Exemplo de Configuração

```json
{
  "card": {
    "layoutDirection": "row"
  },
  "contentImage": {
    "enabled": true,
    "url": "https://example.com/image.jpg",
    "layoutWidth": "50%"
  },
  "textFields": {
    "layoutWidth": "50%",
    "autoSizeMode": "proportional-3-1",
    "autoSizeLargerIndex": 0,
    "autoSizeSmallerIndex": 1,
    "autoSizeMinFontSize": 24,
    "autoSizeMaxFontSize": 200,
    "fields": [
      {
        "content": "Texto Grande",
        "style": { "fontFamily": "Arial", "fontWeight": "700" }
      },
      {
        "content": "Texto Pequeno",
        "style": { "fontFamily": "Arial", "fontWeight": "400" }
      }
    ]
  }
}
```

## Limitações e Considerações

### Limitações Atuais

1. **Apenas modo horizontal**: Funciona apenas quando `card.layoutDirection = 'row'`
2. **Dois textos**: Atualmente suporta apenas 2 textos (3:1)
3. **Content image como referência**: Usa apenas a content image como referência de altura
4. **Proporção fixa**: Apenas proporção 3:1 disponível

### Futuras Melhorias Possíveis

1. **Múltiplas proporções**: 2:1, 4:1, etc.
2. **Mais de dois textos**: Suporte a 3+ textos com proporções customizadas
3. **Referência customizada**: Permitir escolher elemento de referência
4. **Modo vertical**: Suporte para layouts verticais
5. **Preview em tempo real**: Mostrar preview do resultado no editor

## Troubleshooting

### Textos não estão ajustando

1. Verifique se layout horizontal está ativo
2. Verifique se content image tem altura > 0
3. Verifique console do navegador para logs `[Auto-Size]`
4. Verifique se os data attributes estão presentes no HTML

### Proporção não está correta

1. Ajuste limites de tamanho (min/max)
2. Verifique se textos não estão muito longos
3. Reduza line-height se necessário

### Imagem demora a carregar

- O script aguarda fonts e imagens carregarem
- Aguarde ~100ms após `document.fonts.ready`

## Arquivos Modificados

```
src/lib/modules/text-fields/
  ├── schema.ts              (+ campos auto-size)
  ├── index.ts               (+ defaults)
  ├── TextFieldsForm.tsx     (+ UI auto-size)
  ├── css.ts                 (+ lógica condicional fontSize)
  └── html.ts                (+ data attributes)

src/lib/modules/
  └── compositer.ts          (+ geração de config)

public/js/
  └── text-auto-size.js      (novo arquivo)

docs/
  └── AUTO-SIZE-FEATURE.md   (este arquivo)
```

## Inspiração e Referências

Baseado em soluções de auto-sizing encontradas na web:
- Binary search algorithm (textFit.js)
- React-textfit library
- Fitty.js approach
- GSAP SplitText technique

## Créditos

Implementado com base em pesquisa de soluções existentes de auto-sizing de texto em JavaScript, usando algoritmo de binary search para performance ótima.
