# useImageGeneration Hook

Custom React hook for generating images with preview and full-quality modes.

## Features

- Debounced preview generation (500ms)
- Request cancellation with AbortController
- Memory management (automatic blob URL cleanup)
- Error handling with user-friendly messages
- Separate preview and full-quality generation
- TypeScript support

## Usage

```typescript
import { useImageGeneration } from '@/lib/hooks/useImageGeneration';
import { useEditorStore, selectFormData } from '@/lib/store';

function MyComponent() {
  const formData = useEditorStore(selectFormData);
  const {
    previewUrl,
    fullImageUrl,
    isGenerating,
    error,
    generatePreview,
    generateImage,
    clearPreview,
    clearError,
  } = useImageGeneration();

  // Auto-generate preview on data changes
  useEffect(() => {
    generatePreview(formData);
  }, [formData, generatePreview]);

  // Manual full-quality generation
  const handleDownload = async () => {
    const imageUrl = await generateImage(formData);
    if (imageUrl) {
      // Download logic here
    }
  };

  return (
    <div>
      {isGenerating && <p>Generating...</p>}
      {error && <p>Error: {error}</p>}
      {previewUrl && <img src={previewUrl} alt="Preview" />}
    </div>
  );
}
```

## API Reference

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `previewUrl` | `string \| null` | Blob URL of the preview image |
| `fullImageUrl` | `string \| null` | Blob URL of the full-quality image |
| `isGenerating` | `boolean` | True when any generation is in progress |
| `error` | `string \| null` | Error message if generation failed |
| `generatePreview` | `(data: ImageGenerationData) => Promise<void>` | Debounced preview generation (500ms) |
| `generateImage` | `(data: ImageGenerationData) => Promise<string \| null>` | Full-quality image generation (no debounce) |
| `clearPreview` | `() => void` | Clear preview and revoke blob URL |
| `clearError` | `() => void` | Clear error message |

### Parameters

#### `generatePreview(data)`
- **data**: `ImageGenerationData` - Form data for image generation
- **Returns**: `Promise<void>`
- **Debounce**: 500ms
- **Cancellation**: Auto-cancels pending requests

#### `generateImage(data)`
- **data**: `ImageGenerationData` - Form data for image generation
- **Returns**: `Promise<string | null>` - Blob URL of generated image or null on error
- **Debounce**: None (immediate execution)
- **Quality**: Full-quality image

## Advanced Examples

### Example 1: Auto-preview with manual download

```typescript
function ImageEditor() {
  const formData = useEditorStore(selectFormData);
  const { previewUrl, generatePreview, generateImage, isGenerating } = useImageGeneration();

  // Auto-generate preview
  useEffect(() => {
    generatePreview(formData);
  }, [formData, generatePreview]);

  // Manual full-quality download
  const handleDownload = async () => {
    const imageUrl = await generateImage(formData);
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div>
      {previewUrl && <img src={previewUrl} />}
      <button onClick={handleDownload} disabled={isGenerating}>
        Download
      </button>
    </div>
  );
}
```

### Example 2: Error handling with retry

```typescript
function ImagePreview() {
  const formData = useEditorStore(selectFormData);
  const {
    previewUrl,
    generatePreview,
    isGenerating,
    error,
    clearError,
  } = useImageGeneration();

  useEffect(() => {
    generatePreview(formData);
  }, [formData, generatePreview]);

  const handleRetry = () => {
    clearError();
    generatePreview(formData);
  };

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return isGenerating ? <Spinner /> : <img src={previewUrl} />;
}
```

### Example 3: Gallery integration

```typescript
function ImageGenerator() {
  const formData = useEditorStore(selectFormData);
  const addGeneratedImage = useEditorStore((state) => state.addGeneratedImage);
  const { generateImage } = useImageGeneration();

  const handleSaveToGallery = async () => {
    const imageUrl = await generateImage(formData);

    if (imageUrl) {
      addGeneratedImage({
        url: imageUrl,
        formData,
        template: formData.template || 'default',
      });

      toast.success('Added to gallery');
    }
  };

  return (
    <button onClick={handleSaveToGallery}>
      Save to Gallery
    </button>
  );
}
```

## Implementation Details

### Debouncing

The hook uses `useDebounceCallback` from `use-debounce` to delay preview generation:

```typescript
const generatePreview = useDebounceCallback(generatePreviewInternal, 500);
```

This prevents excessive API calls when the user is actively editing.

### Request Cancellation

Uses `AbortController` to cancel pending requests:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

// Cancel previous request
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}

// Create new controller
const controller = new AbortController();
abortControllerRef.current = controller;

fetch('/api/generate', {
  signal: controller.signal,
});
```

### Memory Management

Automatically revokes blob URLs to prevent memory leaks:

```typescript
// Revoke previous preview URL
if (previewUrl) {
  URL.revokeObjectURL(previewUrl);
}
```

### Validation

Checks for minimum required data before generation:

```typescript
if (!data.title || (typeof data.title === 'object' && !data.title.text)) {
  setPreviewUrl(null);
  setError(null);
  return;
}
```

## API Endpoint Requirements

The hook expects a POST endpoint at `/api/generate` with the following behavior:

**Request:**
```json
{
  "title": "My Title",
  "subtitle": "My Subtitle",
  "template": "default",
  "preview": true
}
```

**Response:**
- Success: Image blob (PNG format)
- Error: JSON with `{ error: string }`

**Status Codes:**
- `200`: Success
- `4xx`/`5xx`: Error (with JSON body)

## TypeScript Types

```typescript
interface ImageGenerationData {
  title: string | { text: string; styledChunks?: StyledChunk[] };
  subtitle?: string | { text: string; styledChunks?: StyledChunk[] };
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  backgroundImage?: string;
  authorName?: string;
  template?: string;
  gradientOverlay?: GradientOverlay;
  customFonts?: CustomFont[];
}

interface UseImageGenerationReturn {
  previewUrl: string | null;
  fullImageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  generatePreview: (data: ImageGenerationData) => Promise<void>;
  generateImage: (data: ImageGenerationData) => Promise<string | null>;
  clearPreview: () => void;
  clearError: () => void;
}
```

## Performance Considerations

1. **Debouncing**: 500ms delay prevents API spam
2. **Request Cancellation**: Aborts outdated requests
3. **Memory Cleanup**: Revokes blob URLs when no longer needed
4. **Selective Generation**: Only generates when minimum data is present

## Accessibility

- Error messages are clear and actionable
- Loading states are exposed for UI indicators
- No visual-only state changes (all state is accessible via properties)

## Browser Compatibility

- **Blob URLs**: All modern browsers
- **AbortController**: IE11+ with polyfill
- **Clipboard API**: Chrome 76+, Firefox 63+, Safari 13.1+
