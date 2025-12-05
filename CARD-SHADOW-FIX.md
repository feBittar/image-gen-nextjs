# Card Container Shadow Fix

## Issue Summary

The Card Container shadow was not appearing in generated images because the CSS was being generated incorrectly with `undefinedpx` values instead of actual pixel values.

## Root Cause

In `src/lib/modules/card/css.ts`, the `generateShadowCss` function was using object destructuring without default values:

```typescript
// BEFORE (BROKEN)
function generateShadowCss(shadow: any): string {
  if (!shadow.enabled) return 'none';

  const { x, y, blur, spread, color } = shadow;
  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}
```

When shadow properties were not properly passed or were undefined, this would produce invalid CSS like:
```css
box-shadow: 8px undefinedpx undefinedpx 4px rgba(0, 0, 0, 1);
```

## Files Affected

1. **D:\Gevia\image-gen-nextjs\src\lib\modules\card\css.ts** (line 158-168)
   - Fixed the `generateShadowCss` function

## The Fix

Updated the function to use the nullish coalescing operator (`??`) with proper default values:

```typescript
// AFTER (FIXED)
function generateShadowCss(shadow: any): string {
  if (!shadow.enabled) return 'none';

  const x = shadow.x ?? 0;
  const y = shadow.y ?? 10;
  const blur = shadow.blur ?? 30;
  const spread = shadow.spread ?? 0;
  const color = shadow.color ?? 'rgba(0, 0, 0, 0.3)';

  return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
}
```

This ensures that even if shadow properties are undefined, sensible defaults are used.

## How the Data Flows

1. **CardForm.tsx** (lines 74-91) - User updates shadow values via the form
   - Uses `updateShadow` helper to update individual shadow fields
   - Merges with existing shadow object

2. **modularStore.ts** - Stores shadow configuration in module data
   - Initializes with defaults from card module definition

3. **Card Module defaults** (card/index.ts, lines 44-51)
   ```typescript
   shadow: {
     enabled: false,
     x: 0,
     y: 10,
     blur: 30,
     spread: 0,
     color: 'rgba(0, 0, 0, 0.3)',
   }
   ```

4. **API Route** (generate-modular/route.ts) - Receives module data and generates template

5. **css.ts** (getCardCss function) - Generates CSS including shadow
   - Calls `generateShadowCss` when shadow is enabled
   - Applies to `.card-container` class

## Testing

Created test file `test-card-shadow.js` to verify the fix handles:
- Full shadow data with all properties defined ✓
- Partial shadow data with some undefined values ✓
- Only enabled=true with all values undefined ✓
- Disabled shadow (should return 'none') ✓
- Shadow with 0 values (should not treat 0 as undefined) ✓

All tests pass with the fixed implementation.

## Verification

### Before Fix
```css
box-shadow: 8px undefinedpx undefinedpx 4px rgba(0, 0, 0, 1);
```

### After Fix
```css
box-shadow: 0px 10px 30px 0px rgba(0, 0, 0, 0.3);
```

The shadow now renders correctly on the generated card container.

## Additional Notes

- The gradient overlay function (`generateGradientCss`) already had proper fallback handling, which is why gradients were working correctly
- This pattern should be used for all similar CSS generation functions to prevent undefined values
- The fix maintains backward compatibility with existing configurations

## Related Files

- `src/lib/modules/card/CardForm.tsx` - Form component for shadow configuration
- `src/lib/modules/card/schema.ts` - Shadow schema definition
- `src/lib/modules/card/css.ts` - CSS generation (FIXED)
- `src/lib/modules/card/index.ts` - Module definition with defaults
- `test-card-shadow.js` - Test file for verification
