'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { StyledToggle } from '@/components/ui/styled-toggle';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { useModularStore, useIsCarouselMode } from '@/lib/store/modularStore';
import { Image as ImageIcon, Info } from 'lucide-react';

interface FreeImageFormProps {
  className?: string;
}

/**
 * FreeImageForm - Configuration for free image in carousel mode
 *
 * Features:
 * - Toggle enable/disable free image
 * - Image URL input with preview
 * - Position controls (offset X/Y, scale, rotation)
 * - Outline effect configuration
 * - Only visible when in carousel mode (2+ slides)
 */
export function FreeImageForm({ className }: FreeImageFormProps) {
  const isCarouselMode = useIsCarouselMode();
  const freeImage = useModularStore((state) => state.freeImage);
  const updateFreeImage = useModularStore((state) => state.updateFreeImage);
  const slidesCount = useModularStore((state) => state.slides.length);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update preview when URL changes
  useEffect(() => {
    if (freeImage.url && freeImage.url.trim()) {
      setImagePreview(freeImage.url);
    } else {
      setImagePreview(null);
    }
  }, [freeImage.url]);

  // Don't render if not in carousel mode
  if (!isCarouselMode) {
    return null;
  }

  const handleUpdateOutlineEffect = (updates: Partial<typeof freeImage.outlineEffect>) => {
    updateFreeImage({
      outlineEffect: {
        ...freeImage.outlineEffect,
        ...updates,
      },
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Imagem Livre (Carrossel)</span>
          <div className="flex items-center gap-2">
            <Label>Ativada</Label>
            <StyledToggle
              checked={freeImage.enabled}
              onCheckedChange={(enabled) => updateFreeImage({ enabled })}
            />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200 text-blue-900">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Imagem Livre - Modo Carrossel</p>
              <p className="text-xs">
                Esta imagem aparece centralizada entre os {slidesCount} slides do carrossel,
                conectando-os visualmente. Ideal para elementos como "VS", setas, ou ícones de transição.
              </p>
            </div>
          </div>
        </Alert>

        {/* Image URL */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Configuração da Imagem</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="free-image-url">URL da Imagem</Label>
            <Input
              id="free-image-url"
              type="text"
              value={freeImage.url}
              onChange={(e) => updateFreeImage({ url: e.target.value })}
              placeholder="Ex: /images/vs.png ou https://..."
              disabled={!freeImage.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Imagem PNG que aparecerá centralizada entre os slides do carrossel
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && freeImage.enabled && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Label className="text-xs mb-2 block">Preview</Label>
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Free image preview"
                  className="max-h-32 rounded border border-border"
                  onError={() => setImagePreview(null)}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Transform Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Transformações da Imagem</Label>

          {/* Offset X */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="free-image-offset-x" className="text-xs">
                Deslocamento Horizontal
              </Label>
              <span className="text-xs text-muted-foreground">
                {freeImage.offsetX}px
              </span>
            </div>
            <Slider
              id="free-image-offset-x"
              min={-500}
              max={500}
              step={1}
              value={[freeImage.offsetX]}
              onValueChange={([value]) => updateFreeImage({ offsetX: value })}
              disabled={!freeImage.enabled}
            />
          </div>

          {/* Offset Y */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="free-image-offset-y" className="text-xs">
                Deslocamento Vertical
              </Label>
              <span className="text-xs text-muted-foreground">
                {freeImage.offsetY}px
              </span>
            </div>
            <Slider
              id="free-image-offset-y"
              min={-500}
              max={500}
              step={1}
              value={[freeImage.offsetY]}
              onValueChange={([value]) => updateFreeImage({ offsetY: value })}
              disabled={!freeImage.enabled}
            />
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="free-image-scale" className="text-xs">Escala</Label>
              <span className="text-xs text-muted-foreground">
                {freeImage.scale}%
              </span>
            </div>
            <Slider
              id="free-image-scale"
              min={50}
              max={200}
              step={5}
              value={[freeImage.scale]}
              onValueChange={([value]) => updateFreeImage({ scale: value })}
              disabled={!freeImage.enabled}
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="free-image-rotation" className="text-xs">
                Rotação
              </Label>
              <span className="text-xs text-muted-foreground">
                {freeImage.rotation}°
              </span>
            </div>
            <Slider
              id="free-image-rotation"
              min={-180}
              max={180}
              step={5}
              value={[freeImage.rotation]}
              onValueChange={([value]) => updateFreeImage({ rotation: value })}
              disabled={!freeImage.enabled}
            />
          </div>
        </div>

        <Separator />

        {/* Outline Effect */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Efeito de Contorno</h3>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Ativado</Label>
              <StyledToggle
                checked={freeImage.outlineEffect.enabled}
                onCheckedChange={(enabled) => handleUpdateOutlineEffect({ enabled })}
                disabled={!freeImage.enabled}
              />
            </div>
          </div>

          {freeImage.outlineEffect.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Outline Color */}
              <div className="space-y-2">
                <Label htmlFor="free-image-outline-color" className="text-xs">
                  Cor do Contorno
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="free-image-outline-color"
                    type="color"
                    value={freeImage.outlineEffect.color}
                    onChange={(e) => handleUpdateOutlineEffect({ color: e.target.value })}
                    disabled={!freeImage.enabled}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={freeImage.outlineEffect.color}
                    onChange={(e) => handleUpdateOutlineEffect({ color: e.target.value })}
                    disabled={!freeImage.enabled}
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Outline Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="free-image-outline-size" className="text-xs">
                    Tamanho do Contorno
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {freeImage.outlineEffect.size}px
                  </span>
                </div>
                <Slider
                  id="free-image-outline-size"
                  min={0}
                  max={50}
                  step={1}
                  value={[freeImage.outlineEffect.size]}
                  onValueChange={([value]) => handleUpdateOutlineEffect({ size: value })}
                  disabled={!freeImage.enabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Info */}
        {freeImage.enabled && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-900">
            <p className="font-medium mb-2">Imagem Livre Ativa</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Viewport: {slidesCount * 1080}×1440px ({slidesCount} slides)</li>
              <li>Posição: Centralizada entre todos os slides</li>
              <li>Z-index: 100 (acima de todo o conteúdo)</li>
              <li>Output: {slidesCount} arquivos PNG separados</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
