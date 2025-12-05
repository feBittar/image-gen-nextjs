# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ImageGen** is a Next.js application for generating social media graphics using HTML templates and Puppeteer. The system converts JSON data into styled images by processing templates with custom text styling, fonts, gradients, SVGs, and background images.

## Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Core Image Generation Flow

1. **API Route** (`src/app/api/generate/route.ts`) receives JSON data with text, styles, and template ID
2. **Text Processor** (`src/lib/utils/textProcessor.ts`) converts rich text with styled chunks to HTML
3. **Image Generator** (`src/lib/services/imageGenerator.ts`) loads HTML template, replaces placeholders, injects custom fonts, and uses Puppeteer to capture screenshot
4. **Output** saved to `public/output/` and served via `/output/[filename]`

### Template System

Templates are HTML files in `templates/` directory with placeholder syntax:
- `{{field}}` - Simple text replacement
- `{{field|style:value}}` - Text with inline CSS styles
- `{{{svgContent}}}` - Raw content (no HTML escaping, for SVG injection)

**Available Templates:**
- `stack.html` - Main template with 5 text fields, content image, SVGs, and free text positioning
- `bullets-cards.html` - Header, footer, and 5 bullet cards with background images
- `fitfeed-capa.html` - FitFeed cover template with special styling support (see below)
- `dual-text.html`, `sandwich.html` - Legacy templates

**Template Registry:** `src/lib/schemas/templateRegistry.ts` maps template IDs to schemas and defaults.

### Special Styling (FitFeed Capa)

The `fitfeed-capa` template supports **line-based styling** that automatically detects natural line breaks and applies different styles to each line:

**How it works:**
1. Text is split into words, each wrapped in a `<span>`
2. Line breaks are detected by comparing `offsetTop` of adjacent words (GSAP SplitText technique)
3. Words are grouped by visual line
4. Custom styles are applied per line via `titleSpecialStyling.lineStyles` array

**Configuration:**
```json
{
  "titleSpecialStyling": {
    "enabled": true,
    "lineStyles": [
      { "color": "#FF6B00", "backgroundColor": "#000", "bold": true },
      { "color": "#FFF", "backgroundColor": "#FF6B00" }
    ]
  }
}
```

**JavaScript:** `public/js/line-detector.js` performs detection and styling in browser before screenshot.

See `SPECIAL-STYLING.md` for full documentation.

### State Management (Zustand)

- **editorStore** (`src/lib/store/editorStore.ts`) - Form data, selected template, preview state, generated images history
- **galleryStore** (`src/lib/store/galleryStore.ts`) - Persisted image gallery with filtering
- **templateStore** (`src/lib/store/templateStore.ts`) - Template presets and management

State is persisted to localStorage via Zustand middleware.

### Rich Text Processing

**Styled Chunks System:**
Text fields support rich formatting via `styledChunks` arrays:
```typescript
{
  text: "Hello World",
  styledChunks: [
    { text: "Hello", color: "#FF0000", bold: true },
    { text: "World", color: "#0000FF", italic: true }
  ]
}
```

Processing happens in:
1. `src/lib/utils/richTextConverter.ts` - Converts styled chunks to HTML spans
2. `src/lib/utils/textStyleProcessor.ts` - Handles inline syntax `[text|color:#FF0000]` and CSS conversion
3. `src/lib/utils/textProcessor.ts` - Main entry point for text processing

### Font Management

**Custom Fonts:**
- Stored in `public/fonts/` directory
- Font CSS defined in `public/fonts/fonts.css`
- Upload endpoint: `src/app/api/fonts/upload/route.ts`
- Font injection: `src/lib/services/fontInjector.ts` extracts font families from text styles and injects `@font-face` rules into HTML before Puppeteer renders

**Important:** Puppeteer needs `document.fonts.ready` promise to ensure custom fonts load before screenshot.

### Carousel Import Feature

Transforms external carousel JSON formats into internal slide format:
- Endpoint: `src/app/api/transform-carousel/route.ts`
- Transformer: `src/lib/utils/carouselTransformer.ts`
- Schema: `src/lib/schemas/carouselSchema.ts`
- Batch generation: `src/app/api/generate-batch/route.ts` processes multiple slides

**Layout System:** Base layouts in `templates/layouts/` (e.g., `stack-img.json`) provide default styling that gets merged with carousel data.

### SVG Handling

SVG rendering requires special handling in Puppeteer:
1. Wait for `waitForNavigation` after `setContent`
2. Additional 1-2 second delay for SVG paint
3. SVG color changes use CSS filters (see `convertColorToFilter` in `imageGenerator.ts`)

**SVG Positioning:** Stack template supports 2 positioned SVGs with:
- Manual coordinates (top, left, width, height)
- Special positions (top-left, top-right, bottom-left, bottom-right) with padding

### Gradient System

Two gradient structures supported:
1. **New format** (colors array): `{ colors: [{color: "#000", position: 0}], direction: "to top", opacity: 0.5 }`
2. **Old format** (enabled flag): `{ enabled: true, color: "#000", startOpacity: 0.7, height: 60 }`

Gradients are combined with background images in CSS: `linear-gradient(...), url(...)`.

**Card Gradients:** Stack template also supports card-level gradients via `cardGradientOverlay`.

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to `./src/*`

### UI Components

shadcn/ui components in `src/components/ui/` built on Radix UI primitives. Configuration in `components.json`.

## Important Implementation Details

### Image Generation (`imageGenerator.ts`)

- **Browser Instance:** Reuses single Puppeteer browser across requests for performance
- **Viewport:** Set to 1080x1440 with deviceScaleFactor: 2 for retina quality
- **Timeouts:** 15s for page load, 30s for navigation, additional delays for fonts/SVGs
- **Resource Loading:** Listens for `requestfailed` events to debug missing assets
- **BASE_URL:** Uses `process.env.BASE_URL` or `http://localhost:3000` for absolute URLs to fonts/images

### Special Positioning System

Free text and SVG elements support:
- **Manual positioning:** Direct pixel/percentage values for top, left, width, height
- **Special positions:** Corner presets (top-left, bottom-right, etc.) with padding percentage
- CSS variables injected via `{{styleVariables}}` placeholder in template

### Text Field Vertical Offsets

Stack template supports individual vertical offsets for text1-text5 to fine-tune spacing.

### Content Image

Stack template's content image section can be hidden via `hideContentImage` flag or automatically hidden when `contentImageUrl` is empty.

## Common Gotchas

1. **HTML in text fields:** If text already contains HTML from `applyStyledChunks`, don't re-process it in `replacePlaceholders`
2. **Font loading:** Always await `document.fonts.ready` before screenshot
3. **SVG rendering:** Need extra wait time after page load for SVG paint
4. **Placeholder removal:** Remove unused `{{*Style}}` placeholders after processing
5. **XSS prevention:** Text fields are sanitized except for triple-brace `{{{raw}}}` placeholders
6. **Path handling:** Use `process.cwd()` for file paths (not `__dirname`) to work with Next.js bundling

## Testing

Spec file: `src/lib/utils/carouselTransformer.spec.ts` tests carousel transformation logic.
- 🟢 AGENTES PARALELOS CLAUDE CODE
use sub agentes paralelos (importante nao lançar agente que vai dependender da resposta dos outros paralelamente, nesse caso espere e lance depois) para completar as tarefas preservando seu contexto e  aumentando a qualidade / velocidade, além de criar todos inteligentes.