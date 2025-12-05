'use client';

import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ColorPickerProps {
  label?: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ColorPicker({
  label,
  color,
  onChange,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [localColor, setLocalColor] = React.useState(color);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalColor(value);
    // Validate hex color before updating
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-12 h-10 rounded-md border-2 border-input cursor-pointer transition-all hover:scale-105',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ backgroundColor: localColor }}
              disabled={disabled}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={localColor} onChange={handleColorChange} />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hex:</span>
              <Input
                value={localColor}
                onChange={handleInputChange}
                className="h-8 font-mono text-xs"
                placeholder="#000000"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={localColor}
          onChange={handleInputChange}
          className="flex-1 font-mono"
          placeholder="#000000"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
