import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  getModule,
  checkDependencies,
  checkConflicts,
  validateModuleCombination
} from '@/lib/modules/registry';
import type { ModuleData, TemplatePreset } from '@/lib/modules/types';
import type { CompositionConfig, RenderOrderItem, SpatialRule } from '@/lib/layout/types';
import { createConfigFromPreset, DEFAULT_LAYOUT_PRESET } from '@/lib/layout/presets';
import {
  getNextInstanceNumber,
  createInstanceId,
  isInstanceId,
  getBaseModuleId,
  parseModuleId
} from '@/lib/modules/moduleInstanceUtils';

// ============================================================================
// CONSTANTS
// ============================================================================

// All modules are now independent per slide
export const ALL_MODULES = [
  'viewport',
  'card',
  'textFields',
  'contentImage',
  'corners',
  'logo',
  'bullets',
  'freeText',
  'svgElements',
  'arrowBottomText'
];

// ============================================================================
// TYPES
// ============================================================================

export interface Slide {
  id: string; // UUID
  data: Record<string, ModuleData>; // Per-slide module data
  enabledModules: string[]; // Per-slide enabled modules
}

export interface FreeImageConfig {
  enabled: boolean;
  url: string;
  offsetX: number; // -500 to 500
  offsetY: number; // -500 to 500
  scale: number; // 50 to 200
  rotation: number; // -180 to 180
  outlineEffect: {
    enabled: boolean;
    color: string;
    size: number; // 0 to 50
  };
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface ModularEditorState {
  // Current preset
  currentPresetId: string | null;
  currentPresetData: TemplatePreset | null;

  // Slides system
  slides: Slide[];
  currentSlideIndex: number; // 0-based index

  // Free image configuration (replaces duo centerImage)
  freeImage: FreeImageConfig;

  // Layout Manager: composition config
  compositionConfig: CompositionConfig | null;

  // UI state
  activeModuleTab: string | null;
  isDirty: boolean;

  // Validation errors
  validationErrors: string[];

  // Actions
  loadPreset: (preset: TemplatePreset) => void;
  toggleModule: (moduleId: string, enabled: boolean) => void;
  updateModuleData: (moduleId: string, data: Partial<ModuleData>) => void;
  resetToPreset: () => void;
  getComposedData: () => Record<string, ModuleData>;
  setActiveModuleTab: (moduleId: string | null) => void;
  markClean: () => void;
  validateModules: () => boolean;

  // Module instance management
  addModuleInstance: (baseModuleId: string) => void;
  removeModuleInstance: (instanceId: string) => void;

  // Slide management actions
  addSlide: () => void;
  removeSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  importSlides: (importedSlides: Array<{ id?: string; enabledModules: string[]; data: Record<string, ModuleData> }>) => void;
  setCurrentSlideIndex: (index: number) => void;
  getCurrentSlideData: () => Record<string, ModuleData>;
  getCurrentSlideEnabledModules: () => string[];
  updateCurrentSlideModule: (moduleId: string, data: Partial<ModuleData>) => void;
  isCarouselMode: () => boolean;

  // Free image actions
  updateFreeImage: (updates: Partial<FreeImageConfig>) => void;

  // Layout Manager actions
  setCompositionConfig: (config: CompositionConfig | null) => void;
  updateRenderOrder: (order: RenderOrderItem[]) => void;
  setLayerOverride: (moduleId: string, zIndex: number) => void;
  resetLayerOverrides: () => void;
  addSpatialRule: (rule: SpatialRule) => void;
  removeSpatialRule: (ruleId: string) => void;
  loadLayoutPreset: (presetId: string) => void;
  resetLayoutToDefault: () => void;
  clearLayout: () => void;
  getCompositionConfig: () => CompositionConfig | null;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearState: () => void;

  // Internal migration helper
  _migrateFromDuoMode: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateSlideId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp-based ID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptySlide(presetModules?: string[]): Slide {
  const enabledModules = presetModules || [];
  const data: Record<string, ModuleData> = {};

  // Initialize module data with defaults for all modules
  for (const moduleId of enabledModules) {
    const module = getModule(moduleId);
    if (module) {
      data[moduleId] = { ...(module.defaults as Record<string, unknown>) };
    }
  }

  return {
    id: generateSlideId(),
    data,
    enabledModules,
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialFreeImageConfig: FreeImageConfig = {
  enabled: false,
  url: '',
  offsetX: 0,
  offsetY: 0,
  scale: 100,
  rotation: 0,
  outlineEffect: {
    enabled: false,
    color: '#FFFFFF',
    size: 10,
  },
};

const initialState = {
  currentPresetId: null,
  currentPresetData: null,
  slides: [createEmptySlide()], // Start with 1 blank slide
  currentSlideIndex: 0,
  freeImage: initialFreeImageConfig,
  compositionConfig: null,
  activeModuleTab: null,
  isDirty: false,
  validationErrors: [],
};

// ============================================================================
// STORE
// ============================================================================

export const useModularStore = create<ModularEditorState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // PRESET LOADING
        // ====================================================================

        loadPreset: (preset: TemplatePreset) => {
          // Load preset configuration
          const slideData: Record<string, ModuleData> = {};

          // Initialize module data with preset defaults (all modules go into slide)
          for (const moduleId of preset.defaultModules) {
            const module = getModule(moduleId);
            if (!module) {
              console.warn(`Module "${moduleId}" not found in registry`);
              continue;
            }

            // Start with module's defaults
            const data = { ...(module.defaults as Record<string, unknown>) };

            // Apply preset-specific overrides if they exist
            if (preset.moduleDefaults[moduleId]) {
              Object.assign(data, preset.moduleDefaults[moduleId]);
            }

            // Add to slide data (all modules are now per-slide)
            slideData[moduleId] = JSON.parse(JSON.stringify(data));
          }

          // Create initial slide with preset data
          const initialSlide: Slide = {
            id: generateSlideId(),
            data: slideData,
            enabledModules: preset.defaultModules,
          };

          // Validate the preset combination
          const validation = validateModuleCombination(preset.defaultModules);

          set(
            {
              currentPresetId: preset.id,
              currentPresetData: preset,
              slides: [initialSlide],
              currentSlideIndex: 0,
              isDirty: false,
              validationErrors: validation.errors,
            },
            false,
            'loadPreset'
          );
        },

        // ====================================================================
        // MODULE TOGGLING
        // ====================================================================

        toggleModule: (moduleId: string, enabled: boolean) => {
          const state = get();

          // Parse module ID to handle instances (e.g., textFields-1 -> textFields)
          const baseModuleId = getBaseModuleId(moduleId);
          const module = getModule(baseModuleId);

          if (!module) {
            console.error(`Module "${baseModuleId}" not found`);
            return;
          }

          const errors: string[] = [];
          const currentSlide = state.slides[state.currentSlideIndex];

          if (!currentSlide) {
            console.error('No current slide');
            return;
          }

          // All modules belong to current slide
          const targetList = currentSlide.enabledModules;

          if (enabled) {
            // Check dependencies
            const missingDeps = checkDependencies(moduleId, targetList);
            if (missingDeps.length > 0) {
              errors.push(
                `Cannot enable "${module.name}": missing dependencies (${missingDeps.join(', ')})`
              );
              set({ validationErrors: errors }, false, 'toggleModule:error');
              return;
            }

            // Check conflicts
            const conflicts = checkConflicts(moduleId, targetList);
            if (conflicts.length > 0) {
              errors.push(
                `Cannot enable "${module.name}": conflicts with (${conflicts.join(', ')})`
              );
              set({ validationErrors: errors }, false, 'toggleModule:error');
              return;
            }

            // Initialize module data
            const defaultData = { ...(module.defaults as Record<string, unknown>) };

            // Add to current slide
            const newSlides = [...state.slides];
            const updatedSlide = { ...newSlides[state.currentSlideIndex] };

            if (!updatedSlide.enabledModules.includes(moduleId)) {
              updatedSlide.enabledModules = [...updatedSlide.enabledModules, moduleId];
            }

            if (!updatedSlide.data[moduleId]) {
              updatedSlide.data[moduleId] = JSON.parse(JSON.stringify(defaultData));
            }

            newSlides[state.currentSlideIndex] = updatedSlide;

            set(
              {
                slides: newSlides,
                isDirty: true,
                validationErrors: [],
              },
              false,
              'toggleModule:enable'
            );
          } else {
            // Check if any other enabled modules depend on this one
            for (const enabledId of targetList) {
              if (enabledId === moduleId) continue;
              const enabledModule = getModule(enabledId);
              if (enabledModule?.dependencies?.includes(moduleId)) {
                errors.push(
                  `Cannot disable "${module.name}": required by "${enabledModule.name}"`
                );
                set({ validationErrors: errors }, false, 'toggleModule:error');
                return;
              }
            }

            // Remove from current slide
            const newSlides = [...state.slides];
            const updatedSlide = { ...newSlides[state.currentSlideIndex] };

            updatedSlide.enabledModules = updatedSlide.enabledModules.filter(
              id => id !== moduleId
            );

            const newData = { ...updatedSlide.data };
            delete newData[moduleId];
            updatedSlide.data = newData;

            newSlides[state.currentSlideIndex] = updatedSlide;

            set(
              {
                slides: newSlides,
                isDirty: true,
                validationErrors: [],
              },
              false,
              'toggleModule:disable'
            );
          }
        },

        // ====================================================================
        // MODULE INSTANCE MANAGEMENT
        // ====================================================================

        addModuleInstance: (baseModuleId: string) => {
          const state = get();
          const module = getModule(baseModuleId);

          if (!module) {
            console.error(`Module "${baseModuleId}" not found`);
            return;
          }

          if (!module.allowMultipleInstances) {
            console.error(`Module "${baseModuleId}" does not allow multiple instances`);
            return;
          }

          const currentSlide = state.slides[state.currentSlideIndex];
          if (!currentSlide) {
            console.error('No current slide');
            return;
          }

          // Get next instance number
          const nextInstance = getNextInstanceNumber(baseModuleId, currentSlide.enabledModules);
          const newInstanceId = createInstanceId(baseModuleId, nextInstance);

          // Enable the new instance
          get().toggleModule(newInstanceId, true);
        },

        removeModuleInstance: (instanceId: string) => {
          if (!isInstanceId(instanceId)) {
            console.error(`"${instanceId}" is not a valid instance ID`);
            return;
          }

          // Disable the instance
          get().toggleModule(instanceId, false);
        },

        // ====================================================================
        // MODULE DATA UPDATES
        // ====================================================================

        updateModuleData: (moduleId: string, data: Partial<ModuleData>) => {
          // All modules are now per-slide
          get().updateCurrentSlideModule(moduleId, data);
        },

        // ====================================================================
        // PRESET RESET
        // ====================================================================

        resetToPreset: () => {
          const state = get();
          if (!state.currentPresetData) {
            console.warn('No preset loaded to reset to');
            return;
          }

          // Reload the current preset
          get().loadPreset(state.currentPresetData);
        },

        // ====================================================================
        // DATA COMPOSITION
        // ====================================================================

        getComposedData: () => {
          const state = get();
          const composedData: Record<string, ModuleData> = {};
          const currentSlide = state.slides[state.currentSlideIndex];

          if (!currentSlide) {
            return composedData;
          }

          // Include current slide data (all modules are per-slide now)
          for (const moduleId of currentSlide.enabledModules) {
            if (currentSlide.data[moduleId]) {
              composedData[moduleId] = currentSlide.data[moduleId];
            }
          }

          return composedData;
        },

        // ====================================================================
        // UI STATE
        // ====================================================================

        setActiveModuleTab: (moduleId: string | null) => {
          set(
            {
              activeModuleTab: moduleId,
            },
            false,
            'setActiveModuleTab'
          );
        },

        markClean: () => {
          set(
            {
              isDirty: false,
            },
            false,
            'markClean'
          );
        },

        // ====================================================================
        // VALIDATION
        // ====================================================================

        validateModules: () => {
          const state = get();
          const currentSlide = state.slides[state.currentSlideIndex];

          if (!currentSlide) {
            set({ validationErrors: ['No current slide'] }, false, 'validateModules');
            return false;
          }

          // All modules are per-slide now
          const validation = validateModuleCombination(currentSlide.enabledModules);

          set(
            {
              validationErrors: validation.errors,
            },
            false,
            'validateModules'
          );

          return validation.valid;
        },

        // ====================================================================
        // SLIDE MANAGEMENT ACTIONS
        // ====================================================================

        addSlide: () => {
          const state = get();
          const currentSlide = state.slides[state.currentSlideIndex];

          // Create new slide with same enabled modules as current slide
          const newSlide = createEmptySlide(
            currentSlide ? currentSlide.enabledModules : []
          );

          // Copy default data structure from current slide
          if (currentSlide) {
            for (const moduleId of currentSlide.enabledModules) {
              const module = getModule(moduleId);
              if (module) {
                newSlide.data[moduleId] = { ...(module.defaults as Record<string, unknown>) };
              }
            }
          }

          set(
            {
              slides: [...state.slides, newSlide],
              currentSlideIndex: state.slides.length, // Switch to new slide
              isDirty: true,
            },
            false,
            'addSlide'
          );
        },

        removeSlide: (index: number) => {
          const state = get();

          // Cannot remove if only one slide
          if (state.slides.length <= 1) {
            console.warn('Cannot remove last slide');
            return;
          }

          // Validate index
          if (index < 0 || index >= state.slides.length) {
            console.error('Invalid slide index');
            return;
          }

          const newSlides = state.slides.filter((_, i) => i !== index);
          let newCurrentIndex = state.currentSlideIndex;

          // Adjust current index if needed
          if (index === state.currentSlideIndex) {
            // If removing current slide, move to previous slide or first slide
            newCurrentIndex = Math.max(0, index - 1);
          } else if (index < state.currentSlideIndex) {
            // If removing a slide before current, shift index down
            newCurrentIndex = state.currentSlideIndex - 1;
          }

          set(
            {
              slides: newSlides,
              currentSlideIndex: newCurrentIndex,
              isDirty: true,
            },
            false,
            'removeSlide'
          );
        },

        duplicateSlide: (index: number) => {
          const state = get();

          // Validate index
          if (index < 0 || index >= state.slides.length) {
            console.error('Invalid slide index');
            return;
          }

          const sourceSlide = state.slides[index];

          // Deep clone the slide
          const duplicatedSlide: Slide = {
            id: generateSlideId(),
            data: JSON.parse(JSON.stringify(sourceSlide.data)),
            enabledModules: [...sourceSlide.enabledModules],
          };

          // Add duplicated slide at the end
          set(
            {
              slides: [...state.slides, duplicatedSlide],
              currentSlideIndex: state.slides.length, // Switch to duplicated slide
              isDirty: true,
            },
            false,
            'duplicateSlide'
          );
        },

        importSlides: (importedSlides: Array<{ id?: string; enabledModules: string[]; data: Record<string, ModuleData> }>) => {
          // Convert imported slides to proper Slide format
          const newSlides: Slide[] = importedSlides.map((slide) => ({
            id: slide.id || generateSlideId(),
            enabledModules: slide.enabledModules,
            data: slide.data,
          }));

          set(
            {
              slides: newSlides,
              currentSlideIndex: 0, // Reset to first slide
              isDirty: false, // Mark as clean since we just loaded
            },
            false,
            'importSlides'
          );
        },

        setCurrentSlideIndex: (index: number) => {
          const state = get();

          // Validate index
          if (index < 0 || index >= state.slides.length) {
            console.error('Invalid slide index');
            return;
          }

          set(
            {
              currentSlideIndex: index,
            },
            false,
            'setCurrentSlideIndex'
          );
        },

        getCurrentSlideData: () => {
          const state = get();
          const currentSlide = state.slides[state.currentSlideIndex];
          return currentSlide ? currentSlide.data : {};
        },

        getCurrentSlideEnabledModules: () => {
          const state = get();
          const currentSlide = state.slides[state.currentSlideIndex];

          // Return only current slide's modules (no shared modules anymore)
          return currentSlide ? currentSlide.enabledModules : [];
        },

        updateCurrentSlideModule: (moduleId: string, data: Partial<ModuleData>) => {
          const state = get();
          const currentSlide = state.slides[state.currentSlideIndex];

          if (!currentSlide) {
            console.error('No current slide');
            return;
          }

          const currentData = currentSlide.data[moduleId] || {};
          const updatedData = {
            ...currentData,
            ...data,
          };

          const newSlides = [...state.slides];
          newSlides[state.currentSlideIndex] = {
            ...currentSlide,
            data: {
              ...currentSlide.data,
              [moduleId]: updatedData,
            },
          };

          set(
            {
              slides: newSlides,
              isDirty: true,
            },
            false,
            'updateCurrentSlideModule'
          );
        },

        isCarouselMode: () => {
          return get().slides.length >= 2;
        },

        // ====================================================================
        // FREE IMAGE ACTIONS
        // ====================================================================

        updateFreeImage: (updates: Partial<FreeImageConfig>) => {
          const state = get();

          set(
            {
              freeImage: {
                ...state.freeImage,
                ...updates,
                // Handle nested outlineEffect updates
                outlineEffect: updates.outlineEffect
                  ? { ...state.freeImage.outlineEffect, ...updates.outlineEffect }
                  : state.freeImage.outlineEffect,
              },
              isDirty: true,
            },
            false,
            'updateFreeImage'
          );
        },

        // ====================================================================
        // PERSISTENCE
        // ====================================================================

        saveToLocalStorage: () => {
          // This is handled automatically by the persist middleware
          // But we can trigger a manual save if needed
          const state = get();
          localStorage.setItem(
            'modular-editor-storage',
            JSON.stringify({
              currentPresetId: state.currentPresetId,
              currentPresetData: state.currentPresetData,
              slides: state.slides,
              currentSlideIndex: state.currentSlideIndex,
              freeImage: state.freeImage,
              compositionConfig: state.compositionConfig,
            })
          );
        },

        loadFromLocalStorage: () => {
          // This is handled automatically by the persist middleware
          // But we can trigger a manual load if needed
          const stored = localStorage.getItem('modular-editor-storage');
          if (stored) {
            try {
              const data = JSON.parse(stored);

              // Migrate from old duo mode if needed
              const needsMigration = !data.slides && (data.slide1Data || data.slide2Data);

              if (needsMigration) {
                console.log('[Store] Migrating from duo mode to slides');
                set(
                  {
                    currentPresetId: data.currentPresetId || null,
                    currentPresetData: data.currentPresetData || null,
                    compositionConfig: data.compositionConfig || null,
                    isDirty: false,
                  },
                  false,
                  'loadFromLocalStorage:preMigration'
                );
                get()._migrateFromDuoMode();
              } else {
                set(
                  {
                    currentPresetId: data.currentPresetId || null,
                    currentPresetData: data.currentPresetData || null,
                    slides: data.slides || [createEmptySlide()],
                    currentSlideIndex: data.currentSlideIndex || 0,
                    freeImage: data.freeImage || initialFreeImageConfig,
                    compositionConfig: data.compositionConfig || null,
                    isDirty: false,
                  },
                  false,
                  'loadFromLocalStorage'
                );
              }
            } catch (error) {
              console.error('Failed to load from localStorage:', error);
            }
          }
        },

        clearState: () => {
          set(
            {
              ...initialState,
              slides: [createEmptySlide()],
              freeImage: { ...initialFreeImageConfig },
            },
            false,
            'clearState'
          );
        },

        // ====================================================================
        // MIGRATION
        // ====================================================================

        _migrateFromDuoMode: () => {
          const stored = localStorage.getItem('modular-editor-storage');
          if (!stored) return;

          try {
            const data = JSON.parse(stored);
            const state = get();

            // Check if this is old duo mode data
            const duoEnabled = data.moduleData?.duo?.enabled === true;
            const hasDuoMode = data.moduleData?.duo?.mode === 'independent';
            const hasSlideData = data.slide1Data || data.slide2Data;

            if (duoEnabled && hasSlideData) {
              console.log('[Store] Migrating duo mode to 2 slides');

              // Create slide 1 - merge old shared data with slide-specific data
              const slide1Data = { ...(data.slide1Data || {}) };
              const slide1EnabledModules = [...(data.slide1EnabledModules || [])];

              // Merge in viewport and card from old moduleData if they existed
              if (data.moduleData) {
                for (const moduleId of ['viewport', 'card']) {
                  if (data.moduleData[moduleId]) {
                    slide1Data[moduleId] = data.moduleData[moduleId];
                    if (!slide1EnabledModules.includes(moduleId)) {
                      slide1EnabledModules.push(moduleId);
                    }
                  }
                }
              }

              const slide1: Slide = {
                id: generateSlideId(),
                data: slide1Data,
                enabledModules: slide1EnabledModules,
              };

              // Create slide 2 - merge old shared data with slide-specific data
              const slide2Data = { ...(data.slide2Data || {}) };
              const slide2EnabledModules = [...(data.slide2EnabledModules || [])];

              // Merge in viewport and card from old moduleData if they existed
              if (data.moduleData) {
                for (const moduleId of ['viewport', 'card']) {
                  if (data.moduleData[moduleId]) {
                    slide2Data[moduleId] = data.moduleData[moduleId];
                    if (!slide2EnabledModules.includes(moduleId)) {
                      slide2EnabledModules.push(moduleId);
                    }
                  }
                }
              }

              const slide2: Slide = {
                id: generateSlideId(),
                data: slide2Data,
                enabledModules: slide2EnabledModules,
              };

              // Migrate duo centerImage to freeImage
              const freeImage = { ...initialFreeImageConfig };
              if (data.moduleData?.duo?.centerImage) {
                const centerImg = data.moduleData.duo.centerImage;
                freeImage.enabled = centerImg.enabled || false;
                freeImage.url = centerImg.url || '';
                freeImage.offsetX = centerImg.offsetX || 0;
                freeImage.offsetY = centerImg.offsetY || 0;
                freeImage.scale = centerImg.scale || 100;
                freeImage.rotation = centerImg.rotation || 0;
                if (centerImg.outlineEffect) {
                  freeImage.outlineEffect = {
                    enabled: centerImg.outlineEffect.enabled || false,
                    color: centerImg.outlineEffect.color || '#FFFFFF',
                    size: centerImg.outlineEffect.size || 10,
                  };
                }
              }

              set(
                {
                  slides: [slide1, slide2],
                  currentSlideIndex: (data.currentSlide === 2) ? 1 : 0,
                  freeImage,
                  isDirty: false,
                },
                false,
                'migrateFromDuoMode:two-slides'
              );
            } else {
              // Single slide mode or no duo
              console.log('[Store] Migrating to single slide');

              const slideData: Record<string, ModuleData> = {};
              const enabledModules: string[] = [];

              if (data.moduleData) {
                for (const moduleId of Object.keys(data.moduleData)) {
                  // All modules go into slide now (no more shared modules)
                  slideData[moduleId] = data.moduleData[moduleId];
                  enabledModules.push(moduleId);
                }
              }

              const slide: Slide = {
                id: generateSlideId(),
                data: slideData,
                enabledModules,
              };

              set(
                {
                  slides: [slide],
                  currentSlideIndex: 0,
                  freeImage: initialFreeImageConfig,
                  isDirty: false,
                },
                false,
                'migrateFromDuoMode:single-slide'
              );
            }
          } catch (error) {
            console.error('Failed to migrate from duo mode:', error);
          }
        },

        // ====================================================================
        // LAYOUT MANAGER ACTIONS
        // ====================================================================

        setCompositionConfig: (config: CompositionConfig | null) => {
          set(
            {
              compositionConfig: config,
              isDirty: true,
            },
            false,
            'setCompositionConfig'
          );
        },

        updateRenderOrder: (order: RenderOrderItem[]) => {
          const state = get();
          const currentConfig = state.compositionConfig;

          const newConfig: CompositionConfig = currentConfig
            ? { ...currentConfig, renderOrder: order, isCustom: true }
            : { renderOrder: order, isCustom: true };

          set(
            {
              compositionConfig: newConfig,
              isDirty: true,
            },
            false,
            'updateRenderOrder'
          );
        },

        setLayerOverride: (moduleId: string, zIndex: number) => {
          const state = get();
          const currentConfig = state.compositionConfig;

          const newOverrides = {
            ...(currentConfig?.zIndexOverrides || {}),
            [moduleId]: zIndex,
          };

          const newConfig: CompositionConfig = currentConfig
            ? { ...currentConfig, zIndexOverrides: newOverrides, isCustom: true }
            : {
                renderOrder: [],
                zIndexOverrides: newOverrides,
                isCustom: true,
              };

          set(
            {
              compositionConfig: newConfig,
              isDirty: true,
            },
            false,
            'setLayerOverride'
          );
        },

        resetLayerOverrides: () => {
          const state = get();
          const currentConfig = state.compositionConfig;

          if (!currentConfig) return;

          const newConfig: CompositionConfig = {
            ...currentConfig,
            zIndexOverrides: {},
          };

          set(
            {
              compositionConfig: newConfig,
              isDirty: true,
            },
            false,
            'resetLayerOverrides'
          );
        },

        addSpatialRule: (rule: SpatialRule) => {
          const state = get();
          const currentConfig = state.compositionConfig;

          const newRules = [...(currentConfig?.spatialRules || []), rule];

          const newConfig: CompositionConfig = currentConfig
            ? { ...currentConfig, spatialRules: newRules, isCustom: true }
            : {
                renderOrder: [],
                spatialRules: newRules,
                isCustom: true,
              };

          set(
            {
              compositionConfig: newConfig,
              isDirty: true,
            },
            false,
            'addSpatialRule'
          );
        },

        removeSpatialRule: (ruleId: string) => {
          const state = get();
          const currentConfig = state.compositionConfig;

          if (!currentConfig || !currentConfig.spatialRules) return;

          const newRules = currentConfig.spatialRules.filter(r => r.id !== ruleId);

          const newConfig: CompositionConfig = {
            ...currentConfig,
            spatialRules: newRules,
          };

          set(
            {
              compositionConfig: newConfig,
              isDirty: true,
            },
            false,
            'removeSpatialRule'
          );
        },

        loadLayoutPreset: (presetId: string) => {
          const config = createConfigFromPreset(presetId);

          if (!config) {
            console.error(`Layout preset not found: ${presetId}`);
            return;
          }

          set(
            {
              compositionConfig: config,
              isDirty: true,
            },
            false,
            'loadLayoutPreset'
          );
        },

        resetLayoutToDefault: () => {
          const defaultConfig = createConfigFromPreset(DEFAULT_LAYOUT_PRESET.id);

          set(
            {
              compositionConfig: defaultConfig,
              isDirty: true,
            },
            false,
            'resetLayoutToDefault'
          );
        },

        clearLayout: () => {
          set(
            {
              compositionConfig: null,
              isDirty: true,
            },
            false,
            'clearLayout'
          );
        },

        getCompositionConfig: () => {
          return get().compositionConfig;
        },
      }),
      {
        name: 'modular-editor-storage',
        // Persist most state except UI-only state
        partialize: (state) => ({
          currentPresetId: state.currentPresetId,
          currentPresetData: state.currentPresetData,
          slides: state.slides,
          currentSlideIndex: state.currentSlideIndex,
          freeImage: state.freeImage,
          compositionConfig: state.compositionConfig,
          // Don't persist activeModuleTab, isDirty, or validationErrors
        }),
      }
    ),
    {
      name: 'ModularEditorStore',
    }
  )
);

