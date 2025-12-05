# Zustand State Management Stores

This directory contains Zustand stores for the image generation editor application. All stores use TypeScript, devtools middleware for debugging, and persist middleware where appropriate.

## Store Overview

### 1. Editor Store (`editorStore.ts`)

**Purpose:** Manages the main editor state including form data, template selection, UI panels, and generation history.

**State:**
- `formData: ImageGenerationData` - Current form data for image generation
- `selectedTemplate: string` - Currently selected template ID
- `previewVisible: boolean` - Preview panel visibility state
- `activePanel: ActivePanel` - Active editor panel ('text' | 'background' | 'position' | 'advanced')
- `generatedImages: GeneratedImage[]` - History of generated images
- `isGenerating: boolean` - Loading state during generation

**Actions:**
- `updateFormData(data)` - Partial update of form data
- `setTemplate(templateId)` - Select template and update form data
- `togglePreview()` - Toggle preview panel visibility
- `setPreviewVisible(visible)` - Set preview visibility explicitly
- `setActivePanel(panel)` - Switch active editor panel
- `addGeneratedImage(image)` - Add new generated image to history
- `removeGeneratedImage(id)` - Remove image from history
- `clearGeneratedImages()` - Clear all generated images
- `setIsGenerating(generating)` - Set generation loading state
- `resetForm()` - Reset form to default values

**Persistence:** Yes (localStorage)
- Persisted: `formData`, `selectedTemplate`, `generatedImages`
- Not persisted: UI state like `previewVisible`, `activePanel`, `isGenerating`

**Usage Example:**
```typescript
import { useEditorStore, selectFormData } from '@/lib/store';

function EditorPanel() {
  // Get entire state
  const { formData, updateFormData, setTemplate } = useEditorStore();

  // Or use selectors for optimized re-renders
  const formData = useEditorStore(selectFormData);
  const updateFormData = useEditorStore((state) => state.updateFormData);

  // Update form data
  const handleTitleChange = (title: string) => {
    updateFormData({ title });
  };

  // Switch template
  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
  };
}
```

---

### 2. Template Store (`templateStore.ts`)

**Purpose:** Manages available templates, template selection, and fetching template data from the API.

**State:**
- `templates: Template[]` - List of available templates
- `selectedTemplateId: string | null` - Currently selected template ID
- `isLoading: boolean` - Loading state during API fetch
- `error: string | null` - Error message from failed API calls
- `lastFetched: number | null` - Timestamp of last successful fetch (for caching)

**Actions:**
- `setTemplates(templates)` - Set templates list
- `addTemplate(template)` - Add single template to list
- `removeTemplate(id)` - Remove template by ID
- `updateTemplate(id, updates)` - Update template properties
- `selectTemplate(id)` - Select template by ID
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message
- `clearError()` - Clear error message
- `fetchTemplates()` - Fetch templates from API with 5-minute caching

**Persistence:** No (fetched from API)

**Caching:** Templates are cached for 5 minutes to reduce API calls

**Usage Example:**
```typescript
import { useTemplateStore, selectTemplates } from '@/lib/store';
import { useEffect } from 'react';

function TemplateSelector() {
  const { templates, isLoading, error, fetchTemplates, selectTemplate } = useTemplateStore();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Or use selectors
  const templates = useTemplateStore(selectTemplates);
  const selectedTemplate = useTemplateStore(selectSelectedTemplate);

  if (isLoading) return <div>Loading templates...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => selectTemplate(template.id)}
        >
          {template.name}
        </button>
      ))}
    </div>
  );
}
```

---

### 3. Gallery Store (`galleryStore.ts`)

**Purpose:** Manages the image gallery including images, filters, sorting, selection, and view modes.

**State:**
- `images: GalleryImage[]` - List of all gallery images
- `selectedImages: Set<string>` - Set of selected image IDs
- `filters: GalleryFilters` - Active filters (search, template, date range, tags, favorites)
- `sortBy: SortOption` - Sort option ('newest' | 'oldest' | 'template' | 'favorite')
- `viewMode: 'grid' | 'list'` - Gallery view mode

**Actions:**

*Image Management:*
- `addImage(image)` - Add single image
- `addImages(images)` - Add multiple images
- `deleteImage(id)` - Delete single image
- `deleteImages(ids)` - Delete multiple images
- `updateImage(id, updates)` - Update image properties
- `toggleFavorite(id)` - Toggle favorite status
- `clearImages()` - Clear all images

*Selection:*
- `selectImage(id)` - Select single image
- `deselectImage(id)` - Deselect single image
- `toggleImageSelection(id)` - Toggle selection
- `selectAll()` - Select all filtered images
- `clearSelection()` - Clear all selections

