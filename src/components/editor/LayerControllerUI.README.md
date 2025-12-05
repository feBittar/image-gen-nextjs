# LayerControllerUI Component

A drag-and-drop layer management interface for controlling z-index, visibility, and ordering of modular components.

## Features

- **Drag & Drop Reordering**: Uses @dnd-kit for smooth drag-and-drop interactions
- **Z-Index Management**: Direct input for precise z-index control with visual badges
- **Visibility Toggle**: Eye icon to show/hide layers
- **Move Up/Down**: Arrow buttons for incremental layer adjustments
- **Auto Z-Index Calculation**: Automatically recalculates z-index values when reordering
- **Reset All**: Button to reset all z-index overrides to defaults
- **Locked Layers**: Visual indication and protection for locked layers
- **Visual Order**: Layers are displayed with highest z-index at the top (matching visual stacking)

## Usage

### Basic Integration

```tsx
import { LayerControllerUI } from "@/components/editor/LayerControllerUI";

function MyLayoutEditor() {
  return (
    <div className="h-screen">
      <LayerControllerUI />
    </div>
  );
}
```

### With Custom Styling

```tsx
<LayerControllerUI className="w-96 border-l" />
```

### In a Tab Layout

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayerControllerUI } from "@/components/editor/LayerControllerUI";

function LayoutManager() {
  return (
    <Tabs defaultValue="layers">
      <TabsList>
        <TabsTrigger value="layers">Layers</TabsTrigger>
        <TabsTrigger value="order">Order</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
      </TabsList>

      <TabsContent value="layers" className="h-[600px]">
        <LayerControllerUI />
      </TabsContent>

      {/* Other tabs... */}
    </Tabs>
  );
}
```

## State Management

The component integrates with the `useModularStore` Zustand store:

- **Reads**: `compositionConfig`, `enabledModules`
- **Writes**: Uses `setLayerOverride()` and `resetLayerOverrides()`

### Store Actions Used

```typescript
// Set z-index override for a module
setLayerOverride(moduleId: string, zIndex: number): void

// Reset all z-index overrides to defaults
resetLayerOverrides(): void
```

## LayerController Integration

The component creates a `LayerController` instance internally to:

1. Initialize layers from enabled modules
2. Get default z-index values from module registry
3. Apply user overrides from composition config
4. Calculate visual order (highest z-index = top of list)

### Auto Z-Index Calculation

When layers are reordered via drag-and-drop or move up/down buttons, z-index values are automatically recalculated:

- Layers are assigned z-index in increments of 10 (0, 10, 20, 30...)
- Visual order is preserved: top item = highest z-index
- Overrides are stored in the composition config

## Layer Item Structure

Each layer displays:

```
[🖐️ Drag Handle] [Module Name]     [Z-Index: 20] [Badge: 20] [👁️ Visibility] [⬆️⬇️ Move]
                  [Module ID]
```

### Layer Properties

- **moduleId**: Unique identifier from module registry
- **displayName**: Human-readable name (from module definition)
- **zIndex**: Current z-index value (with override if applied)
- **visible**: Whether the layer is currently visible
- **locked**: Whether the layer is locked (prevents reordering)

## Visual Design

The component uses an **orange-red accent color** (`#E64A19`) consistent with the modular editor theme:

- Active borders: `border-[#E64A19]`
- Hover states: `hover:border-[#E64A19]/40`
- Badges: `bg-[#E64A19]/10 text-[#E64A19]`
- Buttons: `hover:text-[#E64A19]`

## Keyboard Accessibility

- **Tab**: Navigate between interactive elements
- **Enter**: Confirm z-index input changes
- **Escape**: Cancel z-index input changes
- **Arrow Keys**: Navigate drag-and-drop items (when focused)
- **Space/Enter**: Activate drag-and-drop (when focused on drag handle)

## Edge Cases

### No Modules Enabled

When no modules are enabled, displays an empty state:

```
[Layers Icon]
No modules enabled. Enable modules to manage layers.
```

### Locked Layers

Locked layers show:
- "LOCKED" badge in amber color
- Disabled drag handle (opacity reduced)
- Disabled move up/down buttons

### Z-Index Input

- Accepts integer values only
- Invalid input reverts to current value on blur
- Enter key commits and blurs input
- Visual badge shows current applied z-index

## Dependencies

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

## Related Components

- `LayerController` - Core layer management logic (`src/lib/layout/LayerController.ts`)
- `ModuleSidebar` - Module enable/disable controls (`src/components/editor/ModuleSidebar.tsx`)
- `CompositionOrderEngine` - Rendering order engine (`src/lib/layout/CompositionOrderEngine.ts`)

## Example: Complete Layout Manager

```tsx
import { LayerControllerUI } from "@/components/editor/LayerControllerUI";
import { ModuleSidebar } from "@/components/editor/ModuleSidebar";

function CompleteLayoutManager() {
  return (
    <div className="flex h-screen">
      {/* Module Toggle Sidebar */}
      <ModuleSidebar
        className="w-80"
        enabledModules={enabledModules}
        onModuleToggle={handleModuleToggle}
      />

      {/* Layer Control Panel */}
      <LayerControllerUI className="w-96 border-l" />

      {/* Main Editor/Preview */}
      <div className="flex-1">
        {/* Your preview/editor here */}
      </div>
    </div>
  );
}
```

## Testing

To test the component:

1. Enable multiple modules in the modular editor
2. Open the Layer Control panel
3. Drag layers to reorder them
4. Edit z-index values directly
5. Toggle visibility with eye icon
6. Use move up/down buttons
7. Reset all overrides with "Reset All" button
8. Verify z-index values are persisted in store

## Styling Customization

Override the accent color by modifying the component:

```tsx
// Change all instances of #E64A19 to your desired color
const ACCENT_COLOR = "#E64A19"; // Your custom color here
```

Or use CSS variables for theme consistency:

```tsx
className="border-primary/20" // Instead of border-[#E64A19]/20
```
