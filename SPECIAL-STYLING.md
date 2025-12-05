# Special Styling Feature - FitFeed Capa Template

## Visão Geral

O **Special Styling** é uma funcionalidade avançada do template `fitfeed-capa` que permite aplicar estilos personalizados para cada linha de texto detectada automaticamente no título.

## Como Funciona

A funcionalidade utiliza a técnica "Split Text by Words" com "OffsetTop Comparison" (baseada em bibliotecas como GSAP SplitText e Lettering.js) para:

1. **Dividir o texto** em palavras individuais
2. **Detectar quebras de linha naturais** comparando a posição vertical (`offsetTop`) de cada palavra
3. **Agrupar palavras** por linha visual
4. **Aplicar estilos personalizados** para cada linha detectada

## Configuração

### Schema

Adicione o campo `titleSpecialStyling` ao seu JSON:

```json
{
  "template": "fitfeed-capa",
  "title": "SEU TEXTO AQUI COM MÚLTIPLAS LINHAS",
  "titleSpecialStyling": {
    "enabled": true,
    "lineStyles": [
      {
        "color": "#FF6B00",
        "bold": true,
        "backgroundColor": "#000000",
        "padding": "0.3em 0.6em"
      },
      {
        "color": "#FFFFFF",
        "backgroundColor": "#FF6B00"
      }
    ]
  }
}
```

### Propriedades do `titleSpecialStyling`

- **`enabled`** (boolean): Ativa/desativa o special styling
- **`lineStyles`** (array): Array de objetos de estilo, um para cada linha

### Propriedades do `lineStyles`

Cada objeto no array `lineStyles` pode conter:

- **`color`** (string): Cor do texto (hex, rgb, rgba)
- **`fontFamily`** (string): Família da fonte
- **`fontSize`** (string): Tamanho da fonte (ex: "72px", "2em")
- **`fontWeight`** (string): Peso da fonte (ex: "400", "700")
- **`bold`** (boolean): Atalho para `font-weight: bold`
- **`italic`** (boolean): Aplica estilo itálico
- **`letterSpacing`** (string): Espaçamento entre letras
- **`backgroundColor`** (string): Cor de fundo (cria barra de fundo)
- **`padding`** (string): Padding quando há backgroundColor (padrão: "0.3em 0.6em")
- **`textShadow`** (string): Sombra do texto

## Exemplo Completo

```json
{
  "template": "fitfeed-capa",
  "title": "TRANSFORME SEU CORPO E ALCANCE SEUS OBJETIVOS",
  "titleStyle": {
    "fontFamily": "Bebas Neue",
    "fontSize": "72px",
    "fontWeight": "900",
    "color": "#ffffff",
    "textAlign": "left",
    "lineHeight": "1.2"
  },
  "titleSpecialStyling": {
    "enabled": true,
    "lineStyles": [
      {
        "color": "#FF6B00",
        "bold": true,
        "backgroundColor": "#000000",
        "padding": "0.3em 0.6em"
      },
      {
        "color": "#FFFFFF",
        "bold": true,
        "backgroundColor": "#FF6B00",
        "padding": "0.3em 0.6em"
      },
      {
        "color": "#000000",
        "bold": true,
        "backgroundColor": "#FFEB3B",
        "padding": "0.3em 0.6em"
      }
    ]
  }
}
```

## Como Usar

### Via Interface (Recomendado)

1. Acesse o editor: `http://localhost:3000/editor`
2. Selecione o template **"FitFeed - Capa"**
3. Na seção **"Title"**:
   - Digite o título desejado
   - Configure fonte, tamanho, cor, etc.
4. Na seção **"Special Styling (Optional)"**:
   - Ative o switch **"Enable Special Styling"**
   - Clique em **"+ Add Line"** para adicionar estilos para cada linha
   - Configure:
     - **Text Color**: Cor do texto da linha
     - **Background Color**: Cor de fundo (opcional, cria barras)
     - **Bold/Italic**: Toggles para negrito e itálico
     - **Font Family**: Fonte específica para a linha (opcional)
     - **Font Size**: Tamanho específico (opcional)
     - **Padding**: Espaçamento quando há background
5. Observe que ao ativar o Special Styling, o **Styled Chunks** será desabilitado automaticamente
6. Clique em **"Generate Image"**

### Via API

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d @test-fitfeed-special-styling.json
```

## Notas Técnicas

### Ordem de Aplicação e Conflitos

**⚠️ IMPORTANTE**: Special Styling e Styled Chunks são **mutuamente exclusivos**:

1. Quando **Special Styling está ativo**, o Styled Chunks é desabilitado automaticamente na UI
2. Os estilos do Special Styling **sobrescrevem** qualquer estilo do Styled Chunks
3. É recomendado usar **apenas um dos dois** métodos por vez

**Ordem de processamento** (se ambos estiverem presentes no JSON):
1. `titleStyledChunks` é processado primeiro (se presente)
2. Special styling detecta as linhas e aplica os estilos por linha
3. Os estilos do special styling **sobrescrevem** os estilos do styled chunks

### Número de Linhas

- Se você fornecer **menos estilos** do que linhas detectadas, as linhas extras não terão estilos especiais
- Se você fornecer **mais estilos** do que linhas detectadas, os estilos extras serão ignorados

### Performance

- A detecção de linhas acontece no browser (Puppeteer) antes da captura
- Pequeno delay adicional (< 100ms) para garantir layout correto

## Troubleshooting

### As linhas não são detectadas corretamente

- Verifique o `lineHeight` no `titleStyle` - valores muito pequenos podem causar problemas
- Certifique-se de que o texto tem espaço suficiente para quebrar naturalmente
- Teste com diferentes tamanhos de `fontSize`

### Estilos não aplicados

- Verifique se `enabled: true`
- Confira se o array `lineStyles` tem pelo menos um objeto
- Veja o console do Puppeteer para mensagens de debug

### Espaçamento incorreto

- Ajuste o `padding` nos estilos de linha
- Verifique o `letterSpacing` no `titleStyle`
- Considere ajustar o `lineHeight`

## Arquivos Relacionados

- **Schema**: `src/lib/schemas/fitfeedCapaTemplate.ts`
- **Template HTML**: `templates/fitfeed-capa.html`
- **JavaScript**: `public/js/line-detector.js`
- **Processamento**: `src/lib/services/imageGenerator.ts`
- **Exemplo**: `test-fitfeed-special-styling.json`
