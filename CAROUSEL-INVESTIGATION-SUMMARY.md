# Carousel Black Image Issue - Executive Summary

## Problem
When generating carousel images (2+ slides), the output is completely black/empty. Single slide mode works correctly.

## Root Cause Identified
The generated carousel HTML contains empty `.text-section` divs with no `.text-item` content:

```html
<div class="text-section">
  <!-- EMPTY - Should have <div class="text-item">CONTENT HERE</div> -->
</div>
```

This happens because the `getTextFieldsHtml()` function receives data where `fields[i].content` is missing/undefined.

## The Data Flow Problem

### Current Flow (Carousel Mode)
1. **Client** (page.tsx): Sends `payload.slides[].data`
2. **API** (route.ts): Merges with `sharedModuleData`
3. **Compose**: Calls module's `getHtml()` function
4. **TextFields Module**: Expects `data.fields[i].content` ← **MISSING HERE**

### Why Single Slide Works
Single slide mode sends `payload.moduleData` which is used directly without merging, so content is available.

## Critical Question Unanswered
**Does `slide.data.textFields.fields[i].content` actually contain the user-entered text?**

If yes → Data is being lost during carousel merging
If no → Data was never stored in the slide

## Evidence & Files

### Generated HTML (Black Images)
- **File**: `public/output/carousel-1764694138606.html`
- **Structure**: ✓ Correct (carousel wrapper, CSS)
- **Content**: ✗ Missing (.text-section divs are empty)

### Code Inspection
1. **page.tsx** (lines 177-181): Payload structure looks correct
2. **route.ts** (lines 288-296): Data merging logic looks correct
3. **compositer.ts**: Module composition logic looks correct
4. **text-fields/html.ts** (line 15): Returns empty string when `field.content` is missing

## Required Investigation

### Debug Step 1: Verify Carousel Payload
In browser console after clicking "Generate Carousel":
```javascript
// Add this to page.tsx before fetch() call
console.log('Carousel payload:', {
  slides: payload.slides.map(s => ({
    id: s.id,
    modules: s.enabledModules,
    hasTextFields: !!s.data.textFields,
    fieldCount: s.data.textFields?.count,
    firstFieldContent: s.data.textFields?.fields?.[0]?.content,
  }))
});
```

**Expected Output**:
```javascript
{
  slides: [{
    id: "...",
    modules: ["viewport", "card", "textFields"],
    hasTextFields: true,
    fieldCount: 3,
    firstFieldContent: "MODULAR SYSTEM"  // ← Should have content
  }]
}
```

**If `firstFieldContent` is empty/undefined**: Data is not being passed correctly

### Debug Step 2: Check Store Data
In browser DevTools console:
```javascript
// Assuming Zustand store is exported
import { useModularStore } from '@/lib/store/modularStore';
const store = useModularStore.getState();
console.log('Slide data:', {
  textFields: store.slides[0].data.textFields,
  fields: store.slides[0].data.textFields?.fields
});
```

### Debug Step 3: Add API Logging
In `src/app/api/generate-modular/route.ts`, add at line 310:
```typescript
console.log(`[Carousel Debug] Slide ${i+1}:`);
console.log('  - Enabled modules:', slide.enabledModules);
console.log('  - Has textFields:', !!processedData.textFields);
console.log('  - TextFields count:', (processedData.textFields as any)?.count);
console.log('  - First field content:', (processedData.textFields as any)?.fields?.[0]?.content);
console.log('  - Generated HTML length:', composed.modulesHTML.length);
```

## Three Possible Causes

### Scenario A: Store Not Updating
- **Symptom**: Form shows text but `store.slides[0].data.textFields.fields[0].content` is empty
- **Fix**: Check ModularFormBuilder.tsx - ensure it calls `updateCurrentSlideModule()` correctly
- **File**: `src/components/editor/ModularFormBuilder.tsx`

### Scenario B: Data Not Sent in Payload
- **Symptom**: Payload is missing `slide.data.textFields` entirely
- **Fix**: Ensure form data is mapped to store before generation
- **File**: `src/app/modular/page.tsx`

### Scenario C: Shared Data Not Merged
- **Symptom**: `sharedModuleData` is not being included in each slide's data
- **Fix**: Include shared data in carousel payload
- **File**: `src/app/modular/page.tsx` line 177, or `src/app/api/generate-modular/route.ts` line 339

## Recommended Fix Path

### If Cause A (Store issue):
```typescript
// In ModularFormBuilder or wherever form updates happen
store.updateCurrentSlideModule('textFields', {
  fields: formValues.fields.map(field => ({
    ...field,
    content: field.content || ''  // Ensure content is always included
  }))
});
```

### If Cause B (Payload issue):
```typescript
// In page.tsx around line 177
payload.slides = slides.map(slide => ({
  id: slide.id,
  enabledModules: slide.enabledModules,
  data: {
    // Ensure ALL module data is included
    ...slide.data,
    // Optionally include shared data here too
  }
}));
```

### If Cause C (Merge issue):
The API already merges correctly at line 289:
```typescript
const mergedData = {
  ...sharedModuleData,
  ...slide.data,
};
```

## Files to Examine

1. **Store**: `src/lib/store/modularStore.ts`
   - How is `slide.data` initialized?
   - How is it updated when user edits?

2. **Form Builder**: `src/components/editor/ModularFormBuilder.tsx`
   - How does it update the store with form values?
   - Is it updating `currentSlideIndex` correctly?

3. **Page Component**: `src/app/modular/page.tsx`
   - Lines 177-181: Carousel payload building
   - Is it using the correct slide data?

4. **API Route**: `src/app/api/generate-modular/route.ts`
   - Lines 288-296: Data merging
   - Lines 300-318: Slide composition and body extraction

## Conclusion

The carousel system is **architecturally correct** but data is **not flowing through properly**. The issue is likely in how form data is stored or passed, not in the composition or rendering logic.

**Next Action**: Run the debug steps above to pinpoint which scenario is occurring, then apply the appropriate fix.

---

## Files Created for This Investigation
- `CAROUSEL-BLACK-IMAGE-DEBUG-REPORT.md` - Detailed technical analysis
- `CAROUSEL-INVESTIGATION-SUMMARY.md` - This file (executive summary)

