'use client';

import React from 'react';
import { ModuleFormProps } from '../types';
import { ImageTextBoxData, SPLIT_RATIO_OPTIONS, ORDER_OPTIONS, CONTENT_ALIGN_OPTIONS } from './schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { FileUploadInput } from '@/components/editor/FileUploadInput';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { StyledChunksEditor } from '@/components/editor/StyledChunksEditor';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { getFontOptions } from '@/lib/constants/fonts';
import {
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  VERTICAL_ALIGN_OPTIONS,
} from '@/lib/constants/formOptions';

const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
];

/**
 * Image + Text Box Module Form Component
 */
export function ImageTextBoxForm({ watch, setValue, fieldPrefix = 'imageTextBox' }: ModuleFormProps<any>) {
  const data = (watch(fieldPrefix) || {}) as ImageTextBoxData;
  const fontOptions = getFontOptions();

  // File upload handler
  const handleFileUpload = async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  };

  // Default values for nested configs
  const defaultImageConfig = {
    url: '',
    borderRadius: 20,
    maxWidth: 100,
    maxHeight: 100,
    objectFit: 'cover' as const,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    shadow: {
      enabled: false,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.3)',
    },
  };

  const defaultTextConfig = {
    count: 3,
    gap: 16,
    verticalAlign: 'center' as const,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fields: [] as any[],
  };

  // Helper to update top-level fields
  const updateField = (field: string, value: any) => {
    setValue(field as any, value);
  };

  // Helper to update nested imageConfig
  const updateImageConfig = (field: string, value: any) => {
    const currentConfig = data.imageConfig || defaultImageConfig;
    setValue('imageConfig' as any, {
      ...currentConfig,
      [field]: value,
    });
  };

  // Helper to update nested shadow in imageConfig
  const updateImageShadow = (field: string, value: any) => {
    const currentConfig = data.imageConfig || defaultImageConfig;
    const currentShadow = currentConfig.shadow || defaultImageConfig.shadow;
    setValue('imageConfig' as any, {
      ...currentConfig,
      shadow: {
        ...currentShadow,
        [field]: value,
      },
    });
  };

  // Helper to update nested textConfig
  const updateTextConfig = (field: string, value: any) => {
    const currentConfig = data.textConfig || defaultTextConfig;
    setValue('textConfig' as any, {
      ...currentConfig,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <Label>Enable Image + Text Box</Label>
        <StyledToggle
          checked={data.enabled ?? true}
          onCheckedChange={(checked) => updateField('enabled', checked)}
        />
      </div>

      {data.enabled !== false && (
        <>
          {/* Box Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Box Configuration</h3>

            {/* Width & Height */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="text"
                  value={data.width ?? '100%'}
                  onChange={(e) => updateField('width', e.target.value)}
                  placeholder="e.g., 100%, 500px"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="text"
                  value={data.height ?? '100%'}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder="e.g., 100%, 400px"
                />
              </div>
            </div>

            {/* Split Ratio */}
            <div className="space-y-2">
              <Label>Split Ratio</Label>
              <Select
                value={data.splitRatio ?? '50-50'}
                onValueChange={(value) => updateField('splitRatio', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent>
                  {SPLIT_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Percentage Slider */}
            {data.splitRatio === 'custom' && (
              <div className="space-y-2">
                <Label>Left Side: {data.customLeftPercent ?? 50}%</Label>
                <Slider
                  value={[data.customLeftPercent ?? 50]}
                  onValueChange={([value]) => updateField('customLeftPercent', value)}
                  min={10}
                  max={90}
                  step={5}
                />
              </div>
            )}

            {/* Order */}
            <div className="space-y-2">
              <Label>Order</Label>
              <Select
                value={data.order ?? 'image-left'}
                onValueChange={(value) => updateField('order', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label>Gap Between Sides (px)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.gap ?? 24}
                onChange={(e) => updateField('gap', Number(e.target.value))}
              />
            </div>

            {/* Content Alignment */}
            <div className="space-y-2">
              <Label>Content Alignment</Label>
              <Select
                value={data.contentAlign ?? 'center'}
                onValueChange={(value) => updateField('contentAlign', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_ALIGN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Tabs for Image and Text Configuration */}
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>

            {/* Image Tab */}
            <TabsContent value="image" className="space-y-4">
              <FileUploadInput
                label="Image URL"
                value={data.imageConfig?.url ?? ''}
                onChange={(value) => updateImageConfig('url', value)}
                onUpload={handleFileUpload}
                placeholder="Enter image URL or upload file"
              />

              {/* Padding Individual */}
              <div className="space-y-2">
                <Label>Padding (px)</Label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.imageConfig?.paddingTop ?? 0}
                      onChange={(e) => updateImageConfig('paddingTop', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.imageConfig?.paddingRight ?? 0}
                      onChange={(e) => updateImageConfig('paddingRight', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.imageConfig?.paddingBottom ?? 0}
                      onChange={(e) => updateImageConfig('paddingBottom', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input
                      type="number"
                      min={0}
                      value={data.imageConfig?.paddingLeft ?? 0}
                      onChange={(e) => updateImageConfig('paddingLeft', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Image Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Width (%)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={data.imageConfig?.maxWidth ?? 100}
                    onChange={(e) => updateImageConfig('maxWidth', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Height (%)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={data.imageConfig?.maxHeight ?? 100}
                    onChange={(e) => updateImageConfig('maxHeight', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.imageConfig?.borderRadius ?? 20}
                  onChange={(e) => updateImageConfig('borderRadius', Number(e.target.value))}
                />
              </div>

              {/* Object Fit */}
              <div className="space-y-2">
                <Label>Object Fit</Label>
                <Select
                  value={data.imageConfig?.objectFit ?? 'cover'}
                  onValueChange={(value) => updateImageConfig('objectFit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit" />
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

              {/* Shadow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Shadow</Label>
                  <StyledToggle
                    checked={data.imageConfig?.shadow?.enabled ?? false}
                    onCheckedChange={(checked) => updateImageShadow('enabled', checked)}
                  />
                </div>

                {data.imageConfig?.shadow?.enabled && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label className="text-xs">Blur (px)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={data.imageConfig.shadow.blur ?? 20}
                        onChange={(e) => updateImageShadow('blur', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Spread (px)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        value={data.imageConfig.shadow.spread ?? 0}
                        onChange={(e) => updateImageShadow('spread', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Shadow Color</Label>
                      <Input
                        type="text"
                        value={data.imageConfig.shadow.color ?? 'rgba(0, 0, 0, 0.3)'}
                        onChange={(e) => updateImageShadow('color', e.target.value)}
                        placeholder="rgba(0, 0, 0, 0.3)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4">
              {/* Text Global Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of Text Fields</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={data.textConfig?.count ?? 3}
                    onChange={(e) => updateTextConfig('count', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gap Between Fields (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={data.textConfig?.gap ?? 16}
                    onChange={(e) => updateTextConfig('gap', Number(e.target.value))}
                  />
                </div>

                {/* Padding Individual */}
                <div className="space-y-2">
                  <Label>Padding (px)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Top</Label>
                      <Input
                        type="number"
                        min={0}
                        value={data.textConfig?.paddingTop ?? 0}
                        onChange={(e) => updateTextConfig('paddingTop', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Right</Label>
                      <Input
                        type="number"
                        min={0}
                        value={data.textConfig?.paddingRight ?? 0}
                        onChange={(e) => updateTextConfig('paddingRight', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Bottom</Label>
                      <Input
                        type="number"
                        min={0}
                        value={data.textConfig?.paddingBottom ?? 0}
                        onChange={(e) => updateTextConfig('paddingBottom', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Left</Label>
                      <Input
                        type="number"
                        min={0}
                        value={data.textConfig?.paddingLeft ?? 0}
                        onChange={(e) => updateTextConfig('paddingLeft', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vertical Alignment</Label>
                  <Select
                    value={data.textConfig?.verticalAlign ?? 'center'}
                    onValueChange={(value: 'top' | 'center' | 'bottom') =>
                      updateTextConfig('verticalAlign', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICAL_ALIGN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Individual Text Fields */}
              <Accordion type="multiple" defaultValue={['field-0']} className="w-full">
                {Array.from({ length: data.textConfig?.count ?? 3 }, (_, index) => {
                  const fields = data.textConfig?.fields || [];
                  const field = fields[index] || { content: '', style: {}, styledChunks: [] };
                  const fieldPath = `textConfig.fields.${index}`;
                  const contentPath = `${fieldPath}.content`;
                  const stylePath = `${fieldPath}.style`;
                  const chunksPath = `${fieldPath}.styledChunks`;

                  const content = field.content || '';
                  const style = field.style || {};

                  return (
                    <AccordionItem key={`field-${index}`} value={`field-${index}`}>
                      <AccordionTrigger>
                        Text Field {index + 1}
                        {content && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({content.substring(0, 20)}{content.length > 20 ? '...' : ''})
                          </span>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Content */}
                          <div className="space-y-2">
                            <Label>Text Content</Label>
                            <Textarea
                              value={content}
                              onChange={(e) => setValue(contentPath as any, e.target.value)}
                              placeholder={`Enter text for field ${index + 1}...`}
                              rows={2}
                            />
                          </div>

                          {/* Font Family */}
                          <div className="space-y-2">
                            <Label className="text-xs">Font Family</Label>
                            <Select
                              value={style.fontFamily || 'Arial'}
                              onValueChange={(value) => setValue(`${stylePath}.fontFamily` as any, value)}
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

                          {/* Font Size & Weight */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Font Size</Label>
                              <Input
                                type="text"
                                value={style.fontSize || '24px'}
                                onChange={(e) => setValue(`${stylePath}.fontSize` as any, e.target.value)}
                                placeholder="e.g., 24px"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Font Weight</Label>
                              <Select
                                value={style.fontWeight || '400'}
                                onValueChange={(value) => setValue(`${stylePath}.fontWeight` as any, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Weight" />
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
                          </div>

                          {/* Color & Align */}
                          <div className="grid grid-cols-2 gap-2">
                            <ColorPicker
                              label="Text Color"
                              color={style.color || '#000000'}
                              onChange={(value) => setValue(`${stylePath}.color` as any, value)}
                            />
                            <div className="space-y-2">
                              <Label className="text-xs">Text Align</Label>
                              <Select
                                value={style.textAlign || 'left'}
                                onValueChange={(value) => setValue(`${stylePath}.textAlign` as any, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Align" />
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
                          </div>

                          {/* Text Transform */}
                          <div className="space-y-2">
                            <Label className="text-xs">Text Transform</Label>
                            <Select
                              value={style.textTransform || 'none'}
                              onValueChange={(value) => setValue(`${stylePath}.textTransform` as any, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Transform" />
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

                          {/* Letter Spacing & Line Height */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Letter Spacing</Label>
                              <Input
                                type="text"
                                value={style.letterSpacing || '0'}
                                onChange={(e) => setValue(`${stylePath}.letterSpacing` as any, e.target.value)}
                                placeholder="e.g., 2px"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Line Height</Label>
                              <Input
                                type="text"
                                value={style.lineHeight || '1.2'}
                                onChange={(e) => setValue(`${stylePath}.lineHeight` as any, e.target.value)}
                                placeholder="e.g., 1.5"
                              />
                            </div>
                          </div>

                          {/* Styled Chunks Editor */}
                          {content && (
                            <>
                              <Separator />
                              <StyledChunksEditor
                                fieldName={contentPath}
                                watch={watch}
                                setValue={setValue}
                                chunksPath={chunksPath}
                              />
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
