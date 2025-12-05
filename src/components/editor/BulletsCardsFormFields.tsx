'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { BulletsCardsTemplateFormData } from '@/lib/schemas/bulletsCardsTemplate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { FileUploadInput } from './FileUploadInput';
import { TextFieldEditor } from './TextFieldEditor';
import { FreeTextEditor } from './FreeTextEditor';
import { SVGPositionEditor } from './SVGPositionEditor';
import { StyledChunksEditor } from './StyledChunksEditor';
import { getFontOptions } from '@/lib/constants/fonts';
import { usePersistedTab } from '@/lib/hooks';

interface BulletsCardsFormFieldsProps {
  register: UseFormRegister<BulletsCardsTemplateFormData>;
  watch: UseFormWatch<BulletsCardsTemplateFormData>;
  setValue: UseFormSetValue<BulletsCardsTemplateFormData>;
  handleFileUpload: (file: File) => Promise<string>;
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

export function BulletsCardsFormFields({
  register,
  watch,
  setValue,
  handleFileUpload,
}: BulletsCardsFormFieldsProps) {
  // Persisted tab state
  const [activeTab, setActiveTab] = usePersistedTab('bulletscards-editor-tab', 'visual');

  // Watch all necessary values
  const backgroundColor = watch('backgroundColor');
  const headerFontSize = watch('headerFontSize') || 52;
  const headerFontWeight = watch('headerFontWeight') || 700;
  const headerColor = watch('headerColor');
  const headerMarginBottom = watch('headerMarginBottom') || 40;
  const headerFontFamily = watch('headerTextStyle.fontFamily') || 'Arial';
  const headerTextAlign = watch('headerTextStyle.textAlign') || 'left';

  const footerFontSize = watch('footerFontSize') || 28;
  const footerFontWeight = watch('footerFontWeight') || 600;
  const footerColor = watch('footerColor');
  const footerMarginTop = watch('footerMarginTop') || 30;
  const footerFontFamily = watch('footerTextStyle.fontFamily') || 'Arial';
  const footerTextAlign = watch('footerTextStyle.textAlign') || 'left';

  const cardsGap = watch('cardsGap');
  const cardsContainerWidth = watch('cardsContainerWidth') || 65;
  const cardBackgroundColor = watch('cardBackgroundColor');
  const cardBorderRadius = watch('cardBorderRadius');
  const cardPaddingVertical = watch('cardPaddingVertical') || 24;
  const cardPaddingHorizontal = watch('cardPaddingHorizontal') || 28;
  const cardInnerGap = watch('cardInnerGap') || 20;
  const cardShadow = watch('cardShadow');
  const cardMinHeight = watch('cardMinHeight') || 80;
  const cardTextFontSize = watch('cardTextFontSize') || 22;
  const cardTextFontWeight = watch('cardTextFontWeight') || 400;
  const cardTextColor = watch('cardTextColor');

  const iconSize = watch('iconSize');
  const iconBackgroundColor = watch('iconBackgroundColor');
  const iconColor = watch('iconColor');
  const iconFontSize = watch('iconFontSize') || 20;
  const iconFontWeight = watch('iconFontWeight') || 700;
  const iconSvgSize = watch('iconSvgSize') || 24;

  const contentImageUrl = watch('contentImageUrl');
  const contentImageWidth = watch('contentImageWidth') || 400;
  const contentImageRight = watch('contentImageRight') || 60;
  const contentImageBottom = watch('contentImageBottom') || 200;
  const hideContentImage = watch('hideContentImage');
  const contentGap = watch('contentGap') || 30;

  const logoImageUrl = watch('logoImageUrl');

  // Get font options
  const fontOptions = getFontOptions();

  // Bullet field renderer helper
  const renderBulletField = (bulletNumber: 1 | 2 | 3 | 4 | 5) => {
    const textFieldName = `bullet${bulletNumber}Text` as const;
    const iconFieldName = `bullet${bulletNumber}Icon` as const;
    const styleFieldName = `bullet${bulletNumber}TextStyle` as const;
    const chunksFieldName = `bullet${bulletNumber}StyledChunks` as const;

    const bulletText = watch(textFieldName);
    const bulletIcon = watch(iconFieldName);
    const fontSize = watch(`${styleFieldName}.fontSize` as any) || '22px';
    const fontWeight = watch(`${styleFieldName}.fontWeight` as any) || '400';
    const color = watch(`${styleFieldName}.color` as any) || '#2d3748';
    const fontFamily = watch(`${styleFieldName}.fontFamily` as any) || 'Arial';
    const textAlign = watch(`${styleFieldName}.textAlign` as any) || 'left';
    const fontSizeValue = parseInt(fontSize) || 22;

    return (
      <AccordionItem key={`bullet${bulletNumber}`} value={`bullet${bulletNumber}`}>
        <AccordionTrigger>Bullet {bulletNumber}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Bullet Text */}
            <div className="space-y-2">
              <Label htmlFor={textFieldName}>Bullet Text</Label>
              <Textarea
                id={textFieldName}
                {...register(textFieldName)}
                placeholder={`Enter bullet ${bulletNumber} text`}
                rows={2}
              />
            </div>

            {/* Bullet Icon/Number */}
            <div className="space-y-2">
              <Label htmlFor={iconFieldName}>
                Icon (SVG code or number)
              </Label>
              <Textarea
                id={iconFieldName}
                {...register(iconFieldName)}
                placeholder={`Enter SVG code or number (e.g., "1" or "<svg>...</svg>")`}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter a number (e.g., "1") or paste SVG code
              </p>
            </div>

            <Separator className="my-4" />

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{fontSize}</span>
              </div>
              <Slider
                min={12}
                max={48}
                step={1}
                value={[fontSizeValue]}
                onValueChange={([value]) =>
                  setValue(`${styleFieldName}.fontSize` as any, `${value}px`)
                }
              />
            </div>

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

            {/* Font Family */}
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

            <Separator className="my-4" />

            {/* Styled Chunks Editor */}
            <StyledChunksEditor
              fieldName={textFieldName as any}
              watch={watch as any}
              setValue={setValue as any}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="imagem">Imagem</TabsTrigger>
        <TabsTrigger value="elementos">Elementos</TabsTrigger>
      </TabsList>

      {/* Tab Visual */}
      <TabsContent value="visual">
        <Accordion type="multiple" defaultValue={['background-settings']} className="w-full">
          {/* Background Settings */}
          <AccordionItem value="background-settings">
            <AccordionTrigger>Background Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <ColorPicker
                  label="Background Color"
                  color={backgroundColor || '#f7fafc'}
                  onChange={(value) => setValue('backgroundColor', value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Textos */}
      <TabsContent value="textos">
        <Accordion type="multiple" defaultValue={['header-settings']} className="w-full">
          {/* Header Settings */}
          <AccordionItem value="header-settings">
            <AccordionTrigger>Header Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Header Text */}
                <div className="space-y-2">
                  <Label htmlFor="headerText">Header Text</Label>
              <Textarea
                id="headerText"
                {...register('headerText')}
                placeholder="Enter header text"
                rows={2}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{headerFontSize}px</span>
              </div>
              <Slider
                min={24}
                max={96}
                step={1}
                value={[headerFontSize]}
                onValueChange={([value]) => {
                  setValue('headerFontSize', value);
                  setValue('headerTextStyle.fontSize', `${value}px`);
                }}
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Weight</Label>
                <span className="text-sm text-muted-foreground">{headerFontWeight}</span>
              </div>
              <Slider
                min={100}
                max={900}
                step={100}
                value={[headerFontWeight]}
                onValueChange={([value]) => {
                  setValue('headerFontWeight', value);
                  setValue('headerTextStyle.fontWeight', `${value}`);
                }}
              />
            </div>

            {/* Color */}
            <ColorPicker
              label="Header Color"
              color={headerColor || '#1a365d'}
              onChange={(value) => {
                setValue('headerColor', value);
                setValue('headerTextStyle.color', value);
              }}
            />

            {/* Font Family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={headerFontFamily}
                onValueChange={(value) =>
                  setValue('headerTextStyle.fontFamily', value)
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
                value={headerTextAlign}
                onValueChange={(value) =>
                  setValue('headerTextStyle.textAlign', value as any)
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

            {/* Margin Bottom */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Margin Bottom</Label>
                <span className="text-sm text-muted-foreground">{headerMarginBottom}px</span>
              </div>
              <Slider
                min={0}
                max={80}
                step={5}
                value={[headerMarginBottom]}
                onValueChange={([value]) => setValue('headerMarginBottom', value)}
              />
            </div>

            <Separator className="my-4" />

                {/* Styled Chunks Editor */}
                <StyledChunksEditor
                  fieldName={'headerText' as any}
                  watch={watch as any}
                  setValue={setValue as any}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Bullet 1-5 */}
          {[1, 2, 3, 4, 5].map((num) => renderBulletField(num as 1 | 2 | 3 | 4 | 5))}

          {/* Footer Settings */}
          <AccordionItem value="footer-settings">
            <AccordionTrigger>Footer Settings</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Textarea
                id="footerText"
                {...register('footerText')}
                placeholder="Enter footer text (optional)"
                rows={2}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{footerFontSize}px</span>
              </div>
              <Slider
                min={16}
                max={48}
                step={1}
                value={[footerFontSize]}
                onValueChange={([value]) => {
                  setValue('footerFontSize', value);
                  setValue('footerTextStyle.fontSize', `${value}px`);
                }}
              />
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Weight</Label>
                <span className="text-sm text-muted-foreground">{footerFontWeight}</span>
              </div>
              <Slider
                min={100}
                max={900}
                step={100}
                value={[footerFontWeight]}
                onValueChange={([value]) => {
                  setValue('footerFontWeight', value);
                  setValue('footerTextStyle.fontWeight', `${value}`);
                }}
              />
            </div>

            {/* Color */}
            <ColorPicker
              label="Footer Color"
              color={footerColor || '#1a365d'}
              onChange={(value) => {
                setValue('footerColor', value);
                setValue('footerTextStyle.color', value);
              }}
            />

            {/* Font Family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={footerFontFamily}
                onValueChange={(value) =>
                  setValue('footerTextStyle.fontFamily', value)
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
                value={footerTextAlign}
                onValueChange={(value) =>
                  setValue('footerTextStyle.textAlign', value as any)
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

            {/* Margin Top */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Margin Top</Label>
                <span className="text-sm text-muted-foreground">{footerMarginTop}px</span>
              </div>
              <Slider
                min={0}
                max={80}
                step={5}
                value={[footerMarginTop]}
                onValueChange={([value]) => setValue('footerMarginTop', value)}
              />
            </div>

            <Separator className="my-4" />

                {/* Styled Chunks Editor */}
                <StyledChunksEditor
                  fieldName={'footerText' as any}
                  watch={watch as any}
                  setValue={setValue as any}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Visual (continuation - Card & Icon Styling) */}
      <TabsContent value="visual" forceMount className="hidden data-[state=active]:block">
        <Accordion type="multiple" defaultValue={['card-styling']} className="w-full mt-4">
          {/* Card Styling */}
          <AccordionItem value="card-styling">
            <AccordionTrigger>Card Styling</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Cards Gap */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Gap Between Cards</Label>
                <span className="text-sm text-muted-foreground">{cardsGap}px</span>
              </div>
              <Slider
                min={0}
                max={60}
                step={2}
                value={[cardsGap]}
                onValueChange={([value]) => setValue('cardsGap', value)}
              />
            </div>

            {/* Cards Container Width */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Container Width</Label>
                <span className="text-sm text-muted-foreground">{cardsContainerWidth}%</span>
              </div>
              <Slider
                min={40}
                max={100}
                step={1}
                value={[cardsContainerWidth]}
                onValueChange={([value]) => setValue('cardsContainerWidth', value)}
              />
            </div>

            {/* Card Background Color */}
            <ColorPicker
              label="Card Background Color"
              color={cardBackgroundColor || '#ffffff'}
              onChange={(value) => setValue('cardBackgroundColor', value)}
            />

            {/* Card Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{cardBorderRadius}px</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[cardBorderRadius]}
                onValueChange={([value]) => setValue('cardBorderRadius', value)}
              />
            </div>

            {/* Card Padding Vertical */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Padding Vertical</Label>
                <span className="text-sm text-muted-foreground">{cardPaddingVertical}px</span>
              </div>
              <Slider
                min={8}
                max={60}
                step={2}
                value={[cardPaddingVertical]}
                onValueChange={([value]) => setValue('cardPaddingVertical', value)}
              />
            </div>

            {/* Card Padding Horizontal */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Padding Horizontal</Label>
                <span className="text-sm text-muted-foreground">{cardPaddingHorizontal}px</span>
              </div>
              <Slider
                min={8}
                max={60}
                step={2}
                value={[cardPaddingHorizontal]}
                onValueChange={([value]) => setValue('cardPaddingHorizontal', value)}
              />
            </div>

            {/* Card Inner Gap */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Inner Gap (Icon to Text)</Label>
                <span className="text-sm text-muted-foreground">{cardInnerGap}px</span>
              </div>
              <Slider
                min={8}
                max={40}
                step={2}
                value={[cardInnerGap]}
                onValueChange={([value]) => setValue('cardInnerGap', value)}
              />
            </div>

            {/* Card Shadow */}
            <div className="space-y-2">
              <Label htmlFor="cardShadow">Card Shadow (CSS)</Label>
              <Input
                id="cardShadow"
                {...register('cardShadow')}
                placeholder="e.g., 0 2px 12px rgba(0, 0, 0, 0.08)"
              />
            </div>

            {/* Card Min Height */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Minimum Height</Label>
                <span className="text-sm text-muted-foreground">{cardMinHeight}px</span>
              </div>
              <Slider
                min={60}
                max={200}
                step={5}
                value={[cardMinHeight]}
                onValueChange={([value]) => setValue('cardMinHeight', value)}
              />
            </div>

            <Separator className="my-4" />

            {/* Card Text Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Text Font Size</Label>
                <span className="text-sm text-muted-foreground">{cardTextFontSize}px</span>
              </div>
              <Slider
                min={14}
                max={36}
                step={1}
                value={[cardTextFontSize]}
                onValueChange={([value]) => setValue('cardTextFontSize', value)}
              />
            </div>

            {/* Card Text Font Weight */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Text Font Weight</Label>
                <span className="text-sm text-muted-foreground">{cardTextFontWeight}</span>
              </div>
              <Slider
                min={100}
                max={900}
                step={100}
                value={[cardTextFontWeight]}
                onValueChange={([value]) => setValue('cardTextFontWeight', value)}
              />
            </div>

            {/* Card Text Color */}
            <ColorPicker
              label="Text Color"
              color={cardTextColor || '#2d3748'}
              onChange={(value) => setValue('cardTextColor', value)}
            />
          </div>
            </AccordionContent>
          </AccordionItem>

          {/* Icon Styling */}
          <AccordionItem value="icon-styling">
            <AccordionTrigger>Icon Styling</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Icon Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Icon Size</Label>
                <span className="text-sm text-muted-foreground">{iconSize}px</span>
              </div>
              <Slider
                min={32}
                max={80}
                step={2}
                value={[iconSize]}
                onValueChange={([value]) => setValue('iconSize', value)}
              />
            </div>

            {/* Icon Background Color */}
            <ColorPicker
              label="Icon Background Color"
              color={iconBackgroundColor || '#fed7d7'}
              onChange={(value) => setValue('iconBackgroundColor', value)}
            />

            {/* Icon Color */}
            <ColorPicker
              label="Icon Color"
              color={iconColor || '#c53030'}
              onChange={(value) => setValue('iconColor', value)}
            />

            <Separator className="my-4" />

            {/* Icon Font Size (for numbers) */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size (for numbers)</Label>
                <span className="text-sm text-muted-foreground">{iconFontSize}px</span>
              </div>
              <Slider
                min={12}
                max={48}
                step={1}
                value={[iconFontSize]}
                onValueChange={([value]) => setValue('iconFontSize', value)}
              />
            </div>

            {/* Icon Font Weight (for numbers) */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Weight (for numbers)</Label>
                <span className="text-sm text-muted-foreground">{iconFontWeight}</span>
              </div>
              <Slider
                min={100}
                max={900}
                step={100}
                value={[iconFontWeight]}
                onValueChange={([value]) => setValue('iconFontWeight', value)}
              />
            </div>

            {/* Icon SVG Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>SVG Icon Size</Label>
                <span className="text-sm text-muted-foreground">{iconSvgSize}px</span>
              </div>
              <Slider
                min={12}
                max={48}
                step={1}
                value={[iconSvgSize]}
                onValueChange={([value]) => setValue('iconSvgSize', value)}
              />
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Imagem */}
      <TabsContent value="imagem">
        <Accordion type="multiple" defaultValue={['content-image']} className="w-full">
          {/* Content Image */}
          <AccordionItem value="content-image">
            <AccordionTrigger>Content Image (Optional)</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <FileUploadInput
              label="Image URL"
              value={contentImageUrl}
              onChange={(value) => setValue('contentImageUrl', value)}
              onUpload={handleFileUpload}
            />

            {/* Image Width */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Image Width</Label>
                <span className="text-sm text-muted-foreground">{contentImageWidth}px</span>
              </div>
              <Slider
                min={200}
                max={600}
                step={10}
                value={[contentImageWidth]}
                onValueChange={([value]) => setValue('contentImageWidth', value)}
              />
            </div>

            {/* Image Right */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Position from Right</Label>
                <span className="text-sm text-muted-foreground">{contentImageRight}px</span>
              </div>
              <Slider
                min={0}
                max={200}
                step={5}
                value={[contentImageRight]}
                onValueChange={([value]) => setValue('contentImageRight', value)}
              />
            </div>

            {/* Image Bottom */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Position from Bottom</Label>
                <span className="text-sm text-muted-foreground">{contentImageBottom}px</span>
              </div>
              <Slider
                min={0}
                max={400}
                step={10}
                value={[contentImageBottom]}
                onValueChange={([value]) => setValue('contentImageBottom', value)}
              />
            </div>

            {/* Content Gap */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Content Gap</Label>
                <span className="text-sm text-muted-foreground">{contentGap}px</span>
              </div>
              <Slider
                min={0}
                max={80}
                step={5}
                value={[contentGap]}
                onValueChange={([value]) => setValue('contentGap', value)}
              />
            </div>

            {/* Hide Image */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hideContentImage"
                {...register('hideContentImage')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hideContentImage">Hide Content Image</Label>
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>

          {/* Logo Image */}
          <AccordionItem value="logo-image">
            <AccordionTrigger>Logo Image (Optional)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <FileUploadInput
                  label="Logo Image URL"
                  value={logoImageUrl}
                  onChange={(value) => setValue('logoImageUrl', value)}
                  onUpload={handleFileUpload}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Elementos */}
      <TabsContent value="elementos">
        <Accordion type="multiple" defaultValue={['freeText1']} className="w-full">
          {/* Free Text Elements */}
          {[1, 2, 3].map((num) => (
            <AccordionItem key={`freeText${num}`} value={`freeText${num}`}>
              <AccordionTrigger>Free Text {num}</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <FreeTextEditor
                    textNumber={num as 1 | 2 | 3}
                    register={register as any}
                    watch={watch as any}
                    setValue={setValue as any}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {/* SVG Element */}
          <AccordionItem value="svg1">
            <AccordionTrigger>SVG Element</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2">
                <SVGPositionEditor
                  svgNumber={1}
                  register={register as any}
                  watch={watch as any}
                  setValue={setValue as any}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
