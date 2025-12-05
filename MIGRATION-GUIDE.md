# Migration Guide: Template System to Modular Architecture

## Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Why the Change](#why-the-change)
4. [Architecture Comparison](#architecture-comparison)
5. [Understanding the Module System](#understanding-the-module-system)
6. [Understanding the Preset System](#understanding-the-preset-system)
7. [API Changes](#api-changes)
8. [Migration Steps](#migration-steps)
9. [Breaking Changes](#breaking-changes)
10. [FAQ](#faq)

---

## Overview

ImageGen has evolved from a **template-based system** to a **modular, plug-and-play architecture**. This migration guide helps existing users and developers transition to the new system while maintaining backward compatibility during the transition period.

### What Changed

**Before (Template System):**
- Individual HTML template files (`stack.html`, `bullets-cards.html`, etc.)
- Each template had isolated code and styling
- Fixed layouts with limited customization
- `/api/generate` endpoint with template ID

**After (Modular System):**
- Universal, reusable modules (viewport, card, textFields, etc.)
- Mix-and-match module combinations
- Templates become "presets" - pre-configured module combinations
- `/api/generate-modular` endpoint with dynamic module composition

### Migration Timeline

- **Phase 1 (Current)**: Both systems coexist - old `/api/generate` and new `/api/generate-modular`
- **Phase 2 (Recommended)**: Migrate to modular system for new projects
- **Phase 3 (Future)**: Legacy template system will be deprecated (timeline TBD)

---

## Why the Change

### Benefits of the Modular Approach

1. **Flexibility**: Mix and match any modules to create custom layouts
2. **Reusability**: Write once, use everywhere - no code duplication
3. **Maintainability**: Update a module once, all layouts benefit
4. **Extensibility**: Add new modules without touching existing code
5. **Composability**: Create infinite layout variations from finite modules
6. **Type Safety**: Zod schemas ensure data integrity across all modules
7. **Developer Experience**: Clear module boundaries and predictable behavior

### Example: Creating a New Layout

**Before (Template System):**
```
1. Copy existing template HTML file
2. Modify HTML structure
3. Update CSS
4. Adjust placeholder syntax
5. Test entire template
6. Register in template registry
```

**After (Modular System):**
```
1. Enable desired modules
2. Configure module settings
3. Done!
```

---

## Architecture Comparison

### Old Architecture (Templates)

```
┌─────────────────────────────────────────┐
│         Template Files                   │
│  ┌────────────┐  ┌────────────┐         │
│  │ stack.html │  │bullets.html│  ...    │
│  └────────────┘  └────────────┘         │
│         ↓                ↓               │
│  ┌────────────────────────────┐         │
│  │  /api/generate             │         │
│  │  (template ID + data)      │         │
│  └────────────────────────────┘         │
│         ↓                                │
│  ┌────────────────────────────┐         │
│  │  Puppeteer Screenshot      │         │
│  └────────────────────────────┘         │
└─────────────────────────────────────────┘
```

### New Architecture (Modules)

```
┌─────────────────────────────────────────────────────────┐
│                   Module Registry                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Viewport │ │   Card   │ │TextFields│ │  Corners │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Logo   │ │ FreeText │ │   Duo    │ │ Bullets  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│         ↓                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Template Presets                        │  │
│  │  (Pre-configured module combinations)            │  │
│  │  - Stack (viewport + card + textFields + ...)    │  │
│  │  - Versus Duo (viewport + textFields + duo)      │  │
│  │  - Bullet Cards (viewport + bullets + ...)       │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │      /api/generate-modular                        │  │
│  │  (enabled modules + module data)                  │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Template Composer                            │  │
│  │  - Validate module compatibility                  │  │
│  │  - Merge CSS from all modules                     │  │
│  │  - Merge HTML from all modules                    │  │
│  │  - Respect z-index layering                       │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Puppeteer Screenshot                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Understanding the Module System

### What is a Module?

A module is a self-contained, reusable component that:
- Has a unique ID (e.g., `viewport`, `textFields`, `duo`)
- Provides its own CSS and HTML generation logic
- Defines a Zod schema for validation
- Has default values
- Includes a React form component for editing
- Specifies z-index for layering
- Can declare dependencies and conflicts

### Module Categories

Modules are organized into four categories:

1. **Layout Modules** (`layout`)
   - `viewport` - Background, blur, gradient overlay
   - `card` - Main content card with padding, background, shadow
   - `duo` - Split-screen layout for comparison slides

2. **Content Modules** (`content`)
   - `textFields` - Stack of styled text fields
   - `contentImage` - Image with positioning and sizing
   - `bullets` - Bullet point cards with icons

3. **Overlay Modules** (`overlay`)
   - `corners` - Corner elements (text/SVG/image)
   - `freeText` - Positioned text elements
   - `svgElements` - Positioned SVG graphics
   - `logo` - Logo positioning
   - `arrowBottomText` - Bottom arrow with text

4. **Special Modules** (`special`)
   - Special behavior modules like `duo` that modify generation

### Available Modules

| Module ID | Name | Description | z-index |
|-----------|------|-------------|---------|
| `viewport` | Viewport | Background color/image, blur, gradient | 0 |
| `card` | Card | Main content card with styling | 1 |
| `textFields` | Text Fields | Stack of styled text fields | 10 |
| `contentImage` | Content Image | Image with positioning | 5 |
| `bullets` | Bullet Cards | Bullet points with icons | 10 |
| `corners` | Corner Elements | 4 corner positions for text/SVG | 99 |
| `freeText` | Free Text | Positioned text elements | 30 |
| `svgElements` | SVG Elements | Positioned SVG graphics | 20 |
| `logo` | Logo | Logo with positioning | 30 |
| `arrowBottomText` | Arrow Bottom Text | Bottom arrow with text | 30 |
| `duo` | Duo Layout | Split-screen for comparison | 100 |

### Module Structure

Every module follows this structure:

```typescript
// File: src/lib/modules/[module-name]/index.ts
import { ModuleDefinition } from '../types';

export const MyModule: ModuleDefinition = {
  id: 'myModule',
  name: 'My Module',
  description: 'What this module does',
  icon: LucideIcon, // Icon component
  category: 'content',
  schema: myModuleSchema, // Zod schema
  defaults: { /* default values */ },
  FormComponent: MyModuleForm, // React component
  getCss: (data, context) => '/* CSS */',
  getHtml: (data, context) => '<!-- HTML -->',
  getStyleVariables: (data) => ({ /* CSS vars */ }),
  zIndex: 10,
  dependencies: [], // Optional
  conflicts: [], // Optional
};
```

### Creating a New Module

1. **Create module directory**: `src/lib/modules/my-module/`

2. **Define schema** (`schema.ts`):
```typescript
import { z } from 'zod';

export const myModuleSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().default(''),
  color: z.string().default('#000000'),
});

export type MyModuleData = z.infer<typeof myModuleSchema>;

export const myModuleDefaults: MyModuleData = {
  enabled: true,
  text: '',
  color: '#000000',
};
```

3. **Generate CSS** (`css.ts`):
```typescript
import { MyModuleData } from './schema';

export function getMyModuleCss(data: MyModuleData): string {
  if (!data.enabled) return '';

  return `
    .my-module {
      color: ${data.color};
    }
  `;
}

export function getMyModuleStyleVariables(data: MyModuleData): Record<string, string> {
  return {
    '--my-module-color': data.color,
  };
}
```

4. **Generate HTML** (`html.ts`):
```typescript
import { MyModuleData } from './schema';

export function getMyModuleHtml(data: MyModuleData): string {
  if (!data.enabled) return '';

  return `
    <div class="my-module">
      ${data.text}
    </div>
  `;
}
```

5. **Create form component** (`MyModuleForm.tsx`):
```typescript
import { ModuleFormProps } from '../types';
import { MyModuleData } from './schema';

export function MyModuleForm({ watch, setValue }: ModuleFormProps<MyModuleData>) {
  const enabled = watch('enabled');

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setValue('enabled', e.target.checked)}
        />
        Enable
      </label>
      {/* More form fields */}
    </div>
  );
}
```

6. **Export module** (`index.ts`):
```typescript
import { ModuleDefinition } from '../types';
import { myModuleSchema, myModuleDefaults } from './schema';
import { getMyModuleCss, getMyModuleStyleVariables } from './css';
import { getMyModuleHtml } from './html';
import { MyModuleForm } from './MyModuleForm';
import { Box } from 'lucide-react';

export const MyModule: ModuleDefinition = {
  id: 'myModule',
  name: 'My Module',
  description: 'My custom module',
  icon: Box,
  category: 'content',
  schema: myModuleSchema,
  defaults: myModuleDefaults,
  FormComponent: MyModuleForm as any,
  getCss: getMyModuleCss,
  getHtml: getMyModuleHtml,
  getStyleVariables: getMyModuleStyleVariables,
  zIndex: 15,
};
```

7. **Register in registry** (`src/lib/modules/registry.ts`):
```typescript
import { MyModule } from './my-module';

export const moduleRegistry = {
  // ... existing modules
  myModule: MyModule,
};
```

### Module Dependencies and Conflicts

**Dependencies**: A module can require other modules to function.

```typescript
export const MyModule: ModuleDefinition = {
  // ...
  dependencies: ['viewport', 'card'], // Requires these modules
};
```

**Conflicts**: A module can conflict with others (mutually exclusive).

```typescript
export const SingleImageModule: ModuleDefinition = {
  // ...
  conflicts: ['duo'], // Cannot be used with duo module
};
```

---

## Understanding the Preset System

### What is a Preset?

A preset is a **pre-configured combination of modules** that serves as a starting point for a specific type of graphic. It replaces the old "templates" concept.

### Preset Structure

```typescript
export const stackPreset: TemplatePreset = {
  id: 'stack',
  name: 'Stack Layout',
  description: 'Classic stack layout with text fields and content image',
  thumbnail: '/thumbnails/stack.png',

  // Which modules are enabled by default
  defaultModules: [
    'viewport',
    'card',
    'textFields',
    'contentImage',
    'corners',
    'logo',
  ],

  // Custom default values for each module (overrides module defaults)
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
    },
    card: {
      enabled: true,
      width: 85,
      height: 85,
      borderRadius: 20,
    },
    textFields: {
      count: 5,
      gap: 20,
      // ... field configurations
    },
    // ... other module configs
  },
};
```

### Available Presets

| Preset ID | Name | Description | Modules Used |
|-----------|------|-------------|--------------|
| `stack` | Stack Layout | Classic stacked text layout | viewport, card, textFields, contentImage, corners, logo |
| `versus-duo` | Versus Duo | Two-slide comparison | viewport, card, textFields, corners, duo |
| `bullet-cards` | Bullet Cards | Bullet points with icons | viewport, card, textFields, bullets, corners, logo |
| `fitfeed-capa` | FitFeed Capa | Cover-style template | viewport, textFields, freeText, corners, logo |
| `minimal` | Minimal | Clean starting point | viewport, card, textFields |

### Creating a Custom Preset

Add to `src/lib/presets/index.ts`:

```typescript
export const myCustomPreset: TemplatePreset = {
  id: 'my-custom',
  name: 'My Custom Layout',
  description: 'My custom preset description',
  thumbnail: '/thumbnails/my-custom.png', // Optional

  defaultModules: [
    'viewport',
    'textFields',
    'logo',
  ],

  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#f0f0f0',
    },
    textFields: {
      count: 3,
      gap: 40,
      fields: [
        {
          content: '',
          style: {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontWeight: '700',
            color: '#000000',
          },
          styledChunks: [],
          verticalOffset: 0,
        },
        // ... more fields
      ],
    },
    logo: {
      enabled: true,
      specialPosition: 'top-right',
    },
  },
};

