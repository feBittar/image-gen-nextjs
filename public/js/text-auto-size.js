/**
 * Text Auto-Size Utility - Simplified Version
 *
 * Automatically adjusts font sizes in horizontal layouts:
 * - One text field is 3x larger (highlight/destaque)
 * - All other text fields are 1x (same size)
 * - Combined height matches the content image height
 */

/**
 * Binary search to find optimal font size for an element
 */
function findOptimalFontSize(element, targetHeight, minSize = 12, maxSize = 300, maxIterations = 25) {
  let low = minSize;
  let high = maxSize;
  let best = minSize;
  let iterations = 0;

  while (low <= high && iterations < maxIterations) {
    iterations++;
    const mid = Math.floor((low + high) / 2);
    element.style.fontSize = `${mid}px`;

    // Force reflow
    element.offsetHeight;

    const actualHeight = element.scrollHeight;
    const tolerance = 3;

    if (Math.abs(actualHeight - targetHeight) <= tolerance) {
      best = mid;
      break;
    } else if (actualHeight <= targetHeight) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  element.style.fontSize = `${best}px`;
  return best;
}

/**
 * Apply auto-sizing: 1 larger text (3x) + all other texts (1x)
 */
function applyProportionalAutoSize(textElements, largerIndex, referenceElement) {
  console.log('[Auto-Size] Starting auto-sizing...');
  console.log('[Auto-Size] Text elements:', textElements.length);
  console.log('[Auto-Size] Larger index:', largerIndex);

  if (!referenceElement) {
    console.error('[Auto-Size] Reference element not found');
    return;
  }

  // Get reference height
  const referenceHeight = referenceElement.offsetHeight || referenceElement.clientHeight;
  console.log('[Auto-Size] Reference height:', referenceHeight + 'px');

  if (referenceHeight <= 0) {
    console.warn('[Auto-Size] Reference has no height, skipping');
    return;
  }

  // Count how many smaller texts we have (exclude the larger one)
  const smallerTexts = textElements.filter((_, index) => index !== largerIndex);
  const numSmallerTexts = smallerTexts.length;

  console.log('[Auto-Size] Number of smaller texts:', numSmallerTexts);

  if (numSmallerTexts === 0) {
    console.warn('[Auto-Size] No smaller texts found');
    return;
  }

  // Calculate heights
  // Larger text gets 3 units, each smaller text gets 1 unit
  // Total units = 3 + numSmallerTexts
  const totalUnits = 3 + numSmallerTexts;
  const largerHeight = (referenceHeight / totalUnits) * 3;
  const smallerHeight = referenceHeight / totalUnits;

  console.log('[Auto-Size] Heights - Larger:', largerHeight + 'px, Each smaller:', smallerHeight + 'px');

  // Adjust the larger text
  const largerElement = textElements[largerIndex];
  if (largerElement) {
    console.log('[Auto-Size] Adjusting larger text (index ' + largerIndex + ')...');
    const largerSize = findOptimalFontSize(largerElement, largerHeight);
    console.log('[Auto-Size] Larger text size:', largerSize + 'px');
  }

  // Adjust all smaller texts
  smallerTexts.forEach((element, i) => {
    console.log('[Auto-Size] Adjusting smaller text ' + (i + 1) + '/' + numSmallerTexts + '...');
    const smallerSize = findOptimalFontSize(element, smallerHeight);
    console.log('[Auto-Size] Smaller text size:', smallerSize + 'px');
  });

  console.log('[Auto-Size] Auto-sizing complete!');
}

/**
 * Initialize auto-sizing
 */
function initAutoSize() {
  console.log('[Auto-Size] Initializing...');

  // Check configuration
  if (typeof window.autoSizeConfig === 'undefined') {
    console.log('[Auto-Size] No configuration found');
    return;
  }

  const config = window.autoSizeConfig;
  console.log('[Auto-Size] Config:', config);

  if (!config.enabled || config.mode !== 'proportional-3-1') {
    console.log('[Auto-Size] Auto-sizing disabled or unsupported mode');
    return;
  }

  // Get reference element (content image)
  const referenceElement = document.querySelector(config.referenceSelector || '.content-image');
  if (!referenceElement) {
    console.error('[Auto-Size] Reference element not found:', config.referenceSelector);
    return;
  }

  // Get all text elements from .text-section
  const textSection = document.querySelector('.text-section');
  if (!textSection) {
    console.error('[Auto-Size] Text section not found');
    return;
  }

  // Get all .text-item elements that are not empty
  const textElements = Array.from(textSection.querySelectorAll('.text-item'))
    .filter(el => el.textContent && el.textContent.trim().length > 0);

  console.log('[Auto-Size] Found', textElements.length, 'text items');

  if (textElements.length === 0) {
    console.warn('[Auto-Size] No text items found');
    return;
  }

  // Validate larger index
  const largerIndex = config.largerIndex || 0;
  if (largerIndex >= textElements.length) {
    console.error('[Auto-Size] Invalid largerIndex:', largerIndex);
    return;
  }

  // Apply auto-sizing
  applyProportionalAutoSize(textElements, largerIndex, referenceElement);
}

// Run after everything loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Wait a bit for images to size
        setTimeout(initAutoSize, 200);
      });
    } else {
      setTimeout(initAutoSize, 200);
    }
  });
} else {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(initAutoSize, 200);
    });
  } else {
    setTimeout(initAutoSize, 200);
  }
}