// ============================================================================
// TYPED HOOKS & SELECTORS
// ============================================================================

/**
 * Get data for a specific module (from current slide only)
 */
export function useModuleData<T = ModuleData>(moduleId: string): T | undefined {
  return useModularStore(state => {
    // Check current slide only (no shared modules anymore)
    const currentSlide = state.slides[state.currentSlideIndex];
    if (currentSlide && currentSlide.data[moduleId]) {
      return currentSlide.data[moduleId] as T;
    }

    return undefined;
  });
}

/**
 * Check if a module is enabled (checks current slide only)
 */
export function useModuleEnabled(moduleId: string): boolean {
  return useModularStore(state => {
    // Check current slide only (no shared modules anymore)
    const currentSlide = state.slides[state.currentSlideIndex];
    return currentSlide ? currentSlide.enabledModules.includes(moduleId) : false;
  });
}

/**
 * Get all enabled module IDs (from current slide only)
 */
export function useEnabledModules(): string[] {
  return useModularStore(state => {
    const currentSlide = state.slides[state.currentSlideIndex];
    return currentSlide ? currentSlide.enabledModules : [];
  });
}

/**
 * Get current preset info
 */
export function useCurrentPreset(): {
  id: string | null;
  data: TemplatePreset | null;
} {
  return useModularStore(state => ({
    id: state.currentPresetId,
    data: state.currentPresetData,
  }));
}