// Register the preset
export const presetRegistry = {
  // ... existing presets
  'my-custom': myCustomPreset,
};
```

---

## API Changes

### Old API: `/api/generate`

**Request:**
```json
POST /api/generate

{
  "template": "stack",
  "title": "Hello World",
  "titleStyle": {
    "fontFamily": "Arial",
    "fontSize": "48px",
    "color": "#000000"
  },
  "text1": "First line",
  "text2": "Second line",
  "cardBackgroundImage": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "image-1234567890.png",
    "url": "/output/image-1234567890.png",
    "timestamp": 1234567890
  }
}
```

### New API: `/api/generate-modular`

**Request:**
```json
POST /api/generate-modular

{
  "presetId": "stack",  // Optional: start from a preset
  "enabledModules": [
    "viewport",
    "card",
    "textFields",
    "logo"
  ],
  "moduleData": {
    "viewport": {
      "backgroundType": "color",
      "backgroundColor": "#ffffff"
    },
    "card": {
      "enabled": true,
      "width": 85,
      "height": 85,
      "backgroundType": "image",
      "backgroundImage": "https://example.com/image.jpg"
    },
    "textFields": {
      "count": 2,
      "gap": 30,
      "fields": [
        {
          "content": "Hello World",
          "style": {
            "fontFamily": "Arial",
            "fontSize": "48px",
            "color": "#000000"
          },
          "styledChunks": []
        },
        {
          "content": "Second line",
          "style": {
            "fontFamily": "Arial",
            "fontSize": "32px",
            "color": "#666666"
          },
          "styledChunks": []
        }
      ]
    },
    "logo": {
      "enabled": true,
      "logoUrl": "https://example.com/logo.png",
      "specialPosition": "top-right"
    }
  },
  "outputOptions": {
    "format": "png",
    "quality": 100,
    "filename": "my-custom-image"
  }
}
```

**Response:**
```json
{
  "success": true,
  "images": [
    "/output/my-custom-image.png"
  ],
  "filenames": [
    "my-custom-image.png"
  ],
  "htmlUrl": "/output/modular-1234567890.html",
  "durationMs": 2543
}
```

### Using a Preset

You can start from a preset and override specific values:

```json
POST /api/generate-modular

