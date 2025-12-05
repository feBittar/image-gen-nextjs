'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEditorStore } from '@/lib/store/editorStore';
import { templateRegistry, type AnyTemplateFormData, type TemplateId } from '@/lib/schemas/templateRegistry';
import { StackFormFields } from './StackFormFields';
import { BulletsCardsFormFields } from './BulletsCardsFormFields';
import { FitFeedCapaFormFields } from './FitFeedCapaFormFields';
import { VersusFormFields } from './VersusFormFields';
import { OpenLoopFormFields } from './OpenLoopFormFields';
import { VersusDuoFormFields } from './VersusDuoFormFields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string | null;
}

export function FormBuilder() {
  const { formData, updateFormData, setIsGenerating } = useEditorStore();
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Start with stack template as default
  const [currentTemplateId, setCurrentTemplateId] = React.useState<TemplateId>('stack');
  const currentTemplateConfig = templateRegistry[currentTemplateId];

  const form = useForm<AnyTemplateFormData>({
    defaultValues: currentTemplateConfig.defaults as any,
    resolver: zodResolver(currentTemplateConfig.schema) as any,
  });

  const { register, watch, setValue, handleSubmit, reset } = form;

  // Watch specific values first
  const selectedTemplate = watch('template') as TemplateId;
  const watchedValues = watch();
  const [debouncedValues] = useDebounce(watchedValues, 500);

  // Sync debounced values to store
  React.useEffect(() => {
    updateFormData(debouncedValues as any);
  }, [debouncedValues, updateFormData]);

  // Watch template selection and update schema
  React.useEffect(() => {
    if (selectedTemplate && templateRegistry[selectedTemplate] && selectedTemplate !== currentTemplateId) {
      setCurrentTemplateId(selectedTemplate);
      const newConfig = templateRegistry[selectedTemplate];
      reset(newConfig.defaults as any);
    }
  }, [selectedTemplate, currentTemplateId, reset]);

  // Fetch templates on mount
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);

          // Set default template to 'stack' if not already set
          if (!selectedTemplate && data.templates?.length > 0) {
            const stackTemplate = data.templates.find((t: Template) => t.id === 'stack');
            if (stackTemplate) {
              setValue('template', 'stack');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };
    fetchTemplates();
  }, [selectedTemplate, setValue]);

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  // Handle form submission
  const onSubmit = async (data: AnyTemplateFormData) => {
    try {
      setIsGenerating(true);
      toast.loading('Generating image...');

      // Use different API endpoint for versus-duo template
      const apiEndpoint = data.template === 'versus-duo'
        ? '/api/generate-versus-duo'
        : '/api/generate';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      toast.dismiss();

      // Handle versus-duo response (2 images)
      if (data.template === 'versus-duo' && result.slide1Url && result.slide2Url) {
        toast.success('2 slides generated successfully!');

        // Add both slides to history
        useEditorStore.getState().addGeneratedImage({
          url: result.slide1Url,
          formData: data as any,
          template: data.template,
        });
        useEditorStore.getState().addGeneratedImage({
          url: result.slide2Url,
          formData: data as any,
          template: data.template,
        });
      } else {
        toast.success('Image generated successfully!');

        // Add to generated images history
        useEditorStore.getState().addGeneratedImage({
          url: result.url || result.data?.url,
          formData: data as any,
          template: data.template,
        });
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export current form data as JSON
  const handleExportJSON = () => {
    const currentData = watch();
    const jsonString = JSON.stringify(currentData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('JSON exported successfully!');
  };

  // Import JSON and populate form
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Detect template from JSON or use current
        const importTemplateId = (jsonData.template || selectedTemplate) as TemplateId;
        const importSchema = templateRegistry[importTemplateId]?.schema || currentTemplateConfig.schema;

        // Validate against schema
        const validatedData = importSchema.parse(jsonData);

        // Reset form with imported data
        reset(validatedData);

        toast.success('JSON imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Invalid JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={(value) => setValue('template', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Template-specific form fields */}
          {selectedTemplate === 'stack' && (
            <StackFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {selectedTemplate === 'bullets-cards' && (
            <BulletsCardsFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {selectedTemplate === 'fitfeed-capa' && (
            <FitFeedCapaFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {selectedTemplate === 'versus' && (
            <VersusFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {selectedTemplate === 'openloop' && (
            <OpenLoopFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {selectedTemplate === 'versus-duo' && (
            <VersusDuoFormFields
              register={register as any}
              watch={watch as any}
              setValue={setValue as any}
              handleFileUpload={handleFileUpload}
            />
          )}

          {!selectedTemplate && (
            <div className="text-center text-muted-foreground py-8">
              Please select a template to continue
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Submit Button */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <Button type="submit" className="w-full" size="lg">
            Generate Image
          </Button>

          <Separator className="my-2" />

          {/* Import/Export Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleExportJSON}
            >
              Export JSON
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => reset(currentTemplateConfig.defaults as any)}
          >
            Reset Form
          </Button>
        </div>
      </div>
    </form>
  );
}
