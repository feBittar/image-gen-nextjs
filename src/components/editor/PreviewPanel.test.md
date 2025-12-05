# PreviewPanel Component - Test Checklist

## Manual Testing Guide

### 1. Real-time Preview Updates

- [ ] Open editor with PreviewPanel
- [ ] Type title text
- [ ] Verify preview updates after 500ms debounce
- [ ] Change title color
- [ ] Verify preview reflects new color
- [ ] Change subtitle
- [ ] Verify preview updates with new subtitle
- [ ] Rapidly change multiple fields
- [ ] Verify only one request is made (after debounce)

### 2. Loading States

- [ ] Start typing in title field
- [ ] Verify skeleton loader appears
- [ ] Wait for preview to load
- [ ] Verify skeleton is replaced with image
- [ ] Click "Refresh" button
- [ ] Verify spinner appears on button
- [ ] Verify loading state during generation

### 3. Error Handling

- [ ] Disconnect network
- [ ] Try to generate preview
- [ ] Verify error message displays
- [ ] Verify "Try Again" button appears
- [ ] Click "Try Again"
- [ ] Reconnect network
- [ ] Verify preview regenerates successfully

### 4. Download Functionality

- [ ] Generate a preview
- [ ] Click "Download" button
- [ ] Verify loading state on button
- [ ] Verify image downloads to device
- [ ] Check filename format: `image-[timestamp].png`
- [ ] Verify toast notification appears
- [ ] Verify download button is disabled during generation

### 5. Copy to Clipboard

- [ ] Generate a preview
- [ ] Click "Copy" button
- [ ] Paste in image editor (Photoshop, GIMP, etc.)
- [ ] Verify image is pasted correctly
- [ ] Try on browser without Clipboard API support
- [ ] Verify fallback copies URL instead
- [ ] Verify toast notification appears

### 6. Add to Gallery

- [ ] Generate a preview
- [ ] Click "Gallery" button
- [ ] Open gallery/history view
- [ ] Verify image appears in gallery
- [ ] Verify formData is saved with image
- [ ] Verify template name is saved
- [ ] Verify toast notification appears

### 7. Toggle Visibility

- [ ] Click eye icon in header
- [ ] Verify preview panel collapses
- [ ] Verify "Preview hidden" message appears
- [ ] Click "Show preview" link
- [ ] Verify preview expands again
- [ ] Verify state persists across page refreshes (if using persist middleware)

### 8. Zoom Functionality

- [ ] Generate a preview
- [ ] Click on the preview image
- [ ] Verify image zooms in (scale-105)
- [ ] Click again
- [ ] Verify image zooms out
- [ ] Hover over image (when not zoomed)
- [ ] Verify subtle hover effect (scale-102)
- [ ] Verify zoom icon shows in bottom-right corner

### 9. Empty States

- [ ] Clear all form fields
- [ ] Verify "No Preview Yet" empty state appears
- [ ] Verify message says "Add a title to see preview"
- [ ] Add title
- [ ] Verify preview starts generating

### 10. Responsive Design

- [ ] Test on mobile viewport (< 640px)
- [ ] Verify component is scrollable
- [ ] Verify buttons are accessible
- [ ] Test on tablet viewport (640px - 1024px)
- [ ] Verify layout adapts appropriately
- [ ] Test on desktop viewport (> 1024px)
- [ ] Verify full features are accessible

### 11. Accessibility

- [ ] Navigate using keyboard only (Tab key)
- [ ] Verify all buttons are reachable
- [ ] Press Enter on buttons
- [ ] Verify actions execute correctly
- [ ] Use screen reader
- [ ] Verify ARIA labels are read correctly
- [ ] Verify loading states are announced
- [ ] Verify error messages are announced

### 12. Performance

- [ ] Open browser DevTools Network tab
- [ ] Make 5 rapid changes to form
- [ ] Verify only 1-2 API requests are made (debouncing works)
- [ ] Check for memory leaks
- [ ] Generate 10 images
- [ ] Check memory usage in DevTools
- [ ] Verify blob URLs are revoked (no accumulation)

### 13. Edge Cases

- [ ] Test with very long title (> 100 characters)
- [ ] Verify preview handles text overflow
- [ ] Test with special characters in title
- [ ] Verify characters are properly escaped
- [ ] Test with emoji in title
- [ ] Verify emoji renders correctly
- [ ] Test with empty subtitle
- [ ] Verify preview generates without subtitle
- [ ] Test rapid template switching
- [ ] Verify preview updates correctly

### 14. Integration with Zustand Store

- [ ] Make changes in editor
- [ ] Verify formData updates in store
- [ ] Open Redux DevTools (Zustand DevTools)
- [ ] Verify actions are logged correctly
- [ ] Download an image
- [ ] Verify `addGeneratedImage` action is dispatched
- [ ] Verify image appears in `generatedImages` array

### 15. Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify all features work consistently
- [ ] Test clipboard functionality in each browser
- [ ] Verify fallbacks work when needed

## Automated Testing (Future)

### Unit Tests

```typescript
// useImageGeneration.test.ts
describe('useImageGeneration', () => {
  it('debounces preview generation', async () => {
    // Test debounce behavior
  });

  it('cancels pending requests', async () => {
    // Test AbortController
  });

  it('revokes blob URLs on cleanup', async () => {
    // Test memory management
  });

  it('handles errors gracefully', async () => {
    // Test error handling
  });
});
```

### Integration Tests

```typescript
// PreviewPanel.test.tsx
describe('PreviewPanel', () => {
  it('renders loading state', () => {
    // Test skeleton display
  });

  it('displays preview image', async () => {
    // Test successful image display
  });

  it('shows error message on failure', async () => {
    // Test error state
  });

  it('downloads image on button click', async () => {
    // Test download functionality
  });
});
```

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Preview debounce delay | 500ms | - |
| API request time | < 2s | - |
| Image load time | < 1s | - |
| Memory usage (10 images) | < 50MB | - |
| First interaction to preview | < 3s | - |

## Known Issues / Limitations

1. **Clipboard API**: Not supported in all browsers (fallback to URL copy)
2. **Large Images**: May be slow to generate on low-end devices
3. **Network Errors**: Requires manual retry (no auto-retry)
4. **Mobile Performance**: Debounce may need adjustment for mobile (increase to 750ms?)

## Next Steps

1. Add error boundary around PreviewPanel
2. Implement auto-retry with exponential backoff
3. Add image comparison (before/after)
4. Add image export in multiple formats (JPEG, WebP)
5. Add batch generation support
6. Add preview history (undo/redo)
