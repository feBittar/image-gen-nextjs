'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { FitFeedCapaTemplateFormData } from '@/lib/schemas/fitfeedCapaTemplate';
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
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { FileUploadInput } from './FileUploadInput';
import { CardGradientEditor } from './CardGradientEditor';
import { StyledChunksEditor } from './StyledChunksEditor';
import { SpecialPositionSelector } from './SpecialPositionSelector';
import { getFontOptions } from '@/lib/constants/fonts';
import { usePersistedTab } from '@/lib/hooks';

interface FitFeedCapaFormFieldsProps {
  register: UseFormRegister<FitFeedCapaTemplateFormData>;
  watch: UseFormWatch<FitFeedCapaTemplateFormData>;
  setValue: UseFormSetValue<FitFeedCapaTemplateFormData>;
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

const textTransformOptions = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export function FitFeedCapaFormFields({
  register,
  watch,
  setValue,
  handleFileUpload,
}: FitFeedCapaFormFieldsProps) {
  // Persisted tab state
  const [activeTab, setActiveTab] = usePersistedTab('fitfeedcapa-editor-tab', 'visual');

  // State for logos
  const [logos, setLogos] = React.useState<Array<{ name: string; filename: string; url: string; extension: string }>>([]);

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
  const gradientBlurDisplay = watch('gradientBlurDisplay');

  // Viewport background type
  const viewportBackgroundType = watch('viewportBackgroundType') || 'color';
  const viewportBackgroundColor = watch('viewportBackgroundColor');
  const viewportBackgroundImage = watch('viewportBackgroundImage');

  const logoImageUrl = watch('logoImageUrl');
  const logoImageColor = watch('logoColor') || '#ffffff';
  const arrowImageUrl = watch('arrowImageUrl');
  const arrowImageColor = watch('arrowColor') || '#ffffff';

  // Title styles
  const titleFontSize = watch('titleStyle.fontSize') || '72px';
  const titleFontWeight = watch('titleStyle.fontWeight') || '900';
  const titleColor = watch('titleStyle.color') || '#ffffff';
  const titleFontFamily = watch('titleStyle.fontFamily') || 'Bebas Neue';
  const titleTextAlign = watch('titleStyle.textAlign') || 'left';
  const titleTextTransform = watch('titleStyle.textTransform') || 'uppercase';
  const titleLineHeight = watch('titleStyle.lineHeight') || '1.2';
  const titleFontSizeValue = parseInt(titleFontSize) || 72;

  // Bottom text styles
  const bottomTextFontSize = watch('bottomTextStyle.fontSize') || '18px';
  const bottomTextFontWeight = watch('bottomTextStyle.fontWeight') || '700';
  const bottomTextColor = watch('bottomTextStyle.color') || '#ffffff';
  const bottomTextFontFamily = watch('bottomTextStyle.fontFamily') || 'Montserrat';
  const bottomTextTextTransform = watch('bottomTextStyle.textTransform') || 'uppercase';
  const bottomTextFontSizeValue = parseInt(bottomTextFontSize) || 18;

  // Special styling
  const specialStylingEnabled = watch('titleSpecialStyling.enabled') || false;
  const lineStyles = watch('titleSpecialStyling.lineStyles') || [];
  const [detectedLineCount, setDetectedLineCount] = React.useState<number | null>(null);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectionError, setDetectionError] = React.useState<string | null>(null);

  // Get title value for detection
  const titleValue = watch('title');

  const fontOptions = getFontOptions();

