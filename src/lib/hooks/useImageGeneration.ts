import { useState, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { ImageGenerationData } from '@/lib/types';

interface UseImageGenerationReturn {
  previewUrl: string | null;
  fullImageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  generatePreview: (data: ImageGenerationData) => Promise<void> | undefined;
  generateImage: (data: ImageGenerationData) => Promise<string | null>;
  clearPreview: () => void;
  clearError: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate preview image with debouncing
  const generatePreviewInternal = useCallback(async (data: ImageGenerationData) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Skip if no text content at all
    const hasText = data.title || data.text1 || data.text2 || data.text3 || data.text4 || data.text5;
    if (!hasText) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          preview: true, // Flag for preview mode (could be used for lower quality/faster generation)
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to generate preview: ${response.statusText}`);
      }

      // Response is JSON with { success, data: { url } }
      const result = await response.json();

      if (!result.success || !result.data?.url) {
        throw new Error('Failed to generate image');
      }

      // Use the URL directly
      const imageUrl = result.data.url;

      setPreviewUrl(imageUrl);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        // Ignore abort errors
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to generate preview');
      }
      setPreviewUrl(null);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [previewUrl]);

  // Debounced preview generation (500ms)
  const generatePreview = useDebouncedCallback(generatePreviewInternal, 500);

  // Generate full-quality image (no debouncing)
  const generateImage = useCallback(async (data: ImageGenerationData): Promise<string | null> => {
    // Cancel any pending preview requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate at least one text field exists
    const hasText = data.title || data.text1 || data.text2 || data.text3 || data.text4 || data.text5;
    if (!hasText) {
      setError('At least one text field is required');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          preview: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to generate image: ${response.statusText}`);
      }

      // Response is JSON with { success, data: { url } }
      const result = await response.json();

      if (!result.success || !result.data?.url) {
        throw new Error('Failed to generate image');
      }

      const imageUrl = result.data.url;

      setFullImageUrl(imageUrl);
      setError(null);

      return imageUrl;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate image');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Clear preview
  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    previewUrl,
    fullImageUrl,
    isGenerating,
    error,
    generatePreview,
    generateImage,
    clearPreview,
    clearError,
  };
}
