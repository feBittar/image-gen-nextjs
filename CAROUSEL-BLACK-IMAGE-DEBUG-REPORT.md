# Carousel Mode Black Image Issue - Complete Investigation Report

## Executive Summary

**Issue**: Carousel mode (2+ slides) generates completely black images while single slide mode works correctly.

**Root Cause**: The generated HTML has empty `.text-section` divs with no content. This happens because the carousel generation pipeline is not properly collecting and passing module content from individual slides.

**Impact**: All carousel generations fail silently - the API returns success but generates black/empty images.

---

## Problem Evidence

### Generated HTML Analysis
**File**: `D:\Gevia\image-gen-nextjs\public\output\carousel-1764694138606.html`

```html
<body>
  <div class="carousel-wrapper">
    <div class="carousel-slide carousel-slide-1">
      <!-- Text Fields -->
      <!-- ===== TEXT FIELDS SECTION ===== -->
      <div class="text-section">
        <!-- EMPTY - NO CONTENT! -->
      </div>
    </div>
    <div class="carousel-slide carousel-slide-2">
      <!-- SAME ISSUE -->
      <div class="text-section">
        <!-- EMPTY -->
      </div>
    </div>
  </div>
</body>
```

Key observations:
- Viewport dimensions are correct: `2160×1440` (2 slides × 1080px each)
- CSS is present and correct (carousel styles, module styles)
- HTML structure is correct (`.carousel-wrapper`, `.carousel-slide` divs)
- **But**: No `.text-item` elements inside `.text-section` divs
- **Result**: Empty slides render as black

---

## Root Cause Analysis

### The Data Flow in Carousel Mode

**Step 1: Client sends request** (page.tsx, lines 177-181)
```typescript
payload.slides = slides.map(slide => ({
  id: slide.id,
  enabledModules: slide.enabledModules,
  data: slide.data,  // Contains slide-specific module data
}));
```

The payload structure is correct and matches the API expectations.

**Step 2: API processes slides** (route.ts, lines 288-296)
```typescript
const mergedData = {
  ...sharedModuleData,        // viewport, card
  ...slide.data,              // textFields, contentImage, etc.
};

const processedData = processModuleTextFields(mergedData);
```

This merge should work IF `slide.data` contains the actual content.

**Step 3: Compose template** (route.ts, lines 300-308)
```typescript
const composed = composeTemplate(
  slide.enabledModules,      // e.g., ['viewport', 'card', 'textFields']
  processedData,             // Should contain { textFields: { fields: [...] } }
  { baseUrl, ..., slideCount: 1 }
);
```

**Step 4: Generate HTML** (text-fields/html.ts, lines 11-47)
```typescript
const textFields = data as TextFieldsData;
const textItems = textFields.fields
  .slice(0, textFields.count)
  .map((field, index) => {
    if (!field.content) return '';  // RETURNS EMPTY STRING!
    // ...
  })
```

**The Problem**: If `field.content` is missing/undefined, no HTML is generated.

### Why Does Single Slide Mode Work?

Single slide mode (page.tsx, lines 196-198):
```typescript
const firstSlide = slides[0];
payload.enabledModules = firstSlide.enabledModules;
payload.moduleData = firstSlide.data;  // FULL DATA INCLUDED
```

The data is passed directly without transformation, so content is available.

---

## Critical Issue: Missing Slide Data

### The Gap in Data Passing

Looking at the store structure (modularStore.ts):
- Each `Slide` has its own `data: Record<string, ModuleData>`
- This data should contain full module configurations including content

**However**, there appears to be a mismatch:
- The client sends `payload.slides[].data`
- But if this data doesn't include the actual field content (from form inputs), it will be empty

### Verification Points Needed

1. **Is the store properly storing per-slide data?**
   - Check if `store.slides[0].data.textFields` contains the actual field content
   - Log what's in `slide.data` when building the carousel payload

2. **Is the form builder updating the store correctly?**
   - When user enters text in a field, does it update `store.slides[currentSlideIndex].data.textFields.fields[i].content`?
   - Or is it updating a different location?

3. **Is text processing happening before composition?**
   - The `processModuleTextFields()` function processes text with styled chunks
   - But it only works on existing data with `content` property

---

## Debug Approach: Adding Logging

### Add logging to trace data flow:

#### 1. In API route (route.ts, around line 310)
```typescript
console.log(`[Carousel Slide ${i + 1}] Composed HTML length:`, composed.modulesHTML.length);
console.log(`[Carousel Slide ${i + 1}] Slide data:`, JSON.stringify(slide.data, null, 2).substring(0, 500));
console.log(`[Carousel Slide ${i + 1}] Merged data:`, JSON.stringify(mergedData, null, 2).substring(0, 500));
```

