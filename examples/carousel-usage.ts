/**
 * Example usage of Carousel API
 * This file demonstrates how to use the carousel transformation and batch generation features
 */

import { processCarouselData } from '@/lib/utils/carouselTransformer';

// Example 1: Simple carousel with highlights
export const simpleCarouselExample = {
  carrossel: {
    slides: [
      {
        numero: 1,
        estilo: "stack-img" as const,
        texto_1: "Welcome to our platform",
        texto_2: "Build amazing things with ease",
        destaques: {
          texto_1: ["Welcome"],
          texto_2: ["amazing"]
        }
      },
      {
        numero: 2,
        estilo: "stack-img-bg" as const,
        texto_1: "Powerful features",
        texto_2: "Everything you need to succeed",
        texto_3: "Built for developers, by developers",
        destaques: {
          texto_1: ["Powerful"],
          texto_3: ["developers"]
        }
      }
    ]
  }
};

// Example 2: Complex carousel with multiple highlights per field
export const complexCarouselExample = {
  carrossel: {
    slides: [
      {
        numero: 1,
        estilo: "stack-img" as const,
        texto_1: "The quick brown fox jumps over the lazy dog",
        texto_2: "A classic pangram sentence",
        texto_3: "Used for typography and font testing",
        destaques: {
          texto_1: ["quick", "fox", "lazy"],
          texto_2: ["pangram"],
          texto_3: ["typography", "font testing"]
        }
      },
      {
        numero: 2,
        estilo: "stack-img-bg" as const,
        texto_1: "Design matters",
        texto_2: "Every pixel counts in creating great user experiences",
        texto_4: "Typography is the voice of your design",
        destaques: {
          texto_1: ["Design"],
          texto_2: ["pixel", "great"],
          texto_4: ["voice"]
        }
      },
      {
        numero: 3,
        estilo: "stack-img" as const,
        texto_1: "Ship fast, iterate faster",
        texto_2: "Build MVPs in days, not months",
        texto_3: "Launch and learn from real users",
        destaques: {
          texto_1: ["fast", "faster"],
          texto_2: ["days", "months"],
          texto_3: ["real users"]
        }
      }
    ]
  }
};

// Example 3: Carousel without highlights
export const noHighlightsCarouselExample = {
  carrossel: {
    slides: [
      {
        numero: 1,
        estilo: "stack-img" as const,
        texto_1: "Simple slide",
        texto_2: "No highlights needed",
        texto_3: "Just plain text"
      },
      {
        numero: 2,
        estilo: "stack-img-bg" as const,
        texto_1: "Another slide",
        texto_2: "Still no highlights"
      }
    ]
  }
};

// Function to transform and generate carousel
export async function generateCarouselImages(carouselData: any, highlightColor: string = '#ff0000') {
  console.log('Starting carousel transformation...');

  // Step 1: Transform carousel data to layouts
  const transformResult = processCarouselData(carouselData, highlightColor);

  if (!transformResult.success) {
    console.error('Transformation failed:', transformResult.error);
    throw new Error(transformResult.error);
  }

  console.log(`Successfully transformed ${transformResult.layouts.length} slides`);

  // Step 2: Send to batch generation API
  const response = await fetch('/api/generate-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      layouts: transformResult.layouts,
      highlightColor
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Batch generation failed');
  }

  console.log(`Generated ${result.summary.successful} images successfully`);
  console.log(`Failed: ${result.summary.failed}`);
  console.log(`Duration: ${result.summary.durationMs}ms`);

  return result;
}

// Function to use transform-carousel endpoint
export async function transformCarouselViaAPI(carouselData: any, highlightColor: string = '#ff0000') {
  const response = await fetch('/api/transform-carousel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...carouselData,
      highlightColor
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Transformation failed');
  }

  console.log(`Transformed ${result.count} layouts`);
  return result.layouts;
}

// Usage example in React component
export const ReactComponentExample = `
import { useState } from 'react';
import { generateCarouselImages } from '@/examples/carousel-usage';
import { simpleCarouselExample } from '@/examples/carousel-usage';

export function CarouselGenerator() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const result = await generateCarouselImages(simpleCarouselExample, '#ff0000');
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Carousel'}
      </button>

      {error && <div className="error">{error}</div>}

      {results && (
        <div>
          <h3>Results ({results.summary.successful}/{results.summary.total})</h3>
          <div className="results-grid">
            {results.results.map((result: any, i: number) => (
              <div key={i}>
                {result.success ? (
                  <div>
                    <img src={result.url} alt={\`Slide \${result.slideNumber}\`} />
                    <p>Slide {result.slideNumber}</p>
                  </div>
                ) : (
                  <div className="error">
                    Slide {result.slideNumber} failed: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Usage example with custom AI JSON
export const customAIExample = `
// Example: Processing AI-generated JSON from external API

async function processAICarousel(aiResponse: any) {
  // Validate that AI response has correct structure
  if (!aiResponse.carrossel || !Array.isArray(aiResponse.carrossel.slides)) {
    throw new Error('Invalid AI response structure');
  }

  // Transform and generate
  try {
    const result = await generateCarouselImages(aiResponse, '#0066ff');

    // Process results
    const successfulImages = result.results.filter(r => r.success);
    const failedImages = result.results.filter(r => !r.success);

    console.log('Successful images:', successfulImages.map(r => r.url));
    console.log('Failed images:', failedImages.map(r => r.error));

    return successfulImages;
  } catch (error) {
    console.error('Carousel generation failed:', error);
    throw error;
  }
}
`;

// Export all examples
export default {
  simpleCarouselExample,
  complexCarouselExample,
  noHighlightsCarouselExample,
  generateCarouselImages,
  transformCarouselViaAPI,
  ReactComponentExample,
  customAIExample
};
