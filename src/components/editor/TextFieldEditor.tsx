'use client';

import * as React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FontSizePicker } from './FontSizePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from './ColorPicker';
import { StyledChunksEditor } from './StyledChunksEditor';
import { StackTemplateFormData } from '@/lib/schemas/stackTemplate';
import { getFontOptions } from '@/lib/constants/fonts';
import { Separator } from '@/components/ui/separator';

export interface TextFieldEditorProps {
  fieldName: 'text1' | 'text2' | 'text3' | 'text4' | 'text5';
  register: UseFormRegister<StackTemplateFormData>;
  watch: UseFormWatch<StackTemplateFormData>;
  setValue: UseFormSetValue<StackTemplateFormData>;
}

const fontWeightOptions = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
];

const textAlignOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const textTransformOptions = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export function TextFieldEditor({
  fieldName,
  register,
  watch,
  setValue,
}: TextFieldEditorProps) {
  const styleFieldName = `${fieldName}Style` as const;

  // Watch values
  const text = watch(fieldName);
  const fontSize = watch(`${styleFieldName}.fontSize` as any) || '16px';
  const fontWeight = watch(`${styleFieldName}.fontWeight` as any) || '400';
  const color = watch(`${styleFieldName}.color` as any) || '#000000';
  const fontFamily = watch(`${styleFieldName}.fontFamily` as any) || 'Arial';
  const textAlign = watch(`${styleFieldName}.textAlign` as any) || 'left';
  const textTransform = watch(`${styleFieldName}.textTransform` as any) || 'none';

// Get all available fonts
  const fontOptions = getFontOptions();

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <Label htmlFor={fieldName}>Text Content</Label>
        <Textarea
          id={fieldName}
          {...register(fieldName)}
          placeholder={`Enter ${fieldName} content`}
          rows={3}
        />
      </div>

      {/* Font Size */}
      <FontSizePicker
        value={fontSize}
        onChange={(value) => setValue(`${styleFieldName}.fontSize` as any, value)}
      />

      {/* Font Weight */}
      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select
          value={fontWeight}
          onValueChange={(value) =>
            setValue(`${styleFieldName}.fontWeight` as any, value)
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

      {/* Color */}
      <ColorPicker
        label="Text Color"
        color={color}
        onChange={(value) => setValue(`${styleFieldName}.color` as any, value)}
      />

      {/* Font Family - Now with all custom fonts */}
      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={fontFamily}
          onValueChange={(value) =>
            setValue(`${styleFieldName}.fontFamily` as any, value)
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

      {/* Text Align */}
      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <Select
          value={textAlign}
          onValueChange={(value) =>
            setValue(`${styleFieldName}.textAlign` as any, value as any)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            {textAlignOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <Label>Text Transform</Label>
        <Select
          value={textTransform}
          onValueChange={(value) =>
            setValue(`${styleFieldName}.textTransform` as any, value as any)
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

      <Separator className="my-4" />

      {/* Styled Chunks Editor */}
      <StyledChunksEditor
        fieldName={fieldName}
        watch={watch}
        setValue={setValue}
      />
    </div>
  );
}