{
  "presetId": "stack",  // Start from stack preset
  "enabledModules": ["viewport", "card", "textFields"],  // Only these modules
  "moduleData": {
    "textFields": {
      // Override just the text field content
      "fields": [
        {
          "content": "My custom text",
          "style": {
            "fontSize": "60px"
          }
        }
      ]
    }
  }
}
```

The preset provides all the default configuration, and you only override what you need.

### Duo Module (Multiple Images)

When the `duo` module is enabled, the API returns **two images**:

```json
{
  "success": true,
  "images": [
    "/output/modular-1234567890-1.png",
    "/output/modular-1234567890-2.png"
  ],
  "filenames": [
    "modular-1234567890-1.png",
    "modular-1234567890-2.png"
  ],
  "htmlUrl": "/output/modular-1234567890.html",
  "durationMs": 3120
}
```

---

## Migration Steps

### For Existing Template Users

#### Option 1: Use Preset Equivalents

Most old templates have preset equivalents:

| Old Template | New Preset | Notes |
|--------------|------------|-------|
| `stack` | `stack` | Direct equivalent |
| `bullets-cards` | `bullet-cards` | Direct equivalent |
| `fitfeed-capa` | `fitfeed-capa` | Direct equivalent |
| `versus-duo` | `versus-duo` | Direct equivalent |
| `dual-text` | `minimal` | Use minimal and customize |
| `sandwich` | `minimal` | Use minimal and customize |

**Example Migration:**

```javascript
// Before
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: 'stack',
    text1: 'Hello World',
    text1Style: { fontSize: '48px', color: '#000' },
    cardBackgroundImage: 'https://example.com/bg.jpg',
  }),
});

