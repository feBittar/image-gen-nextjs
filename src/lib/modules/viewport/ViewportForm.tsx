'use client';

import * as React from 'react';
import { ModuleFormProps } from '../types';
import { ViewportData } from './schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/editor/ColorPicker';
import { FileUploadInput } from '@/components/editor/FileUploadInput';
import { BACKGROUND_TYPE_OPTIONS, GRADIENT_DIRECTION_OPTIONS } from '@/lib/constants/formOptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const LAYOUT_DIRECTION_OPTIONS = [
  { value: 'column', label: 'Vertical (Column)' },
  { value: 'row', label: 'Horizontal (Row)' },
];

const CONTENT_ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'space-between', label: 'Space Between' },
];

const JUSTIFY_CONTENT_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
];

/**
 * Componente de formulário para o módulo Viewport
 * Permite configurar background (cor/imagem), blur, e gradient overlay
 */
export function ViewportForm({ watch, setValue }: ModuleFormProps) {
  // Pega todos os dados do formulário
  const formData = watch() as any;
  const viewport = (formData?.viewport || {}) as Partial<ViewportData>;

  const backgroundType = viewport.backgroundType || 'color';
  const backgroundColor = viewport.backgroundColor || '#ffffff';
  const backgroundImage = viewport.backgroundImage || '';
  const blurEnabled = viewport.blurEnabled || false;
  const blurAmount = viewport.blurAmount || 10;
  const gradientOverlay = viewport.gradientOverlay || {
    enabled: false,
    color: '#000000',
    startOpacity: 0.7,
    midOpacity: 0.3,
    endOpacity: 0,
    height: 50,
    direction: 'to top' as const,
    blendMode: 'normal',
  };

  // Update helper
  const updateViewport = (field: keyof ViewportData, value: unknown) => {
    setValue('viewport' as any, {
      ...viewport,
      [field]: value,
    } as any);
  };

  // Update gradient helper
  const updateGradient = (field: string, value: unknown) => {
    setValue('viewport' as any, {
      ...viewport,
      gradientOverlay: {
        ...gradientOverlay,
        [field]: value,
      },
    } as any);
  };

  // Content wrapper defaults
  const contentWrapper = viewport.contentWrapper || {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    gap: 12,
    layoutDirection: 'column',
    contentAlign: 'stretch',
    justifyContent: 'flex-start',
  };
  const cwPadding = contentWrapper.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  // Update content wrapper helper
  const updateContentWrapper = (field: string, value: unknown) => {
    setValue('viewport' as any, {
      ...viewport,
      contentWrapper: {
        ...contentWrapper,
        [field]: value,
      },
    } as any);
  };

  // Update content wrapper padding helper
  const updateContentWrapperPadding = (side: string, value: number) => {
    setValue('viewport' as any, {
      ...viewport,
      contentWrapper: {
        ...contentWrapper,
        padding: {
          ...cwPadding,
          [side]: value,
        },
      },
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* ========== BACKGROUND SECTION ========== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Background Type */}
          <div className="space-y-2">
            <Label>Tipo de Background</Label>
            <Select
              value={backgroundType}
              onValueChange={(value) => updateViewport('backgroundType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUND_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Color (se tipo = color) */}
          {backgroundType === 'color' && (
            <ColorPicker
              label="Cor de Fundo"
              color={backgroundColor}
              onChange={(value) => updateViewport('backgroundColor', value)}
            />
          )}

          {/* Background Image (se tipo = image) */}
          {backgroundType === 'image' && (
            <FileUploadInput
              label="Imagem de Fundo"
              value={backgroundImage}
              onChange={(value) => updateViewport('backgroundImage', value)}
              placeholder="URL da imagem ou arraste arquivo"
            />
          )}
        </CardContent>
      </Card>

      {/* ========== BLUR OVERLAY SECTION ========== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Blur Overlay</CardTitle>
            <StyledToggle
              checked={blurEnabled}
              onCheckedChange={(checked) => updateViewport('blurEnabled', checked)}
            />
          </div>
        </CardHeader>
        {blurEnabled && (
          <CardContent className="space-y-4 pt-0">
            <Separator className="mb-4" />
            {/* Blur Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Intensidade do Blur</Label>
                <span className="text-sm text-muted-foreground">{blurAmount}px</span>
              </div>
              <Slider
                value={[blurAmount]}
                onValueChange={([value]) => updateViewport('blurAmount', value)}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ========== GRADIENT OVERLAY SECTION ========== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gradient Overlay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Gradient */}
          <div className="flex items-center justify-between">
            <Label htmlFor="gradient-enabled">Habilitar Gradient</Label>
            <StyledToggle
              checked={gradientOverlay.enabled || false}
              onCheckedChange={(checked) => updateGradient('enabled', checked)}
            />
          </div>

          {gradientOverlay.enabled && (
            <>
              {/* Gradient Color */}
              <ColorPicker
                label="Cor do Gradient"
                color={gradientOverlay.color || '#000000'}
                onChange={(value) => updateGradient('color', value)}
              />

              <Separator />

              {/* Start Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacidade Inicial</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((gradientOverlay.startOpacity ?? 0.7) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[(gradientOverlay.startOpacity ?? 0.7) * 100]}
                  onValueChange={([value]) => updateGradient('startOpacity', value / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Mid Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacidade Média</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((gradientOverlay.midOpacity ?? 0.3) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[(gradientOverlay.midOpacity ?? 0.3) * 100]}
                  onValueChange={([value]) => updateGradient('midOpacity', value / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* End Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacidade Final</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((gradientOverlay.endOpacity ?? 0) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[(gradientOverlay.endOpacity ?? 0) * 100]}
                  onValueChange={([value]) => updateGradient('endOpacity', value / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Gradient Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Altura do Gradient</Label>
                  <span className="text-sm text-muted-foreground">
                    {gradientOverlay.height || 50}%
                  </span>
                </div>
                <Slider
                  value={[gradientOverlay.height || 50]}
                  onValueChange={([value]) => updateGradient('height', value)}
                  min={10}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <Label>Direção</Label>
                <Select
                  value={gradientOverlay.direction || 'to top'}
                  onValueChange={(value) => updateGradient('direction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a direção" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_DIRECTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Blend Mode */}
              <div className="space-y-2">
                <Label>Modo de Mesclagem</Label>
                <Select
                  value={gradientOverlay.blendMode || 'normal'}
                  onValueChange={(value) => updateGradient('blendMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o blend mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="overlay">Overlay</SelectItem>
                    <SelectItem value="darken">Darken</SelectItem>
                    <SelectItem value="lighten">Lighten</SelectItem>
                    <SelectItem value="color-dodge">Color Dodge</SelectItem>
                    <SelectItem value="color-burn">Color Burn</SelectItem>
                    <SelectItem value="hard-light">Hard Light</SelectItem>
                    <SelectItem value="soft-light">Soft Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ========== CONTENT WRAPPER SECTION ========== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Wrapper</CardTitle>
          <p className="text-xs text-muted-foreground">
            Configurações do container de conteúdo (usado quando Card está inativo)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Padding */}
          <div className="space-y-2">
            <Label>Padding (px)</Label>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  min={0}
                  value={cwPadding.top ?? 0}
                  onChange={(e) => updateContentWrapperPadding('top', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  min={0}
                  value={cwPadding.right ?? 0}
                  onChange={(e) => updateContentWrapperPadding('right', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  min={0}
                  value={cwPadding.bottom ?? 0}
                  onChange={(e) => updateContentWrapperPadding('bottom', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  min={0}
                  value={cwPadding.left ?? 0}
                  onChange={(e) => updateContentWrapperPadding('left', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Gap */}
          <div className="space-y-2">
            <Label>Gap entre módulos (px)</Label>
            <Input
              type="number"
              min={0}
              value={contentWrapper.gap ?? 12}
              onChange={(e) => updateContentWrapper('gap', Number(e.target.value))}
            />
          </div>

          <Separator />

          {/* Layout Direction */}
          <div className="space-y-2">
            <Label>Direção do Layout</Label>
            <Select
              value={contentWrapper.layoutDirection || 'column'}
              onValueChange={(value) => updateContentWrapper('layoutDirection', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a direção" />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_DIRECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Justify Content */}
          <div className="space-y-2">
            <Label>Alinhamento Vertical (Justify)</Label>
            <Select
              value={contentWrapper.justifyContent || 'flex-start'}
              onValueChange={(value) => updateContentWrapper('justifyContent', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o alinhamento" />
              </SelectTrigger>
              <SelectContent>
                {JUSTIFY_CONTENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Align (for row layout) */}
          {contentWrapper.layoutDirection === 'row' && (
            <div className="space-y-2">
              <Label>Alinhamento dos itens (Row)</Label>
              <Select
                value={contentWrapper.contentAlign || 'stretch'}
                onValueChange={(value) => updateContentWrapper('contentAlign', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o alinhamento" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
