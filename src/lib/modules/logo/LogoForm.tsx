'use client';

import React, { useState } from 'react';
import { ModuleFormProps } from '../types';
import { LogoData } from './schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { Slider } from '@/components/ui/slider';
import { useLogosFetch } from '@/lib/hooks/useLogosFetch';
import { SPECIAL_POSITION_OPTIONS } from '@/lib/constants/formOptions';

// Filter options
const filterOptions = [
  { label: 'None', value: 'none' },
  { label: 'Grayscale', value: 'grayscale' },
  { label: 'Invert', value: 'invert' },
  { label: 'Brightness', value: 'brightness' },
  { label: 'Contrast', value: 'contrast' },
  { label: 'Sepia', value: 'sepia' },
];

/**
 * Logo Module Form Component
 */
export function LogoForm({ watch, setValue }: ModuleFormProps<LogoData>) {
  const { logos, loading } = useLogosFetch();
  const [showManualPosition, setShowManualPosition] = useState(false);

  const enabled = watch('enabled') ?? false;
  const logoUrl = watch('logoUrl') ?? '';
  const width = watch('width') ?? '120px';
  const height = watch('height') ?? 'auto';
  const specialPosition = watch('specialPosition') ?? 'top-left';
  const paddingX = watch('paddingX') ?? 40;
  const paddingY = watch('paddingY') ?? 40;
  const opacity = watch('opacity') ?? 1;
  const filter = watch('filter') ?? 'none';
  const filterIntensity = watch('filterIntensity') ?? 100;

  // Manual position values
  const top = watch('top');
  const left = watch('left');
  const right = watch('right');
  const bottom = watch('bottom');

  const isManualPosition = specialPosition === 'none';

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Display a logo image positioned anywhere on the viewport with opacity and filter controls.
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <Label className="cursor-pointer">
          {enabled ? 'Disable Logo' : 'Enable Logo'}
        </Label>
        <StyledToggle
          checked={enabled}
          onCheckedChange={(checked) => setValue('enabled', checked)}
        />
      </div>

      {enabled && (
        <>
          {/* Logo Selection */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <Select
              value={logoUrl}
              onValueChange={(value) => setValue('logoUrl', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a logo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {logos.map((logo) => (
                  <SelectItem key={logo.url} value={logo.url}>
                    {logo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && (
              <div className="text-xs text-muted-foreground">Loading logos...</div>
            )}
          </div>

          {/* Logo Preview */}
          {logoUrl && logoUrl !== '' && logoUrl !== 'none' && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground mb-2">Preview:</div>
              <div className="flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="max-w-full max-h-32 object-contain"
                  style={{ opacity }}
                />
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={width}
                onChange={(e) => setValue('width', e.target.value)}
                placeholder="120px or auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={height}
                onChange={(e) => setValue('height', e.target.value)}
                placeholder="auto"
              />
            </div>
          </div>

          {/* Position Toggle */}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={specialPosition}
              onValueChange={(value) => {
                setValue('specialPosition', value as any);
                setShowManualPosition(value === 'none');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPECIAL_POSITION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position Controls */}
          {isManualPosition ? (
            <>
              {/* Manual Position */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="text-sm font-medium">Manual Position</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Top</Label>
                    <Input
                      value={top ?? ''}
                      onChange={(e) => setValue('top', e.target.value || undefined)}
                      placeholder="e.g., 40px or 10%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Left</Label>
                    <Input
                      value={left ?? ''}
                      onChange={(e) => setValue('left', e.target.value || undefined)}
                      placeholder="e.g., 40px or 10%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Right</Label>
                    <Input
                      value={right ?? ''}
                      onChange={(e) => setValue('right', e.target.value || undefined)}
                      placeholder="e.g., 40px or 10%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bottom</Label>
                    <Input
                      value={bottom ?? ''}
                      onChange={(e) => setValue('bottom', e.target.value || undefined)}
                      placeholder="e.g., 40px or 10%"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Set top/bottom and left/right to position the logo. Leave empty for auto positioning.
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Padding Controls (for special positions) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Padding X (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    value={paddingX}
                    onChange={(e) => setValue('paddingX', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Padding Y (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    value={paddingY}
                    onChange={(e) => setValue('paddingY', Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">{Math.round(opacity * 100)}%</span>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={(value) => setValue('opacity', value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Filter */}
          <div className="space-y-2">
            <Label>Filter Effect</Label>
            <Select
              value={filter}
              onValueChange={(value) => setValue('filter', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Intensity (only for brightness/contrast) */}
          {(filter === 'brightness' || filter === 'contrast') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Filter Intensity</Label>
                <span className="text-sm text-muted-foreground">{filterIntensity}%</span>
              </div>
              <Slider
                value={[filterIntensity]}
                onValueChange={(value) => setValue('filterIntensity', value[0])}
                min={0}
                max={200}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
