import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Template } from '@/lib/types';

// Template store state interface
interface TemplateState {
  // State
  templates: Template[];
  selectedTemplateId: string | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  selectTemplate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTemplates: () => Promise<void>;
  clearError: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Create the template store
export const useTemplateStore = create<TemplateState>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      selectedTemplateId: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Actions
      setTemplates: (templates) =>
        set(
          {
            templates,
            lastFetched: Date.now(),
            error: null,
          },
          false,
          'setTemplates'
        ),

      addTemplate: (template) =>
        set(
          (state) => ({
            templates: [...state.templates, template],
          }),
          false,
          'addTemplate'
        ),

      removeTemplate: (id) =>
        set(
          (state) => ({
            templates: state.templates.filter((t) => t.id !== id),
            selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId,
          }),
          false,
          'removeTemplate'
        ),

      updateTemplate: (id, updates) =>
        set(
          (state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          }),
          false,
          'updateTemplate'
        ),

      selectTemplate: (id) =>
        set(
          {
            selectedTemplateId: id,
          },
          false,
          'selectTemplate'
        ),

      setLoading: (loading) =>
        set(
          {
            isLoading: loading,
          },
          false,
          'setLoading'
        ),

      setError: (error) =>
        set(
          {
            error,
            isLoading: false,
          },
          false,
          'setError'
        ),

      clearError: () =>
        set(
          {
            error: null,
          },
          false,
          'clearError'
        ),

      fetchTemplates: async () => {
        const state = get();

        // Check cache validity
        if (
          state.templates.length > 0 &&
          state.lastFetched &&
          Date.now() - state.lastFetched < CACHE_DURATION
        ) {
          console.log('Using cached templates');
          return;
        }

        set({ isLoading: true, error: null }, false, 'fetchTemplates:start');

        try {
          const response = await fetch('/api/templates');

          if (!response.ok) {
            throw new Error(`Failed to fetch templates: ${response.statusText}`);
          }

          const data = await response.json();

          // Transform API response to Template[] format
          const templates: Template[] = data.templates || data;

          set(
            {
              templates,
              isLoading: false,
              error: null,
              lastFetched: Date.now(),
            },
            false,
            'fetchTemplates:success'
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch templates';

          set(
            {
              isLoading: false,
              error: errorMessage,
            },
            false,
            'fetchTemplates:error'
          );

          console.error('Error fetching templates:', error);
        }
      },
    }),
    {
      name: 'TemplateStore',
    }
  )
);

// Selectors for optimized re-renders
export const selectTemplates = (state: TemplateState) => state.templates;
export const selectSelectedTemplate = (state: TemplateState) =>
  state.templates.find((t) => t.id === state.selectedTemplateId) || null;
export const selectIsLoading = (state: TemplateState) => state.isLoading;
export const selectError = (state: TemplateState) => state.error;

// Computed selectors
export const selectTemplateById = (id: string) => (state: TemplateState) =>
  state.templates.find((t) => t.id === id);

export const selectTemplatesByCategory = (category: string) => (state: TemplateState) =>
  state.templates.filter((t) => (t as any).category === category);
