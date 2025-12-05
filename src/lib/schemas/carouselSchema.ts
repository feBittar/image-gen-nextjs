import { z } from 'zod';

/**
 * Schema for individual highlight chunk (new format)
 */
const destaqueChunkSchema = z.object({
  trecho: z.string(),
  tipo: z.enum(['bold', 'italic', 'bold+italic', 'bg4', 'bg4 primary', 'bg4 secondary']),
  cor: z.boolean(), // true to apply highlight color, false for just styling
});

/**
 * Schema for carousel slide destaques (highlights) - OLD FORMAT
 * Maps text field names to arrays of strings to highlight
 */
const destaquesSchemaOld = z.object({
  texto_1: z.array(z.string()).optional(),
  texto_2: z.array(z.string()).optional(),
  texto_3: z.array(z.string()).optional(),
  texto_4: z.array(z.string()).optional(),
  texto_5: z.array(z.string()).optional(),
  titulo: z.array(z.string()).optional(), // For ff_capa template
}).optional();

/**
 * Schema for carousel slide destaques (highlights) - NEW FORMAT
 * Maps text field names to arrays of highlight chunk objects
 */
const destaquesSchemaNew = z.object({
  texto_1: z.array(destaqueChunkSchema).optional(),
  texto_2: z.array(destaqueChunkSchema).optional(),
  texto_3: z.array(destaqueChunkSchema).optional(),
  texto_4: z.array(destaqueChunkSchema).optional(),
  texto_5: z.array(destaqueChunkSchema).optional(),
  titulo: z.array(destaqueChunkSchema).optional(), // For ff_capa template
}).optional();

/**
 * Schema for line style (used in titleSpecialStyling)
 */
const lineStyleSchema = z.object({
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  fontWeight: z.string().optional(),
  padding: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  letterSpacing: z.string().optional(),
  textShadow: z.string().optional(),
});

/**
 * Schema for special styling configuration (per-line styles for ff_capa)
 */
const titleSpecialStylingSchema = z.object({
  enabled: z.boolean(),
  lineStyles: z.array(lineStyleSchema).optional(),
}).optional();

/**
 * Valid estilo values for carousel slides
 */
const validEstilos = [
  'stack-img', 'stack-img-bg', 'stack-img reverse', 'stack-img-bg reverse',
  'ff_stack1', 'ff_stack1-b', 'ff_stack2', 'ff_stack2-b',
  'ff_capa' // FitFeed cover template
];

/**
 * Schema for a single carousel slide (old format with inline destaques)
 */
const carouselSlideSchemaOld = z.object({
  numero: z.number().int().positive(),
  estilo: z.string().refine(
    (val) => validEstilos.includes(val),
    { message: `estilo must be one of: ${validEstilos.join(', ')}` }
  ),
  texto_1: z.string().optional(),
  texto_2: z.string().optional(),
  texto_3: z.string().optional(),
  texto_4: z.string().optional(),
  texto_5: z.string().optional(),
  texto_principal: z.enum(['texto_1', 'texto_2', 'texto_3', 'texto_4', 'texto_5']).optional(),
  // Fields specific to ff_capa template
  titulo: z.string().optional(),
  titleSpecialStyling: titleSpecialStylingSchema,
  destaques: destaquesSchemaOld,
});

/**
 * Schema for a single carousel slide (new format without inline destaques)
 */
const carouselSlideSchemaNew = z.object({
  numero: z.number().int().positive(),
  estilo: z.string().refine(
    (val) => validEstilos.includes(val),
    { message: `estilo must be one of: ${validEstilos.join(', ')}` }
  ),
  texto_1: z.string().optional(),
  texto_2: z.string().optional(),
  texto_3: z.string().optional(),
  texto_4: z.string().optional(),
  texto_5: z.string().optional(),
  texto_principal: z.enum(['texto_1', 'texto_2', 'texto_3', 'texto_4', 'texto_5']).optional(),
  // Fields specific to ff_capa template
  titulo: z.string().optional(),
  titleSpecialStyling: titleSpecialStylingSchema,
});

/**
 * Schema for separate destaques array (new format)
 */
const destaqueItemSchema = z.object({
  numero: z.number().int().positive(), // slide number this destaque belongs to
  destaques: destaquesSchemaNew,
});

/**
 * Schema for photo metadata
 */
const photoSchema = z.object({
  photo: z.object({
    src: z.object({
      portrait: z.string().url().optional(),
      landscape: z.string().url().optional(),
      original: z.string().url().optional(), // Legacy support
    }),
    dim: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
    id: z.number().optional(),
    photographer: z.string().optional(),
    alt: z.string().optional(),
  }),
  slide: z.number().int().positive(),
});

/**
 * Main carousel schema for AI-generated JSON (old format - inline destaques)
 */
export const carouselSchemaOldFormat = z.object({
  carousel: z.object({
    photos: z.array(photoSchema).optional(),
    copy: z.object({
      slides: z.array(carouselSlideSchemaOld).min(1, 'At least one slide is required'),
    }),
  }),
});

/**
 * Main carousel schema for AI-generated JSON (new format - separate destaques)
 */
export const carouselSchemaNewFormat = z.object({
  carousel: z.object({
    photos: z.array(photoSchema).optional(),
    copy: z.object({
      slides: z.array(carouselSlideSchemaNew).min(1, 'At least one slide is required'),
    }),
    destaques: z.array(destaqueItemSchema).optional(),
  }),
});

