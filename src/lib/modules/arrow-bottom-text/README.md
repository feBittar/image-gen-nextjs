# Arrow Bottom Text Module

Módulo completo para exibir um combo de Arrow (SVG/imagem) + texto inferior, geralmente usado no canto inferior para CTAs tipo "swipe up".

## Estrutura

```
arrow-bottom-text/
├── schema.ts                 # Zod schema e tipos
├── css.ts                    # Geração de CSS
├── html.ts                   # Geração de HTML
├── ArrowBottomTextForm.tsx   # Componente React do formulário
├── index.ts                  # Definição do módulo e exports
└── README.md                 # Esta documentação
```

## Features

- **Arrow SVG/Image**: Suporte para SVGs com cor customizável ou imagens PNG
- **Bottom Text**: Texto com controle completo de tipografia
- **Positioning**: Sistema de posições especiais (top-left, bottom-right, etc.) com padding configurável
- **Layout Options**: Vertical (arrow acima do texto) ou horizontal (arrow ao lado do texto)
- **Gap Control**: Espaçamento configurável entre arrow e texto
- **z-index: 30**: Mesmo nível de freeText, acima da maioria dos elementos

## Schema

```typescript
{
  enabled: boolean;              // Habilita/desabilita o módulo
  arrowImageUrl: string;         // URL do SVG/PNG do arrow
  arrowColor: string;            // Cor para override do SVG (ex: '#ffffff')
  arrowWidth: string;            // Largura do arrow (ex: '80px', '15%')
  arrowHeight: string;           // Altura do arrow (ex: 'auto', '80px')
  bottomText: string;            // Conteúdo do texto
  bottomTextStyle: TextStyle;    // Estilo do texto (fonte, tamanho, cor, etc)
  specialPosition: SpecialPosition; // Posição preset (bottom-right, top-left, etc)
  padding: number;               // Padding das bordas em % (0-20)
  gapBetween: number;            // Gap entre arrow e texto em px (0-100)
  layout: 'vertical' | 'horizontal'; // Direção do layout
}
```

## Uso

### 1. Registro do Módulo

```typescript
// src/lib/modules/registry.ts
import { ArrowBottomTextModule } from './arrow-bottom-text';

export const moduleRegistry = {
  'arrow-bottom-text': ArrowBottomTextModule,
  // ... outros módulos
};
```

### 2. Exemplo de Dados

```typescript
const arrowBottomTextData = {
  enabled: true,
  arrowImageUrl: '/logos/arrow-down.svg',
  arrowColor: '#FF6B00',
  arrowWidth: '80px',
  arrowHeight: 'auto',
  bottomText: 'SAIBA MAIS',
  bottomTextStyle: {
    fontFamily: 'Arial',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  specialPosition: 'bottom-right',
  padding: 5,
  gapBetween: 15,
  layout: 'vertical',
};
```

### 3. Geração de CSS

```typescript
import { getArrowBottomTextCss } from './arrow-bottom-text';

const css = getArrowBottomTextCss(arrowBottomTextData);
```

### 4. Geração de HTML

```typescript
import { getArrowBottomTextHtml } from './arrow-bottom-text';

const html = getArrowBottomTextHtml(arrowBottomTextData);
```

## CSS Output

O módulo gera o seguinte CSS:

```css
/* Container principal */
.arrow-bottom-text-container {
  position: absolute;
  z-index: 30;
  display: flex;
  flex-direction: vertical | horizontal;
  align-items: center;
  gap: 15px; /* gapBetween */
  bottom: 5%; /* padding */
  right: 5%;  /* padding */
}

/* Arrow image */
.arrow-image {
  display: block;
  width: 80px;
  height: auto;
  object-fit: contain;
  filter: ...; /* Color override if needed */
}

/* Bottom text */
.arrow-bottom-text {
  font-family: Arial;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  display: block;
  white-space: nowrap;
}
```

## HTML Output

```html
<div class="arrow-bottom-text-container">
  <img class="arrow-image" src="/logos/arrow-down.svg" alt="Arrow" />
  <div class="arrow-bottom-text">SAIBA MAIS</div>
</div>
```

## Componente de Formulário

O componente `ArrowBottomTextForm` fornece uma interface completa para configuração:

- Toggle para habilitar/desabilitar
- Selector de arrow (busca logos via `useLogosFetch`)
- Color picker para cor do arrow
- Inputs de width/height
- Textarea para texto
- Controles de estilo do texto (fonte, tamanho, peso, cor, transform)
- Selector de layout (vertical/horizontal)
- Slider para gap
- Special position selector com padding

## Posicionamento

### Special Positions Suportadas

- `none`: Sem posição especial (usa valores padrão)
- `top-left`: Canto superior esquerdo
- `top-right`: Canto superior direito
- `bottom-left`: Canto inferior esquerdo
- `bottom-right`: Canto inferior direito (padrão)
- `top-center`: Centro superior
- `bottom-center`: Centro inferior
- `center-left`: Centro esquerdo
- `center-right`: Centro direito
- `center`: Centro total

### Padding

O padding é especificado em porcentagem (0-20%) e determina a distância das bordas do viewport.

