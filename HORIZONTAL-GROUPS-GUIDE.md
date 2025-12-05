# Horizontal Groups Guide

## Overview

The Composition Order Editor now supports creating **horizontal split layouts** where two modules can be positioned side-by-side. This is achieved through a `groupConfig` extension to the `RenderOrderItem` type.

## Architecture

### Type Extensions

**File: `src/lib/layout/types.ts`**

The `RenderOrderItem` interface now supports groups:

```typescript
interface RenderOrderItem {
  moduleId: string; // Can be '__group__' for groups
  // ... other fields ...

  groupConfig?: {
    direction: 'row' | 'column';
    gap?: string;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
    children: RenderOrderItem[];
  };
}
```

### Helper Functions

**File: `src/lib/layout/helpers.ts`**

Provides functions to create common split patterns:

```typescript
// Available split types
'50-50' // Equal split
'30-70' // Sidebar left
'70-30' // Sidebar right
'40-60'
'60-40'

// Create a split
createCustomSplit(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' },
  '50-50',
  { gap: '30px', alignItems: 'stretch' }
);

// Convenience functions
createSplit5050(left, right, options)
createSplit3070(left, right, options)
createSplit7030(left, right, options)

// Check if item is a group
isGroupItem(item)
```

### Rendering Engine

**File: `src/lib/layout/CompositionOrderEngine.ts`**

The engine now handles groups in `buildRenderTree()`:

1. Detects `moduleId === '__group__'` with `groupConfig`
2. Recursively builds children nodes via `buildChildrenNodes()`
3. Renders groups as flexbox containers with `renderGroup()`
4. Applies flex styles to child modules via `renderModule()`

### UI Component

**File: `src/components/editor/CompositionOrderEditor.tsx`**

New features:

1. **"Create Horizontal Split" button** - Opens dialog to configure split
2. **Split dialog** with:
   - Left module selector
   - Right module selector
   - Split proportion dropdown (50/50, 30/70, etc.)
   - Gap input field
3. **Visual indicators** - Groups shown with blue border and Columns icon
4. **Drag & drop** - Groups can be reordered like regular modules

## Usage

### Creating a Horizontal Split via UI

1. Navigate to the Composition Order Editor
2. Click "Create Horizontal Split" button
3. Select left module from dropdown
4. Select right module from dropdown
5. Choose split proportion (default: 50/50)
6. Adjust gap if needed (default: 30px)
7. Click "Create Split"

The group will appear in the render order list with:
- Blue border and background
- Columns icon
- Display name showing child modules

### Creating Splits Programmatically

```typescript
import { createCustomSplit } from '@/lib/layout/helpers';
import { useModularStore } from '@/lib/store/modularStore';

// In your component
const updateRenderOrder = useModularStore((state) => state.updateRenderOrder);

const splitItem = createCustomSplit(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' },
  '70-30',
  { gap: '40px', alignItems: 'center' }
);

// Add to render order
const currentOrder = useModularStore.getState().compositionConfig?.renderOrder || [];
updateRenderOrder([...currentOrder, splitItem]);
```

### Advanced: Nested Groups

Groups can contain other groups for complex layouts:

```typescript
const innerSplit = createSplit5050(
  { moduleId: 'textFields' },
  { moduleId: 'bullets' },
  { gap: '20px' }
);

const outerSplit = createCustomSplit(
  { moduleId: 'logo' },
  // To nest a group, you'd need to manually construct the groupConfig
  { moduleId: '__group__' }, // This is a simplification
  '30-70'
);
```

## Rendering Output

### HTML Structure

A horizontal split renders as:

```html
<div style="display: flex; flex-direction: row; gap: 30px; align-items: stretch;">
  <!-- Left module (70%) -->
  <div style="flex: 0 0 70%;">
    [Text Fields Module HTML]
  </div>

  <!-- Right module (30%) -->
  <div style="flex: 0 0 30%;">
    [Content Image Module HTML]
  </div>
</div>
```

### Flex Calculation

The helpers automatically set appropriate `flex` values:

- `50-50`: Both children get `flex: 1 1 50%` (equal, growable)
- `30-70`: Left gets `flex: 0 1 30%` (fixed), right gets `flex: 1 1 70%` (growable)
- `70-30`: Left gets `flex: 1 1 70%` (growable), right gets `flex: 0 1 30%` (fixed)

## JSON Format

### Storage Format

Groups are stored in the composition config as:

