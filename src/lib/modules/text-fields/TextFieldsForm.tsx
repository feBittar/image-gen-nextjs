'use client';

import React from 'react';
import { ModuleFormProps } from '../types';
import { TextFieldsData } from './schema';
import { Label } from '@/components/ui/label';
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
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { StyledChunksEditor } from '@/components/editor/StyledChunksEditor';
import { SpecialPositionSelector } from '@/components/editor/SpecialPositionSelector';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { getFontOptions } from '@/lib/constants/fonts';
import {
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  VERTICAL_ALIGN_OPTIONS,
  ALIGN_SELF_OPTIONS,
} from '@/lib/constants/formOptions';
import { useModularStore } from '@/lib/store/modularStore';

export function TextFieldsForm({ watch, setValue }: ModuleFormProps<TextFieldsData>) {
  const count = watch('count') as number || 5;
  const gap = watch('gap') as number || 20;
  const verticalAlign = watch('verticalAlign') as 'top' | 'center' | 'bottom' || 'bottom';
  const layoutWidth = watch('layoutWidth') as string || '50%';
  const alignSelf = watch('alignSelf') as 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' || 'stretch';
  const fields = (watch('fields') as any[]) || [];

  // Get card layout direction from current slide
  const slides = useModularStore((state) => state.slides);
  const currentSlideIndex = useModularStore((state) => state.currentSlideIndex);
  const currentSlide = slides[currentSlideIndex];
  const cardLayoutDirection = (currentSlide?.data?.card as any)?.layoutDirection || 'column';
  const isHorizontalLayout = cardLayoutDirection === 'row';

  const fontOptions = getFontOptions();

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Global Settings</h3>

        {/* Number of Fields */}
        <div className="space-y-2">
          <Label>Number of Text Fields</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setValue('count', parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Gap Between Fields */}
        <div className="space-y-2">
          <Label>Gap Between Fields (px)</Label>
          <Input
            type="number"
            min={0}
            max={200}
            value={gap}
            onChange={(e) => setValue('gap', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-2">
          <Label>Vertical Alignment</Label>
          <Select
            value={verticalAlign}
            onValueChange={(value: 'top' | 'center' | 'bottom') =>
              setValue('verticalAlign', value)
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

        {/* Layout Horizontal - Only show when card layout is horizontal */}
        {isHorizontalLayout && (
          <>
            <Separator />
            <h4 className="text-sm font-semibold">Layout Horizontal</h4>

            {/* Width */}
            <div className="space-y-2">
              <Label>Largura (%)</Label>
              <Input
                type="text"
                value={layoutWidth}
                onChange={(e) => setValue('layoutWidth', e.target.value)}
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
                value={alignSelf}
                onValueChange={(value: any) => setValue('alignSelf', value)}
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

            {/* Auto-Sizing Configuration */}
            <h4 className="text-sm font-semibold">Auto-Sizing</h4>
            <p className="text-xs text-muted-foreground">
              Ajusta automaticamente os tamanhos para preencher a mesma altura da imagem.
            </p>

            {/* Auto-Size Mode */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={watch('autoSizeMode') === 'proportional-3-1'}
                  onCheckedChange={(checked) => setValue('autoSizeMode', checked ? 'proportional-3-1' : 'off')}
                />
                <Label>Ativar Auto-Sizing (3:1)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Um texto terá 3x o tamanho dos outros
              </p>
            </div>

            {/* Larger Text Field Selection - Show only when enabled */}
            {watch('autoSizeMode') === 'proportional-3-1' && (
              <div className="space-y-2">
                <Label>Texto em Destaque (3x maior)</Label>
                <Select
                  value={String(watch('autoSizeLargerIndex') ?? 0)}
                  onValueChange={(value) => setValue('autoSizeLargerIndex', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: count }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        Text Field {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Os outros textos terão 1/3 do tamanho deste
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* Individual Text Fields */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Text Fields Configuration</h3>
        <p className="text-xs text-muted-foreground">
          Configure each text field individually. Empty fields won't be rendered.
        </p>

        <Accordion type="multiple" defaultValue={['field-0']} className="w-full">
          {Array.from({ length: count }, (_, index) => {
            const field = fields[index] || {
              content: '',
              style: {},
              styledChunks: [],
              freePosition: false,
              position: { top: '50px', left: '50px' },
              specialPosition: 'none',
              specialPadding: 8,
            };

            const fieldPath = `fields.${index}` as const;
            const contentPath = `${fieldPath}.content` as const;
            const stylePath = `${fieldPath}.style`;
            const chunksPath = `${fieldPath}.styledChunks` as const;

            // Watch field-specific values
            const content = watch(contentPath as any) || '';
            const style = (watch(stylePath as any) as any) || {};
            const chunks = (watch(chunksPath as any) as any[]) || [];
            const freePosition = watch(`${fieldPath}.freePosition` as any) || false;
            const specialPosition = watch(`${fieldPath}.specialPosition` as any) || 'none';
            const specialPadding = watch(`${fieldPath}.specialPadding` as any) || 8;
            const position = (watch(`${fieldPath}.position` as any) as any) || {};
            const isUsingSpecialPosition = specialPosition && specialPosition !== 'none';

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
                        rows={3}
                        className="resize-y"
                      />
                    </div>

                    <Separator />

                    {/* Style Configuration */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Text Style</Label>

                      {/* Font Family */}
                      <div className="space-y-2">
                        <Label className="text-xs">Font Family</Label>
                        <Select
                          value={style.fontFamily || 'Arial'}
                          onValueChange={(value) =>
                            setValue(`${stylePath}.fontFamily` as any, value)
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
                          value={style.fontSize || '24px'}
                          onChange={(e) =>
                            setValue(`${stylePath}.fontSize` as any, e.target.value)
                          }
                          placeholder="e.g., 24px, 2em"
                        />
                      </div>

                      {/* Font Weight & Color */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Font Weight</Label>
                          <Select
                            value={style.fontWeight || '400'}
                            onValueChange={(value) =>
                              setValue(`${stylePath}.fontWeight` as any, value)
                            }
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

                        <ColorPicker
                          label="Text Color"
                          color={style.color || '#000000'}
                          onChange={(value) =>
                            setValue(`${stylePath}.color` as any, value)
                          }
                        />
                      </div>

                      {/* Text Align */}
                      <div className="space-y-2">
                        <Label className="text-xs">Text Alignment</Label>
                        <Select
                          value={style.textAlign || 'left'}
                          onValueChange={(value) =>
                            setValue(`${stylePath}.textAlign` as any, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Alignment" />
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
                          value={style.textTransform || 'none'}
                          onValueChange={(value) =>
                            setValue(`${stylePath}.textTransform` as any, value)
                          }
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
                            onChange={(e) =>
                              setValue(`${stylePath}.letterSpacing` as any, e.target.value)
                            }
                            placeholder="e.g., 2px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Line Height</Label>
                          <Input
                            type="text"
                            value={style.lineHeight || '1.2'}
                            onChange={(e) =>
                              setValue(`${stylePath}.lineHeight` as any, e.target.value)
                            }
                            placeholder="e.g., 1.5, 24px"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Free Position Toggle */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Free Position</Label>
                          <p className="text-xs text-muted-foreground">
                            Position this text anywhere on the screen
                          </p>
                        </div>
                        <Switch
                          checked={freePosition}
                          onCheckedChange={(checked) =>
                            setValue(`${fieldPath}.freePosition` as any, checked)
                          }
                        />
                      </div>

                      {/* Position Controls - Only show when free position is enabled */}
                      {freePosition && (
                        <div className="space-y-4 pl-2 border-l-2 border-muted">
                          {/* Special Position Selector */}
                          <SpecialPositionSelector
                            position={specialPosition}
                            padding={specialPadding}
                            onPositionChange={(value) =>
                              setValue(`${fieldPath}.specialPosition` as any, value)
                            }
                            onPaddingChange={(value) =>
                              setValue(`${fieldPath}.specialPadding` as any, value)
                            }
                          />

                          {/* Manual Position Controls - Only show when not using special position */}
                          {!isUsingSpecialPosition && (
                            <div className="space-y-4">
                              <Label className="text-sm font-medium">Manual Position</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                  <Label className="text-xs">Top</Label>
                                  <Input
                                    type="text"
                                    placeholder="e.g., 50px or 10%"
                                    value={position.top || ''}
                                    onChange={(e) =>
                                      setValue(`${fieldPath}.position.top` as any, e.target.value)
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs">Left</Label>
                                  <Input
                                    type="text"
                                    placeholder="e.g., 50px or 10%"
                                    value={position.left || ''}
                                    onChange={(e) =>
                                      setValue(`${fieldPath}.position.left` as any, e.target.value)
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs">Width (optional)</Label>
                                  <Input
                                    type="text"
                                    placeholder="e.g., 200px or auto"
                                    value={position.width || ''}
                                    onChange={(e) =>
                                      setValue(`${fieldPath}.position.width` as any, e.target.value)
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs">Height (optional)</Label>
                                  <Input
                                    type="text"
                                    placeholder="e.g., auto"
                                    value={position.height || ''}
                                    onChange={(e) =>
                                      setValue(`${fieldPath}.position.height` as any, e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Styled Chunks Editor */}
                    {content && (
                      <div>
                        <StyledChunksEditor
                          fieldName={contentPath}
                          watch={watch}
                          setValue={setValue}
                          chunksPath={chunksPath}
                        />
                      </div>
                    )}
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