// After
const response = await fetch('/api/generate-modular', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    presetId: 'stack',
    enabledModules: ['viewport', 'card', 'textFields'],
    moduleData: {
      textFields: {
        fields: [
          {
            content: 'Hello World',
            style: { fontSize: '48px', color: '#000' },
          },
        ],
      },
      card: {
        backgroundType: 'image',
        backgroundImage: 'https://example.com/bg.jpg',
      },
    },
  }),
});
```

#### Option 2: Continue Using Old API

The old `/api/generate` endpoint still works. You can migrate gradually:

```javascript
// Old API still works during transition period
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    template: 'stack',
    text1: 'Hello World',
  }),
});
```

### For Custom Template Creators

If you created custom HTML templates, you need to convert them to modules:

#### Step 1: Identify Components

Break down your template into logical components:

```html
<!-- Old template.html -->
<div class="viewport" style="background: {{backgroundColor}}">
  <div class="card">
    <div class="header">{{headerText}}</div>
    <div class="content">{{contentText}}</div>
    <img class="logo" src="{{logoUrl}}" />
  </div>
</div>
```

Components identified:
- Viewport (background)
- Card (container)
- Text fields (header, content)
- Logo

#### Step 2: Map to Existing Modules

Check if existing modules cover your needs:

| Component | Module | Notes |
|-----------|--------|-------|
| Viewport | `viewport` | Use existing |
| Card | `card` | Use existing |
| Header | `textFields` | Use existing (field 1) |
| Content | `textFields` | Use existing (field 2) |
| Logo | `logo` | Use existing |

#### Step 3: Create Preset

Create a preset with your configuration:

```typescript
export const myTemplatePreset: TemplatePreset = {
  id: 'my-template',
  name: 'My Template',
  description: 'Converted from my custom template',
  defaultModules: ['viewport', 'card', 'textFields', 'logo'],
  moduleDefaults: {
    viewport: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
    },
    card: {
      enabled: true,
      width: 90,
      height: 90,
    },
    textFields: {
      count: 2,
      fields: [
        { /* header config */ },
        { /* content config */ },
      ],
    },
    logo: {
      enabled: true,
      specialPosition: 'top-right',
    },
  },
};
```

#### Step 4: Create Custom Module (If Needed)

If existing modules don't cover your needs, create a custom module:

```typescript
// src/lib/modules/my-feature/index.ts
export const MyFeatureModule: ModuleDefinition = {
  id: 'myFeature',
  name: 'My Feature',
  description: 'Custom feature not covered by existing modules',
  category: 'content',
  schema: myFeatureSchema,
  defaults: myFeatureDefaults,
  FormComponent: MyFeatureForm,
  getCss: (data) => `/* CSS */`,
  getHtml: (data) => `<!-- HTML -->`,
  getStyleVariables: (data) => ({}),
  zIndex: 15,
};
```

Register it:

```typescript
// src/lib/modules/registry.ts
import { MyFeatureModule } from './my-feature';

