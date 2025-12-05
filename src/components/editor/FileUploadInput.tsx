'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export interface FileUploadInputProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function FileUploadInput({
  label,
  value = '',
  onChange,
  onUpload,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
  maxSize = 5242880, // 5MB
  className,
  disabled = false,
  placeholder = 'Enter URL or drop file',
}: FileUploadInputProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (!onUpload) {
        setError('Upload handler not configured');
        return;
      }

      const file = acceptedFiles[0];
      setIsUploading(true);
      setError(null);

      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || isUploading,
    noClick: true,
    noKeyboard: true,
  });

  const handleClear = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {/* URL Input with Clear button */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Drag and Drop Area */}
      {onUpload && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
            isDragActive && 'border-primary bg-primary/5',
            !isDragActive && 'border-muted-foreground/25 hover:border-muted-foreground/50',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {value && !isUploading ? (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop a new file to replace
                </p>
              </>
            ) : isUploading ? (
              <>
                <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop file here'
                    : 'Drag and drop file here, or'}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={open}
                  disabled={disabled || isUploading}
                >
                  Browse Files
                </Button>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Preview if URL exists */}
      {value && !error && (
        <div className="relative rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={() => setError('Failed to load image')}
          />
        </div>
      )}
    </div>
  );
}
