/**
 * Processador de estilos de texto para templates
 * Suporta sintaxe: {{field|style1:value1;style2:value2}}
 */

export interface TextStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textTransform?: string;
  [key: string]: string | undefined;
}

/**
 * Parse sintaxe de estilo: "color:red;font-size:20px;font-weight:bold"
 * @param styleString - String de estilos separados por ponto e vírgula
 * @returns Objeto com propriedades CSS
 */
export function parseStyleSyntax(styleString: string): TextStyle {
  const styles: TextStyle = {};

  if (!styleString || !styleString.trim()) {
    return styles;
  }

  // Divide por ponto e vírgula e processa cada par chave:valor
  const stylePairs = styleString.split(';').filter(s => s.trim());

  for (const pair of stylePairs) {
    const [key, value] = pair.split(':').map(s => s.trim());

    if (key && value) {
      // Converte kebab-case para camelCase para propriedades CSS
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styles[camelKey] = value;
    }
  }

  return styles;
}

/**
 * Converte objeto de estilos para string CSS inline
 * @param styles - Objeto com propriedades CSS
 * @returns String CSS inline
 */
export function stylesToCss(styles: TextStyle): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Converte camelCase de volta para kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}:${value}`;
    })
    .join(';');
}

/**
 * Sanitiza HTML permitindo apenas tags seguras
 * @param html - String HTML para sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHTML(html: string): string {
  // Lista de tags permitidas
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'span', 'br'];
  const allowedAttributes = ['style', 'class'];

  // Remove tags script e style completamente
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove tags não permitidas
  sanitized = sanitized.replace(/<(\/?)([\w]+)([^>]*)>/g, (_match, slash, tagName, attributes) => {
    const tag = tagName.toLowerCase();

    // Se não é uma tag permitida, remove
    if (!allowedTags.includes(tag)) {
      return '';
    }

    // Para tags de fechamento, apenas retorna
    if (slash === '/') {
      return `</${tag}>`;
    }

    // Processa atributos se houver
    if (!attributes || !attributes.trim()) {
      return `<${tag}>`;
    }

    // Filtra atributos permitidos
    const cleanAttributes = attributes
      .match(/(\w+)\s*=\s*"([^"]*)"/g)
      ?.filter((attr: string) => {
        const attrName = attr.split('=')[0].trim().toLowerCase();
        return allowedAttributes.includes(attrName);
      })
      .join(' ');

    return cleanAttributes ? `<${tag} ${cleanAttributes}>` : `<${tag}>`;
  });

  // Remove atributos JavaScript (on*)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');

  return sanitized;
}

/**
 * Aplica estilos inline a um texto, envolvendo em span se necessário
 * @param text - Texto a ser estilizado
 * @param styles - Objeto de estilos CSS
 * @returns HTML com estilos aplicados
 */
export function applyInlineStyles(text: string, styles: TextStyle): string {
  if (!text) return '';

  // text-align only works on block-level elements, so add display:block if textAlign is set
  if (styles.textAlign && !styles.display) {
    styles = { ...styles, display: 'block' };
  }

  const cssString = stylesToCss(styles);

  if (!cssString) {
    return text;
  }

  return `<span style="${cssString}">${text}</span>`;
}

/**
 * Detecta se uma string contém HTML tags
 * @param text - String para verificar
 * @returns true se contém tags HTML
 */
export function containsHTML(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Processa texto com sintaxe de estilo: {{field|style1:value1;style2:value2}}
 * @param value - Valor do campo
 * @param styleString - String de estilos (opcional)
 * @returns HTML processado com estilos aplicados
 */
export function processStyledText(value: string, styleString?: string): string {
  if (!value) return '';

  let processedText = value;

  // 1. Se contém HTML, sanitiza
  if (containsHTML(processedText)) {
    processedText = sanitizeHTML(processedText);
  } else {
    // 2. Se é texto puro, faz escape HTML
    processedText = escapeHTML(processedText);
  }

  // 3. Se tem estilos, aplica
  if (styleString) {
    const styles = parseStyleSyntax(styleString);
    if (Object.keys(styles).length > 0) {
      processedText = applyInlineStyles(processedText, styles);
    }
  }

  return processedText;
}

/**
 * Escapa caracteres HTML especiais
 * @param text - Texto para escapar
 * @returns Texto com caracteres escapados
 */
export function escapeHTML(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
