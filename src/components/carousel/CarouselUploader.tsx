'use client';

import * as React from 'react';
import { Upload, FileJson, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  error?: string;
}

export function CarouselUploader({
  onFileSelect,
  selectedFile,
  error,
}: CarouselUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed transition-all',
          'hover:border-blue-400 hover:bg-blue-50/50',
          isDragging && 'border-blue-500 bg-blue-50',
          selectedFile && !error && 'border-green-400 bg-green-50/30',
          error && 'border-red-400 bg-red-50/30',
          !selectedFile && !isDragging && 'border-slate-300 bg-slate-50/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload JSON file"
        />

        <div className="flex flex-col items-center justify-center px-6 py-10">
          {selectedFile && !error ? (
            <>
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-5 w-5 text-green-600" />
                <span className="font-medium text-slate-900">
                  {selectedFile.name}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Click to select a different file
              </p>
            </>
          ) : error ? (
            <>
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="font-medium text-red-900 mb-2">Error</p>
              <p className="text-sm text-red-600 text-center max-w-md">
                {error}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Click to select a different file
              </p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-slate-900 mb-2">
                Upload Carousel JSON
              </p>
              <p className="text-sm text-slate-600 mb-4">
                Drag and drop your JSON file here, or click to browse
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileJson className="h-4 w-4" />
                <span>Accepts .json files only</span>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedFile && !error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="mt-0.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium text-blue-900">File ready for processing</p>
            <p className="text-blue-700 mt-0.5">
              Select a highlight color and click Generate to create your carousel images
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
