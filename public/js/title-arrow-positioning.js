/**
 * Dynamic title and bottom text positioning based on arrow position
 * 1. Adjusts container padding-bottom to maintain 40px gap between title bottom and arrow top
 * 2. Attaches bottom text to arrow's bottom-right corner
 *
 * The arrow stays fixed, the title moves up by increasing container padding-bottom
 */

(function() {
  'use strict';

  var GAP_BETWEEN_TITLE_AND_ARROW = 20; // Fixed 20px gap

  function adjustPositions() {
    console.log('\n========== DYNAMIC TITLE-ARROW POSITIONING ==========');

    var arrow = document.getElementById('arrowImage');
    var container = document.querySelector('.container');
    var title = document.querySelector('.title');

    if (!arrow || !container) {
      console.log('Missing core elements:', {
        hasArrow: !!arrow,
        hasContainer: !!container
      });
      return;
    }

    // Check if arrow has a valid src (not empty)
    if (!arrow.src || arrow.src === window.location.href || arrow.src.endsWith('/')) {
      console.log('Arrow has no valid src, skipping positioning adjustment');
      return;
    }

    if (!title) {
      console.log('No title element found, skipping');
      return;
    }

    console.log('Arrow and title found, calculating positions...');

    // Get bounding rectangles
    var arrowRect = arrow.getBoundingClientRect();
    var titleRect = title.getBoundingClientRect();

    console.log('Arrow rect:', {
      top: arrowRect.top,
      bottom: arrowRect.bottom,
      height: arrowRect.height
    });

    console.log('Title rect:', {
      top: titleRect.top,
      bottom: titleRect.bottom,
      height: titleRect.height
    });

    // ===== TITLE POSITIONING =====
    // Calculate current gap between title bottom and arrow top
    var currentGap = arrowRect.top - titleRect.bottom;

    console.log('Title-Arrow gap calculations:', {
      titleBottom: titleRect.bottom,
      arrowTop: arrowRect.top,
      currentGap: currentGap,
      requiredGap: GAP_BETWEEN_TITLE_AND_ARROW
    });

    // If current gap is less than required, increase container padding-bottom
    if (currentGap < GAP_BETWEEN_TITLE_AND_ARROW) {
      var additionalPadding = GAP_BETWEEN_TITLE_AND_ARROW - currentGap;
      var currentPaddingBottom = parseInt(window.getComputedStyle(container).paddingBottom) || 60;
      var newPaddingBottom = currentPaddingBottom + additionalPadding;

      console.log('Adjusting padding:', {
        currentPaddingBottom: currentPaddingBottom,
        additionalPadding: additionalPadding,
        newPaddingBottom: newPaddingBottom
      });

      container.style.paddingBottom = newPaddingBottom + 'px';
      console.log('✓ Title position adjusted - new padding-bottom:', newPaddingBottom + 'px');
    } else {
      console.log('✓ Current gap is sufficient (' + currentGap + 'px >= ' + GAP_BETWEEN_TITLE_AND_ARROW + 'px), no adjustment needed');
    }

    // NOTE: Bottom text positioning is now handled via CSS flexbox in the arrow-wrapper
    // The bottomText is a child of .arrow-bottom-wrapper with margin-top for gap
    // No JavaScript positioning needed anymore

    console.log('=============================================\n');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait for images to load
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          // Give a small delay for layout to stabilize
          setTimeout(adjustPositions, 100);
        });
      } else {
        setTimeout(adjustPositions, 100);
      }
    });
  } else {
    // DOM already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        setTimeout(adjustPositions, 100);
      });
    } else {
      setTimeout(adjustPositions, 100);
    }
  }
})();
