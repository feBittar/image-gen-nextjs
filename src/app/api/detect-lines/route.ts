import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Type declaration for Puppeteer page evaluation
declare global {
  interface Window {
    lineDetectionResult: {
      lineCount: number;
      lines: string[];
    } | null;
  }
}

interface DetectLinesRequest {
  title: string;
  titleStyle?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
  };
  cardWidth?: number;
  titleSpecialStyling?: {
    enabled?: boolean;
    lineStyles?: Array<{
      backgroundColor?: string;
      [key: string]: any;
    }>;
  };
}

/**
 * Detects the number of natural line breaks in the title text
 * based on the actual rendering with Puppeteer
 */
export async function POST(request: NextRequest) {
  let browser = null;

  try {
    // Parse request body
    const body: DetectLinesRequest = await request.json();
    const { title, titleStyle = {}, cardWidth = 90, titleSpecialStyling } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    console.log('[Detect Lines] Starting detection for title:', title);
    console.log('[Detect Lines] Title style:', titleStyle);
    console.log('[Detect Lines] Special styling:', titleSpecialStyling);

    // Build inline styles for title
    const titleStyles = [
      `font-family: ${titleStyle.fontFamily || 'Bebas Neue'}, sans-serif`,
      `font-size: ${titleStyle.fontSize || '72px'}`,
      `font-weight: ${titleStyle.fontWeight || '900'}`,
      `color: ${titleStyle.color || '#ffffff'}`,
      `text-align: ${titleStyle.textAlign || 'left'}`,
      `line-height: ${titleStyle.lineHeight || '1.2'}`,
      `letter-spacing: ${titleStyle.letterSpacing || '-1px'}`,
      `text-transform: ${titleStyle.textTransform || 'uppercase'}`,
      'word-wrap: break-word',
      'word-break: break-word',
      'overflow-wrap: break-word',
      'width: 100%',
      'max-width: 100%',
    ].join('; ');

    // Create minimal HTML for line detection
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Generate font-face CSS for the specified font family
    const fontFamily = titleStyle.fontFamily || 'Bebas Neue';
    let fontFaceCSS = '';

    // Map common font families to their file names
    const fontFileMap: Record<string, string[]> = {
      'Bebas Neue': ['BebasNeue-Regular.ttf', 'BebasNeue-Bold.ttf'],
      'Montserrat': ['Montserrat-Regular.ttf', 'Montserrat-Bold.ttf'],
      'Europa Grotesk SH': ['europa-grotesk-sh-bold.otf'],
    };

    const fontFiles = fontFileMap[fontFamily] || [];
    fontFiles.forEach((file, idx) => {
      const weight = file.includes('Bold') || file.includes('bold') ? '700' : '400';
      const format = file.endsWith('.otf') ? 'opentype' : 'truetype';
      fontFaceCSS += `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${baseUrl}/fonts/${file}') format('${format}');
        font-weight: ${weight};
        font-style: normal;
        font-display: swap;
      }
      `;
    });

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1440" />
    <title>Line Detection</title>
    <style>
      ${fontFaceCSS}

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* ===== VIEWPORT BACKGROUND (matching template exactly) ===== */
      body {
        width: 1080px;
        height: 1440px;
        background-color: #000000;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
        overflow: hidden;
        position: relative;
      }

      /* Viewport gradient overlay pseudo-elements (matching template) */
      body::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        display: none;
      }

      body::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        display: none;
      }

      /* ===== CARD CONTAINER (matching template exactly) ===== */
      .card-container {
        width: ${cardWidth}%;
        height: 90%;
        background-color: #2d2d2d;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 20px;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }

      /* Card gradient overlay pseudo-element (matching template) */
      .card-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        display: none;
        border-radius: 20px;
      }

      /* Container principal (matching template exactly) */
      .container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 60px;
        padding-bottom: 60px; /* Fixed for detection, dynamic in final render */
        box-sizing: border-box;
        position: relative;
        z-index: 10;
      }

      /* Container do título (matching template exactly) */
      .title-container {
        display: flex;
        flex-direction: column;
        gap: 0;
        max-width: 100%;
      }

      /* Título (matching template defaults + titleStyle overrides) */
      .title {
        ${titleStyles}
      }

      /* Barras de fundo inline nos chunks (matching template exactly) */
      .title span {
        display: inline;
        white-space: pre-wrap;
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
      }

      /* Support for background bars with proper padding (matching template exactly) */
      .title span[style*="background-color"] {
        padding: 0.3em 0.6em;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="card-container">
      <div class="container">
        <div class="title-container">
          <h1 class="title">${title}</h1>
        </div>
      </div>
    </div>

    <script>
      // Configuration injected from server (line styles to check for backgrounds)
      const LINE_STYLES = ${JSON.stringify(titleSpecialStyling?.lineStyles || [])};

      // Line detection script with two-pass approach for accuracy
      function detectLines() {
        console.log('[Line Detection] Starting...');
        console.log('[Line Detection] Line styles config:', LINE_STYLES);

        const element = document.querySelector('.title');
        if (!element || !element.textContent) {
          console.log('[Line Detection] No element or text found');
          return { lineCount: 0, lines: [], debug: 'No element found' };
        }

        const originalText = element.textContent.trim();
        console.log('[Line Detection] Original text:', originalText);
        console.log('[Line Detection] Text length:', originalText.length);

        // FIRST PASS: Detect lines without padding
        const firstPassLines = detectLinesPass(element, originalText, false);
        console.log('[Line Detection] First pass detected ' + firstPassLines.length + ' lines');

        // Check if any line will have background color
        const hasBackgrounds = LINE_STYLES.some((style, idx) =>
          idx < firstPassLines.length && style && style.backgroundColor
        );
        console.log('[Line Detection] Has backgrounds:', hasBackgrounds);

        // If backgrounds exist, do SECOND PASS with padding simulation
        if (hasBackgrounds) {
          console.log('[Line Detection] Running second pass with padding simulation...');
          const secondPassLines = detectLinesWithPadding(element, originalText, firstPassLines, LINE_STYLES);
          return {
            lineCount: secondPassLines.length,
            lines: secondPassLines.map(line => line.text),
            debug: secondPassLines.map(line => line.debug)
          };
        }

        // No backgrounds, return first pass results
        return {
          lineCount: firstPassLines.length,
          lines: firstPassLines,
          debug: 'No backgrounds, single pass detection'
        };
      }

      // First pass: simple word-based detection
      function detectLinesPass(element, text, withPadding) {
        const simpleWords = text.split(' ');
        const words = [];
        simpleWords.forEach((word, idx) => {
          words.push(word);
          if (idx < simpleWords.length - 1) {
            words.push(' ');
          }
        });

        element.innerHTML = '';
        const wordSpans = [];

        words.forEach((word, index) => {
          if (word === '') return;
          const span = document.createElement('span');
          span.textContent = word;
          span.style.display = 'inline';
          element.appendChild(span);
          if (word.trim() !== '') {
            wordSpans.push(span);
          }
        });

        console.log('[Line Detection] Word spans created:', wordSpans.length);

        // Force reflow
        element.offsetHeight;

        // Wait for layout stabilization
        const wait = (ms) => {
          const start = Date.now();
          while (Date.now() - start < ms) {}
        };
        wait(100);

        // Group words by offsetTop to detect lines
        const lines = [];
        let currentLine = [];
        let currentTop = null;

        wordSpans.forEach((span, idx) => {
          const spanTop = span.offsetTop;
          if (currentTop === null) {
            currentTop = spanTop;
            currentLine.push(span);
          } else if (Math.abs(spanTop - currentTop) < 2) {
            currentLine.push(span);
          } else {
            lines.push(currentLine);
            currentLine = [span];
            currentTop = spanTop;
          }
        });

        if (currentLine.length > 0) {
          lines.push(currentLine);
        }

        // Extract text for each line
        return lines.map(line => line.map(span => span.textContent).join(' '));
      }

      // Second pass: simulate padding for lines with backgrounds
      function detectLinesWithPadding(element, text, firstPassLines, lineStyles) {
        element.innerHTML = '';

        // Create wrapper spans for each line with appropriate styling
        firstPassLines.forEach((lineText, idx) => {
          const lineSpan = document.createElement('span');
          lineSpan.textContent = lineText;
          lineSpan.style.display = 'inline';
          lineSpan.style.whiteSpace = 'pre-wrap';
          lineSpan.style.webkitBoxDecorationBreak = 'clone';
          lineSpan.style.boxDecorationBreak = 'clone';

          // Apply padding if this line has backgroundColor
          const lineStyle = lineStyles[idx];
          if (lineStyle && lineStyle.backgroundColor) {
            lineSpan.style.padding = '0.3em 0.6em';
            lineSpan.style.backgroundColor = lineStyle.backgroundColor;
            lineSpan.style.borderRadius = '4px';
            console.log('[Line Detection] Line ' + (idx + 1) + ' has background, adding padding');
          }

          element.appendChild(lineSpan);

          // Add space between lines (except last)
          if (idx < firstPassLines.length - 1) {
            element.appendChild(document.createTextNode(' '));
          }
        });

        // Force reflow
        element.offsetHeight;
        const wait = (ms) => {
          const start = Date.now();
          while (Date.now() - start < ms) {}
        };
        wait(100);

        // Now detect lines again on this new structure
        const lineSpans = Array.from(element.querySelectorAll('span'));
        const detectedLines = [];
        let currentLine = { spans: [], top: null };

        lineSpans.forEach((span, idx) => {
          const spanTop = span.offsetTop;
          const spanLeft = span.offsetLeft;

          console.log('[Line Detection Pass 2] Span ' + idx + ': "' + span.textContent.substring(0, 20) + '..." at top=' + spanTop + ', left=' + spanLeft);

          if (currentLine.top === null) {
            currentLine.top = spanTop;
            currentLine.spans.push(span);
          } else if (Math.abs(spanTop - currentLine.top) < 2) {
            currentLine.spans.push(span);
          } else {
            detectedLines.push(currentLine);
            currentLine = { spans: [span], top: spanTop };
          }
        });

        if (currentLine.spans.length > 0) {
          detectedLines.push(currentLine);
        }

        console.log('[Line Detection Pass 2] Detected ' + detectedLines.length + ' lines with padding');

        // Extract text and debug info
        return detectedLines.map((line, idx) => {
          const text = line.spans.map(s => s.textContent).join(' ');
          console.log('[Line Detection Pass 2] Final Line ' + (idx + 1) + ': ' + text);
          return {
            text: text,
            debug: {
              spanCount: line.spans.length,
              top: line.top
            }
          };
        });
      }

      // Store result in window for Puppeteer to read
      window.lineDetectionResult = null;

      // Wait for fonts and then detect
      document.fonts.ready.then(() => {
        // Wait longer to ensure layout is stable
        setTimeout(() => {
          console.log('[Line Detection] Fonts loaded, waiting for layout...');
          // Force multiple reflows
          document.body.offsetHeight;
          setTimeout(() => {
            window.lineDetectionResult = detectLines();
          }, 500); // Increased wait time
        }, 200);
      });
    </script>
  </body>
</html>
    `;

    console.log('[Detect Lines] Launching Puppeteer...');

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      defaultViewport: null,
      protocolTimeout: 60000,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

    // Capture console logs from page
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[Puppeteer Console ${type}]`, text);
    });

    console.log('[Detect Lines] Setting content...');

    // Match imageGenerator timing strategy
    const navigationPromise = page.waitForNavigation({
      waitUntil: 'load',
      timeout: 30000
    }).catch(() => {}); // Ignore navigation timeout

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await navigationPromise;

    console.log('[Detect Lines] Waiting for fonts...');

    // Wait for fonts to load (matching imageGenerator)
    await page.evaluateHandle('document.fonts.ready');

    console.log('[Detect Lines] Waiting for detection...');

    // Wait for line detection to complete
    await page.waitForFunction(
      () => window.lineDetectionResult !== null,
      { timeout: 15000 }
    );

    // Take screenshot for debugging
    const screenshotPath = path.join(process.cwd(), 'public', 'output', 'debug-line-detection.png') as `${string}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('[Detect Lines] Debug screenshot saved to:', screenshotPath);

    // Get computed style info for debugging
    const layoutInfo = await page.evaluate(() => {
      const title = document.querySelector('.title') as HTMLElement;
      const container = document.querySelector('.container') as HTMLElement;
      const cardContainer = document.querySelector('.card-container') as HTMLElement;

      return {
        titleWidth: title?.offsetWidth,
        containerWidth: container?.offsetWidth,
        containerPaddingLeft: container ? getComputedStyle(container).paddingLeft : null,
        containerPaddingRight: container ? getComputedStyle(container).paddingRight : null,
        cardWidth: cardContainer?.offsetWidth,
        titleComputedStyle: title ? {
          fontSize: getComputedStyle(title).fontSize,
          fontFamily: getComputedStyle(title).fontFamily,
          letterSpacing: getComputedStyle(title).letterSpacing,
        } : null
      };
    });
    console.log('[Detect Lines] Layout info:', layoutInfo);

    // Get result
    const result = await page.evaluate(() => window.lineDetectionResult);

    console.log('[Detect Lines] Result:', result);

    await browser.close();

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Line detection failed - no result returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lineCount: result.lineCount,
        lines: result.lines,
      },
    });

  } catch (error) {
    console.error('[Detect Lines] Error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[Detect Lines] Error closing browser:', closeError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect lines',
      },
      { status: 500 }
    );
  }
}
