'use client';

import * as React from 'react';
import { ModuleFormProps } from '../types';
import { SvgElementsData } from './schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { StyledToggle } from '@/components/ui/styled-toggle';
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
import { ColorPicker } from '@/components/editor/ColorPicker';
import { SpecialPositionSelector } from '@/components/editor/SpecialPositionSelector';
import { useLogosFetch } from '@/lib/hooks/useLogosFetch';

/**
 * SVGElements Module Form Component
 */
export function SvgElementsForm({ watch, setValue, register }: ModuleFormProps<SvgElementsData>) {
  const { logos, loading } = useLogosFetch();
  const rawSvgElements = watch('svgElements' as any);
  // Handle both array and object (in case data structure varies)
  const svgElements = Array.isArray(rawSvgElements)
    ? rawSvgElements
    : (rawSvgElements?.svgElements || []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Add positioned SVG elements (icons, decorations, logos) anywhere on the viewport
        </p>
      </div>

      {/* SVG Elements Accordion */}
      <div className="space-y-2">
        <Label>SVG Elements (up to 3)</Label>
        <Accordion type="single" collapsible className="w-full">
          {svgElements.slice(0, 3).map((_: any, i: number) => {
            const svgNum = i + 1;
            const svg = svgElements[i] || {};
            const enabled = svg.enabled || false;
            const svgUrl = svg.svgUrl || '';
            const color = svg.color || '#ffffff';
            const width = svg.width || '100px';
            const height = svg.height || '100px';
            const rotation = svg.rotation || 0;
            const opacity = svg.opacity || 1;
            const specialPosition = svg.specialPosition || 'none';
            const specialPadding = svg.specialPadding || 5;
            const isUsingSpecialPosition = specialPosition && specialPosition !== 'none';

            return (
              <AccordionItem key={svgNum} value={`svg-${svgNum}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>SVG Element {svgNum}</span>
                    {enabled && svgUrl && (
                      <span className="text-xs text-green-600 font-medium">Enabled</span>
                    )}
                    {!enabled && (
                      <span className="text-xs text-muted-foreground">Disabled</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                      <Label>Enable SVG</Label>
                      <StyledToggle
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setValue(`svgElements.${i}.enabled` as any, checked)
                        }
                      />
                    </div>

                    {/* SVG Selector */}
                    <div className="space-y-2">
                      <Label>Select SVG</Label>
                      <Select
                        value={svgUrl || undefined}
                        onValueChange={(value) => setValue(`svgElements.${i}.svgUrl` as any, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loading ? 'Loading SVGs...' : 'Select an SVG'} />
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
                      {svgUrl && svgUrl !== 'none' && (
                        <button
                          type="button"
                          onClick={() => setValue(`svgElements.${i}.svgUrl` as any, '')}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>

                    {/* Color Override */}
                    <ColorPicker
                      label="Color Override"
                      color={color}
                      onChange={(value) => setValue(`svgElements.${i}.color` as any, value)}
                    />

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`svgElements.${i}.width`}>Width</Label>
                        <Input
                          id={`svgElements.${i}.width`}
                          {...(register ? register(`svgElements.${i}.width` as any) : {})}
                          placeholder="e.g., 100px or 10%"
                          defaultValue={width}
                          onChange={(e) => setValue(`svgElements.${i}.width` as any, e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`svgElements.${i}.height`}>Height</Label>
                        <Input
                          id={`svgElements.${i}.height`}
                          {...(register ? register(`svgElements.${i}.height` as any) : {})}
                          placeholder="e.g., 100px or 10%"
                          defaultValue={height}
                          onChange={(e) =>
                            setValue(`svgElements.${i}.height` as any, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Special Position Selector */}
                    <SpecialPositionSelector
                      position={specialPosition}
                      padding={specialPadding}
                      onPositionChange={(value) =>
                        setValue(`svgElements.${i}.specialPosition` as any, value)
                      }
                      onPaddingChange={(value) =>
                        setValue(`svgElements.${i}.specialPadding` as any, value)
                      }
                    />

                    {/* Manual Position Controls - Only show when not using special position */}
                    {!isUsingSpecialPosition && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Manual Position</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`svgElements.${i}.position.top`} className="text-xs">
                              Top
                            </Label>
                            <Input
                              id={`svgElements.${i}.position.top`}
                              {...(register
                                ? register(`svgElements.${i}.position.top` as any)
                                : {})}
                              placeholder="e.g., 50px or 10%"
                              defaultValue={svg.position?.top || ''}
                              onChange={(e) =>
                                setValue(`svgElements.${i}.position.top` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`svgElements.${i}.position.left`} className="text-xs">
                              Left
                            </Label>
                            <Input
                              id={`svgElements.${i}.position.left`}
                              {...(register
                                ? register(`svgElements.${i}.position.left` as any)
                                : {})}
                              placeholder="e.g., 50px or 10%"
                              defaultValue={svg.position?.left || ''}
                              onChange={(e) =>
                                setValue(`svgElements.${i}.position.left` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`svgElements.${i}.position.right`} className="text-xs">
                              Right (optional)
                            </Label>
                            <Input
                              id={`svgElements.${i}.position.right`}
                              {...(register
                                ? register(`svgElements.${i}.position.right` as any)
                                : {})}
                              placeholder="e.g., 50px"
                              defaultValue={svg.position?.right || ''}
                              onChange={(e) =>
                                setValue(`svgElements.${i}.position.right` as any, e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`svgElements.${i}.position.bottom`}
                              className="text-xs"
                            >
                              Bottom (optional)
                            </Label>
                            <Input
                              id={`svgElements.${i}.position.bottom`}
                              {...(register
                                ? register(`svgElements.${i}.position.bottom` as any)
                                : {})}
                              placeholder="e.g., 50px"
                              defaultValue={svg.position?.bottom || ''}
                              onChange={(e) =>
                                setValue(`svgElements.${i}.position.bottom` as any, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rotation Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Rotation</Label>
                        <span className="text-sm text-muted-foreground">{rotation}°</span>
                      </div>
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[rotation]}
                        onValueChange={([value]) =>
                          setValue(`svgElements.${i}.rotation` as any, value)
                        }
                      />
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Opacity</Label>
                        <span className="text-sm text-muted-foreground">
                          {(opacity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[opacity]}
                        onValueChange={([value]) =>
                          setValue(`svgElements.${i}.opacity` as any, value)
                        }
                      />
                    </div>

                    {/* Z-Index Override (Advanced) */}
                    <div className="space-y-2">
                      <Label htmlFor={`svgElements.${i}.zIndexOverride`} className="text-xs">
                        Z-Index Override (optional)
                      </Label>
                      <Input
                        id={`svgElements.${i}.zIndexOverride`}
                        type="number"
                        {...(register
                          ? register(`svgElements.${i}.zIndexOverride` as any, {
                              valueAsNumber: true,
                            })
                          : {})}
                        placeholder="e.g., 25"
                        defaultValue={svg.zIndexOverride || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          setValue(`svgElements.${i}.zIndexOverride` as any, value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Override the default z-index (20) for this SVG
                      </p>
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
