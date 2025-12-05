import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ImageGenerationData } from '@/lib/types';

// Gallery image item
export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  timestamp: number;
  formData: ImageGenerationData;
  template: string;
  tags?: string[];
  favorite?: boolean;
}

// Filter options
export interface GalleryFilters {
  searchQuery: string;
  templateFilter: string | null;
  dateRange: {
    start: number | null;
    end: number | null;
  };
  showFavoritesOnly: boolean;
  tags: string[];
}

// Sort options
export type SortOption = 'newest' | 'oldest' | 'template' | 'favorite';

// Gallery state interface
interface GalleryState {
  // State
  images: GalleryImage[];
  selectedImages: Set<string>;
  filters: GalleryFilters;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';

  // Actions - Image management
  addImage: (image: Omit<GalleryImage, 'id' | 'timestamp'>) => void;
  addImages: (images: Omit<GalleryImage, 'id' | 'timestamp'>[]) => void;
  deleteImage: (id: string) => void;
  deleteImages: (ids: string[]) => void;
  updateImage: (id: string, updates: Partial<GalleryImage>) => void;
  toggleFavorite: (id: string) => void;
  clearImages: () => void;

  // Actions - Selection
  selectImage: (id: string) => void;
  deselectImage: (id: string) => void;
  toggleImageSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Actions - Filters
  setSearchQuery: (query: string) => void;
  setTemplateFilter: (template: string | null) => void;
  setDateRange: (start: number | null, end: number | null) => void;
  toggleFavoritesOnly: () => void;
  addTagFilter: (tag: string) => void;
  removeTagFilter: (tag: string) => void;
  clearFilters: () => void;

  // Actions - Sorting and view
  setSortBy: (sortBy: SortOption) => void;
  setViewMode: (mode: 'grid' | 'list') => void;

  // Computed
  getFilteredImages: () => GalleryImage[];
  getSelectedImagesData: () => GalleryImage[];
}

// Default filters
const defaultFilters: GalleryFilters = {
  searchQuery: '',
  templateFilter: null,
  dateRange: {
    start: null,
    end: null,
  },
  showFavoritesOnly: false,
  tags: [],
};