#### 2. In text-fields HTML generation (text-fields/html.ts, around line 12)
```typescript
console.log('[TextFields] Data received:', JSON.stringify(data, null, 2).substring(0, 500));
console.log('[TextFields] Field count:', (data as any).count);
console.log('[TextFields] Fields:', (data as any).fields?.length ?? 'undefined');
```

#### 3. In page.tsx (around line 177)
```typescript
console.log('[Page] Carousel payload slides[0]:', {
  enabledModules: payload.slides[0]?.enabledModules,
  dataKeys: Object.keys(payload.slides[0]?.data ?? {}),
  textFieldsContent: payload.slides[0]?.data?.textFields?.fields?.[0]?.content,
});
```

---

## Potential Fixes

### Option 1: Ensure Slide Data is Complete
**Location**: page.tsx, line 177-181

Current:
```typescript
payload.slides = slides.map(slide => ({
  id: slide.id,
  enabledModules: slide.enabledModules,
  data: slide.data,
}));
```

The issue might be that `slide.data` doesn't contain all needed information. Need to verify what's actually in `slide.data` when carousel is being generated.

### Option 2: Check Data Initialization
**Location**: modularStore.ts, `createEmptySlide()`

When creating new slides, does the function properly initialize all module data from defaults? If a user hasn't touched a field, is it initialized with empty defaults or actual content?

### Option 3: Verify Store Updates
**Location**: ModularFormBuilder.tsx

When a user edits a text field, does it properly update:
```typescript
store.updateCurrentSlideModule('textFields', {
  fields: [{content: '...', style: {...}}, ...]
})
```

Or is it updating a different path that doesn't get included in `slide.data`?

---

## Files Involved

| File | Purpose | Status |
|------|---------|--------|
| `src/app/api/generate-modular/route.ts` | API endpoint handling carousel | ✓ Correct structure |
| `src/app/modular/page.tsx` | UI building carousel payload | ✓ Correct structure |
| `src/lib/modules/compositer.ts` | Composes modules into HTML | ✓ Correct logic |
| `src/lib/modules/text-fields/html.ts` | Generates text field HTML | ✓ Correct logic |
| `src/lib/utils/carouselHelpers.ts` | Wraps slides in carousel CSS/HTML | ✓ Correct logic |
| `src/lib/store/modularStore.ts` | Store managing slide data | ? Needs verification |
| `src/components/editor/ModularFormBuilder.tsx` | Form updating store | ? Needs verification |

---

## Testing Strategy

### Test 1: Log Actual Data Being Sent
Add console.log in page.tsx before sending request:
```typescript
console.log('Carousel payload:', JSON.stringify(payload, null, 2));
```

Check browser console to see:
- Are slides included?
- Do slides have `data.textFields`?
- Does `data.textFields` have `fields` array?
- Do fields have `content` property with actual text?

### Test 2: Verify Store Contains Data
In browser DevTools:
```javascript
// If using Zustand
const store = useModularStore.getState();
console.log('Slide 0 data:', store.slides[0].data);
console.log('Slide 0 textFields:', store.slides[0].data.textFields);
```

### Test 3: Single Slide Still Works
Generate a single image and verify:
- Does it show content correctly?
- This confirms the module system itself works
- Issue is specific to carousel data passing

### Test 4: Check Generated HTML
After generation fails:
1. Open the generated HTML in browser
2. Check if CSS is applied (check computed styles)
3. Verify HTML structure is present
4. Check if JavaScript execution is blocked

---

## Next Steps

1. **Immediate**: Add the logging points mentioned above
2. **Debug**: Generate a carousel and check console logs
3. **Identify**: Where exactly is data being lost?
4. **Fix**: Either:
   - Ensure slide.data contains full content
   - Or modify API to fill in missing data
   - Or modify carousel payload building to include all necessary data
5. **Test**: Generate carousel with logging enabled
6. **Verify**: Compare working single-slide vs broken carousel data structures

---

## Summary of Findings

| Aspect | Status | Evidence |
|--------|--------|----------|
| HTML structure | ✓ Correct | Generated HTML has proper carousel wrapper |
| CSS | ✓ Correct | Carousel CSS and module CSS present |
| API route logic | ✓ Correct | Merges shared + slide data properly |
| Client payload | ? Unknown | Need to verify slide.data contains content |
| Store data | ? Unknown | Need to verify slides contain actual form input |
| Module composition | ✓ Correct | Works fine for single slide |
| HTML generation | ✓ Correct | getTextFieldsHtml logic is sound |

**Key Unknown**: Does `slide.data.textFields.fields[i].content` actually contain the user-entered text, or is it empty/undefined?

Once this is verified, the fix will be straightforward.

