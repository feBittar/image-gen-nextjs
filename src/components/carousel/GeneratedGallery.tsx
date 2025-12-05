'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  CheckCircle2,
  XCircle,
  FileArchive,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GeneratedImage {
  slideNumber: number;
  imageUrl: string;
  status: 'success' | 'error';
  error?: string;
  text1?: string;
}

export interface GeneratedGalleryProps {
  images: GeneratedImage[];
  onDownloadAll?: () => void;
  isDownloadingAll?: boolean;
}

export function GeneratedGallery({
  images,
  onDownloadAll,
  isDownloadingAll = false,
}: GeneratedGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  const successfulImages = images.filter((img) => img.status === 'success');
  const failedImages = images.filter((img) => img.status === 'error');

  const handleDownloadImage = async (imageUrl: string, slideNumber: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-slide-${slideNumber}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Generated Images</CardTitle>
            <Badge variant="secondary">
              {successfulImages.length} / {images.length}
            </Badge>
            {failedImages.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {failedImages.length} failed
              </Badge>
            )}
          </div>

          {successfulImages.length > 0 && onDownloadAll && (
            <Button
              onClick={onDownloadAll}
              disabled={isDownloadingAll}
              size="sm"
              className="gap-2"
            >
              {isDownloadingAll ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <FileArchive className="h-4 w-4" />
                  Download All as ZIP
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Instagram-style grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.slideNumber}
              image={image}
              onDownload={handleDownloadImage}
            />
          ))}
        </div>

        {/* Error summary if any */}
        {failedImages.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">
                  {failedImages.length} slide{failedImages.length !== 1 ? 's' : ''} failed
                </h4>
                <div className="space-y-1 text-sm text-red-700">
                  {failedImages.map((img) => (
                    <p key={img.slideNumber}>
                      Slide {img.slideNumber}: {img.error || 'Unknown error'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageCardProps {
  image: GeneratedImage;
  onDownload: (imageUrl: string, slideNumber: number) => void;
}

function ImageCard({ image, onDownload }: ImageCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  if (image.status === 'error') {
    return (
      <div className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-red-50 border-2 border-red-200">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <XCircle className="h-8 w-8 text-red-600 mb-2" />
          <p className="text-sm font-medium text-red-900 mb-1">
            Slide {image.slideNumber}
          </p>
          <p className="text-xs text-red-700 line-clamp-3">
            {image.error || 'Failed to generate'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Image
        src={image.imageUrl}
        alt={`Carousel slide ${image.slideNumber}`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      />

      {/* Success indicator */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className="bg-white/90 text-slate-900 hover:bg-white">
          #{image.slideNumber}
        </Badge>
      </div>

      <div className="absolute top-2 right-2 z-10">
        <div className="rounded-full bg-green-500/90 p-1">
          <CheckCircle2 className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Hover overlay with download button */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent',
          'flex flex-col items-center justify-end p-4',
          'transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        {image.text1 && (
          <p className="text-xs text-white/90 text-center line-clamp-2 mb-3">
            {image.text1}
          </p>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDownload(image.imageUrl, image.slideNumber)}
          className="gap-2 bg-white/90 hover:bg-white w-full"
        >
          <Download className="h-3 w-3" />
          Download
        </Button>
      </div>
    </div>
  );
}