## Layout Options

### Vertical (padrão)
Arrow posicionado acima do texto:
```
  ↓
SAIBA MAIS
```

### Horizontal
Arrow posicionado ao lado do texto:
```
↓ SAIBA MAIS
```

## Integração com Template Stack

O módulo foi projetado para substituir a implementação existente de arrow/bottomText no template Stack:

**Antes** (no template `stack.html`):
```html
<div class="arrow-bottom-wrapper">
  <img id="arrowImage" src="{{arrowImageUrl}}" />
  <div class="bottom-text">{{bottomText}}</div>
</div>
```

**Agora** (com o módulo):
```html
{{{arrowBottomTextContent}}}
```

## Color Override para SVG

O módulo aplica um filtro CSS para modificar a cor de SVGs. A função `convertColorToFilter` converte uma cor hexadecimal para um filtro CSS:

```typescript
// Exemplo interno
arrowColor = '#FF6B00';
filter = 'brightness(0.8) sepia(0.3) saturate(1.5) hue-rotate(25deg)';
```

## z-index Hierarchy

- **Viewport/Card**: z-index 1-10
- **Content Image**: z-index 5
- **SVG Elements**: z-index 20
- **Arrow Bottom Text**: z-index 30 ⭐
- **Free Text**: z-index 30
- **Corners**: z-index 99
- **Duo Slides**: z-index 100+

## Compatibilidade

- Funciona com qualquer template que use o sistema de módulos
- Compatível com Duo module (será duplicado para cada slide)
- Não conflita com outros módulos
- Suporta arrows em SVG ou PNG

## Tipografia

O módulo usa o schema `textStyleSchema` compartilhado, suportando:

- `fontFamily`: Qualquer fonte carregada no sistema
- `fontSize`: Tamanho em px (12-48px recomendado)
- `fontWeight`: 300-900
- `color`: Cor hexadecimal
- `textTransform`: none | uppercase | lowercase | capitalize
- `textAlign`: left | center | right
- `lineHeight`: Altura da linha
- `letterSpacing`: Espaçamento entre letras
- `textShadow`: Sombra do texto
- `textDecoration`: underline | none
- `backgroundColor`: Cor de fundo (opcional)
- `padding`: Padding interno (opcional)

## Debug

Para debug, inspecione:

1. **Container**: `.arrow-bottom-text-container` deve ter position absolute e estar visível
2. **Arrow**: `.arrow-image` deve ter src válido
3. **Text**: `.arrow-bottom-text` deve conter o texto
4. **Positioning**: Verifique os valores de top/left/right/bottom no container
5. **z-index**: Deve ser 30 para ficar acima do conteúdo principal

## Exemplo Completo de Uso no Template

```typescript
// Editor form data
const formData = {
  arrowBottomText: {
    enabled: true,
    arrowImageUrl: '/logos/arrow-swipe-up.svg',
    arrowColor: '#FF6B00',
    arrowWidth: '80px',
    arrowHeight: 'auto',
    bottomText: 'ARRASTE PARA CIMA',
    bottomTextStyle: {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      fontWeight: '900',
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    specialPosition: 'bottom-right',
    padding: 6,
    gapBetween: 12,
    layout: 'vertical',
  },
};

// Generate CSS and HTML
const css = ArrowBottomTextModule.getCss(formData.arrowBottomText);
const html = ArrowBottomTextModule.getHtml(formData.arrowBottomText);

// Inject into template
const finalHtml = baseTemplate
  .replace('{{modulesCSS}}', css)
  .replace('{{{modulesHTML}}}', html);
```

## Migrations

Se você está migrando do sistema antigo do Stack template:

1. **Arrow settings**: Mapeie `arrowImageUrl`, `arrowColor`, `arrowImagePosition`, `arrowImageSpecialPosition` para o novo schema
2. **Bottom text**: Mapeie `bottomText`, `bottomTextStyle`, `bottomTextSpecialPosition` para o novo schema
3. **Gap**: Use `arrowContentGap` → `gapBetween`
4. **Position**: As special positions funcionam da mesma forma

## Best Practices

1. **Arrow Size**: Use width de 60-100px para melhor visibilidade
2. **Text**: Mantenha curto (2-3 palavras) para melhor legibilidade
3. **Position**: bottom-right é o mais comum para CTAs
4. **Color**: Use cores que contrastem com o fundo
5. **Layout**: Vertical funciona melhor na maioria dos casos
6. **Gap**: 10-20px é ideal para a maioria dos designs

## Troubleshooting

**Arrow não aparece:**
- Verifique se `enabled` é `true`
- Verifique se `arrowImageUrl` está preenchido
- Verifique se o SVG/imagem existe no caminho especificado

**Texto não aparece:**
- Verifique se `bottomText` não está vazio
- Verifique se a cor do texto contrasta com o fundo

**Posicionamento incorreto:**
- Verifique `specialPosition` e `padding`
- Verifique se não há conflitos de CSS com outros módulos

**Cor do SVG não muda:**
- Alguns SVGs têm estilos inline que override o filtro
- Tente usar SVGs sem estilos inline (apenas `fill="currentColor"`)