// Create the gallery store
export const useGalleryStore = create<GalleryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        images: [],
        selectedImages: new Set(),
        filters: defaultFilters,
        sortBy: 'newest',
        viewMode: 'grid',

        // Image management actions
        addImage: (image) =>
          set(
            (state) => {
              const newImage: GalleryImage = {
                ...image,
                id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                timestamp: Date.now(),
              };

              return {
                images: [newImage, ...state.images],
              };
            },
            false,
            'addImage'
          ),

        addImages: (images) =>
          set(
            (state) => {
              const newImages: GalleryImage[] = images.map((img) => ({
                ...img,
                id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                timestamp: Date.now(),
              }));

              return {
                images: [...newImages, ...state.images],
              };
            },
            false,
            'addImages'
          ),

        deleteImage: (id) =>
          set(
            (state) => {
              const newSelectedImages = new Set(state.selectedImages);
              newSelectedImages.delete(id);

              return {
                images: state.images.filter((img) => img.id !== id),
                selectedImages: newSelectedImages,
              };
            },
            false,
            'deleteImage'
          ),

        deleteImages: (ids) =>
          set(
            (state) => {
              const idsSet = new Set(ids);
              const newSelectedImages = new Set(state.selectedImages);
              ids.forEach((id) => newSelectedImages.delete(id));

              return {
                images: state.images.filter((img) => !idsSet.has(img.id)),
                selectedImages: newSelectedImages,
              };
            },
            false,
            'deleteImages'
          ),

        updateImage: (id, updates) =>
          set(
            (state) => ({
              images: state.images.map((img) =>
                img.id === id ? { ...img, ...updates } : img
              ),
            }),
            false,
            'updateImage'
          ),

        toggleFavorite: (id) =>
          set(
            (state) => ({
              images: state.images.map((img) =>
                img.id === id ? { ...img, favorite: !img.favorite } : img
              ),
            }),
            false,
            'toggleFavorite'
          ),

        clearImages: () =>
          set(
            {
              images: [],
              selectedImages: new Set(),
            },
            false,
            'clearImages'
          ),

        // Selection actions
        selectImage: (id) =>
          set(
            (state) => {
              const newSelectedImages = new Set(state.selectedImages);
              newSelectedImages.add(id);
              return { selectedImages: newSelectedImages };
            },
            false,
            'selectImage'
          ),

        deselectImage: (id) =>
          set(
            (state) => {
              const newSelectedImages = new Set(state.selectedImages);
              newSelectedImages.delete(id);
              return { selectedImages: newSelectedImages };
            },
            false,
            'deselectImage'
          ),

        toggleImageSelection: (id) =>
          set(
            (state) => {
              const newSelectedImages = new Set(state.selectedImages);
              if (newSelectedImages.has(id)) {
                newSelectedImages.delete(id);
              } else {
                newSelectedImages.add(id);
              }
              return { selectedImages: newSelectedImages };
            },
            false,
            'toggleImageSelection'
          ),

        selectAll: () =>
          set(
            (state) => ({
              selectedImages: new Set(state.images.map((img) => img.id)),
            }),
            false,
            'selectAll'
          ),

        clearSelection: () =>
          set(
            {
              selectedImages: new Set(),
            },
            false,
            'clearSelection'
          ),

        // Filter actions
        setSearchQuery: (query) =>
          set(
            (state) => ({
              filters: { ...state.filters, searchQuery: query },
            }),
            false,
            'setSearchQuery'
          ),

        setTemplateFilter: (template) =>
          set(
            (state) => ({
              filters: { ...state.filters, templateFilter: template },
            }),
            false,
            'setTemplateFilter'
          ),

        setDateRange: (start, end) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                dateRange: { start, end },
              },
            }),
            false,
            'setDateRange'
          ),

        toggleFavoritesOnly: () =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                showFavoritesOnly: !state.filters.showFavoritesOnly,
              },
            }),
            false,
            'toggleFavoritesOnly'
          ),

        addTagFilter: (tag) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                tags: [...state.filters.tags, tag],
              },
            }),
            false,
            'addTagFilter'
          ),

        removeTagFilter: (tag) =>
          set(
            (state) => ({
              filters: {
                ...state.filters,
                tags: state.filters.tags.filter((t) => t !== tag),
              },
            }),
            false,
            'removeTagFilter'
          ),

        clearFilters: () =>
          set(
            {
              filters: defaultFilters,
            },
            false,
            'clearFilters'
          ),

        // Sorting and view actions
        setSortBy: (sortBy) =>
          set(
            {
              sortBy,
            },
            false,
            'setSortBy'
          ),

        setViewMode: (mode) =>
          set(
            {
              viewMode: mode,
            },
            false,
            'setViewMode'
          ),

        // Computed getters
        getFilteredImages: () => {
          const state = get();
          let filtered = [...state.images];

          // Apply search filter
          if (state.filters.searchQuery) {
            const query = state.filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (img) =>
                (typeof img.formData.title === 'string' &&
                  img.formData.title.toLowerCase().includes(query)) ||
                (typeof img.formData.subtitle === 'string' &&
                  img.formData.subtitle.toLowerCase().includes(query)) ||
                img.template.toLowerCase().includes(query) ||
                img.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
          }

          // Apply template filter
          if (state.filters.templateFilter) {
            filtered = filtered.filter(
              (img) => img.template === state.filters.templateFilter
            );
          }

          // Apply date range filter
          if (state.filters.dateRange.start || state.filters.dateRange.end) {
            filtered = filtered.filter((img) => {
              const { start, end } = state.filters.dateRange;
              if (start && img.timestamp < start) return false;
              if (end && img.timestamp > end) return false;
              return true;
            });
          }

          // Apply favorites filter
          if (state.filters.showFavoritesOnly) {
            filtered = filtered.filter((img) => img.favorite);
          }

          // Apply tag filters
          if (state.filters.tags.length > 0) {
            filtered = filtered.filter((img) =>
              state.filters.tags.every((tag) => img.tags?.includes(tag))
            );
          }

          // Apply sorting
          switch (state.sortBy) {
            case 'newest':
              filtered.sort((a, b) => b.timestamp - a.timestamp);
              break;
            case 'oldest':
              filtered.sort((a, b) => a.timestamp - b.timestamp);
              break;
            case 'template':
              filtered.sort((a, b) => a.template.localeCompare(b.template));
              break;
            case 'favorite':
              filtered.sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));
              break;
          }

          return filtered;
        },

        getSelectedImagesData: () => {
          const state = get();
          return state.images.filter((img) => state.selectedImages.has(img.id));
        },
      }),
      {
        name: 'gallery-storage',
        // Custom serialization for Set
        partialize: (state) => ({
          images: state.images,
          filters: state.filters,
          sortBy: state.sortBy,
          viewMode: state.viewMode,
          // Convert Set to array for storage
          selectedImages: Array.from(state.selectedImages),
        }),
        // Custom deserialization for Set
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray((state as any).selectedImages)) {
            state.selectedImages = new Set((state as any).selectedImages);
          }
        },
      }
    ),
    {
      name: 'GalleryStore',
    }
  )
);

// Selectors for optimized re-renders
export const selectImages = (state: GalleryState) => state.images;
export const selectFilteredImages = (state: GalleryState) => state.getFilteredImages();
export const selectSelectedImages = (state: GalleryState) => state.selectedImages;
export const selectSelectedImagesData = (state: GalleryState) => state.getSelectedImagesData();
export const selectFilters = (state: GalleryState) => state.filters;
export const selectSortBy = (state: GalleryState) => state.sortBy;
export const selectViewMode = (state: GalleryState) => state.viewMode;

// Computed selectors
export const selectImageById = (id: string) => (state: GalleryState) =>
  state.images.find((img) => img.id === id);

export const selectImagesByTemplate = (template: string) => (state: GalleryState) =>
  state.images.filter((img) => img.template === template);

export const selectFavoriteImages = (state: GalleryState) =>
  state.images.filter((img) => img.favorite);

export const selectRecentImages = (count: number) => (state: GalleryState) =>
  state.images
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, count);
