# Layouts FitFeed para Carousel Import

## Layouts Disponíveis

| Estilo | Template | Tema | Descrição |
|--------|----------|------|-----------|
| `ff_stack1` | stack | Light | Card branco, textos pretos, logo/arrow pretos |
| `ff_stack1-b` | stack | Black | Card preto, textos brancos, logo/arrow brancos |
| `ff_stack2` | stack | Light | Card branco, título grande estilizado |
| `ff_stack2-b` | stack | Black | Card preto, título grande estilizado |

## Estrutura do JSON para Carousel Import

```json
{
  "carousel": {
    "photos": [
      {
        "photo": {
          "src": {
            "portrait": "URL_VERTICAL",
            "landscape": "URL_HORIZONTAL"
          }
        },
        "slide": 1
      }
    ],
    "copy": {
      "slides": [
        {
          "numero": 1,
          "estilo": "ff_stack1",
          "texto_1": "Título principal",
          "texto_2": "Subtítulo ou descrição",
          "texto_3": "Texto adicional (opcional)"
        }
      ]
    },
    "destaques": [
      {
        "numero": 1,
        "destaques": {
          "texto_1": [
            { "trecho": "palavra", "tipo": "bold", "cor": true }
          ]
        }
      }
    ]
  }
}
```

## Campos Obrigatórios

### Por Slide
- `numero`: Número do slide (1, 2, 3...)
- `estilo`: Um dos estilos válidos (ff_stack1, ff_stack1-b, ff_stack2, ff_stack2-b)
- `texto_1`: Texto principal (obrigatório)

### Opcionais
- `texto_2` a `texto_5`: Textos adicionais
- `photos`: Array de fotos para cada slide
- `destaques`: Highlights/destaques para palavras específicas

## Fotos

Para layouts FitFeed, as fotos são usadas como **imagem de conteúdo** (contentImage) dentro do card.

```json
"photos": [
  {
    "photo": {
      "src": {
        "portrait": "https://exemplo.com/foto-vertical.jpg",
        "landscape": "https://exemplo.com/foto-horizontal.jpg"
      }
    },
    "slide": 1
  }
]
```

**Importante:** A URL `landscape` é preferida. Se não existir, usa `portrait`.

## Destaques (Highlights)

Para aplicar estilos a palavras específicas:

```json
"destaques": [
  {
    "numero": 1,
    "destaques": {
      "texto_1": [
        {
          "trecho": "PALAVRA",
          "tipo": "bold",      // "bold" | "italic" | "bold+italic"
          "cor": true          // true = aplica cor de destaque, false = só estilo
        }
      ]
    }
  }
]
```

**Nota:** Para variantes `-b` (black), `cor: true` ainda aplica apenas bold (não cor), pois o texto já é branco.

## Diferenças entre Layouts

### ff_stack1 / ff_stack1-b
- Texto 1: Europa Grotesk SH, 48px, bold
- Texto 2: Neue Kaine, 36px, regular
- Alinhamento: esquerda
- Ideal para: títulos diretos com subtítulo explicativo

### ff_stack2 / ff_stack2-b
- Texto 1: PT Serif, 120px, com styled chunks (cor/itálico)
- Texto 2/3: Neue Kaine, 36px
- Alinhamento: centro
- Ideal para: palavras-chave grandes com descrição

## Arquivos de Layout

Localizados em `templates/layouts/`:
- `ff_stack1.json`
- `ff_stack1-b.json`
- `ff_stack2.json`
- `ff_stack2-b.json`

## Exemplo Completo

Ver arquivo `test-ff-layouts.json` na raiz do projeto.

## Estilos Válidos no Schema

Definidos em `src/lib/schemas/carouselSchema.ts`:
- stack-img
- stack-img-bg
- stack-img reverse
- stack-img-bg reverse
- ff_stack1
- ff_stack1-b
- ff_stack2
- ff_stack2-b

## Notas Técnicas

1. Layouts FitFeed são tratados como "layouts completos" pelo transformer
2. Não aplicam: contador de slides, gradient customizado, reverse
3. Preservam: styledChunks, customStyles, configurações originais
4. Fotos são aplicadas como `contentImageUrl` (não cardBackgroundImage)
