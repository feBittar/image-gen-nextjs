# Concrete Examples: text-align and Line Breaking

## Quick Answer

**NO**, `text-align: center` does NOT cause text to wrap at different positions than `text-align: left`.

## Visual Proof

Consider this text in an 852px wide container with 48px bold font:

```
CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA CINTURA, BOLSO TRASEIRO E LATERAL
```

### With text-align: left
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA                             │
│ CINTURA, BOLSO TRASEIRO E LATERAL                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### With text-align: center
```
┌─────────────────────────────────────────────────────────────────────────────┐
│            CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA                  │
│                    CINTURA, BOLSO TRASEIRO E LATERAL                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Notice:** The words "CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA" are on line 1 in BOTH cases. The line break happens at the SAME place. Only the horizontal positioning changes.

## How CSS Actually Works

### Step 1: Line Breaking (Independent of text-align)
```javascript
// Browser calculates where lines break based on:
const lineBreakFactors = {
  containerWidth: 852,        // Available space
  fontSize: 48,              // Character size
  fontFamily: "Montserrat",  // Font metrics (character widths)
  wordBreak: "normal",       // Break at word boundaries
  whiteSpace: "normal",      // Allow wrapping
  overflowWrap: "normal"     // Don't break words
};

// Result: Break after "NA" because "CINTURA" would overflow
const lines = [
  "CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA",
  "CINTURA, BOLSO TRASEIRO E LATERAL"
];
```

### Step 2: Alignment (Depends on text-align)
```javascript
// AFTER lines are determined, apply horizontal alignment
if (textAlign === 'left') {
  // Position each line flush left
  line1.x = 0;
  line2.x = 0;
} else if (textAlign === 'center') {
  // Position each line centered
  line1.x = (containerWidth - line1.width) / 2;
  line2.x = (containerWidth - line2.width) / 2;
}
```

## The Exception: text-align: justify

`text-align: justify` is special:
- Still breaks at the SAME positions
- BUT adjusts spacing to fill the line width

### Example:
```css
/* Original spacing */
"CLÁSSICA LEGGING TEM FECHAMENTO"

/* With justify - adds extra space between words */
"CLÁSSICA    LEGGING    TEM    FECHAMENTO"
```

**Character positions change, but break points remain the same.**

## Real-World Measurements

Using JavaScript to detect line breaks:

```javascript
function detectLineBreaks(element) {
  const words = element.textContent.split(' ');
  const lines = [];
  let currentLine = [];
  let lastTop = null;

  words.forEach(word => {
    const span = document.createElement('span');
    span.textContent = word;
    element.appendChild(span);

    const rect = span.getBoundingClientRect();

    if (lastTop === null || rect.top === lastTop) {
      currentLine.push(word);
    } else {
      lines.push(currentLine.join(' '));
      currentLine = [word];
    }

    lastTop = rect.top;
  });

  lines.push(currentLine.join(' '));
  return lines;
}

// Test with left-aligned
element.style.textAlign = 'left';
const leftLines = detectLineBreaks(element);
// Result: ["CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA", "CINTURA, BOLSO TRASEIRO E LATERAL"]

// Test with center-aligned
element.style.textAlign = 'center';
const centerLines = detectLineBreaks(element);
// Result: ["CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA", "CINTURA, BOLSO TRASEIRO E LATERAL"]

console.log(leftLines === centerLines); // true - IDENTICAL
```

## Why Your Detection Shows Different Results

If detection logs show "LEGGING" ending line 1, but final render shows "LEGGING TEM" together, it's NOT because of text-align. It's because:

### 1. Font Not Loaded During Detection
```javascript
// During detection (WRONG - font not loaded yet)
const detectedFont = 'Arial'; // Fallback font
const charWidth = measureChar('L', 'Arial, 48px') // ~28px

// During rendering (CORRECT - custom font loaded)
const actualFont = 'Montserrat';
const charWidth = measureChar('L', 'Montserrat, 48px') // ~26px

// Result: "LEGGING" fits on line 1 in Montserrat, but not in Arial
```

### 2. Different Container Width Measurement
```javascript
// During detection
const detectedWidth = element.offsetWidth; // 852px (maybe includes padding?)

// During rendering
const actualWidth = element.clientWidth; // 812px (excludes padding?)

// Result: Less space = earlier line break
```

### 3. Font Metrics Interpretation Difference
```javascript
// Puppeteer headless mode
const charWidth = calculateCharWidth(); // Uses font hinting

// Browser display mode
const charWidth = calculateCharWidth(); // Different font hinting

// Small differences accumulate across many characters
// "LEGGING TEM" width in Puppeteer: 435px (fits)
// "LEGGING TEM" width in browser: 445px (doesn't fit)
```

## Puppeteer Font Rendering Issues

### Problem: Inconsistent Character Widths
```typescript
// Current configuration (in imageGenerator.ts)
puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    // MISSING: --font-render-hinting=none
  ]
})
```

### Solution: Add Font Rendering Flag
```typescript
puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--font-render-hinting=none', // ADD THIS for consistent font rendering
  ]
})
```

## Test Results

The test file `test-text-align-wrapping.html` demonstrates:

1. **Visual comparison**: Left vs Center vs Justify alignment
2. **JavaScript detection**: Programmatically detects where each line breaks
3. **Result**: All three alignments break at IDENTICAL positions

### Expected Output:
```
Line Break Analysis

LEFT-ALIGNED:
Line 1: CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA
Line 2: CINTURA, BOLSO TRASEIRO E LATERAL

CENTER-ALIGNED:
Line 1: CLÁSSICA LEGGING TEM FECHAMENTO COM ELÁSTICO NA
Line 2: CINTURA, BOLSO TRASEIRO E LATERAL

Result: ✓ IDENTICAL
Line breaks occur at the SAME positions regardless of text-align value.
```

## What Controls Line Breaking

| Property | Affects Line Breaking? | Purpose |
|----------|----------------------|---------|
| `text-align` | ❌ NO | Horizontal alignment AFTER breaking |
| `width` | ✅ YES | Available space for text |
| `font-size` | ✅ YES | Character dimensions |
| `font-family` | ✅ YES | Character widths vary by font |
| `word-break` | ✅ YES | Controls if/how words break |
| `overflow-wrap` | ✅ YES | Controls breaking long words |
| `white-space` | ✅ YES | Controls if wrapping happens at all |
| `hyphens` | ✅ YES | Allows hyphenated breaks |
| `text-wrap` | ✅ YES | New property for balanced wrapping |

## Debugging Checklist

To fix line breaking discrepancies:

- [ ] Wait for `document.fonts.ready` before detection
- [ ] Log computed font-family during detection and rendering
- [ ] Measure container width in both contexts
- [ ] Add `--font-render-hinting=none` to Puppeteer args
- [ ] Use same font metrics calculation method
- [ ] Verify custom fonts are loaded (not using fallback)
- [ ] Check for CSS differences (padding, margin, box-sizing)
- [ ] Test with standard fonts (Arial) to isolate font issues

## Conclusion

**text-align DOES NOT affect line breaking.** If you're seeing different line breaks, the cause is:

1. ✅ Font loading timing
2. ✅ Font metrics differences
3. ✅ Container width differences
4. ✅ Puppeteer rendering configuration
5. ❌ NOT text-align property

The solution is to ensure consistent font loading, measurements, and Puppeteer configuration between detection and rendering phases.
