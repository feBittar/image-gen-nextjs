# Multi-Slide Architecture Design

## Overview

This document describes the new multi-slide architecture that replaces the Duo Mode system with a flexible N-slide carousel system.

## Key Changes

### 1. From Duo Mode → Multi-Slide Carousel

**Before:**
- Fixed 2-slide mode (Duo Mode)
- Toggle between "mirror" and "independent" modes
- Hardcoded slide1Data and slide2Data

**After:**
- Flexible N slides (1, 2, 3, 4, ...)
- 1 slide = static post (no carousel)
- 2+ slides = carousel mode
- Free image option appears only in carousel mode (2+ slides)

---

## Store Architecture (modularStore.ts)

### New State Structure

```typescript
interface ModularEditorState {
  // Preset
  currentPresetId: string | null
  currentPresetData: TemplatePreset | null

  // Multi-slide system
  slides: Array<{
    id: string                           // UUID for each slide
    data: Record<string, ModuleData>     // Per-slide module data
    enabledModules: string[]             // Per-slide enabled modules
  }>
  currentSlideIndex: number              // 0-based index (0, 1, 2, ...)

  // Shared/global modules (viewport, card styling, etc.)
  sharedModuleData: Record<string, ModuleData>

  // Free image (only for carousel mode: slides.length >= 2)
  freeImage: {
    enabled: boolean
    url: string
    offsetX: number                      // -500 to +500
    offsetY: number                      // -500 to +500
    scale: number                        // 50 to 200 (%)
    rotation: number                     // -180 to +180 (degrees)
    outlineEffect: {
      enabled: boolean
      color: string
      size: number                       // 0 to 50 (pixels)
    }
  }

  // Layout & composition
  compositionConfig: CompositionConfig | null

  // UI state
  activeModuleTab: string | null
  isDirty: boolean
  validationErrors: string[]
}
```

### Key Actions

```typescript
// Slide management
addSlide(): void                        // Adds new blank slide at end
removeSlide(index: number): void        // Removes slide at index
duplicateSlide(index: number): void     // Clones slide to end
moveSlide(from: number, to: number): void // Reorders slides
setCurrentSlideIndex(index: number): void

// Data management
updateSlideModule(slideIndex: number, moduleId: string, data: ModuleData): void
updateSharedModule(moduleId: string, data: ModuleData): void
toggleSlideModule(slideIndex: number, moduleId: string, enabled: boolean): void

// Free image
updateFreeImage(updates: Partial<FreeImageConfig>): void

// Helpers
getSlide(index: number): Slide
getCurrentSlide(): Slide
isCarouselMode(): boolean                // slides.length >= 2
```

---

## UI Components

### SlideTabBar Component

**New Features:**
- Shows all slides (not just 2)
- "+" button to add new slide
- "×" button on each tab to remove slide (minimum 1 slide)
- Drag-to-reorder (optional, future enhancement)
- Shows slide thumbnails (optional, future enhancement)

**Visibility:**
- Always visible (even with 1 slide)
- Shows slide count: "Slide 1 of 3"

**Example:**
```
┌─────────────────────────────────────────────────┐
│  [ Slide 1 ]  [ Slide 2 × ]  [ Slide 3 × ]  [+] │
└─────────────────────────────────────────────────┘
```

### ModularFormBuilder Changes

**Free Image Section:**
- Only rendered when `slides.length >= 2`
- Replaces Duo Module UI
- Simpler interface (no mode selection, no independent/mirror)

**Module Classification:**
- **Shared modules**: viewport, card (apply to all slides)
- **Per-slide modules**: textFields, contentImage, bullets, corners, logo, freeText, svgElements, arrowBottomText

---

## Generation Flow

### Single Slide (slides.length === 1)

```
1. Compose template normally
2. Viewport: 1080×1440
3. Generate single screenshot
4. Output: 1 PNG file
```

### Carousel (slides.length >= 2)

