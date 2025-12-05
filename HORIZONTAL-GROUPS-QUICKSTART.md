# Horizontal Groups Quick Start

## Quick Usage

### Via UI (Easiest)

1. Open Composition Order Editor
2. Click **"Create Horizontal Split"**
3. Select **left module**
4. Select **right module**
5. Choose **proportion** (50/50, 30/70, etc.)
6. Set **gap** (default: 30px)
7. Click **"Create Split"**

Done! Group appears with blue border in render order.

### Via Code

```typescript
import { createCustomSplit } from '@/lib/layout/helpers';
import { useModularStore } from '@/lib/store/modularStore';

// In your component
const updateRenderOrder = useModularStore(s => s.updateRenderOrder);
const currentOrder = useModularStore(s => s.compositionConfig?.renderOrder || []);

// Create 70/30 split
const split = createCustomSplit(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' },
  '70-30',
  { gap: '40px' }
);

// Add to order
updateRenderOrder([...currentOrder, split]);
```

## Available Split Types

```typescript
'50-50' // Equal: 50% / 50%
'30-70' // Sidebar left: 30% / 70%
'70-30' // Sidebar right: 70% / 30%
'40-60' // Asymmetric: 40% / 60%
'60-40' // Asymmetric: 60% / 40%
```

## Helper Functions

```typescript
import {
  createSplit5050,
  createSplit3070,
  createSplit7030,
  createCustomSplit,
  isGroupItem
} from '@/lib/layout/helpers';

// Equal split
createSplit5050(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' }
);

// Sidebar left
createSplit3070(
  { moduleId: 'logo' },
  { moduleId: 'textFields' }
);

// Check if item is group
if (isGroupItem(item)) {
  console.log('This is a group!');
}
```

## JSON Format

```json
{
  "moduleId": "__group__",
  "id": "horizontal-group-123456",
  "groupConfig": {
    "direction": "row",
    "gap": "30px",
    "alignItems": "stretch",
    "children": [
      {
        "moduleId": "textFields",
        "id": "textFields-main-left",
        "flex": { "basis": "50%", "grow": 1, "shrink": 1 }
      },
      {
        "moduleId": "contentImage",
        "id": "contentImage-main-right",
        "flex": { "basis": "50%", "grow": 1, "shrink": 1 }
      }
    ]
  }
}
```

## Visual Output

A 50/50 split renders as:

```html
<div style="display: flex; flex-direction: row; gap: 30px; align-items: stretch;">
  <div style="flex: 1 1 50%;">
    <!-- Text Fields Module -->
  </div>
  <div style="flex: 1 1 50%;">
    <!-- Content Image Module -->
  </div>
</div>
```

## Common Use Cases

### 1. Text + Image (Equal)
```typescript
createSplit5050(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' }
)
```

### 2. Logo Sidebar
```typescript
createSplit3070(
  { moduleId: 'logo' },
  { moduleId: 'textFields' }
)
```

### 3. Bullets + Image
```typescript
createSplit7030(
  { moduleId: 'bullets' },
  { moduleId: 'contentImage' }
)
```

### 4. Custom Proportion
```typescript
createCustomSplit(
  { moduleId: 'textFields' },
  { moduleId: 'bullets' },
  '60-40',
  { gap: '20px', alignItems: 'center' }
)
```

## Options

```typescript
interface SplitOptions {
  gap?: string;                    // Space between (e.g., '30px', '2rem')
  alignItems?: string;             // 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: string;         // 'start' | 'center' | 'end' | 'space-between' | 'space-around'
}
```

**Defaults**:
- `gap`: '30px'
- `alignItems`: 'stretch' (equal height)
- `justifyContent`: undefined (natural flex behavior)

## Identifying Groups in UI

Groups have:
- 🔵 **Blue border** and background
- **⋮⋮ Columns icon**
- **Display name**: "Horizontal Group"
- **Subtitle**: "Module A | Module B"

## Drag & Drop

- Groups can be **dragged** like normal modules
- Entire group moves as **one unit**
- Children stay together
- Can be **reordered** in list
- Can be **removed** with trash icon

## Key Files

- **Types**: `src/lib/layout/types.ts`
- **Helpers**: `src/lib/layout/helpers.ts`
- **Engine**: `src/lib/layout/CompositionOrderEngine.ts`
- **UI**: `src/components/editor/CompositionOrderEditor.tsx`
- **Store**: `src/lib/store/modularStore.ts`

## Full Documentation

See `HORIZONTAL-GROUPS-GUIDE.md` for complete documentation including:
- Architecture details
- Advanced usage
- Troubleshooting
- API reference
- Examples

## Troubleshooting

**Group not appearing?**
- Check both modules are enabled
- Verify module IDs exist
- Check browser console

**Flex not working?**
- Use valid CSS units for gap
- Check parent container width
- Verify flex values in HTML

**Modules overlapping?**
- Reduce gap value
- Check total percentage
- Use 'stretch' alignItems
