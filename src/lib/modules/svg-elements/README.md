# SVG Elements Module

The SVG Elements module provides positioned SVG elements (icons, decorations, logos) that can be placed anywhere on the viewport.

## Features

- **Up to 3 SVG elements** per template
- **Enable/disable** each element individually
- **Two positioning modes:**
  - Manual positioning (px or %) with top, left, right, bottom
  - Special position presets (corners, edges, center) with padding
- **Color override** via CSS filters (changes SVG fill color without modifying the SVG file)
- **Rotation** (0-360 degrees)
- **Opacity** control (0-1)
- **Z-index override** per element (defaults to module z-index: 20)
- **Percentage-based padding** when using special positions (scales with viewport)
- **Compatible with Duo module** (SVGs are duplicated for each slide)

## Module Definition

```typescript
{
  id: 'svg-elements',
  name: 'SVG Elements',
  description: 'Add positioned SVG elements (icons, decorations, logos)',
  icon: Image,
  category: 'overlay',
  zIndex: 20, // Above content (10), below free text (30) and corners (99)
}
```

## Schema

### `svgElements` (array)

Array of up to 3 SVG element configurations:

```typescript
{
  enabled: boolean;           // Enable/disable this SVG element
  svgUrl: string;            // SVG URL or path (e.g., /logos/icon.svg)
  color: string;             // Color override (hex) - applied via CSS filter
  width: string;             // SVG width (e.g., "100px" or "10%")
  height: string;            // SVG height (e.g., "100px" or "10%")
  position: {                // Manual position (used when specialPosition is 'none')
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
  };
  specialPosition: string;   // Special position preset (see below)
  specialPadding: number;    // Padding from edge when using special position (0-20%)
  rotation: number;          // Rotation in degrees (0-360)
  opacity: number;           // Opacity (0-1)
  zIndexOverride?: number;   // Optional z-index override
}
```

### Special Positions

- `none` - Use manual positioning
- `top-left` - Top left corner with padding
- `top-right` - Top right corner with padding
- `top-center` - Top edge, horizontally centered
- `bottom-left` - Bottom left corner with padding
- `bottom-right` - Bottom right corner with padding
- `bottom-center` - Bottom edge, horizontally centered
- `center-left` - Left edge, vertically centered
- `center-right` - Right edge, vertically centered
- `center` - Center of viewport

## Usage Example

```typescript
import { svgElementsModule } from '@/lib/modules/svg-elements';

const data = {
  svgElements: [
    {
      enabled: true,
      svgUrl: '/logos/company-logo.svg',
      color: '#FF6B00',
      width: '120px',
      height: '120px',
      specialPosition: 'top-left',
      specialPadding: 5, // 5% from edges
      rotation: 0,
      opacity: 1,
    },
    {
      enabled: true,
      svgUrl: '/icons/decoration.svg',
      color: '#ffffff',
      width: '80px',
      height: '80px',
      position: { top: '200px', left: '100px' },
      specialPosition: 'none',
      rotation: 45,
      opacity: 0.7,
    },
  ],
};

// Get CSS
const css = svgElementsModule.getCss(data, context);

// Get HTML
const html = svgElementsModule.getHtml(data, context);
```

## Color Override

The color override feature uses CSS filters to change the SVG fill color without modifying the SVG file itself. This is particularly useful for:

- White icons: `#ffffff` → `brightness(0) invert(1)`
- Black icons: `#000000` → `brightness(0)`
- Colored icons: Uses a combination of hue, saturation, and brightness filters

**Note:** For accurate color conversion, the SVG should be mostly monochrome. Complex multi-colored SVGs may not convert accurately.

## File Structure

```
svg-elements/
├── schema.ts              # Zod schema and types
├── css.ts                 # CSS generation logic
├── html.ts                # HTML generation logic
├── SvgElementsForm.tsx    # React form component
├── index.ts               # Module definition and exports
└── README.md              # This file
```

## Integration

The module is registered in `src/lib/modules/registry.ts`:

```typescript
import { svgElementsModule } from './svg-elements';

export const moduleRegistry = {
  // ...
  svgElements: svgElementsModule,
  // ...
};
```

## Z-Index Layering

- Viewport: 0
- Card: 1
- Content Image: 5
- Text Fields: 10
- **SVG Elements: 20** ← This module
- Free Text: 30
- Logo: 30
- Corners: 99
- Duo: 100

## Dependencies

None

## Conflicts

None
