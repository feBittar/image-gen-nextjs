'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { OpenLoopTemplateFormData } from '@/lib/schemas/openloopTemplate';
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
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { FileUploadInput } from './FileUploadInput';
import { Textarea } from '@/components/ui/textarea';
import { getFontOptions } from '@/lib/constants/fonts';
import { CornerEditor } from './CornerEditor';
import { StyledChunksEditor } from './StyledChunksEditor';
import { CardGradientEditor } from './CardGradientEditor';
import { usePersistedTab } from '@/lib/hooks';

interface OpenLoopFormFieldsProps {
  register: UseFormRegister<OpenLoopTemplateFormData>;
  watch: UseFormWatch<OpenLoopTemplateFormData>;
  setValue: UseFormSetValue<OpenLoopTemplateFormData>;
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

export function OpenLoopFormFields({
  register,
  watch,
  setValue,
  handleFileUpload,
}: OpenLoopFormFieldsProps) {
  // Persisted tab state
  const [activeTab, setActiveTab] = usePersistedTab('openloop-editor-tab', 'visual');

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
  const viewportBackgroundType = watch('viewportBackgroundType');
  const viewportBackgroundColor = watch('viewportBackgroundColor');
  const viewportBackgroundImage = watch('viewportBackgroundImage');
  const containerPaddingTop = watch('containerPaddingTop') || 60;
  const containerPaddingRight = watch('containerPaddingRight') || 80;
  const containerPaddingBottom = watch('containerPaddingBottom') || 60;
  const containerPaddingLeft = watch('containerPaddingLeft') || 80;

  // Get font options
  const fontOptions = getFontOptions();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="cantos">Cantos</TabsTrigger>
      </TabsList>

      {/* Tab Visual */}
      <TabsContent value="visual">
        <Accordion type="multiple" defaultValue={['viewport-settings']} className="w-full">
          {/* Viewport & Background */}
          <AccordionItem value="viewport-settings">
            <AccordionTrigger>Viewport & Background</AccordionTrigger>
            <AccordionContent>
          <div className="space-y-4 pt-2">
            {/* Background Type */}
            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select
                value={viewportBackgroundType || 'color'}
                onValueChange={(value: 'color' | 'image') => setValue('viewportBackgroundType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewportBackgroundType === 'color' && (
              <ColorPicker
                label="Background Color"
                color={viewportBackgroundColor || '#FFFFFF'}
                onChange={(color) => setValue('viewportBackgroundColor', color)}
              />
            )}

            {viewportBackgroundType === 'image' && (
              <FileUploadInput
                label="Background Image"
                value={viewportBackgroundImage || ''}
                onChange={(url) => setValue('viewportBackgroundImage', url)}
                onUpload={handleFileUpload}
              />
            )}

            <Separator className="my-4" />

            {/* Viewport Gradient Overlay */}
            <CardGradientEditor
              watch={watch as any}
              setValue={setValue as any}
              fieldName="viewportGradientOverlay"
              label="Viewport Gradient"
            />

            <Separator className="my-4" />

            {/* Container Padding */}
            <Label className="font-semibold">Container Padding</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Top (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={containerPaddingTop}
                  onChange={(e) => setValue('containerPaddingTop', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bottom (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={containerPaddingBottom}
                  onChange={(e) => setValue('containerPaddingBottom', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Left (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={containerPaddingLeft}
                  onChange={(e) => setValue('containerPaddingLeft', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Right (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={containerPaddingRight}
                  onChange={(e) => setValue('containerPaddingRight', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>

      {/* Tab Textos */}
      <TabsContent value="textos">
        <Accordion type="multiple" defaultValue={['text-fields']} className="w-full">
          {/* Text Fields */}
          <AccordionItem value="text-fields">
            <AccordionTrigger>Text Fields</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {/* Text 1 - Open Loop (Top) */}
                <div className="space-y-4">
                  <Label className="font-semibold">Text 1 (Open Loop - Top)</Label>
              <Textarea
                value={watch('text1') || ''}
                onChange={(e) => setValue('text1', e.target.value)}
                placeholder="Enter open loop text..."
                rows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={watch('text1Style.fontFamily') || 'Arial Black'}
                    onValueChange={(value) => setValue('text1Style.fontFamily', value)}
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
                    value={watch('text1Style.fontSize') || '80px'}
                    onChange={(e) => setValue('text1Style.fontSize', e.target.value)}
                    placeholder="80px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={watch('text1Style.fontWeight') || '900'}
                    onValueChange={(value) => setValue('text1Style.fontWeight', value)}
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
                  color={watch('text1Style.color') || '#FFFFFF'}
                  onChange={(color) => setValue('text1Style.color', color)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text Align</Label>
                  <Select
                    value={watch('text1Style.textAlign') || 'center'}
                    onValueChange={(value: 'left' | 'center' | 'right') => setValue('text1Style.textAlign', value)}
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
                <div className="space-y-2">
                  <Label>Text Transform</Label>
                  <Select
                    value={watch('text1Style.textTransform') || 'lowercase'}
                    onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => setValue('text1Style.textTransform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">Uppercase</SelectItem>
                      <SelectItem value="lowercase">Lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <StyledChunksEditor
                fieldName="text1"
                watch={watch}
                setValue={setValue}
              />
            </div>

            <Separator />

            {/* Text 2 - Resto do Titulo (Bottom) */}
            <div className="space-y-4">
              <Label className="font-semibold">Text 2 (Resto do Titulo - Bottom)</Label>
              <Textarea
                value={watch('text2') || ''}
                onChange={(e) => setValue('text2', e.target.value)}
                placeholder="Enter remaining title text..."
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={watch('text2Style.fontFamily') || 'Arial Black'}
                    onValueChange={(value) => setValue('text2Style.fontFamily', value)}
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
                    value={watch('text2Style.fontSize') || '80px'}
                    onChange={(e) => setValue('text2Style.fontSize', e.target.value)}
                    placeholder="80px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={watch('text2Style.fontWeight') || '900'}
                    onValueChange={(value) => setValue('text2Style.fontWeight', value)}
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
                  color={watch('text2Style.color') || '#FFFFFF'}
                  onChange={(color) => setValue('text2Style.color', color)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text Align</Label>
                  <Select
                    value={watch('text2Style.textAlign') || 'center'}
                    onValueChange={(value: 'left' | 'center' | 'right') => setValue('text2Style.textAlign', value)}
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
                <div className="space-y-2">
                  <Label>Text Transform</Label>
                  <Select
                    value={watch('text2Style.textTransform') || 'lowercase'}
                    onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => setValue('text2Style.textTransform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">Uppercase</SelectItem>
                      <SelectItem value="lowercase">Lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <StyledChunksEditor
                fieldName="text2"
                watch={watch}
                setValue={setValue}
              />
                </div>
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
                  Configure up to 4 corner elements. Each can be text (tag) or SVG.
                </p>

                <CornerEditor cornerNum={1} watch={watch} setValue={setValue} logos={logos} />
                <CornerEditor cornerNum={2} watch={watch} setValue={setValue} logos={logos} />
                <CornerEditor cornerNum={3} watch={watch} setValue={setValue} logos={logos} />
                <CornerEditor cornerNum={4} watch={watch} setValue={setValue} logos={logos} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