export const moduleRegistry = {
  // ... existing modules
  myFeature: MyFeatureModule,
};
```

---

## Breaking Changes

### 1. API Endpoint Change

**Breaking**: `/api/generate` uses different request format than `/api/generate-modular`

**Mitigation**: Both endpoints coexist. Migrate at your own pace.

### 2. Data Structure Changes

**Breaking**: Module data is nested under `moduleData[moduleId]` instead of flat structure.

```javascript
// Before
{
  text1: 'Hello',
  text1Style: { fontSize: '48px' }
}

// After
{
  moduleData: {
    textFields: {
      fields: [
        { content: 'Hello', style: { fontSize: '48px' } }
      ]
    }
  }
}
```

**Mitigation**: Old API maintains old structure. New API uses new structure.

### 3. Template Registry Changes

**Breaking**: `templateRegistry.ts` is replaced by `presetRegistry` and `moduleRegistry`.

**Mitigation**: Old registry still exists for `/api/generate`. New presets in `src/lib/presets/index.ts`.

### 4. Field Naming

**Breaking**: Some field names changed for consistency:

| Old Name | New Name | Module |
|----------|----------|--------|
| `title` | `fields[0].content` | textFields |
| `subtitle` | `fields[1].content` | textFields |
| `headerText` | `fields[0].content` | textFields |
| `text1` - `text5` | `fields[0-4].content` | textFields |

**Mitigation**: Use presets which handle mapping automatically.

### 5. Styled Chunks Location

**Breaking**: Styled chunks moved from global to per-field:

```javascript
// Before
{
  text1: 'Hello World',
  styledChunks: [
    { text: 'Hello', color: '#ff0000' },
    { text: 'World', color: '#0000ff' }
  ]
}

