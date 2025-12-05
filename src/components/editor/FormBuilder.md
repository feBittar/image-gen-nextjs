# FormBuilder Component

Complete form builder for the Stack template with all controls and real-time sync to Zustand store.

## Location
`D:\Gevia\image-gen-nextjs\src\components\editor\FormBuilder.tsx`

## Features

### 1. Template Selector
- Dropdown to select from available templates
- Fetches templates from `/api/templates` on mount
- Default templates: stack, dual-text, fitfeed-capa, sandwich
- Updates form when template changes

### 2. Card Settings (Collapsible Accordion)
- **Card Width**: Slider (50-100%)
- **Card Height**: Slider (50-100%)
- **Card Border Radius**: Slider (0-50px)
- **Card Background Color**: Color picker with hex input
- **Card Background Image**: URL input with file upload support

### 3. Text Fields (5 Accordions)
Each text field (text1 through text5) includes:
- **Text Content**: Multi-line textarea
- **Font Size**: Slider (12-120px) with live preview
- **Font Weight**: Select dropdown (100-900)
  - Thin (100), Extra Light (200), Light (300), Normal (400), Medium (500)
  - Semi Bold (600), Bold (700), Extra Bold (800), Black (900)
- **Text Color**: Color picker with hex input
- **Font Family**: Select from common fonts
  - Arial, Helvetica, Times New Roman, Georgia, Courier New
  - Verdana, Roboto, Open Sans, Lato, Montserrat, Poppins, Inter
- **Text Align**: Left, Center, Right
- **Text Transform**: None, Uppercase, Lowercase, Capitalize

### 4. Text Spacing
- **Text Gap**: Slider (0-100px) - spacing between text fields

### 5. Content Image
- **Image URL**: Input with file upload
- **Border Radius**: Slider (0-50px)
- **Hide Image**: Checkbox toggle
- **Image Preview**: Shows thumbnail when URL is valid

### 6. SVG Elements (2 Accordions)
Each SVG element (svg1, svg2) includes:
- **SVG Code**: Textarea for pasting SVG markup
- **Position Controls**:
  - Top (px)
  - Left (px)
  - Width (px)
  - Height (px)
- **Live Preview**: Renders SVG preview below input

### 7. Free Text Elements (2 Accordions)
Each free text element (freeText1, freeText2) includes:
- **Text**: Text input
- **Position**:
  - Top (px)
  - Left (px)
- **Font Size**: Slider (8-48px)
- **Text Color**: Color picker
- **Background Color**: Color picker (supports transparent)

### 8. Form Management
- **Submit Button**: "Generate Image" - calls `/api/generate`
- **Reset Button**: Resets form to default values
- **Auto-save**: Debounced (500ms) sync to Zustand store
- **Validation**: Zod schema validation on submit
- **Error Handling**: Toast notifications for success/error

## Component Structure

### Main Component
```typescript
<FormBuilder />
```

### Child Components Created
1. **ColorPicker** (`ColorPicker.tsx`)
   - HexColorPicker with popover
   - Manual hex input
   - Color preview swatch

2. **FileUploadInput** (`FileUploadInput.tsx`)
   - Drag & drop support (react-dropzone)
   - URL input field
   - File browse button
   - Image preview
   - Clear button
   - Max size validation (5MB default)

3. **TextFieldEditor** (`TextFieldEditor.tsx`)
   - Reusable for all 5 text fields
   - All text styling controls
   - Props: fieldName, register, watch, setValue

4. **SVGPositionEditor** (`SVGPositionEditor.tsx`)
   - Reusable for both SVG elements
   - SVG code input + position controls
   - Live SVG preview
   - Props: svgNumber, register, watch, setValue

5. **FreeTextEditor** (`FreeTextEditor.tsx`)
   - Reusable for both free text elements
   - Text + position + style controls
   - Props: textNumber, register, watch, setValue

### UI Components Used
- Accordion, AccordionItem, AccordionTrigger, AccordionContent
- Button
- Input
- Label
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- Slider
- Textarea
- ScrollArea
- Separator
- Popover, PopoverTrigger, PopoverContent
- Toast (sonner)

## Tech Stack

### Form Management
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod resolver for RHF

### State Management
- **Zustand**: Global editor store
- **use-debounce**: Debounce form changes (500ms)

### UI Libraries
- **shadcn/ui**: Component library
- **react-colorful**: Color picker
- **react-dropzone**: File upload
- **lucide-react**: Icons

## Data Flow

1. **Form → Store**: Debounced sync (500ms)
   ```typescript
   const [debouncedValues] = useDebounce(watchedValues, 500);
   React.useEffect(() => {
     updateFormData(debouncedValues);
   }, [debouncedValues]);
   ```

