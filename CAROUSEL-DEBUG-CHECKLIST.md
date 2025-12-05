# Carousel Black Image Issue - Debug Checklist

## Quick Diagnosis Flow

### Step 1: Verify Single Slide Still Works (Baseline)
- [ ] Generate a SINGLE image (1 slide)
- [ ] Verify it displays correctly with text content
- [ ] If single works but carousel doesn't → Issue is carousel-specific

### Step 2: Check Store Data Structure
**Browser Console**:
```javascript
// Paste this in browser console after loading the modular editor
import { useModularStore } from '@/lib/store/modularStore';
const state = useModularStore.getState();
console.log('=== STORE STATE ===');
console.log('Slide count:', state.slides.length);
console.log('Carousel mode:', state.slides.length >= 2);
console.log('Slide 0:', {
  id: state.slides[0]?.id,
  enabledModules: state.slides[0]?.enabledModules,
  hasTextFields: !!state.slides[0]?.data?.textFields,
  textFieldsData: state.slides[0]?.data?.textFields
});
```

**Expected Output**:
```
=== STORE STATE ===
Slide count: 2
Carousel mode: true
Slide 0: {
  id: "uuid-...",
  enabledModules: ["viewport", "card", "textFields"],
  hasTextFields: true,
  textFieldsData: {
    count: 3,
    gap: 30,
    verticalAlign: "center",
    fields: [
      {
        content: "MODULAR SYSTEM",  // ← SHOULD HAVE TEXT
        style: {...},
        ...
      },
      ...
    ]
  }
}
```

**If `content` is empty**: Store is not being updated correctly
→ **Go to Step 4**

**If `content` has text**: Data is in store
→ **Go to Step 3**

### Step 3: Check Payload Being Sent
**In page.tsx, add before fetch() call (line 207)**:

Find this code:
```typescript
const response = await fetch('/api/generate-modular', {
```

Add above it:
```typescript
console.log('=== CAROUSEL PAYLOAD ===');
console.log('Payload:', JSON.stringify(payload, null, 2).substring(0, 2000));
console.log('Slide 0 data:', payload.slides?.[0]?.data);
console.log('Slide 0 textFields:', payload.slides?.[0]?.data?.textFields?.fields?.map(f => f.content));
```

**Expected Output**:
```
=== CAROUSEL PAYLOAD ===
Payload: {
  "slides": [{
    "id": "...",
    "enabledModules": [...],
    "data": {
      "textFields": {
        "fields": [
          { "content": "MODULAR SYSTEM", ... },
          ...
        ]
      }
    }
  }]
}
Slide 0 data: {...}
Slide 0 textFields: ["MODULAR SYSTEM", "Composable Template Engine", "Build beautiful graphics from modules"]
```

**If textFields array shows content**: Payload is correct
→ **Go to Step 5**

**If textFields array is empty/undefined**: Payload building is broken
→ **Go to Step 4**

### Step 4: Debug Store Update (If Step 2 fails)
**In ModularFormBuilder.tsx**:

Add console.log to see when store is updated:
```typescript
// Find where textFields is updated
const handleTextFieldChange = (fieldIndex: number, value: string) => {
  console.log(`[FormBuilder] Updating field ${fieldIndex} to:`, value);
  // ... then call store.updateCurrentSlideModule
};
```

**Check**:
- [ ] Is the handler being called when you type?
- [ ] Is the value correct before sending to store?
- [ ] Does `store.updateCurrentSlideModule` get called?

**If not being called**: Form is not wired to store update
**If being called with wrong value**: Form logic is broken
**If being called correctly but still empty**: Store update logic is broken

### Step 5: Check API Received Data (If Step 3 passes)
**In route.ts, add logging at line 310**:

```typescript
console.log(`\n[Carousel Slide ${i + 1}] DEBUG INFO:`);
console.log('  - Enabled modules:', slide.enabledModules);
console.log('  - Slide data keys:', Object.keys(slide.data));
console.log('  - TextFields in slide.data?', 'textFields' in slide.data);
if ('textFields' in slide.data) {
  const tf = (slide.data as any).textFields;
  console.log('  - TextFields.fields:', tf.fields);
  console.log('  - First field content:', tf.fields?.[0]?.content);
}
console.log('  - Merged data keys:', Object.keys(mergedData));
console.log('  - TextFields in merged?', 'textFields' in mergedData);
console.log('  - Generated HTML length:', composed.modulesHTML.length);
console.log('  - HTML preview:', composed.modulesHTML.substring(0, 500));
```

**Check Server Logs**:
- [ ] Is `textFields` in slide.data?
- [ ] Does it have the content?
- [ ] After merge, does it still have content?
- [ ] Does HTML get generated?

**If HTML is empty**: Module's `getHtml()` is returning empty
**If HTML has content but images are black**: CSS/rendering issue

### Step 6: Test with Mock Data
If all above steps fail, test directly with API:

**Using curl or Postman**:
```bash
curl -X POST http://localhost:3000/api/generate-modular \
  -H "Content-Type: application/json" \
  -d '{
    "slides": [
      {
        "id": "slide-1",
        "enabledModules": ["viewport", "textFields"],
        "data": {
          "viewport": {
            "backgroundType": "color",
            "backgroundColor": "#ffffff"
          },
          "textFields": {
            "count": 1,
            "gap": 20,
            "verticalAlign": "center",
            "fields": [
              {
                "content": "TEST CONTENT",
                "style": {
                  "fontFamily": "Arial",
                  "fontSize": "48px",
                  "color": "#000000"
                }
              }
            ]
          }
        }
      },
      {
        "id": "slide-2",
        "enabledModules": ["viewport", "textFields"],
        "data": {
          "viewport": {
            "backgroundType": "color",
            "backgroundColor": "#ffffff"
          },
          "textFields": {
            "count": 1,
            "gap": 20,
            "verticalAlign": "center",
            "fields": [
              {
                "content": "SLIDE 2",
                "style": {
                  "fontFamily": "Arial",
                  "fontSize": "48px",
                  "color": "#000000"
                }
              }
            ]
          }
        }
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "images": ["/output/carousel-123-1.png", "/output/carousel-123-2.png"],
  "filenames": ["carousel-123-1.png", "carousel-123-2.png"],
  "htmlUrl": "/output/carousel-123.html"
}
```