/**
 * Legacy carousel schema (old format with carrossel)
 * For backwards compatibility
 */
export const legacyCarouselSchema = z.object({
  carrossel: z.object({
    slides: z.array(carouselSlideSchemaOld).min(1, 'At least one slide is required'),
  }),
});

/**
 * Type inference from schema
 */
export type DestaqueChunk = z.infer<typeof destaqueChunkSchema>;
export type DestaquesOld = z.infer<typeof destaquesSchemaOld>;
export type DestaquesNew = z.infer<typeof destaquesSchemaNew>;
export type CarouselSlideOld = z.infer<typeof carouselSlideSchemaOld>;
export type CarouselSlideNew = z.infer<typeof carouselSlideSchemaNew>;
export type DestaqueItem = z.infer<typeof destaqueItemSchema>;
export type CarouselPhoto = z.infer<typeof photoSchema>;
export type CarouselDataOldFormat = z.infer<typeof carouselSchemaOldFormat>;
export type CarouselDataNewFormat = z.infer<typeof carouselSchemaNewFormat>;
export type LegacyCarouselData = z.infer<typeof legacyCarouselSchema>;
export type TitleSpecialStyling = z.infer<typeof titleSpecialStylingSchema>;
export type LineStyle = z.infer<typeof lineStyleSchema>;

// Union type for all formats
export type CarouselData = CarouselDataOldFormat | CarouselDataNewFormat;

/**
 * Converts old format (inline destaques) to new format (separate destaques)
 * @param oldData - Carousel data with inline destaques
 * @returns Carousel data with separate destaques array
 */
function convertOldFormatToNew(oldData: CarouselDataOldFormat): CarouselDataNewFormat {
  const destaques: DestaqueItem[] = [];

  // Extract destaques from each slide
  oldData.carousel.copy.slides.forEach((slide) => {
    if (slide.destaques) {
      const convertedDestaques: DestaquesNew = {};

      // Convert each text field's destaques from string[] to DestaqueChunk[]
      (Object.keys(slide.destaques) as Array<keyof typeof slide.destaques>).forEach((key) => {
        const highlights = slide.destaques![key];
        if (highlights && highlights.length > 0) {
          // Convert string[] to DestaqueChunk[]
          // Default: apply color and bold for old format
          convertedDestaques[key] = highlights.map(trecho => ({
            trecho,
            tipo: 'bold' as const,
            cor: true, // old format always applied color
          }));
        }
      });

      if (Object.keys(convertedDestaques).length > 0) {
        destaques.push({
          numero: slide.numero,
          destaques: convertedDestaques,
        });
      }
    }
  });

  return {
    carousel: {
      photos: oldData.carousel.photos,
      copy: {
        slides: oldData.carousel.copy.slides.map(slide => ({
          numero: slide.numero,
          estilo: slide.estilo,
          texto_1: slide.texto_1,
          texto_2: slide.texto_2,
          texto_3: slide.texto_3,
          texto_4: slide.texto_4,
          texto_5: slide.texto_5,
        })),
      },
      destaques: destaques.length > 0 ? destaques : undefined,
    },
  };
}

/**
 * Validates carousel JSON data (tries all formats)
 * @param data - Raw JSON data to validate
 * @returns Validated carousel data in new format
 * @throws ZodError if validation fails
 */
export function validateCarouselData(data: unknown): CarouselDataNewFormat {
  console.log('[validateCarouselData] Starting validation...');

  // Try old format with inline destaques FIRST (more specific)
  // This needs to come before new format because old format has inline destaques
  const oldFormatResult = carouselSchemaOldFormat.safeParse(data);
  if (oldFormatResult.success) {
    // Check if any slide actually has inline destaques
    const hasInlineDestaques = oldFormatResult.data.carousel.copy.slides.some(slide => slide.destaques);
    if (hasInlineDestaques) {
      console.log('[validateCarouselData] Matched OLD format (inline destaques), converting to new format');
      const converted = convertOldFormatToNew(oldFormatResult.data);
      console.log('[validateCarouselData] Conversion result:', JSON.stringify(converted.carousel.destaques, null, 2));
      return converted;
    }
  }

  // Try new format with separate destaques
  const newFormatResult = carouselSchemaNewFormat.safeParse(data);
  if (newFormatResult.success) {
    console.log('[validateCarouselData] Matched NEW format (separate destaques)');
    return newFormatResult.data;
  }

  // Try legacy format (carrossel)
  const legacyResult = legacyCarouselSchema.safeParse(data);
  if (legacyResult.success) {
    console.log('[validateCarouselData] Matched LEGACY format (carrossel), converting to new format');
    // Convert legacy format to old format first, then to new format
    const oldFormatData: CarouselDataOldFormat = {
      carousel: {
        photos: [],
        copy: {
          slides: legacyResult.data.carrossel.slides,
        },
      },
    };
    return convertOldFormatToNew(oldFormatData);
  }

  console.log('[validateCarouselData] No format matched, throwing error');
  // If all fail, throw the new format error (most informative)
  return carouselSchemaNewFormat.parse(data);
}

/**
 * Safe validation that returns success/error object
 * @param data - Raw JSON data to validate
 * @returns Object with success status and data or error
 */
export function safeValidateCarouselData(data: unknown):
  | { success: true; data: CarouselDataNewFormat }
  | { success: false; error: z.ZodError } {
  try {
    const validated = validateCarouselData(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}
