'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Type, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types matching the carousel data structure
export interface CarouselSlide {
  text1: string;
  text2?: string;
  layout: 'stack-img' | 'stack-img-bg' | 'ff_stack1' | 'ff_stack1-b' | 'ff_stack2' | 'ff_stack2-b';
  imageSrc?: string;
  customImageUrl?: string;
}

export interface SlidePreviewGridProps {
  slides: CarouselSlide[];
  className?: string;
  onCustomImageChange?: (slideIndex: number, imageUrl: string) => void;
}

export function SlidePreviewGrid({ slides, className, onCustomImageChange }: SlidePreviewGridProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Slide Preview
        </h3>
        <Badge variant="secondary" className="text-xs">
          {slides.length} slide{slides.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slides.map((slide, index) => (
          <SlidePreviewCard
            key={index}
            slide={slide}
            slideNumber={index + 1}
            slideIndex={index}
            onCustomImageChange={onCustomImageChange}
          />
        ))}
      </div>
    </div>
  );
}

interface SlidePreviewCardProps {
  slide: CarouselSlide;
  slideNumber: number;
  slideIndex: number;
  onCustomImageChange?: (slideIndex: number, imageUrl: string) => void;
}

function SlidePreviewCard({ slide, slideNumber, slideIndex, onCustomImageChange }: SlidePreviewCardProps) {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(slide.customImageUrl || '');

  const hasImage = slide.layout === 'stack-img-bg' && slide.imageSrc;
  const hasText2 = slide.text2 && slide.text2.trim().length > 0;
  const hasCustomImage = !!slide.customImageUrl;

  const handleSaveImageUrl = () => {
    if (onCustomImageChange && imageUrlInput.trim()) {
      onCustomImageChange(slideIndex, imageUrlInput.trim());
    }
    setIsEditingImage(false);
  };

  const handleCancelEdit = () => {
    setImageUrlInput(slide.customImageUrl || '');
    setIsEditingImage(false);
  };

  const handleRemoveCustomImage = () => {
    if (onCustomImageChange) {
      onCustomImageChange(slideIndex, '');
      setImageUrlInput('');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Instagram 3:4 aspect ratio container */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 border-b">
        {/* Slide number badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-white/90 text-slate-900 hover:bg-white">
            #{slideNumber}
          </Badge>
        </div>

        {/* Layout indicator badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant={hasImage ? 'default' : 'secondary'}
            className="text-xs"
          >
            {hasImage ? (
              <ImageIcon className="h-3 w-3 mr-1" />
            ) : (
              <Type className="h-3 w-3 mr-1" />
            )}
            {slide.layout === 'stack-img-bg' ? 'Image BG' : 'Text Only'}
          </Badge>
        </div>

        {/* Custom image indicator */}
        {hasCustomImage && (
          <div className="absolute top-12 right-2 z-10">
            <Badge variant="default" className="text-xs bg-green-600">
              <ImageIcon className="h-3 w-3 mr-1" />
              Custom
            </Badge>
          </div>
        )}

        {/* Content preview */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center space-y-2 w-full">
            {/* text1 preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 line-clamp-3">
                {slide.text1}
              </p>
            </div>

            {/* text2 preview if exists */}
            {hasText2 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                <p className="text-xs text-slate-700 line-clamp-2">
                  {slide.text2}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Background pattern for image slides */}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
        )}
      </div>

      {/* Card footer with details and custom image button */}
      <CardContent className="p-3 bg-white space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">Slide {slideNumber}</span>
          <span className="text-slate-500">
            {slide.text1.length} chars
          </span>
        </div>

        {/* Custom image input */}
        {!isEditingImage ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingImage(true)}
              className="flex-1 h-8 text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              {hasCustomImage ? 'Edit Image' : 'Custom Image'}
            </Button>
            {hasCustomImage && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveCustomImage}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveImageUrl}
                disabled={!imageUrlInput.trim()}
                className="flex-1 h-7 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
