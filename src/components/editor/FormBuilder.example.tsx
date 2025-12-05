'use client';

import { FormBuilder } from './FormBuilder';

/**
 * Example: Basic Usage
 *
 * Place the FormBuilder in a fixed-width sidebar or panel.
 * The component handles all form state internally and syncs to Zustand store.
 */
export function BasicExample() {
  return (
    <div className="h-screen w-96 border-r bg-background">
      <FormBuilder />
    </div>
  );
}

/**
 * Example: Full Editor Layout
 *
 * Split screen with FormBuilder on left and preview on right.
 */
export function EditorLayoutExample() {
  return (
    <div className="flex h-screen">
      {/* Left Panel - Form */}
      <div className="w-96 border-r overflow-hidden">
        <FormBuilder />
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          {/* Your preview component here */}
          <div className="aspect-square bg-white rounded-lg shadow-lg">
            {/* Preview content */}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: With Custom Header
 *
 * Add a custom header above the FormBuilder.
 */
export function WithHeaderExample() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 bg-background">
        <h1 className="text-xl font-bold">Image Generator</h1>
        <p className="text-sm text-muted-foreground">
          Configure your stack template
        </p>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-hidden">
        <FormBuilder />
      </div>
    </div>
  );
}

/**
 * Example: Accessing Form Data from Store
 *
 * Use the Zustand store to access form data elsewhere in your app.
 */
export function AccessStoreExample() {
  const { formData, isGenerating } = useEditorStore();

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Current Form Data:</h3>
      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
        {JSON.stringify(formData, null, 2)}
      </pre>

      {isGenerating && (
        <p className="mt-4 text-sm text-muted-foreground">
          Generating image...
        </p>
      )}
    </div>
  );
}

// Import store for the example
import { useEditorStore } from '@/lib/store/editorStore';
