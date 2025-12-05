'use client';

import * as React from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { Switch } from '@/components/ui/switch';

interface GradientOverlay {
  enabled?: boolean;
  color?: string;
  startOpacity?: number;
  midOpacity?: number;
  height?: number;
  direction?: 'to top' | 'to bottom' | 'to right' | 'to left';
}

export interface CardGradientEditorProps<T extends Record<string, any>> {
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  fieldName?: string;
  label?: string;
}

const directionOptions = [
  { value: 'to top', label: 'Bottom → Top' },
  { value: 'to bottom', label: 'Top → Bottom' },
  { value: 'to left', label: 'Right → Left' },
  { value: 'to right', label: 'Left → Right' },
];

export function CardGradientEditor<T extends Record<string, any>>({
  watch,
  setValue,
  fieldName = 'cardGradientOverlay',
  label = 'Card Gradient'
}: CardGradientEditorProps<T>) {
  const gradient: GradientOverlay = (watch(fieldName as any) || {}) as GradientOverlay;
  const enabled = gradient.enabled || false;
  const color = gradient.color || '#000000';
  const startOpacity = gradient.startOpacity !== undefined ? gradient.startOpacity : 0.7;
  const midOpacity = gradient.midOpacity !== undefined ? gradient.midOpacity : 0.4;
  const height = gradient.height || 60;
  const direction = gradient.direction || 'to top';

  const updateGradient = (field: string, value: any) => {
    setValue(fieldName as any, {
      ...gradient,
      [field]: value,
    } as any);
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor={`${fieldName}-enabled`}>Enable {label}</Label>
        <Switch
          id={`${fieldName}-enabled`}
          checked={enabled}
          onCheckedChange={(checked) => updateGradient('enabled', checked)}
        />
      </div>

      {enabled && (
        <>
          {/* Gradient Color */}
          <ColorPicker
            label="Gradient Color"
            color={color}
            onChange={(value) => updateGradient('color', value)}
          />

          {/* Start Opacity */}
          <div className="space-y-2">
            <Label>Start Opacity (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={Math.round(startOpacity * 100)}
              onChange={(e) => updateGradient('startOpacity', Number(e.target.value) / 100)}
            />
          </div>

          {/* Mid Opacity */}
          <div className="space-y-2">
            <Label>Mid Opacity (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={Math.round(midOpacity * 100)}
              onChange={(e) => updateGradient('midOpacity', Number(e.target.value) / 100)}
            />
          </div>

          {/* Gradient Height */}
          <div className="space-y-2">
            <Label>Gradient Height (%)</Label>
            <Input
              type="number"
              min={10}
              max={100}
              value={height}
              onChange={(e) => updateGradient('height', Number(e.target.value))}
            />
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select
              value={direction}
              onValueChange={(value) => updateGradient('direction', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                {directionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