*Filters:*
- `setSearchQuery(query)` - Set search query
- `setTemplateFilter(template)` - Filter by template
- `setDateRange(start, end)` - Filter by date range
- `toggleFavoritesOnly()` - Toggle favorites-only filter
- `addTagFilter(tag)` - Add tag to filter
- `removeTagFilter(tag)` - Remove tag from filter
- `clearFilters()` - Reset all filters

*Sorting & View:*
- `setSortBy(sortBy)` - Set sort option
- `setViewMode(mode)` - Set view mode

*Computed:*
- `getFilteredImages()` - Get filtered and sorted images
- `getSelectedImagesData()` - Get full data for selected images

**Persistence:** Yes (localStorage)
- Persisted: `images`, `filters`, `sortBy`, `viewMode`, `selectedImages`
- Special handling: `Set<string>` is serialized to array for storage

**Usage Example:**
```typescript
import { useGalleryStore, selectFilteredImages } from '@/lib/store';

function ImageGallery() {
  const {
    filters,
    sortBy,
    viewMode,
    setSearchQuery,
    toggleFavoritesOnly,
    setSortBy,
    toggleImageSelection,
    deleteImage,
  } = useGalleryStore();

  // Use computed selector for filtered images
  const filteredImages = useGalleryStore(selectFilteredImages);
  const selectedImages = useGalleryStore(selectSelectedImages);

  return (
    <div>
      {/* Search */}
      <input
        value={filters.searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search images..."
      />

      {/* Favorites toggle */}
      <button onClick={toggleFavoritesOnly}>
        {filters.showFavoritesOnly ? 'Show All' : 'Show Favorites'}
      </button>

      {/* Sort selector */}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="template">By Template</option>
        <option value="favorite">Favorites First</option>
      </select>

      {/* Gallery grid */}
      <div className={viewMode === 'grid' ? 'grid' : 'list'}>
        {filteredImages.map((image) => (
          <div key={image.id}>
            <img src={image.url} alt="" />
            <button onClick={() => toggleImageSelection(image.id)}>
              {selectedImages.has(image.id) ? 'Selected' : 'Select'}
            </button>
            <button onClick={() => deleteImage(image.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Devtools

All stores include Redux DevTools support for debugging. Install the Redux DevTools extension in your browser to:

- Inspect state changes
- Time-travel debugging
- View action history
- Track performance

Action names are clearly labeled (e.g., `updateFormData`, `fetchTemplates:success`).

---

## Performance Optimization

### Selectors

Each store exports selector functions for optimized re-renders:

```typescript
// Instead of this (re-renders on ANY state change):
const { formData, isGenerating, activePanel } = useEditorStore();

// Use selectors (re-renders only when specific values change):
const formData = useEditorStore(selectFormData);
const isGenerating = useEditorStore(selectIsGenerating);
```

### Computed Values

Gallery store provides computed getters that are memoized:
- `getFilteredImages()` - Filters and sorts images on-demand
- `getSelectedImagesData()` - Gets full data for selected images

---

## TypeScript Types

All stores are fully typed with TypeScript interfaces exported from each file:

```typescript
import type {
  ActivePanel,
  GeneratedImage,
  GalleryImage,
  GalleryFilters,
  SortOption,
} from '@/lib/store';
```

---

## Persistence Strategy

**Editor Store:**
- Persists form data and template selection for session continuity
- UI state (preview, active panel) resets on reload

**Template Store:**
- No persistence (fetched from API with 5-minute cache)
- Reduces localStorage bloat

**Gallery Store:**
- Persists entire gallery and filters
- Images persist across sessions
- Handles Set serialization properly

---

## Best Practices

1. **Use selectors for performance:**
   ```typescript
   // Good
   const formData = useEditorStore(selectFormData);

   // Avoid (unless you need multiple values)
   const { formData, template, preview } = useEditorStore();
   ```

2. **Destructure actions separately:**
   ```typescript
   const updateFormData = useEditorStore((state) => state.updateFormData);
   const setTemplate = useEditorStore((state) => state.setTemplate);
   ```

3. **Use computed selectors for derived state:**
   ```typescript
   const filteredImages = useGalleryStore(selectFilteredImages);
   const recentImages = useGalleryStore(selectRecentImages(10));
   ```

4. **Check loading/error states:**
   ```typescript
   const { isLoading, error, fetchTemplates } = useTemplateStore();

   useEffect(() => {
     if (!isLoading && !error) {
       fetchTemplates();
     }
   }, []);
   ```

5. **Handle Set types properly:**
   ```typescript
   const selectedImages = useGalleryStore(selectSelectedImages);
   const isSelected = selectedImages.has(imageId);
   ```

---

## Migration from Existing State

If you have existing React state or Context, migrate gradually:

1. Keep existing state working
2. Add Zustand stores alongside
3. Migrate components one at a time
4. Remove old state management when complete

Example migration:
```typescript
// Before (useState)
const [formData, setFormData] = useState(defaultFormData);

// After (Zustand)
const { formData, updateFormData } = useEditorStore();
```
