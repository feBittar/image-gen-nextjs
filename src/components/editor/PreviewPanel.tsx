'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useEditorStore, selectFormData, selectPreviewVisible } from '@/lib/store';
import { useImageGeneration } from '@/lib/hooks/useImageGeneration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  ZoomIn,
  AlertCircle,
  ImagePlus
} from 'lucide-react';
import { toast } from 'sonner';

export function PreviewPanel() {
  const formData = useEditorStore(selectFormData);
  const previewVisible = useEditorStore(selectPreviewVisible);
  const togglePreview = useEditorStore((state) => state.togglePreview);
  const addGeneratedImage = useEditorStore((state) => state.addGeneratedImage);

  const {
    previewUrl,
    generatePreview,
    generateImage,
    isGenerating,
    error,
    clearError
  } = useImageGeneration();

  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle manual refresh
  const handleRefresh = () => {
    clearError();
    generatePreview(formData);
  };

  // Handle download
  const handleDownload = async () => {
    if (!previewUrl) return;

    setIsDownloading(true);
    try {
      // Generate full-quality image
      const imageUrl = await generateImage(formData);

      if (!imageUrl) {
        toast.error('Failed to generate image');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to gallery
      addGeneratedImage({
        url: imageUrl,
        formData,
        template: formData.template || 'default',
      });

      toast.success('Image downloaded successfully');
    } catch (err) {
      toast.error('Failed to download image');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && 'write' in navigator.clipboard) {
        await (navigator.clipboard as any).write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        toast.success('Image copied to clipboard');
      } else {
        // Fallback: copy image URL as text
        await (navigator as any).clipboard?.writeText?.(previewUrl);
        toast.success('Image URL copied to clipboard');
      }
    } catch (err) {
      toast.error('Failed to copy image');
      console.error(err);
    }
  };

  // Handle add to gallery
  const handleAddToGallery = async () => {
    if (!previewUrl) return;

    try {
      // Generate full-quality image
      const imageUrl = await generateImage(formData);

      if (!imageUrl) {
        toast.error('Failed to generate image');
        return;
      }

      addGeneratedImage({
        url: imageUrl,
        formData,
        template: formData.template || 'default',
      });

      toast.success('Added to gallery');
    } catch (err) {
      toast.error('Failed to add to gallery');
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Preview</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreview}
          aria-label={previewVisible ? 'Hide preview' : 'Show preview'}
        >
          {previewVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Preview Content */}
      {previewVisible && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 p-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isGenerating}
              aria-label="Refresh preview"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              disabled={!previewUrl || isGenerating}
              aria-label="Copy to clipboard"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToGallery}
              disabled={!previewUrl || isGenerating}
              aria-label="Add to gallery"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Gallery
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={!previewUrl || isGenerating || isDownloading}
              className="ml-auto"
              aria-label="Download image"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </div>

          {/* Image Display */}
          <div className="flex-1 overflow-auto p-4">
            <Card className="p-4 bg-muted/50">
              {/* Loading State */}
              {isGenerating && (
                <div className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating preview...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isGenerating && (
                <div className="aspect-[3/4] w-full flex flex-col items-center justify-center gap-4 text-center p-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive mb-2">Failed to generate preview</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Success State */}
              {previewUrl && !isGenerating && !error && (
                <div className="space-y-3">
                  <div
                    className={`relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-background cursor-pointer transition-transform ${
                      isZoomed ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    role="button"
                    aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                  >
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                      priority
                    />
                    {!isZoomed && (
                      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md p-1.5">
                        <ZoomIn className="h-4 w-4 text-foreground/60" />
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>Aspect Ratio: 3:4 (1080x1440)</p>
                    <p className="text-[10px]">Click image to zoom</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!previewUrl && !isGenerating && !error && (
                <div className="aspect-[3/4] w-full flex flex-col items-center justify-center gap-4 text-center p-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">No Preview Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.title
                        ? 'Generating preview...'
                        : 'Add a title to see preview'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Collapsed State */}
      {!previewVisible && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <EyeOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Preview hidden</p>
            <Button
              variant="link"
              size="sm"
              onClick={togglePreview}
              className="mt-2"
            >
              Show preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
