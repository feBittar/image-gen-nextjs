import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ImageGenerationData } from '@/lib/types';

// Active panel types for the editor UI
export type ActivePanel = 'text' | 'background' | 'position' | 'advanced';

// Generated image history item
export interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  formData: ImageGenerationData;
  template: string;
}

// Editor state interface
interface EditorState {
  // State
  formData: ImageGenerationData;
  selectedTemplate: string;
  previewVisible: boolean;
  activePanel: ActivePanel;
  generatedImages: GeneratedImage[];
  isGenerating: boolean;

  // Actions
  updateFormData: (data: Partial<ImageGenerationData>) => void;
  setTemplate: (templateId: string) => void;
  togglePreview: () => void;
  setPreviewVisible: (visible: boolean) => void;
  setActivePanel: (panel: ActivePanel) => void;
  addGeneratedImage: (image: Omit<GeneratedImage, 'id' | 'timestamp'>) => void;
  removeGeneratedImage: (id: string) => void;
  clearGeneratedImages: () => void;
  setIsGenerating: (generating: boolean) => void;
  resetForm: () => void;
}

// Default form data
const defaultFormData: ImageGenerationData = {
  title: '',
  subtitle: '',
  titleStyle: {
    fontFamily: 'Arial',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitleStyle: {
    fontFamily: 'Arial',
    fontSize: '24px',
    fontWeight: 'normal',
    color: '#cccccc',
    textAlign: 'center',
  },
  template: 'default',
  gradientOverlay: {
    direction: 'to bottom',
    colors: [
      { color: '#000000', position: 0 },
      { color: '#000000', position: 100 },
    ],
    opacity: 0.5,
    blendMode: 'normal',
  },
};

// Create the store with devtools and persist middleware
export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        formData: defaultFormData,
        selectedTemplate: 'default',
        previewVisible: false,
        activePanel: 'text',
        generatedImages: [],
        isGenerating: false,

        // Actions
        updateFormData: (data) =>
          set(
            (state) => ({
              formData: {
                ...state.formData,
                ...data,
              },
            }),
            false,
            'updateFormData'
          ),

        setTemplate: (templateId) =>
          set(
            (state) => ({
              selectedTemplate: templateId,
              formData: {
                ...state.formData,
                template: templateId,
              },
            }),
            false,
            'setTemplate'
          ),

        togglePreview: () =>
          set(
            (state) => ({
              previewVisible: !state.previewVisible,
            }),
            false,
            'togglePreview'
          ),

        setPreviewVisible: (visible) =>
          set(
            {
              previewVisible: visible,
            },
            false,
            'setPreviewVisible'
          ),

        setActivePanel: (panel) =>
          set(
            {
              activePanel: panel,
            },
            false,
            'setActivePanel'
          ),

        addGeneratedImage: (image) =>
          set(
            (state) => {
              const newImage: GeneratedImage = {
                ...image,
                id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                timestamp: Date.now(),
              };

              return {
                generatedImages: [newImage, ...state.generatedImages],
              };
            },
            false,
            'addGeneratedImage'
          ),

        removeGeneratedImage: (id) =>
          set(
            (state) => ({
              generatedImages: state.generatedImages.filter((img) => img.id !== id),
            }),
            false,
            'removeGeneratedImage'
          ),

        clearGeneratedImages: () =>
          set(
            {
              generatedImages: [],
            },
            false,
            'clearGeneratedImages'
          ),

        setIsGenerating: (generating) =>
          set(
            {
              isGenerating: generating,
            },
            false,
            'setIsGenerating'
          ),

        resetForm: () =>
          set(
            {
              formData: defaultFormData,
              selectedTemplate: 'default',
              activePanel: 'text',
            },
            false,
            'resetForm'
          ),
      }),
      {
        name: 'editor-storage',
        // Only persist form data, template, and generated images
        partialize: (state) => ({
          formData: state.formData,
          selectedTemplate: state.selectedTemplate,
          generatedImages: state.generatedImages,
        }),
      }
    ),
    {
      name: 'EditorStore',
    }
  )
);

// Selectors for optimized re-renders
export const selectFormData = (state: EditorState) => state.formData;
export const selectTemplate = (state: EditorState) => state.selectedTemplate;
export const selectPreviewVisible = (state: EditorState) => state.previewVisible;
export const selectActivePanel = (state: EditorState) => state.activePanel;
export const selectGeneratedImages = (state: EditorState) => state.generatedImages;
export const selectIsGenerating = (state: EditorState) => state.isGenerating;
