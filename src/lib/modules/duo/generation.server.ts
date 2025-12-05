/**
 * Duo Module - Server-side generation logic
 *
 * This file contains Node.js-specific code for image generation.
 * It should only be imported in API routes, not in client components.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { GenerationOptions, GenerationResult } from '../types';

/**
 * Modify generation to create 2 separate PNG files
 *
 * This function:
 * 1. Takes 2 screenshots with clip regions (0-1080px and 1080-2160px)
 * 2. Saves them as separate PNG files
 * 3. Returns buffers and file paths for both slides
 */
export async function duoModifyGeneration(
  page: unknown,
  options: GenerationOptions
): Promise<GenerationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const puppeteerPage = page as any; // Type assertion for Puppeteer Page
  const { outputDir, filePrefix } = options;

  // Ensure output directory exists
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }

  // Generate filenames
  const timestamp = Date.now();
  const slide1Filename = `${filePrefix}-duo-${timestamp}-1.png`;
  const slide2Filename = `${filePrefix}-duo-${timestamp}-2.png`;

  const slide1Path = path.join(outputDir, slide1Filename);
  const slide2Path = path.join(outputDir, slide2Filename);

  console.log('[Duo Module] Capturing slide 1 (0-1080px)...');

  // Capture Slide 1 (left half: 0-1080px)
  const slide1Buffer = await puppeteerPage.screenshot({
    path: slide1Path,
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1440 },
  });

  console.log('[Duo Module] Capturing slide 2 (1080-2160px)...');

  // Capture Slide 2 (right half: 1080-2160px)
  const slide2Buffer = await puppeteerPage.screenshot({
    path: slide2Path,
    type: 'png',
    clip: { x: 1080, y: 0, width: 1080, height: 1440 },
  });

  console.log('[Duo Module] Screenshots completed');

  return {
    images: [slide1Buffer, slide2Buffer],
    filePaths: [slide1Path, slide2Path],
  };
}
