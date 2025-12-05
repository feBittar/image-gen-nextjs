import fs from 'fs';
import path from 'path';
import {
  CarouselSlideNew,
  CarouselSlideOld,
  DestaqueChunk,
  DestaquesNew,
  CarouselDataNewFormat,
} from '@/lib/schemas/carouselSchema';
import { StackTemplateFormData } from '@/lib/schemas/stackTemplate';
import { FitFeedCapaTemplateFormData } from '@/lib/schemas/fitfeedCapaTemplate';

/**
 * Interface for styled chunk used in text highlighting
 */
interface StyledChunk {
  text: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  bold?: boolean;
  italic?: boolean;
  letterSpacing?: string;
  backgroundColor?: string;
  padding?: string;
}

/**
 * Recursively restores typographic quotes in all string values of an object
 */
function restoreTypographicQuotes(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/__LQUOTE__/g, '\u201C')  // Left double quote "
      .replace(/__RQUOTE__/g, '\u201D')  // Right double quote "
      .replace(/__LSQUOTE__/g, '\u2018') // Left single quote '
      .replace(/__RSQUOTE__/g, '\u2019'); // Right single quote '
  }
  if (Array.isArray(obj)) {
    return obj.map(restoreTypographicQuotes);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = restoreTypographicQuotes(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Loads base layout JSON from templates/layouts directory
 * @param estilo - Layout style name (e.g., 'stack-img', 'stack-img-bg')
 * @returns Parsed layout object or null if not found
 */
export function loadLayoutBase(estilo: string): Partial<StackTemplateFormData> | undefined {
  try {
    const layoutsDir = path.join(process.cwd(), 'templates', 'layouts');
    const layoutPath = path.join(layoutsDir, `${estilo}.json`);

    console.log(`[loadLayoutBase] Loading layout: ${layoutPath}`);

    if (!fs.existsSync(layoutPath)) {
      console.error(`[loadLayoutBase] Layout file not found: ${layoutPath}`);
      return undefined;
    }

    let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    // Replace typographic quotes with placeholders before JSON parse
    // This handles curly/smart quotes that can break JSON parsing
    layoutContent = layoutContent
      .replace(/\u201C/g, '__LQUOTE__')   // Left double quote "
      .replace(/\u201D/g, '__RQUOTE__')   // Right double quote "
      .replace(/\u2018/g, '__LSQUOTE__')  // Left single quote '
      .replace(/\u2019/g, '__RSQUOTE__'); // Right single quote '

    const layoutData = JSON.parse(layoutContent);

    // Restore typographic quotes in all string values
    const restoredData = restoreTypographicQuotes(layoutData);

    console.log(`[loadLayoutBase] Successfully loaded layout: ${estilo}`);
    return restoredData;
  } catch (error) {
    console.error(`[loadLayoutBase] Error loading layout "${estilo}":`, error);
    return undefined;
  }
}

/**
 * Sanitizes text input to prevent XSS attacks
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  // Remove potentially dangerous characters but preserve basic punctuation
  return text.replace(/[<>{}]/g, '');
}

/**
 * Converts highlight chunks (new format) to styled chunks
 * Processes DestaqueChunk objects with tipo and cor properties
 *
 * @param text - Full text content
 * @param destaqueChunks - Array of destaque chunk objects with tipo and cor
 * @param highlightColor - Color to apply when cor is true
 * @param useBoldOnly - If true, ignore cor flag and only apply bold
 * @returns Array of styled chunks
 */
export function convertDestaquesNew(
  text: string,
  destaqueChunks: DestaqueChunk[],
  highlightColor: string,
  useBoldOnly: boolean = false
): StyledChunk[] {
  if (!text || !destaqueChunks || destaqueChunks.length === 0) {
    return [];
  }

  const chunks: StyledChunk[] = [];
  const sanitizedText = sanitizeText(text);

  console.log(`[convertDestaquesNew] Processing text: "${sanitizedText.substring(0, 50)}..."`);
  console.log(`[convertDestaquesNew] Destaques: ${JSON.stringify(destaqueChunks)}`);
  console.log(`[convertDestaquesNew] Mode: ${useBoldOnly ? 'BOLD ONLY' : 'WITH COLOR'}`);
  console.log(`[convertDestaquesNew] Highlight color to use: ${highlightColor}`);

  for (const chunk of destaqueChunks) {
    const sanitizedTrecho = sanitizeText(chunk.trecho);
    const index = sanitizedText.indexOf(sanitizedTrecho);

    if (index !== -1) {
      const styledChunk: StyledChunk = {
        text: sanitizedTrecho,
      };

      // Apply styling based on tipo
      if (chunk.tipo === 'bold' || chunk.tipo === 'bold+italic') {
        styledChunk.bold = true;
      }
      if (chunk.tipo === 'italic' || chunk.tipo === 'bold+italic') {
        styledChunk.italic = true;
      }

      // Handle bg4: background color with 4px padding
      // Supports tags: "bg4", "bg4 primary" (uses highlightColor), "bg4 secondary" (uses white)
      if (chunk.tipo.startsWith('bg4')) {
        const isSecondary = chunk.tipo.includes('secondary');
        const bgColor = isSecondary ? '#ffffff' : highlightColor;
        styledChunk.backgroundColor = bgColor;
        styledChunk.padding = '4px';
        console.log(`[convertDestaquesNew] Applied bg4 styling: backgroundColor=${bgColor} (${isSecondary ? 'secondary' : 'primary'}), padding=4px`);
      }

      // Apply color if cor is true and not in bold-only mode (for non-bg4 tipos)
      if (chunk.cor && !useBoldOnly && !chunk.tipo.startsWith('bg4')) {
        styledChunk.color = highlightColor;
      }

      chunks.push(styledChunk);
      console.log(`[convertDestaquesNew] Created chunk: "${sanitizedTrecho}" - ${chunk.tipo}, color: ${chunk.cor}`);
    } else {
      console.warn(`[convertDestaquesNew] Trecho not found in text: "${sanitizedTrecho}"`);
    }
  }

  return chunks;
}

/**
 * Converts highlight strings to styled chunks (OLD FORMAT - for backwards compatibility)
 * Finds each highlight within the text and creates a chunk with the specified styling
 *
 * @param text - Full text content
 * @param highlights - Array of strings to highlight
 * @param color - Color to apply to highlights (ignored if useBoldOnly is true)
 * @param useBoldOnly - If true, apply only bold instead of color
 * @returns Array of styled chunks
 */
export function convertDestaquesOld(
  text: string,
  highlights: string[],
  color: string,
  useBoldOnly: boolean = false
): StyledChunk[] {
  if (!text || !highlights || highlights.length === 0) {
    return [];
  }

  const chunks: StyledChunk[] = [];

  // Sanitize inputs
  const sanitizedText = sanitizeText(text);
  const sanitizedHighlights = highlights.map(h => sanitizeText(h)).filter(h => h.length > 0);

  console.log(`[convertDestaquesOld] Processing text: "${sanitizedText.substring(0, 50)}..."`);
  console.log(`[convertDestaquesOld] Highlights: ${JSON.stringify(sanitizedHighlights)}`);
  console.log(`[convertDestaquesOld] Mode: ${useBoldOnly ? 'BOLD ONLY' : 'COLOR'}`);

  // Find each highlight in the text and create chunks
  for (const highlight of sanitizedHighlights) {
    const index = sanitizedText.indexOf(highlight);
    if (index !== -1) {
      if (useBoldOnly) {
        // For stack-img-bg: only add bold, keep text white
        chunks.push({
          text: highlight,
          bold: true,
        });
        console.log(`[convertDestaquesOld] Created BOLD chunk for: "${highlight}"`);
      } else {
        // For stack-img: add color
        chunks.push({
          text: highlight,
          color: color,
        });
        console.log(`[convertDestaquesOld] Created COLOR chunk for: "${highlight}" with color: ${color}`);
      }
    } else {
      console.warn(`[convertDestaquesOld] Highlight not found in text: "${highlight}"`);
    }
  }

  return chunks;
}

/**
 * Transforms a single carousel slide into a complete layout object
 *
 * @param slide - Carousel slide data from AI (new or old format)
 * @param layoutBase - Base layout configuration
 * @param highlightColor - Color to use for text highlights (light themes)
 * @param highlightColorSecondary - Color to use for text highlights on dark themes (-b variants)
 * @param externalDestaques - Optional external destaques (new format with separate array)
 * @returns Complete layout data ready for image generation
 */
export function transformSlide(
  slide: CarouselSlideNew | CarouselSlideOld,
  layoutBase: Partial<StackTemplateFormData>,
  highlightColor: string = '#ff0000',
  highlightColorSecondary: string = '#ffffff',
  externalDestaques?: DestaquesNew
): StackTemplateFormData {
  console.log(`\n[transformSlide] Processing slide #${slide.numero} with style: ${slide.estilo}`);

  // Check if estilo contains "reverse"
  const isReverse = slide.estilo.toLowerCase().includes('reverse');
  if (isReverse) {
    console.log(`[transformSlide] Detected REVERSE layout for slide #${slide.numero}`);
  }

  // Determine if this layout uses bold-only highlights (for stack-img and black variants)
  // Extract base style name (remove "reverse" suffix)
  const baseEstilo = slide.estilo.replace(/\s+reverse$/i, '').trim();

  // Check if this is a FitFeed layout (ff_*) - these are complete layouts that only need text replacement
  const isFitFeedLayout = baseEstilo.startsWith('ff_');

  // Determine highlight color based on variant:
  // - Light themes: use primary highlightColor
  // - Dark themes (-b variants): use secondary highlightColor
  // - stack-img (photo background): use bold-only (no color)
  const isBlackVariant = baseEstilo.endsWith('-b');
  const useBoldOnly = baseEstilo === 'stack-img'; // Only stack-img uses bold-only (has photo background)
  const effectiveHighlightColor = isBlackVariant ? highlightColorSecondary : highlightColor;
  console.log(`[transformSlide] Base estilo: ${baseEstilo}, FitFeed: ${isFitFeedLayout}, Black variant: ${isBlackVariant}`);
  console.log(`[transformSlide] Primary color: ${highlightColor}, Secondary color: ${highlightColorSecondary}`);
  console.log(`[transformSlide] Highlight mode: ${useBoldOnly ? 'BOLD ONLY' : 'COLOR'}, Effective color: ${effectiveHighlightColor}`);

  // Start with base layout - deep copy to avoid mutations
  const layout: any = JSON.parse(JSON.stringify(layoutBase));

  // For stack-img/stack-img-bg: clear styledChunks to avoid pollution from template
  // For FitFeed layouts: keep the styledChunks from the layout base
  if (!isFitFeedLayout) {
    layout.text1StyledChunks = [];
    layout.text2StyledChunks = [];
    layout.text3StyledChunks = [];
    layout.text4StyledChunks = [];
    layout.text5StyledChunks = [];
    console.log('[transformSlide] Cleared all template base styledChunks');

    // Initialize customCardContainerStyles and customContentImageSectionStyles
    layout.customCardContainerStyles = '';
    layout.customContentImageSectionStyles = '';
  } else {
    console.log('[transformSlide] Keeping styledChunks and custom styles for FitFeed layout');
  }

  // Apply reverse layout styles if needed (only for stack-img/stack-img-bg, not FitFeed)
  if (isReverse && !isFitFeedLayout) {
    layout.customCardContainerStyles = 'flex-direction: column-reverse; justify-content: flex-end;';
    layout.customContentImageSectionStyles = 'margin-top: 5%;';

    // Swap textPaddingTop with textPaddingBottom when layout is reversed
    // This ensures proper spacing when the layout direction is inverted
    const tempPaddingTop = layout.textPaddingTop;
    const tempPaddingBottom = layout.textPaddingBottom;

    if (tempPaddingTop !== undefined) {
      layout.textPaddingBottom = tempPaddingTop;
    }
    if (tempPaddingBottom !== undefined) {
      layout.textPaddingTop = tempPaddingBottom;
    }
    // If only textPaddingTop was set (e.g., 50px), it becomes textPaddingBottom
    if (tempPaddingTop !== undefined && tempPaddingBottom === undefined) {
      layout.textPaddingTop = 0; // Remove top padding when reversed
    }

    console.log('[transformSlide] Applied reverse layout styles to card-container and content-image-section');
    console.log(`[transformSlide] Swapped padding - textPaddingTop: ${layout.textPaddingTop}, textPaddingBottom: ${layout.textPaddingBottom}`);
  }

  // For stack-img (with background photo), override text colors to white and ensure gradient
  // Note: ff_stack*-b layouts already have white text defined in their JSON, no override needed
  if (baseEstilo === 'stack-img') {
    console.log(`[transformSlide] Overriding text colors to white for stack-img`);
    layout.text1Style = { ...layout.text1Style, color: '#ffffff' };
    layout.text2Style = { ...layout.text2Style, color: '#ffffff' };
    layout.text3Style = { ...layout.text3Style, color: '#ffffff' };
    layout.text4Style = { ...layout.text4Style, color: '#ffffff' };
    layout.text5Style = { ...layout.text5Style, color: '#ffffff' };

    // Ensure gradient overlay is enabled (for background photo visibility)
    // Create a deep copy to avoid mutating the base layout
    if (!layout.cardGradientOverlay || typeof layout.cardGradientOverlay !== 'object') {
      layout.cardGradientOverlay = {
        enabled: true,
        color: '#000000',
        startOpacity: 0.7,
        midOpacity: 0.4,
        height: 60,
        direction: 'to top'
      };
    } else {
      // Deep copy the gradient to avoid mutation
      layout.cardGradientOverlay = {
        ...layout.cardGradientOverlay,
        enabled: true,
        color: layout.cardGradientOverlay.color || '#000000',
        startOpacity: layout.cardGradientOverlay.startOpacity ?? 0.7,
        midOpacity: layout.cardGradientOverlay.midOpacity ?? 0.4,
        height: layout.cardGradientOverlay.height ?? 60,
        direction: layout.cardGradientOverlay.direction || 'to top'
      };
    }
    console.log(`[transformSlide] Gradient overlay configured:`, layout.cardGradientOverlay);
  }

  // Determine which destaques to use: external (new format) or inline (old format)
  // Use 'any' to handle union of incompatible types (DestaquesNew with DestaqueChunk[] vs DestaquesOld with string[])
  const destaquesToUse: any = externalDestaques || ('destaques' in slide ? slide.destaques : undefined);

  console.log(`[transformSlide] Using ${externalDestaques ? 'NEW' : 'OLD'} destaques format`);

  // Check if slide has texto_principal defined
  const textoPrincipal = 'texto_principal' in slide ? slide.texto_principal : undefined;
  if (textoPrincipal) {
    console.log(`[transformSlide] Texto principal detected: ${textoPrincipal}`);
  }

  // Map texto_N to textN fields
  const textMappings = [
    { from: 'texto_1', to: 'text1', chunksKey: 'text1StyledChunks', styleKey: 'text1Style' },
    { from: 'texto_2', to: 'text2', chunksKey: 'text2StyledChunks', styleKey: 'text2Style' },
    { from: 'texto_3', to: 'text3', chunksKey: 'text3StyledChunks', styleKey: 'text3Style' },
    { from: 'texto_4', to: 'text4', chunksKey: 'text4StyledChunks', styleKey: 'text4Style' },
    { from: 'texto_5', to: 'text5', chunksKey: 'text5StyledChunks', styleKey: 'text5Style' },
  ];

  // Process each text field
  for (const mapping of textMappings) {
    const sourceKey = mapping.from as keyof CarouselSlideNew;
    const textValue = slide[sourceKey];
    const isTextoPrincipal = textoPrincipal === mapping.from;

    if (textValue && typeof textValue === 'string' && textValue.trim()) {
      // Sanitize and assign text
      layout[mapping.to] = sanitizeText(textValue);
      console.log(`[transformSlide] Mapped ${mapping.from} -> ${mapping.to}: "${textValue.substring(0, 50)}..."${isTextoPrincipal ? ' [PRINCIPAL]' : ''}`);

      // Apply texto_principal styling: +12px fontSize and bold weight
      if (isTextoPrincipal && layout[mapping.styleKey]) {
        const currentStyle = layout[mapping.styleKey];
        const currentFontSize = currentStyle.fontSize || '36px';
        const currentFontSizeNum = parseInt(currentFontSize);
        const newFontSize = `${currentFontSizeNum + 12}px`;

        layout[mapping.styleKey] = {
          ...currentStyle,
          fontSize: newFontSize,
          fontWeight: '700', // bold by default
        };

        console.log(`[transformSlide] Applied texto_principal styling: fontSize ${currentFontSize} -> ${newFontSize}, fontWeight -> 700`);
      }

      // Process highlights if they exist
      if (destaquesToUse) {
        const destaquesKey = mapping.from;
        const highlights = destaquesToUse[destaquesKey];

        if (highlights && Array.isArray(highlights) && highlights.length > 0) {
          let styledChunks: StyledChunk[] = [];

          // Type guard: check if first element is a DestaqueChunk or string
          const isDestaqueChunkArray = typeof highlights[0] === 'object' && 'trecho' in highlights[0];

          if (isDestaqueChunkArray) {
            // New format: highlights are DestaqueChunk[]
            styledChunks = convertDestaquesNew(textValue, highlights as DestaqueChunk[], effectiveHighlightColor, useBoldOnly);
          } else {
            // Old format: highlights are string[]
            styledChunks = convertDestaquesOld(textValue, highlights as string[], effectiveHighlightColor, useBoldOnly);
          }

          // If this is texto_principal, upgrade bold to black (900)
          if (isTextoPrincipal && styledChunks.length > 0) {
            styledChunks = styledChunks.map(chunk => {
              if (chunk.bold) {
                console.log(`[transformSlide] Upgrading bold to black (900) for texto_principal chunk: "${chunk.text}"`);
                return { ...chunk, fontWeight: '900' }; // black instead of bold
              }
              return chunk;
            });
          }

          if (styledChunks.length > 0) {
            layout[mapping.chunksKey] = styledChunks;
            console.log(`[transformSlide] Added ${styledChunks.length} styled chunks to ${mapping.chunksKey}`);
          }
        }
      }
    } else {
      // For FitFeed layouts: keep the default text from layout base
      // For stack-img/stack-img-bg: clear empty fields to remove template defaults
      if (!isFitFeedLayout) {
        layout[mapping.to] = '';
        layout[mapping.chunksKey] = [];
        console.log(`[transformSlide] Cleared ${mapping.to} and ${mapping.chunksKey} (no value in slide)`);
      } else {
        console.log(`[transformSlide] Keeping default ${mapping.to} for FitFeed layout`);
      }
    }
  }

  console.log(`[transformSlide] Completed slide #${slide.numero}`);
  return layout as StackTemplateFormData;
}

/**
 * Transforms a carousel slide with ff_capa estilo into a FitFeedCapaTemplateFormData layout
 *
 * @param slide - Carousel slide data from AI (new or old format)
 * @param layoutBase - Base layout configuration for fitfeed-capa
 * @param highlightColor - Color to use for text highlights
 * @param externalDestaques - Optional external destaques (new format with separate array)
 * @returns Complete layout data ready for image generation
 */
export function transformSlideFitFeedCapa(
  slide: CarouselSlideNew | CarouselSlideOld,
  layoutBase: Partial<FitFeedCapaTemplateFormData>,
  highlightColor: string = '#ff0000',
  externalDestaques?: DestaquesNew
): FitFeedCapaTemplateFormData {
  console.log(`\n[transformSlideFitFeedCapa] Processing slide #${slide.numero} as fitfeed-capa`);

  // Deep copy layout base to avoid mutations
  const layout: any = JSON.parse(JSON.stringify(layoutBase));

  // Map titulo from slide to title in template
  // If titulo is not provided, fall back to texto_1
  const titulo = 'titulo' in slide && slide.titulo ? slide.titulo : slide.texto_1;
  if (titulo) {
    layout.title = sanitizeText(titulo);
    console.log(`[transformSlideFitFeedCapa] Mapped title: "${layout.title.substring(0, 50)}..."`);
  }

  // Process titleSpecialStyling if defined in slide
  if ('titleSpecialStyling' in slide && slide.titleSpecialStyling) {
    layout.titleSpecialStyling = slide.titleSpecialStyling;
    console.log(`[transformSlideFitFeedCapa] Applied titleSpecialStyling with ${slide.titleSpecialStyling.lineStyles?.length || 0} line styles`);
  }

  // Process destaques for titleStyledChunks (only if not using titleSpecialStyling)
  const useSpecialStyling = layout.titleSpecialStyling?.enabled;
  if (!useSpecialStyling) {
    // Check for external destaques (new format) or inline destaques (old format)
    const destaquesToUse: any = externalDestaques || ('destaques' in slide ? slide.destaques : undefined);

    if (destaquesToUse?.titulo && Array.isArray(destaquesToUse.titulo) && destaquesToUse.titulo.length > 0) {
      const highlights = destaquesToUse.titulo;

      // Type guard: check if first element is a DestaqueChunk or string
      const isDestaqueChunkArray = typeof highlights[0] === 'object' && 'trecho' in highlights[0];

      let styledChunks: StyledChunk[] = [];
      if (isDestaqueChunkArray) {
        styledChunks = convertDestaquesNew(layout.title, highlights as DestaqueChunk[], highlightColor, false);
      } else {
        styledChunks = convertDestaquesOld(layout.title, highlights as string[], highlightColor, false);
      }

      if (styledChunks.length > 0) {
        layout.titleStyledChunks = styledChunks;
        console.log(`[transformSlideFitFeedCapa] Added ${styledChunks.length} styled chunks to title`);
      }
    }
  }

  console.log(`[transformSlideFitFeedCapa] Completed slide #${slide.numero}`);
  return layout as FitFeedCapaTemplateFormData;
}

/**
 * Interface for card gradient overlay configuration
 */
export interface CardGradientConfig {
  color?: string;
  startOpacity?: number;
  midOpacity?: number;
  height?: number;
  direction?: string;
}

/**
 * Transforms entire carousel JSON into array of layout objects
 *
 * @param aiJSON - Carousel data from AI (validated, new or legacy format)
 * @param highlightColor - Color to use for text highlights on light themes (default: #ff0000)
 * @param highlightColorSecondary - Color to use for text highlights on dark themes (-b variants, default: #ffffff)
 * @param cardGradient - Optional card gradient overlay configuration
 * @returns Array of complete layout objects ready for image generation
 * @throws Error if layout files are missing or invalid
 */
export function transformCarousel(
  aiJSON: CarouselDataNewFormat | any,
  highlightColor: string = '#ff0000',
  highlightColorSecondary: string = '#ffffff',
  cardGradient?: CardGradientConfig
): (StackTemplateFormData | FitFeedCapaTemplateFormData)[] {
  // Support both new format (carousel.copy.slides) and legacy format (carrossel.slides)
  const slides = aiJSON.carousel?.copy?.slides || aiJSON.carrossel?.slides || [];
  const photos = aiJSON.carousel?.photos || [];
  const destaquesArray = aiJSON.carousel?.destaques || []; // NEW: separate destaques array

  console.log(`\n[transformCarousel] Starting transformation of ${slides.length} slides`);
  console.log(`[transformCarousel] Photos available: ${photos.length}`);
  console.log(`[transformCarousel] Destaques available: ${destaquesArray.length}`);
  console.log(`[transformCarousel] Highlight color: ${highlightColor}`);
  console.log(`[transformCarousel] Highlight color secondary: ${highlightColorSecondary}`);

  // Create a photo map for quick lookup by slide number
  // Store both portrait and landscape URLs
  const photoMap = new Map<number, { portrait?: string; landscape?: string; original?: string }>();
  for (const photoItem of photos) {
    const slideNumber = photoItem.slide;
    const src = photoItem.photo?.src;
    if (slideNumber && src) {
      photoMap.set(slideNumber, {
        portrait: src.portrait,
        landscape: src.landscape,
        original: src.original,
      });
      console.log(`[transformCarousel] Mapped photo to slide #${slideNumber}:`, {
        portrait: src.portrait ? 'YES' : 'NO',
        landscape: src.landscape ? 'YES' : 'NO',
        original: src.original ? 'YES' : 'NO',
      });
    }
  }

  // Create a destaques map for quick lookup by slide number (NEW FORMAT)
  const destaquesMap = new Map<number, DestaquesNew>();
  for (const destaqueItem of destaquesArray) {
    if (destaqueItem.numero && destaqueItem.destaques) {
      destaquesMap.set(destaqueItem.numero, destaqueItem.destaques);
      console.log(`[transformCarousel] Mapped destaques to slide #${destaqueItem.numero}`);
    }
  }

  // Use union type to support both Stack and FitFeedCapa layouts
  const layouts: (StackTemplateFormData | FitFeedCapaTemplateFormData)[] = [];
  const loadedLayouts = new Map<string, Partial<StackTemplateFormData | FitFeedCapaTemplateFormData>>();
  const totalSlides = slides.length;

  for (const slide of slides) {
    console.log(`\n--- Processing Slide #${slide.numero} ---`);

    // Extract base estilo (remove "reverse" suffix for file lookup)
    const baseEstilo = slide.estilo.replace(/\s+reverse$/i, '').trim();
    console.log(`[transformCarousel] Base estilo for layout loading: ${baseEstilo}`);

    // Check if this is a FitFeed Capa layout
    const isFitFeedCapa = baseEstilo === 'ff_capa';
    // Check if this is any FitFeed layout (including ff_stack* and ff_capa)
    const isFitFeedLayout = baseEstilo.startsWith('ff_');

    // Load layout base (cache to avoid reloading)
    let layoutBase = loadedLayouts.get(baseEstilo);
    if (!layoutBase) {
      const loadedLayout = loadLayoutBase(baseEstilo);
      if (!loadedLayout) {
        throw new Error(`Failed to load layout template: ${baseEstilo}`);
      }
      layoutBase = loadedLayout;
      loadedLayouts.set(baseEstilo, layoutBase);
    }

    // Get external destaques for this slide (if using new format)
    const externalDestaques = destaquesMap.get(slide.numero);

    // Get photo sources for this slide
    const photoSources = photoMap.get(slide.numero);

    // Transform slide based on template type
    let layout: StackTemplateFormData | FitFeedCapaTemplateFormData;

    if (isFitFeedCapa) {
      // Use specialized transformer for fitfeed-capa
      layout = transformSlideFitFeedCapa(
        slide,
        layoutBase as Partial<FitFeedCapaTemplateFormData>,
        highlightColor,
        externalDestaques
      );

      // For ff_capa, add photo as viewportBackgroundImage
      if (photoSources) {
        const selectedPhotoUrl = photoSources.landscape || photoSources.portrait || photoSources.original;
        if (selectedPhotoUrl) {
          (layout as FitFeedCapaTemplateFormData).viewportBackgroundImage = selectedPhotoUrl;
          console.log(`[transformCarousel] Added photo as VIEWPORT BACKGROUND to ff_capa slide #${slide.numero}`);
          console.log(`[transformCarousel] URL: ${selectedPhotoUrl.substring(0, 80)}...`);
        }
      }
    } else {
      // Use standard transformer for stack and ff_stack* templates
      layout = transformSlide(slide, layoutBase as Partial<StackTemplateFormData>, highlightColor, highlightColorSecondary, externalDestaques);

      // Add dynamic slide counter to freeText1 (only for stack-img/stack-img-bg layouts)
      if (!isFitFeedLayout) {
        (layout as StackTemplateFormData).freeText1 = `${slide.numero}/${totalSlides}`;
        console.log(`[transformCarousel] Set slide counter: ${(layout as StackTemplateFormData).freeText1}`);
      } else {
        console.log(`[transformCarousel] Skipping slide counter for FitFeed layout`);
      }

      // Add photo URL if available for this slide
      if (photoSources) {
        let selectedPhotoUrl: string | undefined;

        // stack-img: use portrait (vertical photo) as card background
        // stack-img-bg: use landscape (horizontal photo) as content image
        // ff_stack*: use landscape (horizontal photo) as content image
        if (baseEstilo === 'stack-img') {
          selectedPhotoUrl = photoSources.portrait || photoSources.original;
          if (selectedPhotoUrl) {
            (layout as StackTemplateFormData).cardBackgroundImage = selectedPhotoUrl;
            console.log(`[transformCarousel] Added PORTRAIT photo as CARD BACKGROUND to slide #${slide.numero}`);
            console.log(`[transformCarousel] URL: ${selectedPhotoUrl.substring(0, 80)}...`);
          }
        } else if (baseEstilo === 'stack-img-bg' || isFitFeedLayout) {
          // FitFeed stack layouts use content image like stack-img-bg
          selectedPhotoUrl = photoSources.landscape || photoSources.original;
          if (selectedPhotoUrl) {
            (layout as StackTemplateFormData).contentImageUrl = selectedPhotoUrl;
            console.log(`[transformCarousel] Added LANDSCAPE photo as CONTENT IMAGE to slide #${slide.numero}`);
            console.log(`[transformCarousel] URL: ${selectedPhotoUrl.substring(0, 80)}...`);
          }
        }

        if (!selectedPhotoUrl) {
          console.warn(`[transformCarousel] No suitable photo found for slide #${slide.numero} (estilo: ${baseEstilo})`);
        }
      }

      // Apply custom card gradient configuration if provided (not for FitFeed layouts)
      if (cardGradient && (layout as StackTemplateFormData).cardGradientOverlay && !isFitFeedLayout) {
        console.log(`[transformCarousel] Applying custom gradient config to slide #${slide.numero}`);
        const stackLayout = layout as StackTemplateFormData;
        stackLayout.cardGradientOverlay = {
          ...stackLayout.cardGradientOverlay,
          color: cardGradient.color ?? stackLayout.cardGradientOverlay?.color,
          startOpacity: cardGradient.startOpacity ?? stackLayout.cardGradientOverlay?.startOpacity,
          midOpacity: cardGradient.midOpacity ?? stackLayout.cardGradientOverlay?.midOpacity,
          height: cardGradient.height ?? stackLayout.cardGradientOverlay?.height,
          direction: (cardGradient.direction as "to top" | "to bottom" | "to right" | "to left" | undefined) ?? stackLayout.cardGradientOverlay?.direction,
        };
        console.log(`[transformCarousel] Updated gradient:`, stackLayout.cardGradientOverlay);
      }
    }

    layouts.push(layout);
  }

  console.log(`\n[transformCarousel] Successfully transformed ${layouts.length} slides`);
  return layouts;
}

/**
 * Convenience function to transform and validate carousel data in one step
 *
 * @param carouselData - Raw carousel data from AI
 * @param highlightColor - Color to use for text highlights on light themes
 * @param highlightColorSecondary - Color to use for text highlights on dark themes (-b variants)
 * @param cardGradient - Optional card gradient overlay configuration
 * @returns Object with success status and layouts or error message
 */
export function processCarouselData(
  carouselData: any,
  highlightColor: string = '#ff0000',
  highlightColorSecondary: string = '#ffffff',
  cardGradient?: CardGradientConfig
): { success: true; layouts: (StackTemplateFormData | FitFeedCapaTemplateFormData)[] } | { success: false; error: string } {
  try {
    // Import validation here to avoid circular dependencies
    const { validateCarouselData } = require('@/lib/schemas/carouselSchema');

    // Validate input
    const validated = validateCarouselData(carouselData);

    // Transform to layouts
    const layouts = transformCarousel(validated, highlightColor, highlightColorSecondary, cardGradient);

    return { success: true, layouts };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during carousel processing';
    console.error('[processCarouselData] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
