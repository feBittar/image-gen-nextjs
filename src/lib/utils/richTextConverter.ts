/**
 * Parser simples e leve para sintaxe inline em HTML estilizado
 *
 * Sintaxe: [texto|propriedade:valor;propriedade:valor]
 * Exemplo: [Olá|cor:#ff0000] [mundo|fonte:arial;negrito:true]
 */

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHTML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valida cor CSS (hex, rgb, rgba, nomes)
 */
function sanitizeColor(color: string): string {
  const trimmed = color.trim();
  const colorPattern = /^(#[0-9a-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|[a-z]+)$/i;
  return colorPattern.test(trimmed) ? trimmed : '';
}

/**
 * Sanitiza nome de fonte preservando aspas necessárias
 * Aceita: 'Times New Roman', "Arial", Arial, 'Font1', Font2, serif
 * Remove apenas caracteres perigosos: <, >, {, }
 */
function sanitizeFont(font: string): string {
  // Remove apenas caracteres perigosos (XSS), preserva aspas e parênteses
  const cleaned = font.replace(/[<>{}]/g, '').trim();

  // Se a fonte tem espaços e não está entre aspas, adiciona aspas simples
  if (cleaned.includes(' ') && !cleaned.startsWith('"') && !cleaned.startsWith("'")) {
    // Verifica se não é uma lista de fontes (com vírgula)
    if (!cleaned.includes(',')) {
      return `'${cleaned}'`;
    }
  }

  return cleaned;
}

/**
 * Valida tamanho com unidade (px, em, rem, %)
 */
function sanitizeSize(size: string): string {
  const trimmed = size.trim();
  const sizePattern = /^\d+(\.\d+)?(px|em|rem|%|pt)?$/i;

  if (sizePattern.test(trimmed)) {
    // Adiciona 'px' se não houver unidade
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return '';
}

/**
 * Valida letter-spacing
 */
function sanitizeLetterSpacing(spacing: string): string {
  const trimmed = spacing.trim();
  const spacingPattern = /^-?\d+(\.\d+)?(px|em|rem)?$/i;

  if (spacingPattern.test(trimmed)) {
    return /^-?\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return '';
}

/**
 * Valida line-height (aceita valores sem unidade como 1.2, 1.5, etc)
 * Diferente de sanitizeSize, NÃO adiciona 'px' automaticamente
 * Aceita: número puro (1.2), px, em, rem, %
 */
function sanitizeLineHeight(lineHeight: string): string {
  const trimmed = lineHeight.trim();
  // Aceita número puro ou com unidades válidas
  const lineHeightPattern = /^\d+(\.\d+)?(px|em|rem|%)?$/i;

  if (lineHeightPattern.test(trimmed)) {
    // Retorna sem adicionar unidade (line-height aceita valores unitless)
    return trimmed;
  }
  return '';
}

/**
 * Sanitiza valores de padding (aceita 1 a 4 valores com unidades)
 */
function sanitizePadding(padding: string): string {
  const trimmed = padding.trim();
  // Aceita formatos: "10px", "10px 20px", "10px 20px 30px", "10px 20px 30px 40px"
  const paddingPattern = /^(\d+(\.\d+)?(px|em|rem|%)?(\s+\d+(\.\d+)?(px|em|rem|%)?)*)$/i;

  if (paddingPattern.test(trimmed)) {
    // Se não tem unidade, adiciona px
    const parts = trimmed.split(/\s+/);
    const withUnits = parts.map(part => {
      if (/^\d+(\.\d+)?$/.test(part)) {
        return part + 'px';
      }
      return part;
    });
    return withUnits.join(' ');
  }
  return '';
}

/**
 * Sanitiza valor de blur (aceita valores com px)
 */
function sanitizeBlur(blur: string): string {
  const trimmed = blur.trim();
  // Aceita formato: "8px", "12", "4.5px"
  const blurPattern = /^\d+(\.\d+)?(px)?$/i;

  if (blurPattern.test(trimmed)) {
    // Se não tem unidade, adiciona px
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return '';
}

/**
 * Mapeia propriedades para estilos CSS
 */
function propertyToStyle(prop: string, value: string): string | null {
  const propLower = prop.toLowerCase().trim();
  const valueTrimmed = value.trim();

  switch (propLower) {
    case 'cor':
    case 'color': {
      const color = sanitizeColor(valueTrimmed);
      return color ? `color:${color}` : null;
    }

    case 'fonte':
    case 'font': {
      const font = sanitizeFont(valueTrimmed);
      return font ? `font-family:${font}` : null;
    }

    case 'tamanho':
    case 'size': {
      const size = sanitizeSize(valueTrimmed);
      return size ? `font-size:${size}` : null;
    }

    case 'negrito':
    case 'bold': {
      const isBold = valueTrimmed.toLowerCase() === 'true';
      return isBold ? 'font-weight:bold' : null;
    }

    case 'italico':
    case 'italic': {
      const isItalic = valueTrimmed.toLowerCase() === 'true';
      return isItalic ? 'font-style:italic' : null;
    }

    case 'sublinhado':
    case 'underline': {
      const isUnderline = valueTrimmed.toLowerCase() === 'true';
      return isUnderline ? 'text-decoration:underline' : null;
    }

    case 'espacamento':
    case 'letter-spacing': {
      const spacing = sanitizeLetterSpacing(valueTrimmed);
      return spacing ? `letter-spacing:${spacing}` : null;
    }

    case 'background-color':
    case 'backgroundColor':
    case 'cor-de-fundo': {
      const bgColor = sanitizeColor(valueTrimmed);
      return bgColor ? `background-color:${bgColor}` : null;
    }

    case 'padding':
    case 'preenchimento': {
      const paddingValue = sanitizePadding(valueTrimmed);
      return paddingValue ? `padding:${paddingValue}` : null;
    }

    default:
      return null;
  }
}

/**
 * Interface para trechos de texto estilizados
 */
export interface StyledChunk {
  text: string;
  color?: string;
  font?: string;
  fontFamily?: string; // Compatibilidade com frontend
  size?: string;
  fontSize?: string; // Compatibilidade com frontend
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: string;
  lineHeight?: string;
  backgroundColor?: string; // Cor de fundo para "barras" atrás do texto
  backgroundBlur?: string; // Desfoque de fundo (backdrop-filter: blur)
  blurColor?: string; // Cor do blur (hex)
  blurOpacity?: number; // Opacidade da cor do blur (0-1)
  blurFadeDirection?: 'horizontal' | 'vertical' | 'both'; // Direção do fade
  blurFadeAmount?: number; // Porcentagem do fade (0-25)
  padding?: string; // Padding para as barras de fundo
  lineBreak?: boolean; // Adiciona quebra de linha (<br>) após o texto
}

/**
 * Interface para estilos do campo pai
 */
export interface ParentStyles {
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  letterSpacing?: string;
  lineHeight?: string;
  backgroundColor?: string; // Cor de fundo herdável
  padding?: string; // Padding herdável
  textAlign?: string; // Alinhamento de texto herdável
}

/**
 * Aplica estilos customizados em trechos específicos do texto com herança do campo pai
 *
 * @param text - Texto completo (ex: "Olá, mundo! Texto normal")
 * @param chunks - Array de trechos com estilos (ex: [{text: "Olá", color: "#ff0000"}])
 * @param parentStyles - Estilos do campo pai (titleStyle ou subtitleStyle) para herança
 * @returns HTML com spans estilizados aplicados aos trechos encontrados
 *
 * @example
 * // Com herança de estilos do pai
 * applyStyledChunks("Olá, mundo!", [
 *   {text: "Olá", color: "#ff0000"}  // Herda fontSize e fontFamily do pai
 * ], {
 *   color: "#000000",
 *   fontSize: "32px",
 *   fontFamily: "Arial"
 * })
 * // Retorna: <span style="color:#ff0000;font-size:32px;font-family:Arial">Olá</span>, mundo!
 *
 * @example
 * // Trechos duplicados: processa apenas a primeira ocorrência
 * applyStyledChunks("teste teste", [{text: "teste", bold: true}])
 * // Retorna: <span style="font-weight:bold">teste</span> teste
 */
export function applyStyledChunks(
  text: string,
  chunks: StyledChunk[],
  parentStyles?: ParentStyles
): string {
  console.log('\n========== applyStyledChunks ==========');
  console.log('text:', text);
  console.log('chunks:', JSON.stringify(chunks, null, 2));
  console.log('parentStyles:', JSON.stringify(parentStyles, null, 2));

  if (!text || typeof text !== 'string') {
    console.log('EARLY RETURN: texto vazio ou inválido');
    return '';
  }

  if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
    console.log('EARLY RETURN: chunks vazio ou inválido');
    return escapeHTML(text);
  }

  // Array para rastrear posições já processadas
  const processedRanges: Array<{start: number; end: number}> = [];
  const replacements: Array<{start: number; end: number; html: string}> = [];

  // Processa cada chunk
  for (const chunk of chunks) {
    console.log('\n--- Processando chunk ---');
    console.log('chunk:', chunk);

    if (!chunk.text || typeof chunk.text !== 'string') {
      console.log('SKIP: chunk.text inválido');
      continue;
    }

    // Encontra primeira ocorrência do texto
    const index = text.indexOf(chunk.text);
    console.log(`Procurando "${chunk.text}" em "${text}"`);
    console.log('index encontrado:', index);

    if (index === -1) {
      console.log('SKIP: trecho não encontrado no texto');
      continue; // Trecho não encontrado, ignora silenciosamente
    }

    const endIndex = index + chunk.text.length;

    // Verifica se essa posição já foi processada (overlap)
    const hasOverlap = processedRanges.some(
      range => (index >= range.start && index < range.end) ||
               (endIndex > range.start && endIndex <= range.end) ||
               (index <= range.start && endIndex >= range.end)
    );

    if (hasOverlap) continue; // Ignora chunks que sobrepõem regiões já processadas

    // Constrói estilos CSS com herança do campo pai
    const styles: string[] = [];

    // Estratégia: aplicar apenas estilos do pai que o chunk NÃO sobrescreve
    // Isso evita lógica redundante de splice/remove

    // 1. Color (prioridade: chunk > parent)
    if (chunk.color) {
      const color = sanitizeColor(chunk.color);
      if (color) {
        styles.push(`color:${color}`);
        console.log(`Aplicando cor do chunk: ${color}`);
      }
    } else if (parentStyles?.color) {
      const color = sanitizeColor(parentStyles.color);
      if (color) {
        styles.push(`color:${color}`);
        console.log(`Herdando cor do pai: ${color}`);
      }
    }

    // 2. Font family (prioridade: chunk > parent)
    // Suporta tanto 'font' quanto 'fontFamily' para compatibilidade
    const chunkFont = chunk.fontFamily || chunk.font;
    if (chunkFont) {
      const font = sanitizeFont(chunkFont);
      if (font) {
        styles.push(`font-family:${font}`);
        console.log(`Aplicando fonte do chunk: ${font}`);
      }
    } else if (parentStyles?.fontFamily) {
      const font = sanitizeFont(parentStyles.fontFamily);
      if (font) {
        styles.push(`font-family:${font}`);
        console.log(`Herdando fonte do pai: ${font}`);
      }
    }

    // 3. Font size (prioridade: chunk > parent)
    // Suporta tanto 'size' quanto 'fontSize' para compatibilidade
    const chunkSize = chunk.fontSize || chunk.size;
    if (chunkSize) {
      const size = sanitizeSize(chunkSize);
      if (size) {
        styles.push(`font-size:${size}`);
        console.log(`Aplicando tamanho do chunk: ${size}`);
      }
    } else if (parentStyles?.fontSize) {
      const size = sanitizeSize(parentStyles.fontSize);
      if (size) {
        styles.push(`font-size:${size}`);
        console.log(`Herdando tamanho do pai: ${size}`);
      }
    }

    // 4. Font weight (prioridade: chunk > parent)
    if (chunk.bold === true) {
      styles.push('font-weight:bold');
      console.log('Aplicando negrito do chunk');
    } else if (parentStyles?.fontWeight) {
      styles.push(`font-weight:${parentStyles.fontWeight}`);
      console.log(`Herdando peso do pai: ${parentStyles.fontWeight}`);
    }

    // 5. Font style (prioridade: chunk > parent)
    if (chunk.italic === true) {
      styles.push('font-style:italic');
      console.log('Aplicando itálico do chunk');
    } else if (parentStyles?.fontStyle) {
      styles.push(`font-style:${parentStyles.fontStyle}`);
      console.log(`Herdando estilo do pai: ${parentStyles.fontStyle}`);
    }

    // 5.5. Text decoration - underline
    if (chunk.underline === true) {
      styles.push('text-decoration:underline');
      console.log('Aplicando underline do chunk');
    }

    // 6. Letter spacing (prioridade: chunk > parent)
    if (chunk.letterSpacing) {
      const spacing = sanitizeLetterSpacing(chunk.letterSpacing);
      if (spacing) {
        styles.push(`letter-spacing:${spacing}`);
        console.log(`Aplicando espaçamento do chunk: ${spacing}`);
      }
    } else if (parentStyles?.letterSpacing) {
      const spacing = sanitizeLetterSpacing(parentStyles.letterSpacing);
      if (spacing) {
        styles.push(`letter-spacing:${spacing}`);
        console.log(`Herdando espaçamento do pai: ${spacing}`);
      }
    }

    // 7. Line height (prioridade: chunk > parent)
    if (chunk.lineHeight) {
      const lineHeight = sanitizeLineHeight(chunk.lineHeight);
      if (lineHeight) {
        styles.push(`line-height:${lineHeight}`);
        console.log(`Aplicando line-height do chunk: ${lineHeight}`);
      }
    } else if (parentStyles?.lineHeight) {
      const lineHeight = sanitizeLineHeight(parentStyles.lineHeight);
      if (lineHeight) {
        styles.push(`line-height:${lineHeight}`);
        console.log(`Herdando line-height do pai: ${lineHeight}`);
      }
    }

    // 8. Background color (prioridade: chunk > parent)
    if (chunk.backgroundColor) {
      const bgColor = sanitizeColor(chunk.backgroundColor);
      if (bgColor) {
        styles.push(`background-color:${bgColor}`);
        console.log(`Aplicando background-color do chunk: ${bgColor}`);
      }
    } else if (parentStyles?.backgroundColor) {
      const bgColor = sanitizeColor(parentStyles.backgroundColor);
      if (bgColor) {
        styles.push(`background-color:${bgColor}`);
        console.log(`Herdando background-color do pai: ${bgColor}`);
      }
    }

    // 9. Padding (prioridade: chunk > parent)
    // IMPORTANTE: Adiciona !important quando o padding vem do chunk
    // para garantir que sobrescreva o CSS padrão do template
    if (chunk.padding) {
      const paddingValue = sanitizePadding(chunk.padding);
      if (paddingValue) {
        styles.push(`padding:${paddingValue} !important`);
        console.log(`Aplicando padding do chunk: ${paddingValue} !important`);
      }
    } else if (parentStyles?.padding) {
      const paddingValue = sanitizePadding(parentStyles.padding);
      if (paddingValue) {
        styles.push(`padding:${paddingValue}`);
        console.log(`Herdando padding do pai: ${paddingValue}`);
      }
    }

    // 10. Background Blur (backdrop-filter)
    if (chunk.backgroundBlur) {
      const blurValue = sanitizeBlur(chunk.backgroundBlur);
      if (blurValue) {
        styles.push(`backdrop-filter:blur(${blurValue})`);
        styles.push(`-webkit-backdrop-filter:blur(${blurValue})`);
        styles.push(`border-radius:16px`);

        // Add fading effect on edges using mask
        const fadeAmount = chunk.blurFadeAmount ?? 8;
        const fadeDirection = chunk.blurFadeDirection || 'vertical';

        if (fadeAmount > 0) {
          const fadeEnd = 100 - fadeAmount;

          if (fadeDirection === 'vertical') {
            const fadeGradient = `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
            styles.push(`-webkit-mask-image:${fadeGradient}`);
            styles.push(`mask-image:${fadeGradient}`);
          } else if (fadeDirection === 'horizontal') {
            const fadeGradient = `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
            styles.push(`-webkit-mask-image:${fadeGradient}`);
            styles.push(`mask-image:${fadeGradient}`);
          } else if (fadeDirection === 'both') {
            const vGradient = `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
            const hGradient = `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${fadeEnd}%, transparent 100%)`;
            styles.push(`-webkit-mask-image:${vGradient}, ${hGradient}`);
            styles.push(`mask-image:${vGradient}, ${hGradient}`);
            styles.push(`-webkit-mask-composite:source-in`);
            styles.push(`mask-composite:intersect`);
          }
        }

        console.log(`Aplicando blur do chunk: ${blurValue}`);

        // Apply blur color with opacity if defined
        if (chunk.blurColor) {
          const hexColor = sanitizeColor(chunk.blurColor);
          if (hexColor && hexColor.startsWith('#')) {
            const opacity = typeof chunk.blurOpacity === 'number' ? chunk.blurOpacity : 0.3;
            const hex = hexColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            styles.push(`background-color:rgba(${r}, ${g}, ${b}, ${opacity})`);
            console.log(`Aplicando cor do blur: rgba(${r}, ${g}, ${b}, ${opacity})`);
          }
        }
      }
    }

    // Se há estilos válidos ou lineBreak, cria o HTML
    if (styles.length > 0 || chunk.lineBreak) {
      let html: string;

      if (styles.length > 0) {
        const styleAttr = styles.join(';');
        html = `<span style="${styleAttr}">${escapeHTML(chunk.text)}</span>`;
      } else {
        // Sem estilos, mas com lineBreak
        html = escapeHTML(chunk.text);
      }

      // Adiciona quebra de linha após o chunk se solicitado
      // Usa um span com display:block para garantir quebra visual em todos os contextos
      if (chunk.lineBreak) {
        html += '<span style="display:block;width:100%;height:0.5em"></span>';
        console.log('Adicionando quebra de linha após o chunk');
      }

      console.log('HTML gerado:', html);

      replacements.push({ start: index, end: endIndex, html });
      processedRanges.push({ start: index, end: endIndex });
    } else {
      console.log('SKIP: nenhum estilo válido gerado para este chunk');
    }
  }

  console.log('\n--- Finalizando applyStyledChunks ---');
  console.log('Total de replacements:', replacements.length);

  // Se não há substituições, retorna texto escapado
  if (replacements.length === 0) {
    console.log('RETURN: texto escapado (sem substituições)');
    return escapeHTML(text);
  }

  // Ordena substituições por posição (do final para o início para não afetar índices)
  replacements.sort((a, b) => b.start - a.start);

  // Aplica substituições
  let result = text;
  for (const replacement of replacements) {
    const before = result.substring(0, replacement.start);
    const after = result.substring(replacement.end);
    result = before + replacement.html + after;
  }

  // Escapa partes não processadas do texto
  // Para isso, dividimos em segmentos processados e não processados
  let finalResult = '';
  let lastIndex = 0;

  // Re-ordena substituições por posição inicial (crescente)
  replacements.sort((a, b) => a.start - b.start);

  for (const replacement of replacements) {
    // Adiciona texto antes do replacement (escapado)
    if (replacement.start > lastIndex) {
      finalResult += escapeHTML(text.substring(lastIndex, replacement.start));
    }
    // Adiciona o HTML do replacement
    finalResult += replacement.html;
    lastIndex = replacement.end;
  }

  // Adiciona resto do texto
  if (lastIndex < text.length) {
    finalResult += escapeHTML(text.substring(lastIndex));
  }

  // Se temos chunks E parentStyles, envolvemos tudo em um wrapper com estilos do pai
  // Isso garante que texto não estilizado herde os estilos do campo pai
  if (replacements.length > 0 && parentStyles) {
    const wrapperStyles: string[] = [];

    if (parentStyles.fontFamily) {
      const font = sanitizeFont(parentStyles.fontFamily);
      if (font) wrapperStyles.push(`font-family:${font}`);
    }

    if (parentStyles.color) {
      const color = sanitizeColor(parentStyles.color);
      if (color) wrapperStyles.push(`color:${color}`);
    }

    if (parentStyles.fontSize) {
      const size = sanitizeSize(parentStyles.fontSize);
      if (size) wrapperStyles.push(`font-size:${size}`);
    }

    if (parentStyles.fontWeight) {
      wrapperStyles.push(`font-weight:${parentStyles.fontWeight}`);
    }

    if (parentStyles.fontStyle) {
      wrapperStyles.push(`font-style:${parentStyles.fontStyle}`);
    }

    if (parentStyles.letterSpacing) {
      const spacing = sanitizeLetterSpacing(parentStyles.letterSpacing);
      if (spacing) wrapperStyles.push(`letter-spacing:${spacing}`);
    }

    if (parentStyles.lineHeight) {
      const lineHeight = sanitizeLineHeight(parentStyles.lineHeight);
      if (lineHeight) wrapperStyles.push(`line-height:${lineHeight}`);
    }

    let hasTextAlign = false;
    if (parentStyles.textAlign) {
      const textAlign = parentStyles.textAlign.trim();
      const validAlignments = ['left', 'center', 'right', 'justify'];
      if (validAlignments.includes(textAlign)) {
        wrapperStyles.push(`text-align:${textAlign}`);
        hasTextAlign = true;
      }
    }

    // text-align only works on block-level elements, so add display:block if textAlign is set
    if (hasTextAlign) {
      wrapperStyles.push('display:block');
    }

    if (wrapperStyles.length > 0) {
      finalResult = `<span style="${wrapperStyles.join(';')}">${finalResult}</span>`;
      console.log('Wrapped com estilos do pai para herança');
    }
  }

  console.log('Resultado final:', finalResult);
  console.log('=======================================\n');

  // DEBUG: Check if <br> tags are present in final result
  if (finalResult.includes('<br>')) {
    console.log('✅ DEBUG: <br> tags FOUND in final result');
    console.log('Count:', (finalResult.match(/<br>/g) || []).length);
  } else {
    console.log('❌ DEBUG: NO <br> tags in final result');
  }

  return finalResult;
}

/**
 * Converte sintaxe inline em HTML estilizado
 *
 * @param text - Texto com sintaxe inline: [texto|prop:valor;prop:valor]
 * @returns HTML com spans estilizados
 *
 * @example
 * parseInlineStyles('[Olá|cor:#ff0000] mundo')
 * // Retorna: <span style="color:#ff0000">Olá</span> mundo
 *
 * @example
 * parseInlineStyles('[Título|fonte:arial;tamanho:24;negrito:true]')
 * // Retorna: <span style="font-family:arial;font-size:24px;font-weight:bold">Título</span>
 *
 * @example
 * parseInlineStyles('Texto sem formatação')
 * // Retorna: Texto sem formatação
 */
export function parseInlineStyles(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Regex para capturar [texto|propriedades]
  // Captura texto entre [] e divide em texto e propriedades pelo |
  const inlinePattern = /\[([^\]|]+)\|([^\]]+)\]/g;

  let lastIndex = 0;
  let result = '';
  let match: RegExpExecArray | null;

  // Processa cada match encontrado
  while ((match = inlinePattern.exec(text)) !== null) {
    // Adiciona texto antes do match (não formatado, mas escapado)
    if (match.index > lastIndex) {
      result += escapeHTML(text.substring(lastIndex, match.index));
    }

    const textContent = match[1];
    const properties = match[2];

    // Parse das propriedades (prop:valor;prop:valor)
    const styles: string[] = [];
    const propPairs = properties.split(';');

    for (const pair of propPairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex === -1) continue;

      const prop = pair.substring(0, colonIndex);
      const value = pair.substring(colonIndex + 1);

      const style = propertyToStyle(prop, value);
      if (style) {
        styles.push(style);
      }
    }

    // Gera HTML
    if (styles.length > 0) {
      const styleAttr = styles.join(';');
      result += `<span style="${styleAttr}">${escapeHTML(textContent)}</span>`;
    } else {
      // Se nenhum estilo válido, retorna texto escapado sem span
      result += escapeHTML(textContent);
    }

    lastIndex = inlinePattern.lastIndex;
  }

  // Adiciona resto do texto após último match
  if (lastIndex < text.length) {
    result += escapeHTML(text.substring(lastIndex));
  }

  return result;
}
