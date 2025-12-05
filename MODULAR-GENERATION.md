# Modular Image Generation

This document describes the new `generateModularImage` function added to `imageGenerator.ts` that supports the modular template system.

## Overview

The modular system allows building templates dynamically by combining independent modules. This is different from the legacy template system which uses static HTML files.

## New API

### `generateModularImage()`

```typescript
async function generateModularImage(
  enabledModules: string[],
  moduleData: Record<string, any>,
  options?: {
    outputPath?: string;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
): Promise<GenerationResult>
```

#### Parameters

- **enabledModules**: Array of module IDs to activate (e.g., `['viewport', 'card', 'textFields', 'duo']`)
- **moduleData**: Configuration data for each module, keyed by module ID
- **options**: Optional generation settings
  - `outputPath`: Custom filename prefix (default: 'modular')
  - `format`: Output format (default: 'png')
  - `quality`: Image quality 0-100 (default: 100)

#### Returns

```typescript
interface GenerationResult {
  success: boolean;
  imagePaths: string[];  // Array of generated image paths (1 for normal, 2 for Duo mode)
  htmlPath?: string;     // Path to debug HTML file
  error?: string;        // Error message if success is false
}
```

## How It Works

1. **Template Composition**: Calls `composeTemplate()` from `compositer.ts` to build the final HTML from enabled modules
2. **Placeholder Replacement**: All placeholders are replaced automatically by the compositer (no manual replacement needed)
3. **Viewport Detection**: Automatically adjusts viewport based on enabled modules (e.g., Duo mode doubles width)
4. **Special Module Handling**: If Duo module is enabled and has `modifyGeneration` hook, uses custom generation logic
5. **Screenshot Capture**: Uses existing Puppeteer infrastructure to capture final image(s)

## Usage Examples

### Example 1: Simple Stack Template (Modular Version)

```typescript
import { generateModularImage } from '@/lib/services/imageGenerator';

const result = await generateModularImage(
  ['viewport', 'card', 'textFields'],
  {
    viewport: {
      backgroundColor: '#000000'
    },
    card: {
      backgroundImageUrl: '/images/bg.jpg',
      gradientOverlay: {
        enabled: true,
        color: '#000000',
        startOpacity: 0.8,
        height: 60
      }
    },
    textFields: {
      count: 3,
      gap: 20,
      verticalAlign: 'center',
      fields: [
        {
          content: 'Main Title',
          styledChunks: [
            { text: 'Main', color: '#FF0000', bold: true },
            { text: 'Title', color: '#FFFFFF', bold: false }
          ],
          style: {
            fontSize: '72px',
            fontFamily: 'Montserrat',
            textAlign: 'center'
          },
          verticalOffset: 0
        },
        // ... more fields
      ]
    }
  },
  {
    outputPath: 'stack-example',
    format: 'png',
    quality: 100
  }
);

if (result.success) {
  console.log('Images generated:', result.imagePaths);
  console.log('HTML debug file:', result.htmlPath);
} else {
  console.error('Generation failed:', result.error);
}
```

### Example 2: Duo Mode (2-Slide Generation)

```typescript
import { generateModularImage } from '@/lib/services/imageGenerator';

const result = await generateModularImage(
  ['viewport', 'card', 'textFields', 'duo'],
  {
    viewport: {
      backgroundColor: '#FFFFFF'
    },
    card: {
      backgroundImageUrl: '/images/bg.jpg'
    },
    textFields: {
      count: 1,
      fields: [
        {
          content: 'Versus Duo',
          style: { fontSize: '64px', textAlign: 'center' }
        }
      ]
    },
    duo: {
      enabled: true,
      centerImageUrl: '/images/product.png',
      centerImageOffsetX: 0,
      centerImageOffsetY: 0,
      centerImageScale: 100,
      centerImageRotation: 0
    }
  },
  {
    outputPath: 'versus-duo',
    format: 'png'
  }
);

// Duo mode returns 2 images
if (result.success) {
  console.log('Slide 1:', result.imagePaths[0]); // Left half
  console.log('Slide 2:', result.imagePaths[1]); // Right half
}
```

