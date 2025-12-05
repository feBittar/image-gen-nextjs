/**
 * Example Usage of PresetSelector Component
 *
 * This file demonstrates how to integrate the PresetSelector component
 * into your application.
 */

'use client';

import * as React from 'react';
import { PresetSelector } from './PresetSelector';
import { TemplatePreset } from '@/lib/modules/types';

// Example preset data
const examplePresets: TemplatePreset[] = [
  {
    id: 'stack',
    name: 'Stack Layout',
    description: 'Classic stacked layout with text fields, content image, and customizable elements',
    thumbnail: '/thumbnails/stack-preset.png', // Optional
    defaultModules: ['viewport', 'card', 'textFields', 'contentImage', 'corners'],
    moduleDefaults: {
      viewport: { width: 1080, height: 1440 },
      card: { backgroundColor: '#000000' },
    },
  },
  {
    id: 'versus',
    name: 'Versus Layout',
    description: 'Split-screen comparison layout ideal for before/after or product comparisons',
    thumbnail: '/thumbnails/versus-preset.png',
    defaultModules: ['viewport', 'duo', 'textFields', 'freeText'],
    moduleDefaults: {
      duo: { enabled: true },
      viewport: { width: 2160, height: 1440 },
    },
  },
  {
    id: 'bullets',
    name: 'Bullet Cards',
    description: 'Layout with header, footer, and 5 bullet point cards with background images',
    defaultModules: ['viewport', 'card', 'bullets', 'corners'],
    moduleDefaults: {
      bullets: { cardCount: 5 },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout with just text and logo',
    defaultModules: ['viewport', 'card', 'textFields', 'logo'],
    moduleDefaults: {
      card: { backgroundColor: '#FFFFFF' },
    },
  },
];

// Example component usage
export function PresetSelectorExample() {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>('stack');
  const [hasChanges, setHasChanges] = React.useState(false);

  const handlePresetSelect = (presetId: string) => {
    console.log('Preset selected:', presetId);
    setSelectedPreset(presetId);

    // Load preset configuration
    const preset = examplePresets.find(p => p.id === presetId);
    if (preset) {
      // Apply preset modules and defaults
      console.log('Loading modules:', preset.defaultModules);
      console.log('Applying defaults:', preset.moduleDefaults);

      // Reset unsaved changes flag
      setHasChanges(false);
    }
  };

  // Simulate form changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, this would be triggered by form changes
      // setHasChanges(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedPreset]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Preset Selector Example</h1>

      <PresetSelector
        selectedPresetId={selectedPreset}
        onPresetSelect={handlePresetSelect}
        hasUnsavedChanges={hasChanges}
        presets={examplePresets}
        className="max-w-6xl mx-auto"
      />

      {/* Debug info */}
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-6xl mx-auto">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p className="text-sm">Selected Preset: {selectedPreset || 'None'}</p>
        <p className="text-sm">Has Unsaved Changes: {hasChanges ? 'Yes' : 'No'}</p>
        <button
          onClick={() => setHasChanges(!hasChanges)}
          className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
        >
          Toggle Unsaved Changes
        </button>
      </div>
    </div>
  );
}

/**
 * Integration with Zustand store example
 */

/*
import { create } from 'zustand';
import { TemplatePreset } from '@/lib/modules/types';

interface PresetStore {
  selectedPresetId: string | null;
  hasUnsavedChanges: boolean;
  setPreset: (presetId: string) => void;
  markAsChanged: () => void;
  resetChanges: () => void;
}

export const usePresetStore = create<PresetStore>((set) => ({
  selectedPresetId: 'stack',
  hasUnsavedChanges: false,

  setPreset: (presetId) => set({
    selectedPresetId: presetId,
    hasUnsavedChanges: false
  }),

  markAsChanged: () => set({ hasUnsavedChanges: true }),

  resetChanges: () => set({ hasUnsavedChanges: false }),
}));

// Usage in component:
export function PresetSelectorWithStore() {
  const { selectedPresetId, hasUnsavedChanges, setPreset } = usePresetStore();

  return (
    <PresetSelector
      selectedPresetId={selectedPresetId}
      onPresetSelect={setPreset}
      hasUnsavedChanges={hasUnsavedChanges}
      presets={examplePresets}
    />
  );
}
*/
