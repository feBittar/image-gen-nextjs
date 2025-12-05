'use client';

import * as React from 'react';
import { ModuleFormProps } from '../types';
import { ContentImageData } from './schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StyledToggle } from '@/components/ui/styled-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploadInput } from '@/components/editor/FileUploadInput';
import { Separator } from '@/components/ui/separator';
import { ALIGN_SELF_OPTIONS } from '@/lib/constants/formOptions';
import { useModularStore } from '@/lib/store/modularStore';

const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover (fill container, may crop)' },
  { value: 'contain', label: 'Contain (fit inside, may letterbox)' },
  { value: 'fill', label: 'Fill (stretch to fill)' },
];

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

const MODE_OPTIONS = [
  { value: 'single', label: 'Single Image' },
  { value: 'comparison', label: 'Comparison (2 images)' },
];

/**
 * Content Image Module Form Component
 * Allows configuration of content images with single or comparison mode
 */
export function ContentImageForm({ watch, setValue, fieldPrefix = 'contentImage' }: ModuleFormProps<any>) {
  const contentImage = (watch(fieldPrefix) || {}) as ContentImageData;

  // Get card layout direction from current slide
  const slides = useModularStore((state) => state.slides);
  const currentSlideIndex = useModularStore((state) => state.currentSlideIndex);
  const currentSlide = slides[currentSlideIndex];
  const cardLayoutDirection = (currentSlide?.data?.card as any)?.layoutDirection || 'column';
  const isHorizontalLayout = cardLayoutDirection === 'row';

  const updateField = (field: keyof ContentImageData, value: any) => {
    // ModularFormBuilder's setValue expects field name relative to the module
    // NOT with module prefix, so we pass just the field name
    setValue(field as any, value);
  };

  const updateShadow = (field: string, value: any) => {
    const currentShadow = contentImage.shadow || {
      enabled: false,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    };
    setValue('shadow' as any, {
      ...currentShadow,
      [field]: value,
    });
  };

  // File upload handler (would need to be implemented)
  const handleFileUpload = async (file: File): Promise<string> => {
    // TODO: Implement actual file upload to server
    // For now, create a local object URL
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Content Image */}
      <div className="flex items-center justify-between">
        <Label>Enable Content Image</Label>
        <StyledToggle
          checked={contentImage.enabled ?? true}
          onCheckedChange={(checked) => updateField('enabled', checked)}
        />
      </div>

      {contentImage.enabled !== false && (
        <>
          {/* Display Mode */}
          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select
              value={contentImage.mode ?? 'single'}
              onValueChange={(value) => updateField('mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Layout Horizontal - Only show when card layout is horizontal */}
          {isHorizontalLayout && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold">Layout Horizontal</h3>

              {/* Width */}
              <div className="space-y-2">
                <Label htmlFor="contentImage-layoutWidth">Largura</Label>
                <Input
                  id="contentImage-layoutWidth"
                  type="text"
                  value={contentImage.layoutWidth ?? '50%'}
                  onChange={(e) => updateField('layoutWidth', e.target.value)}
                  placeholder="50%"
                />
                <p className="text-xs text-muted-foreground">
                  Valores CSS: %, px, em, etc.
                </p>
              </div>

              {/* Align Self */}
              <div className="space-y-2">
                <Label>Alinhamento (Align-Self)</Label>
                <Select
                  value={contentImage.alignSelf ?? 'stretch'}
                  onValueChange={(value) => updateField('alignSelf', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o alinhamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGN_SELF_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />
            </>
          )}

          {/* Single Image URL */}
          <FileUploadInput
            label={contentImage.mode === 'comparison' ? 'Image 1 URL' : 'Image URL'}
            value={contentImage.url ?? ''}
            onChange={(value) => updateField('url', value)}
            onUpload={handleFileUpload}
            placeholder="Enter image URL or upload file"
          />

          {/* Second Image URL (only in comparison mode) */}
          {contentImage.mode === 'comparison' && (
            <FileUploadInput
              label="Image 2 URL"
              value={contentImage.url2 ?? ''}
              onChange={(value) => updateField('url2', value)}
              onUpload={handleFileUpload}
              placeholder="Enter second image URL or upload file"
            />
          )}

          {/* Comparison Gap (only in comparison mode) */}
          {contentImage.mode === 'comparison' && (
            <div className="space-y-2">
              <Label htmlFor="contentImage-gap">Gap Between Images (px)</Label>
              <Input
                id="contentImage-gap"
                type="number"
                min={0}
                max={100}
                step={5}
                value={contentImage.comparisonGap ?? 40}
                onChange={(e) => updateField('comparisonGap', Number(e.target.value))}
              />
            </div>
          )}

          {/* Dimensions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Dimensions</h3>

            {/* Max Width */}
            <div className="space-y-2">
              <Label htmlFor="contentImage-maxWidth">Max Width (%)</Label>
              <Input
                id="contentImage-maxWidth"
                type="number"
                min={10}
                max={100}
                step={5}
                value={contentImage.maxWidth ?? 100}
                onChange={(e) => updateField('maxWidth', Number(e.target.value))}
              />
            </div>

            {/* Max Height */}
            <div className="space-y-2">
              <Label htmlFor="contentImage-maxHeight">Max Height (%)</Label>
              <Input
                id="contentImage-maxHeight"
                type="number"
                min={10}
                max={100}
                step={5}
                value={contentImage.maxHeight ?? 100}
                onChange={(e) => updateField('maxHeight', Number(e.target.value))}
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label htmlFor="contentImage-borderRadius">Border Radius (px)</Label>
              <Input
                id="contentImage-borderRadius"
                type="number"
                min={0}
                max={100}
                step={1}
                value={contentImage.borderRadius ?? 20}
                onChange={(e) => updateField('borderRadius', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Image Fit & Position Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Image Fit & Position</h3>

            {/* Object Fit */}
            <div className="space-y-2">
              <Label>Object Fit</Label>
              <Select
                value={contentImage.objectFit ?? 'cover'}
                onValueChange={(value) => updateField('objectFit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fit mode" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECT_FIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label>Vertical Position</Label>
              <Select
                value={contentImage.position ?? 'center'}
                onValueChange={(value) => updateField('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shadow Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Shadow</h3>
              <StyledToggle
                checked={contentImage.shadow?.enabled ?? false}
                onCheckedChange={(checked) => updateShadow('enabled', checked)}
              />
            </div>

            {contentImage.shadow?.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shadow-blur">Blur (px)</Label>
                  <Input
                    id="shadow-blur"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={contentImage.shadow.blur ?? 20}
                    onChange={(e) => updateShadow('blur', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shadow-spread">Spread (px)</Label>
                  <Input
                    id="shadow-spread"
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={contentImage.shadow.spread ?? 0}
                    onChange={(e) => updateShadow('spread', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shadow-color">Shadow Color</Label>
                  <Input
                    id="shadow-color"
                    type="text"
                    value={contentImage.shadow.color ?? 'rgba(0, 0, 0, 0.3)'}
                    onChange={(e) => updateShadow('color', e.target.value)}
                    placeholder="rgba(0, 0, 0, 0.3)"
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