### Example 3: With Corners and Free Text

```typescript
const result = await generateModularImage(
  ['viewport', 'card', 'corners', 'freeText'],
  {
    viewport: {
      backgroundColor: '#000000'
    },
    card: {
      backgroundImageUrl: '/images/background.jpg'
    },
    corners: {
      corners: [
        {
          type: 'svg',
          svgUrl: '/logos/brand.svg',
          svgColor: '#FFFFFF',
          specialPosition: 'top-left',
          width: 100,
          height: 100
        },
        // ... more corners
      ]
    },
    freeText: {
      elements: [
        {
          enabled: true,
          content: 'Limited Offer!',
          styledChunks: [...],
          position: {
            top: 100,
            right: 50
          },
          style: {
            fontSize: '48px',
            color: '#FF0000',
            fontWeight: 'bold'
          }
        }
      ]
    }
  }
);
```

## Module System Integration

### Available Modules

The modular system includes these modules (from `registry.ts`):

**Layout Modules:**
- `viewport` - Background color/image and overall dimensions
- `card` - Main content card with background and gradient
- `duo` - Special module that creates 2-slide layouts

**Content Modules:**
- `textFields` - Multiple text fields with rich styling
- `contentImage` - Content image section
- `bullets` - Bullet point cards

**Overlay Modules:**
- `corners` - Corner elements (SVGs or images)
- `freeText` - Free-positioned text elements
- `arrowBottomText` - Arrow with bottom text
- `svgElements` - Positioned SVG elements
- `logo` - Logo positioning

### Module Data Structure

Each module expects specific data structure defined by its schema. Check individual module schemas in `src/lib/modules/[module-name]/schema.ts` for details.

## Duo Module Special Behavior

The Duo module is special because it:

1. **Doubles Viewport Width**: Changes viewport from 1080px to 2160px
2. **Splits Output**: Captures 2 separate screenshots (left and right halves)
3. **Uses modifyGeneration Hook**: Bypasses standard screenshot logic
4. **Returns Multiple Images**: `result.imagePaths` contains 2 paths instead of 1

When Duo is enabled, the `generateModularImage` function automatically detects it and calls the `modifyGeneration` hook.

## Backward Compatibility

The existing `generateImage()` function continues to work with legacy templates. The new `generateModularImage()` is a separate entry point specifically for the modular system.

## File Output

Generated files are saved to `public/output/` with this naming pattern:

**Standard Mode:**
- Image: `{outputPath}-{timestamp}.{format}`
- HTML: `{outputPath}-{timestamp}.html`

**Duo Mode:**
- Image 1: `{outputPath}-duo-{timestamp}-1.png`
- Image 2: `{outputPath}-duo-{timestamp}-2.png`
- HTML: `{outputPath}-{timestamp}.html`

## Error Handling

If generation fails, the function returns:

```typescript
{
  success: false,
  imagePaths: [],
  error: "Error message describing what went wrong"
}
```

Always check `result.success` before accessing `result.imagePaths`.

## Debugging

The function automatically saves the generated HTML to `public/output/{prefix}-{timestamp}.html`. You can:

1. Open this file in a browser to see what the template looks like
2. Inspect element styles and layout
3. Check if CSS/HTML from modules composed correctly

## Next Steps

To use modular generation in an API route:

```typescript
// src/app/api/generate-modular/route.ts
import { generateModularImage } from '@/lib/services/imageGenerator';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { enabledModules, moduleData, options } = await request.json();

  const result = await generateModularImage(
    enabledModules,
    moduleData,
    options
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  // Convert absolute paths to URLs
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const imageUrls = result.imagePaths.map(path => {
    const filename = path.split('\\').pop() || path.split('/').pop();
    return `${baseUrl}/output/${filename}`;
  });

  return NextResponse.json({
    success: true,
    images: imageUrls,
    htmlUrl: result.htmlPath ? `${baseUrl}/output/${result.htmlPath.split('\\').pop()}` : undefined
  });
}
```