**Check Generated Images**:
- [ ] Are they still black?
- [ ] If YES: Issue is in composition/rendering logic
- [ ] If NO: Issue is in data flow from UI to API

---

## Decision Tree

```
START: Generate carousel, get black images
│
├─ Is single slide generation working?
│  ├─ NO  → Issue with module system itself, not carousel-specific
│  └─ YES → Continue
│
├─ Does store.slides[0].data.textFields contain content?
│  ├─ NO  → ISSUE #1: Store not being updated
│  │        Fix: ModularFormBuilder → Check form update handlers
│  └─ YES → Continue
│
├─ Does payload.slides[0].data.textFields contain content?
│  ├─ NO  → ISSUE #2: Payload building broken
│  │        Fix: page.tsx line 177-181 → Check slide.data is included
│  └─ YES → Continue
│
├─ Does API receive data with content?
│  ├─ NO  → ISSUE #3: Data lost in transit
│  │        Fix: Check network transmission
│  └─ YES → Continue
│
├─ Does API generate HTML with content?
│  ├─ NO  → ISSUE #4: Module composition fails
│  │        Fix: Check getTextFieldsHtml() logic
│  └─ YES → Continue
│
├─ Does mock API call generate correct images?
│  ├─ NO  → ISSUE #5: CSS/rendering problem
│  │        Fix: Check Puppeteer viewport/screenshots
│  └─ YES → ISSUE #6: UI-specific data issue
│           Fix: Check form binding to store updates
```

---

## Quick Fixes by Issue Type

### ISSUE #1: Store Not Updating
**Location**: `src/components/editor/ModularFormBuilder.tsx`

**Fix**: Ensure text field changes update the store:
```typescript
// Before (may be broken)
const handleFieldChange = (value: string) => {
  setLocalValue(value);  // Only local state, not store!
};

// After (correct)
const handleFieldChange = (value: string) => {
  setLocalValue(value);
  store.updateCurrentSlideModule('textFields', {
    fields: fields.map((f, i) =>
      i === currentFieldIndex ? { ...f, content: value } : f
    )
  });
};
```

### ISSUE #2: Payload Building Broken
**Location**: `src/app/modular/page.tsx` line 177

**Fix**: Ensure slide.data includes all modules:
```typescript
payload.slides = slides.map(slide => ({
  id: slide.id,
  enabledModules: slide.enabledModules,
  data: slide.data,  // This MUST contain { textFields: { fields: [...] } }
}));

// Add validation
if (!payload.slides[0]?.data?.textFields?.fields?.[0]?.content) {
  console.error('WARNING: Slide data missing content!');
}
```

### ISSUE #3: Data Lost in Transit
**Location**: Network monitoring

**Fix**: Check browser DevTools Network tab
- [ ] POST request to `/api/generate-modular` shows full payload?
- [ ] Response shows success?

### ISSUE #4: Module Composition Fails
**Location**: `src/lib/modules/text-fields/html.ts` line 15

**Check**:
```typescript
const textFields = data as TextFieldsData;
console.log('TextFields data:', textFields);  // Should have fields array
console.log('Field count:', textFields.count);  // Should be > 0
console.log('Fields:', textFields.fields);  // Should have items with content

const textItems = textFields.fields
  .slice(0, textFields.count)
  .map((field, index) => {
    console.log(`Field ${index}:`, field);  // Should show content
    if (!field.content) return '';  // THIS IS WHERE EMPTY IS COMING FROM
    // ...
  });
```

If fields are present but content is empty → Data structure issue
If fields array is empty → Data wasn't merged correctly

### ISSUE #5: CSS/Rendering Problem
**Location**: `src/app/api/generate-modular/route.ts` line 210+

**Check**:
- [ ] Viewport dimensions correct?
- [ ] CSS being included?
- [ ] Puppeteer taking screenshots correctly?

---

## Essential Commands

### Check Server Logs
```bash
# In VS Code terminal where dev server is running
# Look for "[Modular Generator]" prefixed logs
```

### Clear and Rebuild
```bash
npm run build
# Or
npm run dev  # Restart development server
```

### Test Mock API
```bash
# Save the curl command from Step 6 and run it
curl -X POST http://localhost:3000/api/generate-modular \
  -H "Content-Type: application/json" \
  -d @carousel-test.json
```

---

## Common Issues & Quick Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Store shows content, images black | Data not sent in payload | Check page.tsx line 177 |
| Store empty, form has text | Store not updated on input | Check ModularFormBuilder hooks |
| Payload has content, API logs empty | Data lost during merge | Check route.ts line 289 |
| API logs have content, HTML empty | Module not generating | Add logs to getHtml() |
| HTML has content, images black | Rendering issue | Check Puppeteer settings |

---

## Success Criteria

After fix, verify:
- [ ] Single slide generation still works
- [ ] Carousel with 2 slides generates 2 images
- [ ] Both images have visible content (not black)
- [ ] Carousel with 3+ slides generates correct number of images
- [ ] Free image appears if enabled
- [ ] Different content on each slide shows correctly

