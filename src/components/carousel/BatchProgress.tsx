'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, XCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlideStatus {
  slideNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface BatchProgressProps {
  currentSlide: number;
  totalSlides: number;
  slideStatuses: SlideStatus[];
  isGenerating: boolean;
}

export function BatchProgress({
  currentSlide,
  totalSlides,
  slideStatuses,
  isGenerating,
}: BatchProgressProps) {
  const progressPercentage = totalSlides > 0
    ? (currentSlide / totalSlides) * 100
    : 0;

  const completedCount = slideStatuses.filter(s => s.status === 'completed').length;
  const errorCount = slideStatuses.filter(s => s.status === 'error').length;
  const processingCount = slideStatuses.filter(s => s.status === 'processing').length;

  if (!isGenerating && slideStatuses.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isGenerating ? (
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            ) : completedCount === totalSlides && errorCount === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <ImageIcon className="h-5 w-5 text-slate-600" />
            )}
            <div>
              <h3 className="font-semibold text-slate-900">
                {isGenerating
                  ? `Generating Slide ${currentSlide} of ${totalSlides}...`
                  : completedCount === totalSlides && errorCount === 0
                  ? 'All slides generated successfully!'
                  : 'Batch generation complete'}
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                {completedCount} completed
                {errorCount > 0 && `, ${errorCount} failed`}
                {processingCount > 0 && `, ${processingCount} processing`}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalSlides}
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} errors
              </Badge>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-slate-600 text-right">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>

        {/* Individual slide statuses - scrollable grid */}
        {slideStatuses.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {slideStatuses.map((slide) => (
                <SlideStatusIndicator key={slide.slideNumber} slide={slide} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SlideStatusIndicatorProps {
  slide: SlideStatus;
}

function SlideStatusIndicator({ slide }: SlideStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (slide.status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          className: 'bg-green-100 border-green-300 text-green-700',
          label: 'Completed',
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          className: 'bg-blue-100 border-blue-300 text-blue-700',
          label: 'Processing',
        };
      case 'error':
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: 'bg-red-100 border-red-300 text-red-700',
          label: 'Error',
        };
      case 'pending':
      default:
        return {
          icon: null,
          className: 'bg-slate-100 border-slate-300 text-slate-600',
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-2 rounded-md border transition-all',
        'hover:scale-105 cursor-default',
        config.className
      )}
      title={`Slide ${slide.slideNumber}: ${config.label}${
        slide.error ? ` - ${slide.error}` : ''
      }`}
    >
      <div className="flex items-center justify-center h-4">
        {config.icon}
      </div>
      <span className="text-xs font-medium mt-0.5">
        {slide.slideNumber}
      </span>
    </div>
  );
}
