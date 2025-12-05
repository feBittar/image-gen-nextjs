# Modular Image Generation API

## Overview

The `/api/generate-modular` endpoint generates images using the modular template system. Instead of using pre-built HTML templates, it composes templates dynamically by combining enabled modules.

## Endpoint

```
POST /api/generate-modular
```

## Request Body

```typescript
interface ModularGenerateRequest {
  // Optional preset ID to start from (e.g., 'stack', 'versus-duo')
  presetId?: string;

  // Array of module IDs to enable
  enabledModules: string[];

  // Data for each module
  moduleData: Record<string, ModuleData>;

  // Optional output configuration
  outputOptions?: {
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    filename?: string;
  };
}
```

## Response

### Success Response (Single Image)

```typescript
{
  success: true,
  images: ["/output/modular-1234567890.png"],
  filenames: ["modular-1234567890.png"],
  htmlUrl: "/output/modular-1234567890.html",
  durationMs: 1234
}
```

### Success Response (Duo Mode - Multiple Images)

```typescript
{
  success: true,
  images: [
    "/output/modular-duo-1234567890-1.png",
    "/output/modular-duo-1234567890-2.png"
  ],
  filenames: [
    "modular-duo-1234567890-1.png",
    "modular-duo-1234567890-2.png"
  ],
  htmlUrl: "/output/modular-1234567890.html",
  durationMs: 2345
}
```

### Error Response

```typescript
{
  success: false,
  error: "Error message",
  details?: {
    stack: "Error stack trace"
  }
}
```

## Available Modules

### Layout Modules
- `viewport` - Background, blur, and gradient overlay
- `card` - Main content card with padding and shadow
- `duo` - Special module that creates 2-slide output

### Content Modules
- `textFields` - Configurable text fields with rich styling
- `contentImage` - Content images with positioning
- `bullets` - Bullet point cards with icons

### Overlay Modules
- `corners` - Corner elements (text or SVG)
- `freeText` - Free-positioned text elements
- `arrowBottomText` - Arrow with bottom text
- `svgElements` - Positioned SVG elements
- `logo` - Logo placement

## Example Requests

### Basic Example

```json
{
  "enabledModules": ["viewport", "card", "textFields"],
  "moduleData": {
    "viewport": {
      "backgroundType": "color",
      "backgroundColor": "#1a1a2e"
    },
    "card": {
      "enabled": true,
      "width": 85,
      "backgroundColor": "#16213e",
      "borderRadius": 20
    },
    "textFields": {
      "count": 2,
      "fields": [
        {
          "content": "Hello World",
          "style": {
            "fontSize": "72px",
            "color": "#e94560",
            "fontWeight": "900"
          }
        },
        {
          "content": "Welcome to modular templates",
          "style": {
            "fontSize": "32px",
            "color": "#0f3460"
          }
        }
      ]
    }
  }
}
```

### Using a Preset

```json
{
  "presetId": "stack",
  "enabledModules": ["viewport", "card", "textFields", "logo"],
  "moduleData": {
    "textFields": {
      "fields": [
        {
          "content": "Custom Text",
          "style": {
            "fontSize": "64px",
            "color": "#FF0000"
          }
        }
      ]
    },
    "logo": {
      "enabled": true,
      "logoUrl": "/logos/logo.svg",
      "specialPosition": "top-right"
    }
  }
}
```

### Duo Mode (2-Slide Generation)

```json
{
  "enabledModules": ["viewport", "textFields", "duo"],
  "moduleData": {
    "viewport": {
      "backgroundType": "color",
      "backgroundColor": "#000000"
    },
    "textFields": {
      "count": 4,
      "fields": [
        { "content": "BEFORE", "style": { "fontSize": "60px", "color": "#FFF" } },
        { "content": "Description 1", "style": { "fontSize": "32px", "color": "#AAA" } },
        { "content": "AFTER", "style": { "fontSize": "60px", "color": "#FFF" } },
        { "content": "Description 2", "style": { "fontSize": "32px", "color": "#AAA" } }
      ]
    },
    "duo": {
      "enabled": true,
      "centerImageUrl": "/images/product.png",
      "centerImageScale": 110
    }
  }
}
```

### Rich Text with Styled Chunks

```json
{
  "enabledModules": ["viewport", "card", "textFields"],
  "moduleData": {
    "textFields": {
      "count": 1,
      "fields": [
        {
          "content": "Hello Beautiful World",
          "style": {
            "fontSize": "48px",
            "textAlign": "center"
          },
          "styledChunks": [
            {
              "text": "Hello",
              "color": "#FF0000",
              "bold": true
            },
            {
              "text": "Beautiful",
              "color": "#00FF00",
              "italic": true,
              "fontSize": "64px"
            },
            {
              "text": "World",
              "color": "#0000FF",
              "backgroundColor": "#FFFF00",
              "padding": "4px 8px"
            }
          ]
        }
      ]
    }
  }
}
```

## How It Works

1. **Request Parsing**: The endpoint receives the request body with enabled modules and their data

