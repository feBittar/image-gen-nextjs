/**
 * Dynamic arrow and content image positioning for stack template
 * Ensures minimum gap between content-image and arrow-wrapper
 *
 * The arrow-wrapper is fixed at the bottom, content-image adjusts if needed.
 */

(function() {
  'use strict';

  function adjustPositions() {
    console.log('\n========== ARROW-CONTENT GAP ADJUSTMENT ==========');

    var arrowWrapper = document.querySelector('.arrow-bottom-wrapper');
    var contentImageSection = document.querySelector('.content-image-section');

    if (!arrowWrapper) {
      console.log('No arrow wrapper found, skipping');
      return;
    }

    // Check if arrow has a valid src
    var arrow = document.getElementById('arrowImage');
    if (!arrow || !arrow.src || arrow.src === window.location.href || arrow.src.endsWith('/')) {
      console.log('Arrow has no valid src, skipping');
      return;
    }

    // Check if content image section exists and is visible
    if (!contentImageSection || window.getComputedStyle(contentImageSection).display === 'none') {
      console.log('Content image section not visible, skipping');
      return;
    }

    console.log('Arrow wrapper and content image found');

    // Get bounding rectangles
    var wrapperRect = arrowWrapper.getBoundingClientRect();
    var contentRect = contentImageSection.getBoundingClientRect();

    console.log('Wrapper rect:', { top: wrapperRect.top, bottom: wrapperRect.bottom });
    console.log('Content rect:', { top: contentRect.top, bottom: contentRect.bottom });

    // Get configuration
    var config = window.arrowContentPositioning || { gapFromArrow: 20 };
    var desiredGap = parseFloat(config.gapFromArrow) || 20;

    // Calculate current gap between content bottom and wrapper top
    var currentGap = wrapperRect.top - contentRect.bottom;

    console.log('Gap calculation:', {
      contentBottom: contentRect.bottom,
      wrapperTop: wrapperRect.top,
      currentGap: currentGap,
      desiredGap: desiredGap
    });

    // If gap is insufficient, reduce content image height or add margin
    if (currentGap < desiredGap) {
      var adjustment = desiredGap - currentGap;
      var currentMarginBottom = parseInt(window.getComputedStyle(contentImageSection).marginBottom) || 0;
      var newMarginBottom = currentMarginBottom + adjustment;

      contentImageSection.style.marginBottom = newMarginBottom + 'px';
      console.log('✓ Content image margin-bottom adjusted:', newMarginBottom + 'px');
    } else {
      console.log('✓ Gap is sufficient (' + currentGap + 'px >= ' + desiredGap + 'px)');
    }

    // NOTE: Bottom text positioning is handled via CSS flexbox in the wrapper
    console.log('===================================================\n');
  }

  // Wait for DOM to be ready and images to load
  function init() {
    const arrow = document.getElementById('arrowImage');

    if (arrow && arrow.src && !arrow.complete) {
      // Wait for arrow image to load
      arrow.onload = function() {
        setTimeout(adjustPositions, 50);
      };
    } else {
      setTimeout(adjustPositions, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
      } else {
        init();
      }
    });
  } else {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }
  }
})();
