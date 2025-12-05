/**
 * Global Elements Handler
 *
 * Reusable JavaScript module for handling common element management:
 * - Empty element removal (title, subtitle, logo, bottomText)
 * - Logo image error handling with graceful fallback
 * - Arrow image error handling with graceful fallback
 *
 * Usage in any template:
 * <script src="http://localhost:3000/js/global-elements.js"></script>
 *
 * The script automatically detects and handles these element IDs/classes:
 * - .title (h1 or similar)
 * - .subtitle (p or similar)
 * - .logo (text logo container)
 * - #logoImage (img tag)
 * - #arrowImage (img tag)
 * - .bottom-text (cta text container)
 */

(function() {
  'use strict';

  /**
   * Section 1: Configuration
   * Selectors and settings for element detection
   */
  const SELECTORS = {
    title: '.title',
    subtitle: '.subtitle',
    logo: '.logo',
    logoImage: '#logoImage',
    arrowImage: '#arrowImage',
    bottomText: '.bottom-text'
  };

  /**
   * Section 2: Empty Element Removal
   * Removes elements that are empty or contain only whitespace
   * This prevents blank spaces in the layout when optional content is missing
   */
  function removeEmptyElements() {
    // Remove empty title
    const titleElement = document.querySelector(SELECTORS.title);
    if (!titleElement || !titleElement.textContent.trim()) {
      titleElement?.remove();
    }

    // Remove empty subtitle
    const subtitleElement = document.querySelector(SELECTORS.subtitle);
    if (!subtitleElement || !subtitleElement.textContent.trim()) {
      subtitleElement?.remove();
    }

    // Remove empty logo (text logo) - remove parent header container
    const logoElement = document.querySelector(SELECTORS.logo);
    if (!logoElement || !logoElement.textContent.trim()) {
      logoElement?.parentElement?.remove();
    }

    // Remove empty bottom text
    const bottomTextElement = document.querySelector(SELECTORS.bottomText);
    if (!bottomTextElement || !bottomTextElement.textContent.trim()) {
      bottomTextElement?.remove();
    }
  }

  /**
   * Section 3: Image Error Handling
   * Attaches error handlers to images that have a non-empty src attribute
   *
   * Error handling strategy:
   * - Only attaches handlers to images with valid src
   * - Hides image with display:none on load failure
   * - Logs warnings for debugging
   * - CSS handles initial display based on src="" attribute
   */
  function setupImageErrorHandling() {
    // Logo image error handling
    const logoImage = document.querySelector(SELECTORS.logoImage);
    if (logoImage) {
      const src = logoImage.getAttribute('src');

      // Only attach error handler if src is present and not empty
      if (src && src !== '') {
        logoImage.onerror = function() {
          console.warn('Logo image failed to load:', src);
          this.style.display = 'none';
        };
      }
    }

    // Arrow image error handling
    const arrowImage = document.querySelector(SELECTORS.arrowImage);
    if (arrowImage) {
      const src = arrowImage.getAttribute('src');

      // Only attach error handler if src is present and not empty
      if (src && src !== '') {
        arrowImage.onerror = function() {
          console.warn('Arrow image failed to load:', src);
          this.style.display = 'none';
        };
      }
    }
  }

  /**
   * Section 4: Public API
   * Main initialization function to run all handlers
   */
  window.GlobalElements = {
    /**
     * Initialize all global element handlers
     * Call this after DOM is fully loaded
     */
    init: function() {
      removeEmptyElements();
      setupImageErrorHandling();
    }
  };

  /**
   * Section 5: Auto-initialization
   * Automatically run when DOM is ready or immediately if already loaded
   */
  if (document.readyState === 'loading') {
    // DOM still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', GlobalElements.init);
  } else {
    // DOM already loaded, run immediately
    GlobalElements.init();
  }
})();
