'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const FONT_SIZE_PRESETS = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120
];

interface FontSizePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  min?: number;
  max?: number;
}

export function FontSizePicker({
  value,
  onChange,
  label = 'Font Size',
  min = 1,
  max = 999,
}: FontSizePickerProps) {
  const [inputValue, setInputValue] = React.useState(() => {
    return parseInt(value) || 16;
  });

  // Sync inputValue when value prop changes
  React.useEffect(() => {
    const parsed = parseInt(value) || 16;
    setInputValue(parsed);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw) || 0;
    setInputValue(num);
  };

  const handleInputBlur = () => {
    let finalValue = inputValue;
    if (finalValue < min) finalValue = min;
    if (finalValue > max) finalValue = max;
    setInputValue(finalValue);
    onChange(`${finalValue}px`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
    // Arrow up/down to increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(inputValue + 1, max);
      setInputValue(newValue);
      onChange(`${newValue}px`);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(inputValue - 1, min);
      setInputValue(newValue);
      onChange(`${newValue}px`);
    }
  };

  const handlePresetSelect = (size: number) => {
    setInputValue(size);
    onChange(`${size}px`);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-1">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-20 text-center"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            {FONT_SIZE_PRESETS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => handlePresetSelect(size)}
                className={inputValue === size ? 'bg-accent' : ''}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