2. **Store → API**: On submit
   ```typescript
   const onSubmit = async (data) => {
     await fetch('/api/generate', {
       method: 'POST',
       body: JSON.stringify(data)
     });
   };
   ```

3. **API → History**: Generated images stored in Zustand
   ```typescript
   useEditorStore.getState().addGeneratedImage({
     url: result.url,
     formData: data,
     template: data.template
   });
   ```

## Schema Definition

Located in `D:\Gevia\image-gen-nextjs\src\lib\schemas\stackTemplate.ts`

```typescript
export const stackTemplateSchema = z.object({
  template: z.string().default('stack'),

  // Card settings
  cardWidth: z.number().min(50).max(100).default(90),
  cardHeight: z.number().min(50).max(100).default(80),
  cardBorderRadius: z.number().min(0).max(50).default(12),
  cardBackgroundColor: z.string().default('#ffffff'),
  cardBackgroundImage: z.string().optional(),

  // Text fields (1-5)
  text1: z.string().default(''),
  text1Style: textStyleSchema.optional(),
  // ... text2-5

  textGap: z.number().min(0).max(100).default(16),

  // Content image
  contentImageUrl: z.string().optional(),
  contentImageBorderRadius: z.number().min(0).max(50).default(8),
  hideContentImage: z.boolean().default(false),

  // SVG elements
  svg1Content: z.string().optional(),
  svg1Position: positionSchema.optional(),
  svg2Content: z.string().optional(),
  svg2Position: positionSchema.optional(),

  // Free text elements
  freeText1: z.string().optional(),
  freeText1Position: positionSchema.optional(),
  freeText1Style: freeTextStyleSchema.optional(),
  freeText2: z.string().optional(),
  freeText2Position: positionSchema.optional(),
  freeText2Style: freeTextStyleSchema.optional(),
});
```

## API Endpoints

### GET /api/templates
Fetch available templates
```json
{
  "templates": ["stack", "dual-text", "fitfeed-capa", "sandwich"]
}
```

### POST /api/upload
Upload file (image, font)
```json
{
  "url": "https://example.com/uploads/image.png"
}
```

### POST /api/generate
Generate image from form data
```json
{
  "success": true,
  "url": "https://example.com/generated/image.png",
  "imagePath": "/output/image-123.png"
}
```

## Installation

Required packages (already in package.json):
```bash
npm install react-hook-form @hookform/resolvers zod zustand
npm install react-colorful react-dropzone use-debounce
npm install @radix-ui/react-accordion @radix-ui/react-select
npm install @radix-ui/react-slider @radix-ui/react-popover
npm install sonner lucide-react
```

Note: `@radix-ui/react-switch` needs to be installed for the Switch component:
```bash
npm install @radix-ui/react-switch
```

## Usage

```tsx
import { FormBuilder } from '@/components/editor';

export default function EditorPage() {
  return (
    <div className="h-screen">
      <FormBuilder />
    </div>
  );
}
```

## File Structure

```
src/
├── components/
│   ├── editor/
│   │   ├── FormBuilder.tsx          # Main form component
│   │   ├── ColorPicker.tsx          # Color picker component
│   │   ├── FileUploadInput.tsx      # File upload with drag & drop
│   │   ├── TextFieldEditor.tsx      # Text field controls
│   │   ├── SVGPositionEditor.tsx    # SVG element controls
│   │   ├── FreeTextEditor.tsx       # Free text controls
│   │   └── index.ts                 # Barrel exports
│   └── ui/
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── slider.tsx
│       ├── textarea.tsx             # NEW
│       ├── switch.tsx               # NEW
│       └── index.ts
└── lib/
    ├── schemas/
    │   └── stackTemplate.ts         # NEW - Form schema
    ├── store/
    │   └── editorStore.ts
    └── types/
        ├── index.ts
        └── image.ts

```

## Accessibility

All form controls include:
- Proper label associations
- ARIA attributes
- Keyboard navigation support
- Focus management
- Error announcements via toast

## Performance Optimizations

1. **Debounced Updates**: 500ms debounce prevents excessive re-renders
2. **Controlled Components**: Only re-render when necessary
3. **Lazy Loading**: Accordion content loads on-demand
4. **Memoization**: Child components use React.memo where appropriate
5. **Scroll Virtualization**: ScrollArea for long form content

## Future Enhancements

- [ ] Custom font upload integration
- [ ] Preset saving/loading
- [ ] Form validation feedback on individual fields
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Form field visibility toggles
- [ ] Advanced SVG editor with WYSIWYG
- [ ] Image cropping/editing tools
- [ ] Gradient builder for backgrounds
- [ ] Animation preview for text effects
