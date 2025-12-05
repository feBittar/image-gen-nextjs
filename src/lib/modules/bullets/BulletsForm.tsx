'use client';

import React from 'react';
import { ModuleFormProps } from '../types';
import { BulletsData } from './schema';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { StyledChunksEditor } from '@/components/editor/StyledChunksEditor';
import { Separator } from '@/components/ui/separator';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { getFontOptions } from '@/lib/constants/fonts';
import {
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
} from '@/lib/constants/formOptions';

export function BulletsForm({ watch, setValue }: ModuleFormProps<BulletsData>) {
  const layout = watch('layout') as 'vertical' | 'horizontal' | 'grid' || 'vertical';
  const gap = watch('gap') as number || 15;
  const itemPadding = watch('itemPadding') as string || '16px 20px';
  const borderRadius = watch('borderRadius') as number || 8;
  const iconSize = watch('iconSize') as number || 48;
  const iconBackgroundColor = watch('iconBackgroundColor') as string || '#000000';
  const iconColor = watch('iconColor') as string || '#FFFFFF';
  const iconGap = watch('iconGap') as number || 16;
  const cardShadow = watch('cardShadow') as string || '0 2px 8px rgba(0, 0, 0, 0.1)';
  const cardMinHeight = watch('cardMinHeight') as number || 0;
  const items = (watch('items') as any[]) || [];

  const fontOptions = getFontOptions();

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Global Settings</h3>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={layout}
            onValueChange={(value: 'vertical' | 'horizontal' | 'grid') =>
              setValue('layout', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical (Stack)</SelectItem>
              <SelectItem value="horizontal">Horizontal (Row)</SelectItem>
              <SelectItem value="grid">Grid (2 columns)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gap Between Cards */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Gap Between Cards</Label>
            <span className="text-sm text-muted-foreground">{gap}px</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[gap]}
            onValueChange={([value]) => setValue('gap', value)}
          />
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Border Radius</Label>
            <span className="text-sm text-muted-foreground">{borderRadius}px</span>
          </div>
          <Slider
            min={0}
            max={50}
            step={2}
            value={[borderRadius]}
            onValueChange={([value]) => setValue('borderRadius', value)}
          />
        </div>

        {/* Item Padding */}
        <div className="space-y-2">
          <Label>Item Padding (CSS)</Label>
          <Input
            type="text"
            value={itemPadding}
            onChange={(e) => setValue('itemPadding', e.target.value)}
            placeholder="e.g., 16px 20px"
          />
          <p className="text-xs text-muted-foreground">
            Format: vertical horizontal (e.g., 16px 20px)
          </p>
        </div>

        {/* Card Shadow */}
        <div className="space-y-2">
          <Label>Card Shadow (CSS)</Label>
          <Input
            type="text"
            value={cardShadow}
            onChange={(e) => setValue('cardShadow', e.target.value)}
            placeholder="e.g., 0 2px 8px rgba(0, 0, 0, 0.1)"
          />
        </div>

        {/* Card Min Height */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Card Minimum Height</Label>
            <span className="text-sm text-muted-foreground">
              {cardMinHeight === 0 ? 'Auto' : `${cardMinHeight}px`}
            </span>
          </div>
          <Slider
            min={0}
            max={200}
            step={10}
            value={[cardMinHeight]}
            onValueChange={([value]) => setValue('cardMinHeight', value)}
          />
        </div>
      </div>

      <Separator />

      {/* Icon Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Icon Settings</h3>

        {/* Icon Size */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Icon Size</Label>
            <span className="text-sm text-muted-foreground">{iconSize}px</span>
          </div>
          <Slider
            min={20}
            max={100}
            step={4}
            value={[iconSize]}
            onValueChange={([value]) => setValue('iconSize', value)}
          />
        </div>

        {/* Icon Colors */}
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Icon Background"
            color={iconBackgroundColor}
            onChange={(value) => setValue('iconBackgroundColor', value)}
          />
          <ColorPicker
            label="Icon Color"
            color={iconColor}
            onChange={(value) => setValue('iconColor', value)}
          />
        </div>

        {/* Icon Gap */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Gap Between Icon & Text</Label>
            <span className="text-sm text-muted-foreground">{iconGap}px</span>
          </div>
          <Slider
            min={0}
            max={50}
            step={2}
            value={[iconGap]}
            onValueChange={([value]) => setValue('iconGap', value)}
          />
        </div>
      </div>

      <Separator />

      {/* Individual Bullets */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Bullet Items</h3>
        <p className="text-xs text-muted-foreground">
          Configure each bullet item individually. Disabled or empty items won't be rendered.
        </p>

        <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
          {items.map((item, index) => {
            const itemPath = `items.${index}`;
            const enabled = watch(`${itemPath}.enabled` as any) ?? true;
            const icon = watch(`${itemPath}.icon` as any) || '';
            const iconType = watch(`${itemPath}.iconType` as any) || 'emoji';
            const text = watch(`${itemPath}.text` as any) || '';
            const backgroundColor = watch(`${itemPath}.backgroundColor` as any) || '#FFFFFF';
            const textStyle = (watch(`${itemPath}.textStyle` as any) as any) || {};

            return (
              <AccordionItem key={`item-${index}`} value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <StyledToggle
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setValue(`${itemPath}.enabled` as any, checked)
                        }
                      />
                    </div>
                    <span>Bullet {index + 1}</span>
                    {text && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({text.substring(0, 15)}{text.length > 15 ? '...' : ''})
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Icon Configuration */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Icon</Label>

                      {/* Icon Type */}
                      <div className="space-y-2">
                        <Label className="text-xs">Icon Type</Label>
                        <Select
                          value={iconType}
                          onValueChange={(value) =>
                            setValue(`${itemPath}.iconType` as any, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emoji">Emoji</SelectItem>
                            <SelectItem value="url">Image URL</SelectItem>
                            <SelectItem value="number">Auto Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Icon Input */}
                      {iconType !== 'number' && (
                        <div className="space-y-2">
                          <Label className="text-xs">
                            {iconType === 'emoji' ? 'Emoji' : 'Image URL'}
                          </Label>
                          <Input
                            type="text"
                            value={icon}
                            onChange={(e) =>
                              setValue(`${itemPath}.icon` as any, e.target.value)
                            }
                            placeholder={
                              iconType === 'emoji'
                                ? 'e.g., ✓, 🎯, ⭐'
                                : 'https://example.com/icon.png'
                            }
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Text Content */}
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        value={text}
                        onChange={(e) => setValue(`${itemPath}.text` as any, e.target.value)}
                        placeholder={`Enter text for bullet ${index + 1}...`}
                        rows={3}
                        className="resize-y"
                      />
                    </div>

                    <Separator />

                    {/* Background Color */}
                    <ColorPicker
                      label="Card Background Color"
                      color={backgroundColor}
                      onChange={(value) =>
                        setValue(`${itemPath}.backgroundColor` as any, value)
                      }
                    />

                    <Separator />

                    {/* Text Style */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Text Style</Label>

                      {/* Font Family */}
                      <div className="space-y-2">
                        <Label className="text-xs">Font Family</Label>
                        <Select
                          value={textStyle.fontFamily || 'Arial'}
                          onValueChange={(value) =>
                            setValue(`${itemPath}.textStyle.fontFamily` as any, value)
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

                      {/* Font Size */}
                      <div className="space-y-2">
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="text"
                          value={textStyle.fontSize || '18px'}
                          onChange={(e) =>
                            setValue(`${itemPath}.textStyle.fontSize` as any, e.target.value)
                          }
                          placeholder="e.g., 18px, 1.2em"
                        />
                      </div>

                      {/* Font Weight & Color */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Font Weight</Label>
                          <Select
                            value={textStyle.fontWeight || '400'}
                            onValueChange={(value) =>
                              setValue(`${itemPath}.textStyle.fontWeight` as any, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_WEIGHT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <ColorPicker
                            label="Text Color"
                            color={textStyle.color || '#000000'}
                            onChange={(value) =>
                              setValue(`${itemPath}.textStyle.color` as any, value)
                            }
                          />
                        </div>
                      </div>

                      {/* Text Align */}
                      <div className="space-y-2">
                        <Label className="text-xs">Text Align</Label>
                        <Select
                          value={textStyle.textAlign || 'left'}
                          onValueChange={(value) =>
                            setValue(`${itemPath}.textStyle.textAlign` as any, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEXT_ALIGN_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Text Transform */}
                      <div className="space-y-2">
                        <Label className="text-xs">Text Transform</Label>
                        <Select
                          value={textStyle.textTransform || 'none'}
                          onValueChange={(value) =>
                            setValue(`${itemPath}.textStyle.textTransform` as any, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEXT_TRANSFORM_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Styled Chunks Editor */}
                    <StyledChunksEditor
                      fieldName={`${itemPath}.text`}
                      watch={watch}
                      setValue={setValue}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