```
1. Calculate viewport: (slideCount × 1080) × 1440
2. For each slide:
   - Merge sharedModuleData + slide.data
   - Compose template with slide data
3. Arrange slides horizontally in flexbox
4. Add free image (if enabled) centered
5. Generate screenshots with clip regions:
   - Slide 1: { x: 0, y: 0, width: 1080, height: 1440 }
   - Slide 2: { x: 1080, y: 0, width: 1080, height: 1440 }
   - Slide N: { x: (N-1)*1080, y: 0, width: 1080, height: 1440 }
6. Output: N PNG files
```

### Free Image Positioning

**When carousel mode (2+ slides):**
- Position: `left: 50%` (center of total viewport width)
- Example with 3 slides (3240px):
  - Center X: 1620px
  - Free image centered at 1620px
  - Connects slides visually

**CSS:**
```css
.free-image {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%)
             translate(${offsetX}px, ${offsetY}px)
             scale(${scale / 100})
             rotate(${rotation}deg);
  z-index: 100;
  filter: /* outline effect */;
}
```

---

## HTML Structure (Carousel)

### With 3 Slides + Free Image

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 3240px;  /* 3 × 1080 */
      height: 1440px;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    .carousel-wrapper {
      display: flex;
      flex-direction: row;
      width: 3240px;
      height: 1440px;
    }

    .carousel-slide {
      width: 1080px;
      height: 1440px;
      position: relative;
      flex-shrink: 0;
    }

    .free-image {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
    }
  </style>
</head>
<body>
  <div class="carousel-wrapper">
    <div class="carousel-slide carousel-slide-1">
      <!-- Slide 1 content (from slide.data) -->
    </div>
    <div class="carousel-slide carousel-slide-2">
      <!-- Slide 2 content -->
    </div>
    <div class="carousel-slide carousel-slide-3">
      <!-- Slide 3 content -->
    </div>
  </div>

  <!-- Free image (if enabled) -->
  <img class="free-image" src="/images/vs.png" alt="Free Image">
