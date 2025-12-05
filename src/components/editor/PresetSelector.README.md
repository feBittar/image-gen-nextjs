# PresetSelector Component

A React component for displaying and selecting template presets in the ImageGen Next.js application. This component provides a visual interface for choosing pre-configured module combinations as starting points for image generation.

## Location

`src/components/editor/PresetSelector.tsx`

## Features

### 1. Dual View Modes
- **Grid View**: Visual cards with thumbnails, ideal for browsing
- **List View**: Compact list with smaller thumbnails, ideal for quick selection

### 2. Visual Preset Cards
Each preset displays:
- Thumbnail image (or placeholder icon if not provided)
- Preset name and description
- Module badges showing included modules
- Visual selection indicator

### 3. Unsaved Changes Protection
- Detects when user has unsaved configuration changes
- Shows confirmation dialog before switching presets
- Prevents accidental data loss

### 4. Responsive Design
- Mobile-friendly responsive grid
- Smooth transitions and hover effects
- Clean, modern UI matching existing application style

## Usage

### Basic Example

```typescript
import { PresetSelector } from '@/components/editor/PresetSelector';
import { TemplatePreset } from '@/lib/modules/types';

const presets: TemplatePreset[] = [
  {
    id: 'stack',
    name: 'Stack Layout',
    description: 'Classic stacked layout with text fields and content image',
    thumbnail: '/thumbnails/stack.png', // Optional
    defaultModules: ['viewport', 'card', 'textFields', 'contentImage'],
    moduleDefaults: {
      viewport: { width: 1080, height: 1440 },
      card: { backgroundColor: '#000000' },
    },
  },
  // ... more presets
];

function MyComponent() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('stack');
  const [hasChanges, setHasChanges] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    // Load preset configuration
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      // Apply preset.defaultModules and preset.moduleDefaults
      loadPresetConfiguration(preset);
      setSelectedPreset(presetId);
      setHasChanges(false);
    }
  };

  return (
    <PresetSelector
      selectedPresetId={selectedPreset}
      onPresetSelect={handlePresetSelect}
      hasUnsavedChanges={hasChanges}
      presets={presets}
    />
  );
}
```

### With Zustand Store

```typescript
import { create } from 'zustand';
import { PresetSelector } from '@/components/editor/PresetSelector';

interface PresetStore {
  selectedPresetId: string | null;
  hasUnsavedChanges: boolean;
  setPreset: (presetId: string) => void;
  markAsChanged: () => void;
}

const usePresetStore = create<PresetStore>((set) => ({
  selectedPresetId: null,
  hasUnsavedChanges: false,
  setPreset: (presetId) => set({ selectedPresetId: presetId, hasUnsavedChanges: false }),
  markAsChanged: () => set({ hasUnsavedChanges: true }),
}));

function PresetSelectorWithStore() {
  const { selectedPresetId, hasUnsavedChanges, setPreset } = usePresetStore();
  const presets = useAvailablePresets(); // Your preset loading logic

  return (
    <PresetSelector
      selectedPresetId={selectedPresetId}
      onPresetSelect={setPreset}
      hasUnsavedChanges={hasUnsavedChanges}
      presets={presets}
    />
  );
}
```

## Props

### PresetSelectorProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedPresetId` | `string \| null` | Yes | Currently selected preset ID (null if custom/none) |
| `onPresetSelect` | `(presetId: string) => void` | Yes | Callback when a preset is selected |
| `hasUnsavedChanges` | `boolean` | No | Whether there are unsaved changes in current config (default: false) |
| `presets` | `TemplatePreset[]` | Yes | Array of available presets to display |
| `className` | `string` | No | Optional className for the container |

### TemplatePreset Type

```typescript
interface TemplatePreset {
  id: string;                                  // Unique preset ID
  name: string;                                // Display name
  description: string;                         // Short description
  thumbnail?: string;                          // Optional preview image URL
  defaultModules: string[];                    // Module IDs to enable
  moduleDefaults: Record<string, Record<string, unknown>>; // Module-specific defaults
}
```

## Component Structure

```
PresetSelector (main component)
├── Header with view mode toggle
├── ScrollArea
│   ├── Grid View
│   │   └── PresetCard[] (3-column responsive grid)
│   └── List View
│       └── PresetListItem[] (stacked list)
└── Confirmation Dialog (for unsaved changes)
```

## Subcomponents

### PresetCard (Grid View)
- Aspect ratio: 3:4 (portrait)
- Shows thumbnail or Package icon placeholder
- Selected indicator (checkmark badge)
- Module badges (max 3 visible, +N for overflow)
- Hover effect: scale and shadow

### PresetListItem (List View)
- Horizontal layout with 24x32 thumbnail
- Shows all module badges
- Compact design for quick scanning
- Selected indicator (checkmark badge)

## Styling

The component uses Tailwind CSS and shadcn/ui components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Badge` (secondary variant for modules, outline for count)
- `Button` (for view toggle)
- `Dialog` (for confirmation)
- `ScrollArea`, `Separator`

### Key Classes
- Selected state: `ring-2 ring-primary`
- Hover state: `hover:shadow-lg hover:scale-[1.02]`
- Transitions: `transition-all`

## Behavior

### Selection Flow
1. User clicks a preset card
2. If `selectedPresetId` matches clicked preset → no action
3. If `hasUnsavedChanges` is `true` → show confirmation dialog
4. If `hasUnsavedChanges` is `false` → directly call `onPresetSelect`

### Confirmation Dialog
When unsaved changes exist:
- Shows warning icon and message
- Displays the preset user is switching to
- Buttons:
  - "Cancel" → closes dialog, keeps current selection
  - "Discard Changes" (destructive) → confirms switch, calls `onPresetSelect`

## Accessibility

- Semantic HTML structure
- ARIA labels for view toggle buttons
- Keyboard navigation support (via shadcn/ui Dialog)
- Focus management in confirmation dialog
- Screen reader support with descriptive text

## Responsive Breakpoints

- Mobile: 1 column grid
- Tablet (md): 2 columns grid
- Desktop (lg): 3 columns grid

## Dependencies

### External
- `react` - Core React library
- `lucide-react` - Icons (Check, Grid3x3, List, Package, AlertCircle)

### Internal
- `@/lib/utils` - `cn` utility for class merging
- `@/lib/modules/types` - `TemplatePreset` type definition
- `@/components/ui/*` - shadcn/ui components

## Example File

See `PresetSelector.example.tsx` for:
- Complete working example
- Sample preset data
- Zustand store integration pattern
- Debug interface

## Future Enhancements

Possible improvements:
- Search/filter presets by name or modules
- Preset categories/tags
- Preview modal with larger thumbnail
- Favorite/pin presets
- Custom preset creation UI
- Drag-and-drop preset reordering
- Export/import preset configurations

## Related Files

- `src/lib/modules/types.ts` - Type definitions
- `src/lib/modules/registry.ts` - Module registry
- `src/lib/presets/` - Preset definitions (to be created)
- `src/components/editor/FormBuilder.tsx` - Current form implementation
- `src/lib/store/editorStore.ts` - Editor state management

## Notes

- The component is designed to work with the modular template system
- Presets should be loaded from `src/lib/presets/` directory
- Thumbnail images should be stored in `public/thumbnails/`
- The component does not manage preset data - it's purely presentational
- Preset loading and application logic should be handled by parent component