/**
 * Get validation state
 */
export function useValidationState(): {
  isValid: boolean;
  errors: string[];
} {
  return useModularStore(state => ({
    isValid: state.validationErrors.length === 0,
    errors: state.validationErrors,
  }));
}

/**
 * Get dirty state
 */
export function useIsDirty(): boolean {
  return useModularStore(state => state.isDirty);
}

/**
 * Check if in carousel mode (2+ slides)
 */
export function useIsCarouselMode(): boolean {
  return useModularStore(state => state.slides.length >= 2);
}

/**
 * Get current slide index
 */
export function useCurrentSlideIndex(): number {
  return useModularStore(state => state.currentSlideIndex);
}

/**
 * Get total number of slides
 */
export function useSlidesCount(): number {
  return useModularStore(state => state.slides.length);
}

/**
 * Get free image config
 */
export function useFreeImage(): FreeImageConfig {
  return useModularStore(state => state.freeImage);
}

// ============================================================================
// SELECTORS (for direct use with useModularStore)
// ============================================================================

export const selectCurrentPresetId = (state: ModularEditorState) => state.currentPresetId;
export const selectSlides = (state: ModularEditorState) => state.slides;
export const selectCurrentSlideIndex = (state: ModularEditorState) => state.currentSlideIndex;
export const selectFreeImage = (state: ModularEditorState) => state.freeImage;
export const selectActiveModuleTab = (state: ModularEditorState) => state.activeModuleTab;
export const selectIsDirty = (state: ModularEditorState) => state.isDirty;
export const selectValidationErrors = (state: ModularEditorState) => state.validationErrors;
export const selectComposedData = (state: ModularEditorState) => state.getComposedData();
export const selectCompositionConfig = (state: ModularEditorState) => state.compositionConfig;
export const selectIsCarouselMode = (state: ModularEditorState) => state.slides.length >= 2;