  // Function to detect lines
  const handleDetectLines = async () => {
    if (!titleValue || !titleValue.trim()) {
      setDetectionError('Please enter a title first');
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);

    try {
      const response = await fetch('/api/detect-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleValue,
          titleStyle: {
            fontFamily: titleFontFamily,
            fontSize: titleFontSize,
            fontWeight: titleFontWeight,
            color: titleColor,
            textAlign: titleTextAlign,
            lineHeight: titleLineHeight,
            letterSpacing: watch('titleStyle.letterSpacing') || '-1px',
            textTransform: titleTextTransform,
          },
          titleSpecialStyling: {
            enabled: specialStylingEnabled,
            lineStyles: lineStyles,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const lineCount = result.data.lineCount;
        setDetectedLineCount(lineCount);

        // Auto-create line styles
        const newLineStyles = Array.from({ length: lineCount }, (_, index) => {
          // Keep existing style if available
          if (lineStyles[index]) {
            return lineStyles[index];
          }
          // Create default style
          return {
            color: '#FFFFFF',
            bold: true,
          };
        });

        setValue('titleSpecialStyling.lineStyles', newLineStyles);
      } else {
        setDetectionError(result.error || 'Failed to detect lines');
      }
    } catch (error) {
      console.error('Error detecting lines:', error);
      setDetectionError('Failed to detect lines. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="elementos">Elementos</TabsTrigger>
      </TabsList>

      {/* Tab Visual */}
      <TabsContent value="visual">
        <Accordion type="multiple" defaultValue={['viewport-background']} className="w-full">
          {/* Viewport Background */}
          <AccordionItem value="viewport-background">
            <AccordionTrigger>Viewport Background</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Background Type Selector */}
            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select
                value={viewportBackgroundType}
                onValueChange={(value: 'color' | 'image') => setValue('viewportBackgroundType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="image">Background Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-4" />

            {/* Conditional rendering based on background type */}
            {viewportBackgroundType === 'color' ? (
              <ColorPicker
                label="Viewport Background Color"
                color={viewportBackgroundColor || '#000000'}
                onChange={(value) => setValue('viewportBackgroundColor', value)}
              />
            ) : (
              <FileUploadInput
                label="Viewport Background Image"
                value={viewportBackgroundImage}
                onChange={(value) => setValue('viewportBackgroundImage', value)}
                onUpload={handleFileUpload}
              />
            )}

            {/* Viewport Gradient Overlay */}
            <Separator className="my-4" />
            <CardGradientEditor
              watch={watch}
              setValue={setValue}
              fieldName="viewportGradientOverlay"
              label="Viewport Gradient"
            />
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Textos */}
      <TabsContent value="textos">
        <Accordion type="multiple" defaultValue={['title-settings']} className="w-full">
          {/* Title Settings */}
          <AccordionItem value="title-settings">
            <AccordionTrigger>Title</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title Text</Label>
              <Textarea
                id="title"
                {...register('title')}
                placeholder="Enter title"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{titleFontSize}</span>
              </div>
              <Slider
                min={24}
                max={150}
                step={1}
                value={[titleFontSizeValue]}
                onValueChange={([value]) =>
                  setValue('titleStyle.fontSize', `${value}px`)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select
                value={titleFontWeight}
                onValueChange={(value) =>
                  setValue('titleStyle.fontWeight', value)
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

            <ColorPicker
              label="Text Color"
              color={titleColor}
              onChange={(value) => setValue('titleStyle.color', value)}
            />

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={titleFontFamily}
                onValueChange={(value) =>
                  setValue('titleStyle.fontFamily', value)
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

            <div className="space-y-2">
              <Label>Text Align</Label>
              <Select
                value={titleTextAlign}
                onValueChange={(value: 'left' | 'center' | 'right') =>
                  setValue('titleStyle.textAlign', value)
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

            <div className="space-y-2">
              <Label>Text Transform</Label>
              <Select
                value={titleTextTransform}
                onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') =>
                  setValue('titleStyle.textTransform', value)
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

            <div className="space-y-2">
              <Label htmlFor="titleLineHeight">Line Height</Label>
              <Input
                id="titleLineHeight"
                type="text"
                value={titleLineHeight}
                onChange={(e) => setValue('titleStyle.lineHeight', e.target.value)}
                placeholder="e.g., 1.2, 1.5, 2"
              />
              <p className="text-xs text-muted-foreground">
                Enter a unitless value (e.g., 1.2) or with units (e.g., 1.5em, 36px)
              </p>
            </div>

            <Separator className="my-4" />

            <div className={specialStylingEnabled ? 'opacity-40 pointer-events-none' : ''}>
              <StyledChunksEditor
                fieldName="title"
                watch={watch}
                setValue={setValue}
              />
              {specialStylingEnabled && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Styled Chunks is disabled when Special Styling is enabled
                </p>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Special Styling Settings */}
      <AccordionItem value="special-styling-settings">
        <AccordionTrigger>Special Styling (Optional)</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="specialStylingEnabled">Enable Special Styling</Label>
                <p className="text-xs text-muted-foreground">
                  Auto-detect line breaks and apply different styles to each line
                </p>
              </div>
              <Switch
                id="specialStylingEnabled"
                checked={specialStylingEnabled}
                onCheckedChange={(checked) => {
                  setValue('titleSpecialStyling.enabled', checked);
                  if (checked && (!lineStyles || lineStyles.length === 0)) {
                    // Initialize with one line style
                    setValue('titleSpecialStyling.lineStyles', [
                      {
                        color: '#FFFFFF',
                        bold: true,
                      }
                    ]);
                  }
                }}
              />
            </div>

            {specialStylingEnabled && (
              <>
                <Separator className="my-4" />

                {/* Line Detection Section */}
                <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-semibold">Line Detection</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detect how many lines your title will have when rendered
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLines}
                      disabled={isDetecting || !titleValue}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      {isDetecting ? (
                        <>
                          <span className="animate-spin">🔄</span>
                          Detecting...
                        </>
                      ) : (
                        <>
                          🔍 Detect Lines
                        </>
                      )}
                    </button>
                  </div>

                  {detectedLineCount !== null && (
                    <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                          {detectedLineCount} {detectedLineCount === 1 ? 'line' : 'lines'} detected
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Style fields created automatically below
                        </p>
                      </div>
                    </div>
                  )}

                  {detectionError && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
                      <span className="text-lg">❌</span>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {detectionError}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Line Styles</Label>
                    <button
                      type="button"
                      onClick={() => {
                        const newLineStyles = [...lineStyles, { color: '#FFFFFF' }];
                        setValue('titleSpecialStyling.lineStyles', newLineStyles);
                      }}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90"
                    >
                      + Add Line
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Define styles for each detected line. Line 1 will use the first style, Line 2 the second style, etc.
                  </p>

                  {lineStyles && lineStyles.length > 0 ? (
                    <div className="space-y-4">
                      {lineStyles.map((lineStyle: any, index: number) => (
                        <div key={index} className="border rounded-md p-4 space-y-3 bg-muted/30">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold">Line {index + 1}</Label>
                            <button
                              type="button"
                              onClick={() => {
                                const newLineStyles = lineStyles.filter((_: any, i: number) => i !== index);
                                setValue('titleSpecialStyling.lineStyles', newLineStyles);
                              }}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Color */}
                          <ColorPicker
                            label="Text Color"
                            color={lineStyle.color || '#FFFFFF'}
                            onChange={(value) => {
                              const newLineStyles = [...lineStyles];
                              newLineStyles[index] = { ...newLineStyles[index], color: value };
                              setValue('titleSpecialStyling.lineStyles', newLineStyles);
                            }}
                          />

                          {/* Background Color */}
                          <ColorPicker
                            label="Background Color (Optional)"
                            color={lineStyle.backgroundColor || ''}
                            onChange={(value) => {
                              const newLineStyles = [...lineStyles];
                              newLineStyles[index] = { ...newLineStyles[index], backgroundColor: value };
                              setValue('titleSpecialStyling.lineStyles', newLineStyles);
                            }}
                          />

                          {/* Bold and Italic toggles */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`bold-${index}`}
                                checked={lineStyle.bold || false}
                                onCheckedChange={(checked) => {
                                  const newLineStyles = [...lineStyles];
                                  newLineStyles[index] = { ...newLineStyles[index], bold: checked };
                                  setValue('titleSpecialStyling.lineStyles', newLineStyles);
                                }}
                              />
                              <Label htmlFor={`bold-${index}`} className="text-xs">Bold</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`italic-${index}`}
                                checked={lineStyle.italic || false}
                                onCheckedChange={(checked) => {
                                  const newLineStyles = [...lineStyles];
                                  newLineStyles[index] = { ...newLineStyles[index], italic: checked };
                                  setValue('titleSpecialStyling.lineStyles', newLineStyles);
                                }}
                              />
                              <Label htmlFor={`italic-${index}`} className="text-xs">Italic</Label>
                            </div>
                          </div>

                          {/* Font Family */}
                          <div className="space-y-2">
                            <Label className="text-xs">Font Family (Optional)</Label>
                            <div className="space-y-2">
                              <Select
                                value={lineStyle.fontFamily || undefined}
                                onValueChange={(value) => {
                                  const newLineStyles = [...lineStyles];
                                  newLineStyles[index] = { ...newLineStyles[index], fontFamily: value };
                                  setValue('titleSpecialStyling.lineStyles', newLineStyles);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Inherit from title" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {fontOptions.map((font) => (
                                    <SelectItem key={font.value} value={font.value}>
                                      {font.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {lineStyle.fontFamily && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newLineStyles = [...lineStyles];
                                    const { fontFamily, ...rest } = newLineStyles[index];
                                    newLineStyles[index] = rest;
                                    setValue('titleSpecialStyling.lineStyles', newLineStyles);
                                  }}
                                  className="text-xs text-muted-foreground hover:text-foreground underline"
                                >
                                  Clear (inherit from title)
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Font Size */}
                          <div className="space-y-2">
                            <Label className="text-xs">Font Size (Optional)</Label>
                            <Input
                              type="text"
                              value={lineStyle.fontSize || ''}
                              onChange={(e) => {
                                const newLineStyles = [...lineStyles];
                                newLineStyles[index] = { ...newLineStyles[index], fontSize: e.target.value };
                                setValue('titleSpecialStyling.lineStyles', newLineStyles);
                              }}
                              placeholder="e.g., 72px (leave empty to inherit)"
                              className="h-8 text-xs"
                            />
                          </div>

                          {/* Padding (for background) */}
                          {lineStyle.backgroundColor && (
                            <div className="space-y-2">
                              <Label className="text-xs">Padding</Label>
                              <Input
                                type="text"
                                value={lineStyle.padding || '0.3em 0.6em'}
                                onChange={(e) => {
                                  const newLineStyles = [...lineStyles];
                                  newLineStyles[index] = { ...newLineStyles[index], padding: e.target.value };
                                  setValue('titleSpecialStyling.lineStyles', newLineStyles);
                                }}
                                placeholder="e.g., 0.3em 0.6em"
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No line styles defined. Click "+ Add Line" to add styles.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Elementos */}
      <TabsContent value="elementos">
        <Accordion type="multiple" defaultValue={['logo-image-settings']} className="w-full">
          {/* Logo Image Settings */}
          <AccordionItem value="logo-image-settings">
            <AccordionTrigger>Logo SVG (Optional)</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Logo</Label>
              <Select
                value={logoImageUrl || undefined}
                onValueChange={(value) => setValue('logoImageUrl', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a logo" />
                </SelectTrigger>
                <SelectContent>
                  {logos.map((logo) => (
                    <SelectItem key={logo.url} value={logo.url}>
                      {logo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {logoImageUrl && (
                <button
                  type="button"
                  onClick={() => setValue('logoImageUrl', '')}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            {logoImageUrl && (
              <>
                <ColorPicker
                  label="Logo Color"
                  color={logoImageColor}
                  onChange={(value) => setValue('logoColor', value)}
                />

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-md p-4 bg-muted/30">
                    <img
                      src={logoImageUrl}
                      alt="Logo preview"
                      className="max-w-full h-auto max-h-32 object-contain"
                      style={{ filter: logoImageColor !== '#ffffff' ? `brightness(0) saturate(100%)` : 'none' }}
                    />
                  </div>
                </div>
              </>
            )}

            {logoImageUrl && (
              <>
                <Separator className="my-4" />

                <SpecialPositionSelector
                  position={watch('logoImageSpecialPosition') || 'top-left'}
                  padding={watch('logoImageSpecialPadding') || 5}
                  onPositionChange={(value) => setValue('logoImageSpecialPosition', value as any)}
                  onPaddingChange={(value) => setValue('logoImageSpecialPadding', value)}
                />

                {watch('logoImageSpecialPosition') === 'none' && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Custom Position</Label>
                      <p className="text-xs text-muted-foreground">
                        Set custom position when special position is disabled
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Top (px or %)</Label>
                          <Input
                            {...register('logoImagePosition.top')}
                            placeholder="e.g., 40px or 5%"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left (px or %)</Label>
                          <Input
                            {...register('logoImagePosition.left')}
                            placeholder="e.g., 60px or 10%"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Logo Size Controls (always visible) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Logo Size</Label>
                  <p className="text-xs text-muted-foreground">
                    Control the width and height of the logo SVG
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width (px or %)</Label>
                      <Input
                        {...register('logoImagePosition.width')}
                        placeholder="e.g., 100px or 15%"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height (px or %)</Label>
                      <Input
                        {...register('logoImagePosition.height')}
                        placeholder="e.g., 100px or auto"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Arrow Image Settings */}
      <AccordionItem value="arrow-image-settings">
        <AccordionTrigger>Arrow SVG (Optional)</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Arrow</Label>
              <Select
                value={arrowImageUrl || undefined}
                onValueChange={(value) => setValue('arrowImageUrl', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an arrow" />
                </SelectTrigger>
                <SelectContent>
                  {logos.map((logo) => (
                    <SelectItem key={logo.url} value={logo.url}>
                      {logo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {arrowImageUrl && (
                <button
                  type="button"
                  onClick={() => setValue('arrowImageUrl', '')}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            {arrowImageUrl && (
              <>
                <ColorPicker
                  label="Arrow Color"
                  color={arrowImageColor}
                  onChange={(value) => setValue('arrowColor', value)}
                />

                <Separator className="my-4" />

                <SpecialPositionSelector
                  position={watch('arrowImageSpecialPosition') || 'bottom-right'}
                  padding={watch('arrowImageSpecialPadding') || 5}
                  onPositionChange={(value) => setValue('arrowImageSpecialPosition', value as any)}
                  onPaddingChange={(value) => setValue('arrowImageSpecialPadding', value)}
                />

                {watch('arrowImageSpecialPosition') === 'none' && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Custom Position</Label>
                      <p className="text-xs text-muted-foreground">
                        Set custom position when special position is disabled
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Top (px or %)</Label>
                          <Input
                            {...register('arrowImagePosition.top')}
                            placeholder="e.g., 40px or 5%"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left (px or %)</Label>
                          <Input
                            {...register('arrowImagePosition.left')}
                            placeholder="e.g., 60px or 10%"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Arrow Size Controls (always visible) */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Arrow Size</Label>
                  <p className="text-xs text-muted-foreground">
                    Control the width and height of the arrow SVG
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width (px or %)</Label>
                      <Input
                        {...register('arrowImagePosition.width')}
                        placeholder="e.g., 100px or 15%"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height (px or %)</Label>
                      <Input
                        {...register('arrowImagePosition.height')}
                        placeholder="e.g., 100px or auto"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Bottom Text (attached to arrow) */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Bottom Text (Attached)</Label>
                    <p className="text-xs text-muted-foreground">
                      Text positioned at the bottom-right of the arrow
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <Input
                      {...register('bottomText')}
                      placeholder="e.g., SAIBA MAIS"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm text-muted-foreground">{bottomTextFontSize}</span>
                    </div>
                    <Slider
                      min={12}
                      max={48}
                      step={1}
                      value={[bottomTextFontSizeValue]}
                      onValueChange={([value]) =>
                        setValue('bottomTextStyle.fontSize', `${value}px`)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Font Weight</Label>
                      <Select
                        value={bottomTextFontWeight}
                        onValueChange={(value) =>
                          setValue('bottomTextStyle.fontWeight', value)
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

                    <ColorPicker
                      label="Text Color"
                      color={bottomTextColor}
                      onChange={(value) => setValue('bottomTextStyle.color', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={bottomTextFontFamily}
                      onValueChange={(value) =>
                        setValue('bottomTextStyle.fontFamily', value)
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

                  <div className="space-y-2">
                    <Label>Text Transform</Label>
                    <Select
                      value={bottomTextTextTransform}
                      onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') =>
                        setValue('bottomTextStyle.textTransform', value)
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

                  <Separator className="my-2" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Gap from Arrow</Label>
                        <span className="text-sm text-muted-foreground">{watch('bottomTextGapFromArrow') || 15}px</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vertical spacing between arrow and text
                      </p>
                      <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={[watch('bottomTextGapFromArrow') || 15]}
                        onValueChange={([value]) =>
                          setValue('bottomTextGapFromArrow', value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Padding Right</Label>
                        <span className="text-sm text-muted-foreground">{watch('bottomTextPaddingRight') || 0}px</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Additional padding from arrow's right edge
                      </p>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[watch('bottomTextPaddingRight') || 0]}
                        onValueChange={([value]) =>
                          setValue('bottomTextPaddingRight', value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
