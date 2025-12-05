'use client';

import * as React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorPicker } from './ColorPicker';
import { FontSizePicker } from './FontSizePicker';
import { SpecialPositionSelector } from './SpecialPositionSelector';
import { StackTemplateFormData } from '@/lib/schemas/stackTemplate';

export interface FreeTextEditorProps {
  textNumber: 1 | 2 | 3;
  register: UseFormRegister<StackTemplateFormData>;
  watch: UseFormWatch<StackTemplateFormData>;
  setValue: UseFormSetValue<StackTemplateFormData>;
}

export function FreeTextEditor({
  textNumber,
  register,
  watch,
  setValue,
}: FreeTextEditorProps) {
  const textFieldName = `freeText${textNumber}` as const;
  const positionFieldName = `freeText${textNumber}Position` as const;
  const styleFieldName = `freeText${textNumber}Style` as const;
  const specialPositionFieldName = `freeText${textNumber}SpecialPosition` as const;
  const specialPaddingFieldName = `freeText${textNumber}SpecialPadding` as const;

  // Watch values
  const text = watch(textFieldName);
  const fontSize = watch(`${styleFieldName}.fontSize` as any) || '16px';
  const color = watch(`${styleFieldName}.color` as any) || '#000000';
  const backgroundColor = watch(`${styleFieldName}.backgroundColor` as any) || 'transparent';
  const specialPosition = watch(specialPositionFieldName) || 'none';
  const specialPadding = watch(specialPaddingFieldName) || 8;

  // Check if using special positioning
  const isUsingSpecialPosition = specialPosition && specialPosition !== 'none';

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <Label htmlFor={textFieldName}>Text</Label>
        <Input
          id={textFieldName}
          {...register(textFieldName)}
          placeholder={`Enter free text ${textNumber}`}
        />
      </div>

      {/* Special Position Selector */}
      <SpecialPositionSelector
        position={specialPosition}
        padding={specialPadding}
        onPositionChange={(value) => setValue(specialPositionFieldName, value as any)}
        onPaddingChange={(value) => setValue(specialPaddingFieldName, value)}
      />

      {/* Manual Position Controls - Only show when not using special position */}
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

      {/* Font Size */}
      <FontSizePicker
        value={fontSize}
        onChange={(value) => setValue(`${styleFieldName}.fontSize` as any, value)}
      />

      {/* Text Color */}
      <ColorPicker
        label="Text Color"
        color={color}
        onChange={(value) => setValue(`${styleFieldName}.color` as any, value)}
      />

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        color={backgroundColor}
        onChange={(value) =>
          setValue(`${styleFieldName}.backgroundColor` as any, value)
        }
      />
    </div>
  );
}
