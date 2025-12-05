'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { VersusDuoTemplateFormData } from '@/lib/schemas/versusDuoTemplate';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { FileUploadInput } from './FileUploadInput';
import { Textarea } from '@/components/ui/textarea';
import { getFontOptions } from '@/lib/constants/fonts';
import { CornerEditor } from './CornerEditor';
import { StyledChunksEditor } from './StyledChunksEditor';
import { usePersistedTab } from '@/lib/hooks';

interface VersusDuoFormFieldsProps {
  register: UseFormRegister<VersusDuoTemplateFormData>;
  watch: UseFormWatch<VersusDuoTemplateFormData>;
  setValue: UseFormSetValue<VersusDuoTemplateFormData>;
  handleFileUpload: (file: File) => Promise<string>;
}

// Font weight options
const fontWeightOptions = [
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semi-Bold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)', value: '900' },
];

export function VersusDuoFormFields({
  register,
  watch,
  setValue,
  handleFileUpload,
}: VersusDuoFormFieldsProps) {
  // Persisted tab state
  const [activeTab, setActiveTab] = usePersistedTab('versusduo-editor-tab', 'visual');

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
  const backgroundColor = watch('backgroundColor') || '#FFFFFF';
  const centerImageUrl = watch('centerImageUrl') || '';
  const centerImageOffsetX = watch('centerImageOffsetX') || 0;
  const centerImageOffsetY = watch('centerImageOffsetY') || 0;
  const centerImageScale = watch('centerImageScale') || 100;
  const containerPaddingTop = watch('containerPaddingTop') || 100;
  const containerPaddingRight = watch('containerPaddingRight') || 80;
  const containerPaddingBottom = watch('containerPaddingBottom') || 100;
  const containerPaddingLeft = watch('containerPaddingLeft') || 80;
  const contentGap = watch('contentGap') || 40;
  const imageGap = watch('imageGap') || 40;
  const imageBorderRadius = watch('imageBorderRadius') || 0;
  const centerImageOutlineEnabled = watch('centerImageOutlineEnabled') || false;
  const centerImageOutlineColor = watch('centerImageOutlineColor') || '#000000';
  const centerImageOutlineSize = watch('centerImageOutlineSize') || 10;

  // Get font options
  const fontOptions = getFontOptions();

  // Render text field editor
  const renderTextFieldEditor = (
    fieldName: 'slide1Text1' | 'slide1Text2' | 'slide2Text1' | 'slide2Text2',
    label: string,
    defaultFontSize: string
  ) => {
    const styleKey = `${fieldName}Style` as const;

    return (
      <div className="space-y-4">
        <Label className="font-semibold">{label}</Label>
        <Textarea
          value={watch(fieldName) || ''}
          onChange={(e) => setValue(fieldName, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={watch(`${styleKey}.fontFamily`) || 'Arial Black'}
              onValueChange={(value) => setValue(`${styleKey}.fontFamily`, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Input
              value={watch(`${styleKey}.fontSize`) || defaultFontSize}
              onChange={(e) => setValue(`${styleKey}.fontSize`, e.target.value)}
              placeholder={defaultFontSize}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Font Weight</Label>
            <Select
              value={watch(`${styleKey}.fontWeight`) || '900'}
              onValueChange={(value) => setValue(`${styleKey}.fontWeight`, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeightOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ColorPicker
            label="Text Color"
            color={watch(`${styleKey}.color`) || '#333333'}
            onChange={(color) => setValue(`${styleKey}.color`, color)}
          />
        </div>
        <div className="space-y-2">
          <Label>Text Align</Label>
          <Select
            value={watch(`${styleKey}.textAlign`) || 'center'}
            onValueChange={(value: 'left' | 'center' | 'right') => setValue(`${styleKey}.textAlign`, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <StyledChunksEditor
          fieldName={fieldName}
          watch={watch as any}
          setValue={setValue as any}
        />
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="imagens">Imagens</TabsTrigger>
        <TabsTrigger value="cantos">Cantos</TabsTrigger>
      </TabsList>

      {/* Tab Visual */}
      <TabsContent value="visual">
        <Accordion type="multiple" defaultValue={['background-settings']} className="w-full">
          {/* Background & Center Image */}
          <AccordionItem value="background-settings">
            <AccordionTrigger>Background & Center Image</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            <ColorPicker
              label="Background Color"
              color={backgroundColor}
              onChange={(color) => setValue('backgroundColor', color)}
            />

            <Separator className="my-4" />

            <FileUploadInput
              label="Center Image (PNG)"
              value={centerImageUrl}
              onChange={(url) => setValue('centerImageUrl', url)}
              onUpload={handleFileUpload}
            />

            <p className="text-xs text-muted-foreground">
              This image will be centered across both slides, creating the split effect.
            </p>

            <Separator className="my-4" />

            {/* Image Position Controls */}
            <Label className="font-semibold">Image Position</Label>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Horizontal Offset</Label>
                <span className="text-sm text-muted-foreground">{centerImageOffsetX}px</span>
              </div>
              <Slider
                min={-500}
                max={500}
                step={10}
                value={[centerImageOffsetX]}
                onValueChange={([value]) => setValue('centerImageOffsetX', value)}
              />
              <p className="text-xs text-muted-foreground">
                Move image left (-) or right (+)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Vertical Offset</Label>
                <span className="text-sm text-muted-foreground">{centerImageOffsetY}px</span>
              </div>
              <Slider
                min={-300}
                max={300}
                step={10}
                value={[centerImageOffsetY]}
                onValueChange={([value]) => setValue('centerImageOffsetY', value)}
              />
              <p className="text-xs text-muted-foreground">
                Move image up (-) or down (+)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Scale</Label>
                <span className="text-sm text-muted-foreground">{centerImageScale}%</span>
              </div>
              <Slider
                min={50}
                max={200}
                step={5}
                value={[centerImageScale]}
                onValueChange={([value]) => setValue('centerImageScale', value)}
              />
            </div>

            <Separator className="my-4" />

            {/* Image Outline */}
            <Label className="font-semibold">Image Outline</Label>
            <p className="text-xs text-muted-foreground">
              Add a solid color area around the PNG that follows its shape.
            </p>

            <div className="flex items-center justify-between">
              <Label htmlFor="centerImageOutlineEnabled">Enable Outline</Label>
              <Switch
                id="centerImageOutlineEnabled"
                checked={centerImageOutlineEnabled === true}
                onCheckedChange={(checked: boolean) => {
                  setValue('centerImageOutlineEnabled', checked, { shouldDirty: true, shouldTouch: true });
                }}
              />
            </div>

            {centerImageOutlineEnabled && (
              <>
                <ColorPicker
                  label="Outline Color"
                  color={centerImageOutlineColor}
                  onChange={(color) => setValue('centerImageOutlineColor', color)}
                />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Outline Size</Label>
                    <span className="text-sm text-muted-foreground">{centerImageOutlineSize}px</span>
                  </div>
                  <Slider
                    min={1}
                    max={50}
                    step={1}
                    value={[centerImageOutlineSize]}
                    onValueChange={([value]) => setValue('centerImageOutlineSize', value)}
                  />
                </div>
              </>
            )}

            <Separator className="my-4" />

            {/* Container Padding */}
            <Label className="font-semibold">Container Padding</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top</Label>
                  <span className="text-sm text-muted-foreground">{containerPaddingTop}px</span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={[containerPaddingTop]}
                  onValueChange={([value]) => setValue('containerPaddingTop', value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Bottom</Label>
                  <span className="text-sm text-muted-foreground">{containerPaddingBottom}px</span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={[containerPaddingBottom]}
                  onValueChange={([value]) => setValue('containerPaddingBottom', value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Left</Label>
                  <span className="text-sm text-muted-foreground">{containerPaddingLeft}px</span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={[containerPaddingLeft]}
                  onValueChange={([value]) => setValue('containerPaddingLeft', value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Right</Label>
                  <span className="text-sm text-muted-foreground">{containerPaddingRight}px</span>
                </div>
                <Slider
                  min={0}
                  max={200}
                  step={10}
                  value={[containerPaddingRight]}
                  onValueChange={([value]) => setValue('containerPaddingRight', value)}
                />
              </div>
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Imagens */}
      <TabsContent value="imagens">
        <Accordion type="multiple" defaultValue={['comparison-images']} className="w-full">
          {/* Comparison Images */}
          <AccordionItem value="comparison-images">
            <AccordionTrigger>Comparison Images</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Background images for each slide. The center PNG will appear above these.
                </p>

            <Label className="font-semibold">Slide 1 Images</Label>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadInput
                label="Left Image"
                value={watch('slide1ImageLeftUrl') || ''}
                onChange={(url) => setValue('slide1ImageLeftUrl', url)}
                onUpload={handleFileUpload}
              />
              <FileUploadInput
                label="Right Image"
                value={watch('slide1ImageRightUrl') || ''}
                onChange={(url) => setValue('slide1ImageRightUrl', url)}
                onUpload={handleFileUpload}
              />
            </div>

            <Separator className="my-4" />

            <Label className="font-semibold">Slide 2 Images</Label>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadInput
                label="Left Image"
                value={watch('slide2ImageLeftUrl') || ''}
                onChange={(url) => setValue('slide2ImageLeftUrl', url)}
                onUpload={handleFileUpload}
              />
              <FileUploadInput
                label="Right Image"
                value={watch('slide2ImageRightUrl') || ''}
                onChange={(url) => setValue('slide2ImageRightUrl', url)}
                onUpload={handleFileUpload}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Gap Between Images</Label>
                <span className="text-sm text-muted-foreground">{imageGap}px</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[imageGap]}
                onValueChange={([value]) => setValue('imageGap', value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{imageBorderRadius}px</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={2}
                value={[imageBorderRadius]}
                onValueChange={([value]) => setValue('imageBorderRadius', value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Content Gap</Label>
                <span className="text-sm text-muted-foreground">{contentGap}px</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[contentGap]}
                onValueChange={([value]) => setValue('contentGap', value)}
              />
            </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Textos */}
      <TabsContent value="textos">
        <Accordion type="multiple" defaultValue={['slide1-texts']} className="w-full">
          {/* Slide 1 Texts */}
          <AccordionItem value="slide1-texts">
            <AccordionTrigger>Slide 1 - Texts</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {renderTextFieldEditor('slide1Text1', 'Title (Top)', '80px')}
                <Separator />
                {renderTextFieldEditor('slide1Text2', 'Footer (Bottom)', '60px')}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Slide 2 Texts */}
          <AccordionItem value="slide2-texts">
            <AccordionTrigger>Slide 2 - Texts</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {renderTextFieldEditor('slide2Text1', 'Title (Top)', '80px')}
                <Separator />
                {renderTextFieldEditor('slide2Text2', 'Footer (Bottom)', '60px')}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Cantos */}
      <TabsContent value="cantos">
        <Accordion type="multiple" defaultValue={['corner-elements']} className="w-full">
          {/* Corner Elements */}
          <AccordionItem value="corner-elements">
            <AccordionTrigger>Corner Elements (Tags/SVGs)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Configure up to 4 corner elements. These will appear on BOTH slides.
                </p>

                <CornerEditor cornerNum={1} watch={watch as any} setValue={setValue as any} logos={logos} />
                <CornerEditor cornerNum={2} watch={watch as any} setValue={setValue as any} logos={logos} />
                <CornerEditor cornerNum={3} watch={watch as any} setValue={setValue as any} logos={logos} />
                <CornerEditor cornerNum={4} watch={watch as any} setValue={setValue as any} logos={logos} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
