'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { StackTemplateFormData } from '@/lib/schemas/stackTemplate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { CardGradientEditor } from './CardGradientEditor';
import { FileUploadInput } from './FileUploadInput';
import { TextFieldEditor } from './TextFieldEditor';
import { SVGPositionEditor } from './SVGPositionEditor';
import { FreeTextEditor } from './FreeTextEditor';
import { SpecialPositionSelector } from './SpecialPositionSelector';
import { getFontOptions } from '@/lib/constants/fonts';
import { usePersistedTab } from '@/lib/hooks';

interface StackFormFieldsProps {
  register: UseFormRegister<StackTemplateFormData>;
  watch: UseFormWatch<StackTemplateFormData>;
  setValue: UseFormSetValue<StackTemplateFormData>;
  handleFileUpload: (file: File) => Promise<string>;
}

// Font weight options for selects
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

export function StackFormFields({
  register,
  watch,
  setValue,
  handleFileUpload,
}: StackFormFieldsProps) {
  // Persisted tab state
  const [activeTab, setActiveTab] = usePersistedTab('stack-editor-tab', 'visual');

  // State for logos/arrows
  const [logos, setLogos] = React.useState<Array<{ name: string; filename: string; url: string; extension: string }>>([]);

  // Fetch logos on mount
  React.useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos');
        if (response.ok) {
          const data = await response.json();
          setLogos(data.logos || []);
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
      }
    };
    fetchLogos();
  }, []);

  // Watch specific values for controlled components
  const backgroundColor = watch('backgroundColor');
  const useCard = watch('useCard');
  const cardWidth = watch('cardWidth');
  const cardHeight = watch('cardHeight');
  const cardBorderRadius = watch('cardBorderRadius');
  const cardBackgroundType = watch('cardBackgroundType');
  const cardBackgroundColor = watch('cardBackgroundColor');
  const cardBackgroundImage = watch('cardBackgroundImage');
  const reverseLayout = watch('reverseLayout');
  const textGap = watch('textGap');
  const textVerticalAlign = watch('textVerticalAlign');
  const textPaddingTop = watch('textPaddingTop') || 0;
  const textPaddingBottom = watch('textPaddingBottom') || 0;
  const textPaddingLeft = watch('textPaddingLeft') || 0;
  const textPaddingRight = watch('textPaddingRight') || 0;
  const contentImageUrl = watch('contentImageUrl');
  const contentImageBorderRadius = watch('contentImageBorderRadius');
  const hideContentImage = watch('hideContentImage');
  const viewportBackgroundType = watch('viewportBackgroundType');
  const viewportBackgroundColor = watch('viewportBackgroundColor');
  const viewportBackgroundImage = watch('viewportBackgroundImage');

  // Arrow watches
  const arrowImageUrl = watch('arrowImageUrl');
  const arrowImageColor = watch('arrowColor') || '#ffffff';
  const arrowContentGap = watch('arrowContentGap') || 20;

  // Bottom text watches
  const bottomTextFontSize = watch('bottomTextStyle.fontSize') || '18px';
  const bottomTextFontSizeValue = parseInt(bottomTextFontSize.replace('px', '')) || 18;
  const bottomTextFontWeight = watch('bottomTextStyle.fontWeight') || '700';
  const bottomTextColor = watch('bottomTextStyle.color') || '#ffffff';
  const bottomTextFontFamily = watch('bottomTextStyle.fontFamily') || 'Arial';
  const bottomTextTextTransform = watch('bottomTextStyle.textTransform') || 'uppercase';
  const bottomTextSpecialPosition = watch('bottomTextSpecialPosition') || 'none';
  const bottomTextSpecialPadding = watch('bottomTextSpecialPadding') || 6;

  // Get font options
  const fontOptions = getFontOptions();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="imagem">Imagem</TabsTrigger>
        <TabsTrigger value="elementos">Elementos</TabsTrigger>
      </TabsList>

      {/* Tab Visual */}
      <TabsContent value="visual">
        <Accordion type="multiple" defaultValue={['card-settings']} className="w-full">
          {/* Card Settings */}
          <AccordionItem value="card-settings">
            <AccordionTrigger>Card Settings</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              Controls the centered card container that holds your text content. The card sits on top of the viewport background.
            </p>

            {/* Use Card Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="useCard">Enable Card Container</Label>
                <p className="text-xs text-muted-foreground">
                  When disabled, content fills the entire viewport
                </p>
              </div>
              <Switch
                id="useCard"
                checked={useCard ?? true}
                onCheckedChange={(checked) => setValue('useCard', checked)}
              />
            </div>

            <Separator className="my-4" />

            {/* Card-specific fields (dimmed when useCard is false) */}
            <div className={useCard === false ? 'opacity-40 pointer-events-none' : ''}>
              {/* Card Width */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Card Width</Label>
                  <span className="text-sm text-muted-foreground">
                    {cardWidth}%
                  </span>
                </div>
                <Slider
                  min={50}
                  max={100}
                  step={1}
                  value={[cardWidth]}
                  onValueChange={([value]) => setValue('cardWidth', value)}
                />
              </div>

              {/* Card Height */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <Label>Card Height</Label>
                  <span className="text-sm text-muted-foreground">
                    {cardHeight}%
                  </span>
                </div>
                <Slider
                  min={50}
                  max={100}
                  step={1}
                  value={[cardHeight]}
                  onValueChange={([value]) => setValue('cardHeight', value)}
                />
              </div>

              {/* Card Border Radius */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <Label>Border Radius</Label>
                  <span className="text-sm text-muted-foreground">
                    {cardBorderRadius}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[cardBorderRadius]}
                  onValueChange={([value]) =>
                    setValue('cardBorderRadius', value)
                  }
                />
              </div>

              {/* Card Background Type Switch */}
              <div className="mt-4 space-y-2">
                <Label>Card Background Type</Label>
                <Select
                  value={cardBackgroundType || 'color'}
                  onValueChange={(value: 'color' | 'image') =>
                    setValue('cardBackgroundType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Solid Color</SelectItem>
                    <SelectItem value="image">Background Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Background Color (only if type is 'color') */}
              {cardBackgroundType === 'color' && (
                <div className="mt-4">
                  <ColorPicker
                    label="Card Background Color"
                    color={cardBackgroundColor}
                    onChange={(value) => setValue('cardBackgroundColor', value)}
                  />
                </div>
              )}

              {/* Card Background Image (only if type is 'image') */}
              {cardBackgroundType === 'image' && (
                <div className="mt-4">
                  <FileUploadInput
                    label="Card Background Image"
                    value={cardBackgroundImage}
                    onChange={(value) => setValue('cardBackgroundImage', value)}
                    onUpload={handleFileUpload}
                  />
                </div>
              )}

              <Separator className="my-4" />

              {/* Reverse Layout */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reverseLayout"
                  {...register('reverseLayout')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="reverseLayout">
                  Reverse Layout (Image on top, text below)
                </Label>
              </div>

              <Separator className="my-4" />

              {/* Card Gradient Overlay */}
              <CardGradientEditor watch={watch} setValue={setValue} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Viewport Background */}
      <AccordionItem value="viewport-background">
        <AccordionTrigger>Viewport Background</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              Controls the full-screen background behind everything. This is completely separate from the card background and content image.
            </p>

            {/* Viewport Background Type Select */}
            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select
                value={viewportBackgroundType || 'color'}
                onValueChange={(value: 'color' | 'image') =>
                  setValue('viewportBackgroundType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="image">Background Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Viewport Background Color (only if type is 'color') */}
            {viewportBackgroundType === 'color' && (
              <div className="mt-4">
                <ColorPicker
                  label="Viewport Background Color"
                  color={viewportBackgroundColor || backgroundColor || '#FF5722'}
                  onChange={(value) => setValue('viewportBackgroundColor', value)}
                />
              </div>
            )}

            {/* Viewport Background Image (only if type is 'image') */}
            {viewportBackgroundType === 'image' && (
              <div className="mt-4">
                <FileUploadInput
                  label="Viewport Background Image"
                  value={viewportBackgroundImage}
                  onChange={(value) => setValue('viewportBackgroundImage', value)}
                  onUpload={handleFileUpload}
                />
              </div>
            )}
          </div>
        </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Textos */}
      <TabsContent value="textos">
        <Accordion type="multiple" defaultValue={['text1']} className="w-full">
          {/* Text Fields */}
          {[1, 2, 3, 4, 5].map((num) => (
            <AccordionItem key={`text${num}`} value={`text${num}`}>
              <AccordionTrigger>Text Field {num}</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <TextFieldEditor
                    fieldName={`text${num}` as any}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {/* Text Spacing */}
          <AccordionItem value="text-spacing">
            <AccordionTrigger>Text Spacing</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Gap Between Text Fields */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Gap Between Text Fields</Label>
                <span className="text-sm text-muted-foreground">
                  {textGap}px
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[textGap]}
                onValueChange={([value]) => setValue('textGap', value)}
              />
            </div>

            {/* Text Vertical Alignment */}
            <div className="space-y-2">
              <Label>Text Vertical Alignment</Label>
              <Select
                value={textVerticalAlign || 'bottom'}
                onValueChange={(value: 'top' | 'center' | 'bottom') =>
                  setValue('textVerticalAlign', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom (Stack from bottom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-4" />

            {/* Text Area Padding */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Text Area Margins</Label>

              {/* Padding Top */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top Margin</Label>
                  <span className="text-sm text-muted-foreground">
                    {textPaddingTop}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={[textPaddingTop]}
                  onValueChange={([value]) => setValue('textPaddingTop', value)}
                />
              </div>

              {/* Padding Bottom */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Bottom Margin</Label>
                  <span className="text-sm text-muted-foreground">
                    {textPaddingBottom}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={[textPaddingBottom]}
                  onValueChange={([value]) => setValue('textPaddingBottom', value)}
                />
              </div>

              {/* Padding Left */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Left Margin</Label>
                  <span className="text-sm text-muted-foreground">
                    {textPaddingLeft}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={[textPaddingLeft]}
                  onValueChange={([value]) => setValue('textPaddingLeft', value)}
                />
              </div>

              {/* Padding Right */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Right Margin</Label>
                  <span className="text-sm text-muted-foreground">
                    {textPaddingRight}px
                  </span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={[textPaddingRight]}
                  onValueChange={([value]) => setValue('textPaddingRight', value)}
                />
              </div>
            </div>

          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Imagem */}
      <TabsContent value="imagem">
        <Accordion type="multiple" defaultValue={['content-image']} className="w-full">
          {/* Content Image */}
          <AccordionItem value="content-image">
            <AccordionTrigger>Content Image</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              The main content image that appears inside the card (when card mode is enabled) or as part of the layout. This is NOT a background image.
            </p>

            <FileUploadInput
              label="Content Image URL"
              value={contentImageUrl}
              onChange={(value) => setValue('contentImageUrl', value)}
              onUpload={handleFileUpload}
            />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">
                  {contentImageBorderRadius}px
                </span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[contentImageBorderRadius || 0]}
                onValueChange={([value]) =>
                  setValue('contentImageBorderRadius', value)
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hideContentImage"
                {...register('hideContentImage')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hideContentImage">Hide Image</Label>
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>

          {/* Arrow SVG */}
          <AccordionItem value="arrow-settings">
            <AccordionTrigger>Arrow SVG (Optional)</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Arrow</Label>
              <Select
                value={arrowImageUrl || undefined}
                onValueChange={(value) => setValue('arrowImageUrl', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an arrow" />
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
                <ColorPicker
                  label="Arrow Color"
                  color={arrowImageColor}
                  onChange={(value) => setValue('arrowColor', value)}
                />

                <Separator className="my-4" />

                <SpecialPositionSelector
                  position={watch('arrowImageSpecialPosition') || 'bottom-right'}
                  padding={watch('arrowImageSpecialPadding') || 5}
                  onPositionChange={(value) => setValue('arrowImageSpecialPosition', value as any)}
                  onPaddingChange={(value) => setValue('arrowImageSpecialPadding', value)}
                />

                {watch('arrowImageSpecialPosition') === 'none' && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Custom Position</Label>
                      <p className="text-xs text-muted-foreground">
                        Set custom position when special position is disabled
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Top (px or %)</Label>
                          <Input
                            {...register('arrowImagePosition.top')}
                            placeholder="e.g., 40px or 5%"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left (px or %)</Label>
                          <Input
                            {...register('arrowImagePosition.left')}
                            placeholder="e.g., 60px or 10%"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Arrow Size Controls */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Arrow Size</Label>
                  <p className="text-xs text-muted-foreground">
                    Control the width and height of the arrow SVG
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width (px or %)</Label>
                      <Input
                        {...register('arrowImagePosition.width')}
                        placeholder="e.g., 100px or 15%"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height (px or %)</Label>
                      <Input
                        {...register('arrowImagePosition.height')}
                        placeholder="e.g., 100px or auto"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Gap from Content Image */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Gap from Content Image</Label>
                    <span className="text-sm text-muted-foreground">{arrowContentGap}px</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum space between the bottom of content image and top of arrow
                  </p>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[arrowContentGap]}
                    onValueChange={([value]) =>
                      setValue('arrowContentGap', value)
                    }
                  />
                </div>

                <Separator className="my-4" />

                {/* Bottom Text (attached to arrow) */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Bottom Text (Attached)</Label>
                    <p className="text-xs text-muted-foreground">
                      Text positioned at the bottom-right of the arrow
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <Input
                      {...register('bottomText')}
                      placeholder="e.g., SAIBA MAIS"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{bottomTextFontSize}</span>
                    </div>
                    <Slider
                      min={12}
                      max={48}
                      step={1}
                      value={[bottomTextFontSizeValue]}
                      onValueChange={([value]) =>
                        setValue('bottomTextStyle.fontSize', `${value}px`)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={bottomTextFontFamily}
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

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Font Weight</Label>
                      <Select
                        value={bottomTextFontWeight}
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
                      color={bottomTextColor}
                      onChange={(value) => setValue('bottomTextStyle.color', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Text Transform</Label>
                    <Select
                      value={bottomTextTextTransform}
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

                  <Separator className="my-2" />

                  {/* Special Positioning */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Special Positioning</Label>
                    <p className="text-xs text-muted-foreground">
                      Quick positioning presets for bottom text (overrides arrow attachment)
                    </p>

                    <SpecialPositionSelector
                      position={bottomTextSpecialPosition}
                      padding={bottomTextSpecialPadding}
                      onPositionChange={(value) => setValue('bottomTextSpecialPosition', value as 'none' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right')}
                      onPaddingChange={(value) => setValue('bottomTextSpecialPadding', value)}
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* Bottom text positioning relative to arrow */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Arrow Attachment</Label>
                    <p className="text-xs text-muted-foreground">
                      Fine-tune position when attached to arrow
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Gap from Arrow</Label>
                        <span className="text-sm text-muted-foreground">{watch('bottomTextGapFromArrow') || 15}px</span>
                      </div>
                      <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={[watch('bottomTextGapFromArrow') || 15]}
                        onValueChange={([value]) =>
                          setValue('bottomTextGapFromArrow', value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Padding Right</Label>
                        <span className="text-sm text-muted-foreground">{watch('bottomTextPaddingRight') || 0}px</span>
                      </div>
                      <Slider
                        min={-50}
                        max={100}
                        step={1}
                        value={[watch('bottomTextPaddingRight') || 0]}
                        onValueChange={([value]) =>
                          setValue('bottomTextPaddingRight', value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Elementos */}
      <TabsContent value="elementos">
        <Accordion type="multiple" defaultValue={['svg1']} className="w-full">
          {/* SVG Element */}
          <AccordionItem value="svg1">
            <AccordionTrigger>SVG Element</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2">
                <SVGPositionEditor
                  svgNumber={1}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Free Text Elements */}
          {[1, 2, 3].map((num) => (
            <AccordionItem key={`freeText${num}`} value={`freeText${num}`}>
              <AccordionTrigger>Free Text {num}</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <FreeTextEditor
                    textNumber={num as 1 | 2 | 3}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