// After
{
  moduleData: {
    textFields: {
      fields: [
        {
          content: 'Hello World',
          styledChunks: [
            { text: 'Hello', color: '#ff0000' },
            { text: 'World', color: '#0000ff' }
          ]
        }
      ]
    }
  }
}
```

**Mitigation**: Update client code to nest styled chunks per field.

### 6. Special Styling (FitFeed Capa)

**Breaking**: Special styling now handled differently.

**Old way**: Global `titleSpecialStyling` object

**New way**: Use `styledChunks` or create custom module

**Mitigation**: TBD - special styling module in development.

---

## FAQ

### Q: Do I have to migrate immediately?

**A:** No. The old `/api/generate` endpoint still works. You can migrate gradually or continue using the old system.

---

### Q: Can I use both systems at the same time?

**A:** Yes. You can call `/api/generate` for some requests and `/api/generate-modular` for others.

---

### Q: What happens to my existing HTML templates?

**A:** They still work with `/api/generate`. However, new features will only be added to the modular system.

---

### Q: How do I know which modules to use?

**A:** Start with a preset that's close to what you need, then enable/disable modules as needed. Use the module registry to see all available modules.

---

### Q: Can I create custom modules?

**A:** Yes! Follow the "Creating a New Module" section in this guide. All modules follow the same structure.

---

### Q: What if I need functionality not covered by existing modules?

**A:** Three options:
1. Combine existing modules creatively
2. Create a custom module
3. Request a new module (file an issue/feature request)

---

### Q: How does z-index work with modules?

**A:** Each module has a z-index property. During composition, modules are layered automatically:
- Layout modules (0-1): Background layers
- Content modules (5-10): Main content
- Overlay modules (20-30): Decorative elements
- Special modules (99-100): Top layer

---

### Q: Can modules conflict with each other?

**A:** Yes. Modules can declare conflicts (e.g., `duo` conflicts with single-image modules). The system validates compatibility and returns errors if conflicts exist.

---

### Q: How do I debug generated HTML?

**A:** The modular API returns `htmlUrl` in the response. Open this URL to see the exact HTML used for rendering.

```json
{
  "htmlUrl": "/output/modular-1234567890.html"
}
```

---

### Q: What happens with Duo module?

**A:** Duo module is special - it modifies the viewport width (2160px instead of 1080px) and generates two images (left and right halves). The API returns an array of image URLs instead of a single URL.

---

### Q: How do I pass styled chunks?

**A:** Styled chunks are now per-field in the textFields module:

```json
{
  "moduleData": {
    "textFields": {
      "fields": [
        {
          "content": "Hello World",
          "styledChunks": [
            { "text": "Hello", "color": "#ff0000", "bold": true },
            { "text": "World", "color": "#0000ff" }
          ]
        }
      ]
    }
  }
}
```

---

### Q: Can I override preset defaults?

**A:** Yes! Specify `presetId` and provide `moduleData` to override specific values:

```json
{
  "presetId": "stack",
  "moduleData": {
    "card": {
      "backgroundColor": "#000000"  // Override preset default
    }
  }
}
```

---

### Q: How do I position elements?

**A:** Use special positions or manual coordinates:

**Special positions:**
```json
{
  "logo": {
    "specialPosition": "top-right",
    "paddingX": 5,
    "paddingY": 5
  }
}
```

**Manual positions:**
```json
{
  "logo": {
    "position": {
      "top": "100px",
      "left": "50px",
      "width": "200px"
    }
  }
}
```

---

### Q: What about font loading?

**A:** Font loading works the same way - upload fonts to `public/fonts/`, define in `fonts.css`, and reference by family name in text styles.

---

### Q: Can I see module source code?

**A:** Yes! All modules are in `src/lib/modules/[module-name]/`. Each module is self-contained:
- `schema.ts` - Zod schema and types
- `css.ts` - CSS generation
- `html.ts` - HTML generation
- `FormComponent.tsx` - React form
- `index.ts` - Module definition

---

### Q: How do I contribute a new module?

**A:**
1. Create module directory in `src/lib/modules/`
2. Follow the module structure (schema, css, html, form, index)
3. Register in `src/lib/modules/registry.ts`
4. Add preset if applicable
5. Test thoroughly
6. Submit pull request

---

### Q: Are there TypeScript types for everything?

**A:** Yes! All modules use Zod schemas which generate TypeScript types automatically. Use `z.infer<typeof schema>` to get types.

---

### Q: What about performance?

**A:** The modular system has similar performance to the template system. The composition step adds minimal overhead (<50ms). Puppeteer rendering time is the main bottleneck (~2-3 seconds).

---

### Q: Can I use the modular system in the UI?

**A:** Yes! The UI already supports the modular system. Each module has a `FormComponent` that renders in the editor.

---

### Q: What if I find a bug?

**A:** File an issue with:
- Which modules you're using
- Module data (JSON)
- Expected vs actual output
- Error messages
- Generated HTML URL

---

### Q: Where can I see examples?

**A:** Check `src/lib/presets/index.ts` for preset examples. Each preset shows how to configure modules for different layouts.

---

## Summary

The modular system brings flexibility and maintainability to ImageGen while maintaining backward compatibility with the template system. You can:

- **Keep using** the old `/api/generate` endpoint
- **Start using** the new `/api/generate-modular` endpoint with presets
- **Gradually migrate** at your own pace
- **Create custom modules** for unique requirements
- **Mix and match** modules to create infinite layout variations

For questions or support, please file an issue or consult the documentation in `CLAUDE.md`.