2. **Preset Application** (optional): If a `presetId` is provided, the preset's default modules and data are loaded and merged with the request data

3. **Text Processing**: All text fields in module data are processed through `processTextField()` which:
   - Handles styled chunks (rich text formatting)
   - Applies parent styles
   - Converts to HTML with proper styling

4. **Template Composition**: The `composeTemplate()` function:
   - Retrieves all enabled modules from the registry
   - Calculates viewport dimensions (doubles width if Duo mode is enabled)
   - Collects CSS from all modules in z-index order
   - Collects HTML from all modules
   - Generates CSS variables
   - Produces final HTML document

5. **Image Generation**: Using Puppeteer:
   - Launches/reuses browser instance
   - Sets viewport dimensions
   - Loads composed HTML
   - Waits for fonts and images to load
   - Captures screenshot(s)
   - For Duo mode: captures two separate images (left and right halves)
   - Saves HTML file for debugging

6. **Response**: Returns URLs to generated images and HTML file

## Module Data Structure

Each module has its own data schema. Common patterns:

### Viewport Module
```typescript
{
  backgroundType: 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  blurEnabled?: boolean;
  gradientOverlay?: {
    enabled: boolean;
    color?: string;
    direction?: 'to top' | 'to bottom' | 'to left' | 'to right';
    // ...
  };
}
```

### Card Module
```typescript
{
  enabled: boolean;
  width: number; // percentage
  height: number; // percentage
  borderRadius: number;
  backgroundType: 'color' | 'image';
  backgroundColor?: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  shadow?: {
    enabled: boolean;
    color?: string;
    x?: number;
    y?: number;
    blur?: number;
    spread?: number;
  };
}
```

### TextFields Module
```typescript
{
  count: number; // number of text fields (1-5)
  gap: number; // spacing between fields
  verticalAlign: 'top' | 'center' | 'bottom';
  fields: Array<{
    content: string; // plain text content
    style: TextStyle; // font, size, color, etc.
    styledChunks?: StyledChunk[]; // rich text formatting
    verticalOffset?: number; // fine-tune positioning
  }>;
}
```

### Duo Module
```typescript
{
  enabled: boolean;
  centerImageUrl: string;
  centerImageOffsetX?: number;
  centerImageOffsetY?: number;
  centerImageScale?: number; // percentage (100 = original size)
  centerImageRotation?: number; // degrees
}
```

## Output Files

The API generates the following files in `public/output/`:

1. **PNG/JPEG/WebP images**: The actual rendered graphics
   - Single mode: `modular-{timestamp}.{format}`
   - Duo mode: `modular-duo-{timestamp}-1.{format}` and `modular-duo-{timestamp}-2.{format}`

2. **HTML file**: The composed HTML used for rendering (for debugging)
   - `modular-{timestamp}.html`

All files are served from `/output/` and accessible via the URLs in the response.

## Error Handling

The API validates:
- Required fields (`enabledModules` must be an array with at least one module)
- Module existence (all enabled modules must exist in the registry)
- Data structure (each module validates its own data via Zod schemas)

Common errors:
- `400 Bad Request`: Invalid request body or missing required fields
- `500 Internal Server Error`: Template composition failed, Puppeteer error, or file system error

## Performance Considerations

- **Browser Reuse**: The Puppeteer browser instance is reused across requests for better performance
- **Font Loading**: Waits for `document.fonts.ready` to ensure custom fonts are loaded
- **SVG Rendering**: Additional 2-second delay to allow SVG elements to paint correctly
- **Viewport Scale**: Uses `deviceScaleFactor: 2` for retina-quality output

## Debugging

Enable debug output by checking the server logs:

```bash
npm run dev
```

The logs will show:
- Enabled modules and preset application
- Text field processing
- Template composition details
- Image generation progress
- File paths and URLs

The generated HTML file can be opened in a browser to inspect the composed template visually.

## Integration Example

```typescript
// Client-side code
async function generateModularImage() {
  const response = await fetch('/api/generate-modular', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      enabledModules: ['viewport', 'card', 'textFields'],
      moduleData: {
        viewport: {
          backgroundType: 'color',
          backgroundColor: '#1a1a2e',
        },
        card: {
          enabled: true,
          width: 85,
          backgroundColor: '#16213e',
        },
        textFields: {
          count: 1,
          fields: [
            {
              content: 'Hello World',
              style: {
                fontSize: '72px',
                color: '#e94560',
              },
            },
          ],
        },
      },
      outputOptions: {
        format: 'png',
        quality: 100,
      },
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log('Generated images:', result.images);
    console.log('HTML file:', result.htmlUrl);

    // Display first image
    const img = document.createElement('img');
    img.src = result.images[0];
    document.body.appendChild(img);
  } else {
    console.error('Generation failed:', result.error);
  }
}
```

## See Also

- [Module System Documentation](../../../lib/modules/README.md)
- [Preset Documentation](../../../lib/presets/index.ts)
- [Compositer Documentation](../../../lib/modules/compositer.ts)
- [Duo Module Integration](../../../lib/modules/duo/INTEGRATION.md)