```json
{
  "renderOrder": [
    {
      "moduleId": "__group__",
      "id": "horizontal-group-1701234567890",
      "groupConfig": {
        "direction": "row",
        "gap": "30px",
        "alignItems": "stretch",
        "children": [
          {
            "moduleId": "textFields",
            "id": "textFields-main-left",
            "flex": {
              "basis": "70%",
              "grow": 1,
              "shrink": 1
            }
          },
          {
            "moduleId": "contentImage",
            "id": "contentImage-main-right",
            "flex": {
              "basis": "30%",
              "grow": 0,
              "shrink": 1
            }
          }
        ]
      }
    }
  ]
}
```

## Best Practices

1. **Module Availability**: Only enabled modules appear in the split dialog dropdowns
2. **Unique IDs**: Each group gets a unique timestamp-based ID
3. **Visual Feedback**: Groups are visually distinct in the UI with blue styling
4. **Flex Defaults**: Use `alignItems: 'stretch'` to make both sides equal height
5. **Gap Units**: Use CSS units for gap (px, rem, %, etc.)

## Limitations & Future Enhancements

### Current Limitations

- No visual editor to adjust proportions after creation
- Groups can't be edited, only removed and recreated
- No vertical split option (only horizontal via `direction: 'row'`)
- No drag-to-resize for split proportions

### Potential Enhancements

1. **Edit Group Dialog**: Click on group to edit proportions/gap
2. **Vertical Splits**: Add support for stacked layouts
3. **Three-Column Layouts**: Extend to support 3+ modules in a row
4. **Visual Split Editor**: Drag handles to adjust proportions visually
5. **Preset Layouts**: Save/load common split patterns
6. **Nested Group UI**: Better visualization of nested structures

## Troubleshooting

### Group not rendering

- Check that both child modules are enabled
- Verify module IDs exist in registry
- Check browser console for warnings

### Flex not working correctly

- Ensure gap uses valid CSS units
- Check that parent container has enough width
- Verify flex values in rendered HTML

### Modules overlapping

- Reduce gap value
- Check if flex-basis percentages sum correctly
- Ensure alignItems is appropriate for content

## Technical Details

### Drag & Drop

Groups participate in drag & drop like regular modules:
- The entire group moves as one unit
- Children stay within the group during drag
- ID is used for sortable context

### Conditional Rendering

Groups respect conditional rendering:
- If a child module's condition evaluates to false, it's skipped
- Empty groups (no visible children) render as empty divs

### Z-Index

Groups don't have z-index themselves, but:
- They preserve document order of children
- Overall z-index is determined by group's position in renderOrder

## Examples

### Common Use Cases

**1. Text + Image Side-by-Side (50/50)**

```typescript
createSplit5050(
  { moduleId: 'textFields' },
  { moduleId: 'contentImage' }
)
```

**2. Logo in Sidebar (30/70)**

```typescript
createSplit3070(
  { moduleId: 'logo' },
  { moduleId: 'textFields' }
)
```

**3. Three-Column Layout**

Since helpers only support 2-column, manually construct:

```typescript
{
  moduleId: '__group__',
  id: 'three-col',
  groupConfig: {
    direction: 'row',
    gap: '20px',
    children: [
      { moduleId: 'logo', flex: { basis: '33.33%' } },
      { moduleId: 'textFields', flex: { basis: '33.33%' } },
      { moduleId: 'contentImage', flex: { basis: '33.33%' } }
    ]
  }
}
```

## API Reference

### Helper Functions

```typescript
// Create split with custom proportions
createCustomSplit(
  left: { moduleId: string; submoduleId?: string },
  right: { moduleId: string; submoduleId?: string },
  splitType: SplitType,
  options?: SplitOptions
): RenderOrderItem

// Predefined splits
createSplit5050(left, right, options?): RenderOrderItem
createSplit3070(left, right, options?): RenderOrderItem
createSplit7030(left, right, options?): RenderOrderItem

// Utility functions
isGroupItem(item: RenderOrderItem): boolean
isSpacerItem(item: RenderOrderItem): boolean
renderNodeToOrderItem(node: RenderNode): RenderOrderItem
```

### Types

```typescript
type SplitType = '50-50' | '30-70' | '70-30' | '40-60' | '60-40'

interface SplitOptions {
  gap?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

const SPLIT_TYPES: Record<SplitType, string> = {
  '50-50': '50% / 50%',
  '30-70': '30% / 70%',
  '70-30': '70% / 30%',
  '40-60': '40% / 60%',
  '60-40': '60% / 40%',
}
```

## Related Files

- **Types**: `src/lib/layout/types.ts`
- **Helpers**: `src/lib/layout/helpers.ts`
- **Engine**: `src/lib/layout/CompositionOrderEngine.ts`
- **UI**: `src/components/editor/CompositionOrderEditor.tsx`
- **Store**: `src/lib/store/modularStore.ts`
