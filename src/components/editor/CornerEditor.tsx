'use client';

import React from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { getFontOptions } from '@/lib/constants/fonts';

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

// Corner type options
const cornerTypeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Text', value: 'text' },
  { label: 'SVG', value: 'svg' },
];

// Special position options
const specialPositionOptions = [
  { label: 'None', value: 'none' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

const positionLabels: Record<number, string> = {
  1: 'Top Left',
  2: 'Top Right',
  3: 'Bottom Left',
  4: 'Bottom Right',
};

// Generic interface to support any template with corner fields
interface CornerEditorProps<T extends Record<string, unknown> = Record<string, unknown>> {
  cornerNum: 1 | 2 | 3 | 4;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  logos: Array<{ name: string; filename: string; url: string; extension: string }>;
}

export function CornerEditor<T extends Record<string, unknown>>({ cornerNum, watch, setValue, logos }: CornerEditorProps<T>) {
  const fontOptions = getFontOptions();
  const cornerType = (watch as any)(`corner${cornerNum}Type`) as string || 'text';
  const cornerText = (watch as any)(`corner${cornerNum}Text`) as string || '';
  const cornerTextStyle = (watch as any)(`corner${cornerNum}TextStyle`) as Record<string, string> || {};
  const cornerBackgroundEnabled = (watch as any)(`corner${cornerNum}BackgroundEnabled`) === true;
  const cornerSvgUrl = (watch as any)(`corner${cornerNum}SvgUrl`) as string || '';
  const cornerSvgColor = (watch as any)(`corner${cornerNum}SvgColor`) as string || '#ffffff';
  const cornerSvgWidth = (watch as any)(`corner${cornerNum}SvgWidth`) as string || 'auto';
  const cornerSvgHeight = (watch as any)(`corner${cornerNum}SvgHeight`) as string || 'auto';
  const cornerSpecialPosition = (watch as any)(`corner${cornerNum}SpecialPosition`) as string || 'none';
  const cornerPaddingX = (watch as any)(`corner${cornerNum}PaddingX`) as number ?? 40;
  const cornerPaddingY = (watch as any)(`corner${cornerNum}PaddingY`) as number ?? 40;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Corner {cornerNum} ({positionLabels[cornerNum]})</Label>
      </div>

      {/* Corner Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={cornerType}
          onValueChange={(value) => (setValue as any)(`corner${cornerNum}Type`, value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cornerTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text settings (when type is text) */}
      {cornerType === 'text' && (
        <>
          <div className="space-y-2">
            <Label>Text</Label>
            <Input
              value={cornerText}
              onChange={(e) => (setValue as any)(`corner${cornerNum}Text`, e.target.value)}
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={cornerTextStyle.fontFamily || 'Arial Black'}
              onValueChange={(value) => (setValue as any)(`corner${cornerNum}TextStyle.fontFamily`, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Input
                value={cornerTextStyle.fontSize || '32px'}
                onChange={(e) => (setValue as any)(`corner${cornerNum}TextStyle.fontSize`, e.target.value)}
                placeholder="32px"
              />
            </div>
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={cornerTextStyle.fontWeight || '900'}
                onValueChange={(value) => (setValue as any)(`corner${cornerNum}TextStyle.fontWeight`, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeightOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ColorPicker
            label="Text Color"
            color={cornerTextStyle.color || '#000000'}
            onChange={(color) => (setValue as any)(`corner${cornerNum}TextStyle.color`, color)}
          />

          <div className="flex items-center justify-between">
            <Label
              htmlFor={`corner${cornerNum}-underline-switch`}
              className="cursor-pointer"
            >
              {cornerTextStyle.textDecoration === 'underline' ? 'Disable Underline' : 'Enable Underline'}
            </Label>
            <Switch
              id={`corner${cornerNum}-underline-switch`}
              checked={cornerTextStyle.textDecoration === 'underline'}
              onCheckedChange={(checked) => (setValue as any)(`corner${cornerNum}TextStyle.textDecoration`, checked ? 'underline' : 'none')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor={`corner${cornerNum}-bg-switch`}
              className="cursor-pointer"
            >
              {cornerBackgroundEnabled ? 'Disable Background' : 'Enable Background'}
            </Label>
            <Switch
              id={`corner${cornerNum}-bg-switch`}
              checked={cornerBackgroundEnabled}
              onCheckedChange={(checked) => {
                (setValue as any)(`corner${cornerNum}BackgroundEnabled`, checked);
                if (!checked) {
                  // Clear background styles when disabled
                  (setValue as any)(`corner${cornerNum}TextStyle.backgroundColor`, undefined);
                  (setValue as any)(`corner${cornerNum}TextStyle.padding`, undefined);
                }
              }}
            />
          </div>

          {cornerBackgroundEnabled && (
            <>
              <ColorPicker
                label="Background Color"
                color={cornerTextStyle.backgroundColor || '#ff00cc'}
                onChange={(color) => (setValue as any)(`corner${cornerNum}TextStyle.backgroundColor`, color)}
              />
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input
                  value={cornerTextStyle.padding || '5px 15px'}
                  onChange={(e) => (setValue as any)(`corner${cornerNum}TextStyle.padding`, e.target.value)}
                  placeholder="5px 15px"
                />
              </div>
            </>
          )}
        </>
      )}

      {/* SVG settings (when type is svg) */}
      {cornerType === 'svg' && (
        <>
          <div className="space-y-2">
            <Label>SVG</Label>
            <Select
              value={cornerSvgUrl}
              onValueChange={(value) => (setValue as any)(`corner${cornerNum}SvgUrl`, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select SVG..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {logos.map((logo) => (
                  <SelectItem key={logo.filename} value={logo.url}>
                    {logo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={cornerSvgWidth}
                onChange={(e) => (setValue as any)(`corner${cornerNum}SvgWidth`, e.target.value)}
                placeholder="auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={cornerSvgHeight}
                onChange={(e) => (setValue as any)(`corner${cornerNum}SvgHeight`, e.target.value)}
                placeholder="auto"
              />
            </div>
          </div>

          <ColorPicker
            label="SVG Color"
            color={cornerSvgColor}
            onChange={(color) => (setValue as any)(`corner${cornerNum}SvgColor`, color)}
          />
        </>
      )}

      {/* Position settings (for all types except none) */}
      {cornerType !== 'none' && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={cornerSpecialPosition}
                onValueChange={(value) => (setValue as any)(`corner${cornerNum}SpecialPosition`, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialPositionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {cornerSpecialPosition !== 'none' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {cornerSpecialPosition.includes('left') ? 'Left' : 'Right'} (px)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={cornerPaddingX}
                    onChange={(e) => (setValue as any)(`corner${cornerNum}PaddingX`, Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {cornerSpecialPosition.includes('top') ? 'Top' : 'Bottom'} (px)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={cornerPaddingY}
                    onChange={(e) => (setValue as any)(`corner${cornerNum}PaddingY`, Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
