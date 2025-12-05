'use client';

import * as React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StackTemplateFormData } from '@/lib/schemas/stackTemplate';
import { ColorPicker } from './ColorPicker';
import { SpecialPositionSelector } from './SpecialPositionSelector';

export interface SVGPositionEditorProps {
  svgNumber: 1 | 2;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export function SVGPositionEditor({
  svgNumber,
  register,
  watch,
  setValue,
}: SVGPositionEditorProps) {
  const contentFieldName = `svg${svgNumber}Content` as const;
  const positionFieldName = `svg${svgNumber}Position` as const;
  const colorFieldName = `svg${svgNumber}Color` as const;
  const specialPositionFieldName = `svg${svgNumber}SpecialPosition` as const;
  const specialPaddingFieldName = `svg${svgNumber}SpecialPadding` as const;
  const urlFieldName = `svg${svgNumber}Url` as const;

  // State for logos
  const [logos, setLogos] = React.useState<Array<{ name: string; filename: string; url: string; extension: string }>>([]);
  const [inputMode, setInputMode] = React.useState<'select' | 'custom'>('select');

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

  // Watch values
  const content = watch(contentFieldName);
  const svgUrl = watch(urlFieldName);
  const position = watch(positionFieldName);
  const color = watch(colorFieldName);
  const specialPosition = watch(specialPositionFieldName) || 'none';
  const specialPadding = watch(specialPaddingFieldName) || 8;

  // Determine input mode based on current values
  React.useEffect(() => {
    if (svgUrl && !content) {
      setInputMode('select');
    } else if (content && !svgUrl) {
      setInputMode('custom');
    }
  }, [svgUrl, content]);

  // Check if using special positioning
  const isUsingSpecialPosition = specialPosition && specialPosition !== 'none';

  // Handle logo selection
  const handleLogoSelect = (url: string) => {
    setValue(urlFieldName, url);
    setValue(contentFieldName, ''); // Clear custom SVG when selecting from dropdown
  };

  // Handle clearing selection
  const handleClearSelection = () => {
    setValue(urlFieldName, '');
  };

  return (
    <div className="space-y-4">
      {/* Input Mode Toggle */}
      <div className="space-y-2">
        <Label>SVG Source</Label>
        <Select
          value={inputMode}
          onValueChange={(value: 'select' | 'custom') => {
            setInputMode(value);
            if (value === 'select') {
              setValue(contentFieldName, '');
            } else {
              setValue(urlFieldName, '');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="select">Select from Logos</SelectItem>
            <SelectItem value="custom">Custom SVG Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logo Selection Dropdown */}
      {inputMode === 'select' && (
        <div className="space-y-2">
          <Label>Select SVG</Label>
          <Select
            value={svgUrl || undefined}
            onValueChange={handleLogoSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an SVG from logos" />
            </SelectTrigger>
            <SelectContent>
              {logos.map((logo) => (
                <SelectItem key={logo.url} value={logo.url}>
                  {logo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {svgUrl && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Custom SVG Content */}
      {inputMode === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor={contentFieldName}>SVG Code</Label>
          <Textarea
            id={contentFieldName}
            {...register(contentFieldName)}
            placeholder="Paste SVG code here (e.g., <svg>...</svg>)"
            rows={6}
            className="font-mono text-xs"
          />
        </div>
      )}

      {/* SVG Color Control */}
      <ColorPicker
        label="SVG Color"
        color={color || '#000000'}
        onChange={(newColor) => setValue(colorFieldName, newColor)}
      />

      {/* Special Position Selector */}
      <SpecialPositionSelector
        position={specialPosition}
        padding={specialPadding}
        onPositionChange={(value) => setValue(specialPositionFieldName, value as any)}
        onPaddingChange={(value) => setValue(specialPaddingFieldName, value)}
      />

      {/* Manual Position Controls - Only show top/left when not using special position */}
      {!isUsingSpecialPosition && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${positionFieldName}.top`}>Top (px)</Label>
            <Input
              id={`${positionFieldName}.top`}
              type="text"
              {...register(`${positionFieldName}.top` as any)}
              placeholder="e.g., 50px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${positionFieldName}.left`}>Left (px)</Label>
            <Input
              id={`${positionFieldName}.left`}
              type="text"
              {...register(`${positionFieldName}.left` as any)}
              placeholder="e.g., 50px"
            />
          </div>
        </div>
      )}

      {/* Size Controls - Always show width/height */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${positionFieldName}.width`}>Width (px)</Label>
          <Input
            id={`${positionFieldName}.width`}
            type="text"
            {...register(`${positionFieldName}.width` as any)}
            placeholder="e.g., 100px"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${positionFieldName}.height`}>Height (px)</Label>
          <Input
            id={`${positionFieldName}.height`}
            type="text"
            {...register(`${positionFieldName}.height` as any)}
            placeholder="e.g., 100px"
          />
        </div>
      </div>

      {/* SVG Preview (if valid) */}
      {(content || svgUrl) && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="border rounded-lg p-4 bg-muted/50 flex items-center justify-center min-h-[100px]"
            style={{ color: color || '#000000' }}
          >
            {svgUrl ? (
              <img
                src={svgUrl}
                alt="SVG preview"
                className="max-w-full h-auto max-h-32 object-contain"
                style={{
                  filter: color && color !== '#000000'
                    ? `brightness(0) saturate(100%)`
                    : 'none'
                }}
              />
            ) : content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
