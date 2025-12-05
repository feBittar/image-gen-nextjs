/**
 * Usage Examples for Zustand Stores
 *
 * These examples demonstrate how to use the stores in React components.
 * Copy and adapt these patterns to your actual components.
 */

import { useEffect } from 'react';
import {
  useEditorStore,
  useTemplateStore,
  useGalleryStore,
  selectFormData,
  selectFilteredImages,
} from './index';

// ============================================================================
// EXAMPLE 1: Editor Store Usage
// ============================================================================

export function ImageEditorExample() {
  // Method 1: Destructure all needed state and actions
  const {
    formData,
    selectedTemplate,
    isGenerating,
    updateFormData,
    setTemplate,
    resetForm,
  } = useEditorStore();

  // Method 2: Use selectors for optimized re-renders (RECOMMENDED)
  const formDataOptimized = useEditorStore(selectFormData);
  const updateFormDataOptimized = useEditorStore((state) => state.updateFormData);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ subtitle: e.target.value });
  };

  const handleStyleUpdate = (property: string, value: string) => {
    updateFormData({
      titleStyle: {
        ...formData.titleStyle,
        [property]: value,
      },
    });
  };

  const handleGenerate = async () => {
    // Use the store state in API calls
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        template: selectedTemplate,
      }),
    });

    if (response.ok) {
      const { imageUrl } = await response.json();

      // Add to generated images history
      useEditorStore.getState().addGeneratedImage({
        url: imageUrl,
        formData,
        template: selectedTemplate,
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        value={typeof formData.title === 'string' ? formData.title : ''}
        onChange={handleTitleChange}
        placeholder="Title"
      />

      <input
        type="text"
        value={typeof formData.subtitle === 'string' ? formData.subtitle : ''}
        onChange={handleSubtitleChange}
        placeholder="Subtitle"
      />

      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>

      <button onClick={resetForm}>Reset Form</button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Template Store Usage with API Fetching
// ============================================================================

export function TemplateSelectorExample() {
  const {
    templates,
    selectedTemplateId,
    isLoading,
    error,
    fetchTemplates,
    selectTemplate,
  } = useTemplateStore();

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Sync with editor store when template is selected
  const setEditorTemplate = useEditorStore((state) => state.setTemplate);

  const handleSelectTemplate = (templateId: string) => {
    selectTemplate(templateId);
    setEditorTemplate(templateId);
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (error) {
    return <div>Error loading templates: {error}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => handleSelectTemplate(template.id)}
          className={selectedTemplateId === template.id ? 'selected' : ''}
        >
          {template.thumbnail && (
            <img src={template.thumbnail} alt={template.name} />
          )}
          <h3>{template.name}</h3>
          {template.description && <p>{template.description}</p>}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Gallery Store Usage with Filters
// ============================================================================

export function ImageGalleryExample() {
  const {
    filters,
    sortBy,
    viewMode,
    selectedImages,
    setSearchQuery,
    setTemplateFilter,
    toggleFavoritesOnly,
    setSortBy,
    setViewMode,
    toggleImageSelection,
    deleteImage,
    toggleFavorite,
    clearSelection,
  } = useGalleryStore();

  // Use computed selector for filtered images
  const filteredImages = useGalleryStore(selectFilteredImages);

  const handleDeleteSelected = () => {
    const imagesToDelete = Array.from(selectedImages);
    useGalleryStore.getState().deleteImages(imagesToDelete);
  };

  return (
    <div>
      {/* Filters and Controls */}
      <div className="controls">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search images..."
        />

        <select
          value={filters.templateFilter || ''}
          onChange={(e) => setTemplateFilter(e.target.value || null)}
        >
          <option value="">All Templates</option>
          <option value="template1">Template 1</option>
          <option value="template2">Template 2</option>
        </select>

        <button
          onClick={toggleFavoritesOnly}
          className={filters.showFavoritesOnly ? 'active' : ''}
        >
          {filters.showFavoritesOnly ? 'Show All' : 'Show Favorites Only'}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="template">By Template</option>
          <option value="favorite">Favorites First</option>
        </select>

        <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          View: {viewMode}
        </button>
      </div>

      {/* Selection Actions */}
      {selectedImages.size > 0 && (
        <div className="selection-actions">
          <span>{selectedImages.size} selected</span>
          <button onClick={clearSelection}>Clear Selection</button>
          <button onClick={handleDeleteSelected}>Delete Selected</button>
        </div>
      )}

      {/* Gallery Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'flex flex-col gap-2'}>
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className={selectedImages.has(image.id) ? 'selected' : ''}
          >
            <img
              src={image.thumbnail || image.url}
              alt=""
              onClick={() => toggleImageSelection(image.id)}
            />

            <div className="actions">
              <button onClick={() => toggleFavorite(image.id)}>
                {image.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button onClick={() => deleteImage(image.id)}>Delete</button>
            </div>

            <div className="metadata">
              <span>Template: {image.template}</span>
              <span>Date: {new Date(image.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="empty-state">
          No images found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Using Multiple Stores Together
// ============================================================================

export function ImageGeneratorFullExample() {
  const { formData, updateFormData, addGeneratedImage } = useEditorStore();
  const { templates, fetchTemplates } = useTemplateStore();
  const addToGallery = useGalleryStore((state) => state.addImage);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { imageUrl } = await response.json();

        const generatedImage = {
          url: imageUrl,
          formData,
          template: formData.template || 'default',
        };

        // Add to both editor history and gallery
        addGeneratedImage(generatedImage);
        addToGallery(generatedImage);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div>
      {/* Editor UI */}
      {/* ... */}

      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Accessing Store Outside Components (Utility Functions)
// ============================================================================

export async function generateImageUtility(data: any) {
  // Access store state outside of React components
  const editorState = useEditorStore.getState();
  const galleryState = useGalleryStore.getState();

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const { imageUrl } = await response.json();

    // Call store actions directly
    editorState.addGeneratedImage({
      url: imageUrl,
      formData: data,
      template: data.template,
    });

    galleryState.addImage({
      url: imageUrl,
      formData: data,
      template: data.template,
    });
  }
}

// ============================================================================
// EXAMPLE 6: Custom Hooks with Store Logic
// ============================================================================

export function useImageGeneration() {
  const { formData, isGenerating, setIsGenerating, addGeneratedImage } = useEditorStore();
  const addToGallery = useGalleryStore((state) => state.addImage);

  const generateImage = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const { imageUrl } = await response.json();

      const generatedImage = {
        url: imageUrl,
        formData,
        template: formData.template || 'default',
      };

      addGeneratedImage(generatedImage);
      addToGallery(generatedImage);

      return imageUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImage,
    isGenerating,
  };
}

// Usage in component:
export function GenerateButtonExample() {
  const { generateImage, isGenerating } = useImageGeneration();

  const handleClick = async () => {
    try {
      const imageUrl = await generateImage();
      console.log('Generated:', imageUrl);
    } catch (error) {
      console.error('Failed to generate image');
    }
  };

  return (
    <button onClick={handleClick} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate Image'}
    </button>
  );
}
