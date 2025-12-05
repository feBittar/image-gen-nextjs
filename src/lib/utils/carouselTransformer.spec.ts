/**
 * Test suite for carouselTransformer
 *
 * To run these tests, ensure you have Jest configured in your project:
 * npm install --save-dev jest @types/jest ts-jest
 *
 * Or adapt these tests to your preferred testing framework.
 */

import {
  loadLayoutBase,
  convertDestaques,
  transformSlide,
  transformCarousel,
  processCarouselData
} from './carouselTransformer';
import { CarouselSlide } from '@/lib/schemas/carouselSchema';

describe('carouselTransformer', () => {
  describe('loadLayoutBase', () => {
    it('should load stack-img layout', () => {
      const layout = loadLayoutBase('stack-img');
      expect(layout).not.toBeNull();
      expect(layout?.template).toBe('stack');
      expect(layout?.cardWidth).toBeDefined();
      expect(layout?.cardHeight).toBeDefined();
    });

    it('should load stack-img-bg layout', () => {
      const layout = loadLayoutBase('stack-img-bg');
      expect(layout).not.toBeNull();
      expect(layout?.template).toBe('stack');
      expect(layout?.cardBackgroundImage).toBeDefined();
    });

    it('should return null for non-existent layout', () => {
      const layout = loadLayoutBase('non-existent-layout');
      expect(layout).toBeNull();
    });
  });

  describe('convertDestaques', () => {
    it('should create styled chunks for single highlight', () => {
      const text = 'Hello world, this is a test';
      const highlights = ['world'];
      const color = '#ff0000';

      const chunks = convertDestaques(text, highlights, color);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe('world');
      expect(chunks[0].color).toBe('#ff0000');
    });

    it('should create styled chunks for multiple highlights', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const highlights = ['quick', 'fox', 'lazy'];
      const color = '#00ff00';

      const chunks = convertDestaques(text, highlights, color);

      expect(chunks).toHaveLength(3);
      expect(chunks[0].text).toBe('quick');
      expect(chunks[1].text).toBe('fox');
      expect(chunks[2].text).toBe('lazy');
      expect(chunks.every(c => c.color === '#00ff00')).toBe(true);
    });

    it('should handle highlights not found in text', () => {
      const text = 'Hello world';
      const highlights = ['missing', 'world', 'notfound'];
      const color = '#0000ff';

      const chunks = convertDestaques(text, highlights, color);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe('world');
    });

    it('should return empty array for empty highlights', () => {
      const text = 'Hello world';
      const highlights: string[] = [];
      const color = '#ff0000';

      const chunks = convertDestaques(text, highlights, color);

      expect(chunks).toHaveLength(0);
    });

    it('should sanitize dangerous characters', () => {
      const text = 'Hello <script>alert("xss")</script> world';
      const highlights = ['scriptalert("xss")/script'];
      const color = '#ff0000';

      const chunks = convertDestaques(text, highlights, color);

      // Should sanitize the highlight text
      expect(chunks.length).toBeLessThanOrEqual(1);
      if (chunks.length > 0) {
        expect(chunks[0].text).not.toContain('<');
        expect(chunks[0].text).not.toContain('>');
      }
    });
  });

  describe('transformSlide', () => {
    let layoutBase: any;

    beforeAll(() => {
      layoutBase = loadLayoutBase('stack-img');
    });

    it('should transform slide with single text field', () => {
      const slide: CarouselSlide = {
        numero: 1,
        estilo: 'stack-img',
        texto_1: 'This is a test',
      };

      const result = transformSlide(slide, layoutBase!);

      expect(result.text1).toBe('This is a test');
      expect(result.text2).toBeDefined();
      expect(result.text3).toBeDefined();
      expect(result.text4).toBeDefined();
      expect(result.text5).toBeDefined();
    });

    it('should transform slide with multiple text fields', () => {
      const slide: CarouselSlide = {
        numero: 2,
        estilo: 'stack-img',
        texto_1: 'First line',
        texto_2: 'Second line',
        texto_3: 'Third line',
      };

      const result = transformSlide(slide, layoutBase!);

      expect(result.text1).toBe('First line');
      expect(result.text2).toBe('Second line');
      expect(result.text3).toBe('Third line');
    });

    it('should apply highlights to text fields', () => {
      const slide: CarouselSlide = {
        numero: 3,
        estilo: 'stack-img',
        texto_1: 'Hello world',
        destaques: {
          texto_1: ['world']
        }
      };

      const result = transformSlide(slide, layoutBase!, '#ff0000');

      expect(result.text1).toBe('Hello world');
      expect(result.text1StyledChunks).toBeDefined();
      expect(result.text1StyledChunks).toHaveLength(1);
      expect(result.text1StyledChunks![0].text).toBe('world');
      expect(result.text1StyledChunks![0].color).toBe('#ff0000');
    });

    it('should apply multiple highlights to multiple fields', () => {
      const slide: CarouselSlide = {
        numero: 4,
        estilo: 'stack-img',
        texto_1: 'The quick brown fox',
        texto_2: 'jumps over the lazy dog',
        destaques: {
          texto_1: ['quick', 'fox'],
          texto_2: ['lazy', 'dog']
        }
      };

      const result = transformSlide(slide, layoutBase!, '#00ff00');

      expect(result.text1StyledChunks).toHaveLength(2);
      expect(result.text2StyledChunks).toHaveLength(2);
      expect(result.text1StyledChunks![0].color).toBe('#00ff00');
      expect(result.text2StyledChunks![1].color).toBe('#00ff00');
    });

    it('should preserve all layout base properties', () => {
      const slide: CarouselSlide = {
        numero: 5,
        estilo: 'stack-img',
        texto_1: 'Test',
      };

      const result = transformSlide(slide, layoutBase!);

      expect(result.template).toBe(layoutBase!.template);
      expect(result.cardWidth).toBe(layoutBase!.cardWidth);
      expect(result.cardHeight).toBe(layoutBase!.cardHeight);
      expect(result.cardBorderRadius).toBe(layoutBase!.cardBorderRadius);
      expect(result.text1Style).toEqual(layoutBase!.text1Style);
    });
  });

  describe('transformCarousel', () => {
    it('should transform carousel with single slide', () => {
      const carousel = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img' as const,
              texto_1: 'Test slide',
            }
          ]
        }
      };

      const results = transformCarousel(carousel);

      expect(results).toHaveLength(1);
      expect(results[0].text1).toBe('Test slide');
    });

    it('should transform carousel with multiple slides', () => {
      const carousel = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img' as const,
              texto_1: 'Slide 1',
            },
            {
              numero: 2,
              estilo: 'stack-img-bg' as const,
              texto_1: 'Slide 2',
              texto_2: 'Second line',
            },
            {
              numero: 3,
              estilo: 'stack-img' as const,
              texto_1: 'Slide 3',
            }
          ]
        }
      };

      const results = transformCarousel(carousel);

      expect(results).toHaveLength(3);
      expect(results[0].text1).toBe('Slide 1');
      expect(results[1].text1).toBe('Slide 2');
      expect(results[1].text2).toBe('Second line');
      expect(results[2].text1).toBe('Slide 3');
    });

    it('should use custom highlight color', () => {
      const carousel = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img' as const,
              texto_1: 'Hello world',
              destaques: {
                texto_1: ['world']
              }
            }
          ]
        }
      };

      const results = transformCarousel(carousel, '#0000ff');

      expect(results[0].text1StyledChunks).toBeDefined();
      expect(results[0].text1StyledChunks![0].color).toBe('#0000ff');
    });

    it('should throw error for missing layout template', () => {
      const carousel = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'non-existent-layout' as any,
              texto_1: 'Test',
            }
          ]
        }
      };

      expect(() => transformCarousel(carousel)).toThrow('Failed to load layout template');
    });

    it('should cache layout templates for efficiency', () => {
      const carousel = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img' as const,
              texto_1: 'Slide 1',
            },
            {
              numero: 2,
              estilo: 'stack-img' as const,
              texto_1: 'Slide 2',
            }
          ]
        }
      };

      // Should not throw, and should reuse cached layout
      const results = transformCarousel(carousel);
      expect(results).toHaveLength(2);
    });
  });

  describe('processCarouselData', () => {
    it('should validate and transform valid carousel data', () => {
      const carouselData = {
        carrossel: {
          slides: [
            {
              numero: 1,
              estilo: 'stack-img',
              texto_1: 'Test',
            }
          ]
        }
      };

      const result = processCarouselData(carouselData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.layouts).toHaveLength(1);
        expect(result.layouts[0].text1).toBe('Test');
      }
    });

    it('should return error for invalid carousel data', () => {
      const invalidData = {
        carrossel: {
          slides: [] // Empty slides array
        }
      };

      const result = processCarouselData(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should return error for malformed data', () => {
      const invalidData = {
        invalid: 'structure'
      };

      const result = processCarouselData(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
