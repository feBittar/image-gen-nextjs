/**
 * Text Fit Utility
 * Automatically reduces font size when text wraps to multiple lines
 * Designed for single-word/short text fields that should stay on one line
 */

/**
 * Fits a text element to a single line by reducing font size
 * @param {HTMLElement} element - The text element to fit
 * @param {Object} config - Configuration options
 * @param {number} config.minFontSize - Minimum font size in px (default: 48)
 * @param {number} config.step - Font size reduction step in px (default: 4)
 * @param {number} config.maxAttempts - Maximum reduction attempts (default: 20)
 */
function fitTextToSingleLine(element, config = {}) {
  if (!element) {
    console.warn('[Text Fit] No element provided');
    return;
  }

  const minFontSize = config.minFontSize || 48;
  const step = config.step || 4;
  const maxAttempts = config.maxAttempts || 20;

  let attempts = 0;

  console.log('[Text Fit] Starting fit for element:', element.className);
  console.log('[Text Fit] Initial text:', element.textContent?.substring(0, 50));

  while (attempts < maxAttempts) {
    // Force reflow to get accurate measurements
    element.offsetHeight;

    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;

    // Calculate expected single line height with some tolerance
    const expectedHeight = lineHeight * 1.5;
    const actualHeight = element.scrollHeight;

    console.log(`[Text Fit] Attempt ${attempts + 1}: fontSize=${fontSize}px, lineHeight=${lineHeight}px, actualHeight=${actualHeight}px, expectedHeight=${expectedHeight}px`);

    // If actual height > expected single line height, text is wrapping
    if (actualHeight > expectedHeight) {
      if (fontSize <= minFontSize) {
        console.log(`[Text Fit] Reached minimum font size (${minFontSize}px), stopping`);
        break;
      }

      const newFontSize = fontSize - step;
      element.style.fontSize = newFontSize + 'px';
      console.log(`[Text Fit] Reducing font size: ${fontSize}px -> ${newFontSize}px`);
      attempts++;
    } else {
      console.log(`[Text Fit] Text fits in single line at ${fontSize}px`);
      break;
    }
  }

  if (attempts >= maxAttempts) {
    console.warn(`[Text Fit] Max attempts (${maxAttempts}) reached`);
  }

  console.log('[Text Fit] Complete');
}

/**
 * Initialize text fitting based on configuration
 */
function initTextFit() {
  console.log('[Text Fit] Initializing...');

  // Check if text fit configuration exists
  if (typeof window.textFitConfig === 'undefined') {
    console.log('[Text Fit] No configuration found, skipping');
    return;
  }

  const config = window.textFitConfig;
  console.log('[Text Fit] Configuration:', config);

  if (!config.enabled) {
    console.log('[Text Fit] Text fit is disabled');
    return;
  }

  // Process each target element
  const targets = config.targets || ['.text-1'];

  targets.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`[Text Fit] Processing target: ${selector}`);
      fitTextToSingleLine(element, {
        minFontSize: config.minFontSize,
        step: config.step,
        maxAttempts: config.maxAttempts
      });
    } else {
      console.warn(`[Text Fit] Target not found: ${selector}`);
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextFit);
} else {
  initTextFit();
}
