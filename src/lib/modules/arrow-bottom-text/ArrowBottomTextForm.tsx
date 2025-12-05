'use client';

import React from 'react';
import { ModuleFormProps, SpecialPosition } from '../types';
import { ArrowBottomTextData } from './schema';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { SpecialPositionSelector } from '@/components/editor/SpecialPositionSelector';
import { getFontOptions } from '@/lib/constants/fonts';
import { useLogosFetch } from '@/lib/hooks/useLogosFetch';

// Font weight options
const fontWeightOptions = [
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi-Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

// Text transform options
const textTransformOptions = [
  { label: 'None', value: 'none' },
  { label: 'Uppercase', value: 'uppercase' },
  { label: 'Lowercase', value: 'lowercase' },
  { label: 'Capitalize', value: 'capitalize' },
];

// Layout options
const layoutOptions = [
  { label: 'Vertical (Arrow above text)', value: 'vertical' },
  { label: 'Horizontal (Arrow beside text)', value: 'horizontal' },
];

/**
 * Arrow Bottom Text Module Form Component
 */
export function ArrowBottomTextForm({ watch, setValue }: ModuleFormProps<ArrowBottomTextData>) {
  const { logos, loading } = useLogosFetch();
  const fontOptions = getFontOptions();

  // Watch values
  const enabled = watch('enabled') ?? false;
  const arrowImageUrl = watch('arrowImageUrl') || '';
  const arrowColor = watch('arrowColor') || '#ffffff';
  const arrowWidth = watch('arrowWidth') || '80px';
  const arrowHeight = watch('arrowHeight') || 'auto';
  const bottomText = watch('bottomText') || '';
  const bottomTextStyle = watch('bottomTextStyle') || {};
  const specialPosition = watch('specialPosition') || 'bottom-right';
  const padding = watch('padding') ?? 5;
  const gapBetween = watch('gapBetween') ?? 15;
  const layout = watch('layout') || 'vertical';

  // Text style values
  const fontSize = bottomTextStyle.fontSize || '18px';
  const fontSizeValue = parseInt(fontSize.replace('px', '')) || 18;
  const fontWeight = bottomTextStyle.fontWeight || '700';
  const fontFamily = bottomTextStyle.fontFamily || 'Arial';
  const color = bottomTextStyle.color || '#ffffff';
  const textTransform = bottomTextStyle.textTransform || 'uppercase';

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Combo of Arrow (SVG/image) + bottom text, commonly used for CTAs like "swipe up".
      </div>

      {/* Enable/Disable Module */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Enable Arrow + Bottom Text</Label>
          <p className="text-xs text-muted-foreground">
            Show arrow with text overlay
          </p>
        </div>
        <StyledToggle
          checked={enabled}
          onCheckedChange={(checked) => setValue('enabled', checked)}
        />
      </div>

      {enabled && (
        <>
          <Separator className="my-4" />

          {/* Arrow Selection */}
          <div className="space-y-2">
            <Label>Select Arrow</Label>
            <Select
              value={arrowImageUrl || undefined}
              onValueChange={(value) => setValue('arrowImageUrl', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading arrows...' : 'Select an arrow'} />
              </SelectTrigger>
              <SelectContent>
                {logos.map((logo) => (
                  <SelectItem key={logo.url} value={logo.url}>
                    {logo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {arrowImageUrl && (
              <button
                type="button"
                onClick={() => setValue('arrowImageUrl', '')}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {arrowImageUrl && (
            <>
              {/* Arrow Color */}
              <ColorPicker
                label="Arrow Color"
                color={arrowColor}
                onChange={(value) => setValue('arrowColor', value)}
              />

              {/* Arrow Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    value={arrowWidth}
                    onChange={(e) => setValue('arrowWidth', e.target.value)}
                    placeholder="80px"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={arrowHeight}
                    onChange={(e) => setValue('arrowHeight', e.target.value)}
                    placeholder="auto"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Bottom Text */}
              <div className="space-y-2">
                <Label>Bottom Text</Label>
                <Textarea
                  value={bottomText}
                  onChange={(e) => setValue('bottomText', e.target.value)}
                  placeholder="e.g., SAIBA MAIS"
                  rows={2}
                />
              </div>

              {/* Text Style */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-semibold">Text Style</Label>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Font Size</Label>
                    <span className="text-sm text-muted-foreground">{fontSize}</span>
                  </div>
                  <Slider
                    min={12}
                    max={48}
                    step={1}
                    value={[fontSizeValue]}
                    onValueChange={([value]) =>
                      setValue('bottomTextStyle.fontSize', `${value}px`)
                    }
                  />
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={(value) =>
                      setValue('bottomTextStyle.fontFamily', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Weight & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select
                      value={fontWeight}
                      onValueChange={(value) =>
                        setValue('bottomTextStyle.fontWeight', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeightOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <ColorPicker
                    label="Text Color"
                    color={color}
                    onChange={(value) => setValue('bottomTextStyle.color', value)}
                  />
                </div>

                {/* Text Transform */}
                <div className="space-y-2">
                  <Label>Text Transform</Label>
                  <Select
                    value={textTransform}
                    onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') =>
                      setValue('bottomTextStyle.textTransform', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transform" />
                    </SelectTrigger>
                    <SelectContent>
                      {textTransformOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Layout Direction */}
              <div className="space-y-2">
                <Label>Layout Direction</Label>
                <Select
                  value={layout}
                  onValueChange={(value: 'vertical' | 'horizontal') =>
                    setValue('layout', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gap Between Arrow and Text */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Gap Between Arrow and Text</Label>
                  <span className="text-sm text-muted-foreground">{gapBetween}px</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[gapBetween]}
                  onValueChange={([value]) => setValue('gapBetween', value)}
                />
              </div>

              <Separator className="my-4" />

              {/* Position */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Position</Label>
                <SpecialPositionSelector
                  position={specialPosition}
                  padding={padding}
                  onPositionChange={(value) => setValue('specialPosition', value as SpecialPosition)}
                  onPaddingChange={(value) => setValue('padding', value)}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
