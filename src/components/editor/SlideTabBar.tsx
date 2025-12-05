'use client';

import * as React from 'react';
import { useModularStore } from '@/lib/store/modularStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideTabBarProps {
  className?: string;
}

/**
 * SlideTabBar - Tab bar for managing multiple slides in carousel mode
 *
 * Features:
 * - Shows all slides with tabs
 * - Active slide indicator
 * - Add new slide button (+)
 * - Remove slide button (×) on each tab (minimum 1 slide)
 * - Duplicate current slide button
 * - Always visible (even with 1 slide)
 */
export function SlideTabBar({ className }: SlideTabBarProps) {
  const slides = useModularStore((state) => state.slides);
  const currentSlideIndex = useModularStore((state) => state.currentSlideIndex);
  const setCurrentSlideIndex = useModularStore((state) => state.setCurrentSlideIndex);
  const addSlide = useModularStore((state) => state.addSlide);
  const removeSlide = useModularStore((state) => state.removeSlide);
  const duplicateSlide = useModularStore((state) => state.duplicateSlide);

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('Você precisa ter pelo menos 1 slide.');
      return;
    }

    if (window.confirm(`Remover o Slide ${index + 1}? Esta ação não pode ser desfeita.`)) {
      removeSlide(index);
    }
  };

  const handleDuplicateSlide = () => {
    duplicateSlide(currentSlideIndex);
    // Switch to the newly duplicated slide (last slide)
    setTimeout(() => {
      setCurrentSlideIndex(slides.length);
    }, 0);
  };

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b bg-muted/30', className)}>
      {/* Slide Tabs */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium text-muted-foreground mr-2 flex-shrink-0">
          Editando:
        </span>

        <div className="flex items-center gap-1 p-1 bg-background border rounded-md flex-1 min-w-0 overflow-x-auto">
          {slides.map((slide, index) => (
            <Button
              key={slide.id}
              variant={currentSlideIndex === index ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentSlideIndex(index)}
              className={cn(
                'gap-2 min-w-[90px] relative group flex-shrink-0',
                currentSlideIndex === index && 'shadow-sm'
              )}
            >
              <Badge
                variant={currentSlideIndex === index ? 'secondary' : 'outline'}
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center flex-shrink-0"
              >
                {index + 1}
              </Badge>
              <span className="truncate">Slide {index + 1}</span>

              {/* Remove button (only show if more than 1 slide) */}
              {slides.length > 1 && (
                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSlide(index);
                  }}
                  className={cn(
                    'absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground',
                    'flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/90 cursor-pointer'
                  )}
                  title={`Remover Slide ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </div>
              )}
            </Button>
          ))}

          {/* Add Slide Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addSlide}
            className="gap-1 flex-shrink-0"
            title="Adicionar novo slide"
          >
            <Plus className="h-3 w-3" />
            Novo
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        {/* Duplicate Current Slide */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicateSlide}
          className="gap-2"
          title={`Duplicar Slide ${currentSlideIndex + 1}`}
        >
          <Copy className="h-3 w-3" />
          Duplicar
        </Button>

        {/* Slide Counter */}
        <div className="text-xs text-muted-foreground px-2 py-1 bg-background border rounded">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </div>
      </div>
    </div>
  );
}
