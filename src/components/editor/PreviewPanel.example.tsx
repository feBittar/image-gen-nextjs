/**
 * Example Usage: PreviewPanel Component
 *
 * This example demonstrates how to use the PreviewPanel component
 * in your image editor layout.
 */

'use client';

import { PreviewPanel } from './PreviewPanel';

// Example 1: Basic usage in a layout
export function EditorLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-screen">
      {/* Left side: Editor controls */}
      <div className="p-4">
        <h1>Editor Controls</h1>
        {/* Your form controls here */}
      </div>

      {/* Right side: Preview panel */}
      <div className="border-l">
        <PreviewPanel />
      </div>
    </div>
  );
}

// Example 2: Usage with custom wrapper
export function EditorWithSidebar() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r">
        <nav>Navigation</nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2">
        {/* Editor */}
        <div className="p-6">
          <h2>Editor</h2>
          {/* Form controls */}
        </div>

        {/* Preview */}
        <div className="border-l">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}

// Example 3: Mobile-responsive layout
export function ResponsiveEditor() {
  return (
    <div className="h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Editor - Full width on mobile, left column on desktop */}
      <div className="p-4 overflow-auto">
        <h2>Editor Controls</h2>
        {/* Form controls */}
      </div>

      {/* Preview - Stacks below on mobile, right column on desktop */}
      <div className="lg:border-l">
        <PreviewPanel />
      </div>
    </div>
  );
}

/**
 * Features Included:
 *
 * 1. Real-time Preview
 *    - Automatically updates when formData changes
 *    - 500ms debounce to prevent excessive API calls
 *    - Cancels pending requests when new changes occur
 *
 * 2. Loading States
 *    - Skeleton loader while generating
 *    - Animated spinner on refresh button
 *    - Loading indicator on download button
 *
 * 3. Error Handling
 *    - Displays error messages
 *    - Retry button for failed generations
 *    - Graceful handling of network errors
 *
 * 4. Image Actions
 *    - Download: Generates full-quality image and downloads it
 *    - Copy: Copies image to clipboard (with fallback)
 *    - Gallery: Saves image to Zustand store gallery
 *    - Refresh: Manually triggers preview regeneration
 *
 * 5. UI Features
 *    - Toggle visibility (show/hide preview)
 *    - Zoom on click
 *    - Aspect ratio display (3:4)
 *    - Empty state when no content
 *
 * 6. Accessibility
 *    - ARIA labels on all buttons
 *    - Keyboard navigation support
 *    - Screen reader friendly
 *
 * 7. Performance
 *    - Debounced preview updates
 *    - Request cancellation (AbortController)
 *    - Memory cleanup (revoking blob URLs)
 *    - Image priority loading
 */
