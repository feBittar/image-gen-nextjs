'use client';

import React from 'react';
import { ModuleFormProps } from '../types';
import { CornersData } from './schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { ColorPicker } from '@/components/editor/ColorPicker';
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

// Corner type options
const cornerTypeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Text', value: 'text' },
  { label: 'SVG', value: 'svg' },
];

// Special position options
const specialPositionOptions = [
  { label: 'Default Position', value: 'none' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

// Position labels for each corner
const positionLabels: Record<number, string> = {
  1: 'Top Left',
  2: 'Top Right',
  3: 'Bottom Left',
  4: 'Bottom Right',
};

interface CornerEditorSectionProps {
  cornerIndex: number;
  watch: ModuleFormProps<CornersData>['watch'];
  setValue: ModuleFormProps<CornersData>['setValue'];
  logos: Array<{ name: string; url: string }>;
}

function CornerEditorSection({ cornerIndex, watch, setValue, logos }: CornerEditorSectionProps) {
  const fontOptions = getFontOptions();
  const cornerNum = cornerIndex + 1;

  const corner = watch(`corners.${cornerIndex}` as any);
  const cornerType = corner?.type || 'none';
  const cornerText = corner?.text || '';
  const cornerTextStyle = corner?.textStyle || {};
  const cornerBackgroundEnabled = corner?.backgroundEnabled || false;
  const cornerSvgUrl = corner?.svgUrl || '';
  const cornerSvgColor = corner?.svgColor || '#ffffff';
  const cornerSvgWidth = corner?.svgWidth ?? '';
  const cornerSvgHeight = corner?.svgHeight ?? '';
  const cornerSpecialPosition = corner?.specialPosition || 'none';
  const cornerPaddingX = corner?.paddingX ?? 40;
  const cornerPaddingY = corner?.paddingY ?? 40;

  return (
    <div className="space-y-4">
      {/* Corner Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={cornerType}
          onValueChange={(value) => setValue(`corners.${cornerIndex}.type` as any, value)}
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
              onChange={(e) => setValue(`corners.${cornerIndex}.text` as any, e.target.value)}
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={cornerTextStyle.fontFamily || 'Arial Black'}
              onValueChange={(value) =>
                setValue(`corners.${cornerIndex}.textStyle.fontFamily` as any, value)
              }
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
                onChange={(e) =>
                  setValue(`corners.${cornerIndex}.textStyle.fontSize` as any, e.target.value)
                }
                placeholder="32px"
              />
            </div>
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={cornerTextStyle.fontWeight || '900'}
                onValueChange={(value) =>
                  setValue(`corners.${cornerIndex}.textStyle.fontWeight` as any, value)
                }
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
            onChange={(color) =>
              setValue(`corners.${cornerIndex}.textStyle.color` as any, color)
            }
          />

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">
              {cornerTextStyle.textDecoration === 'underline'
                ? 'Disable Underline'
                : 'Enable Underline'}
            </Label>
            <StyledToggle
              checked={cornerTextStyle.textDecoration === 'underline'}
              onCheckedChange={(checked) =>
                setValue(
                  `corners.${cornerIndex}.textStyle.textDecoration` as any,
                  checked ? 'underline' : 'none'
                )
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">
              {cornerBackgroundEnabled ? 'Disable Background' : 'Enable Background'}
            </Label>
            <StyledToggle
              checked={cornerBackgroundEnabled}
              onCheckedChange={(checked) => {
                setValue(`corners.${cornerIndex}.backgroundEnabled` as any, checked);
                if (!checked) {
                  // Clear background styles when disabled
                  setValue(`corners.${cornerIndex}.textStyle.backgroundColor` as any, undefined);
                  setValue(`corners.${cornerIndex}.textStyle.padding` as any, undefined);
                }
              }}
            />
          </div>

          {cornerBackgroundEnabled && (
            <>
              <ColorPicker
                label="Background Color"
                color={cornerTextStyle.backgroundColor || '#ff00cc'}
                onChange={(color) =>
                  setValue(`corners.${cornerIndex}.textStyle.backgroundColor` as any, color)
                }
              />
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input
                  value={cornerTextStyle.padding || '5px 15px'}
                  onChange={(e) =>
                    setValue(`corners.${cornerIndex}.textStyle.padding` as any, e.target.value)
                  }
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
              onValueChange={(value) => setValue(`corners.${cornerIndex}.svgUrl` as any, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select SVG..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {logos.map((logo) => (
                  <SelectItem key={logo.url} value={logo.url}>
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
                onChange={(e) =>
                  setValue(`corners.${cornerIndex}.svgWidth` as any, e.target.value)
                }
                placeholder="auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={cornerSvgHeight}
                onChange={(e) =>
                  setValue(`corners.${cornerIndex}.svgHeight` as any, e.target.value)
                }
                placeholder="auto"
              />
            </div>
          </div>

          <ColorPicker
            label="SVG Color"
            color={cornerSvgColor}
            onChange={(color) => setValue(`corners.${cornerIndex}.svgColor` as any, color)}
          />
        </>
      )}

      {/* Position settings (for all types except none) */}
      {cornerType !== 'none' && (
        <>
          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={cornerSpecialPosition}
                  onValueChange={(value) =>
                    setValue(`corners.${cornerIndex}.specialPosition` as any, value)
                  }
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {cornerSpecialPosition.includes('left') || cornerNum === 1 || cornerNum === 3
                      ? 'Left'
                      : 'Right'}{' '}
                    (px)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    value={cornerPaddingX}
                    onChange={(e) =>
                      setValue(`corners.${cornerIndex}.paddingX` as any, Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {cornerSpecialPosition.includes('top') || cornerNum === 1 || cornerNum === 2
                      ? 'Top'
                      : 'Bottom'}{' '}
                    (px)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    value={cornerPaddingY}
                    onChange={(e) =>
                      setValue(`corners.${cornerIndex}.paddingY` as any, Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Corners Module Form Component
 */
export function CornersForm({ watch, setValue }: ModuleFormProps<CornersData>) {
  const { logos, loading } = useLogosFetch();

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Configure up to 4 corner elements (text or SVG) positioned at the edges of the viewport.
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="corner-1">
          <AccordionTrigger>
            <span className="font-medium">Corner 1 - {positionLabels[1]}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <CornerEditorSection
                cornerIndex={0}
                watch={watch}
                setValue={setValue}
                logos={logos}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="corner-2">
          <AccordionTrigger>
            <span className="font-medium">Corner 2 - {positionLabels[2]}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <CornerEditorSection
                cornerIndex={1}
                watch={watch}
                setValue={setValue}
                logos={logos}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="corner-3">
          <AccordionTrigger>
            <span className="font-medium">Corner 3 - {positionLabels[3]}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <CornerEditorSection
                cornerIndex={2}
                watch={watch}
                setValue={setValue}
                logos={logos}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="corner-4">
          <AccordionTrigger>
            <span className="font-medium">Corner 4 - {positionLabels[4]}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <CornerEditorSection
                cornerIndex={3}
                watch={watch}
                setValue={setValue}
                logos={logos}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading logos...</div>
      )}
    </div>
  );
}
