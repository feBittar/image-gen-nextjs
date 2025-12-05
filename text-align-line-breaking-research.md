# Text-Align and Line Breaking Research

## Executive Summary

**Key Finding:** `text-align: center` vs `text-align: left` **DOES NOT** affect WHERE text wraps or breaks into lines. It ONLY affects HOW the text is horizontally aligned AFTER the lines have already been broken.

## The Question

In the context of the carousel text detection logs showing:
- `textAlign: 'center'` in titleStyle
- `titleWidth: 852px`
- Lines breaking at specific positions (e.g., "LEGGING" ending line 1)

Could the centered alignment be causing different line breaking behavior compared to left-aligned text?

## The Answer: NO

### 1. CSS Specification Behavior

According to CSS specifications and standards:

- **Line breaking algorithm is independent of text-align**
- Line breaks are determined by:
  - Container width
  - Font size and font-family
  - Word boundaries (spaces, hyphens)
  - `word-break` property
  - `overflow-wrap` property
  - `white-space` property
  - `hyphens` property

- **text-align only affects alignment AFTER breaking**
  - `text-align: left` - aligns completed lines to the left edge
  - `text-align: center` - centers completed lines horizontally
  - `text-align: right` - aligns completed lines to the right edge
  - `text-align: justify` - stretches lines to fill width (but doesn't change break points)

### 2. Browser Implementation

All modern browsers (Chrome, Firefox, Safari, Edge) follow the same standard:

1. **First**: Calculate line breaks based on available width and word boundaries
2. **Then**: Apply text-align to position each line horizontally

### 3. Why Confusion Exists

The text-wrap property (introduced recently) was created specifically because `text-align` was NOT effective for controlling line breaks:

> "Before text-wrap, developers relied heavily on max-width, text-align, or &lt;br&gt; to control text lines, but text-align was not truly effective for this purpose—it was more of a workaround than an actual solution."

## Edge Cases and Special Behaviors

### 1. Text-Align: Justify

`text-align: justify` is the ONE exception where alignment affects rendering:

- **Still breaks at the same positions** as other alignments
- **BUT**: Adjusts spacing between words/characters to fill the line width
- Different browsers use different justification algorithms:
  - **inter-word**: Adds space between words
  - **inter-character**: Adds tiny spaces between characters
  - Safari, Chrome, Firefox have subtle differences in their implementations

### 2. Puppeteer-Specific Issues

Research found several Puppeteer rendering inconsistencies:

#### Font Rendering Issues
- **Problem**: Text rendering differs between headless mode and browser
- **Cause**: Font hinting differences
- **Solution**: Add `--font-render-hinting=none` to launch args
- **Impact**: Can affect character width calculations, potentially causing different line breaks

#### Custom Font Issues
- **Problem**: Custom fonts render differently in Puppeteer vs browser
- **Cause**: Font loading timing, font metrics interpretation
- **Impact**: Different character widths = different line breaks
- **Note**: Standard fonts (Arial) are more consistent

#### Text Measurement Timing
- **Problem**: Line breaks may be calculated before fonts fully load
- **Cause**: Not waiting for `document.fonts.ready`
- **Impact**: Fallback font metrics used during measurement = incorrect line breaks

## Explaining the Detection Discrepancy

If detection shows "LEGGING" ending line 1, but final rendering shows "LEGGING TEM" together, possible causes:

### NOT CAUSED BY:
- ❌ text-align: center vs left difference

### LIKELY CAUSED BY:
- ✅ **Font loading timing**: Detection happens before custom fonts load, using fallback metrics
- ✅ **Font metrics difference**: Puppeteer interprets font metrics differently than browser
- ✅ **Character width calculation**: Font rendering differences affect character widths
- ✅ **Container width measurement**: Detection might measure a different container width
- ✅ **CSS cascade/inheritance**: Different styles applied during detection vs rendering

## Verification Test Created

Created `test-text-align-wrapping.html` that demonstrates:

1. **Same text with different alignments** (left, center, justify)
2. **JavaScript line break detection** that programmatically detects where lines break
3. **Visual comparison** to see alignment differences
4. **Word-break property interaction** testing
5. **Edge case testing** with very long words

### Expected Result:
Line breaks occur at **identical positions** for left, center, and justify alignment.

## Recommendations for Debugging

To debug the actual line breaking discrepancy:

1. **Check font loading status** during detection:
   ```javascript
   await document.fonts.ready;
   console.log('Fonts loaded:', document.fonts.status);
   ```

2. **Log computed font metrics**:
   ```javascript
   const style = window.getComputedStyle(element);
   console.log('Font family:', style.fontFamily);
   console.log('Font size:', style.fontSize);
   console.log('Font weight:', style.fontWeight);
   ```

3. **Measure character widths**:
   ```javascript
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   ctx.font = '48px "Your Custom Font"';
   const width = ctx.measureText('LEGGING').width;
   console.log('Text width:', width);
   ```

4. **Compare container widths**:
   ```javascript
   console.log('Container width:', element.offsetWidth);
   console.log('Container clientWidth:', element.clientWidth);
   console.log('Computed width:', getComputedStyle(element).width);
   ```

5. **Add font-render-hinting=none** to Puppeteer launch args:
   ```typescript
   puppeteer.launch({
     args: [
       '--no-sandbox',
       '--disable-setuid-sandbox',
       '--font-render-hinting=none', // ADD THIS
     ],
   });
   ```

## Conclusion

The `text-align: center` property in the titleStyle is **NOT** causing different line breaking behavior. The line break discrepancy between detection and final rendering is caused by:

1. **Font metrics differences** between detection time and render time
2. **Font loading timing** (detection before fonts fully load)
3. **Puppeteer rendering differences** (font hinting, custom font interpretation)

The solution is to ensure:
- Fonts are fully loaded before detection
- Same font metrics are used in both detection and rendering
- Puppeteer launch args include font rendering consistency flags
- Container width measurements are identical in both contexts

## Sources

- [MDN: text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)
- [MDN: Wrapping and breaking text](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Text/Wrapping_breaking_text)
- [FreeCodeCamp: CSS text-wrap Property](https://www.freecodecamp.org/news/how-to-use-css-text-wrap-property/)
- [Stack Overflow: Change text alignment when text wraps](https://stackoverflow.com/questions/49481068/change-text-alignment-when-the-text-wraps)
- [Stack Overflow: CSS Text align when wrapping](https://stackoverflow.com/questions/54981007/css-text-align-when-wrapping)
- [Matthew Petroff: Pre-calculated Line Breaks for HTML/CSS](https://mpetroff.net/2020/05/pre-calculated-line-breaks-for-html-css/)
- [GitHub: Puppeteer Issue #3513 - Text in canvas renders differently](https://github.com/puppeteer/puppeteer/issues/3513)
- [GitHub: Puppeteer Issue #2410 - Inconsistent text rendering in headless mode](https://github.com/puppeteer/puppeteer/issues/2410)
- [Stack Overflow: Text line height inconsistency in puppeteer](https://stackoverflow.com/questions/72720711/text-line-height-inconsistency-in-puppeteer-ideas-how-to-fix)
- [CSS-Tricks: text-align](https://css-tricks.com/almanac/properties/t/text-align/)
- [MDN: text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-align)
