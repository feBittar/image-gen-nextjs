'use client';

import * as React from 'react';
import { ModuleFormProps } from '../types';
import { FreeTextData } from './schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { FontSizePicker } from '@/components/editor/FontSizePicker';
import { SpecialPositionSelector } from '@/components/editor/SpecialPositionSelector';

/**
 * FreeText Module Form Component
 */
export function FreeTextForm({ watch, setValue, register }: ModuleFormProps<FreeTextData>) {
  const count = watch('count' as any) || 3;
  const texts = watch('texts' as any) || [];

  return (
    <div className="space-y-6">
      {/* Count Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Number of Free Texts</Label>
          <span className="text-sm text-muted-foreground">{count}</span>
        </div>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[count]}
          onValueChange={([value]) => setValue('count' as any, value)}
        />
        <p className="text-xs text-muted-foreground">
          Freely positioned text elements (CTAs, labels, etc.)
        </p>
      </div>

      {/* Free Text Elements Accordion */}
      <div className="space-y-2">
        <Label>Free Text Elements</Label>
        <Accordion type="single" collapsible className="w-full">
          {Array.from({ length: count }, (_, i) => {
            const textNum = i + 1;
            const text = texts[i] || {};
            const content = text.content || '';
            const specialPosition = text.specialPosition || 'none';
            const specialPadding = text.specialPadding || 8;
            const isUsingSpecialPosition = specialPosition && specialPosition !== 'none';

            return (
              <AccordionItem key={textNum} value={`text-${textNum}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>Free Text {textNum}</span>
                    {content && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        ({content})
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Text Content */}
                    <div className="space-y-2">
                      <Label htmlFor={`texts.${i}.content`}>Text</Label>
                      <Input
                        id={`texts.${i}.content`}
                        {...(register ? register(`texts.${i}.content` as any) : {})}
                        placeholder="Enter free text"
                        defaultValue={content}
                        onChange={(e) => setValue(`texts.${i}.content` as any, e.target.value)}
                      />
                    </div>

                    {/* Special Position Selector */}
                    <SpecialPositionSelector
                      position={specialPosition}
                      padding={specialPadding}
                      onPositionChange={(value) =>
                        setValue(`texts.${i}.specialPosition` as any, value)
                      }
                      onPaddingChange={(value) =>
                        setValue(`texts.${i}.specialPadding` as any, value)
                      }
                    />

                    {/* Manual Position Controls - Only show when not using special position */}
                    {!isUsingSpecialPosition && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Manual Position</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`texts.${i}.position.top`} className="text-xs">
                              Top
                            </Label>
                            <Input
                              id={`texts.${i}.position.top`}
                              {...(register ? register(`texts.${i}.position.top` as any) : {})}
                              placeholder="e.g., 50px or 10%"
                              defaultValue={text.position?.top || ''}
                              onChange={(e) =>
                                setValue(`texts.${i}.position.top` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`texts.${i}.position.left`} className="text-xs">
                              Left
                            </Label>
                            <Input
                              id={`texts.${i}.position.left`}
                              {...(register ? register(`texts.${i}.position.left` as any) : {})}
                              placeholder="e.g., 50px or 10%"
                              defaultValue={text.position?.left || ''}
                              onChange={(e) =>
                                setValue(`texts.${i}.position.left` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`texts.${i}.position.width`} className="text-xs">
                              Width (optional)
                            </Label>
                            <Input
                              id={`texts.${i}.position.width`}
                              {...(register ? register(`texts.${i}.position.width` as any) : {})}
                              placeholder="e.g., 200px or auto"
                              defaultValue={text.position?.width || ''}
                              onChange={(e) =>
                                setValue(`texts.${i}.position.width` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`texts.${i}.position.height`} className="text-xs">
                              Height (optional)
                            </Label>
                            <Input
                              id={`texts.${i}.position.height`}
                              {...(register ? register(`texts.${i}.position.height` as any) : {})}
                              placeholder="e.g., auto"
                              defaultValue={text.position?.height || ''}
                              onChange={(e) =>
                                setValue(`texts.${i}.position.height` as any, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Styling */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Text Style</Label>

                      {/* Font Size */}
                      <FontSizePicker
                        value={text.style?.fontSize || '16px'}
                        onChange={(value) => setValue(`texts.${i}.style.fontSize` as any, value)}
                      />

                      {/* Font Weight */}
                      <div className="space-y-2">
                        <Label htmlFor={`texts.${i}.style.fontWeight`} className="text-xs">
                          Font Weight
                        </Label>
                        <Input
                          id={`texts.${i}.style.fontWeight`}
                          {...(register ? register(`texts.${i}.style.fontWeight` as any) : {})}
                          placeholder="e.g., 400, 600, bold"
                          defaultValue={text.style?.fontWeight || '600'}
                          onChange={(e) =>
                            setValue(`texts.${i}.style.fontWeight` as any, e.target.value)
                          }
                        />
                      </div>

                      {/* Text Color */}
                      <ColorPicker
                        label="Text Color"
                        color={text.style?.color || '#ffffff'}
                        onChange={(value) => setValue(`texts.${i}.style.color` as any, value)}
                      />
                    </div>

                    {/* Background Styling */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Background Highlight</Label>

                      {/* Background Color */}
                      <ColorPicker
                        label="Background Color"
                        color={text.backgroundColor || 'transparent'}
                        onChange={(value) =>
                          setValue(`texts.${i}.backgroundColor` as any, value)
                        }
                      />

                      {/* Background Padding */}
                      <div className="space-y-2">
                        <Label htmlFor={`texts.${i}.backgroundPadding`} className="text-xs">
                          Padding
                        </Label>
                        <Input
                          id={`texts.${i}.backgroundPadding`}
                          {...(register ? register(`texts.${i}.backgroundPadding` as any) : {})}
                          placeholder="e.g., 10px 20px"
                          defaultValue={text.backgroundPadding || '10px 20px'}
                          onChange={(e) =>
                            setValue(`texts.${i}.backgroundPadding` as any, e.target.value)
                          }
                        />
                      </div>

                      {/* Border Radius */}
                      <div className="space-y-2">
                        <Label htmlFor={`texts.${i}.borderRadius`} className="text-xs">
                          Border Radius
                        </Label>
                        <Input
                          id={`texts.${i}.borderRadius`}
                          {...(register ? register(`texts.${i}.borderRadius` as any) : {})}
                          placeholder="e.g., 6px"
                          defaultValue={text.borderRadius || '6px'}
                          onChange={(e) =>
                            setValue(`texts.${i}.borderRadius` as any, e.target.value)
                          }
                        />
                      </div>
                    </div>
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
