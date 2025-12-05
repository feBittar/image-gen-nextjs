'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ModuleFormProps } from '../types';
import { DuoModuleConfig, duoModuleDefaults } from './schema';
import { Copy, Image as ImageIcon, Info } from 'lucide-react';

/**
 * Duo Module Form Component
 *
 * Provides UI controls for:
 * - Mode selection (mirror vs independent)
 * - Enabling/disabling the duo module
 * - Uploading center image
 * - Adjusting image position, scale, and rotation
 * - Configuring outline effect
 * - Independent mode: editing data for each slide
 */
export function DuoForm({ watch, setValue, fieldPrefix = 'duo' }: ModuleFormProps) {
  // Get current config from form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = { ...duoModuleDefaults, ...(watch(fieldPrefix as any) || {}) } as DuoModuleConfig;

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateConfig = (updates: Partial<DuoModuleConfig>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(fieldPrefix as any, { ...config, ...updates } as any);
  };

  const updateOutlineEffect = (updates: Partial<DuoModuleConfig['outlineEffect']>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(fieldPrefix as any, {
      ...config,
      outlineEffect: { ...(config.outlineEffect || {}), ...updates },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  const handleCopySlide1ToSlide2 = () => {
    // Get all module data from form
    const allData = watch();

    // Create a copy of slide1 data (all modules except duo)
    const slide1Data: Record<string, unknown> = {};
    Object.keys(allData).forEach((key) => {
      if (key !== 'duo' && key !== fieldPrefix) {
        slide1Data[key] = allData[key];
      }
    });

    // Update slide2 with slide1 data
    updateConfig({
      slides: {
        slide1: config.slides?.slide1,
        slide2: slide1Data,
      },
    });
  };

  // Preview image when URL changes
  React.useEffect(() => {
    if (config.centerImageUrl && config.centerImageUrl.trim()) {
      setImagePreview(config.centerImageUrl);
    } else {
      setImagePreview(null);
    }
  }, [config.centerImageUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Duo Module</span>
          <div className="flex items-center gap-2">
            <Label>Enabled</Label>
            <StyledToggle
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-2">
          <Label htmlFor="duo-mode">Mode</Label>
          <Select
            value={config.mode}
            onValueChange={(value: 'mirror' | 'independent') =>
              updateConfig({ mode: value })
            }
            disabled={!config.enabled}
          >
            <SelectTrigger id="duo-mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mirror">
                Mirror (duplicate content)
              </SelectItem>
              <SelectItem value="independent">
                Independent (different content)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {config.mode === 'mirror'
              ? 'Both slides will show the same content'
              : 'Each slide can have different content'
            }
          </p>
        </div>

        <Separator />

        {/* Center Image Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Center Image</h3>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="duo-center-image">Image URL</Label>
            <Input
              id="duo-center-image"
              type="text"
              value={config.centerImageUrl}
              onChange={(e) => updateConfig({ centerImageUrl: e.target.value })}
              placeholder="Enter image URL or path (e.g., /images/vs.png)"
              disabled={!config.enabled}
            />
            <p className="text-xs text-muted-foreground">
              PNG image that will appear centered between both slides
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Label className="text-xs mb-2 block">Preview</Label>
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Center image preview"
                  className="max-h-32 rounded border border-border"
                  onError={() => setImagePreview(null)}
                />
              </div>
            </div>
          )}

          {/* Image Position Controls */}
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <Label className="text-xs font-semibold">Image Transforms</Label>

            {/* Offset X */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duo-offset-x" className="text-xs">
                  Horizontal Offset
                </Label>
                <span className="text-xs text-muted-foreground">
                  {config.centerImageOffsetX}px
                </span>
              </div>
              <Slider
                id="duo-offset-x"
                min={-500}
                max={500}
                step={1}
                value={[config.centerImageOffsetX]}
                onValueChange={([value]) => updateConfig({ centerImageOffsetX: value })}
                disabled={!config.enabled}
              />
            </div>

            {/* Offset Y */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duo-offset-y" className="text-xs">
                  Vertical Offset
                </Label>
                <span className="text-xs text-muted-foreground">
                  {config.centerImageOffsetY}px
                </span>
              </div>
              <Slider
                id="duo-offset-y"
                min={-500}
                max={500}
                step={1}
                value={[config.centerImageOffsetY]}
                onValueChange={([value]) => updateConfig({ centerImageOffsetY: value })}
                disabled={!config.enabled}
              />
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duo-scale" className="text-xs">Scale</Label>
                <span className="text-xs text-muted-foreground">
                  {config.centerImageScale}%
                </span>
              </div>
              <Slider
                id="duo-scale"
                min={50}
                max={200}
                step={5}
                value={[config.centerImageScale]}
                onValueChange={([value]) => updateConfig({ centerImageScale: value })}
                disabled={!config.enabled}
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="duo-rotation" className="text-xs">
                  Rotation
                </Label>
                <span className="text-xs text-muted-foreground">
                  {config.centerImageRotation}°
                </span>
              </div>
              <Slider
                id="duo-rotation"
                min={-180}
                max={180}
                step={5}
                value={[config.centerImageRotation]}
                onValueChange={([value]) => updateConfig({ centerImageRotation: value })}
                disabled={!config.enabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Outline Effect */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Outline Effect</h3>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Enabled</Label>
              <StyledToggle
                checked={config.outlineEffect.enabled}
                onCheckedChange={(enabled) => updateOutlineEffect({ enabled })}
                disabled={!config.enabled}
              />
            </div>
          </div>

          {config.outlineEffect.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Outline Color */}
              <div className="space-y-2">
                <Label htmlFor="duo-outline-color" className="text-xs">
                  Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="duo-outline-color"
                    type="color"
                    value={config.outlineEffect.color}
                    onChange={(e) => updateOutlineEffect({ color: e.target.value })}
                    disabled={!config.enabled}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.outlineEffect.color}
                    onChange={(e) => updateOutlineEffect({ color: e.target.value })}
                    disabled={!config.enabled}
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Outline Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="duo-outline-size" className="text-xs">
                    Size
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {config.outlineEffect.size}px
                  </span>
                </div>
                <Slider
                  id="duo-outline-size"
                  min={0}
                  max={50}
                  step={1}
                  value={[config.outlineEffect.size]}
                  onValueChange={([value]) => updateOutlineEffect({ size: value })}
                  disabled={!config.enabled}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Independent Mode Section */}
        {config.mode === 'independent' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Independent Slide Configuration</h3>
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <div className="space-y-2 text-sm">
                <p className="font-medium">How Independent Mode Works:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Edit content in the main form - this becomes Slide 1</li>
                  <li>Use the tabs below to configure Slide 2 separately</li>
                  <li>Each slide can have different text, images, and styling</li>
                  <li>Click "Copy Slide 1 to Slide 2" to use Slide 1 as a starting point</li>
                </ul>
              </div>
            </Alert>

            <Tabs defaultValue="slide1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="slide1">Slide 1 (Main Form)</TabsTrigger>
                <TabsTrigger value="slide2">Slide 2 (Custom)</TabsTrigger>
              </TabsList>

              <TabsContent value="slide1" className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Primary Content</Label>
                    <p className="text-xs text-muted-foreground">
                      The content configured in the main editor above will be used for Slide 1.
                      All active modules (text fields, content image, corners, etc.) apply to
                      this slide.
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded bg-background border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong>Current modules active:</strong> Viewport, Text Fields, Content Image,
                      and any other enabled modules.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="slide2" className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Slide 2 Custom Data</Label>
                      <p className="text-xs text-muted-foreground">
                        Slide 2 can have completely different content from Slide 1.
                        You can start by copying Slide 1's configuration and then customize it.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCopySlide1ToSlide2}
                      disabled={!config.enabled}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Slide 1 Configuration to Slide 2
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Slide 2 Data Status</Label>
                      {config.slides?.slide2 ? (
                        <div className="rounded bg-green-50 border border-green-200 p-3">
                          <p className="text-xs text-green-900">
                            <strong>Custom data configured.</strong> Slide 2 will render with
                            its own content.
                          </p>
                          <p className="text-xs text-green-700 mt-2">
                            Modules in Slide 2:{' '}
                            {Object.keys(config.slides.slide2).length > 0
                              ? Object.keys(config.slides.slide2).join(', ')
                              : 'None'}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded bg-amber-50 border border-amber-200 p-3">
                          <p className="text-xs text-amber-900">
                            <strong>No custom data yet.</strong> Slide 2 will mirror Slide 1
                            until you copy or set custom data.
                          </p>
                        </div>
                      )}
                    </div>

                    <Alert className="bg-background">
                      <Info className="h-4 w-4" />
                      <div className="text-xs ml-2">
                        <p className="font-medium mb-1">Advanced Usage:</p>
                        <p className="text-muted-foreground">
                          To customize Slide 2 content in detail, you'll need to modify the
                          slide2 data structure directly in the form state or through the API.
                          A full Slide 2 editor UI is coming in a future update.
                        </p>
                      </div>
                    </Alert>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Info Box */}
        {config.enabled && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
            <p className="font-medium mb-2">Duo Mode Active</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Viewport: 2160x1440px (double width)</li>
              <li>Output: 2 separate PNG files ({config.mode === 'independent' ? 'different content' : 'mirrored content'})</li>
              <li>Center image: z-index 100 (appears above all content)</li>
              {config.mode === 'independent' && (
                <li>Each slide renders independently with its own module data</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
