/**
 * Line Detector Utility
 * Detects natural line breaks in text by comparing offsetTop of words
 * Based on GSAP SplitText / Lettering.js techniques
 */

/**
 * Splits text into lines based on natural word wrapping
 * @param {HTMLElement} element - The element containing text to split
 * @returns {Array<Array<HTMLElement>>} Array of lines, each containing word spans
 */
function splitTextIntoLines(element) {
  if (!element || !element.textContent) {
    console.warn('[Line Detector] No element or text content provided');
    return [];
  }

  const originalText = element.textContent.trim();
  console.log('[Line Detector] Original text:', originalText);

  // Split by words (preserve spaces)
  const words = originalText.split(/(\s+)/);
  console.log('[Line Detector] Words:', words);

  // Clear element and wrap each word in a span
  element.innerHTML = '';
  const wordSpans = [];

  words.forEach((word, index) => {
    if (word === '') return; // Skip empty strings

    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline';
    span.dataset.wordIndex = index.toString();
    element.appendChild(span);

    // Only track actual words, not spaces
    if (word.trim() !== '') {
      wordSpans.push(span);
    }
  });

  console.log('[Line Detector] Created', wordSpans.length, 'word spans');

  // Give browser time to layout
  // Force reflow
  element.offsetHeight;

  // Group words into lines by comparing offsetTop
  const lines = [];
  let currentLine = [];
  let currentTop = null;

  wordSpans.forEach((span, index) => {
    const spanTop = span.offsetTop;

    console.log(`[Line Detector] Word ${index}: "${span.textContent}" at offsetTop=${spanTop}`);

    if (currentTop === null) {
      // First word
      currentTop = spanTop;
      currentLine.push(span);
    } else if (Math.abs(spanTop - currentTop) < 2) {
      // Same line (with 2px tolerance for rounding)
      currentLine.push(span);
    } else {
      // New line detected
      console.log('[Line Detector] Line break detected! Previous top:', currentTop, 'New top:', spanTop);
      lines.push(currentLine);
      currentLine = [span];
      currentTop = spanTop;
    }
  });

  // Push last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  console.log('[Line Detector] Detected', lines.length, 'lines');
  lines.forEach((line, i) => {
    const lineText = line.map(span => span.textContent).join('');
    console.log(`[Line Detector] Line ${i + 1}:`, lineText);
  });

  return lines;
}

/**
 * Applies styling to detected lines
 * @param {HTMLElement} element - The element to process
 * @param {Array<Object>} lineStyles - Array of style objects, one per line
 */
function applyLineStyles(element, lineStyles) {
  if (!element || !lineStyles || lineStyles.length === 0) {
    console.warn('[Line Detector] No element or line styles provided');
    return;
  }

  console.log('[Line Detector] Applying styles to lines:', lineStyles);

  // Detect lines
  const lines = splitTextIntoLines(element);

  if (lines.length === 0) {
    console.warn('[Line Detector] No lines detected');
    return;
  }

  // Clear element and rebuild with line wrappers
  element.innerHTML = '';

  lines.forEach((lineWords, lineIndex) => {
    // Create line wrapper
    const lineDiv = document.createElement('div');
    lineDiv.className = `line line-${lineIndex + 1}`;
    lineDiv.style.display = 'block';

    // Apply style for this line if available
    const style = lineStyles[lineIndex] || {};
    console.log(`[Line Detector] Applying style to line ${lineIndex + 1}:`, style);

    // Build CSS styles
    const cssStyles = [];

    if (style.color) cssStyles.push(`color: ${style.color}`);
    if (style.fontFamily) cssStyles.push(`font-family: ${style.fontFamily}`);
    if (style.fontSize) cssStyles.push(`font-size: ${style.fontSize}`);
    if (style.fontWeight) cssStyles.push(`font-weight: ${style.fontWeight}`);
    if (style.bold) cssStyles.push(`font-weight: bold`);
    if (style.italic) cssStyles.push(`font-style: italic`);
    if (style.letterSpacing) cssStyles.push(`letter-spacing: ${style.letterSpacing}`);
    if (style.textShadow) cssStyles.push(`text-shadow: ${style.textShadow}`);

    // Background with padding (like styled chunks)
    if (style.backgroundColor) {
      cssStyles.push(`background-color: ${style.backgroundColor}`);
      const padding = style.padding || '0.3em 0.6em';
      cssStyles.push(`padding: ${padding}`);
      cssStyles.push(`border-radius: 4px`);
      cssStyles.push(`display: inline-block`);
      cssStyles.push(`-webkit-box-decoration-break: clone`);
      cssStyles.push(`box-decoration-break: clone`);
    }

    if (cssStyles.length > 0) {
      lineDiv.style.cssText = cssStyles.join('; ');
    }

    // Rebuild text from word spans, preserving spaces
    lineWords.forEach((wordSpan, idx) => {
      lineDiv.appendChild(document.createTextNode(wordSpan.textContent));

      // Add space after word if not last word
      if (idx < lineWords.length - 1) {
        lineDiv.appendChild(document.createTextNode(' '));
      }
    });

    element.appendChild(lineDiv);
  });

  console.log('[Line Detector] Line styling complete');
}

/**
 * Initialize line styling when special styling is enabled
 */
function initLineDetection() {
  console.log('[Line Detector] Initializing...');

  // Check if special styling configuration exists
  if (typeof window.titleSpecialStyling === 'undefined') {
    console.log('[Line Detector] No special styling configuration found');
    return;
  }

  const config = window.titleSpecialStyling;
  console.log('[Line Detector] Configuration:', config);

  if (!config.enabled) {
    console.log('[Line Detector] Special styling is disabled');
    return;
  }

  if (!config.lineStyles || config.lineStyles.length === 0) {
    console.log('[Line Detector] No line styles defined');
    return;
  }

  // Find title element
  const titleElement = document.querySelector('.title');
  if (!titleElement) {
    console.warn('[Line Detector] Title element not found');
    return;
  }

  console.log('[Line Detector] Found title element:', titleElement);
  console.log('[Line Detector] Title text:', titleElement.textContent);

  // Apply line styles
  applyLineStyles(titleElement, config.lineStyles);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLineDetection);
} else {
  initLineDetection();
}