</body>
</html>
```

---

## API Changes

### generate-modular API

**Request (Single Slide):**
```json
{
  "presetId": "stack",
  "enabledModules": ["viewport", "card", "textFields"],
  "moduleData": {
    "viewport": {...},
    "card": {...},
    "textFields": {...}
  }
}
```

**Request (Carousel - Multiple Slides):**
```json
{
  "presetId": "stack",
  "slides": [
    {
      "id": "uuid-1",
      "enabledModules": ["textFields", "contentImage"],
      "data": {
        "textFields": {...},
        "contentImage": {...}
      }
    },
    {
      "id": "uuid-2",
      "enabledModules": ["textFields", "bullets"],
      "data": {
        "textFields": {...},
        "bullets": {...}
      }
    }
  ],
  "sharedModuleData": {
    "viewport": {...},
    "card": {...}
  },
  "freeImage": {
    "enabled": true,
    "url": "/images/vs.png",
    "offsetX": 0,
    "offsetY": -50,
    "scale": 120,
    "rotation": -5,
    "outlineEffect": {
      "enabled": true,
      "color": "#000000",
      "size": 15
    }
  }
}
```

**Response (Carousel):**
```json
{
  "success": true,
  "images": [
    "/output/carousel-123-1.png",
    "/output/carousel-123-2.png",
    "/output/carousel-123-3.png"
  ],
  "htmlUrl": "/output/carousel-123.html",
  "durationMs": 3456
}
```

---

## Viewport Calculation

### Formula

```typescript
function calculateViewport(slideCount: number): {
  viewportWidth: number;
  viewportHeight: number;
} {
  return {
    viewportWidth: slideCount * 1080,  // N × 1080
    viewportHeight: 1440,               // Always 1440
  };
}
```

### Examples

- 1 slide: 1080×1440
- 2 slides: 2160×1440
- 3 slides: 3240×1440
- 4 slides: 4320×1440

---

## Module System Changes

### Remove Duo Module

- Delete `src/lib/modules/duo/` directory
- Remove from registry
- Remove DuoForm from ModularFormBuilder

### Add Free Image Module (Optional Approach)

**Option 1: Built-in to modularStore (Recommended)**
- No separate module
- Part of core carousel functionality
- Always available when slides.length >= 2

**Option 2: New FreeImage module**
- Create `src/lib/modules/free-image/`
- Only enabled when slides.length >= 2
- Provides UI and schema

**Decision:** Use Option 1 (built-in) for simplicity.

---

## Compositer Changes

### New Carousel Composition Function

```typescript
async function composeCarousel(
  slides: Array<SlideConfig>,
  sharedModuleData: Record<string, ModuleData>,
  freeImage: FreeImageConfig,
  options: CompositionOptions
): Promise<ComposedTemplate> {
  const slideCount = slides.length;
  const viewportWidth = slideCount * 1080;
  const viewportHeight = 1440;

  // Compose each slide
  const slideHTMLs = await Promise.all(
    slides.map(async (slide) => {
      const mergedData = { ...sharedModuleData, ...slide.data };
      return await composeSlideContent(slide.enabledModules, mergedData, options);
    })
  );

  // Wrap in carousel structure
  const carouselHTML = wrapInCarousel(slideHTMLs, freeImage);

  // Collect all CSS
  const allCSS = collectCSS(slides, sharedModuleData) + generateCarouselCSS(slideCount);

  return {
    html: carouselHTML,
    css: allCSS,
    viewportWidth,
    viewportHeight,
  };
}
```

---

## Screenshot Generation

### Puppeteer Clipping

```typescript
async function captureCarouselSlides(
  page: Page,
  slideCount: number,
  outputDir: string,
  timestamp: number
): Promise<string[]> {
  const filePaths: string[] = [];

  for (let i = 0; i < slideCount; i++) {
    const filename = `carousel-${timestamp}-${i + 1}.png`;
    const filepath = path.join(outputDir, filename);

    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: {
        x: i * 1080,      // Slide offset
        y: 0,
        width: 1080,
        height: 1440,
      },
    });

    filePaths.push(filepath);
  }

  return filePaths;
}
```

---

## Migration Path

### Backward Compatibility

**Duo Mode → Multi-Slide:**
- Detect old duo config in localStorage
- Convert to 2-slide carousel:
  - `slide1Data` → `slides[0].data`
  - `slide2Data` → `slides[1].data`
  - `duo.centerImageUrl` → `freeImage.url`
  - `duo.centerImage*` → `freeImage.*`

### Migration Function

```typescript
function migrateDuoToMultiSlide(oldState: OldState): NewState {
  if (!oldState.moduleData?.duo?.enabled) {
    // Single slide mode
    return {
      slides: [{
        id: generateId(),
        data: oldState.moduleData,
        enabledModules: oldState.enabledModules,
      }],
      currentSlideIndex: 0,
      sharedModuleData: extractShared(oldState.moduleData),
      freeImage: defaultFreeImage,
    };
  }

  // Duo mode → 2 slides
  return {
    slides: [
      {
        id: generateId(),
        data: oldState.slide1Data || oldState.moduleData,
        enabledModules: oldState.slide1EnabledModules || oldState.enabledModules,
      },
      {
        id: generateId(),
        data: oldState.slide2Data || oldState.moduleData,
        enabledModules: oldState.slide2EnabledModules || oldState.enabledModules,
      },
    ],
    currentSlideIndex: 0,
    sharedModuleData: extractShared(oldState.moduleData),
    freeImage: {
      enabled: true,
      url: oldState.moduleData.duo.centerImageUrl,
      offsetX: oldState.moduleData.duo.centerImageOffsetX,
      offsetY: oldState.moduleData.duo.centerImageOffsetY,
      scale: oldState.moduleData.duo.centerImageScale,
      rotation: oldState.moduleData.duo.centerImageRotation,
      outlineEffect: oldState.moduleData.duo.outlineEffect,
    },
  };
}
```

---

## Benefits

1. **Flexibility**: Unlimited slides (not just 2)
2. **Simplicity**: No complex mode switching (mirror/independent)
3. **Clarity**: "Free image" is more descriptive than "center image"
4. **Scalability**: Easy to add 3, 4, 5+ slide carousels
5. **Intuitive**: 1 slide = post, 2+ slides = carousel

---

## Future Enhancements

- Drag-to-reorder slides
- Slide thumbnails in tab bar
- Bulk edit across all slides
- Slide templates/presets
- Animation previews (carousel rotation)
- Export as video (animated carousel)
