# GEMINI.md

This file serves as the primary context and instruction manual for Gemini/Antigravity when working on the **ImageGen** project.

## 1. Project Overview

**ImageGen** is a Next.js 16 application designed to generate high-quality social media graphics. It functions by rendering HTML templates with dynamic data (JSON) and capturing them using Puppeteer.

### Core Tech Stack
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, CSS Modules (for templates)
- **State Management**: Zustand (persisted to localStorage)
- **Validation**: Zod
- **UI Components**: shadcn/ui (Radix Primitives + Tailwind)
- **Image Generation**: Puppeteer (Headless Chrome)

## 2. Agent Instructions & Guidelines

Follow these rules to ensure consistency and quality:

- **Tailwind CSS**: This project uses Tailwind CSS v4. Use it for all UI components. For *templates* (HTML files in `templates/`), use standard CSS or inline styles as they are rendered independently.
- **File Paths**: Always use absolute paths (e.g., `d:/Gevia/image-gen-nextjs/...`) or relative paths from the project root.
- **Special Styling**: When working with the `fitfeed-capa` template, ALWAYS consult `SPECIAL-STYLING.md`. This feature is complex and relies on specific browser-side JS (`line-detector.js`).
- **Puppeteer Context**: Remember that Puppeteer runs in a separate environment. Code executing in the browser (inside `page.evaluate`) cannot access Node.js variables directly.
- **State Updates**: When modifying stores (`editorStore`, etc.), ensure you handle the persistence logic correctly.
- **Testing**: Use the provided test JSON files (e.g., `test-carousel.json`) to validate changes to the generation logic.

## 3. Project Structure

```
d:/Gevia/image-gen-nextjs/
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   │   ├── api/             # Backend endpoints (generate, upload, etc.)
│   │   └── editor/          # Main editor UI
│   ├── components/          # React components (UI & Feature-specific)
│   │   └── ui/              # shadcn/ui primitives
│   ├── lib/
│   │   ├── schemas/         # Zod schemas (templates, carousel)
│   │   ├── services/        # Core logic (imageGenerator, fontInjector)
│   │   ├── store/           # Zustand stores (editor, gallery, template)
│   │   └── utils/           # Helpers (textProcessor, carouselTransformer)
├── public/
│   ├── fonts/               # Custom fonts & fonts.css
│   ├── js/                  # Browser-side scripts (line-detector.js)
│   └── output/              # Generated images (gitignored)
├── templates/               # HTML Templates for image generation
│   └── layouts/             # JSON Layout definitions
├── CLAUDE.md                # Reference for Claude AI
├── GEMINI.md                # Reference for Gemini (This file)
└── SPECIAL-STYLING.md       # Documentation for FitFeed special styling
```

## 4. Architecture & Core Flows

### Image Generation Pipeline
1.  **Input**: API receives JSON payload (`src/app/api/generate/route.ts`).
2.  **Processing**:
    -   `textProcessor.ts`: Converts rich text/styled chunks to HTML.
    -   `fontInjector.ts`: Injects `@font-face` rules for custom fonts.
3.  **Rendering**:
    -   `imageGenerator.ts`: Launches/reuses Puppeteer.
    -   Loads HTML template from `templates/`.
    -   Injects data (text, images, CSS variables).
    -   Waits for `document.fonts.ready` and network idle.
4.  **Capture**: Screenshots the page and saves to `public/output/`.

### Template System
Templates are standalone HTML files using Handlebars-like syntax:
-   `{{field}}`: Text replacement.
-   `{{field|style:prop}}`: Inline style injection.
-   `{{{svg}}}`: Raw HTML injection.

**Key Templates**:
-   `stack.html`: Versatile, supports absolute positioning.
-   `fitfeed-capa.html`: Supports "Special Styling" (line-based styling).

### Special Styling (FitFeed)
-   **Mechanism**: JS-based line detection (`public/js/line-detector.js`).
-   **Trigger**: `titleSpecialStyling` object in JSON.
-   **Conflict**: Mutually exclusive with `styledChunks`.

## 5. Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

## 6. Common Gotchas & Solutions

-   **Font Loading**: Puppeteer screenshots often happen before fonts load. *Solution*: We await `document.fonts.ready` in `imageGenerator.ts`.
-   **SVG Rendering**: SVGs need extra time to "paint" after being injected. *Solution*: A small delay is added after DOM manipulation.
-   **Path Resolution**: Next.js bundles code, breaking `__dirname`. *Solution*: Use `process.cwd()` to locate `templates/` and `public/` folders.
-   **Hot Reloading**: Changes to `templates/*.html` do NOT trigger Next.js hot reload. You must re-trigger the generation request.
-   **Zustand Persistence**: If the UI state looks wrong, try clearing `localStorage` or checking the `persist` middleware config.

## 7. Testing & Validation

-   **Carousel Logic**: Run `npm test` (or check `src/lib/utils/carouselTransformer.spec.ts`).
-   **Visual Testing**: Use `test-*.json` files with `curl` or the Editor UI to verify rendering.
    -   `test-fitfeed-special-styling.json`: Verifies line-based styling.
    -   `test-carousel.json`: Verifies carousel transformation.
